
async function fetchEvents() {
    const [coursesResponse, eventsResponse] = await Promise.all([
        fetch("/courses"),
        //   fetch("/events"),
    ]);

    const courses = await coursesResponse.json();
    // const events = await eventsResponse.json();
    return [...courses,
        //  ...events
    ];
}

fetchEvents().then((plan) => {
    const schedule = new ej.schedule.Schedule({
        width: "100%",
        height: "650px",
        currentView: "Month",
        allowEditing: false,
        enableAdaptiveUI: true,
        readonly: true, // Setting readonly to true disables editing and adding events
        group: {
            resources: ["departments", "instructors"],
        },
        resources: [
            {
                field: "departmentId",
                title: "Choose Department",
                name: "departments",
                dataSource: [
                    { text: "Computing&IT", id: 1, color: "#357cd2" },
                    { text: "PROJECT 2", id: 2, color: "#56ca85" },
                    { text: "PROJECT 3", id: 3, color: "#df5286" },
                ],
                textField: "text",
                idField: "id",
                colorField: "color",
            },
            {
                field: "instructorId",
                title: "instructor",
                name: "instructors",
                allowMultiple: true,
                dataSource: [
                    { text: "Thorsten", id: 1, groupId: 1, color: "#df5286" },
                    { text: "Rahul", id: 2, groupId: 1, color: "#7fa900" },
                    { text: "Simin", id: 3, groupId: 1, color: "#7fa900" },
                    { text: "Arron", id: 4, groupId: 1, color: "#7fa900" },
                    { text: "Bruce", id: 5, groupId: 1, color: "#7fa900" },
                    { text: "Maryam", id: 6, groupId: 1, color: "#7fa900" },
                    { text: "Carly", id: 7, groupId: 1, color: "#7fa900" },
                    { text: "Patrick", id: 8, groupId: 1, color: "#7fa900" },
                    { text: "Robert", id: 3, groupId: 2, color: "#ea7a57" },
                    { text: "Smith", id: 4, groupId: 2, color: "#5978ee" },
                    { text: "Micheal", id: 5, groupId: 3, color: "#df5286" },
                    { text: "Root", id: 6, groupId: 3, color: "#00bdae" },
                ],
                textField: "text",
                idField: "id",
                groupIDField: "groupId",
                colorField: "color",
            },
        ],
        eventSettings: { dataSource: plan },
        eventRendered: function (args) {
            let categoryColor = args.data.CategoryColor;
            if (!args.element || !categoryColor) {
                return;
            }
            if (schedule.currentView === "Agenda") {
                args.element.firstChild.style.borderLeftColor = categoryColor;
            } else {
                args.element.style.backgroundColor = categoryColor;
            }
        },
    });
    schedule.appendTo("#Schedule");
});
