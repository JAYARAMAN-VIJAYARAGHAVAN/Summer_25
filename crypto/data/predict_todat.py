import datetime
import yfinance as yf
import pandas as pd
import requests
from bs4 import BeautifulSoup
from dateutil import parser
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

# === CONFIG ===
MODEL_DIR = "./flan_t5_finetuned_crypto_model/final_model"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# === LOAD MODEL ===
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_DIR).to(DEVICE)

# === INPUT ===
ticker = input("Enter crypto ticker (e.g. BTC-USD): ").strip().upper()
base_symbol = ticker.split('-')[0]

# === DATE RANGE ===
end_date = datetime.datetime.today()
yesterday = end_date - datetime.timedelta(days=1)
prev_day = yesterday - datetime.timedelta(days=1)

# Format dates as strings for indexing
today_str = end_date.strftime('%Y-%m-%d')
yesterday_str = yesterday.strftime('%Y-%m-%d')
prev_day_str = prev_day.strftime('%Y-%m-%d')

# === GET PRICE DATA ===
data = yf.download(
    ticker,
    start=prev_day - datetime.timedelta(days=1),  # ensure we have prev_day data
    end=end_date + datetime.timedelta(days=1),
    auto_adjust=False
)

if data.empty:
    print(f"❌  No price data for {ticker}")
    exit()

# === CALCULATE INDICATORS ===
data['daily_pct_change'] = data['Adj Close'].pct_change() * 100
data['sma_7_day'] = data['Adj Close'].rolling(window=7, min_periods=1).mean()

if not isinstance(data.index, pd.DatetimeIndex):
    data.index = pd.to_datetime(data.index)

# Ensure required dates exist
for d in [prev_day_str, yesterday_str, today_str]:
    if d not in data.index.strftime('%Y-%m-%d').tolist():
        print(f"❌  Missing data for {ticker} on {d}")
        exit()

# Extract values as floats
yesterday_dt = pd.to_datetime(yesterday_str)
prev_day_dt = pd.to_datetime(prev_day_str)
today_dt = pd.to_datetime(today_str)

yesterday_close = float(data.loc[yesterday_dt, 'Adj Close'])
yesterday_sma = float(data.loc[yesterday_dt, 'sma_7_day'])
daily_pct_change = float(data.loc[yesterday_dt, 'daily_pct_change'])
prev_close = float(data.loc[prev_day_dt, 'Adj Close'])
today_close = float(data.loc[today_dt, 'Adj Close'])

actual_change = ((today_close - yesterday_close) / yesterday_close) * 100

# === SCRAPE YESTERDAY'S NEWS ===
def scrape_crypto_news(base_symbol, target_date):
    headers = {
        'User-Agent': (
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/91.0.4472.124 Safari/537.36'
        )
    }
    try:
        url = f"https://cryptopanic.com/news/{base_symbol}-news/"
        resp = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(resp.text, 'html.parser')
        
        headlines = []
        for article in soup.select('div.news-table'):
            time_tag = article.find('time')
            if not time_tag or not time_tag.has_attr('datetime'):
                continue
            pub_date = parser.parse(time_tag['datetime']).date()
            if pub_date == target_date:
                link = article.find('a', class_='news-link')
                if link and link.text:
                    headlines.append(link.text.strip())
                if len(headlines) >= 5:
                    break
        return headlines
    except Exception as e:
        print(f"⚠️  News scraping error: {e}")
        return []

news_headlines = scrape_crypto_news(base_symbol, yesterday.date())
news_summary = " | ".join(news_headlines) if news_headlines else "no relevant news"

# === BUILD INPUT PROMPT ===
input_text = (
    f"Analyze the cryptocurrency {base_symbol} based on the following news: {news_summary}. "
    f"Yesterday's 7-day SMA was {yesterday_sma:.2f} and the daily price change was {daily_pct_change:.2f}%. "
    f"Provide a market outlook focused on {base_symbol}. "
    f"Please include the coin name '{base_symbol}' explicitly in your analysis. "
    f"Market outlook:"
)

# === GENERATE PREDICTION ===
inputs = tokenizer(input_text, return_tensors="pt", truncation=True, max_length=512).to(DEVICE)
output = model.generate(
    **inputs,
    max_new_tokens=150,
    do_sample=True,
    temperature=0.7,
    top_p=0.9,
    repetition_penalty=1.0,
    eos_token_id=tokenizer.eos_token_id
)
prediction = tokenizer.decode(output[0], skip_special_tokens=True).strip()

# === PRINT RESULTS ===
print(f"\n📅 Analysis Date: {today_str}")
print(f"📰 News Date: {yesterday_str}")
print("\n🔍 Predicted Market Outlook:")
print(prediction)
print(f"\n📈 Actual Daily % Change: {actual_change:.2f}%")
