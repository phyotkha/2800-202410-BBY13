const express = require('express');
const { createEvent, updateEvent, deleteEvent } = require("../services/events");
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


router.put('/update/:eventId', async (req, res) => {
    const eventId = req.params.eventId;
    const { StartTime, EndTime, Subject, instructorId, departmentId } = req.body;

    if (!eventId) return res.status(400).send("missing eventId");

    const payload = {};
    if (StartTime) payload.StartTime = StartTime;
    if (EndTime) payload.EndTime = EndTime;
    if (Subject) payload.Subject = Subject;
    if (instructorId) payload.instructorId = instructorId;
    if (departmentId) payload.departmentId = departmentId;

    const data = await updateEvent(eventId, payload);
    return res.send(data);
});

router.delete('/delete/:eventId', async (req, res) => {
    const eventId = req.params.eventId;
    if (!eventId) return res.status(400).send("missing eventId");
    const data = await deleteEvent(eventId);
    return res.send(data);
})

module.exports = router