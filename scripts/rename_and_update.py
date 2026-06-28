import os
import re
import subprocess
from pathlib import Path
from urllib.parse import quote

ROOT_DIR = Path(r"c:\Users\xlx\Documents\antigravity\luddites-quartz")
CONTENT_DIR = ROOT_DIR / "content"

RENAME_MAP = {
    # 1. 素材提取文本 (Extracted Texts)
    "Alienating labour workers on the road from socialism to capitalism in East Germany and Hungary (Barthazy Meier, Eszter Judit) (z-library.sk, 1lib.sk, z-lib.sk).pdf.md": "Alienating labour workers.pdf.md",
    "Resistance to new technology (Nuclear power information technology and biotechnology)  Reinterpreting ‘Luddism’ resistance… (Bauer, Martin) (z-library.sk, 1lib.sk, z-lib.sk).pdf.md": "Resistance to new technology.pdf.md",
    "Riotous assemblies  popular protest in Hanoverian England (Randall, Adrian) (z-library.sk, 1lib.sk, z-lib.sk).pdf.md": "Riotous assemblies.pdf.md",
    "The Luddites  machine-breaking in Regency England (Malcolm I. Thomis) (z-library.sk, 1lib.sk, z-lib.sk).pdf.md": "The Luddites - Malcolm Thomis.pdf.md",
    "The Luddites - Machine-Breaking in Regency England (Malcolm I. Thomis) - Translated.md.md": "The Luddites - Malcolm Thomis - Translated.md.md",
    "The Risings of the Luddites Chartists and Plug-Drawers (Frank Peel) (z-library.sk, 1lib.sk, z-lib.sk).epub.md": "The Risings of the Luddites.epub.md",
    "Where Was the Working Class Revolution in Eastern Germany (Linda Fuller) (z-library.sk, 1lib.sk, z-lib.sk).pdf.md": "Where Was the Working Class Revolution.pdf.md",
    "[世纪人文系列·世纪前沿]欧洲的抗争与民主(1650-2000) ([美]查尔斯·蒂利；陈周旺等译) (z-library.sk, 1lib.sk, z-lib.sk).pdf.md": "欧洲的抗争与民主.pdf.md",
    "伊诺克和詹姆斯·泰勒档案馆——历史罐 --- Enoch and James Taylor Archives - The History JarThe History Jar.md": "伊诺克和詹姆斯·泰勒档案馆.md",
    "原始的叛乱  十九至二十世纪社会运动的古朴形式 = Primitive Rebels Studies in Archaic Forms of Social Movement in the 19th and 20th Centuries ( etc.) (z-library.sk, 1lib.sk, z-lib.sk).epub.md": "原始的叛乱.epub.md",
    "反抗机器  剑桥大学 --- Rage against the machine  University of Cambridge.md": "反抗机器_剑桥大学.md",
    "弱者的武器：农民反抗的日常形式 (人文与社会译丛) ([美国]詹姆斯•C•斯科特 [[美国]詹姆斯•C•斯科特]) (z-library.sk, 1lib.sk, z-lib.sk).epub.md": "弱者的武器.epub.md",
    "社会运动，1768—2004 (（美）查尔斯·蒂利) (z-library.sk, 1lib.sk, z-lib.sk).pdf.md": "社会运动.pdf.md",
    "谋杀、混乱与机器——文森特·多林顿讲述了卢德分子和骄傲的佃农乔治·梅勒的残酷故事——哈德斯菲尔德中心-Murder, mayhem and machines-Vincent Dorrington tells the brutal story of the Luddites and proud cropper George Mellor.md": "谋杀混乱与机器.md",
    "革命的年代：1789—1848 ([英]艾瑞克·霍布斯鲍姆) (z-library.sk, 1lib.sk, z-lib.sk).epub.md": "革命的年代.epub.md",
    
    # 2. 翻译文本 (Translated Texts)
    "The Luddites - Machine-Breaking in Regency England (Malcolm I. Thomis) - Translated.md": "The Luddites - Translated.md",
    
    # 3. Enoch's Hammer mattress factory
    "伊诺克的锤子  床垫工厂 --- Enoch's Hammer  Mattress Factory.md": "伊诺克的锤子_床垫工厂.md",
    
    # 4. Arguments within English Marxism
    "Arguments Within English Marxism - Perry Anderson - Translated.md": "Arguments Within English Marxism - Translated.md"
}

def rename_files(root_dir, rename_map):
    print("--- Phase 1: Renaming files on disk ---")
    # Walk the directory to find and rename matching files
    for root, dirs, files in os.walk(root_dir):
        # Skip node_modules, .git, public, etc.
        if any(ex in root for ex in ['.git', 'node_modules', 'public', '.quartz-cache', 'tmp']):
            continue
            
        for file in files:
            if file in rename_map:
                old_path = Path(root) / file
                new_name = rename_map[file]
                new_path = Path(root) / new_name
                
                print(f"Found file: {old_path.relative_to(root_dir)}")
                try:
                    # Try git mv first so git tracks the renaming
                    res = subprocess.run(["git", "mv", str(old_path), str(new_path)], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                    print(f"  [Git] Renamed to: {new_name}")
                except (subprocess.CalledProcessError, FileNotFoundError) as e:
                    # Fallback to standard os.rename
                    try:
                        old_path.rename(new_path)
                        print(f"  [OS] Renamed to: {new_name}")
                    except Exception as ex:
                        print(f"  [Error] Failed to rename: {ex}")

def update_references(root_dir, rename_map):
    print("\n--- Phase 2: Updating links and references in files ---")
    exclude_dirs = {'.git', 'node_modules', 'public', '.quartz-cache', 'tmp'}
    
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            file_path = Path(root) / file
            # Only update text-based files
            if file_path.suffix.lower() not in ['.md', '.json', '.yaml', '.yml', '.txt', '.py', '.ts', '.tsx', '.js', '.jsx']:
                continue
                
            # Skip the script itself
            if file_path.name == "rename_and_update.py":
                continue
                
            try:
                content = file_path.read_text(encoding='utf-8')
            except Exception:
                continue
                
            original_content = content
            for old_name, new_name in rename_map.items():
                old_stem = Path(old_name).stem
                new_stem = Path(new_name).stem
                
                # Replace exact filename
                content = content.replace(old_name, new_name)
                # Replace stem (no extension) for links that omit extension
                content = content.replace(old_stem, new_stem)
                
                # Replace URL-encoded versions
                old_encoded = quote(old_name)
                new_encoded = quote(new_name)
                content = content.replace(old_encoded, new_encoded)
                
                old_stem_encoded = quote(old_stem)
                new_stem_encoded = quote(new_stem)
                content = content.replace(old_stem_encoded, new_stem_encoded)
                
            if content != original_content:
                print(f"Updated references in: {file_path.relative_to(root_dir)}")
                file_path.write_text(content, encoding='utf-8')

if __name__ == "__main__":
    rename_files(ROOT_DIR, RENAME_MAP)
    update_references(ROOT_DIR, RENAME_MAP)
    print("\nDone! Please run git status and check the changes.")
