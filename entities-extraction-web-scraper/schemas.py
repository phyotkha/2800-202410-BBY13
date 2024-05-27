from pydantic import BaseModel, Field

class WebPageContent(BaseModel):
    section: str
    subsections: list[dict] = Field(..., description="List of subsections with titles and URLs")

# Example schema usage
example_schema = WebPageContent(
    section="Example Section",
    subsections=[
        {"title": "Subsection 1", "url": "https://example.com/1"},
        {"title": "Subsection 2", "url": "https://example.com/2"}
    ]
)
