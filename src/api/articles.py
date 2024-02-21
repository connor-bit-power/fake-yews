from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from bs4 import BeautifulSoup
import re
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

def get_article_titles(url):
    response = requests.get(url)
    titles_data = []

    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        article_containers = soup.select('div.whole-body')
        
        for container in article_containers:
            article_title_tag = container.find('div', class_='bulletin-text')
            article_title = article_title_tag.get_text(strip=True) if article_title_tag else "No title found"
            titles_data.append(article_title)
    else:
        print(f"Failed to retrieve content: {response.status_code}")
    
    return titles_data

# New function to get article details
def get_article_details(url):
    response = requests.get(url)
    articles_data = []

    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')

        # Selecting containers with article titles
        title_containers = soup.select('div.whole-body > div.bulletin-text')

        for title_container in title_containers:
            # Extracting the article title
            article_title = title_container.get_text(strip=True) if title_container else None

            # Finding the corresponding body text container
            body_container = title_container.find_parent('div', class_='whole-body').find_next_sibling('div', class_='expand')
            body_text = None

            if body_container:
                body_text_tag = body_container.find('h5')
                body_text = body_text_tag.get_text(strip=True) if body_text_tag else None

            articles_data.append({
                'Title': article_title,
                'Details': body_text
            })
    else:
        print(f"Failed to retrieve content: {response.status_code}")
    
    return articles_data

# Helper function to sanitize URL into a filename
def url_to_filename(url):
    # Split the URL by slashes and take the last part
    last_part = url.split('/')[-1]
    
    # Remove query parameters if any
    last_part = last_part.split('?')[0]

    # Keep only alphanumeric characters and dashes
    filename = re.sub(r'[^a-zA-Z0-9\-]', '_', last_part)
    
    # Append ".txt" extension
    filename = filename + ".txt"

    return filename

# Existing endpoint to get article titles
@app.get("/get-article-titles/")
async def read_item(url: str):
    titles = get_article_titles(url)
    return {"titles": titles}

# Updated endpoint to get article details and save to a file
@app.get("/get-yews-data/")
async def read_yews_data(url: str):
    articles = get_article_details(url)
    
    # Generate filename from URL
    filename = url_to_filename(url)
    # Path handling for filename
    filepath = os.path.join(os.getcwd(), filename)

    try:
        # Save the articles to a text file
        with open(filepath, 'w') as file:
            for article in articles:
                file.write(f"Title: {article['Title']}\nDetails: {article['Details']}\n\n")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

    return {"articles": articles, "file_saved": filepath}
