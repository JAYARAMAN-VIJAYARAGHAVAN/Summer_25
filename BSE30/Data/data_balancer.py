import pandas as pd

# ── LOAD & CHRONO SORT ─────────────────────────────────────────
df = pd.read_csv('Data/10years_with_snp.csv', parse_dates=['date'])
df = df.sort_values('date').reset_index(drop=True)

# ── OPEN-GAP PERCENT TARGET ────────────────────────────────────
# tomorrow_open  vs  today_close
df['open_gap_pct'] = ((
    df['bse_open'].shift(-1) / df['bse_close'] - 1
) * 100).round(2)   # expressed in %

# ── DROP LAST ROW (no tomorrow value to compare) ───────────────
df = df.dropna(subset=['open_gap_pct']).reset_index(drop=True)

# (optional) save back
df.to_csv('Data/10years_snp_og.csv', index=False)
