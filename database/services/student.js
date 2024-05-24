//student service

// const mongoose = require('mongoose');
const Student = require("../schemas/students");

const getCoursesByStudentId = async (studentId) => {
  try {
    const result = await Student.aggregate([
      {
        $match: {
          studentId,
        }
      },
      {
        $lookup: {
          from: 'courses', // The name of the collection to join with
          localField: 'courses.CourseID', // The field in the local collection
          foreignField: 'CourseID', // The field in the foreign collection
          as: 'courses' // The field where the joined data will be stored
        }
      }
    ]);

    return result
  } catch (error) {
    throw error;
  }
}


module.exports = { getCoursesByStudentId }





