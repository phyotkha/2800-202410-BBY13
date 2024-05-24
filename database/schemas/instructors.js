// Using Node.js `require()`
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const instructorsSchema = new Schema({
  insructorId: String,
  first_name: String,
  last_name: String,
  email: String,
  department: String,
  courses: [{ courseId: String }]
});

const InstructorModel = mongoose.model('instructors', instructorsSchema);

module.exports = InstructorModel;

