#!/usr/bin/env python3
"""Translate a markdown file from English to Chinese using Google Translate."""

import os
import sys
import re
import json
import time
import requests
import html
from pathlib import Path


def translate_free(text, sl='en', tl='zh-CN', retries=5, delay=2):
    """Translate text using the free Google Translate single API."""
    url = 'https://translate.googleapis.com/translate_a/single'
    params = {
        'client': 'gtx',
        'sl': sl,
        'tl': tl,
        'dt': 't',
        'q': text
    }
    for attempt in range(retries):
        try:
            r = requests.get(url, params=params, timeout=15)
            if r.status_code == 200:
                data = r.json()
                translated = ''.join([item[0] for item in data[0] if item and item[0]])
                return translated
            elif r.status_code == 429:
                wait_time = delay * (2 ** attempt)
                print(f"    [Free API] Rate limited (429). Waiting {wait_time}s and retrying...")
                time.sleep(wait_time)
            else:
                print(f"    [Free API] HTTP error {r.status_code}. Retrying in {delay}s...")
                time.sleep(delay)
        except Exception as e:
            print(f"    [Free API] Error on attempt {attempt+1}: {e}. Retrying in {delay}s...")
            time.sleep(delay)
    return None


def chunk_markdown(file_content, max_len=3000):
    """Split markdown content into chunks by paragraphs, each under max_len characters."""
    paragraphs = re.split(r'\n\n+', file_content)
    chunks = []
    current_chunk = []
    current_len = 0
    
    for p in paragraphs:
        p_len = len(p)
        if current_len + p_len + 2 > max_len and current_chunk:
            chunks.append('\n\n'.join(current_chunk))
            current_chunk = [p]
            current_len = p_len
        else:
            current_chunk.append(p)
            current_len += p_len + 2
            
    if current_chunk:
        chunks.append('\n\n'.join(current_chunk))
        
    return chunks


def main():
    source_file = Path(r"c:\Users\xlx\Documents\antigravity\luddites-quartz\content\ignored_source\素材提取文本\Arguments Within English Marxism - Perry Anderson.md")
    output_file = Path(r"c:\Users\xlx\Documents\antigravity\luddites-quartz\content\翻译文本\Arguments Within English Marxism - Translated.md")
    checkpoint_file = Path(r"c:\Users\xlx\Documents\antigravity\luddites-quartz\scripts\translate_checkpoint.json")
    
    if not source_file.exists():
        print(f"Source file not found: {source_file}")
        sys.exit(1)
        
    print(f"Reading source file: {source_file}")
    content = source_file.read_text(encoding='utf-8')
    
    # Load or create checkpoint
    if checkpoint_file.exists():
        print(f"Loading checkpoint from: {checkpoint_file}")
        try:
            with open(checkpoint_file, 'r', encoding='utf-8') as f:
                checkpoint = json.load(f)
            chunks = checkpoint['chunks']
            translated_chunks = checkpoint['translated_chunks']
            start_index = len(translated_chunks)
            print(f"Resuming from chunk {start_index + 1}/{len(chunks)}")
        except Exception as e:
            print(f"Error reading checkpoint: {e}. Starting fresh.")
            chunks = chunk_markdown(content)
            translated_chunks = []
            start_index = 0
    else:
        print("Starting fresh translation...")
        chunks = chunk_markdown(content)
        translated_chunks = []
        start_index = 0
        
    total_chunks = len(chunks)
    print(f"Total chunks to translate: {total_chunks}")
    
    # Perform translation chunk by chunk
    try:
        for idx in range(start_index, total_chunks):
            chunk = chunks[idx]
            print(f"Translating chunk {idx + 1}/{total_chunks} ({len(chunk)} chars)...")
            
            # Skip translating if chunk is empty or whitespace
            if not chunk.strip():
                translated_chunks.append(chunk)
                continue
                
            translated = translate_free(chunk)
            if translated is None:
                print(f"Translation failed at chunk {idx + 1}. Saving checkpoint and exiting.")
                break
                
            translated_clean = html.unescape(translated)
            translated_chunks.append(translated_clean)
            
            # Save checkpoint
            checkpoint = {
                'chunks': chunks,
                'translated_chunks': translated_chunks
            }
            with open(checkpoint_file, 'w', encoding='utf-8') as f:
                json.dump(checkpoint, f, ensure_ascii=False, indent=2)
                
            # Rate limiting delay
            time.sleep(1.2)
            
        else:
            # Translation complete! Compile final file
            print("Translation complete! Compiling final markdown file...")
            final_content = '\n\n'.join(translated_chunks)
            
            # Ensure output directory exists
            output_file.parent.mkdir(parents=True, exist_ok=True)
            output_file.write_text(final_content, encoding='utf-8')
            print(f"Output saved to: {output_file}")
            
            # Clean up checkpoint
            if checkpoint_file.exists():
                checkpoint_file.unlink()
                print("Removed checkpoint file.")
                
    except KeyboardInterrupt:
        print("\nTranslation interrupted by user. Checkpoint saved.")
        sys.exit(0)


if __name__ == '__main__':
    main()
