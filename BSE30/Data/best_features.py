import pandas as pd
import numpy as np
from sklearn.feature_selection import mutual_info_regression
from sklearn.preprocessing import StandardScaler

# ── CONFIG ───────────────────────────────────────────────
CSV = "Data/sensex_macro_with_gap.csv"
TARGET = "open_gap_pct"
DATE   = "date"
RND    = 42
# ---------------------------------------------------------

# 1️⃣ LOAD & SORT
df = pd.read_csv(CSV, parse_dates=[DATE]).sort_values(DATE).reset_index(drop=True)

# 2️⃣ DROP ROWS WITH NaNs
df = df.dropna(subset=[TARGET]).dropna().reset_index(drop=True)

# 3️⃣ SPLIT X , y
feature_cols = [c for c in df.select_dtypes("number").columns if c != TARGET]
X = df[feature_cols].values
y = df[TARGET].values

# 4️⃣ STANDARDISE X (helps MI estimator)
X_std = StandardScaler().fit_transform(X)

# 5️⃣ MUTUAL INFO
mi = mutual_info_regression(X_std, y, random_state=RND)

# 6️⃣ PRINT SCORES RANKED
ranked = pd.Series(mi, index=feature_cols).sort_values(ascending=False).round(4)

print("\nMutual-information scores (higher = more informative):")
for f, s in ranked.items():
    print(f"{f:25s}  {s:.4f}")
