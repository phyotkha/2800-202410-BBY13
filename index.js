require("./utils.js");
require("dotenv").config();

/**
 * Imported Modules
 */
const url = require('url');
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const app = express();
const Joi = require("joi");
const bcrypt = require("bcrypt");

const saltRounds = 12; //Number of rounds for bcrypt hashing

/**
 * Port Configuraton
 */
const port = process.env.PORT || 8000; 

/**
 * Session Expire Time - 1 hour (hours * mins * secs * ms)
 */
const expireTime = 1 * 60 * 60 * 1000;

/**
 * Environment Variables 
 */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET; 

/**
 * Database Connection
 */
var { database } = include("./scripts/databaseConnection");
const userCollection = database.db(mongodb_database).collection("users");


// Navigation links array
const navLinks = [
    { name: "Program & Courses", link: "/p&g" },
    { name: "Admission", link: "/admission" },
    { name: "Student Services", link: "/stu" },
    { name: "Logout", link: "/logout" }
];

/**
 * Middleware Setup
 */
app.set('view engine', 'ejs'); //Setting view engine to EJS
app.use(express.urlencoded({ extended: false })); // To parse URL-encoded bodies


//Middleware so we don't need to add these navlinks/url params into everything.
//This add navigation links and current URL to local variables.
app.use("/", (req, res, next) => {
    app.locals.navLinks = navLinks;
    app.locals.currentURL = url.parse(req.url).pathname;
    next();
})

// MongoDB session store configuration
var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
    crypto: {
        secret: mongodb_session_secret,
    },
})

//Session middleware setup
app.use(
    session({
        secret: node_session_secret,
        store: mongoStore,
        saveUninitialized: false,
        resave: true,
    })
);

app.use(express.static(__dirname + "/public")); // Serve static files from the "public" directory

/**
 * Middlewares to validate session and admin authorization
 */
function isValidSession(req) {
    if (req.session.authenticated) {
        return true;
    }
    return false;
}

function sessionValidation(req, res, next) {
    if (isValidSession(req)) {
        next();
    }
    else {
        res.redirect('/login');
    }
}

function isAdmin(req) {
    if (req.session.user_role == 'admin') {
        return true;
    }
    return false;
}

function adminAuthorization(req, res, next) {
    if (!isAdmin(req)) {
        res.status(403);
        res.render("errorMessage", { error: "Not Authorized" });
        return;
    }
    else {
        next();
    }
}

/**
 * Route Definitions
 */

// Route to demonstrate NoSQL injection prevention
app.get("/nosql-injection", async (req, res) => {
    var username = req.query.user;

    if (!username) {
        res.send(
            `<h3>no user provided - try /nosql-injection?user=name</h3> <h3>or /nosql-injection?user[$ne]=name</h3>`
        );
        return;
    }
    console.log("user: " + username);

    // use Joi to validate and check for valid inputs, and nothing unwanted
    const schema = Joi.string().max(20).required();
    const validationResult = schema.validate(username);

    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.redirect("/login");
        return;
    }

    // 
    const result = await userCollection
        .find({ username: username })
        .project({ username: 1, _id: 1 })
        .toArray();
    console.log(result);

    res.send(`<h1>Hello ${username}</h1>`);
});

// Route to render home page
app.get('/', (req, res) => {
    res.render("homepage");
})

// Route to render signup page
app.get("/signup", (req, res) => {
    res.render("signup");
    return;
});

// Route to render login page
app.get("/login", (req, res) => {
    res.render("login");
    return;
});

// Route to handle signup form submission
app.post("/signupSubmit", async (req, res) => {
    const {username, email, password} = req.body;

    const schema = Joi.object({
        username: Joi.string().alphanum().max(20).required(),
        email: Joi.string().max(40).required(),
        password: Joi.string().max(20).required(),
    });

    const validationResult = schema.validate(req.body);
    console.log('Valid inputs');
    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.render("signupErr", { error: validationResult.error.details[0].message });
        return;
    }

    // Hash the password
    var hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user data into the database
    await userCollection.insertOne({
        username: username,
        email: email,
        password: hashedPassword,
        user_role: "student" 
    });
    console.log("User Inserted to Database (New user created).");
    req.session.authenticated = true;
    req.session.username = username;
    req.session.user_role = "user";
    req.session.cookie.maxAge = expireTime;
    res.redirect('/members');
    return;
});

// Route to handle login form submission
app.post("/loginSubmit", async (req, res) => {
    const {email, password} = req.body;

    const schema = Joi.object({
        username: Joi.string().username().required(),
        password: Joi.string().max(20).required(),
    });

    // Validate input data
    const validationResult = schema.validate(req.body);
    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.render("loginErr", { error: validationResult.error.details[0].message });
        return;
    }

    // Check for matching email in database
    const userData = await userCollection.findOne({ email });
    if (!userData) {
        console.log("Email not found");
        res.render("notregis");
        return;
    }

    var isValidPassword = await bcrypt.compare(password, userData.password);
    if (isValidPassword) {
        console.log(userData);
        req.session.authenticated = true;
        req.session.username = userData.username;
        req.session.user_role = userData.user_role;
        req.session.cookie.maxAge = expireTime;
        res.redirect('/members');
        return;
    } else {
        console.log("Incorrect password");
        res.render("incorrectpw");
        return;
    }
});

// Route to handle logout
app.get("/logout", async (req, res) => {
    req.session.destroy(); // Destory Session
    console.log("Session Destroyed (User logged out)");
    res.redirect("/");
});

/**
 * Server
 */
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})

/* YERIN'S CODE (TO BE REVIEWED - DATABASE RELATED)
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
*/