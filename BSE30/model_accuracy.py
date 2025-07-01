import pandas as pd
from transformers import T5Tokenizer, T5ForConditionalGeneration
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import numpy as np

# Load your dataset
df = pd.read_csv("Data/10years_55.csv", parse_dates=["date"])

# Load FLAN-T5 model + tokenizer
tokenizer = T5Tokenizer.from_pretrained("./Model/flan_gap_model_8feat_55")
model = T5ForConditionalGeneration.from_pretrained("./Model/flan_gap_model_8feat_55")

def build_prompt(row):
    return ", ".join([
        f"bse_high: {row['bse_high']:.2f}",
        f"MACD: {row['MACD']:.2f}",
        f"bse_close: {row['bse_close']:.2f}",
        f"bse_adj_close: {row['bse_adj_close']:.2f}",
        f"CCI_20: {row['CCI_20']:.2f}",
        f"MOM_10: {row['MOM_10']:.2f}",
        f"brent_crude: {row['brent_crude']:.2f}",
        f"MACD_hist: {row['MACD_hist']:.2f}"
    ])

preds = []
actuals = []

print("⚡ Generating FLAN-T5 predictions...")
total_rows = len(df)

for idx, row in df.iterrows():
    prompt = build_prompt(row)
    enc = tokenizer(prompt, return_tensors="pt")
    output = model.generate(**enc, max_new_tokens=8, num_beams=1)
    pred_text = tokenizer.decode(output[0], skip_special_tokens=True).strip()
    
    try:
        pred_val = float(pred_text)
        preds.append(pred_val)
        actuals.append(row["open_gap_pct"])
    except ValueError:
        print(f"⚠️ Skipped bad prediction: '{pred_text}' for date {row['date']}")
        continue

    # Progress counter
    print(f"✅ Completed {len(preds)} / {total_rows} rows")

# Metrics
preds = np.array(preds)
actuals = np.array(actuals)

mae = mean_absolute_error(actuals, preds)
mse = mean_squared_error(actuals, preds)
rmse = mse ** 0.5
r2 = r2_score(actuals, preds)

# Sign hit rates
sign_actuals = np.sign(actuals)
sign_preds = np.sign(preds)

up_hits = (sign_actuals > 0) & (sign_preds > 0)
down_hits = (sign_actuals < 0) & (sign_preds < 0)
sign_hits = up_hits | down_hits

up_hit_rate = up_hits.sum() / (sign_actuals > 0).sum() * 100 if (sign_actuals > 0).sum() > 0 else 0
down_hit_rate = down_hits.sum() / (sign_actuals < 0).sum() * 100 if (sign_actuals < 0).sum() > 0 else 0
sign_accuracy = sign_hits.mean() * 100

# Results
print("\n🎯 FLAN-T5 Evaluation Metrics:")
print(f"MAE:              {mae:.4f}%")
print(f"RMSE:             {rmse:.4f}%")
print(f"R²:               {r2:.4f}")
print(f"Sign accuracy:    {sign_accuracy:.2f}%")
print(f"Up hit rate:      {up_hit_rate:.2f}%")
print(f"Down hit rate:    {down_hit_rate:.2f}%")
