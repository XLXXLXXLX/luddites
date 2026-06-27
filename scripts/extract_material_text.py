from __future__ import annotations

import argparse
import os
import json
import re
import shutil
import subprocess
import tempfile
import threading
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path

import fitz
from bs4 import BeautifulSoup


TESSDATA_BASE_URL = "https://github.com/tesseract-ocr/tessdata_fast/raw/main"
TESS_LANGS = ("eng", "chi_sim", "osd")
WORD_RE = re.compile(r"[0-9A-Za-z\u4e00-\u9fff]+")
INVALID_FILENAME_RE = re.compile(r'[<>:"/\\|?*]+')


@dataclass
class ExtractionResult:
    source: Path
    output: Path
    kind: str
    method: str
    pages_or_sections: int
    direct_pages: int = 0
    ocr_pages: int = 0
    empty_pages: int = 0
    characters: int = 0
    note: str = ""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract readable text from material files.")
    parser.add_argument("--source", default="content/素材", type=Path)
    parser.add_argument("--output", default="content/素材提取文本", type=Path)
    parser.add_argument("--tmp", default="tmp/material_extract", type=Path)
    parser.add_argument("--force", action="store_true", help="Re-extract even if output exists.")
    parser.add_argument(
        "--ocr-threshold",
        default=80,
        type=int,
        help="Minimum number of detected word-like tokens before a PDF page is treated as text-native.",
    )
    parser.add_argument(
        "--ocr-workers",
        default=max(1, min(8, (os.cpu_count() or 2) - 1)),
        type=int,
        help="Number of concurrent OCR workers for PDF pages that lack usable text.",
    )
    return parser.parse_args()


def sanitize_filename(name: str) -> str:
    return INVALID_FILENAME_RE.sub("_", name)


def count_wordish_units(text: str) -> int:
    return len(WORD_RE.findall(text))


