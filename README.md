# 2800-202410-BBY13
* Team Name: BBY-13
## 1. Project Description
Our project, BBY-13, is developing BCIT ChatBot, an AI chatBot to help students in their academic journey by solving problems, such as having difficulty finding information, contacting supports, and etc with integrating the school’s data, offering real-time insight into courses, availability, and provide technical support 24/7.

## 2. Names of Contributors
* Phyo
* Richard 
* Kyle
* Zhaoqiu
* Yerin
	
## 3. Technologies and Resources Used
* CSS (Front-end)
* EJS (Front-end)
* Bootstrap (Front-end)
* Essential Studio (Front-end)
* Node.js (Back-end)
* JavaScript (Back-end)
* OpenAI API (API)
* MongoDB (Database)

## 4. Complete setup/installion/usage
* Install Node.js 
    * Users will need to ensure that Node.js is installed on their machine. They can visit the official Node.js website (https://nodejs.org/en) to download and install the appropriate version for their operating system.
* Clone the repository
    * `git clone https://github.com/phyotkha/2800-202410-BBY13 `
* Install dependencies
    * `npm install` 
* Set up environment variables
    * Users will need to create an .env file in the root directory of the project. 
    * Here is an example of the env variables you may need: 
    ```PORT= YourDesiredPortHere
       MONGODB_HOST=YourMongoDBClusterHere
       MONGODB_USER=YourUsernameHere
       MONGODB_PASSWORD=YourPasswordHere
       MONGODB_DATABASE=YourMongoDBDatabaseHere
       MONGODB_SESSION_SECRET=SomeSecretSessionKey
       NODE_SESSION_SECRET=SomeSecretSessionKey
       EMAIL=YourEmailAddressHere
       EMAIL_PASSWORD= YourEmailAddressPasswordHere
       OPENAI_API_KEY= YourOpenAIKeyHere
       ESSENTIAL_STUDIO_KEY=YourEssentialStudioKeyHere
    ```
    * To start the application
    `node .`
    (or)
    `node index.js`
    * To access the application
      * From your local machine: http://localhost:YourPort

## 5. How to use the product (Features)
* Once installation is complate, go to signup page and sigup as a user. 
* After signing up, you can interact with the chatbot by sending messages to it. (Messages should be related to BCIT, such as "What is the location of COMP 1510?")
* You can go into calender feauture and check the office hours of each instructors, you can also use book an appointment button and filled out the form to make an appointment. 
* You can edit your profile information in your profile page.

## 6. Features for Future
What we'd like to build in the future:
* Integrate our custom AI model that will provide better service to our users.
* A reliable booking service

## 7. Usage of AI 
*

## 8. Contact Information
* Our contact information : schoolscopeai@gmail.com

## 9. Contents of Folder
Content of the project folder:

```
 Top level of project folder: 
├── database                    # Database folder; contains database connection, schemas, sample data for database
├── modules                     # Modules folder; contains js files that is used in index.js
├── public                      # Public folder; contains resources, such as css files, images
├── views                       # Views folder; contains ejs files 
├── .gitignore                  # Git ignore file
├── databaseConnection.js       # databaseConnection.js, allow for the database connection with mongodb 
├── index.js                    # Main JS file to start the application 
├── package-lock.json           # Includes dependencies for app to run
├── package.json                # Includes dependencies for app to run
├── utils.js                    # utils.js file, removes the need for the use of "/public"
└── README.md                   # Readme file

It has the following subfolders and files:
├── .git                        # Folder for git repo
├── database                    # Database Folder
|   ├── defaultData             # Sample Data Folder That Chatbot will use
|   |   ├── avaliableTimes.json # JSON file for avaliable times information
|   |   ├── courses.json        # JSON file for courses information
|   |   ├── events.json         # JSON file for events information
|   |   ├── instructors.json    # JSON file for instructors information
|   |   └── students.json       # JSON file for students information
|   ├── routers                 # Router Folder
|   |   ├── events.js           # This file defines a set of API endpoints for managing appointment
|   |   ├── parseUserInput.js   # This file sets up an intelligent AI-driven appointment booking system using Express.js
|   |   ├── routerInstructor.js # This file defines an Express.js route for retrieving courses taught by a specific instructor based on their ID
|   |   └── student.js          # This file defines an Express.js route for retrieving courses enrolled by a specific student based on their ID
|   ├── schemas                 # Datbase Schemas Folder
|   |   ├── avaliableTime.js    # JS File for avaliable time collection schema
|   |   ├── courses.js          # JS File for courses collection schema
|   |   ├── events.js           # JS File for events collection schema
|   |   ├── instructors.js      # JS File for instructors collection schema
|   |   └── students.js         # JS File for students collection schema
|   ├── services                # Services Folder
|   |   ├── avaliableTimes.js   # This file defines a service function for retrieving available time slots.
|   |   ├── events.js           # This file defines service functions for managing event data in the database.
|   |   ├── serviceInstructor.js# This file defines a service function for retrieving courses.
|   |   └── student.js          # This file defines a service function for retrieving courses enrolled by a specific student.
|   ├── mongooseConnection.js   # JS file for connecting mongodb database
|   └── reset-database.js       # JS file for resetting database
├── modules                     # Modules folder to keep index.js clean
|   ├── bookAppointment.js      # JS file for booking an appointment (used in index.js)
|   ├── chatModuleDB.js         # JS file for user's interaction with chatbot
|   └── sample.txt              # Text file containing sample questions for AI to use
├── public                      # Public Folder
|   ├── css                     # CSS Folder
|   |   ├── calendar.css        # CSS File for calendar page
|   |   └── style.css           # CSS File for style page
|   ├── js                      # JS Folder
|   |   └── calendar.js         # JS File for loading calendar dynamically
|   ├── bby-13-favicon.ico      # Favicon
|   ├── logo-tansparent-bg.png  # Color tansparent logo
|   ├── logo.png                # Main logo  
|   ├── navbar-logo-letter.png  # Navbar logo with letter
|   └── navbar-logo.png         # Navbar logo without letter
└── views                       # View Folder
    ├── templates               # Templates Folder
    |   ├── footer.ejs          # EJS File for footer
    |   └── header.ejs          # EJS File for header
    ├── 404.ejs                 # EJS File for 404 Error page
    ├── appoinmentConfirmed.ejs # EJS File for appointment confirmation information page
    ├── bookAppointment.ejs     # EJS File for booking appointment form page
    ├── calendar.ejs            # EJS File for calendar page
    ├── chatPage.ejs            # EJS File for main chat page
    ├── homePage.ejs            # EJS File for home page
    ├── login.ejs               # EJS File for login page
    ├── resetPassword.ejs       # EJS File for reset password page
    ├── resetPasswordRequest.ejs# EJS File for reset password request page
    ├── signup.ejs              # EJS File for sign up page
    ├── startingPage.ejs        # EJS File for starting page 
    └── userProfile.ejs         # EJS File for user profile page
