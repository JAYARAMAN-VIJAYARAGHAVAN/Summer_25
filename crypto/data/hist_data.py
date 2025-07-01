#!/usr/bin/env python3
import os, yfinance as yf, pandas as pd
from datetime import datetime, timedelta

START = datetime(2024, 6, 13)
END   = datetime(2025, 5, 31)
TICKERS = ["BTC-USD", "ETH-USD", "XRP-USD", "XMR-USD", ]
OUT_FILE = "crypto_12months_hist_data_4Coins.csv"

MACRO_TICKERS = {                # column name → Yahoo symbol
    "VIX_Close":  "^VIX",
    "DXY_Close":  "DX-Y.NYB",
    "NDX_Close":  "^NDX",        # Nasdaq-100
}

def compute_rsi(series, period=14):
    d = series.diff()
    gain = d.clip(lower=0).rolling(period).mean()
    loss = (-d.clip(upper=0)).rolling(period).mean()
    rs = gain / loss.replace(0, 1e-9)
    return 100 - 100 / (1 + rs)

def make_macro_df(start, end):
    idx = pd.date_range(start, end, freq="D")
    out = pd.DataFrame(index=idx)
    for col, sym in MACRO_TICKERS.items():
        s = (yf.download(sym, start, end + timedelta(days=1),
                         interval="1d", progress=False)["Close"]
               .reindex(idx).ffill())
        out[col] = s
    return out.reset_index(names="Date")

# MACRO_DF = make_macro_df(START, END)

def fetch_crypto(tkr):
    df = yf.download(tkr, START, END + timedelta(days=1),
                     interval="1d", progress=False)[["Close", "Volume"]].dropna()
    if df.empty:
        print(f"⚠️  {tkr} skipped (no data)")
        return None
    if isinstance(df.columns, pd.MultiIndex):
        df = df.droplevel(1, axis=1)

    df["Daily_%_Change"]  = df["Close"].pct_change() * 100
    df["7d_SMA"]          = df["Close"].rolling(7, min_periods=1).mean()
    df["RSI_14"]          = compute_rsi(df["Close"])
    df["Volume_Change_%"] = df["Volume"].pct_change() * 100
    df["Rolling_Std_7"]   = df["Close"].rolling(7).std()
    df["Ticker"]          = tkr
    df = df.reset_index(names="Date").dropna()
    return df
    # return df.merge(MACRO_DF, on="Date", how="left")

def write_csv(df, path):
    if not os.path.isfile(path):
        df.to_csv(path, index=False)
    else:
        df.to_csv(path, mode="a", header=False, index=False)

if __name__ == "__main__":
    if os.path.exists(OUT_FILE):
        os.remove(OUT_FILE)
    for tkr in TICKERS:
        frame = fetch_crypto(tkr)
        if frame is not None and not frame.empty:
            write_csv(frame, OUT_FILE)
            print(f"✅ {tkr}: {len(frame)} rows appended")
    print(f"\n📄 Data with VIX, DXY & NDX saved to {OUT_FILE}")
