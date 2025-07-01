import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# 1️⃣ Load data
df = pd.read_csv('Data/10years_snp_55.csv', parse_dates=['date'])
df = df.sort_values('date').reset_index(drop=True)
df = df.dropna(subset=['open_gap_pct']).reset_index(drop=True)

# 2️⃣ Define 8 features (top ones + MI-relevant)
features = [
    'bse_high',
    'MACD',
    'bse_close',
    'bse_adj_close',
    'CCI_20',
    'MOM_10',
    'brent_crude',
    'MACD_hist',
    'snp500'
]
X = df[features]
y = df['open_gap_pct']

# 3️⃣ DMatrix
dtrain = xgb.DMatrix(X, label=y)

# 4️⃣ Parameters
params = {
    'objective': 'reg:squarederror',
    'learning_rate': 0.005,
    'max_depth': 10,
    'eval_metric': 'rmse'
}

# 5️⃣ Cross-validation
cv_results = xgb.cv(
    params,
    dtrain,
    num_boost_round=2000,
    nfold=5,
    early_stopping_rounds=50,
    verbose_eval=50,
    seed=42
)
best_n = len(cv_results)
print(f"Best num_boost_round = {best_n}")

# 6️⃣ Train model
model = xgb.train(params, dtrain, num_boost_round=best_n)

# 7️⃣ Save model
model.save_model('ML/xgb_open_gap_snp_55.model')

# 8️⃣ Predict
dtest = xgb.DMatrix(X)
preds = model.predict(dtest)

# 9️⃣ Metrics
mae = mean_absolute_error(y, preds)
rmse = np.sqrt(mean_squared_error(y, preds))
r2 = r2_score(y, preds)
sign_correct = (np.sign(preds) == np.sign(y)).mean()

is_down = y < 0
is_up = y >= 0
down_hit_rate = (np.sign(preds[is_down]) == np.sign(y[is_down])).mean()
up_hit_rate = (np.sign(preds[is_up]) == np.sign(y[is_up])).mean()

print(f"MAE:              {mae:.4f}%")
print(f"RMSE:             {rmse:.4f}%")
print(f"R²:               {r2:.4f}")
print(f"Sign accuracy:    {sign_correct:.2%}")
print(f"Down hit rate:    {down_hit_rate:.2%}")
print(f"Up hit rate:      {up_hit_rate:.2%}")
