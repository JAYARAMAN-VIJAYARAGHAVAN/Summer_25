#!/usr/bin/env python3
"""
Predict next-day crypto movement (direction **and** % change)
using technicals + FinBERT news sentiment → fine-tuned FLAN-T5 v7.

Usage
-----
python predict_one_day.py TICKER [YYYY-MM-DD]

If no date is supplied, yesterday (UTC) is used.

Key points
──────────
• Technical features are pulled from yfinance on the fly.  
• Headlines are fetched live from Google News + major crypto RSS feeds;  
  falls back to your cached CSV if nothing is found.  
• Sentiment is scored with ProsusAI/finBERT.  
• The prompt mirrors the format used for v7 training.
"""

import sys, math, datetime as dt, warnings, time
from pathlib import Path
from urllib.parse import quote_plus

import pandas as pd, yfinance as yf, torch, requests, feedparser
from transformers import (
    AutoTokenizer, AutoModelForSequenceClassification,
    AutoModelForSeq2SeqLM
)

# ─── paths / constants ──────────────────────────────────────
MODEL_DIR       = Path("data/flan_t5_finetuned_crypto_model_predictive_v7/final_model_pct")
HEADLINES_CSV   = Path("data/top_5_crypto_headlines.csv")   # fallback only
SENT_MODEL      = "ProsusAI/finBERT"
MAX_HEADLINES   = 5

device = torch.device(
    "mps"  if torch.backends.mps.is_available() else
    "cuda" if torch.cuda.is_available()        else
    "cpu"
)
warnings.filterwarnings("ignore", category=FutureWarning, module="pandas")

# ════════════════════════════════════════════════════════════
# 1. Helper: RSI-14 (no pandas rolling)                       ═
# ════════════════════════════════════════════════════════════
def rsi_14(closes: list[float]) -> float:
    diffs  = [closes[i] - closes[i - 1] for i in range(1, len(closes))]
    gains  = [d for d in diffs[-14:] if d > 0]
    losses = [-d for d in diffs[-14:] if d < 0]
    avg_g  = sum(gains)  / 14 if gains  else 0.0
    avg_l  = sum(losses) / 14 if losses else 0.0
    if avg_l == 0:
        return 100.0
    rs = avg_g / avg_l
    return 100 - 100 / (1 + rs)

# ════════════════════════════════════════════════════════════
# 2. Technical features (Close, SMA-7, etc.)                  ═
# ════════════════════════════════════════════════════════════
def get_features(tkr: str, target: dt.date) -> dict:
    start = target - dt.timedelta(days=30)
    end   = target + dt.timedelta(days=1)
    df = yf.download(tkr, start=start, end=end, interval="1d",
                     auto_adjust=False, progress=False)

    if isinstance(df.columns, pd.MultiIndex):          # Unstack if needed
        df = df.droplevel(1, axis=1)
    if target not in df.index.date:
        raise RuntimeError(f"No OHLCV data for {tkr} on {target}.")

    df        = df[~df.index.duplicated(keep="first")]
    df        = df.reset_index(names="date")
    df["date"] = pd.to_datetime(df["date"]).dt.date
    row       = df.loc[df["date"] == target].iloc[0]

    close_p = float(row["Close"])
    open_p  = float(row["Open"])
    pct_chg = (close_p - open_p) / open_p * 100

    closes = df["Close"].tolist()
    sma_7  = sum(closes[-7:]) / min(7, len(closes))
    std_7  = math.sqrt(
        sum((c - sma_7) ** 2 for c in closes[-7:]) /
        max(1, len(closes[-7:]) - 1)
    )
    rsi_val = rsi_14(closes)

    vols    = df["Volume"].tolist()
    vol_chg = 0.0
    if len(vols) >= 2 and vols[-2] != 0:
        vol_chg = (vols[-1] - vols[-2]) / vols[-2] * 100

    return {
        "Close": close_p,
        "Daily_%_Change": pct_chg,
        "7d_SMA": sma_7,
        "RSI_14": rsi_val,
        "Volume_Change_%": vol_chg,
        "Rolling_Std_7": std_7,
    }

# ════════════════════════════════════════════════════════════
# 3. FinBERT sentiment setup                                  ═
# ════════════════════════════════════════════════════════════
tok_s = AutoTokenizer.from_pretrained(SENT_MODEL)
mdl_s = (AutoModelForSequenceClassification
         .from_pretrained(SENT_MODEL).to(device).eval())

@torch.no_grad()
def sentiment(text: str) -> float:
    toks  = tok_s(text, return_tensors="pt", truncation=True, max_length=256).to(device)
    probs = torch.softmax(mdl_s(**toks).logits, dim=-1)[0]
    return float(probs[2] - probs[0])          # pos – neg → −1 … +1

# ════════════════════════════════════════════════════════════
# 4. Live headline fetching  →  FinBERT score                 ═
#     falls back to cached CSV if no live headlines           ═
# ════════════════════════════════════════════════════════════
news_df = (
    pd.read_csv(HEADLINES_CSV)
      .rename(columns=lambda c: c.strip().lower().replace("crypto", "ticker"))
)
news_df["date"] = pd.to_datetime(news_df["date"]).dt.date

