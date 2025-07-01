#!/usr/bin/env python3
"""
Predict next‑day crypto direction **and** percentage change (up / down / neutral + % value)
using technical indicators **plus** daily FinBERT sentiment on crypto headlines.

Pipeline
────────
1.  Load 12‑month OHLCV + engineered features (one row per ⟨date,ticker⟩).
2.  Attach next‑day % change → label becomes [up|down|neutral + signed %].
3.  Load raw news CSV (one headline per row) and filter 13 Jun 2024 → 31 May 2025.
4.  Aggregate → one concatenated headline string per ⟨date,ticker⟩.
5.  Score sentiment with **ProsusAI/finBERT** (pos‑neg scale −1…+1).
6.  Merge sentiment + headlines into technical DataFrame.
7.  Build natural‑language prompt per row; fine‑tune FLAN‑T5‑Base with Seq2SeqTrainer.

Edit the path constants below if your folders differ.
"""

# ───────────────────── imports ──────────────────────────────
import datetime as dt
import pandas as pd
import torch
import torch.nn.functional as F
from datasets import Dataset
from transformers import (
    AutoModelForSeq2SeqLM,
    AutoTokenizer,
    Seq2SeqTrainingArguments,
    Seq2SeqTrainer,
    DataCollatorForSeq2Seq,
    AutoModelForSequenceClassification,
)

# ─────────────────── settings / paths ───────────────────────
HISTORICAL_CSV_PATH = "/Users/vijay/Documents/Summer_25/Crypto/data/crypto_12months_hist_data_4Coins.csv"  # OHLCV + indicators
NEWS_CSV_PATH       = "data/top_5_crypto_headlines.csv"     # raw scraped headlines
MODEL_NAME          = "google/flan-t5-base"
SENT_MODEL_NAME     = "ProsusAI/finBERT"
DATE_LO, DATE_HI    = dt.date(2024, 6, 13), dt.date(2025, 5, 31)
OUTPUT_DIR          = "data/flan_t5_finetuned_crypto_model_predictive_v7"

# ───────────────── device ───────────────────────────────────
device = (
    torch.device("mps"  if torch.backends.mps.is_available() else
                 "cuda" if torch.cuda.is_available()        else
                 "cpu")
)
print(f"Using {device} device\n")

# ══════════════════ 1. LOAD HISTORICAL PRICES ════════════════
hist_df = pd.read_csv(HISTORICAL_CSV_PATH)
hist_df.columns = hist_df.columns.str.strip().str.lower()

# normalise column names
hist_df.rename(columns={
    "daily_%_change": "daily_percentage_change",
    "7d_sma": "sma_7_day",
}, inplace=True)

hist_df["date"] = pd.to_datetime(hist_df["date"]).dt.date
hist_df.set_index(["date", "ticker"], inplace=True)

# helper → next‑day % change for same ticker

def next_day_change(row):
    nxt_date = row.name[0] + dt.timedelta(days=1)
    tkr      = row.name[1]
    try:
        return hist_df.loc[(nxt_date, tkr), "daily_percentage_change"]
    except KeyError:
        return None  # last day (no label)

hist_df["next_day_change"] = hist_df.apply(next_day_change, axis=1)
req_cols = ["sma_7_day", "daily_percentage_change", "close", "next_day_change"]
hist_df.dropna(subset=req_cols, inplace=True)
hist_df.reset_index(inplace=True)

# ══════════════════ 2. LOAD & PREP NEWS ═════════════════════
news_df = pd.read_csv(NEWS_CSV_PATH)
news_df.columns = news_df.columns.str.strip().str.lower()
news_df["date"] = pd.to_datetime(news_df["date"]).dt.date

# filter date range
news_df = news_df.loc[(news_df["date"] >= DATE_LO) & (news_df["date"] <= DATE_HI)]

# aggregate: one long headline string per ⟨date,ticker⟩
news_df = (
    news_df.groupby(["date", "crypto"], sort=False)["headline"]
           .agg(lambda x: " | ".join(x))
           .reset_index()
           .rename(columns={"crypto": "ticker", "headline": "headline_text"})
)

# ══════════════════ 3. SENTIMENT SCORING (FinBERT) ══════════
print("Loading FinBERT sentiment model…")

