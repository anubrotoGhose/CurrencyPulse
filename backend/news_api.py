from newsapi import NewsApiClient
from dotenv import load_dotenv
load_dotenv()
import os
# Init
newsapi = NewsApiClient(api_key=os.getenv('NEWS_API_KEY'))

# Get top headlines with specific sources (without category or country)
top_headlines = newsapi.get_top_headlines(q='India',
                                          sources='Business Insider',
                                          language='en')


print("top headlines = ", top_headlines, "\n\n")

# /v2/everything
all_articles = newsapi.get_everything(q='India',
                                      sources='bbc-news,the-verge',
                                      domains='bbc.co.uk,techcrunch.com',
                                      from_param='2025-03-24',
                                      to='2025-03-25',
                                      language='en',
                                      sort_by='relevancy',
                                      page=1)

print("all arcticles = ", all_articles, "\n\n")

# if all_articles['totalResults'] > 0:
#     article = all_articles['articles'][0]  # Access the first article
#     print("Article:", article)
# else:
#     print("No articles found.")

# /v2/top-headlines/sources
sources = newsapi.get_sources()
print(type(sources))
print(sources)