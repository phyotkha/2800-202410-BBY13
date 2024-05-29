const axios = require('axios');
const InstructorModel = require('./models/instructors');
const express = require('express');
const session = require('express-session');
const { createEvent, getEvents } = require("./services/events");
const { getAvailableTimes } = require("./services/availableTimes");

const systemMessage = `
You are an intelligent AI assistant. Your task is to help users book appointments with instructors. 
Based on the user input, extract the instructor's name, requested start time, and requested end time.
If any information is missing, ask the user for the missing details.
`;

async function handleChatPage(req, res) {
  if (!req.session.chatHistory) {
    req.session.chatHistory = [];
  }
  const { chatHistory, firstname } = req.session;
  res.render('chatPage', { chatHistory, firstname });
}

async function parseUserInput(userInput) {
  const response = await axios.post('https://api.openai.com/v1/completions', {
    model: "text-davinci-002",
    prompt: `Extract the instructor's name, requested start time, and requested end time from the following user input: "${userInput}". Return the information in JSON format.`,
    max_tokens: 150,
    temperature: 0.7,
    n: 1,
    stop: null
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  return JSON.parse(response.data.choices[0].text.trim());
}

async function executeQueryAndSendResponse(req, res) {
  const userInput = req.body.message;

  try {
    const { instructorName, requestedStartTime, requestedEndTime } = await parseUserInput(userInput);

    if (!instructorName || !requestedStartTime || !requestedEndTime) {
      req.session.chatHistory.push({ role: 'bot', content: "Missing required information. Please provide the instructor's name, requested start time, and requested end time." });
      return res.redirect('/chat');
    }

    const instructor = await InstructorModel.findOne({ first_name: instructorName.split(' ')[0], last_name: instructorName.split(' ')[1] });
    
    if (!instructor) {
      req.session.chatHistory.push({ role: 'bot', content: "Instructor not found." });
      return res.redirect('/chat');
    }

    const { _id: instructorId, department: departmentId } = instructor;

    const appointmentResponse = await axios.post('http://localhost:3000/book-appointment', {
      instructorId,
      requestedStartTime,
      requestedEndTime,
      Subject: `Appointment with ${instructorName}`,
      departmentId
    });

    req.session.chatHistory.push({ role: 'bot', content: `Appointment successfully booked with ${instructorName} on ${requestedStartTime}.` });
    return res.redirect('/chat');

  } catch (error) {
    req.session.chatHistory.push({ role: 'bot', content: `Error: ${error.message}` });
    return res.redirect('/chat');
  }
}

module.exports = {
  handleChatPage,
  executeQueryAndSendResponse,
};
