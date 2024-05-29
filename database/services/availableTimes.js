// services/availableTimes.js

const AvailableTimes = require("../schemas/availableTimes");

const getAvailableTimes = async (instructorId) => {
    try {
        const times = await AvailableTimes.find({ instructorId }).lean();
        return times;
    } catch (error) {
        throw error;
    }
};

module.exports = { getAvailableTimes };
