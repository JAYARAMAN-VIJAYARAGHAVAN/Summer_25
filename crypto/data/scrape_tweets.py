import snscrape.modules.twitter as sntwitter
import certifi

# Test SSL connectivity
scraper = sntwitter.TwitterSearchScraper("BTC")
try:
    for tweet in scraper.get_items():
        print(tweet.content)
        break  # Stop after first tweet
except Exception as e:
    print(f"Failed: {e}")
