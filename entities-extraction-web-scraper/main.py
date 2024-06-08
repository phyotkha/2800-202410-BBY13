import asyncio
import requests
import json
import os
import time
from dotenv import load_dotenv
from openai import AsyncOpenAI

# Load environment variables from .env file
load_dotenv()

# OpenAI API key from environment variable
openai_api_key = os.getenv("OPENAI_API_KEY")

# Define the batch size
BATCH_SIZE = 5

async def fetch_content(url):
    # Prepend the URL with Jina AI Reader prefix
    reader_url = f"https://r.jina.ai/{url}"
    response = requests.get(reader_url)
    if response.status_code == 200:
        try:
            return response.json()
        except json.JSONDecodeError:
            # Handle non-JSON response by processing text
            print(f"Received response from {url} is not in JSON format.")
            return response.text
    else:
        print(f"Failed to fetch content from {url}")
        response.raise_for_status()

async def process_with_gpt(content):
    client = AsyncOpenAI(api_key=openai_api_key)

    # Send content to GPT model for processing
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": (
            "You are given the following content fetched from a webpage. "
            "Please format it into a valid JSON object with relevant data. "
            "Ensure there are no extraneous characters and the output is valid JSON.\n\n"
            f"{content}\n\n"
            "Return the content as a JSON object."
        )}
    ]

    response = await client.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        messages=messages,
        max_tokens=2048,
        temperature=0.1,
    )

    gpt_output = response.choices[0].message.content.strip()

    # Remove any unwanted characters and ensure valid JSON
    try:
        json_object = json.loads(gpt_output)
        return json_object
    except json.JSONDecodeError:
        print("Failed to identify valid JSON object in GPT response.")
        return None

async def scrape_batch(urls):
    results = []
    for url in urls:
        start_time = time.time()
        content = await fetch_content(url)
        if content:
            gpt_response = await process_with_gpt(content)
            if gpt_response:
                wrapped_response = {"text": gpt_response}
                results.append(wrapped_response)
                end_time = time.time()
                print(f"Successfully scraped {url} in {end_time - start_time:.2f} seconds.")
            else:
                print(f"Failed to wrap GPT response for {url}")
        else:
            print(f"Failed to fetch content from {url}")
    return results

def main():
    # Load URLs from file
    with open('urls_list.txt', 'r') as file:
        urls = file.read().splitlines()

    total_urls = len(urls)
    print(f"Total URLs to process: {total_urls}")

    # Process URLs in batches
    for i in range(0, total_urls, BATCH_SIZE):
        batch_urls = urls[i:i + BATCH_SIZE]
        print(f"Processing batch {i//BATCH_SIZE + 1}/{(total_urls + BATCH_SIZE - 1) // BATCH_SIZE}")

        results = asyncio.run(scrape_batch(batch_urls))

        # Save results to a file, appending to the existing file
        output_file = 'output.jsonl'
        with open(output_file, 'a') as f:
            for result in results:
                f.write(json.dumps(result) + "\n")

        print(f"Batch {i//BATCH_SIZE + 1} processed and appended to {output_file}")

if __name__ == "__main__":
    main()
