// Using Node.js `require()`
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const coursesSchema = new mongoose.Schema({
  courseId: String,
  Subject: String,
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
  instructorId: Number,
  courseStart: Date,
  courseEnd: Date,
  courseTime: [{ courseDay: String, courseSHour: String, courseEHour: String }],
  location: String,
  StartTime: Date,
  EndTime: Date,
  RecurrenceRule: String,
  CategoryColor: String,
  departmentId: Number
});

const CoursesModel = mongoose.model("courses", coursesSchema);

module.exports = CoursesModel;
