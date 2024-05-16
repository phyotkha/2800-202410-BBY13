import streamlit as st
from pymongo import MongoClient
import urllib, io, json
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage

# Initialize the OpenAI chat model
llm = ChatOpenAI(model="gpt-4", temperature=0.0)

# MongoDB client
username = "ronidas"
pwd = "YFR85HiZLgqFtbPW"
client = MongoClient("mongodb+srv://" + urllib.parse.quote(username) + ":" + urllib.parse.quote(pwd) + "@cluster0.lymvb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["sample_airbnb"]
collection = db["listingsAndReviews"]

st.title("Talk to MongoDB")
st.write("Ask anything and get an answer")
input_text = st.text_area("Enter your question here")

with io.open("sample.txt", "r", encoding="utf-8") as f1:
    sample = f1.read()

# Define the prompt template
prompt_template = ChatPromptTemplate.from_messages([
    SystemMessage(content="""
        You are a very intelligent AI assistant who is an expert in identifying relevant questions from users
        and converting them into NoSQL MongoDB aggregation pipeline queries.
        Note: You have to just return the query to use in the aggregation pipeline, nothing else. Don't return any other text.
        Please use the below schema to write the MongoDB queries, don't use any other queries.
        Here’s a breakdown of the schema with descriptions for each field:

        (schema details here)

        Use the below sample examples to generate your queries perfectly.
        Sample question: {sample}
        As an expert, you must use them whenever required.
        Note: You have to just return the query, nothing else. Don't return any additional text with the query.
        Please follow this strictly.
    """),
    HumanMessage(content="Input: {question}\nSample: {sample}")
])

# Chain the prompt and the model
chain = prompt_template | llm

if input_text:
    button = st.button("Submit")
    if button:
        response = chain.invoke({
            "question": input_text,
            "sample": sample
        })
        
        # Debug the response content
        st.write("Raw response content:", response.content)
        
        try:
            query = json.loads(response.content)
            results = collection.aggregate(query)
            st.write("Generated Query:", query)
            for result in results:
                st.write(result)
        except json.JSONDecodeError as e:
            st.error(f"JSON decoding error: {e}")

