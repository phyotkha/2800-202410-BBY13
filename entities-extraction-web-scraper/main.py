import asyncio
import requests
import json
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI

# Load environment variables from .env file
load_dotenv()

# Define the URL to scrape
url_to_scrape = "https://www.bcit.ca/study/programs/applied-natural-sciences"

# OpenAI API key from environment variable
openai_api_key = os.getenv("OPENAI_API_KEY")

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
    client = AsyncOpenAI(api_key=openai_api_key)

    # Send content to GPT model for processing
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": (
            "You are given the following content fetched from a webpage. "
            "Please format it into a valid JSONL format where each line is a JSON object with relevant data. "
            "Do not include any extraneous characters such as markdown or code block delimiters. Only return valid JSON objects.\n\n"
            f"{content}\n\n"
            "Return the content as JSONL format."
        )}
    ]

    response = await client.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        messages=messages,
        max_tokens=2048,
        temperature=0.1,
    )

    return response.choices[0].message.content.strip()

def wrap_in_main_bracket(data):
    # Wrap the JSONL data within one main curly bracket
    wrapped_data = {"text": "{" + ', '.join(data.strip().splitlines()) + "}"}
    return wrapped_data

if __name__ == "__main__":
    try:
        # Fetch the content from the webpage
        content = asyncio.run(fetch_content(url_to_scrape))

        # Process the content with GPT
        if content:
            gpt_response = asyncio.run(process_with_gpt(content))
            wrapped_response = wrap_in_main_bracket(gpt_response)
            with open('output.jsonl', 'w') as f:
                f.write(json.dumps(wrapped_response))
            print("Content fetched and saved to output.jsonl")
        else:
            print("Failed to fetch content.")
    except Exception as e:
        print(f"An error occurred: {e}")
