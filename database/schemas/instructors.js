// Using Node.js `require()`
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Instructors = new Schema({
    id: ObjectId,
    insructorId: String,
    first_name: String,
    last_name: String,
    email: String,
    department: String,
    courses: [{ CourseID: String, Title: String, }],
    office: String,
    officeHrs: String,
    otherContact: String
});

const InstructorModel = mongoose.model('Instructors', Instructors);

module.exports = InstructorModel;

