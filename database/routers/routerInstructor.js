const express = require("express");
const { getCourseByInstructorId } = require("../services/serviceInstructor");
const router = express.Router();

router.get("/:instructorId/courses", async (req, res) => {
  const courseId = req.params.courseId;
  const data = await getCourseByInstructorId(courseId);
  res.send(data);
});

module.exports = router;
