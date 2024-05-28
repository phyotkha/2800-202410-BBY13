const Event = require("../schemas/events");

const createEvent = async ({ StartTime, EndTime, Subject, instructorId, departmentId }) => {
  try {
    const result = await Event.create({
      Subject,
      StartTime,
      EndTime,
      instructorId,
      departmentId
    })
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = { createEvent };
