import json
from openai import AsyncOpenAI
from config import openai_api_key, SAMPLE_OUTPUT

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
