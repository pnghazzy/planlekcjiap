const times = [
  ["07:10", "07:55"], ["08:00", "08:45"], ["08:50", "09:35"],
  ["09:45", "10:30"], ["10:35", "11:20"], ["11:25", "12:10"],
  ["12:25", "13:10"], ["13:15", "14:00"], ["14:05", "14:50"],
  ["14:55", "15:40"], ["15:45", "16:30"]
];

const common = (subject, room) => ({ subject, room, group: 0 });
const grouped = (group, subject, room) => ({ subject, room, group });
const timetable = [
  {
    name: "Monday", short: "Mon", lessons: {
      1: [grouped(1, "Język angielski", "44")],
      2: [common("Godzina wychowawcza", "29")],
      3: [common("Aplikacje — wykład", "35")],
      4: [common("Matematyka", "19")],
      5: [common("Matematyka", "19")],
      6: [grouped(1, "Aplikacje — pracownia", "26"), grouped(2, "Wychowanie fizyczne", "Gym")],
      7: [grouped(1, "Aplikacje — pracownia", "26"), grouped(2, "Wychowanie fizyczne", "Gym")],
      8: [grouped(1, "Informatyka", "26"), grouped(2, "Język angielski", "23")]
    }
  },
  {
    name: "Tuesday", short: "Tue", lessons: {
      0: [grouped(1, "Język angielski", "44"), grouped(2, "Aplikacje — pracownia", "37")],
      1: [grouped(1, "Język niemiecki", "23"), grouped(2, "Aplikacje — pracownia", "37")],
      2: [grouped(1, "Programowanie obiektowe — pracownia", "41"), grouped(2, "Język niemiecki", "44")],
      3: [common("Matematyka", "36")],
      4: [common("Matematyka", "36")],
      5: [grouped(1, "Wychowanie fizyczne", "Gym"), grouped(2, "Język angielski", "31")],
      6: [grouped(1, "Wychowanie fizyczne", "Gym"), grouped(2, "Informatyka", "40")]
    }
  },
  {
    name: "Wednesday", short: "Wed", lessons: {
      0: [grouped(1, "Bazy danych — pracownia", "40"), grouped(2, "Programowanie obiektowe — pracownia", "37")],
      1: [common("Bazy danych — wykład", "18")],
      2: [common("Programowanie obiektowe — wykład", "21")],
      3: [grouped(1, "Język niemiecki", "42"), grouped(2, "Język obcy zawodowy", "31")],
      4: [common("Język polski", "25")],
      5: [common("Język polski", "25")],
      6: [common("Historia", "14")]
    }
  },
  {
    name: "Thursday", short: "Thu", lessons: {
      1: [grouped(1, "Język obcy zawodowy", "44"), grouped(2, "Język niemiecki", "23")],
      2: [common("Język polski", "38")],
      3: [common("Edukacja obywatelska", "39")],
      4: [common("Chemia", "21")],
      5: [common("Fizyka", "19")],
      6: [grouped(1, "Wychowanie fizyczne", "Gym"), grouped(2, "Projektowanie oprogramowania — pracownia", "37")],
      7: [grouped(2, "Wychowanie fizyczne", "Gym")]
    }
  },
  {
    name: "Friday", short: "Fri", lessons: {
      2: [grouped(2, "Bazy danych — pracownia", "41")],
      3: [common("Edukacja zdrowotna", "15")],
      4: [common("Projektowanie oprogramowania — wykład", "17")],
      5: [common("Podstawy programowania — wykład", "34")],
      6: [common("Biologia", "14")],
      7: [common("Biznes i zarządzanie", "42")],
      8: [common("Geografia", "39")],
      9: [grouped(1, "Projektowanie oprogramowania — pracownia", "37"), grouped(2, "Podstawy programowania — pracownia", "41")],
      10: [grouped(1, "Podstawy programowania — pracownia", "41")]
    }
  }
];

const $ = (selector) => document.querySelector(selector);
let selectedGroup = Number(localStorage.getItem("timetable-group")) || 1;
const warsawNow = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Warsaw" }));
const weekdayIndex = () => {
  const day = warsawNow().getDay();
  return day >= 1 && day <= 5 ? day - 1 : -1;
};
let selectedDay = weekdayIndex() >= 0 ? weekdayIndex() : 0;

function minutes(value) {
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
}

