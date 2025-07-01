import pandas as pd
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

#df = pd.read_csv('Data/sensex_macro_merged_clean_V3.csv')
#df['Date'] = pd.to_datetime(df['Date'])

#plt.figure(figsize=(12,6))
#plt.plot(df['Date'], df['bse30'], linewidth=2)
#plt.title('BSE30 Index - Last 5 Years')
#plt.xlabel('Date')
#plt.ylabel('BSE30 Value')
#plt.grid(True)
#plt.tight_layout()
#plt.show()



# Load the balanced dataset
df = pd.read_csv("Data/sensex_macro_merged_clean_V4.csv")

# Show class counts
print("Class distribution in balanced dataset:")
print(df['target_text'].value_counts())

# Select macro features + target
features = ['brent_crude', 'wti_crude', 'gold', 'dxy', 'vix', 'nasdaq', 'usd_inr', 'fed_funds_rate']
target = 'next_pct_change'

# Compute correlation
corr = df[features + [target]].corr()

# Show correlation of each feature with the target
print("\n🔍 Correlation with next_pct_change:")
print(corr[target].sort_values(ascending=False))

# Features + target
X = df[['brent_crude', 'wti_crude', 'gold', 'dxy', 'vix', 'nasdaq', 'usd_inr', 'fed_funds_rate']]
y = df['next_pct_change']

# Fit model
model = LinearRegression()
model.fit(X, y)

# Predict + compute R^2
y_pred = model.predict(X)
r2 = r2_score(y, y_pred)

print(f"\n🔍 R² score (variance explained by all features together): {r2:.4f}")
