from pydantic import BaseModel, Field

ecommerce_schema = {
    "properties": {
        "item_title": {"type": "string"},
        "item_price": {"type": "number"},
        "item_extra_info": {"type": "string"}
    },
    "required": ["item_title", "item_price", "item_extra_info"],
}


class SchemaNewsWebsites(BaseModel):
    """
    Schema for news websites, including the title, summary, and extra info.
    """
    news_article_title: str = Field(..., description="The title of the news article")
    news_article_summary: str = Field(..., description="A brief summary of the news article")
    news_article_extra_info: str = Field(..., description="Additional information about the news article")

    url: str
    title: str
    # news_headline: str
    # news_short_summary: str


    class Config:
        arbitrary_types_allowed = True
