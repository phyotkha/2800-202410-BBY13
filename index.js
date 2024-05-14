require("./utils.js");

require("dotenv").config();

const url = require('url');
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const app = express();
const port = process.env.PORT || 8000; // short circuits if env defined

const Joi = require("joi");

const bcrypt = require("bcrypt");
const saltRounds = 12;

const expireTime = 1 * 60 * 60 * 1000; // this is set to 1hr (hours * mins * secs * ms)

/* secret info */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET; 
/* secret info end */

var { database } = include("./scripts/databaseConnection");

const userCollection = database.db(mongodb_database).collection("users");

app.set('view engine', 'ejs');

const navLinks = [
    { name: "Program & Courses", link: "/p&g" },
    { name: "Admission", link: "/admission" },
    { name: "Student Services", link: "/stu" },
    { name: "Logout", link: "/logout" }
];

// middleware so we don't need to add these navlinks/url params into everything
app.use("/", (req, res, next) => {
    app.locals.navLinks = navLinks;
    app.locals.currentURL = url.parse(req.url).pathname;
    next();
})

app.use(express.urlencoded({ extended: false }));

var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
    crypto: {
        secret: mongodb_session_secret,
    },
})

app.use(
    session({
        secret: node_session_secret,
        store: mongoStore,
        saveUninitialized: false,
        resave: true,
    })
);

function isValidSession(req) {
    if (req.session.authenticated) {
        return true;
    }
    return false;
}

// middleware 
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

// to prevent nosql injection attacks
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

app.get("/signup", (req, res) => {
    res.render("signup");
    return;
});

//get for quick and easy utility
app.get("/login", (req, res) => {
    res.render("login");
    return;
});

// post used for heavy loads/valuable info
app.post("/signupSubmit", async (req, res) => {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    const schema = Joi.object({
        username: Joi.string().alphanum().max(20).required(),
        email: Joi.string().max(40).required(),
        password: Joi.string().max(20).required(),
    });

    // validating all inputs
    const validationResult = schema.validate(req.body);
    console.log('valid inputs');
    // if any inputs are invalid 
    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.render("signupErr", { error: validationResult.error.details[0].message });
        return;
    }

    // if all inputs valid
    // encrpyt pw
    var hashedPassword = await bcrypt.hash(password, saltRounds);

    //adds all data to users db collection
    await userCollection.insertOne({
        username: username,
        email: email,
        password: hashedPassword,
        user_role: "student" //default when created
    });
    console.log("Inserted user");
    req.session.authenticated = true;
    req.session.username = username;
    req.session.user_role = "user";
    req.session.cookie.maxAge = expireTime;
    res.redirect('/members');
    return;
});

app.post("/loginSubmit", async (req, res) => {
    var username = req.body.username;
    // var email = req.body.email;
    var password = req.body.password;

    const schema = Joi.object({
        username: Joi.string().username().required(),
        password: Joi.string().max(20).required(),
    });

    // check for valid login inputs
    const validationResult = schema.validate(req.body);
    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.render("loginErr", { error: validationResult.error.details[0].message });
        return;
    }

    // check for matching email in db
    const userData = await userCollection.findOne({ email });
    if (!userData) {
        console.log("Email not found");
        res.render("notregis");
        return;
    }

    var matchingpw = await bcrypt.compare(password, userData.password);
    // if matching password
    if (matchingpw) {
        // console.log(email);
        // console.log(userData.password);
        console.log(userData);
        //store session
        req.session.authenticated = true;
        //store name to session
        req.session.username = userData.username;
        // store user type to session
        req.session.user_role = userData.user_role;
        req.session.cookie.maxAge = expireTime;
        // set to true if not true
        res.redirect('/members');
        return;
    } else {
        console.log("Incorrect password");
        res.render("incorrectpw");
        return;
    }
});
//logout will end session, clear cookies, go back homepage
app.get("/logout", async (req, res) => {
    // destroy session
    req.session.destroy();
    console.log("session destroyed");
    // clear current session & redirect home
    res.redirect("/");
});