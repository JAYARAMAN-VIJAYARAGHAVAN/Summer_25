from sentence_transformers import SentenceTransformer
import faiss
import os
import json

model = SentenceTransformer('all-MiniLM-L6-v2')

def split_into_chunks(text, max_words=50):
    words = text.split()
    return [' '.join(words[i:i+max_words]) for i in range(0, len(words), max_words)]

def build_index(transcript_path, index_path, meta_path):
    with open(transcript_path, "r") as f:
        text = f.read()

    chunks = split_into_chunks(text)
    embeddings = model.encode(chunks)

    index = faiss.IndexFlatL2(384)
    index.add(embeddings)

    faiss.write_index(index, index_path)
    with open(meta_path, "w") as f:
        json.dump(chunks, f)
    print("Index built and saved.")

if __name__ == "__main__":
    build_index("transcripts/1hr_medium.txt", "index/1hr_medium.index", "index/1hr_medium.json")