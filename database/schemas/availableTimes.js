const mongoose = require('mongoose');

const availableTimesSchema = new mongoose.Schema({
    Id: Number,
    Subject: { type: String, default: 'Available' },
    StartTime: Date,
    EndTime: Date,
    CategoryColor: String,
    RecurrenceRule: String,
    departmentId: Number,
    instructorId: Number
});

const availableTimesModel = mongoose.model("availableTimes", availableTimesSchema);
module.exports = availableTimesModel;
