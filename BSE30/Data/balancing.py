import pandas as pd
import numpy as np

# 1️⃣ Load data
df = pd.read_csv('Data/10years_snp_og.csv', parse_dates=['date'])
df = df.dropna(subset=['open_gap_pct']).reset_index(drop=True)

# 2️⃣ Add gap sign
df['gap_sign'] = np.sign(df['open_gap_pct'])

# 3️⃣ Split up/flat and down
df_up = df[df['gap_sign'] >= 0]
df_down = df[df['gap_sign'] < 0]

# 4️⃣ Determine target counts
total_target = min(len(df_up) * 100 // 55, len(df_down) * 100 // 45)  # max total size at 52:48
num_up_target = int(total_target * 0.55)
num_down_target = total_target - num_up_target

# 5️⃣ Sample
df_up_sampled = df_up.sample(n=num_up_target, random_state=42)
df_down_sampled = df_down.sample(n=num_down_target, random_state=42)

# 6️⃣ Combine
df_balanced = pd.concat([df_up_sampled, df_down_sampled]).sample(frac=1, random_state=42).reset_index(drop=True)

# 7️⃣ Show result
print(f"Balanced dataset size: {len(df_balanced)}")
print(f"Up / flat gaps: {len(df_balanced[df_balanced['gap_sign'] >= 0])} ({len(df_balanced[df_balanced['gap_sign'] >= 0]) / len(df_balanced):.2%})")
print(f"Down gaps:      {len(df_balanced[df_balanced['gap_sign'] < 0])} ({len(df_balanced[df_balanced['gap_sign'] < 0]) / len(df_balanced):.2%})")

# (optional) Save
df_balanced.to_csv('Data/10years_snp_55.csv', index=False)
print("✅ Saved balanced dataset to Data/10years_with_cgap_55.csv")
