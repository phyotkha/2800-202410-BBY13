
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
//             }
//             daySquare.addEventListener("click", () => openModal(dayString));
//         } else if (i <= paddingDays) {
//             daySquare.classList.add("padding");
//             daySquare.innerText = daysInLastMonth + i - paddingDays;
//         } else {
//             daySquare.classList.add("padding");
//             daySquare.innerText = i - daysInMonth - paddingDays;
//         }
//         frag.appendChild(daySquare);
//     }
//     calendar.appendChild(frag);
// }

// function initButtons() {
//     actionButtons.addEventListener("click", (e) => {
//         const id = e.target.dataset.id;
//         if (id === "backButton") {
//             nav--;
//             load();
//         }
//         if (id === "nextButton") {
//             nav++;
//             load();
//         }
//         if (id === "todayButton") {
//             nav = 0;
//             load();
//         }
//     });
//     document.getElementById("saveButton").addEventListener("click", saveEvent);
//     document.getElementById("cancelButton").addEventListener("click", closeModal);
//     document
//         .getElementById("deleteButton")
//         .addEventListener("click", deleteEvent);
//     document.getElementById("closeButton").addEventListener("click", closeModal);
// }

// Syncfusion.Licensing.registerLicense("ESSENTIAL_STUDIO_KEY");
function applyCategoryColor(args, currentView) {
    var categoryColor = args.data.CategoryColor;
    if (!args.element || !categoryColor) {
        return;
        }
        if (schedule.currentView === "Agenda") {
          args.element.firstChild.style.borderLeftColor = categoryColor;
    } else {
          args.element.style.backgroundColor = categoryColor;
      },
    });
    schedule.appendTo("#Schedule");
});
// load();
