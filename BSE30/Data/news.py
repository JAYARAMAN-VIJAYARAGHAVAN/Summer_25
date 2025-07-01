#!/usr/bin/env python3
import time
import requests
import pandas as pd
from datetime import datetime, timedelta

# ── CONFIG ────────────────────────────────────────────────────────────
DAYS_BACK     = 365
MAX_HEADLINES = 5
OUTPUT_CSV    = "bse30_headlines_past_year.csv"
QUERY         = "Sensex OR BSE"

START_DATE = datetime.now().date() - timedelta(days=DAYS_BACK)
END_DATE   = datetime.now().date()

def fetch_pushshift_headlines(date):
    # build Unix timestamps for the 24h window
    start_ts = int(datetime.combine(date, datetime.min.time()).timestamp())
    end_ts   = start_ts + 86400
    url = (
        "https://api.pushshift.io/reddit/search/submission"
        f"?after={start_ts}"
        f"&before={end_ts}"
        "&sort_type=score"
        "&sort=desc"
        f"&q={requests.utils.quote(QUERY)}"
        f"&size={MAX_HEADLINES}"
    )
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json().get("data", [])
    # extract titles
    return [post["title"].strip() for post in data if "title" in post]

def main():
    rows = []
    total = (END_DATE - START_DATE).days + 1
    print(f"Fetching {total} days from {START_DATE} → {END_DATE}")

    for i in range(total):
        d = START_DATE + timedelta(days=i)
        print(f"[{i+1}/{total}] {d} → ", end="")
        try:
            headlines = fetch_pushshift_headlines(d)
        except Exception as e:
            print("error:", e.__class__.__name__)
            continue

        if headlines:
            print(f"got {len(headlines)}")
            for h in headlines:
                rows.append({"date": d.isoformat(), "headline": h})
        else:
            print("no headlines")
        # be gentle on the API
        time.sleep(1)

    df = pd.DataFrame(rows, columns=["date", "headline"])
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"\nDone — wrote {len(df)} rows to {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
