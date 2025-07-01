import time
import random
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import pandas as pd

# ───── Settings ───── #
COINS = ["bitcoin", "ethereum", "ripple"]
START_DATE = datetime(2025, 1, 1)
END_DATE = datetime(2025, 5, 31)
WEEK_DELTA = timedelta(days=7)
MAX_PAGES = 3  # Try to reduce block risk

RESULTS_ALL = []
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
]

def create_driver():
    options = Options()
    options.add_argument('--headless=chrome')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument(f"user-agent={random.choice(USER_AGENTS)}")
    prefs = {"profile.managed_default_content_settings.images": 2}
    options.add_experimental_option("prefs", prefs)
    driver = webdriver.Chrome(options=options)
    driver.set_page_load_timeout(30)
    return driver

def search_week(coin: str, start: datetime, end: datetime):
    print(f"🔎 {coin.upper()} — {start.date()} to {end.date()}")
    driver = create_driver()
    headlines = []

    query = f"{coin} cryptocurrency"
    for page in range(0, MAX_PAGES):
        start_idx = page * 10
        query_url = (
            f"https://www.google.com/search?q={query.replace(' ', '+')}"
            f"&hl=en&gl=us&tbm=nws&tbs=cdr:1,cd_min:{start.strftime('%m/%d/%Y')},cd_max:{end.strftime('%m/%d/%Y')}&start={start_idx}"
        )

        try:
            driver.get(query_url)
            time.sleep(random.uniform(3, 6))
            html = driver.page_source
        except Exception as e:
            print(f"❌ Timeout loading page {page + 1} for {coin}: {e}")
            break

        soup = BeautifulSoup(html, "html.parser")
        articles = soup.select("a.WlydOe")

        if not articles:
            print(f"⚠️ Blocked or no articles on page {page + 1} — skipping.")
            break

        for a in articles:
            title = a.get_text(strip=True)
            link = a.get("href")
            if title and link:
                headlines.append({
                    "date": start.strftime("%Y-%m-%d"),
                    "headline": title,
                    "coin": coin
                })

        time.sleep(random.uniform(2, 4))

    driver.quit()
    print(f"   ➤ {len(headlines)} headlines found.")
    return headlines

# ───── Run for All Coins and Weeks ───── #
current = START_DATE
while current <= END_DATE:
    week_end = min(current + WEEK_DELTA - timedelta(days=1), END_DATE)
    for coin in COINS:
        try:
            weekly = search_week(coin, current, week_end)
            RESULTS_ALL.extend(weekly)
        except Exception as e:
            print(f"❌ Error on {coin} {current.date()} → {e}")
        time.sleep(random.uniform(1, 3))
    current += WEEK_DELTA

# ───── Save Results ───── #
df = pd.DataFrame(RESULTS_ALL)
df.to_csv("google_news_crypto_headlines_weekly_Jan_to_May_2025.csv", index=False)
print("✅ Saved to google_news_crypto_headlines_weekly_Jan_to_May_2025.csv")