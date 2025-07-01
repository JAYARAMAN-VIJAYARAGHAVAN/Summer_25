import pandas as pd
import numpy as np

# Load
df = pd.read_csv('Data/sensex_macro_V3.csv', parse_dates=['date'])

# Drop NaNs in open_gap_pct just in case
df = df.dropna(subset=['open_gap_pct']).reset_index(drop=True)

# Compute sign
df['gap_sign'] = np.sign(df['open_gap_pct'])

# Count
num_up = (df['gap_sign'] >= 0).sum()  # up or flat
num_down = (df['gap_sign'] < 0).sum()
total = len(df)

# Display
print(f"Total rows:     {total}")
print(f"Up / flat gaps: {num_up} ({num_up / total:.2%})")
print(f"Down gaps:      {num_down} ({num_down / total:.2%})")
