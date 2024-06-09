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
CHECKPOINT_FILE = "checkpoint.txt"

SAMPLE_OUTPUT = """
{"text": "{\"section\": \"About BCIT\", \"subsections\": [{\"title\": \"Visit Us\", \"url\": \"https://www.bcit.ca/about/visit/\"}, {\"title\": \"Our Schools\", \"url\": \"https://www.bcit.ca/about/schools/\"}, {\"title\": \"Community\", \"url\": \"https://www.bcit.ca/community/\"}, {\"title\": \"Leadership & Vision\", \"url\": \"https://www.bcit.ca/about/leadership-vision/\"}, {\"title\": \"News & Events\", \"url\": \"https://www.bcit.ca/news-events/\"}, {\"title\": \"Careers at BCIT\", \"url\": \"https://www.bcit.ca/careers/\"}]}"}
"""

async def fetch_content(url):
    # Prepend the URL with Jina AI Reader prefix
    reader_url = f"https://r.jina.ai/{url}"
    response = requests.get(reader_url)
    if response.status_code == 200:
        return response.text
    else:
        print(f"Failed to fetch content from {url} with status code {response.status_code}")
        return None

def split_content(content, max_length=2000):
    """
    Splits the content into smaller chunks to fit within the token limit.
    """
    content_chunks = []
    while len(content) > max_length:
        split_index = content.rfind(' ', 0, max_length)
        if split_index == -1:
            split_index = max_length
        content_chunks.append(content[:split_index])
        content = content[split_index:]
    content_chunks.append(content)
    return content_chunks

async def process_with_gpt(content, url):
    client = AsyncOpenAI(api_key=openai_api_key)

    # Send content to GPT model for processing
    messages = [
        {"role": "system", "content": (
            "You are a helpful assistant. Here is a sample output to follow for formatting the content:\n"
            f"{SAMPLE_OUTPUT}\n\n"
            "Now, please format the following content fetched from a webpage into a valid JSON object with relevant data. "
            "Ensure there are no extraneous characters and the output is valid JSON. Use consistent field names as shown in the sample.\n\n"
            f"{content}\n\n"
            "Return the content as a JSON object without wrapping it in additional text or quotes."
        )}
    ]

    response = await client.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        messages=messages,
        max_tokens=2048,
        temperature=0.0,  # Set temperature to 0.0 for consistent responses
    )

    gpt_output = response.choices[0].message.content.strip()

    # Print the raw output for debugging
    # print(f"Raw GPT output for {url}:\n{gpt_output}\n")

    # Check if the response starts with a valid JSON character
    if gpt_output.startswith('{') or gpt_output.startswith('['):
        try:
            json_object = json.loads(gpt_output)
            return json_object
        except json.JSONDecodeError:
            print(f"Failed to parse JSON object in GPT response for {url}:\n{gpt_output}")
            return None
    else:
        print(f"Invalid JSON format in GPT response for {url}:\n{gpt_output}")
        return None

async def scrape_batch(urls):
    results = []
    for url in urls:
        start_time = time.time()
        content = await fetch_content(url)
        if content:
            max_retries = 3
            for attempt in range(max_retries):
                gpt_response = await process_with_gpt(content, url)
                if gpt_response:
                    wrapped_response = {"text": gpt_response}
                    results.append(wrapped_response)
                    end_time = time.time()
                    print(f"Successfully scraped {url} in {end_time - start_time:.2f} seconds.")
                    # Save the checkpoint
                    with open(CHECKPOINT_FILE, 'a') as f:
                        f.write(url + '\n')
                    break
                else:
                    print(f"Retry {attempt + 1} for {url}")
            else:
                print(f"Failed to wrap GPT response for {url} after {max_retries} attempts")
        else:
            print(f"Failed to fetch content from {url}")
    return results

def load_checkpoint():
    if os.path.exists(CHECKPOINT_FILE):
        with open(CHECKPOINT_FILE, 'r') as f:
            processed_urls = set(f.read().splitlines())
    else:
        processed_urls = set()
    return processed_urls

def clear_checkpoints_if_output_deleted():
    if not os.path.exists('output.jsonl'):
        if os.path.exists(CHECKPOINT_FILE):
            os.remove(CHECKPOINT_FILE)
            print("Checkpoint file deleted because output file does not exist. Starting fresh.")
        else:
            print("Output file does not exist, but no checkpoint file found. Starting fresh.")

def main():
    # Clear checkpoints if output.jsonl is deleted
    clear_checkpoints_if_output_deleted()

    # Load URLs from file
    with open('urls_list.txt', 'r') as file:
        urls = file.read().splitlines()

    processed_urls = load_checkpoint()
    urls_to_process = [url for url in urls if url not in processed_urls]
    total_urls = len(urls_to_process)
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
