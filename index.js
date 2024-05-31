require("./utils.js");
require("dotenv").config();

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

const { registerLicense } = require('@syncfusion/ej2-base');
const studentsRouter = require("./database/routers/students");
const instructorRouter = require("./database/routers/routerInstructor");
const eventRouter = require("./database/routers/events.js");
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
const courseModel = require("./database/schemas/courses.js")
const eventModel = require("./database/schemas/events.js");
const availableTimesModel = require("./database/schemas/availableTimes.js");

// Navigation links array
const navLinks = [
  { name: "Chat", link: "/chatPage" },
  { name: "Calendar", link: "/calendar" },
  { name: "Account", link: "/profile" },
];

/** 
 * Middleware Setup
 */
app.set("view engine", "ejs"); //Setting view engine to EJS
app.use(express.urlencoded({ extended: false })); // To parse URL-encoded bodies
app.use(express.json());

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
  var username = req.session.username;
  if (username) {
    res.render("homePage");
    return;
  } 
  else {
    res.render("startingPage");
    return;
  }

});

app.get("/signup", (req, res) => {
  const error = req.query.error;
  res.render("signup", { error: error });
});

app.post("/signupSubmit", async (req, res) => {
  const { firstname, lastname, studentid, major, email, password } = req.body;

  const schema = Joi.object({
    firstname: Joi.string().alphanum().max(20).required(),
    lastname: Joi.string().alphanum().max(20).required(),
    studentid: Joi.string().alphanum().max(20).required(),
    major: Joi.string().max(20),
    email: Joi.string().max(40).required(),
    password: Joi.string().max(20).required(),
  });

  const validationResult = schema.validate(req.body);
  // console.log("Valid inputs", validationResult); // For debugging

  if (validationResult.error != null) {
    res.redirect(`/signup?error=1`);
    return;
    // console.log("Signup Error", validationResult.error); // For debugging
  }

  var hashedPassword = await bcrypt.hash(password, saltRounds);

  // Insert user data into the database
  await userCollection.insertOne({
    studentId: studentid,
    first_name: firstname,
    last_name: lastname,
    email: email,
    major: major,
    password: hashedPassword,
  });

  req.session.authenticated = true;
  req.session.studentid = studentid;
  req.session.firstname = firstname;
  req.session.lastname = lastname;
  req.session.major = major;
  req.session.email = email;
  req.session.cookie.maxAge = expireTime;
  res.redirect("/chatPage");
});

app.get("/login", (req, res) => {
  const invalidPassword = req.query.invalidpassword;
  const invalidUser = req.query.invaliduser;
  const validationError = req.query.validationerror;

  res.render("login", {
    invaliduser: invalidUser,
    invalidpassword: invalidPassword,
    validationerror: validationError
  });
});

app.post("/loginSubmit", async (req, res) => {
  const { email, password } = req.body;

  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().max(20).required()
  });

  // Validate input data
  const validationError = schema.validate(req.body);
  // console.log(validationError); // For Debugging

  if (validationError.error != null) {
    return res.redirect("/login?validationerror=1");
    // console.log(validationResult.error); // For Debugging
  }

  const userData = await userCollection.findOne({ email });
  if (!userData) {
    return res.redirect("/login?invaliduser=1");
  }

  var isValidPassword = await bcrypt.compare(password, userData.password);
  if (isValidPassword) {
    // console.log(userData); // For Debugging
    req.session.authenticated = true;
    req.session.email = email;
    req.session.firstname = userData.first_name;
    req.session.lastname = userData.last_name;
    req.session.studentid = userData.studentId;
    req.session.major = userData.major;
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
  chatModuleDB.chatbotInteraction(req, res);
});

const { bookAppointment, bookAppointmentSubmit,} = require('./modules/bookAppointment');
app.get('/bookAppointment', bookAppointment);
app.post('/bookAppointmentSubmit', bookAppointmentSubmit);


// Route to handle logout
app.get("/logout", async (req, res) => {
  req.session.destroy(); // Destory Session
  // console.log("Session Destroyed (User logged out)"); 
  res.redirect("/");
});

/* Password Reset Routes */
app.get('/resetPasswordRequest', (req, res) => {
  const emailSent = req.query.emailsent;
  const invalidUser = req.query.invaliduser;
  const invalidToken = req.query.invalidtoken;
  res.render('resetPasswordRequest', {  emailsent: emailSent, invaliduser: invalidUser, invalidtoken: invalidToken});
});

/**
 * Generate a unique token and mailed to user's email address. 
 * Generated by ChatGPT 3.5 
 * 
 * @author https://chat.openai.com/
 * @author BBY-13
 */
const crypto = require("crypto");
const nodemailer = require("nodemailer");

app.post("/sendResetLink", async (req, res) => {
  const { email } = req.body;

  const user = await userCollection.findOne({ email: email });
  if (!user) {
    return res.redirect("/resetPasswordRequest?invaliduser=1")
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expireTime = Date.now() + 1 * 60 * 60 * 1000;; // Expires in 1 hour

  await userCollection.updateOne(
    { email: email },
    { $set: { resetPasswordToken: token, resetPasswordExpires: expireTime } }
  );

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailMessage = {
    to: email,
    from: process.env.EMAIL,
    subject: "Password Reset",
    text:
      `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
      `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
      `http://${req.headers.host}/resetPassword/${token}\n\n` +
      `If you did not request this, please ignore this email and your password will remain unchanged. The link will expire in one hour.\n` +
      `\n\n © 2024 SchoolScope AI, Inc`,
  };

  transporter.sendMail(mailMessage, (err, info) => {
    if (err) {
      // console.error(err); // For Debugging 
      return res.render('resetPasswordRequest', { message: 'Error sending email. Try Again!' });
    } else {
      // console.log('Email sent: ' + info.response); // For Debugging
      return res.redirect('/resetPasswordRequest?emailsent=1');
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
    return res.redirect("/resetPasswordRequest?invalidtoken=1");
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
app.get('/profile', sessionValidation, async (req, res) => {
  const firstname = req.session.firstname;
  const lastname = req.session.lastname;
  const studentid = req.session.studentid;
  const major = req.session.major;
  const email = req.session.email;

  res.render("userProfile", {
    firstName: firstname,
    lastName: lastname,
    studentId: studentid,
    major: major,
    emailAddress: email
  });
})

app.post('/updateProfile', sessionValidation, async (req, res) => {
  const { firstname, lastname, studentid, major, email } = req.body;
  const user = await userCollection.findOne({ email: email });

  await userCollection.updateOne({ email: user.email }, {
    $set: {
      studentId: studentid,
      first_name: firstname,
      last_name: lastname,
      email: email,
      major: major
    }
  });
  req.session.studentid = studentid;
  req.session.firstname = firstname;
  req.session.lastname = lastname;
  req.session.major = major;
  req.session.email = email;
  res.redirect("/profile");
});

app.get('/calendar', sessionValidation, async (req, res) => {
  res.render("calendar", {
    ESSENTIAL_STUDIO_KEY: process.env.ESSENTIAL_STUDIO_KEY,
  });
});

app.get("/events", async (req, res) => {
  try {
    const events = await eventModel.find();
    res.json(events);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/courses", async (req, res) => {
  try {
    const courses = await courseModel.find();
    res.json(courses);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.get('/available-times', async (req, res) => {
  try {
    const availableTimes = await availableTimesModel.find();
    res.json(availableTimes);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Students router
app.use("/students", studentsRouter);
app.use("/instructors", instructorRouter);
app.use("/events", eventRouter)


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