RSS_SOURCES = [
    # Google News query “crypto <ticker>”
    lambda tk: (
        "https://news.google.com/rss/search?q="
        + quote_plus(f"crypto {tk}")
        + "&hl=en-US&gl=US&ceid=US:en"
    ),
    lambda _: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    lambda _: "https://cointelegraph.com/rss"
]

def _fetch_feed(url: str):
    try:
        return feedparser.parse(requests.get(url, timeout=8).content)
    except Exception:
        return {"entries": []}

def _is_today(pub_struct, target: dt.date) -> bool:
    """True if RSS item’s published date == `target` (UTC)."""
    if not pub_struct:
        return False
    pub_dt = dt.datetime(*pub_struct[:6])  # struct_time → datetime
    return pub_dt.date() == target

def get_news(tkr: str, target: dt.date):
    tkr_u = tkr.upper()
    collected: list[str] = []

    # 1) live fetch
    for make_url in RSS_SOURCES:
        feed = _fetch_feed(make_url(tkr_u))
        for item in feed.get("entries", []):
            if len(collected) >= MAX_HEADLINES:
                break
            title = item.get("title", "") or ""
            descr = item.get("summary", "") or ""
            if tkr_u not in title.upper() and tkr_u not in descr.upper():
                continue
            if not _is_today(item.get("published_parsed"), target):
                continue
            collected.append(title.strip())

    if collected:
        joined = " | ".join(dict.fromkeys(collected))  # dedup, keep order
        return joined, sentiment(joined)

    # 2) fallback: cached CSV
    rows = news_df.loc[(news_df["ticker"].str.upper() == tkr_u) &
                       (news_df["date"] == target)]
    if rows.empty:
        return "no crypto headlines that day", 0.0
    txt = " | ".join(rows["headline"].head(MAX_HEADLINES))
    return txt, sentiment(txt)

# ════════════════════════════════════════════════════════════
# 5. Load fine-tuned FLAN-T5 v7                              ═
# ════════════════════════════════════════════════════════════
tok_p = AutoTokenizer.from_pretrained(MODEL_DIR, local_files_only=True)
mdl_p = (AutoModelForSeq2SeqLM
         .from_pretrained(MODEL_DIR, local_files_only=True)
         .to(device).eval())

def predict(prompt: str) -> str:
    enc = tok_p(prompt, return_tensors="pt", truncation=True, max_length=512).to(device)
    with torch.no_grad():
        out = mdl_p.generate(**enc, max_new_tokens=3)
    return tok_p.decode(out[0], skip_special_tokens=True)

# ════════════════════════════════════════════════════════════
# 6. Main entry                                              ═
# ════════════════════════════════════════════════════════════
def main():
    if len(sys.argv) < 2:
        sys.exit("Usage: python predict_one_day.py TICKER [YYYY-MM-DD]")
    tkr = sys.argv[1].upper()
    tgt = (dt.date.fromisoformat(sys.argv[2])
           if len(sys.argv) == 3 else
           dt.date.today() - dt.timedelta(days=1))

    start_all = time.time()

    # —— technicals
    feats = get_features(tkr, tgt)

    # —— news + sentiment
    heads, sent = get_news(tkr, tgt)

    # —— build prompt
    prompt = (
        f"Closing Price: {feats['Close']:.2f}. "
        f"7-Day SMA: {feats['7d_SMA']:.2f}. "
        f"RSI_14: {feats['RSI_14']:.2f}. "
        f"Volume Δ%: {feats['Volume_Change_%']:.2f}. "
        f"Rolling Std 7: {feats['Rolling_Std_7']:.2f}. "
        f"Daily Δ%: {feats['Daily_%_Change']:.2f}%. "
        f"News sentiment: {sent:+.3f}. "
        f"Headlines: {heads[:250]}…"
    )

    print("\n── Prompt fed to model ──\n", prompt, "\n")

    # —— model inference
    pred = predict(prompt)
    direction, pct_str = (pred.split(maxsplit=1) + [""])[:2]
    direction = direction.upper()
    pct_pred  = pct_str.strip()

    # —— ground-truth next-day % change
    nxt = tgt + dt.timedelta(days=1)
    df  = yf.download(tkr, start=tgt.isoformat(),
                      end=(nxt + dt.timedelta(days=1)).isoformat(),
                      progress=False, auto_adjust=False)
    df.index = pd.to_datetime(df.index).date
    actual = "N/A"
    if nxt in df.index:
        change = (float(df.loc[nxt, "Close"]) - feats["Close"]) / feats["Close"] * 100
        actual = f"{change:+.2f}%"

    elapsed = time.time() - start_all
    print(f"📈 MODEL PREDICTION: {direction} ({pct_pred})")
    print(f"📊 ACTUAL {nxt}: {actual}")
    print(f"⏱️ Elapsed: {elapsed:.2f}s")

if __name__ == "__main__":
    main()
