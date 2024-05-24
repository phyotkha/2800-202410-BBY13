const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 3000;

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/scheduleDB', { useNewUrlParser: true, useUnifiedTopology: true });




const eventSchema = new mongoose.Schema({
    Id: Number,
    Subject: String,
    StartTime: Date,
    EndTime: Date,
    IsAllDay: Boolean,
    CategoryColor: String
});

const Event = mongoose.model('Event', eventSchema);

app.use(cors());

app.get('/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
