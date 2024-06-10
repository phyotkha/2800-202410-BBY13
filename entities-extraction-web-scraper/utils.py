import os
import requests

CHECKPOINT_FILE = "checkpoint.txt"

async def fetch_content(url):
    # Prepend the URL with Jina AI Reader prefix
    reader_url = f"https://r.jina.ai/{url}"
    response = requests.get(reader_url)
    if response.status_code == 200:
        return response.text
    else:
        print(f"Failed to fetch content from {url} with status code {response.status_code}")
        return None

def load_checkpoint():
    if os.path.exists(CHECKPOINT_FILE):
        with open(CHECKPOINT_FILE, 'r') as f:
            processed_urls = set(f.read().splitlines())
    else:
        processed_urls = set()
    return processed_urls

def save_checkpoint(url):
    with open(CHECKPOINT_FILE, 'a') as f:
        f.write(url + '\n')

def clear_checkpoints_if_output_deleted():
    if not os.path.exists('output.jsonl'):
        if os.path.exists(CHECKPOINT_FILE):
            os.remove(CHECKPOINT_FILE)
            print("Checkpoint file deleted because output file does not exist. Starting fresh.")
        else:
            print("Output file does not exist, but no checkpoint file found. Starting fresh.")
