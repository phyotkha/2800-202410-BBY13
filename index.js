require("./utils.js");
require("dotenv").config();
const { registerLicense } = require('@syncfusion/ej2-base');

/**
 * Imported Modules
 */
const url = require("url");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const app = express();
const Joi = require("joi");
const bcrypt = require("bcrypt");
const axios = require("axios");

const studentsRouter = require("./database/routers/students");
const instructorRouter = require("./database/routers/routerInstructor")
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

const licenseKey = process.env.ESSENTIAL_STUDIO_KEY;
registerLicense('licenseKey');

/**
 * Database Connection
 */
var { database } = include("./scripts/databaseConnection");
const userCollection = database.db(mongodb_database).collection("students");


// Navigation links array
const navLinks = [
  { name: "Chat", link: "/chatPage" },
  { name: "Calendar", link: "/calendar" },
  { name: "Account", link: "/profile" },
  { name: "About Us", link: "/aboutus" }
];

/** 
 * Middleware Setup
 */
app.set("view engine", "ejs"); //Setting view engine to EJS
app.use(express.urlencoded({ extended: false })); // To parse URL-encoded bodies

//Middleware so we don't need to add these navlinks/url params into everything.
//This add navigation links and current URL to local variables.
app.use("/", (req, res, next) => {
  app.locals.navLinks = navLinks;
  app.locals.currentURL = url.parse(req.url).pathname;
  res.locals.licenseKey = licenseKey;
  next();
});

// MongoDB session store configuration
var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
  crypto: {
    secret: mongodb_session_secret,
  },
});

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
 * Middlewares for session validation and admin authorization
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

/**
 * Start of Route Definitons
 */
app.get("/", async (req, res) => {
  res.render("startingPage");
});

app.get("/signup", (req, res) => {
  const error = req.query.error;
  res.render("signup", { error: error });
});

app.get("/login", (req, res) => {
  const invalidPassword = req.query.invalidpassword;
  const invalidUser = req.query.invaliduser;

  res.render("login", {
    invaliduser: invalidUser,
    invalidpassword: invalidPassword,
  });
});

app.post("/signupSubmit", async (req, res) => {
  const { firstname, lastname, studentid, dateofbirth, username, major, email, password } = req.body;

  const schema = Joi.object({
    firstname: Joi.string().alphanum().max(20).required(),
    lastname: Joi.string().alphanum().max(20).required(),
    studentid: Joi.string().alphanum().max(20).required(),
    dateofbirth: Joi.date(),
    username: Joi.string().alphanum().max(20).required(),
    major: Joi.string().max(20),
    email: Joi.string().max(40).required(),
    password: Joi.string().max(20).required(),
  });

  const validationResult = schema.validate(req.body);
  console.log("Valid inputs");

  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.render("signupErr", {
      error: validationResult.error.details[0].message,
    });
    return;
  }

  var hashedPassword = await bcrypt.hash(password, saltRounds);

  // Insert user data into the database
  await userCollection.insertOne({
    studentId: studentid,
    first_name: firstname,
    last_name: lastname,
    username: username,
    email: email,
    date_of_birth: dateofbirth,
    major: major,
    password: hashedPassword,
  });

  req.session.authenticated = true;
  req.session.studentid = studentid;
  req.session.firstname = firstname;
  req.session.lastname = lastname;
  req.session.username = username;
  req.session.email = email;
  req.session.dateofbirth = dateofbirth
  req.session.cookie.maxAge = expireTime;
  res.redirect("/chatPage");
});

// Route to handle login form submission
app.post("/loginSubmit", async (req, res) => {
  const { email, password } = req.body;

  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().max(20).required(),
  });

  // Validate input data
  const validationResult = schema.validate(req.body);
  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.render("login_error", {
      error: validationResult.error.details[0].message,
    });
  }

  // Check for matching email in database
  const userData = await userCollection.findOne({ email });
  if (!userData) {
    return res.redirect("/login?invaliduser=1");
  }

  var isValidPassword = await bcrypt.compare(password, userData.password);
  if (isValidPassword) {
    console.log(userData);
    req.session.authenticated = true;
    req.session.email = email;
    req.session.studentid = userData.studentId;
    req.session.firstname = userData.first_name;
    req.session.lastname = userData.last_name;
    req.session.username = userData.username;
    req.session.cookie.maxAge = expireTime;
    return res.redirect("/chatPage");
  } else {
    return res.redirect("/login?invalidpassword=1");
  }
});

