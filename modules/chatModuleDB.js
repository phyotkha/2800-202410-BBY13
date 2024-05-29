require("dotenv").config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

// System Message with Schemas
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

// Add dollar signs to MongoDB aggreagation pipleline stages
function addDollarSigns(query) {
  return query.replace(/"(\$match|\$group|\$project|\$lookup|\$sum|\$avg|\$max|\$min)"/g, '"$1"');
}

// Determine MongoDB collection name based on user query
function getCollectionName(query) {
  if (/(student|enrolled|major)/.test(query)) return "students";
  if (/(course|subject|school|program|credit|grade|hour|week|delivery|prerequisites|description|location)/.test(query)) return "courses";
  if (/(instructor|instructors|first name|last name|email|department|courses taught|teaches|email address)/.test(query)) return "instructors";
  return null;
}

// Read sample file content
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

// Generate natural language response based on user question
async function generateNaturalLanguageResponse(userQuestion, queryResults) {
  const prompt = `User question: "${userQuestion}"
  Query results: ${JSON.stringify(queryResults)}
  Please provide a natural language response based on the query results.`;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo-0125",
      messages: [
        { role: "system", content: "You are an AI assistant that provides natural language responses based on MongoDB query results." },
        { role: "user", content: prompt }
      ],
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const naturalLanguageResponse = response.data.choices[0].message.content.trim();
    return naturalLanguageResponse;
  } catch (error) {
    console.error("Error generating natural language response:", error);
    throw new Error("Failed to generate natural language response");
  }
}

// Handle main interaction with chatbot
async function chatbotInteraction(req, res) {
  const userMessage = req.body.message;
  const firstname = req.session.firstname;

  try {
    await connectDB();
    // console.log("usermessage", userMessage); // For Debugging

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo-0125",
      messages: [
        { role: "system", content: systemMessage },
        {
          role: "user",
          content: `Generate a MongoDB aggregation pipeline query based on the following input: 
          User question: '${userMessage}', Sample: '${sample}'. 
          Ensure the output is a valid JSON object with double quotes around keys and values.`
        }
      ],
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const rawResponse = response.data.choices[0].message.content.trim(); 
    const responseText = addDollarSigns(rawResponse);

    let query;
    try {
      // Parse response text to JSON format (MognoDB query)
      query = JSON.parse(responseText); 
    } catch (e) {
      return res.status(500).json({ error: "JSON decoding error", details: e.message });
    }

    // console.log("query: ", query); // For Debugging

    // Determine MongoDB collection name based on user's message
    const collectionName = getCollectionName(userMessage);

    if (!collectionName) {
      // Default response when collection name cannot be determined
      const defaultResponse = "I am unable to answer any questions outside of the scope of BCIT";
      if (!req.session.chatHistory) {
        req.session.chatHistory = [];
      }
      req.session.chatHistory.push({ role: 'user', content: userMessage });
      req.session.chatHistory.push({ role: 'bot', content: defaultResponse });
      return res.render('chatPage', { chatHistory: req.session.chatHistory, firstname: firstname });
    }

    const collection = mongoose.connection.db.collection(collectionName);

    const results = await collection.aggregate(query).toArray();

    // Generate natural language response based on the user's question and query results
    const naturalLanguageResponse = await generateNaturalLanguageResponse(userMessage, results);

    if (!req.session.chatHistory) {
      req.session.chatHistory = [];
    }

    // Add user message and bot's natural language response to chat history
    req.session.chatHistory.push({ role: 'user', content: userMessage });
    req.session.chatHistory.push({ role: 'bot', content: naturalLanguageResponse });

    res.render('chatPage', { chatHistory: req.session.chatHistory, firstname: firstname });

  } catch (e) {
    res.status(500).json({ error: "Error occurred", details: e.message });
  }
}

// Additional Queries Related to BCIT

// Query to get average hours per week for Computer Systems Technology
const averageHoursQuery = [
  { $match: { Program: 'Computer Systems Technology' } },
  { $group: { _id: null, average_hours_per_week: { $avg: "$HoursPerWeek" } } },
  { $project: { average_hours_per_week: 1, _id: 0 } }
];

// Query to get the total number of courses offered by the School of Computing
const totalCoursesBySchoolQuery = [
  { $match: { School: 'School of Computing' } },
  { $group: { _id: "$School", total_courses: { $sum: 1 } } },
  { $project: { total_courses: 1, _id: 0 } }
];

// Query to get all instructors in program
const instructorsByProgramQuery = [
  { $match: { Program: 'Computer Systems Technology' } },
  {
    $lookup: {
      from: "instructors",
      localField: "instructorId",
      foreignField: "instructorId",
      as: "instructor_details"
    }
  },
  { $unwind: "$instructor_details" },
  { $group: { _id: "$instructor_details.instructorId", first_name: { $first: "$instructor_details.first_name" }, last_name: { $first: "$instructor_details.last_name" }, email: { $first: "$instructor_details.email" } } },
  { $project: { _id: 0, instructorId: "$_id", first_name: 1, last_name: 1, email: 1 } }
];

// Query to get all students enrolled in a specific course
const studentsByCourseQuery = (courseId) => [
  { $match: { courses: { $elemMatch: { courseId: courseId } } } },
  { $project: { _id: 0, studentId: 1, first_name: 1, last_name: 1, email: 1 } }
];

module.exports = {
  handleChatPage,
  chatbotInteraction,
};
