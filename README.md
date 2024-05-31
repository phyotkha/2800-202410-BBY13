# 2800-202410-BBY13
* Team Name: BBY-13
## 1. Project Description
Our project, BBY-13, is developing BCIT ChatBot, an AI chatBot to help students in their academic journey by solving problems, such as having difficulty finding information, contacting supports, and etc with integrating the school’s data, offering real-time insight into courses, availability, and provide technical support 24/7.

## 2. Names of Contributors
* Phyo
* Richard 
* Kyle
* Dina 
* Yerin
	
## 3. Technologies and Resources Used
* CSS (Front-end)
* EJS (Front-end)
* Bootstrap (Front-end)
* Node.js (Back-end)
* JavaScript (Back-end)
* OpenAI API (API)
* MongoDB (Database)

## 4. Complete setup/installion/usage
* Install Node.js 
    * Users will need to ensure that Node.js is installed on their machine. They can visit the official Node.js website (https://nodejs.org/en) to download and install the appropriate version for their operating system.
* Clone the repository
    * ```git clone https://github.com/phyotkha/2800-202410-BBY13
* Install dependencies
    * ```npm install 
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
    ```node .
    ```
    * To access the application
      * From your local machine: http://localhost:YourPort

## 5. Features for Future
What we'd like to build in the future:
* Integrate our custom AI model that will provide better service to our users.
* A reliable booking service

## 6. Contents of Folder
Content of the project folder:

```
 Top level of project folder: 
├── database                    # Database folder; contains database connection, schemas, sample data for database
├── modules                     # Modules folder; contains js files that is used in index.js
├── public                      # Public folder; contains resources, such as css files, images
├── views                       # Views folder; contains ejs files 
├── .gitignore                  # Git ignore file
├── databaseConnection.js       #
├── index.js                    # Main JS file to start the application 
├── package-lock.json           # Includes dependencies for app to run
├── package.json                # Includes dependencies for app to run
├── utils.js                    # 
└── README.md                   #

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
|   |   ├── events.js           #
|   |   ├── parseUserInput.js   #
|   |   ├── routerInstructor.js #
|   |   └── student.js          #
|   ├── services                # Services Folder
|   |   ├── avaliableTimes.json #
|   |   ├── events.js           #
|   |   ├── serviceInstructor.js#
|   |   └── student.js          #
|   ├── mongooseConnection.js   # JS file for connecting mongodb database
|   └── reset-database.js       # JS file for resetting database
├── datasets
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
