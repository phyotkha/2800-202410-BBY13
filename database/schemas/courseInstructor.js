db.createView("test", "courseInstructor", [
  {
    $lookup: {
      from: "course",
      localField: "instructorId",
      foreignField: "instrctorId",
      as: "courseInstructorDocs",
    },
  },
  {
    $project: {
      _id: 0,
      instructorId: 1,
      CourseId: 1,
      CRN: String,
      courseStart: String,
      courseEnd: String,
      location: String,
    },
  },
]);
require("./database/databaseConnection");
