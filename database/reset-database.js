const mongoose = require('mongoose');
const Student = require('./schemas/students');
// const Instructor = require('./schemas/instructors');
// Assuming you have a Student model

// Connection URI
const uri = 'mongodb+srv://dingzq0807:ZS6a7BYUmFUay0mO@cluster0.58jhzag.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(uri)
    .then(() => {
        console.log('Connected to MongoDB');

        // Delete all collections
        return mongoose.connection.db.dropDatabase();
    })
    .then(async () => {
        console.log('All collections deleted');

        // Insert default data
        const defaultStudents = require('./defaultData/students.json'); // Load default data from JSON file
        // const defaultInstructors = require('./defaultData/instructors.json');
        await Student.insertMany(defaultStudents); // Insert default data using Mongoose model
        //  Instructor.insertMany(defaultInstructors);
        return true

    })
    .then(() => {
        console.log('Default data inserted');
        mongoose.connection.close(); // Close the connection
    })
    .catch(error => {
        console.error('Error resetting database:', error);
    });

