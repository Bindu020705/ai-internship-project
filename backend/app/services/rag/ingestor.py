import os
import glob
import uuid
import re
from typing import List, Dict, Any

def clean_text(text: str) -> str:
    # Normalize whitespace and strip trailing blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def chunk_markdown_file(file_path: str, chunk_size: int = 400, overlap: int = 50) -> List[Dict[str, Any]]:
    if not os.path.exists(file_path):
        return []

    file_name = os.path.basename(file_path)
    topic_name = file_name.replace(".md", "").replace("_", " ").title()

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    cleaned = clean_text(content)
    lines = cleaned.split("\n")

    chunks = []
    current_section = "General Overview"
    doc_title = topic_name

    current_chunk_lines = []
    current_length = 0

    for line in lines:
        if line.startswith("# "):
            doc_title = line.replace("# ", "").strip()
        elif line.startswith("## "):
            current_section = line.replace("## ", "").strip()

        words = line.split()
        current_chunk_lines.append(line)
        current_length += len(words)

        if current_length >= chunk_size:
            chunk_text = "\n".join(current_chunk_lines).strip()
            if chunk_text:
                chunks.append({
                    "id": str(uuid.uuid4()),
                    "title": doc_title,
                    "source": file_name,
                    "topic": topic_name,
                    "section": current_section,
                    "url": f"knowledge/{file_name}",
                    "content": chunk_text
                })
            # Maintain overlap
            overlap_words = 0
            new_chunk_lines = []
            for prev_line in reversed(current_chunk_lines):
                p_words = len(prev_line.split())
                if overlap_words + p_words <= overlap:
                    new_chunk_lines.insert(0, prev_line)
                    overlap_words += p_words
                else:
                    break
            current_chunk_lines = new_chunk_lines
            current_length = overlap_words

    # Final remaining chunk
    if current_chunk_lines:
        chunk_text = "\n".join(current_chunk_lines).strip()
        if len(chunk_text.split()) >= 20: # ignore tiny trailing scraps
            chunks.append({
                "id": str(uuid.uuid4()),
                "title": doc_title,
                "source": file_name,
                "topic": topic_name,
                "section": current_section,
                "url": f"knowledge/{file_name}",
                "content": chunk_text
            })

    return chunks

def ingest_all_knowledge_docs(knowledge_dir: str = "./data/knowledge") -> List[Dict[str, Any]]:
    all_chunks = []
    pattern = os.path.join(knowledge_dir, "*.md")
    for file_path in glob.glob(pattern):
        chunks = chunk_markdown_file(file_path)
        all_chunks.extend(chunks)
    return all_chunks
