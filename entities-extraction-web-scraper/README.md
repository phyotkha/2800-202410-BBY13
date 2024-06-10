# Scrape the Web with entities extraction using OpenAI Function

requirement.txt for the version and packages is needed for this project

output.jsonl for the properly formatted dataset which is the output from this project

parse_urls.py for parsing alll list of urls from the web page

urls_list.txt store all urls that we need to scrape

checkpoint.txt store what pages have we scrapped before, and which step of web page we terminated.

## Setup

### 1. Create a new Python virtual environment

`python -m venv virtual-env` or `python3 -m venv virtual-env` (Mac)

`py -m venv virtual-env` (Windows 11)

### 2. Activate virtual environment

In this prject: 
`source web_scraper/bin/activate`

`.\virtual-env\Scripts\activate` (Windows)

`source virtual-env/bin/activate` (Mac)

### 3. Install dependencies using Poetry

Run `poetry install --sync` or `poetry install`

### 4. Install playwright

```bash
playwright install
```

### 5. Create a new `.env` file to store OpenAI's API key

```text
OPENAI_API_KEY=XXXXXX
```

## Usage

### Run locally

```poetry run python main.py```

## Additional Information

- Add onto this a FastAPI server to serve this as an API endpoint for ease of use.

- Use caution when scraping. Don't do anything I wouldn't do (illegal)

- P.S I've added this functionality to LangChain [in this PR](https://github.com/langchain-ai/langchain/pull/8732). You can read [the official docs here.](https://python.langchain.com/docs/use_cases/web_scraping#quickstart)
