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

# Read the sample data from sample.txt
with io.open("sample.txt", "r", encoding="utf-8") as f1:
    sample = f1.read()

# Debugging: print the input question and sample
st.write("Debug: Input question:", input_text)
st.write("Debug: Sample data:", sample)

# Define the prompt template
prompt_template = ChatPromptTemplate.from_messages([
    SystemMessage(content="""
        You are an AI assistant who generates MongoDB aggregation pipeline queries based on user questions.
        Please return only the query in JSON format. Do not include any additional text.
        
        Example:
        Sample question: {sample}
        User question: {question}
        Return the MongoDB query in JSON format:
    """),
    HumanMessage(content="{question}")
])

# Chain the prompt and the model
chain = prompt_template | llm

if input_text:
    if st.button("Submit"):
        st.write("Debug: Submitting question and sample to model...")
        debug_input = {
            "question": input_text,
            "sample": sample
        }
        st.write("Debug: Input to model:", debug_input)

        response = chain.invoke({
            "question": input_text,
            "sample": sample
        })

        # Debug the response content
        st.write("Raw response content:", response.content)
        
        # Extract the JSON part of the response
        response_text = response.content.strip()
        try:
            query = json.loads(response_text)
            results = collection.aggregate(query)
            st.write("Generated Query:", query)
            for result in results:
                st.write(result)
        except json.JSONDecodeError as e:
            st.error(f"JSON decoding error: {e}")
