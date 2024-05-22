const mongoose = require('mongoose');
require('./schemas/students');
require('./schemas/courses');
// require('./schemas/chat');

require("dotenv").config();
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
mongoose
    .connect(
        `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/?retryWrites=true&w=majority&appName=Cluster0`
    )
    .then(() => console.log("MongoDB Connected!"));