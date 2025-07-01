#!/usr/bin/env python3
import pandas as pd
import xgboost as xgb

def main():
    # Load dataset
    df = pd.read_csv("Data/10years_V2.csv", parse_dates=["date"])

    # Start from row 2519
    df = df.iloc[1990:].reset_index(drop=True)

    # Load model
    model_xgb = xgb.Booster()
    model_xgb.load_model("ML/xgb_open_gap_9feat_10years55.model")

    feature_cols = [
        "bse_high",
        "MACD",
        "bse_close",
        "bse_adj_close",
        "CCI_20",
        "MOM_10",
        "brent_crude",
        "bse_volume",
        "MACD_hist"
    ]

    results = []

    for i in range(len(df)):
        row = df.iloc[i]

        X = pd.DataFrame([row[feature_cols].values], columns=feature_cols)
        dmatrix = xgb.DMatrix(X)
        pred = model_xgb.predict(dmatrix)[0]

        actual_gap = row["open_gap_pct"]

        results.append({
            "date": row["date"].strftime('%Y-%m-%d'),
            "predicted_gap_pct": round(pred, 2),
            "actual_gap_pct": round(actual_gap, 2)
        })

        if i % 10 == 0:
            print(f"Processed {row['date'].strftime('%Y-%m-%d')}")

    df_out = pd.DataFrame(results)
    df_out.to_csv("predictions_from_row_2519_V2.csv", index=False)
    print("✅ Saved to predictions_from_row_2519.csv")

if __name__ == "__main__":
    main()
