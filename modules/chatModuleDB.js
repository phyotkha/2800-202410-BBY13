const axios = require('axios');
const {MongoClient} = require('mongodb');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require("dotenv").config();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const systemMessage = `
You are a very intelligent AI assistant who is an expert in identifying relevant questions from users
and converting them into NoSQL MongoDB aggregation pipeline queries.
Note: You have to just return the query to use in the aggregation pipeline, nothing else. Don't return any other text.
Please use the below schema to write the MongoDB queries, don't use any other queries.

Schemas:
Events Collection:
- Id: Unique identifier for the event document.
- Subject: Subject of the event.
- StartTime: Start time of the event.
- EndTime: End time of the event.
- departmentId: Identifier for the department associated with the event.
- instructorId: Identifier for the instructor associated with the event.

Instructors Collection:
- instructorId: Unique identifier for the instructor document.
- first_name: First name of the instructor.
- last_name: Last name of the instructor.
- email: Email address of the instructor.
- department: Department of the instructor.
- courses: Array of objects containing courseId of the courses taught by the instructor.

Students Collection:
- studentId: Unique identifier for the student document.
- first_name: First name of the student.
- last_name: Last name of the student.
- date_of_birth: Date of birth of the student.
- email: Email address of the student.
- major: Major field of study.
- year: Year of study.
- courses: Array of objects containing courseId of the courses the student is enrolled in.

**Courses Collection Schema:**
- courseId: Unique identifier for the course (e.g., "COMP 1113").
- Subject: The subject or title of the course.
- School: The school offering the course.
- Program: The program to which the course belongs.
- CourseCredit: Number of credits for the course.
- MinimumPassingGrade: Minimum grade required to pass the course.
- TotalHours: Total number of hours for the course.
- TotalWeeks: Total number of weeks for the course.
- HoursPerWeek: Number of hours per week for the course.
- DeliveryType: Method of course delivery (e.g., Lecture).
- Prerequisites: Prerequisites for the course.
- description: Description of the course.
- instructorId: ID of the instructor teaching the course.
- courseStart: Start date of the course.
- courseEnd: End date of the course.
- courseTime: Array of objects specifying course days and times.
- location: Location where the course is held.
- departmentId: ID of the department offering the course.

Note: You have to just return the query, nothing else. Don't return any additional text with the query.
`;

// Database Connection
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(
      `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/test?retryWrites=true&w=majority&appName=Cluster0`
    );
    console.log("MongoDB Connected!");
  }
}

function addDollarSigns(query) {
  return query.replace(/"(\$match|\$group|\$project|\$lookup|\$sum|\$avg|\$max|\$min)"/g, '"$1"');
}

// Takes user input query string as input ('query') and attempts to determine the MongoDB collection name associated with the query.
function getCollectionName(query) {
  if (/students?/.test(query)) return "students";
  if (/courses?/.test(query)) return "courses";
  if (/instructor?/.test(query)) return "instructors";
  if (/courseInstructor(View)?/.test(query)) return "courseInstructor";
  return null;
}



const sampleFilePath = path.join(__dirname, 'sample.txt');
let sample;
try {
  sample = fs.readFileSync(sampleFilePath, 'utf-8');
} catch (err) {
  console.error('Error reading sample.txt:', err);
}

async function handleChatPage(session, res) {
  if (!session.chatHistory) {
    session.chatHistory = [];
  }
  const { chatHistory, firstname } = session;
  res.render('chatPage', { chatHistory, firstname });
}

async function executeQueryAndSendResponse(inputText, res) {
  try {
    await connectDB(); // Ensure the database is connected

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo-0125",
      messages: [
        { role: "system", content: systemMessage },
        {
          role: "user",
          content: `Generate a MongoDB aggregation pipeline query based on the following input: User question: '${inputText}', Sample: '${sample}'. Ensure the output is a valid JSON object with double quotes around keys and values.`
        }
      ],
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const rawResponseContent = response.data.choices[0].message.content.trim();
    const responseText = addDollarSigns(rawResponseContent);

    let query;
    try {
      query = JSON.parse(responseText);
    } catch (e) {
      return res.status(500).json({ error: "JSON decoding error", details: e.message });
    }

    const collectionName = getCollectionName(inputText);
    if (!collectionName) {
      return res.status(400).json({ error: "Could not determine the collection name from the query." });
    }

    const collection = mongoose.connection.db.collection(collectionName);

    const results = await collection.aggregate(query).toArray();

    if (results.length > 0) {
      const responseObject = {
        chatHistory: [
          ...req.session.chatHistory,
          { role: 'user', content: inputText },
          { role: 'bot', content: JSON.stringify(results) }
        ]
      };
      res.json(responseObject);
    } else {
      res.json({ message: "No results found." });
    }
  } catch (e) {
    res.status(500).json({ error: "An error occurred", details: e.message });
  }
}

module.exports = {
  handleChatPage,
  executeQueryAndSendResponse,
};



// function initializeChatHistory(session) {
//   if (!session.chatHistory) {
//     session.chatHistory = [];
//   }
// }

// async function handleChatPage(session, res) {
//   initializeChatHistory(session);
//   const { chatHistory, firstname } = session;
//   res.render('chatPage', { chatHistory, firstname });
// }

// async function handleChatPost(session, req, res) {
//   const userMessage = req.body.message;
//   const firstname = session.firstname;

//   initializeChatHistory(session);

//   session.chatHistory.push({ role: 'user', content: userMessage });

//   try {
//     const response = await axios.post('https://api.openai.com/v1/chat/completions', {
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: userMessage }],
//     }, {
//       headers: {
//         'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     const botMessage = response.data.choices[0].message.content;

//     session.chatHistory.push({ role: 'bot', content: botMessage });

//     res.render('chatPage', { chatHistory: session.chatHistory, firstname });

//   } catch (error) {
//     console.error('Error calling ChatGPT API:', error.response ? error.response.data : error.message);
//     res.status(500).send('Error communicating with ChatGPT API');
//   }
// }

// const username = "username";
// const pwd = "password";
// const client = new MongoClient(`mongodb+srv://${username}:${encodeURIComponent(pwd)}@cluster0.58jhzag.mongodb.net/`);
// const dbName = "test";
// let db;

// async function connectDB() {
//   await client.connect();
//   db = client.db(dbName);
//   console.log("Connected to MongoDB");
// }