// ChatBot Connection with Database
const chatModuleDB = require('./modules/chatModuleDB');

app.get('/chatPage', sessionValidation, (req, res) => {
  chatModuleDB.handleChatPage(req.session, res);
});

app.post('/chat', sessionValidation, (req, res) => {
  chatModuleDB.messagingWithChatbot(req, res);
});

// ------------------------------------------------------------------

// Route to handle logout
app.get("/logout", async (req, res) => {
  req.session.destroy(); // Destory Session
  console.log("Session Destroyed (User logged out)");
  res.redirect("/");
});

/* Password Reset Routes */
// ----------------------------------------------------------------------------------------------------
app.get('/resetPasswordRequest', (req, res) => {
  const invalidUser = req.query.invaliduser;
  res.render('resetPasswordRequest', { invaliduser: invalidUser });
});

const crypto = require("crypto");
const nodemailer = require("nodemailer");

app.post("/sendResetLink", async (req, res) => {
  const { email } = req.body;

  // Find user by email in the database
  const user = await userCollection.findOne({ email: email });
  if (!user) {
    // to change!!!
    return res.redirect("/resetPasswordRequest?invaliduser=1")
  }

  // Generate a unique token and set expiration time for the token
  const token = crypto.randomBytes(32).toString("hex");
  const expireTime = Date.now() + 3600000; // Expires in 1 hour

  // Update user document in the database with the token and expiration time
  await userCollection.updateOne(
    { email: email },
    { $set: { resetPasswordToken: token, resetPasswordExpires: expireTime } }
  );

  // Set up email transporter using nodemailer
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Compose email with password reset link.
  const mailMessage = {
    to: email,
    from: process.env.EMAIL,
    subject: "Password Reset",
    text:
      `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
      `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
      `http://${req.headers.host}/resetPassword/${token}\n\n` +
      `If you did not request this, please ignore this email and your password will remain unchanged. The link will expire in one hour.\n`,
  };

  // Send the email to user
  transporter.sendMail(mailMessage, (err, info) => {
    if (err) {
      console.error(err);
      res.render('resetPasswordRequest', { message: 'Error sending email. Try Again!' });
    } else {
      console.log('Email sent: ' + info.response);
      res.redirect('/resetPasswordRequest');
    }
  });
});

app.get("/resetPassword/:token", async (req, res) => {
  const { token } = req.params;

  const user = await userCollection.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.render('resetPasswordInvalidToken');
  }

  res.render('resetPassword', { token: token });
});

app.post("/resetPassword", async (req, res) => {
  const { token, password } = req.body;

  const user = await userCollection.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.render('resetPasswordInvalidToken');
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  await userCollection.updateOne(
    { email: user.email },
    {
      $set: { password: hashedPassword },
      $unset: { resetPasswordToken: "", resetPasswordExpires: "" },
    }
  );

  res.redirect("/login");
});
// ---------------------------------------------------------------------------------------------------- //

/* Profile Routes */
// ---------------------------------------------------------------------------------------------------- 
app.get('/profile', sessionValidation, async (req, res) => {
  const studentid = req.session.studentid;
  const firstname = req.session.firstname;
  const lastname = req.session.lastname;
  const username = req.session.username;
  const email = req.session.email;
  res.render("userProfile", {
    studentId: studentid,
    firstName: firstname,
    lastName: lastname,
    userName: username,
    emailAddress: email
  });
})

app.post('/updateProfile', sessionValidation, async (req, res) => {
  const { studentid, firstname, lastname, username, email } = req.body;
  const user = await userCollection.findOne({ username: username });

  await userCollection.updateOne({ username: user.username }, {
    $set: {
      studentId: studentid,
      first_name: firstname,
      last_name: lastname,
      username: username,
      email: email
    }
  });
  req.session.studentid = studentid;
  req.session.firstname = firstname;
  req.session.lastname = lastname;
  req.session.username = username;
  req.session.email = email;
  res.redirect("/profile");
});
// ---------------------------------------------------------------------------------------------------- //

app.get('/calendar', sessionValidation, async (req, res) => {
  res.render("calendar");
});

app.get('/chatPage', sessionValidation, async (req, res) => {
  res.render("chatPage");
});

// Students router
app.use("/students", studentsRouter);
app.use("/instructors", instructorRouter);


/**
 * Error 404
 */
app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

/**
 * Server
 */
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


