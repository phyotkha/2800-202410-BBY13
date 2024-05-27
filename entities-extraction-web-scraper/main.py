import asyncio
import requests
import json
import os
from dotenv import load_dotenv
import openai

# Load environment variables from .env file
load_dotenv()

# Define the URL to scrape
url_to_scrape = "https://www.bcit.ca/study/programs/applied-natural-sciences"

# OpenAI API key from environment variable
openai_api_key = os.getenv("OPENAI_API_KEY")
openai.api_key = openai_api_key

async def fetch_content(url):
    # Prepend the URL with Jina AI Reader prefix
    reader_url = f"https://r.jina.ai/{url}"
    response = requests.get(reader_url)
    if response.status_code == 200:
        try:
            return response.json()
        except json.JSONDecodeError:
            # Handle non-JSON response by processing text
            print("Received response is not in JSON format.")
            return response.text
    else:
        response.raise_for_status()

async def process_with_gpt(content):
    # Send content to GPT model for processing
    prompt = (
        "You are given the following content fetched from a webpage. "
        "Please format it into JSONL format where each line is a JSON object with relevant data:\n\n"
        f"{content}\n\n"
        "Return the content as JSONL format."
    )

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=2048,
        n=1,
        stop=None,
        temperature=0.5,
    )

    return response['choices'][0]['message']['content']

if __name__ == "__main__":
    try:
        # Fetch the content from the webpage
        content = asyncio.run(fetch_content(url_to_scrape))

        # Process the content with GPT
        if content:
            gpt_response = asyncio.run(process_with_gpt(content))
            with open('output.jsonl', 'w') as f:
                f.write(gpt_response)
            print("Content fetched and saved to output.jsonl")
        else:
            print("Failed to fetch content.")
    except Exception as e:
        print(f"An error occurred: {e}")
