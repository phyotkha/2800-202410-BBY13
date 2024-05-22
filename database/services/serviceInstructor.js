const Instructor = require("../schemas/instructors");

const getCoursesByInstructorId = async (instructorId) => {
  try {
    const result = await Instructor.aggregate([
      {
        $match: {
          instructorId,
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "courses.courseId",
          foreignField: "courseId",
          as: "courses",
        },
      }
    ]);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = { getCoursesByInstructorId };
