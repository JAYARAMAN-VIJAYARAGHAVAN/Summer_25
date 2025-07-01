#!/usr/bin/env python3
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from transformers import T5Tokenizer, T5ForConditionalGeneration

def fetch_features_for_date(date_str):
    date = pd.to_datetime(date_str)
    warmup_days = 250
    start_date = date - timedelta(days=warmup_days)
    end_date = date + timedelta(days=5)

    bse = yf.download("^BSESN", start=start_date.strftime('%Y-%m-%d'),
                      end=end_date.strftime('%Y-%m-%d'), auto_adjust=False)
    if bse.empty:
        raise ValueError(f"No BSE data fetched for {date_str}")

    bse = bse.rename(columns={
        "Open": "bse_open", "High": "bse_high", "Low": "bse_low",
        "Close": "bse_close", "Adj Close": "bse_adj_close", "Volume": "bse_volume"
    }).astype(float)

    ema12 = bse["bse_close"].ewm(span=12, adjust=False).mean()
    ema26 = bse["bse_close"].ewm(span=26, adjust=False).mean()
    macd = ema12 - ema26
    bse["MACD"] = macd
    bse["MACD_sig"] = macd.ewm(span=9, adjust=False).mean()
    bse["MACD_hist"] = bse["MACD"] - bse["MACD_sig"]
    bse["MOM_10"] = bse["bse_close"].diff(10)
    tp = (bse["bse_high"] + bse["bse_low"] + bse["bse_close"]) / 3
    ma20 = tp.rolling(20, min_periods=1).mean()
    mad20 = (tp - ma20).abs().rolling(20, min_periods=1).mean()
    bse["CCI_20"] = (tp - ma20) / (0.015 * mad20)

    brent = yf.download("BZ=F", start=start_date.strftime('%Y-%m-%d'),
                        end=end_date.strftime('%Y-%m-%d'), auto_adjust=False)["Close"]
    brent.name = "BZ=F"

    df = pd.concat([bse, brent], axis=1).ffill()
    df.columns = [
        '_'.join([str(part) for part in col if part]) if isinstance(col, tuple) else str(col)
        for col in df.columns
    ]
    df = df.rename(columns={"BZ=F": "brent_crude"})

    df = df.reset_index().rename(columns={"Date": "date"})
    return df

def build_prompt(features):
    return ", ".join(f"{k}: {v:.2f}" for k, v in features.items())

# --- MAIN ---
if __name__ == "__main__":
    date_input = input("yyyy-mm-dd: ").strip()
    df = fetch_features_for_date(date_input)

    D = pd.to_datetime(date_input)
    row = df[df['date'].dt.date == D.date()]
    if row.empty:
        raise ValueError(f"No data for {D.date()}")
    row = row.iloc[0]

    features = {
        "bse_high": row["bse_high_^BSESN"],
        "MACD": row["MACD"],
        "bse_close": row["bse_close_^BSESN"],
        "bse_adj_close": row["bse_adj_close_^BSESN"],
        "CCI_20": row["CCI_20"],
        "MOM_10": row["MOM_10"],
        "brent_crude": row["brent_crude"],
        "bse_volume": row["bse_volume_^BSESN"],
        "MACD_hist": row["MACD_hist"]
    }

    prompt = build_prompt(features)

    tokenizer = T5Tokenizer.from_pretrained("./Model/flan_gap_model_9feat_55")
    model = T5ForConditionalGeneration.from_pretrained("./Model/flan_gap_model_9feat_55")

    enc = tokenizer(prompt, return_tensors="pt")
    output = model.generate(**enc, max_new_tokens=8, num_beams=1)
    pred = tokenizer.decode(output[0], skip_special_tokens=True).strip()

    future_rows = df[df['date'] > D]
    if not future_rows.empty:
        next_row = future_rows.iloc[0]
        actual_gap = (next_row["bse_open_^BSESN"] / row["bse_close_^BSESN"] - 1) * 100
        actual_date = next_row["date"].strftime('%Y-%m-%d')
        actual_str = f"{actual_gap:.2f}%"
    else:
        actual_str = "Data not available yet"

    print("\n📝 Prompt used:\n", prompt)
    print(f"\n🎯 FLAN-T5 predicted gap %: {pred}")
    print(f"✅ Actual {actual_date if future_rows.empty is False else ''} open gap %: {actual_str}")
