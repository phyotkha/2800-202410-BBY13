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
    * `git clone https://github.com/phyotkha/2800-202410-BBY13`
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
       ESSENTIAL_STUDIO_KEY=YourEssentialStudioKeyHere```
    

## 5. Features for Future
What we'd like to build in the future:
* Integrate our custom AI model that will provide better service to our users.
* A reliable booking service

	
## 6. Contents of Folder
Content of the project folder:

```
 Top level of project folder: 
├── .gitignore               # Git ignore file
├── index.js                 # Main JavaScript file
├── package-lock.json
├── package.json
├── utils.js
└── README.md

It has the following subfolders and files:
├── .git                     # Folder for git repo
├── images                   # Folder for images
    /blah.jpg                # Acknowledge source
├── scripts                  # Folder for scripts
    /blah.js                 # 
├── styles                   # Folder for styles
    /blah.css                # 