const mongoose = require('mongoose');
const courses = require('./schemas/courses');
const newCourses = new courses([
    {
      CourseID: "COMM 1116",
      Title: "Business Communications 1",
      School: "School of Computing and Academic Studies",
      Program: "Computer Systems Technology",
      CourseCredit: 4,
      MinimumPassingGrade: "50%",
      TotalHours: 60,
      TotalWeeks: 15,
      HoursPerWeek: 4,
      DeliveryType: "Lecture",
      Prerequisites: "No prerequisites are required for this course.",
      description:
        "Information technology professionals spend time each day communicating orally and in writing with their supervisors, colleagues and clients. As problem-solvers and entrepreneurs in industry, you need to communicate quickly, clearly, and effectively. This course will teach you how to be a professional and efficient communicator at work. You will write effective business correspondence and instructions and deliver a formal oral presentation to your set. The first term establishes the principles and basic patterns on which you will build more advanced applications in the second term.",
    },

    {
      CourseID: "COMP 1100",
      Title: "CST Program Fundamentals",
      School: "School of Computing and Academic Studies",
      Program: "Computer Systems Technology (CST) Diploma",
      CourseCredit: 1,
      MinimumPassingGrade: "Satisfactory",
      TotalHours: 15,
      TotalWeeks: 15,
      HoursPerWeek: 1,
      DeliveryType: "Lecture",
      Prerequisites:
        "COMP 1510 and COMP 1537 and COMP 1800 and COMP 2537‡ (‡ must be taken concurrently)",
      description:
        "The course covers topics of importance to new and continuing students on how to balance school and related activities to enhance chances of success in their academic careers. In this course students will learn a variety of different techniques to improve study habits, note taking, and time management skills. The class will also present other topics of interest to CST students and will introduce students to various support systems at BCIT.",
    },

    {
      CourseID: "COMP 1113",
      Title: "Applied Mathematics",
      School: "School of Computing and Academic Studies",
      Program: "Computer Systems Technology",
      CourseCredit: 4,
      MinimumPassingGrade: "50%",
      TotalHours: 60,
      TotalWeeks: 15,
      HoursPerWeek: 4,
      DeliveryType: "Lecture",
      Prerequisites: "No prerequisites are required for this course.",
      description:
        "Comp 1113 is partially discrete mathematics, partially an introduction to linear equations. The purpose of this course is to give a strong foundation for future technical and programming courses. The course is divided into three parts: (1) Boolean algebra and design of logic circuits; (2) number systems and data representation; and (3) functions, linear equations, vectors and matrices.",
    },

    {
      CourseID: "COMP 1510",
      Title: "Programming Methods",
      School: "School of Computing and Academic Studies",
      Program: "Computer Systems Technology (CST) Diploma",
      CourseCredit: 7,
      MinimumPassingGrade: "50%",
      TotalHours: 105,
      TotalWeeks: 15,
      HoursPerWeek: 7,
      DeliveryType: "Lecture",
      Prerequisites:
        "COMP 1510 and COMP 1537 and COMP 1800 and COMP 2537‡ (‡ must be taken concurrently)No prerequisites are required for this course.",
      description:
        "This hands-on course is the foundation for all future programming courses and complements COMP 1537 and COMP 1800. This course introduces the fundamental concepts of programming including design, development, testing, debugging simple programs, as well as error-handling, and problem solving.",
    },

    {
      CourseID: "COMP 1537",
      Title: "COMP 1537",
      School: "School of Computing and Academic Studies",
      Program: "Computer Systems Technology (CST) Diploma",
      CourseCredit: 4,
      MinimumPassingGrade: "50%",
      TotalHours: 60,
      TotalWeeks: 15,
      HoursPerWeek: 4,
      DeliveryType: "Lecture",
      Prerequisites: "No prerequisites are required for this course.",
      description:
        "The course is focused on developing teamwork and project management skills as well as an understanding of the development lifecycle. The project will simultaneously allow students to apply their previously-developed technical knowledge. Prerequistes: COMP 1510, COMP 1537, COMP 1800 Co-requisite: COMP 253This course focuses on programming both front and back end for web application development using JavaScript on both front-end and back-end development. Topics include AJAX, DOM editing with JavaScript & jQuery, and JSON.",
    },

    {
      CourseID: "COMP 1712",
      Title: "Business Analysis and System Design",
      School: "School of Computing and Academic Studies",
      Program: "Computer Systems Technology",
      CourseCredit: 4,
      MinimumPassingGrade: "50%",
      TotalHours: 60,
      TotalWeeks: 15,
      HoursPerWeek: 4,
      DeliveryType: "Lecture",
      Prerequisites: "No prerequisites are required for this course.",
      description:
        "Business Analysis and Systems Design is the study of concepts, processes and tools that professionals use to plan and develop information systems to industry standards. Students learn how to ask implicit questions, to create and document communication plans and to make better decisions prior to creating a software system. Beginning with an introduction to the Software Development Life Cycle (SDLC), students work in teams to initiate the system process, analyze problems, discover requirements and create a logical design. Topics include: techniques used in the discovery of business requirements, traditional approaches to data and process modelling, entity-relationship diagrams, and an introduction to relational database normalization. Agile life cycles such as Scrum are also introduced and compared to more planned life cycles such as waterfall. By the end of this course, successful participants will be able to use tools and methods commonly used in industry to analyze, design, and implement information systems as confirmed by a term project.",
    },

    {
      CourseID: "COMP 1800",
      Title: "Projects 1",
      School: "School of Computing and Academic Studies",
      Program: "Computer Systems Technology (CST) Diploma",
      CourseCredit: 4,
      MinimumPassingGrade: "50%",
      TotalHours: 60,
      TotalWeeks: 15,
      HoursPerWeek: 4,
      DeliveryType: "Lecture",
      Prerequisites: "COMP 1510‡ and COMP 1537‡ (‡ must be taken concurrently)",
      description:
        "Students learn to work in a collaborative environment and complete a small-scale software project: a mobile-friendly web application. The course is focused on developing the essential technical skills that will allow a student to develop a functional web application project. The course takes students through the UX design process which includes creating and administering surveys & interviews, creating personas and user stories, designing wireframes, and performing user tests with a developed implementation that is based on the UX design process. Students will use the Agile methodology to manage the software process. Software management workflow also includes using Git from the command-line for version control basics in a collaborative workflow. Students will apply web technologies such as JavaScript, CSS, and HTML. Data persistence may be optionally achieved using NoSQL data technology solution.",
    },

    {
      CourseID: "COMP 2537",
      Title: "Web Development 2",
      School: "School of Computing and Academic Studies",
      Program: "Computer Systems Technology (CST) Diploma",
      CourseCredit: 1.5,
      MinimumPassingGrade: "50%",
      TotalHours: 23,
      TotalWeeks: 5,
      HoursPerWeek: 4.6,
      DeliveryType: "Lecture",
      Prerequisites:
        "COMP 1510 and COMP 1537 and COMP 1800 and COMP 2800‡ (‡ must be taken concurrently)",
      description:
        "This course focuses on some of the finer points of web development and design including the implementation of current UX/UI trends in Progressive Web Applications (PWA) such as highly dynamic and animated applications, creating data visualizations, and serving up various types of content such as audio, video, and imagery in different formats to support different device and bandwidth needs.",
    },

    {
      CourseID: "COMP 2800",
      Title: "Projects 2",
      School: "School of Computing and Academic Studies",
      Program: "Computer Systems Technology (CST) Diploma",
      CourseCredit: 4.5,
      MinimumPassingGrade: "50%",
      TotalHours: 68,
      TotalWeeks: 5,
      HoursPerWeek: 13.6,
      DeliveryType: "Lecture/Lab",
      Prerequisites:
        "COMP 1510 and COMP 1537 and COMP 1800 and COMP 2537‡ (‡ must be taken concurrently)",
      description:
        "Students work in teams of four or five to complete an advanced mobile-friendly web application in a real-world domain. Teams will proceed through the majority of the software development lifecycle, from requirements gathering to specification, UI/UX design, to implementation and delivery. The course is focused on developing teamwork and project management skills as well as an understanding of the development lifecycle. The project will simultaneously allow students to apply their previously-developed technical knowledge. Prerequistes: COMP 1510, COMP 1537, COMP 1800 Co-requisite: COMP 2537",
    },
  ]);
