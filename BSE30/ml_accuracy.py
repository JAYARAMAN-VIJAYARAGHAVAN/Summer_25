import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

def evaluate_model_on_csv(csv_path, model_path):
    # Load CSV
    df = pd.read_csv(csv_path, parse_dates=['date'])

    # Features + target
    features = [
        "bse_high", "MACD", "bse_close", "bse_adj_close",
        "CCI_20", "MOM_10", "brent_crude", "bse_volume", "MACD_hist"
    ]
    target = "open_gap_pct"

    X = df[features]
    y_true = df[target]

    # Load model
    model = xgb.Booster()
    model.load_model(model_path)

    # Predict
    dmatrix = xgb.DMatrix(X)
    y_pred = model.predict(dmatrix)

    # Metrics
    mse = mean_squared_error(y_true, y_pred)
    rmse = mse ** 0.5
    mae = mean_absolute_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)


    # Hit rates
    actual_up = y_true > 0
    actual_down = y_true < 0
    pred_up = y_pred > 0
    pred_down = y_pred < 0

    up_hits = np.sum(actual_up & pred_up)
    down_hits = np.sum(actual_down & pred_down)

    up_total = np.sum(actual_up)
    down_total = np.sum(actual_down)

    up_hit_rate = up_hits / up_total * 100 if up_total > 0 else np.nan
    down_hit_rate = down_hits / down_total * 100 if down_total > 0 else np.nan

    # Print results
    print(f"✅ RMSE: {rmse:.4f}")
    print(f"✅ MAE: {mae:.4f}")
    print(f"✅ R²: {r2:.4f}")
    print(f"✅ Up hit rate: {up_hit_rate:.2f}%")
    print(f"✅ Down hit rate: {down_hit_rate:.2f}%")

    return {
        "rmse": rmse,
        "mae": mae,
        "r2": r2,
        "up_hit_rate": up_hit_rate,
        "down_hit_rate": down_hit_rate
    }

# --- MAIN ---
if __name__ == "__main__":
    evaluate_model_on_csv(
        csv_path="Data/10years_55.csv",
        model_path="ML/xgb_open_gap_9feat_10years55.model"
    )
