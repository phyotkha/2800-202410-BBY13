import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# OpenAI API key from environment variable
openai_api_key = os.getenv("OPENAI_API_KEY")

# Define the batch size
BATCH_SIZE = 5

SAMPLE_OUTPUT = """
{"text": "{\"section\": \"About BCIT\", \"subsections\": [{\"title\": \"Visit Us\", \"url\": \"https://www.bcit.ca/about/visit/\"}, {\"title\": \"Our Schools\", \"url\": \"https://www.bcit.ca/about/schools/\"}, {\"title\": \"Community\", \"url\": \"https://www.bcit.ca/community/\"}, {\"title\": \"Leadership & Vision\", \"url\": \"https://www.bcit.ca/about/leadership-vision/\"}, {\"title\": \"News & Events\", \"url\": \"https://www.bcit.ca/news-events/\"}, {\"title\": \"Careers at BCIT\", \"url\": \"https://www.bcit.ca/careers/\"}]}"}
"""
