import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GUARDIAN_API_KEY")

params = {
    "q": "finance INR USD",
    "api-key": API_KEY,
    "show-fields": "all",  # Optional: to get more details like body, images, etc.
    "page-size": 10        # Optional: number of results per page
}

response = requests.get("https://content.guardianapis.com/search", params=params)
data = response.json()
# print(data)

# Accessing data
status = data['response']['status']
total_results = data['response']['total']
articles = data['response']['results']

print(f"Status: {status}")
print(f"Total results: {total_results}")

# Looping through articles
for article in articles:
    article_id = article['id']
    article_title = article['webTitle']
    article_url = article['webUrl']
    print(f"  ID: {article_id}")
    print(f"  Title: {article_title}")
    print(f"  URL: {article_url}")

    # Accessing fields within an article
    headline = article['fields']['headline']
    print(f"  Headline: {headline}")