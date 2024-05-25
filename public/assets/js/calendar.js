
async function fetchEvents() {
    const [coursesResponse, eventsResponse] = await Promise.all([
        fetch("/courses"),
        fetch("/events"),
    ]);

    const courses = await coursesResponse.json();
    const events = await eventsResponse.json();
    return [...courses,
         ...events
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
          dataSource: [{ text: "Computing&IT", id: 1, color: "#357cd2" }],
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
            { text: "Thorsten", id: 1, groupId: 1, color: "#7fa900" },
            { text: "Rahul", id: 2, groupId: 1, color: "#7fa900" },
            { text: "Simin", id: 3, groupId: 1, color: "#7fa900" },
            { text: "Arron", id: 4, groupId: 1, color: "#7fa900" },
            { text: "Bruce", id: 5, groupId: 1, color: "#7fa900" },
            { text: "Maryam", id: 6, groupId: 1, color: "#7fa900" },
            { text: "Carly", id: 7, groupId: 1, color: "#7fa900" },
            { text: "Patrick", id: 8, groupId: 1, color: "#7fa900" }
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
