// let nav = 0;
// let clicked = null;
// let events = localStorage.getItem("events")
//     ? JSON.parse(localStorage.getItem("events"))
//     : [];

// const calendar = document.getElementById("calendar");
// const monthDisplay = document.getElementById("monthDisplay");
// const locale = "en-us";
// const actionButtons = document.getElementById("actionButtons");
// // model
// const newEventModal = document.getElementById("newEventModal");
// const deleteEventModal = document.getElementById("deleteEventModal");
// const backDrop = document.getElementById("modalBackDrop");
// const eventTitleInput = document.getElementById("eventTitleInput");
// // weekdays we need for calculate
// const weekdays = [
//     "Sunday",
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday"
// ];

// function openModal(date) {
//     clicked = date;
//     const eventForDay = events.find((e) => e.date === clicked);

//     if (eventForDay) {
//         document.getElementById("eventText").innerText = eventForDay.title;
//         deleteEventModal.style.display = "block";
//     } else {
//         newEventModal.style.display = "block";
//     }

//     backDrop.style.display = "block";
// }
// function closeModal() {
//     newEventModal.style.display = "none";
//     deleteEventModal.style.display = "none";
//     backDrop.style.display = "none";
//     eventTitleInput.value = "";
//     clicked = null;
//     load();
// }
// function saveEvent() {
//     if (eventTitleInput.value) {
//         events.push({
//             date: clicked,
//             title: eventTitleInput.value
//         });

//         localStorage.setItem("events", JSON.stringify(events));
//         closeModal();
//     }
// }
// function deleteEvent() {
//     events = events.filter((e) => e.date !== clicked);
//     localStorage.setItem("events", JSON.stringify(events));
//     closeModal();
// }

// function load() {
//     // current date
//     const dt = new Date();

//     if (nav !== 0) {
//         dt.setMonth(new Date().getMonth() + nav);
//     }
//     // current day, current month index and the year
//     const day = dt.getDate();
//     const month = dt.getMonth();
//     const year = dt.getFullYear();

//     console.log(day, month, year);

//     const firstDayOfMonth = new Date(year, month, 1);
//     const lastDayOfMonth = new Date(year, month + 1, 0);
//     // new Date(cur year, cur month indexed 1 (Jan is 1), day)
//     const daysInMonth = lastDayOfMonth.getDate();

//     const daysInLastMonth = new Date(year, month, 0).getDate();
//     let lastWeekday = lastDayOfMonth.toLocaleDateString(locale, {
//         weekday: "long"
//     });
//     let nextPaddingDays = 6 - weekdays.indexOf(lastWeekday);
//     console.log(nextPaddingDays);

//     const dateString = firstDayOfMonth.toLocaleDateString(locale, {
//         weekday: "long",
//         year: "numeric",
//         month: "numeric",
//         day: "numeric"
//     });
//     console.log(dateString);
//     const paddingDays = weekdays.indexOf(dateString.split(",")[0]);

//     monthDisplay.innerText = `${dt.toLocaleDateString(locale, {
//         month: "long"
//     })} ${year}`;
//     // clear previous html in the calendar
//     calendar.innerHTML = "";

//     const frag = document.createDocumentFragment();
//     for (let i = 1; i <= paddingDays + daysInMonth + nextPaddingDays; i++) {
//         const daySquare = document.createElement("div");
//         daySquare.classList.add("day");

//         const dayString = `${month + 1}/${i - paddingDays}/${year}`;
//         if (i > paddingDays && i <= paddingDays + daysInMonth) {
//             daySquare.innerText = i - paddingDays;
//             const eventForDay = events.find((e) => e.date === dayString);
//             // mark current day
//             if (i - paddingDays === day && nav === 0) {
//                 daySquare.id = "currentDay";
//             }
//             // insert the event
//             if (eventForDay) {
//                 const eventDiv = document.createElement("div");
//                 eventDiv.classList.add("event");
//                 eventDiv.innerText = eventForDay.title;
//                 daySquare.appendChild(eventDiv);
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
    if (currentView === 'Agenda') {
        args.element.firstChild.style.borderLeftColor = categoryColor;
    } else {
        args.element.style.backgroundColor = categoryColor;
    }
}

var scheduleObj = new ej.schedule.Schedule({
    height: '650px',
    selectedDate: new Date(2024, 4, 22),
    // eventSettings: { dataSource: data },
    // eventRendered: function(args) {
    //     applyCategoryColor(args, scheduleObj.currentView);
    // }
});

scheduleObj.appendTo('#Schedule');
// initButtons();
// load();
