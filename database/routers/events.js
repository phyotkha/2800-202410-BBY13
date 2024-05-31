const express = require('express');
const { getEvents, createEvent, updateEvent, deleteEvent } = require("../services/events");
const { getAvailableTimes } = require("../schemas/availableTimes");
const router = express.Router();

router.post('/book-appointment', async (req, res) => {
    const { StartTime, EndTime, Subject, instructorId, departmentId } = req.body;


    if (!StartTime) return res.status(400).send("missing StartTime");
    if (!EndTime) return res.status(400).send("missing EndTime");
    if (!Subject) return res.status(400).send("missing Subject");
    if (!instructorId) return res.status(400).send("missing instructorId");
    if (!departmentId) return res.status(400).send("missing departmentId");

    try {

        const availableTimes = await getAvailableTimes(instructorId);


        const isAvailable = availableTimes.some(timeSlot => {
            return new Date(StartTime) >= new Date(timeSlot.StartTime) && new Date(EndTime) <= new Date(timeSlot.EndTime);
        });

        if (!isAvailable) {
            return res.status(400).send("Requested time slot is not available");
        }


        const existingEvents = await getEvents({ instructorId });


        const hasConflict = existingEvents.some(event => {
            return (
                (new Date(requestedStartTime) >= new Date(event.StartTime) && new Date(requestedStartTime) < new Date(event.EndTime)) ||
                (new Date(requestedEndTime) > new Date(event.StartTime) && new Date(requestedEndTime) <= new Date(event.EndTime))
            );
        });

        if (hasConflict) {
            return res.status(400).send("Requested time slot is already booked");
        }


        const data = await createEvent({
            Subject,
            StartTime,
            EndTime,
            instructorId,
            departmentId
        });


        return res.send(data);
    }
    catch (error) {
        return res.status(500).send(`Error: ${error.message}`);
    }
});


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