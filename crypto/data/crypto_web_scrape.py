import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import csv
import time

# === CONFIG ===
OUTPUT_CSV = "xmr_news_last_year.csv"
FROM_DATE = datetime.now() - timedelta(days=365)
TO_DATE   = datetime.now()

SITES = [
    ("CoinDesk",      "https://www.coindesk.com/tag/monero/"),
    ("CoinTelegraph", "https://cointelegraph.com/tags/monero"),
    ("Decrypt",       "https://decrypt.co/tag/monero/"),
    ("NewsBTC",       "https://www.newsbtc.com/tag/monero/"),
    ("CryptoNews",    "https://cryptonews.com/tags/monero/"),
    ("U.Today",       "https://u.today/tags/monero"),
    ("AMBCrypto",     "https://ambcrypto.com/tag/monero/")
]

def fetch_coindesk():
    url = "https://www.coindesk.com/tag/monero/"
    resp = requests.get(url, timeout=10)
    soup = BeautifulSoup(resp.content, "html.parser")
    for a in soup.select("a.card-title"):
        title = a.get_text(strip=True)
        if "monero" in title.lower() or "xmr" in title.lower():
            yield {"date": datetime.now().strftime("%Y-%m-%d"), "title": title, "source": "CoinDesk"}

def fetch_cointelegraph():
    url = "https://cointelegraph.com/tags/monero"
    resp = requests.get(url, timeout=10)
    soup = BeautifulSoup(resp.content, "html.parser")
    for a in soup.select("li.posts-listing__item h2 a"):
        title = a.get_text(strip=True)
        if "monero" in title.lower() or "xmr" in title.lower():
            yield {"date": datetime.now().strftime("%Y-%m-%d"), "title": title, "source": "CoinTelegraph"}

def fetch_decrypt():
    url = "https://decrypt.co/tag/monero"
    resp = requests.get(url, timeout=10)
    soup = BeautifulSoup(resp.content, "html.parser")
    for a in soup.select("h3 a"):
        title = a.get_text(strip=True)
        if "monero" in title.lower() or "xmr" in title.lower():
            yield {"date": datetime.now().strftime("%Y-%m-%d"), "title": title, "source": "Decrypt"}

def fetch_generic(site_name, url):
    resp = requests.get(url, timeout=10)
    soup = BeautifulSoup(resp.content, "html.parser")
    for a in soup.select("h2 a, h3 a"):
        title = a.get_text(strip=True)
        if "monero" in title.lower() or "xmr" in title.lower():
            yield {"date": datetime.now().strftime("%Y-%m-%d"), "title": title, "source": site_name}

# === SCRAPE & COLLECT ===
all_articles = []

for site_name, url in SITES:
    try:
        print(f"Scraping {site_name}…")
        if site_name == "CoinDesk":
            all_articles.extend(fetch_coindesk())
        elif site_name == "CoinTelegraph":
            all_articles.extend(fetch_cointelegraph())
        elif site_name == "Decrypt":
            all_articles.extend(fetch_decrypt())
        else:
            all_articles.extend(fetch_generic(site_name, url))
    except Exception as e:
        print(f"⚠️ {site_name} error: {e}")
    time.sleep(1.0)

# === WRITE CSV ===
with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["date", "title", "source"])
    for art in all_articles:
        writer.writerow([art["date"], art["title"], art["source"]])

print(f"✅ Done! Saved to {OUTPUT_CSV} with {len(all_articles)} total XMR articles")
