import requests
import json
import faiss
import os
from datetime import datetime
from sentence_transformers import SentenceTransformer, util

# === CONFIG ===
api_key = "c6bdb68a1aee910f763eb5e550e244d00a415e10990390e9c9c68a98f4c106af"
api_url = "https://api.together.xyz/v1/chat/completions"
model_name = "mistralai/Mistral-7B-Instruct-v0.3"
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

# === LOAD INDEX + CHUNKS ===
index = faiss.read_index("index/1hr_medium.index")
with open("index/1hr_medium.json", "r") as f:
    chunks = json.load(f)

# === SELECT TOP-K CHUNKS FOR SUMMARY BASED ON SEMANTIC RELEVANCE ===
summary_query = "What are the key points, decisions, and outcomes of this meeting?"
query_emb = embedding_model.encode(summary_query, convert_to_tensor=True)
chunk_embeddings = embedding_model.encode(chunks, convert_to_tensor=True)
scores = util.cos_sim(query_emb, chunk_embeddings)[0]

top_k = 25
top_idxs = scores.topk(k=top_k).indices
selected_chunks = [chunks[i] for i in top_idxs]
summary_input = "\n".join(selected_chunks)

# === GENERATE SUMMARY ===
print("🔄 Generating meeting summary…")
summary_payload = {
    "model": model_name,
    "messages": [
        {"role": "system", "content": "You are a helpful assistant that writes detailed, structured meeting summaries. Include key discussion points, decisions made, and action items."},
        {"role": "user", "content": f"Please provide a detailed summary of the following meeting notes:\n\n{summary_input}"}
    ],
    "temperature": 0.1,
    "max_tokens": 1024
}

try:
    response = requests.post(api_url, headers=headers, data=json.dumps(summary_payload))
    if response.status_code == 200:
        result = response.json()
        meeting_summary = result["choices"][0]["message"]["content"].strip()
    else:
        print("❌ Summary generation failed:", response.text)
        exit()
except Exception as e:
    print("❌ Summary generation failed:", e)
    exit()

# === CREATE FOLDER & LOG FILE ===
os.makedirs("testcases", exist_ok=True)
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
log_file_path = os.path.join("testcases", f"session_{timestamp}.txt")

with open(log_file_path, "w") as f:
    f.write("📝 Meeting Summary:\n")
    f.write(meeting_summary + "\n\n")

print("\n📝 Meeting Summary:\n")
print(meeting_summary)
print("\n❓ Now you can ask questions about the meeting (type 'thank you' to exit).\n")

# === QA LOOP ===
while True:
    q = input("You: ").strip()
    if q.lower() == "thank you":
        print("Bot: Happy to help! 👋")
        break

    emb = embedding_model.encode([q])
    _, idxs = index.search(emb, k=5)
    ctx = "\n".join(chunks[i] for i in idxs[0])

    messages = [
        {"role": "system", "content": "You are a helpful AI meeting assistant."},
        {"role": "user", "content": f"Meeting Summary:\n{meeting_summary}\n\nRelevant Notes:\n{ctx}\n\nQ: {q}\nA:"}
    ]

    qa_payload = {
        "model": model_name,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 512
    }

    try:
        response = requests.post(api_url, headers=headers, data=json.dumps(qa_payload))
        if response.status_code == 200:
            result = response.json()
            answer = result["choices"][0]["message"]["content"].strip()
            print("\nBot:", answer, "\n")

            with open(log_file_path, "a") as f:
                f.write(f"Q: {q}\nA: {answer}\n\n")
        else:
            print("❌ API call failed:", response.text)
    except Exception as e:
        print("❌ API call failed:", e)
