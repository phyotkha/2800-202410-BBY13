require("dotenv").config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const { createEvent } = require('../database/services/events');

const systemMessage = `
You are a very intelligent AI assistant who is an expert in identifying relevant questions from users
and converting them into NoSQL MongoDB aggregation pipeline queries.
Note: You have to just return the query to use in the aggregation pipeline, nothing else. Don't return any other text.
Please use the below schema to write the MongoDB queries, don't use any other queries.

Schemas:
**Events Collection Schema:**
- Id: Unique identifier for the event document.
- Subject: Subject of the event.
- StartTime: Start time of the event.
- EndTime: End time of the event.
- departmentId: Identifier for the department associated with the event.
- instructorId: Identifier for the instructor associated with the event.

**Instructors Collection Schema:**
- instructorId: Unique identifier for the instructor document.
- first_name: First name of the instructor.
- last_name: Last name of the instructor.
- email: Email address of the instructor.
- department: Department of the instructor.
- courses: Array of objects containing courseId of the courses taught by the instructor.

**Students Collection Schema:**
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

**AvailableTimes Collection Schema:**
- Id: Unique identifier for the available time slot document.
- Subject: Subject of the available time slot (default is 'Available').
- StartTime: Start time of the available time slot.
- EndTime: End time of the available time slot.
- CategoryColor: Color category for the time slot.
- RecurrenceRule: Recurrence rule for the time slot.
- departmentId: Identifier for the department associated with the time slot.
- instructorId: Identifier for the instructor associated with the time slot.

Note: You have to just return the query, nothing else. Don't return any additional text with the query.
`;

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(
      `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/test?retryWrites=true&w=majority&appName=Cluster0`
    );
  }
}

function addDollarSigns(query) {
  return query.replace(/"(\$match|\$group|\$project|\$lookup|\$sum|\$avg|\$max|\$min)"/g, '"$1"');
}

function getCollectionName(query) {
  if (/(student|enrolled|major)/.test(query)) return "students";
  if (/(course|subject|school|program|credit|grade|week|delivery|prerequisites|description|location|course outline|start|end|program|week|full name|days)/
    .test(query)) return "courses";
  if (/(instructor|instructors|first name|last name|email|department|courses taught|teaches|email address)/
    .test(query)) return "instructors";
  if (/(book an appointment|available|office hours)/.test(query)) return "availabletimes";
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

/**
 * User interaction with ChatBot
 * Generated by ChatGPT 3.5 
 * 
 * @author https://chat.openai.com/ 
 * @author BBY-13
 */
async function chatbotInteraction(req, res) {
  const userMessage = req.body.message;
  const firstname = req.session.firstname;

  try {
    await connectDB();

    if (/(book an appointment|book me an appointment|make an appointment)/i.test(userMessage)) {
      const userEmail = req.session.email;
      const studentsCollection = mongoose.connection.db.collection('students');
      const user = await studentsCollection.findOne({ email: userEmail });

      if (!user) {
        return res.status(400).json({ error: "User not found in the database" });
      }

      const availableTimesCollection = mongoose.connection.db.collection('availabletimes');
      let availableSlot = await availableTimesCollection.findOne({ Subject: 'Available' });

      // Fallback if no slot found with 'Available' subject
      if (!availableSlot) {
        availableSlot = await availableTimesCollection.findOne({});
      }

      if (!availableSlot) {
        const noSlotsResponse = `
        There are no available time slots at the moment. 
        Click <a href="http://${req.headers.host}/bookAppointment">here</a><br> to book or check for available <a href="http://${req.headers.host}/calendar">times</a>
        `;
        req.session.chatHistory = req.session.chatHistory || [];
        req.session.chatHistory.push({ role: 'user', content: userMessage });
        req.session.chatHistory.push({ role: 'bot', content: noSlotsResponse });
        return res.render('chatPage', { chatHistory: req.session.chatHistory, firstname: firstname });
      }

      await createEvent({
        Subject: `Booked by ${user.first_name} ${user.last_name}`,
        StartTime: availableSlot.StartTime,
        EndTime: availableSlot.EndTime,
        departmentId: availableSlot.departmentId,
        instructorId: availableSlot.instructorId
      });

      const bookedResponse = `Your appointment has been booked successfully for ${availableSlot.StartTime} - ${availableSlot.EndTime}.`;
      req.session.chatHistory = req.session.chatHistory || [];
      req.session.chatHistory.push({ role: 'user', content: userMessage });
      req.session.chatHistory.push({ role: 'bot', content: bookedResponse });
      return res.render('chatPage', { chatHistory: req.session.chatHistory, firstname: firstname });
    }

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
      query = JSON.parse(responseText);
    } catch (e) {
      return res.status(500).json({ error: "JSON decoding error", details: e.message });
    }

    const collectionName = getCollectionName(userMessage);

    if (!collectionName) {
      const defaultResponse = "I am unable to answer any questions outside of the scope of BCIT.";
      req.session.chatHistory = req.session.chatHistory || [];
      req.session.chatHistory.push({ role: 'user', content: userMessage });
      req.session.chatHistory.push({ role: 'bot', content: defaultResponse });
      return res.render('chatPage', { chatHistory: req.session.chatHistory, firstname: firstname });
    }

    const collection = mongoose.connection.db.collection(collectionName);
    const queryResults = await collection.aggregate(query).toArray();

    const naturalLanguageResponse = await generateNaturalLanguageResponse(userMessage, queryResults);

    req.session.chatHistory = req.session.chatHistory || [];
    req.session.chatHistory.push({ role: 'user', content: userMessage });
    req.session.chatHistory.push({ role: 'bot', content: naturalLanguageResponse });

    res.render('chatPage', { chatHistory: req.session.chatHistory, firstname: firstname });

  } catch (e) {
    res.status(500).json({ error: "Error occurred", details: e.message });
  }
}

module.exports = {
  handleChatPage,
  chatbotInteraction,
};
