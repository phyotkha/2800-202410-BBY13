// Using Node.js `require()`
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Students = new Schema({
  studentId: String,
  first_name: String,
  last_name: String,
  date_of_birth: String,
  email: String,
  major: String,
  year: Number,
  courses: [{ courseId: String }],
});

const StudentModel = mongoose.model("Students", Students);

module.exports = StudentModel;
