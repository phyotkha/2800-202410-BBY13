const Joi = require("joi");
const {createEvent } = require("../database/services/events");

async function bookAppointment(req, res) {
    const missing = req.query.missing;
    const timeSlotBooked = req.query.timeslotbooked;
    res.render('bookAppointment', {missing: missing, timeslotbooked: timeSlotBooked});
}
async function bookAppointmentSubmit(req, res) {

    const { StartTime, EndTime, Subject, instructorId, departmentId } = req.body;

    const schema = Joi.object({
        StartTime: Joi.date().required(),
        EndTime: Joi.date().required(),
        Subject: Joi.string().required(),
        instructorId: Joi.string().required(),
        departmentId: Joi.string().required(),
      });
    
      const validationResult = schema.validate(req.body);
    
      if (validationResult.error != null) {
        res.redirect(`/bookAppointment?missing=1`);
        return;
        // console.log("Signup Error", validationResult.error); // For debugging
      }
    try {
        const data = await createEvent({
            Subject,
            StartTime,
            EndTime,
            instructorId,
            departmentId
        });
        res.render('appointmentConfirmed', {Subject: Subject, StartTime: StartTime, EndTime: EndTime, instructorId: instructorId, departmentId: departmentId});
    } catch (error) {
        console.error("Error booking appointment:", error);
        return res.status(500).send("An error occurred while booking the appointment.");
    }
    
}

module.exports = {
    bookAppointment,
    bookAppointmentSubmit
};
