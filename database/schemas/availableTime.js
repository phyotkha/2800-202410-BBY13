const express = require('express');
const mongoose = require('mongoose');
// const cors = require('cors');
// const CoursesModel = require('./CoursesModel');  // 引入 CoursesModel

const app = express();



mongoose.connect('mongodb://localhost:27017/scheduleDB', { useNewUrlParser: true, useUnifiedTopology: true });

const availableTimesSchema = new mongoose.Schema({
    Id: Number,
    Subject: { type: String, default: 'Available' },
    StartTime: Date,
    EndTime: Date,
    CategoryColor: String,
    RecurrenceRule: String
});

const AvailableTimesModel = mongoose.model("availableTimes", availableTimesSchema);
module.exports = AvailableTimesModel;
