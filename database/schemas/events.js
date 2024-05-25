const mongoose = require("mongoose");
const eventsSchema = new mongoose.Schema({
  Id: Number,
  Subject: String,
  StartTime: Date,
  EndTime: Date,
  departmentId: Number,
  instructorId: Number,
});

const eventModel = mongoose.model("event", eventsSchema);
module.exports = eventModel;
