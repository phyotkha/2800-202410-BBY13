import streamlit as st
from pymongo import MongoClient
import urllib, io, json
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage

# Initialize the OpenAI chat model
llm = ChatOpenAI(model="gpt-4", temperature=0.0)

# MongoDB client
username = "dingzq0807"
pwd = "ZS6a7BYUmFUay0mO"
client = MongoClient("mongodb+srv://" + urllib.parse.quote(username) + ":" + urllib.parse.quote(pwd) + "@cluster0.lymvb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["test"]
collection = db["students"]

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
        You are a very intelligent AI assistant who is an expert in identifying relevant questions from users
        and converting them into NoSQL MongoDB aggregation pipeline queries.
        Note: You have to just return the query to use in the aggregation pipeline, nothing else. Don't return any other text.
        Please use the below schema to write the MongoDB queries, don't use any other queries.
        Here’s a breakdown of the schema with descriptions for each field:

        Schemas
        Students Collection:

        _id: Unique identifier for the student document.
        studentId: Unique student ID.
        first_name: First name of the student.
        last_name: Last name of the student.
        date_of_birth: Date of birth of the student.
        email: Email address of the student.
        major: Major field of study.
        year: Year of study.
        courses: Array of course IDs that the student is enrolled in.
        Courses Collection:

        CourseID: Unique course ID.
        Title: Title of the course.
        School: School offering the course.
        Program: Program to which the course belongs.
        CourseCredit: Number of credits for the course.
        MinimumPassingGrade: Minimum grade required to pass the course.
        TotalHours: Total number of hours for the course.
        TotalWeeks: Total number of weeks for the course.
        HoursPerWeek: Number of hours per week for the course.
        DeliveryType: Delivery method of the course.
        Prerequisites: Prerequisites for the course.
        description: Description of the course.
        instructorId: ID of the instructor teaching the course.
        Instructors Collection:

        _id: Unique identifier for the instructor document.
        instructorId: Unique instructor ID.
        first_name: First name of the instructor.
        last_name: Last name of the instructor.
        email: Email address of the instructor.
        department: Department of the instructor.
        courses: Array of objects containing CourseID and Title of the courses taught by the instructor.
        office: Office location of the instructor.
        officeHrs: Office hours of the instructor.
        otherContact: Other contact information for the instructor.
        CourseInstructor View:

        instructorId: ID of the instructor.
        CourseId: ID of the course.
        CRN: Course Registration Number.
        courseStart: Start date of the course.
        courseEnd: End date of the course.
        location: Location where the course is held.

        Use the below sample examples to generate your queries perfectly.
        {sample}
                  
        As an expert, you must use them whenever required.
        Note: You have to just return the query, nothing else. Don't return any additional text with the query.
        Please follow this strictly.
        input:{question}
         output:
    """),
    HumanMessage(content="Generate a MongoDB aggregation pipeline query based on the following input: User question: '{question}', Sample: '{sample}'. Ensure the output is a valid JSON object with double quotes around keys and values.")
])

# Chain the prompt and the model
chain = prompt_template | llm

if input_text:
    if st.button("Submit"):
        st.write("Debug: Submitting question and sample to model...")
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