function lessonsFor(dayIndex = selectedDay) {
  return Object.entries(timetable[dayIndex].lessons)
    .map(([period, options]) => ({
      period: Number(period),
      lesson: options.find(item => item.group === selectedGroup) || options.find(item => item.group === 0)
    }))
    .filter(item => item.lesson)
    .sort((a, b) => a.period - b.period);
}

function renderTabs() {
  $("#dayTabs").innerHTML = timetable.map((day, index) => `
    <button type="button" data-day="${index}" aria-selected="${index === selectedDay}">
      <span>${day.short}</span><small>${lessonsFor(index).length} lessons</small>
    </button>
  `).join("");
}

function renderSchedule() {
  const day = timetable[selectedDay];
  const lessons = lessonsFor();
  $("#dayHeading").textContent = day.name;
  $("#lessonCount").textContent = `${lessons.length} ${lessons.length === 1 ? "lesson" : "lessons"}`;
  const today = weekdayIndex();
  const now = warsawNow();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  $("#timeline").innerHTML = lessons.length ? lessons.map(({ period, lesson }) => {
    const [start, end] = times[period];
    const isCurrent = selectedDay === today && nowMinutes >= minutes(start) && nowMinutes < minutes(end);
    const lab = lesson.subject.includes("pracownia") ? "Lab / workshop" : lesson.subject.includes("wykład") ? "Lecture" : `Period ${period}`;
    return `<article class="lesson${isCurrent ? " current" : ""}">
      <div class="time"><strong>${start}</strong><small>to ${end}</small></div>
      <div class="subject"><strong>${lesson.subject}</strong><small>${isCurrent ? "Happening now" : lab}</small></div>
      <div class="room"><small>Room</small>${lesson.room}</div>
    </article>`;
  }).join("") : `<div class="empty">No lessons for Group ${selectedGroup} on ${day.name}.</div>`;
}

function updateStatus() {
  const now = warsawNow();
  const today = weekdayIndex();
  $("#clock").textContent = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  $("#todayLabel").textContent = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();

  if (today < 0) {
    $("#statusTitle").textContent = "No classes today";
    $("#statusDetail").textContent = "Your next school day is Monday.";
    return;
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const lessons = lessonsFor(today);
  const current = lessons.find(({ period }) => nowMinutes >= minutes(times[period][0]) && nowMinutes < minutes(times[period][1]));
  const next = lessons.find(({ period }) => minutes(times[period][0]) > nowMinutes);

  if (current) {
    $("#statusTitle").textContent = current.lesson.subject;
    $("#statusDetail").textContent = `Now · until ${times[current.period][1]} · Room ${current.lesson.room}`;
  } else if (next) {
    const wait = minutes(times[next.period][0]) - nowMinutes;
    $("#statusTitle").textContent = next.lesson.subject;
    $("#statusDetail").textContent = `Next in ${wait} min · ${times[next.period][0]} · Room ${next.lesson.room}`;
  } else {
    $("#statusTitle").textContent = "Classes are finished";
    $("#statusDetail").textContent = "You’re done for today.";
  }
}

function render() {
  document.querySelectorAll("[data-group]").forEach(button => {
    button.setAttribute("aria-pressed", button.dataset.group === String(selectedGroup));
  });
  renderTabs();
  renderSchedule();
  updateStatus();
}

document.addEventListener("click", (event) => {
  const groupButton = event.target.closest("[data-group]");
  const dayButton = event.target.closest("[data-day]");
  if (groupButton) {
    selectedGroup = Number(groupButton.dataset.group);
    localStorage.setItem("timetable-group", selectedGroup);
    render();
  }
  if (dayButton) {
    selectedDay = Number(dayButton.dataset.day);
    render();
  }
});

$("#todayButton").addEventListener("click", () => {
  selectedDay = weekdayIndex() >= 0 ? weekdayIndex() : 0;
  render();
});

const savedTheme = localStorage.getItem("timetable-theme");
if (savedTheme === "light") document.documentElement.dataset.theme = "light";
function syncThemeIcon() {
  $("#themeIcon").textContent = document.documentElement.dataset.theme === "light" ? "☾" : "☀";
}
$("#themeButton").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("timetable-theme", next);
  syncThemeIcon();
});

syncThemeIcon();
render();
setInterval(() => { updateStatus(); renderSchedule(); }, 30000);
