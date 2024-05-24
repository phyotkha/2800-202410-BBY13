// Syncfusion.Licensing.registerLicense("ESSENTIAL_STUDIO_KEY");


// Fetch event data from the server and initialize Schedule
fetch('http://localhost:3000/events')
    .then(response => response.json())
    .then(data => {
        var scheduleObj = new ej.schedule.Schedule({
            height: '650px',
            selectedDate: new Date(2024, 4, 22),
            eventSettings: { dataSource: data },
            eventRendered: function(args) {
                applyCategoryColor(args, scheduleObj.currentView);
            }
        });

        scheduleObj.appendTo('#Schedule');
    })
    .catch(error => console.error('Error fetching events:', error));



// var eventData = [
//     {
//         Id: 1,
//         Subject: 'Camping with',
//         StartTime: new Date(2021, 1, 15, 0, 0),
//         EndTime: new Date(2021, 1, 15, 2, 30),
//         InstructorId
//     
//     },
//     {
//         Id: 2,
//         Subject: 'Story Time for Kids',
//         StartTime: new Date(2021, 1, 16, 1, 0),
//         EndTime: new Date(2021, 1, 16, 2, 30),
//         CategoryColor: '#357cd2'
//     },
//     {
//         Id: 3,
//         Subject: 'Walk with',
//         StartTime: new Date(2021, 1, 17, 0, 0),
//         EndTime: new Date(2021, 1, 17, 2, 30),
//         IsAllDay: true,
//         CategoryColor: '#7fa900'
//     },
//     {
//         Id: 4,
//         Subject: 'Black Cockatoos Playtime',
//         StartTime: new Date(2021, 1, 18, 1, 0),
//         EndTime: new Date(2021, 1, 18, 2, 30),
//         CategoryColor: '#ea7a57'
//     },
//     {
//         Id: 5,
//         Subject: 'Croco World',
//         StartTime: new Date(2021, 1, 19, 0, 0),
//         EndTime: new Date(2021, 1, 19, 2, 30),
//         IsAllDay: true,
//         CategoryColor: '#00bdae'
//     }
// ];

// var scheduleObj = new ej.schedule.Schedule({
//     height: '650px',
//     selectedDate: new Date(2021, 1, 15),
//     eventSettings: { dataSource: eventData },
//     eventRendered: function(args) {
//         applyCategoryColor(args, scheduleObj.currentView);
//     }
// });

// scheduleObj.appendTo('#Schedule');
