const Event = require("../schemas/events");

const getEvents = async (query) => {
  try {
    const events = await Event.find(query).lean();
    return events;
  } catch (error) {
    throw error;
  }
};

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

const updateEvent = async (eventId, payload) => {
  try {
    const result = await Event.findByIdAndUpdate({ _id: eventId }, payload)
    return result;
  } catch (error) {
    throw error;
  }
};

const deleteEvent = async (eventId) => {
  try {
    const result = await Event.deleteOne({ _id: eventId })
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = { createEvent, updateEvent, deleteEvent, getEvents };
