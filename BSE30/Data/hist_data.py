#!/usr/bin/env python3
"""
Build a clean Sensex-plus-macro dataset (21 Jun 1995 → today)
• Pulls −500 calendar-days of warm-up data
• Computes SMA-10 / EMA-50 / SMA-200, RSI-14, MOM-10, MACD, Stoch %K/%D, CCI-20
• Adds Brent, WTI, Gold, DXY, VIX, Nasdaq, USD-INR, Fed funds rate, S&P 500
• Rounds every float to 2 decimals
• Saves Data/30years.csv
"""

import yfinance as yf
import pandas as pd
from pandas_datareader import data as web
from datetime import datetime, timedelta

# -------------------------------------------------
# 0. CONFIG
# -------------------------------------------------
RAW_START = datetime(2015, 6, 21)
WARM_UP   = timedelta(days=250)
START     = RAW_START - WARM_UP
END       = datetime.today()

# -------------------------------------------------
# 1. BSE-30 OHLCV
# -------------------------------------------------
bse = yf.download("^BSESN", start=START, end=END, auto_adjust=False)
bse.index.name = "Date"
bse.columns = [c[0] if isinstance(c, tuple) else c for c in bse.columns]
bse = bse.rename(columns={
    "Open": "bse_open", "High": "bse_high", "Low": "bse_low",
    "Close": "bse_close", "Adj Close": "bse_adj_close", "Volume": "bse_volume"
}).astype(float)

# -------------------------------------------------
# 2. TECHNICAL INDICATORS
# -------------------------------------------------
bse["SMA_10"]   = bse["bse_close"].rolling(10 , min_periods=1).mean()
bse["EMA_50"]   = bse["bse_close"].ewm(span=50, adjust=False).mean()
bse["SMA_200"]  = bse["bse_close"].rolling(200, min_periods=1).mean()

delta = bse["bse_close"].diff()
gain  = delta.clip(lower=0)
loss  = -delta.clip(upper=0)
avg_gain = gain.rolling(14, min_periods=1).mean()
avg_loss = loss.rolling(14, min_periods=1).mean()
rs        = avg_gain / avg_loss.replace(0, pd.NA)
bse["RSI_14"] = 100 - (100 / (1 + rs))

bse["MOM_10"] = bse["bse_close"].diff(10)

ema12 = bse["bse_close"].ewm(span=12, adjust=False).mean()
ema26 = bse["bse_close"].ewm(span=26, adjust=False).mean()
macd  = ema12 - ema26
bse["MACD"]      = macd
bse["MACD_sig"]  = macd.ewm(span=9, adjust=False).mean()
bse["MACD_hist"] = bse["MACD"] - bse["MACD_sig"]

low14  = bse["bse_low"].rolling(14, min_periods=1).min()
high14 = bse["bse_high"].rolling(14, min_periods=1).max()
bse["STOCHk_14"] = 100 * (bse["bse_close"] - low14) / (high14 - low14)
bse["STOCHd_3"]  = bse["STOCHk_14"].rolling(3, min_periods=1).mean()

tp     = (bse["bse_high"] + bse["bse_low"] + bse["bse_close"]) / 3
ma20   = tp.rolling(20, min_periods=1).mean()
mad20  = (tp - ma20).abs().rolling(20, min_periods=1).mean()
bse["CCI_20"] = (tp - ma20) / (0.015 * mad20)

# -------------------------------------------------
# 3. MACRO SERIES
# -------------------------------------------------
symbols = {
    "brent_crude": "BZ=F", "wti_crude": "CL=F",  "gold": "GC=F",
    "dxy": "DX-Y.NYB",     "vix": "^VIX",        "nasdaq": "^IXIC",
    "usd_inr": "INR=X",    "snp500": "^GSPC"
}

macro_df = pd.concat(
    [
        yf.download(tk, start=START, end=END, auto_adjust=False)["Close"]
          .squeeze()
          .rename(name)
        for name, tk in symbols.items()
    ],
    axis=1
)

# -------------------------------------------------
# 4. FED FUNDS RATE
# -------------------------------------------------
fed = web.DataReader("FEDFUNDS", "fred", START, END)
fed.rename(columns={"FEDFUNDS": "fed_funds_rate"}, inplace=True)

# -------------------------------------------------
# 5. MERGE + CLEAN + SAVE
# -------------------------------------------------
combined = pd.concat([bse, macro_df, fed], axis=1).loc[RAW_START:]
combined.ffill(inplace=True)
combined = combined.round(2)

output_path = "Data/10years_with_snp.csv"
combined.reset_index().to_csv(output_path, index=False)
print(f"✅ Saved {output_path}")