def normalize_text(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = [line.rstrip() for line in text.split("\n")]
    collapsed: list[str] = []
    blank = False
    for line in lines:
        if line.strip():
            collapsed.append(line)
            blank = False
        elif not blank:
            collapsed.append("")
            blank = True
    return "\n".join(collapsed).strip() + "\n"


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def ensure_tessdata(tmp_dir: Path) -> Path:
    tessdata_dir = tmp_dir / "tessdata"
    ensure_dir(tessdata_dir)
    for lang in TESS_LANGS:
        target = tessdata_dir / f"{lang}.traineddata"
        if target.exists() and target.stat().st_size > 1_000_000:
            continue
        url = f"{TESSDATA_BASE_URL}/{lang}.traineddata"
        print(f"Downloading OCR language data: {lang}")
        with urllib.request.urlopen(url) as response, target.open("wb") as fh:
            shutil.copyfileobj(response, fh)
    return tessdata_dir


def run_tesseract(image_path: Path, tessdata_dir: Path) -> str:
    cmd = [
        "tesseract",
        str(image_path),
        "stdout",
        "--tessdata-dir",
        str(tessdata_dir),
        "-l",
        "chi_sim+eng",
        "--psm",
        "3",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="ignore")
    if result.returncode not in (0, 1):
        raise RuntimeError(result.stderr.strip() or f"tesseract failed with code {result.returncode}")
    return result.stdout


def ocr_pdf_page(source: Path, page_index: int, tmp_dir: Path, tessdata_dir: Path) -> tuple[int, str]:
    doc = fitz.open(source)
    page = doc.load_page(page_index)
    image_name = f"{source.stem}-{page_index + 1:04d}-{os.getpid()}-{threading.get_ident()}.png"
    image_path = tmp_dir / sanitize_filename(image_name)
    try:
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        pix.save(image_path)
        return page_index, normalize_text(run_tesseract(image_path, tessdata_dir))
    finally:
        doc.close()
        image_path.unlink(missing_ok=True)


def extract_pdf(source: Path, output: Path, tmp_dir: Path, threshold: int, ocr_workers: int) -> ExtractionResult:
    doc = fitz.open(source)
    page_count = doc.page_count
    page_entries: list[dict[str, str | int]] = []
    weak_pages: list[int] = []
    for page_index in range(page_count):
        page = doc.load_page(page_index)
        direct_text = normalize_text(page.get_text("text", sort=True))
        direct_units = count_wordish_units(direct_text)
        page_entries.append({"text": direct_text, "units": direct_units, "method": "direct"})
        if direct_units < threshold:
            weak_pages.append(page_index)
    doc.close()

    if weak_pages:
        tessdata_dir = ensure_tessdata(tmp_dir)
        print(
            f"  OCR fallback for {source.name}: {len(weak_pages)}/{page_count} pages with {ocr_workers} workers",
            flush=True,
        )
        with tempfile.TemporaryDirectory(dir=tmp_dir) as work_dir_str:
            work_dir = Path(work_dir_str)
            if ocr_workers <= 1 or len(weak_pages) == 1:
                for done, page_index in enumerate(weak_pages, start=1):
                    _, ocr_text = ocr_pdf_page(source, page_index, work_dir, tessdata_dir)
                    if count_wordish_units(ocr_text) > int(page_entries[page_index]["units"]):
                        page_entries[page_index]["text"] = ocr_text
                        page_entries[page_index]["method"] = "ocr"
                    if done == 1 or done % 25 == 0 or done == len(weak_pages):
                        print(f"    OCR progress: {done}/{len(weak_pages)} pages", flush=True)
            else:
                max_workers = min(ocr_workers, len(weak_pages))
                with ThreadPoolExecutor(max_workers=max_workers) as executor:
                    futures = [
                        executor.submit(ocr_pdf_page, source, page_index, work_dir, tessdata_dir) for page_index in weak_pages
                    ]
                    for done, future in enumerate(as_completed(futures), start=1):
                        page_index, ocr_text = future.result()
                        if count_wordish_units(ocr_text) > int(page_entries[page_index]["units"]):
                            page_entries[page_index]["text"] = ocr_text
                            page_entries[page_index]["method"] = "ocr"
                        if done == 1 or done % 25 == 0 or done == len(weak_pages):
                            print(f"    OCR progress: {done}/{len(weak_pages)} pages", flush=True)

    parts: list[str] = []
    direct_pages = 0
    ocr_pages = 0
    empty_pages = 0
    for page_index, entry in enumerate(page_entries):
        page_text = str(entry["text"])
        method = str(entry["method"])
        if count_wordish_units(page_text) == 0:
            empty_pages += 1
        elif method == "ocr":
            ocr_pages += 1
        else:
            direct_pages += 1
        parts.append(f"## Page {page_index + 1}\n\n{page_text}".rstrip() + "\n")
    body = "\n".join(parts).strip() + "\n"
    content = (
        f"# {source.name}\n\n"
        f"- Source: `{source.as_posix()}`\n"
        f"- Type: PDF\n"
        f"- Method: direct text with OCR fallback\n"
        f"- Pages: {page_count}\n"
        f"- Direct pages: {direct_pages}\n"
        f"- OCR pages: {ocr_pages}\n"
        f"- Empty pages: {empty_pages}\n\n"
        f"{body}"
    )
    output.write_text(content, encoding="utf-8")
    return ExtractionResult(
        source=source,
        output=output,
        kind="pdf",
        method="direct+ocr" if ocr_pages else "direct",
        pages_or_sections=page_count,
        direct_pages=direct_pages,
        ocr_pages=ocr_pages,
        empty_pages=empty_pages,
        characters=len(body),
    )


def find_opf_path(epub_zip: zipfile.ZipFile) -> str:
    container = ET.fromstring(epub_zip.read("META-INF/container.xml"))
    rootfile = container.find(".//{*}rootfile")
    if rootfile is None:
        raise ValueError("EPUB container.xml does not contain a rootfile entry")
    full_path = rootfile.attrib.get("full-path")
    if not full_path:
        raise ValueError("EPUB rootfile path is missing")
    return full_path


def extract_epub(source: Path, output: Path) -> ExtractionResult:
    parts: list[str] = []
    with zipfile.ZipFile(source) as epub_zip:
        opf_path = find_opf_path(epub_zip)
        opf_dir = Path(opf_path).parent
        package = ET.fromstring(epub_zip.read(opf_path))
        manifest = {}
        for item in package.findall(".//{*}manifest/{*}item"):
            item_id = item.attrib.get("id")
            href = item.attrib.get("href")
            if item_id and href:
                manifest[item_id] = (opf_dir / href).as_posix()
        spine_ids = [item.attrib["idref"] for item in package.findall(".//{*}spine/{*}itemref") if item.attrib.get("idref")]
        for index, item_id in enumerate(spine_ids, start=1):
            href = manifest.get(item_id)
            if not href:
                continue
            soup = BeautifulSoup(epub_zip.read(href), "html.parser")
            text = normalize_text(soup.get_text("\n"))
            if count_wordish_units(text) == 0:
                continue
            title = soup.title.get_text(strip=True) if soup.title else f"Section {index}"
            parts.append(f"## {title}\n\n{text}".rstrip() + "\n")
    body = "\n".join(parts).strip() + "\n"
    content = (
        f"# {source.name}\n\n"
        f"- Source: `{source.as_posix()}`\n"
        f"- Type: EPUB\n"
        f"- Method: spine-ordered HTML text extraction\n"
        f"- Sections: {len(parts)}\n\n"
        f"{body}"
    )
    output.write_text(content, encoding="utf-8")
    return ExtractionResult(
        source=source,
        output=output,
        kind="epub",
        method="spine-html",
        pages_or_sections=len(parts),
        characters=len(body),
    )


def extract_markdown(source: Path, output: Path) -> ExtractionResult:
    text = normalize_text(source.read_text(encoding="utf-8"))
    content = (
        f"# {source.name}\n\n"
        f"- Source: `{source.as_posix()}`\n"
        f"- Type: Markdown\n"
        f"- Method: direct copy\n\n"
        f"{text}"
    )
    output.write_text(content, encoding="utf-8")
    return ExtractionResult(
        source=source,
        output=output,
        kind="md",
        method="copy",
        pages_or_sections=1,
        characters=len(text),
    )


def load_existing_results(output_dir: Path) -> dict[str, ExtractionResult]:
    manifest_path = output_dir / "manifest.json"
    if not manifest_path.exists():
        return {}
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    results: dict[str, ExtractionResult] = {}
    for item in data:
        result = ExtractionResult(
            source=Path(item["source"]),
            output=Path(item["output"]),
            kind=item["kind"],
            method=item["method"],
            pages_or_sections=item["units"],
            direct_pages=item.get("direct_pages", 0),
            ocr_pages=item.get("ocr_pages", 0),
            empty_pages=item.get("empty_pages", 0),
            characters=item.get("characters", 0),
        )
        results[result.source.name] = result
    return results


def write_index(output_dir: Path, results: list[ExtractionResult]) -> None:
    lines = [
        "# 素材提取文本",
        "",
        f"- 文件总数: {len(results)}",
        f"- PDF: {sum(1 for item in results if item.kind == 'pdf')}",
        f"- EPUB: {sum(1 for item in results if item.kind == 'epub')}",
        f"- Markdown: {sum(1 for item in results if item.kind == 'md')}",
        "",
        "| Source | Type | Method | Units | OCR Pages | Empty Pages | Output |",
        "| --- | --- | --- | ---: | ---: | ---: | --- |",
    ]
    for item in results:
        rel_output = item.output.relative_to(output_dir).as_posix()
        lines.append(
            f"| `{item.source.name}` | {item.kind} | {item.method} | {item.pages_or_sections} | "
            f"{item.ocr_pages} | {item.empty_pages} | [{rel_output}]({rel_output}) |"
        )
    lines.append("")
    (output_dir / "index.md").write_text("\n".join(lines), encoding="utf-8")
    manifest = []
    for item in results:
        manifest.append(
            {
                "source": item.source.as_posix(),
                "output": item.output.as_posix(),
                "kind": item.kind,
                "method": item.method,
                "units": item.pages_or_sections,
                "direct_pages": item.direct_pages,
                "ocr_pages": item.ocr_pages,
                "empty_pages": item.empty_pages,
                "characters": item.characters,
            }
        )
    (output_dir / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    args = parse_args()
    source_dir = args.source.resolve()
    output_dir = args.output.resolve()
    tmp_dir = args.tmp.resolve()
    ensure_dir(output_dir)
    ensure_dir(tmp_dir)

    existing_results = load_existing_results(output_dir)
    results: list[ExtractionResult] = []
    for source in sorted(source_dir.iterdir()):
        if not source.is_file():
            continue
        out_name = sanitize_filename(source.name) + ".md"
        output = output_dir / out_name
        if output.exists() and not args.force:
            print(f"Skipping existing output: {source.name}")
            if source.name in existing_results:
                results.append(existing_results[source.name])
            continue
        print(f"Extracting: {source.name}", flush=True)
        suffix = source.suffix.lower()
        if suffix == ".pdf":
            result = extract_pdf(source, output, tmp_dir, args.ocr_threshold, args.ocr_workers)
        elif suffix == ".epub":
            result = extract_epub(source, output)
        elif suffix == ".md":
            result = extract_markdown(source, output)
        else:
            print(f"Unsupported file type, skipped: {source.name}", flush=True)
            continue
        results.append(result)

    write_index(output_dir, sorted(results, key=lambda item: item.source.name.lower()))
    print(f"Done. Extracted {len(results)} files into {output_dir}", flush=True)


if __name__ == "__main__":
    main()
