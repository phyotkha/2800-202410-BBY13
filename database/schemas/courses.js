// Using Node.js `require()`
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const coursesSchema = new mongoose.Schema({
    CourseID: String,
    Title: String,
    School: String,
    Program: String,
    CourseCredit: Number,
    MinimumPassingGrade: String,
    TotalHours: Number,
    TotalWeeks: Number,
    HoursPerWeek: Number,
    DeliveryType: String,
    Prerequisites: String,
    description: String,
});

module.export = mongoose.model("courses", coursesSchema);

module.exports = coursesSchema;

