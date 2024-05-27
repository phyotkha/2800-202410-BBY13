const mongoose = require("mongoose");
const Student = require("./schemas/students");
const Courses = require("./schemas/courses");
const Instructors = require("./schemas/instructors");
const Events = require("./schemas/events");
require("dotenv").config();

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
// const Instructor = require('./schemas/instructors');
// Assuming you have a Student model

// Connection URI
const uri = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/?retryWrites=true&w=majority&appName=Cluster0`;

// Connect to MongoDB
mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to MongoDB");

    // Delete all collections
    return mongoose.connection.db.dropDatabase();
  })
  .then(async () => {
    console.log("All collections deleted");

        // Insert default data
        const defaultStudents = require('./defaultData/students.json'); // Load default data from JSON file
        const defaultCourses = require("./defaultData/courses.json");
        const defaultInstructors = require('./defaultData/instructors.json');
        const defaultEvents = require("./defaultData/events.json");

        await Student.insertMany(defaultStudents); // Insert default data using Mongoose model
        await Courses.insertMany(defaultCourses);
        await Instructors.insertMany(defaultInstructors);
        await Events.insertMany(defaultEvents);
        return true;

    })
    .then(() => {
        console.log('Default data inserted');
        mongoose.connection.close(); // Close the connection
    })
    .catch(error => {
        console.error('Error resetting database:', error);
    });