tok_snt = AutoTokenizer.from_pretrained(SENT_MODEL_NAME)
mdl_snt = AutoModelForSequenceClassification.from_pretrained(SENT_MODEL_NAME).to(device)
mdl_snt.eval()

@torch.no_grad()
def sentiment_score(text: str) -> float:
    """Return scalar pos−neg in −1…+1 (FinBERT order = [neg, neu, pos])."""
    inputs = tok_snt(text, return_tensors="pt", truncation=True, max_length=256).to(device)
    logits = mdl_snt(**inputs).logits
    probs  = F.softmax(logits, dim=-1)[0]
    return (probs[2] - probs[0]).item()

print("Scoring headlines…")
news_df["sentiment_score"] = news_df["headline_text"].apply(sentiment_score)

# ══════════════════ 4. MERGE NEWS → HISTORICAL ══════════════
merged_df = hist_df.merge(news_df, on=["date", "ticker"], how="left")
merged_df["sentiment_score"].fillna(0.0, inplace=True)
merged_df["headline_text"].fillna("no crypto headlines that day", inplace=True)

# ══════════════════ 5. PROMPT & TARGET STRINGS ══════════════

# ► prompt encoder
def make_input(row: pd.Series) -> str:
    headline = row["headline_text"][:250]
    return (
        f"Closing Price: {row['close']:.2f}. "
        f"7-Day SMA: {row['sma_7_day']:.2f}. "
        f"RSI_14: {row['rsi_14']:.2f}. "
        f"Volume Δ%: {row['volume_change_%']:.2f}. "
        f"Rolling Std 7: {row['rolling_std_7']:.2f}. "
        f"Daily Δ%: {row['daily_percentage_change']:.2f}%. "
        f"News sentiment: {row['sentiment_score']:+.3f}. "
        f"Headlines: {headline}…"
    )

# ► target encoder = direction + signed magnitude

def make_target(row: pd.Series) -> str:
    pct = row["next_day_change"]  # already expressed in % units
    direction = (
        "up"      if pct >  +0.10 else
        "down"    if pct <  -0.10 else
        "neutral"
    )
    return f"{direction} {pct:+.2f}%"

print("Building prompts…")
merged_df["input_text"]  = merged_df.apply(make_input,  axis=1)
merged_df["target_text"] = merged_df.apply(make_target, axis=1)

# ══════════════════ 6. HF DATASET & TOKENISATION ════════════
print("Tokenising…")
final_ds  = Dataset.from_pandas(merged_df[["input_text", "target_text"]])
splits    = final_ds.train_test_split(test_size=0.3, seed=42)

base_tok = AutoTokenizer.from_pretrained(MODEL_NAME)
base_mdl = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME).to(device)

# ↓ longest target ~15 tokens, so pad to 15
def preprocess(batch):
    model_in = base_tok(batch["input_text"], max_length=512, padding="max_length", truncation=True)
    labels   = base_tok(text_target=batch["target_text"], max_length=15, padding="max_length", truncation=True)
    model_in["labels"] = labels["input_ids"]
    return model_in

encoded = splits.map(preprocess, batched=True, remove_columns=["input_text", "target_text"])

# ══════════════════ 7. TRAINING SETUP ═══════════════════════
training_args = Seq2SeqTrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=5,
    per_device_train_batch_size=1,
    per_device_eval_batch_size=1,
    learning_rate=5e-5,
    weight_decay=0.01,
    predict_with_generate=True,
    logging_dir=f"{OUTPUT_DIR}/logs",
    logging_steps=50,
    do_eval=True,
    report_to="none",
)

collator = DataCollatorForSeq2Seq(tokenizer=base_tok, model=base_mdl)

trainer = Seq2SeqTrainer(
    model=base_mdl,
    args=training_args,
    train_dataset=encoded["train"],
    eval_dataset=encoded["test"],
    tokenizer=base_tok,
    data_collator=collator,
)

# ══════════════════ 8. TRAIN ════════════════════════════════
print("\nStarting training…")
trainer.train()

# ══════════════════ 9. SAVE ════════════════════════════════
save_dir = f"{OUTPUT_DIR}/final_model_pct"
print(f"\nSaving model → {save_dir} …")
trainer.save_model(save_dir)
base_tok.save_pretrained(save_dir)
print("\n✅ Done. Model is ready for inference.")
