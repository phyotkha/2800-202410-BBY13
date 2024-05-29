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
          from: "courses",
          localField: "courses.courseId", 
          foreignField: "courseId", 
          as: "courses", 
        },
      },
    ]);

    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = { getCoursesByStudentId };

