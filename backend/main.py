from fastapi import FastAPI, Request
from pydantic import BaseModel
import httpx
from bs4 import BeautifulSoup
import requests
from fastapi.middleware.cors import CORSMiddleware
# importing os module for environment variables
import os
# importing necessary functions from dotenv library
from dotenv import load_dotenv, dotenv_values 
# loading variables from .env file
load_dotenv() 
from langchain_tavily import TavilySearch
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_react_agent
from langchain.prompts import PromptTemplate
from langchain_core.runnables import Runnable
tavily_api_key = os.getenv("TAVILY_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama.llms import OllamaLLM
import google.generativeai as genai
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],  # Or specify ["POST", "GET"] etc.
    allow_headers=["*"],
)

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

class CurrencyRequest(BaseModel):
    from_currency: str
    to_currency: str

def get_conversion_rate(from_currency, to_currency):
    EXCHANGE_RATE_API_KEY = os.getenv("EXCHANGE_RATE_API_KEY")
    url = f"https://v6.exchangerate-api.com/v6/{EXCHANGE_RATE_API_KEY}/latest/{from_currency.upper()}"

    try:
        response = requests.get(url)
        data = response.json()

        if data["result"] == "success":
            rate = data["conversion_rates"].get(to_currency.upper())
            if rate:
                return {
                    "conversion_rate": rate
                }
            else:
                return {"conversion_rate": f"No rate found for {to_currency}"}
        else:
            return {"conversion_rate": "Rate not found"}
    except Exception as e:
        return {"conversion_rate": "Error: " + str(e)}

# def get_currency_news(from_currency, to_currency):
    # tavily_search_tool = TavilySearch(
    #     max_results=3,  # Limit the results for quicker response
    #     topic="general",  # General search topic, you can change to "finance" if needed
    # )
    
    # # llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3, max_tokens=300, openai_api_key=os.getenv("OPENAI_API_KEY"))

    # llm = OllamaLLM(model="llama3.2:latest")
    
    # # Fetch currency exchange news using TavilySearch
    # news_results = tavily_search_tool.invoke(
    #     {"query": f"latest news {from_currency} to {to_currency} currency exchange"}
    # )
    
    # # Extract news articles
    # news_articles = []
    # for result in news_results.get('results', []):
    #     news_articles.append(f"{result.get('title', '')}: {result.get('content', '')}")
    
    # news_content = "\n".join(news_articles)
    
    # # Create a prompt template that doesn't rely on agent_scratchpad
    # prompt = PromptTemplate(
    #     input_variables=["from_currency", "to_currency", "news_content"],
    #     template="""
    #     You are an assistant that summarizes the latest news about currency exchange rates.
        
    #     Here are the latest news articles about the exchange rate between {from_currency} and {to_currency}:
    #     {news_content}
        
    #     Please summarize these articles in a concise and informative way.
    #     """
    # )
    
    # # Create a simple chain instead of an agent
    # chain = prompt | llm
    
    # # Run the chain with the appropriate inputs
    # result = chain.invoke({
    #     "from_currency": from_currency,
    #     "to_currency": to_currency,
    #     "news_content": news_content
    # })
    
    # return result    
    # return ["News"]

def get_currency_news(from_currency, to_currency):
    tavily_search_tool = TavilySearch(
        max_results=3,  # Limit the results for quicker response
        topic="finance",  # General search topic, you can change to "finance" if needed
    )
    
    query = f"latest news on {from_currency} to {to_currency} currency exchange"
    search_results = tavily_search_tool.run(
        tool_input={
            "query": query,
            "max_results": 10
        }
    )

    # Step 2: Extract relevant content
    news_articles = []
    for result in search_results.get("results", []):
        title = result.get("title", "")
        content = result.get("content", "")
        url = result.get("url", "")
        article = f"{title}: {content} (Source: {url})"
        
        # Only add non-empty articles
        if article.strip():  # Ensure article is not just empty space
            news_articles.append(article)

    if not news_articles:
        return ["No recent news found."]

    # Step 3: Summarize using Gemini (google.generativeai)
    prompt = f"""
    Summarize the following news articles about currency exchange between {from_currency} and {to_currency}:
    And separate each paragraph or line with  \n
    {"".join(news_articles)}
    """

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)

    # Step 4: Return the summary as a list of strings
    summary_text = response.text.strip()
    return summary_text.split("\n")  # Split into lines for frontend display

@app.post("/get-currency-info")
def get_currency_info(req: CurrencyRequest):
    rate_info = get_conversion_rate(req.from_currency, req.to_currency)
    news = get_currency_news(req.from_currency, req.to_currency)  # if you have a news function
    return {"conversion_rate": rate_info["conversion_rate"], "news": news}

