require("dotenv").config();
const mongoose = require("mongoose");
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
mongoose
  .connect(
    `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => console.log("Connected!"));

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