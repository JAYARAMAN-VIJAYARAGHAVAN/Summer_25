"""
Plot one figure per feature + one for Sensex daily % change
──────────────────────────────────────────────────────────
• Reads the cleaned CSV (change PATH if needed)
• Computes daily_pct_change
• Creates a separate matplotlib figure for
  – every numeric feature column
  – the daily_pct_change series
• Shows the figures on screen (or save to PNG if you uncomment)
"""

import pandas as pd
import matplotlib.pyplot as plt

# ── 1)  LOAD DATA ───────────────────────────────────────────
PATH = 'Data/sensex_macro_merged_clean_V12.csv'   # <— adjust if necessary
df   = pd.read_csv(PATH, parse_dates=['index'])

# ── 2)  DAILY % CHANGE OF SENSEX CLOSE ─────────────────────
df['daily_pct_change'] = df['bse_close'].pct_change() * 100   # %

# ── 3)  LIST OF FEATURE COLUMNS (all numeric, excl. new target) ─
numeric_cols = df.select_dtypes(include='number').columns
feature_cols = [c for c in numeric_cols if c != 'daily_pct_change']

# ── 4)  LOOP & PLOT EACH FEATURE SEPARATELY ────────────────
for col in feature_cols:
    plt.figure(figsize=(10, 3))
    plt.plot(df['index'], df[col], linewidth=0.8)
    plt.title(f'{col}')
    plt.xlabel('Date')
    plt.tight_layout()

    # Optional: save instead of/alongside showing
    # plt.savefig(f'plots/{col}.png', dpi=150)
    plt.show()

# ── 5)  PLOT THE DAILY % CHANGE ────────────────────────────
plt.figure(figsize=(10, 3))
plt.plot(df['index'], df['daily_pct_change'], linewidth=0.8)
plt.title('Daily % Change of Sensex Close')
plt.xlabel('Date')
plt.ylabel('% Change')
plt.tight_layout()

# Optional: save
# plt.savefig('plots/daily_pct_change.png', dpi=150)
plt.show()
