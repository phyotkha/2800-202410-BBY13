import asyncio
import json
import time
from utils import fetch_content, load_checkpoint, save_checkpoint, clear_checkpoints_if_output_deleted
from gpt_processor import process_with_gpt
from config import BATCH_SIZE

def main():
    # Clear checkpoints if output.jsonl is deleted
    clear_checkpoints_if_output_deleted()

    # Load URLs from file
    with open('urls_list.txt', 'r') as file:
        urls = file.read().splitlines()

    processed_urls = load_checkpoint()
    print(f"Processed URLs: {len(processed_urls)}")

    urls_to_process = [url for url in urls if url not in processed_urls]
    total_urls = len(urls_to_process)
    print(f"Total URLs to process: {total_urls}")

    # Process URLs in batches
    for i in range(0, total_urls, BATCH_SIZE):
        batch_urls = urls_to_process[i:i + BATCH_SIZE]
        print(f"Processing batch {i//BATCH_SIZE + 1}/{(total_urls + BATCH_SIZE - 1) // BATCH_SIZE}")

        results = asyncio.run(scrape_batch(batch_urls))

        # Save results to a file, appending to the existing file
        output_file = 'output.jsonl'
        with open(output_file, 'a') as f:
            for result in results:
                f.write(json.dumps(result) + "\n")

        print(f"Batch {i//BATCH_SIZE + 1} processed and appended to {output_file}")

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
                    save_checkpoint(url)
                    break
                else:
                    print(f"Retry {attempt + 1} for {url}")
            else:
                print(f"Failed to wrap GPT response for {url} after {max_retries} attempts")
        else:
            print(f"Failed to fetch content from {url}")
    return results

if __name__ == "__main__":
    main()
