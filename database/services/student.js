//student service

// const mongoose = require('mongoose');
const Student = require("../schemas/students");

const getCoursesByStudentId = async (studentId) => {
  try {
    const result = await Student.aggregate([
      {
        $match: {
          studentId,
        },
      },
      {
        $lookup: {
          from: "courses", // The name of the collection to join with
          localField: "courses.courseId", // The field in the local collection
          foreignField: "courseId", // The field in the foreign collection
          as: "courses", // The field where the joined data will be stored
        },
      },
    ]);

    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = { getCoursesByStudentId };

// // Perform the "join" to look up data from the Student collection based on courseId
// Course.aggregate([
//   {
//     $lookup: {
//       from: 'students', // The name of the collection to join with
//       localField: 'courseId', // The field in the local collection (courses)
//       foreignField: 'courses', // The field in the foreign collection (students)
//       as: 'studentsData' // The field where the joined data will be stored
//     }
//   }
// ]).exec((err, result) => {
//   if (err) {
//     console.error(err);
//     return;
//   }
//   console.log(result);
// });

// const mongoose = require('mongoose');

// const enrollmentSchema = new mongoose.Schema({
//   studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
//   courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }
// });

// const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

// module.exports = Enrollment;
