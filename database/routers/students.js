const express = require('express');
const { getCoursesByStudentId } = require("../services/student");
const router = express.Router();

router.get('/:studentId/courses', async (req, res) => {
    const studentId = req.params.studentId;
    const data = await getCoursesByStudentId(studentId);
    res.send(data)
})


module.exports = router