const express = require('express');
const { createEvent } = require("../services/events");
const router = express.Router();

router.post('/create', async (req, res) => {
    const { StartTime, EndTime, Subject, instructorId, departmentId } = req.body;


    if (!StartTime) return res.status(400).send("missing StartTime");
    if (!EndTime) return res.status(400).send("missing EndTime");
    if (!Subject) return res.status(400).send("missing Subject");
    if (!instructorId) return res.status(400).send("missing instructorId");
    if (!departmentId) return res.status(400).send("missing departmentId");

    const data = await createEvent({
        Subject,
        StartTime,
        EndTime,
        instructorId,
        departmentId
    });
    return res.send(data);
})


module.exports = router