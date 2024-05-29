const { getEvents, createEvent, updateEvent, deleteEvent } = require("../database/services/events");
const { getAvailableTimes } = require("../database/schemas/availableTimes");

// Show the appointment form
async function showAppointmentForm(req, res) {
    res.render('bookAppointment');
}

// Handle form submission
async function bookAppointmentSubmit(req, res) {
    const { StartTime, EndTime, Subject, instructorId, departmentId } = req.body;

    if (!StartTime || !EndTime || !Subject || !instructorId || !departmentId) {
        return res.status(400).send("Missing required fields");
    }

    try {
        // Check for conflicting events
        const existingEvents = await getEvents({ instructorId });
        const hasConflict = existingEvents.some(event => {
            return (
                (new Date(StartTime) >= new Date(event.StartTime) && new Date(StartTime) < new Date(event.EndTime)) ||
                (new Date(EndTime) > new Date(event.StartTime) && new Date(EndTime) <= new Date(event.EndTime))
            );
        });

        if (hasConflict) {
            return res.status(400).send("Requested time slot is already booked");
        }

        // Create event
        const data = await createEvent({
            Subject,
            StartTime,
            EndTime,
            instructorId,
            departmentId
        });

        return res.send(data);
    } catch (error) {
        console.error("Error booking appointment:", error);
        return res.status(500).send("An error occurred while booking the appointment.");
    }
}

// Update event
async function updateAppointment(req, res) {
    const eventId = req.params.eventId;
    const { StartTime, EndTime, Subject, instructorId, departmentId } = req.body;

    if (!eventId) return res.status(400).send("Missing eventId");

    const payload = {};
    if (StartTime) payload.StartTime = StartTime;
    if (EndTime) payload.EndTime = EndTime;
    if (Subject) payload.Subject = Subject;
    if (instructorId) payload.instructorId = instructorId;
    if (departmentId) payload.departmentId = departmentId;

    const data = await updateEvent(eventId, payload);
    return res.send(data);
}

// Delete event
async function deleteAppointment(req, res) {
    const eventId = req.params.eventId;
    if (!eventId) return res.status(400).send("Missing eventId");
    const data = await deleteEvent(eventId);
    return res.send(data);
}

module.exports = {
    showAppointmentForm,
    bookAppointmentSubmit,
    updateAppointment,
    deleteAppointment
};
