import os
import requests
from dotenv import load_dotenv
import json
import google.generativeai as genai

load_dotenv()

# API Keys and Model Setup
API_KEY = os.getenv("GUARDIAN_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")  # Ensure you have this in your .env
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")  # Or use "gemini-1.5-pro-latest"

# Guardian API Setup
BASE_URL = "https://content.guardianapis.com/search"


def get_guardian_articles(query):
    """Fetches articles from The Guardian API."""
    params = {
        "api-key": API_KEY,
        "q": query,
        "format": "json",
        "show-fields": "headline,webUrl,bodyText",
        "page-size": 50,
    }
    try:
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()
        return data.get("response", {}).get("results", [])
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {e}")
        return []


def is_relevant(article_text):
    """Uses Gemini to determine if an article is relevant to INR/USD."""
    prompt = f"""
    You are an expert financial analyst.  Determine if the following news article 
    is specifically relevant to (INR) or (USD) currency exchange rates, 
    country related to (INR) or  country related to (USD) financial policy, or the economies of respective currencies's countries. 
    Respond with 'yes' or 'no'.

    Article Text:
    {article_text}
    """
    try:
        response = model.generate_content(prompt)
        return "yes" in response.text.lower()  # Check if "yes" is in the response
    except Exception as e:
        print(f"LLM error: {e}")  # Handle potential LLM errors
        return False  # Default to False on error


def filter_articles(articles):
    """Filters articles using the LLM."""
    relevant_articles = []
    for article in articles:
        body_text = article["fields"].get("bodyText", "")
        if is_relevant(body_text):
            relevant_articles.append(article)
            print(f"Article '{article['fields']['headline']}' is RELEVANT.")
        else:
            print(f"Article '{article['fields']['headline']}' is NOT relevant.")
    return relevant_articles


def print_articles(articles):
    """Prints the filtered articles."""
    if not articles:
        print("No relevant articles found.")
        return

    print("\nRelevant Articles:")
    for article in articles:
        print(f"  Title: {article['fields']['headline']}")
        print(f"  URL: {article['webUrl']}")


# Main Execution
if __name__ == "__main__":
    search_query = "Finance News"  # Broad query
    print(search_query)
    articles = get_guardian_articles(search_query)
    relevant_articles = filter_articles(articles)
    print_articles(relevant_articles)