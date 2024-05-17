// Using Node.js `require()`
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Students = new Schema({
    id: ObjectId,
    studentId: String,
    first_name: String,
    last_name: String,
    date_of_birth: String,
    email: String,
    major: String,
    year: Number,
    courses: [{ CourseID: String }]
});

const StudentModel = mongoose.model('Students', Students);

module.exports = StudentModel;

