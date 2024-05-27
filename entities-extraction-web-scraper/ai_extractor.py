import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder

load_dotenv()

openai_api_key = os.getenv('OPENAI_API_KEY')

# Initialize the updated ChatOpenAI from langchain-openai
llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0613", openai_api_key=openai_api_key)

def truncate_string(input_string: str, max_length: int = 1024) -> str:
    """
    Truncates a string to the maximum allowed length.
    """
    print(f"Truncating string to {max_length} characters")
    return input_string if len(input_string) <= max_length else input_string[:max_length]

def truncate_schema_descriptions(schema: BaseModel):
    """
    Truncate all descriptions in the schema to ensure they are within the allowed length.
    """
    print("Truncating schema descriptions")
    if schema.__doc__:
        schema.__doc__ = truncate_string(schema.__doc__)
    for field in schema.__fields__.values():
        if field.field_info.description:
            field.field_info.description = truncate_string(field.field_info.description)
    return schema

def extract(content: str, **kwargs):
    """
    The `extract` function takes in a string `content` and additional keyword arguments,
    and returns the extracted data based on the provided schema.
    """
    if 'schema_pydantic' in kwargs:
        # Truncate the content to ensure it is within the allowed limits
        truncated_content = truncate_string(content, max_length=4096)

        # Ensure the schema description is within the allowed length
        schema_pydantic = truncate_schema_descriptions(kwargs["schema_pydantic"])

        # Set up the PydanticOutputParser
        parser = PydanticOutputParser(pydantic_object=schema_pydantic)

        # Create the prompt template
        format_instructions = parser.get_format_instructions().replace("{", "{{").replace("}", "}}")
        messages = [
            SystemMessagePromptTemplate.from_template("Extract information from the following content."),
            SystemMessagePromptTemplate.from_template(format_instructions),
            HumanMessagePromptTemplate.from_template("{inputText}")
        ]
        prompt = ChatPromptTemplate(
            messages=messages,
            input_variables=["inputText"]
        )

        # Create the chain
        chain = prompt | llm | parser

        # Invoke the chain with the truncated content
        response = chain.invoke({"inputText": truncated_content})

        return response

    else:
        raise ValueError("No valid schema provided for extraction.")
