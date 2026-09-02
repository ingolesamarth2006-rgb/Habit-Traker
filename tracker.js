const ONE_DAY = 24 * 60 * 60 * 1000;

const DEFAULT_HABITS = [
  {
    id: "study",
    name: "Study",
    type: "boolean",
    category: "study",
    activeFrom: "2000-01-01",
    archivedAt: null
  },

  {
    id: "gym",
    name: "Gym",
    type: "boolean",
    category: "health",
    activeFrom: "2000-01-01",
    archivedAt: null
  },

  {
    id: "focus",
    name: "Focus",
    type: "boolean",
    category: "habit",
    activeFrom: "2000-01-01",
    archivedAt: null
  },

  {
    id: "communication",
    name: "Communication",
    type: "boolean",
    category: "skill",
    activeFrom: "2000-01-01",
    archivedAt: null
  },

  {
    id: "reading",
    name: "Reading",
    type: "boolean",
    category: "habit",
    activeFrom: "2000-01-01",
    archivedAt: null
  },

  {
    id: "sleep",
    name: "Sleep / Wake-up",
    type: "boolean",
    category: "health",
    activeFrom: "2000-01-01",
    archivedAt: null
  }
];

const TASKS_STORAGE_KEY = "growthMapTasksV1";

let HABITS = loadSavedHabits();

const STORAGE_KEY = "growthMapTrackerV1";

const realToday = new Date();

let viewYear = realToday.getFullYear();
let viewMonth = realToday.getMonth();
let selectedDay = realToday.getDate();

let trackerData = loadTrackerData();

let rafPending = false;


/* =========================================================
   HELPERS
========================================================= */

const $ = (id) => document.getElementById(id);

const clamp = (v, min = 0, max = 1) =>
  Math.min(Math.max(v, min), max);

const range = (v, start, end) =>
  clamp((v - start) / (end - start));

const easeOutCubic = (v) =>
  1 - Math.pow(1 - v, 3);

const pad = (n) =>
  String(n).padStart(2, "0");


function loadSavedHabits() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          TASKS_STORAGE_KEY
        )
      );


    if (
      Array.isArray(saved) &&
      saved.length
    ) {

      const now =
        new Date();


      const todayKey =
        `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}-${String(
          now.getDate()
        ).padStart(2, "0")}`;


      const defaultIds =
        new Set(
          DEFAULT_HABITS.map(
            habit => habit.id
          )
        );


      const migrated =
        saved.map(
          task => ({

            ...task,

            activeFrom:
              task.activeFrom ||
              (
                defaultIds.has(task.id)
                  ? "2000-01-01"
                  : todayKey
              ),

            archivedAt:
              task.archivedAt ?? null

          })
        );


      localStorage.setItem(
        TASKS_STORAGE_KEY,
        JSON.stringify(migrated)
      );


      return migrated;

    }

  }

  catch (error) {

    console.warn(
      "Could not load saved tasks.",
      error
    );

  }


  return DEFAULT_HABITS.map(
    habit => ({ ...habit })
  );

}


function saveHabits() {

  localStorage.setItem(
    TASKS_STORAGE_KEY,
    JSON.stringify(HABITS)
  );

}


function createTaskId(name) {

  const base =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");


  return (
    base ||
    `task-${Date.now()}`
  );

}


function loadTrackerData() {

  try {

    return (
      JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      ) || {}
    );

  }

  catch {

    return {};

  }

}


function saveTrackerData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(trackerData)
  );

}


function getMonthKey(year, month) {

  return `${year}-${String(
    month + 1
  ).padStart(2, "0")}`;

}


function getDaysInMonth(year, month) {

  return new Date(
    year,
    month + 1,
    0
  ).getDate();

}


function getMonthLabel(year, month) {

  return `${
    new Date(year, month, 1)
      .toLocaleString(
        "en-US",
        {
          month: "long"
        }
      )
      .toUpperCase()
  } ${year}`;

}


function dateOnly(date) {

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

}


function isFutureDate(
  year,
  month,
  day
) {

  return (
    new Date(
      year,
      month,
      day
    ) >
    dateOnly(realToday)
  );

}


function isTodayDate(
  year,
  month,
  day
) {

  return (
    year ===
      realToday.getFullYear() &&

    month ===
      realToday.getMonth() &&

    day ===
      realToday.getDate()
  );

}


function getEligibleLastDay(
  year = viewYear,
  month = viewMonth
) {

  const first =
    new Date(
      year,
      month,
      1
    );


  const monthDays =
    getDaysInMonth(
      year,
      month
    );


  if (
    first >
    dateOnly(realToday)
  ) {

    return 0;

  }


  if (
    year ===
      realToday.getFullYear() &&

    month ===
      realToday.getMonth()
  ) {

    return realToday.getDate();

  }


  return monthDays;

}


function getCellState(
  year,
  month,
  habitId,
  day
) {

  return (
    trackerData?.[
      getMonthKey(
        year,
        month
      )
    ]?.[
      habitId
    ]?.[
      day
    ] || ""
  );

}


function setCellState(
  year,
  month,
  habitId,
  day,
  state
) {

  const key =
    getMonthKey(
      year,
      month
    );


  trackerData[key] ??= {};

  trackerData[key][habitId] ??= {};


  if (state) {

    trackerData[key][habitId][day] =
      state;

  }

  else {

    delete trackerData[key][habitId][day];

  }


  saveTrackerData();

}


/* =========================================================
   YEAR COUNTDOWN
========================================================= */

function updateYearData() {

  const now =
    new Date();


  const year =
    now.getFullYear();


  const start =
    new Date(
      year,
      0,
      1
    );


  const end =
    new Date(
      year + 1,
      0,
      1
    );


  const total =
    end - start;


  const elapsed =
    now - start;


  const remaining =
    Math.max(
      end - now,
      0
    );


  const days =
    Math.floor(
      remaining /
      ONE_DAY
    );


  const afterDays =
    remaining %
    ONE_DAY;


  const hours =
    Math.floor(
      afterDays /
      3600000
    );


  const afterHours =
    afterDays %
    3600000;


  const minutes =
    Math.floor(
      afterHours /
      60000
    );


  const seconds =
    Math.floor(
      (
        afterHours %
        60000
      ) /
      1000
    );


  $("daysLeft").textContent =
    days;


  $("hoursLeft").textContent =
    pad(hours);


  $("minutesLeft").textContent =
    pad(minutes);


  $("secondsLeft").textContent =
    pad(seconds);


  const past =
    clamp(
      elapsed / total,
      0,
      1
    ) * 100;


  const future =
    100 - past;


  $("pastPercent").textContent =
    `${past.toFixed(1)}%`;


  $("futurePercent").textContent =
    `${future.toFixed(1)}%`;


  $("daysLived").textContent =
    `${Math.floor(
      elapsed /
      ONE_DAY
    )} DAYS LIVED`;


  $("daysRemaining").textContent =
    `${Math.ceil(
      remaining /
      ONE_DAY
    )} DAYS REMAINING`;


  $("currentYear").textContent =
    year;


  $("journeyStartYear").textContent =
    year;


  $("journeyEndYear").textContent =
    year + 1;


  $("journeyPast").style.width =
    `${past}%`;


  $("journeyMarker").style.left =
    `${past}%`;

}


updateYearData();


setInterval(
  updateYearData,
  1000
);


/* =========================================================
   SAME-SCENE CINEMATIC HERO TRANSITION
========================================================= */

function updateHeroScroll() {

  const stage =
    $("storyStage");


  const distance =
    stage.offsetHeight -
    window.innerHeight;


  const progress =
    clamp(
      (
        window.scrollY -
        stage.offsetTop
      ) /
      Math.max(
        distance,
        1
      )
    );


  const backgroundBase =
    easeOutCubic(progress);


  const dive =
    easeOutCubic(
      range(
        progress,
        0.68,
        1
      )
    );


  const scale =
    1 +
    backgroundBase *
      0.08 +
    dive *
      1.25;


  const y =
    progress *
      -14 +
    dive *
      48;


  const x =
    dive *
    -12;


  $("heroBackground").style.transform =
    `translate3d(
      ${x}px,
      ${y}px,
      0
    )
    scale(${scale})`;


  $("heroBackground").style.filter =
    `brightness(
      ${
        0.96 -
        progress * 0.18 +
        dive * 0.08
      }
    )
    contrast(
      ${
        1.04 +
        dive * 0.05
      }
    )
    saturate(
      ${
        1.06 +
        dive * 0.18
      }
    )`;


  $("heroDepth").style.background =
    `radial-gradient(
      circle at 50% 52%,
      rgba(
        85,
        170,
        235,
        ${
          0.05 +
          dive * 0.18
        }
      ),
      transparent ${
        30 +
        dive * 12
      }%
    ),
    rgba(
      1,
      5,
      12,
      ${
        progress *
        0.14
      }
    )`;


  const countdownExit =
    range(
      progress,
      0.10,
      0.46
    );


  $("countdownArea").style.opacity =
    1 -
    countdownExit;


  $("countdownArea").style.transform =
    `translateY(
      calc(
        -50% +
        ${
          countdownExit *
          -95
        }px
      )
    )
    scale(
      ${
        1 -
        countdownExit *
        0.055
      }
    )`;


  const journeyExit =
    range(
      progress,
      0.16,
      0.52
    );


  $("yearProgress").style.opacity =
    1 -
    journeyExit;


  $("yearProgress").style.transform =
    `translateY(
      ${
        journeyExit *
        55
      }px
    )
    scale(
      ${
        1 -
        journeyExit *
        0.025
      }
    )`;


  const topExit =
    range(
      progress,
      0.36,
      0.62
    );


  $("heroTop").style.opacity =
    1 -
    topExit;


  $("heroTop").style.transform =
    `translateY(
      ${
        topExit *
        -28
      }px
    )`;


  const portalProgress =
    easeOutCubic(
      range(
        progress,
        0.34,
        0.70
      )
    );


  const portalFade =
    1 -
    range(
      progress,
      0.82,
      1
    );


  $("portal").style.opacity =
    portalProgress *
    portalFade;


  $("portal").style.transform =
    `translate(
      -50%,
      -50%
    )
    scale(
      ${
        0.15 +
        portalProgress *
          2.2 +
        dive *
          1.1
      }
    )`;


  const chapterIn =
    easeOutCubic(
      range(
        progress,
        0.52,
        0.78
      )
    );


  const chapterOut =
    easeOutCubic(
      range(
        progress,
        0.79,
        0.985
      )
    );


  $("chapterReveal").style.opacity =
    chapterIn *
    (
      1 -
      chapterOut
    );


  $("chapterReveal").style.transform =
    `translate(
      -50%,
      -50%
    )
    translateY(
      ${
        (
          1 -
          chapterIn
        ) *
        55 -
        chapterOut *
        90
      }px
    )
    scale(
      ${
        0.94 +
        chapterIn *
          0.06 +
        chapterOut *
          0.85
      }
    )`;


  $("cameraDiveLabel").style.opacity =
    1 -
    range(
      progress,
      0.08,
      0.22
    );

}


/* =========================================================
   TRACKER SCORING
========================================================= */

function makeDateKey(
  year,
  month,
  day
) {

  return `${year}-${String(
    month + 1
  ).padStart(
    2,
    "0"
  )}-${String(
    day
  ).padStart(
    2,
    "0"
  )}`;

}


function getActiveHabitsForDay(
  year,
  month,
  day
) {

  const dateKey =
    makeDateKey(
      year,
      month,
      day
    );


  return HABITS.filter(
    habit => {

      const activeFrom =
        habit.activeFrom ||
        "2000-01-01";


      const archivedAt =
        habit.archivedAt ||
        null;


      const started =
        dateKey >=
        activeFrom;


      const notArchived =
        !archivedAt ||
        dateKey <
          archivedAt;


      return (
        started &&
        notArchived
      );

    }
  );

}


function getDayStats(
  year,
  month,
  day
) {

  const activeHabits =
    getActiveHabitsForDay(
      year,
      month,
      day
    );


  let done = 0;

  let missed = 0;

  let unmarked = 0;


  activeHabits.forEach(
    habit => {

      const state =
        getCellState(
          year,
          month,
          habit.id,
          day
        );


      if (
        state ===
        "done"
      ) {

        done++;

      }

      else if (
        state ===
        "missed"
      ) {

        missed++;

      }

      else {

        unmarked++;

      }

    }
  );


  const total =
    activeHabits.length;


  const percentage =
    total > 0
      ? Math.round(
          (
            done /
            total
          ) *
          100
        )
      : 0;


  return {

    done,

    missed,

    unmarked,

    total,

    percentage

  };

}


/* =========================================================
   ELEMENT HELPER
========================================================= */

function createDiv(
  className,
  text = ""
) {

  const div =
    document.createElement(
      "div"
    );


  div.className =
    className;


  div.textContent =
    text;


  return div;

}


/* =========================================================
   TRACKER RENDER
========================================================= */

function renderTracker() {

  const days =
    getDaysInMonth(
      viewYear,
      viewMonth
    );


  selectedDay =
    Math.min(
      selectedDay,
      days
    );


  $("monthName").textContent =
    getMonthLabel(
      viewYear,
      viewMonth
    );


  $("graphMonthTitle").textContent =
    getMonthLabel(
      viewYear,
      viewMonth
    );


  const grid =
    $("trackerGrid");


  grid.innerHTML =
    "";


  grid.style.setProperty(
    "--days",
    days
  );


  grid.appendChild(
    createDiv(
      "grid-corner",
      "HABIT / DAY"
    )
  );


  /* DAY HEADERS */

  for (
    let day = 1;
    day <= days;
    day++
  ) {

    const header =
      createDiv(
        "day-header"
      );


    const weekday =
      new Date(
        viewYear,
        viewMonth,
        day
      )
        .toLocaleString(
          "en-US",
          {
            weekday:
              "short"
          }
        )
        .toUpperCase();


    header.innerHTML =
      `<strong>${day}</strong>
       <span>${weekday}</span>`;


    if (
      day ===
      selectedDay
    ) {

      header.classList.add(
        "is-selected-day"
      );

    }


    if (
      isTodayDate(
        viewYear,
        viewMonth,
        day
      )
    ) {

      header.classList.add(
        "is-today",
        "is-today-column"
      );

    }

header.addEventListener(
  "click",
  () => {

    if (
      isFutureDate(
        viewYear,
        viewMonth,
        day
      )
    ) {
      return;
    }

    const dateKey =
      makeDateKey(
        viewYear,
        viewMonth,
        day
      );

    window.location.href =
      `day.html?date=${dateKey}`;

  }
);


    grid.appendChild(
      header
    );

  }


  /* HABIT ROWS */

  HABITS.forEach(
    habit => {

      grid.appendChild(
        createDiv(
          "habit-name",
          habit.name
        )
      );


      for (
        let day = 1;
        day <= days;
        day++
      ) {

        const cell =
          createDiv(
            "habit-cell"
          );


        const state =
          getCellState(
            viewYear,
            viewMonth,
            habit.id,
            day
          );


        const future =
          isFutureDate(
            viewYear,
            viewMonth,
            day
          );


        if (
          day ===
          selectedDay
        ) {

          cell.classList.add(
            "is-selected-day"
          );

        }


        if (
          isTodayDate(
            viewYear,
            viewMonth,
            day
          )
        ) {

          cell.classList.add(
            "is-today-column"
          );

        }


        if (future) {

          cell.classList.add(
            "future-cell"
          );

        }


        if (
          state ===
          "done"
        ) {

          cell.innerHTML =
            `<span class="tick-mark">
              ✓
            </span>`;

        }

        else if (
          state ===
          "missed"
        ) {

          cell.innerHTML =
            `<span class="miss-mark">
              ×
            </span>`;

        }


        if (!future) {

          cell.addEventListener(
            "click",
            () => {

              selectedDay =
                day;


              const next =
                state === ""
                  ? "done"
                  : state ===
                    "done"
                    ? "missed"
                    : "";


              setCellState(
                viewYear,
                viewMonth,
                habit.id,
                day,
                next
              );


              renderTracker();

            }
          );

        }


        grid.appendChild(
          cell
        );

      }

    }
  );


  /* DAILY SCORE */

  grid.appendChild(
    createDiv(
      "score-title",
      "DAILY SCORE"
    )
  );


  for (
    let day = 1;
    day <= days;
    day++
  ) {

    const scoreCell =
      createDiv(
        "daily-score"
      );


    const future =
      isFutureDate(
        viewYear,
        viewMonth,
        day
      );


    const stats =
      getDayStats(
        viewYear,
        viewMonth,
        day
      );


    if (
      day ===
      selectedDay
    ) {

      scoreCell.classList.add(
        "is-selected-day"
      );

    }


    if (
      isTodayDate(
        viewYear,
        viewMonth,
        day
      )
    ) {

      scoreCell.classList.add(
        "is-today-column"
      );

    }


    if (future) {

      scoreCell.classList.add(
        "future-cell"
      );


      scoreCell.innerHTML =
        `<strong>—</strong>
         <small>FUTURE</small>`;

    }

    else {

      scoreCell.innerHTML =
        `
        <div
          class="score-mini-ring"
          style="--score:${stats.percentage}"
        ></div>

        <strong>
          ${stats.percentage}%
        </strong>

        <small>
          ${stats.done}/${stats.total}
        </small>
        `;


      scoreCell.addEventListener(
        "click",
        () => {

          selectedDay =
            day;


          renderTracker();

        }
      );

    }


    grid.appendChild(
      scoreCell
    );

  }


  updateSelectedDay();

  updateTodayComparison();

  updateMonthPerformance();

  renderGrowthGraph();

  renderRadarGraph();

  buildGraphTransition();

}


/* =========================================================
   SELECTED DAY
========================================================= */

function updateSelectedDay() {

  const date =
    new Date(
      viewYear,
      viewMonth,
      selectedDay
    );


  const stats =
    getDayStats(
      viewYear,
      viewMonth,
      selectedDay
    );


  const future =
    isFutureDate(
      viewYear,
      viewMonth,
      selectedDay
    );


  $("selectedDate").textContent =
    date
      .toLocaleString(
        "en-US",
        {
          weekday:
            "long",

          month:
            "short",

          day:
            "numeric"
        }
      )
      .toUpperCase();


  $("selectedPercentage").textContent =
    future
      ? "—"
      : `${stats.percentage}%`;


  $("selectedCount").textContent =
    future
      ? "FUTURE DAY"
      : `${stats.done} / ${stats.total} DONE`;


  $("selectedCompleted").textContent =
    stats.done;


  $("selectedMissed").textContent =
    stats.missed;


  $("selectedUnmarked").textContent =
    stats.unmarked;


  $("largeScoreRing")
    .style
    .setProperty(
      "--score",
      future
        ? 0
        : stats.percentage
    );

}


/* =========================================================
   TODAY VS YESTERDAY
========================================================= */

function updateTodayComparison() {

  const today =
    new Date();


  const yesterday =
    new Date();


  yesterday.setDate(
    yesterday.getDate() -
    1
  );


  const todayStats =
    getDayStats(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );


  const yesterdayStats =
    getDayStats(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );


  const delta =
    todayStats.percentage -
    yesterdayStats.percentage;


  $("todayScore").textContent =
    `${todayStats.percentage}%`;


  $("yesterdayScore").textContent =
    `${yesterdayStats.percentage}%`;


  $("scoreDelta").textContent =
    `${
      delta > 0
        ? "+"
        : ""
    }${delta}%`;


  $("compareMessage").textContent =
    delta > 0
      ? "YOU MOVED FORWARD"

      : delta < 0
        ? "TODAY CAN STILL CHANGE"

        : "SAME LEVEL — KEEP BUILDING";

}


/* =========================================================
   HABIT SCORES
========================================================= */

function calculateHabitScores() {

  const lastDay =
    getEligibleLastDay();


  if (
    lastDay === 0
  ) {

    return HABITS.map(
      habit => ({
        ...habit,
        score: 0
      })
    );

  }


  return HABITS.map(
    habit => {

      let done = 0;


      for (
        let day = 1;
        day <= lastDay;
        day++
      ) {

        if (
          getCellState(
            viewYear,
            viewMonth,
            habit.id,
            day
          ) ===
          "done"
        ) {

          done++;

        }

      }


      return {

        ...habit,

        score:
          Math.round(
            (
              done /
              lastDay
            ) *
            100
          )

      };

    }
  );

}


/* =========================================================
   MONTH PERFORMANCE
========================================================= */

function updateMonthPerformance() {

  const lastDay =
    getEligibleLastDay();


  if (!lastDay) {

    $("monthAverage").textContent =
      "0%";


    $("bestDay").textContent =
      "—";


    $("monthStreak").textContent =
      "0 DAYS";


    $("perfectDays").textContent =
      "0";


    $("bestHabit").textContent =
      "—";


    $("weakestHabit").textContent =
      "—";


    return;

  }


  const daily = [];


  for (
    let day = 1;
    day <= lastDay;
    day++
  ) {

    daily.push({

      day,

      score:
        getDayStats(
          viewYear,
          viewMonth,
          day
        ).percentage

    });

  }


  const average =
    Math.round(
      daily.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.score,
        0
      ) /
      daily.length
    );


  const best =
    daily.reduce(
      (
        a,
        b
      ) =>
        b.score >
        a.score
          ? b
          : a
    );


  const perfect =
    daily.filter(
      item =>
        item.score ===
        100
    ).length;


  let streak = 0;


  for (
    let day = lastDay;
    day >= 1;
    day--
  ) {

    if (
      getDayStats(
        viewYear,
        viewMonth,
        day
      ).percentage >=
      70
    ) {

      streak++;

    }

    else {

      break;

    }

  }


  const habits =
    calculateHabitScores()
      .sort(
        (
          a,
          b
        ) =>
          b.score -
          a.score
      );


  $("monthAverage").textContent =
    `${average}%`;


  $("bestDay").textContent =
    `DAY ${best.day} · ${best.score}%`;


  $("monthStreak").textContent =
    `${streak} ${
      streak === 1
        ? "DAY"
        : "DAYS"
    }`;


  $("perfectDays").textContent =
    perfect;


  if (
    habits.length
  ) {

    $("bestHabit").textContent =
      `${habits[0].name} · ${habits[0].score}%`;


    $("weakestHabit").textContent =
      `${
        habits[
          habits.length -
          1
        ].name
      } · ${
        habits[
          habits.length -
          1
        ].score
      }%`;

  }

}


/* =========================================================
   MONTH NAVIGATION
========================================================= */

$("previousMonth")
  .addEventListener(
    "click",
    () => {

      viewMonth--;


      if (
        viewMonth < 0
      ) {

        viewMonth =
          11;

        viewYear--;

      }


      selectedDay =
        1;


      renderTracker();

    }
  );


$("nextMonth")
  .addEventListener(
    "click",
    () => {

      viewMonth++;


      if (
        viewMonth >
        11
      ) {

        viewMonth =
          0;

        viewYear++;

      }


      selectedDay =
        1;


      renderTracker();

    }
  );


$("todayButton")
  .addEventListener(
    "click",
    () => {

      const now =
        new Date();


      viewYear =
        now.getFullYear();


      viewMonth =
        now.getMonth();


      selectedDay =
        now.getDate();


      renderTracker();

    }
  );


$("yesterdayButton")
  .addEventListener(
    "click",
    () => {

      const date =
        new Date();


      date.setDate(
        date.getDate() -
        1
      );


      viewYear =
        date.getFullYear();


      viewMonth =
        date.getMonth();


      selectedDay =
        date.getDate();


      renderTracker();

    }
  );


/* =========================================================
   GRAPH COLORS
========================================================= */

function scoreColor(score) {

  if (
    score < 40
  ) {

    return "#ff5574";

  }


  if (
    score < 70
  ) {

    return "#ffbd55";

  }


  if (
    score < 90
  ) {

    return "#58dcff";

  }


  if (
    score < 100
  ) {

    return "#9b78ff";

  }


  return "#f3f7ff";

}


/* =========================================================
   SMOOTH SVG PATH
========================================================= */

function buildSmoothPath(points) {

  if (
    !points.length
  ) {

    return "";

  }


  if (
    points.length ===
    1
  ) {

    return `M ${points[0].x} ${points[0].y}`;

  }


  let path =
    `M ${points[0].x} ${points[0].y}`;


  for (
    let i = 0;
    i <
      points.length -
      1;
    i++
  ) {

    const a =
      points[i];


    const b =
      points[
        i + 1
      ];


    const middleX =
      (
        a.x +
        b.x
      ) /
      2;


    path +=
      ` C ${middleX} ${a.y},
          ${middleX} ${b.y},
          ${b.x} ${b.y}`;

  }


  return path;

}


/* =========================================================
   MAIN DAILY GRAPH
========================================================= */

function renderGrowthGraph() {

  const days =
    getDaysInMonth(
      viewYear,
      viewMonth
    );


  const lastDay =
    getEligibleLastDay();


  const width =
    1200;

  const height =
    440;

  const left =
    70;

  const right =
    40;

  const top =
    45;

  const bottom =
    55;


  const chartWidth =
    width -
    left -
    right;


  const chartHeight =
    height -
    top -
    bottom;


  const baseline =
    top +
    chartHeight;


  const x =
    day =>
      left +
      (
        (
          day -
          1
        ) /
        Math.max(
          days -
          1,
          1
        )
      ) *
      chartWidth;


  const y =
    score =>
      top +
      (
        1 -
        score /
        100
      ) *
      chartHeight;


  const points =
    [];


  for (
    let day = 1;
    day <= lastDay;
    day++
  ) {

    const stats =
      getDayStats(
        viewYear,
        viewMonth,
        day
      );


    points.push({

      day,

      score:
        stats.percentage,

      done:
        stats.done,

      total:
        stats.total,

      x:
        x(day),

      y:
        y(
          stats.percentage
        )

    });

  }


  let grid =
    "";


  [
    100,
    75,
    50,
    25,
    0
  ].forEach(
    value => {

      const pointY =
        y(value);


      grid +=
        `
        <line
          class="graph-grid"
          x1="${left}"
          y1="${pointY}"
          x2="${width - right}"
          y2="${pointY}"
        />

        <text
          class="graph-label"
          x="${left - 16}"
          y="${pointY + 4}"
          text-anchor="end"
        >
          ${value}%
        </text>
        `;

    }
  );


  let labels =
    "";


  [
    ...new Set(
      [
        1,
        5,
        10,
        15,
        20,
        25,
        days
      ].filter(
        day =>
          day <=
          days
      )
    )
  ].forEach(
    day => {

      labels +=
        `
        <text
          class="graph-label"
          x="${x(day)}"
          y="${height - 17}"
          text-anchor="middle"
        >
          ${day}
        </text>
        `;

    }
  );


  if (
    !points.length
  ) {

    $("growthChart").innerHTML =
      `${grid}${labels}`;


    return;

  }


  const path =
    buildSmoothPath(
      points
    );


  const first =
    points[0];


  const last =
    points[
      points.length -
      1
    ];


  const area =
    points.length >
    1
      ?
      `${path}
       L ${last.x} ${baseline}
       L ${first.x} ${baseline}
       Z`
      :
      "";


  const stops =
    points
      .map(
        point =>
          `
          <stop
            offset="${
              (
                (
                  point.x -
                  left
                ) /
                chartWidth
              ) *
              100
            }%"
            stop-color="${
              scoreColor(
                point.score
              )
            }"
          />
          `
      )
      .join("");


  let pointMarkup =
    "";


  points.forEach(
    point => {

      const color =
        scoreColor(
          point.score
        );


      const today =
        isTodayDate(
          viewYear,
          viewMonth,
          point.day
        );


      pointMarkup +=
        `
        ${
          today
            ?
            `
            <line
              class="today-beam"
              x1="${point.x}"
              y1="${top}"
              x2="${point.x}"
              y2="${baseline}"
              stroke="${color}"
            />

            <circle
              class="today-ring"
              cx="${point.x}"
              cy="${point.y}"
              r="15"
              stroke="${color}"
            />
            `
            :
            ""
        }

        <circle
          class="graph-point-aura"
          cx="${point.x}"
          cy="${point.y}"
          r="${
            point.score === 100
              ? 16
              : 11
          }"
          fill="${color}"
        />

        <circle
          class="graph-point"
          data-day="${point.day}"
          data-score="${point.score}"
          data-done="${point.done}"
          data-total="${point.total}"
          cx="${point.x}"
          cy="${point.y}"
          r="${
            point.score === 100
              ? 6
              : 4.5
          }"
          fill="${color}"
        />
        `;

    }
  );


  $("growthChart").innerHTML =
    `
    <defs>

      <linearGradient
        id="dailyGradient"
        x1="${left}"
        y1="0"
        x2="${width - right}"
        y2="0"
        gradientUnits="userSpaceOnUse"
      >
        ${stops}
      </linearGradient>


      <linearGradient
        id="areaGradient"
        x1="0"
        y1="${top}"
        x2="0"
        y2="${baseline}"
        gradientUnits="userSpaceOnUse"
      >

        <stop
          offset="0%"
          stop-color="#69dfff"
          stop-opacity=".18"
        />

        <stop
          offset="55%"
          stop-color="#826aff"
          stop-opacity=".07"
        />

        <stop
          offset="100%"
          stop-color="#000"
          stop-opacity="0"
        />

      </linearGradient>

    </defs>


    ${grid}

    ${labels}


    ${
      area
        ?
        `<path
          class="graph-area"
          d="${area}"
        />`
        :
        ""
    }


    ${
      points.length > 1
        ?
        `
        <path
          class="graph-glow"
          d="${path}"
        />

        <path
          class="graph-line"
          id="dailyGraphLine"
          d="${path}"
        />
        `
        :
        ""
    }


    ${pointMarkup}
    `;


  const line =
    $("dailyGraphLine");


  if (line) {

    const length =
      line.getTotalLength();


    line.dataset.length =
      length;


    line.style.strokeDasharray =
      length;


    line.style.strokeDashoffset =
      length;

  }


  document
    .querySelectorAll(
      ".graph-point"
    )
    .forEach(
      point => {

        point.addEventListener(
          "mousemove",
          event => {

            const shell =
              document.querySelector(
                ".web-chart-shell"
              );


            const rect =
              shell.getBoundingClientRect();


            $("graphTooltip").style.left =
              `${
                event.clientX -
                rect.left
              }px`;


            $("graphTooltip").style.top =
              `${
                event.clientY -
                rect.top
              }px`;


            $("graphTooltip").innerHTML =
              `
              DAY ${point.dataset.day}

              <br>

              <strong>
                ${point.dataset.score}%
              </strong>

              <br>

              ${point.dataset.done}/${point.dataset.total}
              COMPLETE
              `;


            $("graphTooltip").style.opacity =
              1;

          }
        );


        point.addEventListener(
          "mouseleave",
          () => {

            $("graphTooltip").style.opacity =
              0;

          }
        );

      }
    );

}


/* =========================================================
   RADAR GRAPH
========================================================= */

function renderRadarGraph() {

  const scores =
    calculateHabitScores();


  if (
    !scores.length
  ) {

    $("habitRadar").innerHTML =
      "";

    $("balanceScore").textContent =
      "0%";

    return;

  }


  const cx =
    300;

  const cy =
    280;

  const radius =
    185;

  const count =
    scores.length;


  const pointFor =
    (
      index,
      percentage
    ) => {

      const angle =
        -Math.PI /
        2 +
        (
          index /
          count
        ) *
        Math.PI *
        2;


      const distance =
        radius *
        percentage /
        100;


      return {

        x:
          cx +
          Math.cos(
            angle
          ) *
          distance,

        y:
          cy +
          Math.sin(
            angle
          ) *
          distance

      };

    };


  let rings =
    "";

  let axes =
    "";

  let labels =
    "";

  let nodes =
    "";


  [
    20,
    40,
    60,
    80,
    100
  ].forEach(
    level => {

      const polygon =
        scores
          .map(
            (
              _,
              index
            ) => {

              const point =
                pointFor(
                  index,
                  level
                );


              return `${point.x},${point.y}`;

            }
          )
          .join(" ");


      rings +=
        `
        <polygon
          points="${polygon}"
          fill="none"
          stroke="rgba(145,210,245,.10)"
          stroke-width="1"
        />
        `;

    }
  );


  scores.forEach(
    (
      habit,
      index
    ) => {

      const edge =
        pointFor(
          index,
          100
        );


      const label =
        pointFor(
          index,
          120
        );


      const point =
        pointFor(
          index,
          habit.score
        );


      const color =
        scoreColor(
          habit.score
        );


      axes +=
        `
        <line
          x1="${cx}"
          y1="${cy}"
          x2="${edge.x}"
          y2="${edge.y}"
          stroke="rgba(145,210,245,.09)"
        />
        `;


      labels +=
        `
        <text
          x="${label.x}"
          y="${label.y - 4}"
          text-anchor="middle"
          fill="rgba(220,240,250,.52)"
          font-size="11"
          font-family="DM Mono"
        >
          ${habit.name.toUpperCase()}
        </text>

        <text
          x="${label.x}"
          y="${label.y + 13}"
          text-anchor="middle"
          fill="${color}"
          font-size="9"
          font-family="DM Mono"
        >
          ${habit.score}%
        </text>
        `;


      nodes +=
        `
        <circle
          cx="${point.x}"
          cy="${point.y}"
          r="10"
          fill="${color}"
          opacity=".14"
        />

        <circle
          cx="${point.x}"
          cy="${point.y}"
          r="4"
          fill="${color}"
          stroke="rgba(245,252,255,.75)"
          stroke-width="1"
        />
        `;

    }
  );


  const dataPolygon =
    scores
      .map(
        (
          habit,
          index
        ) => {

          const point =
            pointFor(
              index,
              habit.score
            );


          return `${point.x},${point.y}`;

        }
      )
      .join(" ");


  $("habitRadar").innerHTML =
    `
    <defs>

      <linearGradient
        id="radarStroke"
        x1="100"
        y1="100"
        x2="500"
        y2="500"
        gradientUnits="userSpaceOnUse"
      >

        <stop
          offset="0%"
          stop-color="#48ddff"
        />

        <stop
          offset="50%"
          stop-color="#727fff"
        />

        <stop
          offset="100%"
          stop-color="#d76eff"
        />

      </linearGradient>


      <radialGradient
        id="radarFill"
        cx="50%"
        cy="50%"
        r="60%"
      >

        <stop
          offset="0%"
          stop-color="#4edbff"
          stop-opacity=".15"
        />

        <stop
          offset="65%"
          stop-color="#856cff"
          stop-opacity=".10"
        />

        <stop
          offset="100%"
          stop-color="#d85fff"
          stop-opacity=".045"
        />

      </radialGradient>

    </defs>


    ${rings}

    ${axes}


    <polygon
      points="${dataPolygon}"
      fill="url(#radarFill)"
      stroke="url(#radarStroke)"
      stroke-width="2.4"
    />


    ${nodes}

    ${labels}
    `;


  const average =
    Math.round(
      scores.reduce(
        (
          sum,
          habit
        ) =>
          sum +
          habit.score,
        0
      ) /
      scores.length
    );


  $("balanceScore").textContent =
    `${average}%`;

}


/* =========================================================
   DATA DRIVEN TRACKER → GRAPH TRANSITION
========================================================= */

function buildGraphTransition() {

  const svg =
    $("transitionSvg");


  const nodesLayer =
    $("transitionNodes");


  const lastDay =
    getEligibleLastDay();


  svg.innerHTML =
    "";


  nodesLayer.innerHTML =
    "";


  const defs =
    document.createElementNS(
      "http://www.w3.org/2000/svg",
      "defs"
    );


  defs.innerHTML =
    `
    <linearGradient
      id="transitionGradient"
      x1="100"
      y1="600"
      x2="1100"
      y2="100"
      gradientUnits="userSpaceOnUse"
    >

      <stop
        offset="0%"
        stop-color="#58dcff"
      />

      <stop
        offset="45%"
        stop-color="#6b9cff"
      />

      <stop
        offset="75%"
        stop-color="#9b78ff"
      />

      <stop
        offset="100%"
        stop-color="#ff5d9f"
      />

    </linearGradient>


    <linearGradient
      id="pulseGradient"
      x1="100"
      y1="600"
      x2="1100"
      y2="100"
      gradientUnits="userSpaceOnUse"
    >

      <stop
        offset="0%"
        stop-color="#fff"
      />

      <stop
        offset="30%"
        stop-color="#72e5ff"
      />

      <stop
        offset="70%"
        stop-color="#ae89ff"
      />

      <stop
        offset="100%"
        stop-color="#ff78b5"
      />

    </linearGradient>
    `;


  svg.appendChild(
    defs
  );


  if (!lastDay) {

    return;

  }


  const count =
    Math.min(
      lastDay,
      8
    );


  const startDay =
    lastDay -
    count +
    1;


  const points =
    [];


  for (
    let index = 0;
    index < count;
    index++
  ) {

    const day =
      startDay +
      index;


    const score =
      getDayStats(
        viewYear,
        viewMonth,
        day
      ).percentage;


    const x =
      170 +
      (
        index /
        Math.max(
          count -
          1,
          1
        )
      ) *
      860;


    const y =
      500 -
      (
        score /
        100
      ) *
      330 +
      (
        index %
        2 ===
        0
          ? -18
          : 18
      );


    points.push({

      day,

      score,

      x,

      y

    });

  }


  const path =
    buildSmoothPath(
      points
    );


  const main =
    document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );


  main.setAttribute(
    "d",
    path
  );


  main.setAttribute(
    "class",
    "transition-thread"
  );


  const pulse =
    document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );


  pulse.setAttribute(
    "d",
    path
  );


  pulse.setAttribute(
    "class",
    "transition-pulse"
  );


  svg.appendChild(
    main
  );


  svg.appendChild(
    pulse
  );


  const length =
    main.getTotalLength();


  main.style.strokeDasharray =
    length;


  main.style.strokeDashoffset =
    length;


  main.dataset.length =
    length;


  points.forEach(
    point => {

      const node =
        document.createElement(
          "div"
        );


      node.className =
        "transition-node";


      node.style.left =
        `${
          (
            point.x /
            1200
          ) *
          100
        }%`;


      node.style.top =
        `${
          (
            point.y /
            650
          ) *
          100
        }%`;


      node.style.setProperty(
        "--node-color",
        scoreColor(
          point.score
        )
      );


      node.title =
        `Day ${point.day}: ${point.score}%`;


      nodesLayer.appendChild(
        node
      );

    }
  );

}


/* =========================================================
   GRAPH TRANSITION SCROLL
========================================================= */

function updateGraphTransitionScroll() {

  const stage =
    $("graphTransitionStage");


  const distance =
    stage.offsetHeight -
    window.innerHeight;


  const progress =
    clamp(
      (
        window.scrollY -
        stage.offsetTop
      ) /
      Math.max(
        distance,
        1
      )
    );


  const path =
    document.querySelector(
      ".transition-thread"
    );


  if (
    path?.dataset.length
  ) {

    const length =
      Number(
        path.dataset.length
      );


    const draw =
      easeOutCubic(
        range(
          progress,
          0.12,
          0.60
        )
      );


    path.style.strokeDashoffset =
      length *
      (
        1 -
        draw
      );

  }


  const nodeIn =
    easeOutCubic(
      range(
        progress,
        0.04,
        0.38
      )
    );


  document
    .querySelectorAll(
      ".transition-node"
    )
    .forEach(
      (
        node,
        index
      ) => {

        node.style.opacity =
          clamp(
            nodeIn *
              1.3 -
            index *
              0.05
          );


        node.style.transform =
          `translate(
            -50%,
            -50%
          )
          scale(
            ${
              0.35 +
              nodeIn *
              (
                0.75 +
                (
                  index %
                  3
                ) *
                0.08
              )
            }
          )`;

      }
    );


  const copy =
    easeOutCubic(
      range(
        progress,
        0.42,
        0.75
      )
    );


  $("transitionCopy").style.opacity =
    copy;


  $("transitionCopy").style.transform =
    `translate(
      -50%,
      -50%
    )
    translateY(
      ${
        (
          1 -
          copy
        ) *
        55
      }px
    )
    scale(
      ${
        0.95 +
        copy *
        0.05
      }
    )`;


  $("transitionProgress").style.width =
    `${progress * 100}%`;


  $("transitionAurora").style.transform =
    `translate3d(
      ${
        (
          progress -
          0.5
        ) *
        80
      }px,
      ${
        progress *
        -45
      }px,
      0
    )
    scale(
      ${
        1 +
        progress *
        0.22
      }
    )`;


  $("transitionAurora").style.opacity =
    0.35 +
    progress *
    0.45;

}


/* =========================================================
   AMBIENT SCROLL
========================================================= */

function updateAmbientScroll() {

  const monthlyRect =
    $("monthly")
      .getBoundingClientRect();


  const monthlyProgress =
    clamp(
      (
        window.innerHeight -
        monthlyRect.top
      ) /
      (
        monthlyRect.height +
        window.innerHeight
      )
    );


  $("monthlyAmbient").style.transform =
    `translateX(-50%)
     translateY(
       ${
         monthlyProgress *
         180
       }px
     )
     scale(
       ${
         1 +
         monthlyProgress *
         0.18
       }
     )`;


  const trackerRect =
    $("trackerPerspective")
      .getBoundingClientRect();


  const trackerProgress =
    clamp(
      (
        window.innerHeight -
        trackerRect.top
      ) /
      (
        window.innerHeight +
        trackerRect.height
      )
    );


  $("trackerPerspective").style.transform =
    `translateY(
      ${
        (
          1 -
          trackerProgress
        ) *
        14
      }px
    )
    rotateX(
      ${
        (
          0.5 -
          trackerProgress
        ) *
        1.8
      }deg
    )`;


  const graphRect =
    $("graphSection")
      .getBoundingClientRect();


  const graphProgress =
    clamp(
      (
        window.innerHeight -
        graphRect.top
      ) /
      (
        graphRect.height +
        window.innerHeight
      )
    );


  $("graphAmbient").style.transform =
    `translateX(-50%)
     translateY(
       ${
         graphProgress *
         220
       }px
     )
     scale(
       ${
         1 +
         graphProgress *
         0.28
       }
     )`;


  const cardRect =
    $("mainWebCard")
      .getBoundingClientRect();


  const draw =
    easeOutCubic(
      clamp(
        (
          window.innerHeight *
          0.82 -
          cardRect.top
        ) /
        Math.max(
          cardRect.height *
          0.8,
          1
        )
      )
    );


  const line =
    $("dailyGraphLine");


  if (
    line?.dataset.length
  ) {

    const length =
      Number(
        line.dataset.length
      );


    line.style.strokeDashoffset =
      length *
      (
        1 -
        draw
      );

  }

}


/* =========================================================
   GLOBAL SCROLL
========================================================= */

function onScroll() {

  if (
    rafPending
  ) {

    return;

  }


  rafPending =
    true;


  requestAnimationFrame(
    () => {

      rafPending =
        false;


      updateHeroScroll();

      updateGraphTransitionScroll();

      updateAmbientScroll();

    }
  );

}


window.addEventListener(
  "scroll",
  onScroll,
  {
    passive: true
  }
);


window.addEventListener(
  "resize",
  onScroll
);


/* =========================================================
   REVEAL OBSERVER
========================================================= */

const observer =
  new IntersectionObserver(
    entries => {

      entries.forEach(
        entry => {

          if (
            entry.isIntersecting
          ) {

            entry.target
              .classList
              .add(
                "is-visible"
              );


            observer.unobserve(
              entry.target
            );

          }

        }
      );

    },
    {
      threshold:
        0.14
    }
  );


document
  .querySelectorAll(
    ".reveal-block"
  )
  .forEach(
    element =>
      observer.observe(
        element
      )
  );


/* =========================================================
   START
========================================================= */

renderTracker();

onScroll();


/* =========================================================
   TASK MANAGER
========================================================= */

let editingTaskId =
  null;


function openAddTaskModal() {

  editingTaskId =
    null;


  $("taskModalOverlay")
    .classList
    .remove(
      "mode-edit"
    );


  $("taskModalOverlay")
    .classList
    .add(
      "is-open"
    );


  $("taskModalTitle").textContent =
    "ADD NEW TASK";


  $("saveTaskButton").textContent =
    "CREATE TASK";


  $("taskNameInput").value =
    "";


  $("taskTypeInput").value =
    "boolean";


  $("taskCategoryInput").value =
    "habit";


  $("taskFrequencyInput").value =
    "daily";


  $("taskTargetInput").value =
    "";


  updateTargetField();


  setTimeout(
    () => {

      $("taskNameInput")
        .focus();

    },
    100
  );

}


function openEditTasksModal() {

  editingTaskId =
    null;


  $("taskModalOverlay")
    .classList
    .add(
      "is-open",
      "mode-edit"
    );


  $("taskModalTitle").textContent =
    "EDIT TASKS";


  renderTaskList();

}


function closeTaskModal() {

  $("taskModalOverlay")
    .classList
    .remove(
      "is-open",
      "mode-edit"
    );


  editingTaskId =
    null;

}


function updateTargetField() {

  const type =
    $("taskTypeInput").value;


  const needsTarget =
    type !==
    "boolean";


  $("taskTargetField")
    .classList
    .toggle(
      "is-hidden",
      !needsTarget
    );

}


function saveTaskFromForm() {

  const name =
    $("taskNameInput")
      .value
      .trim();


  if (!name) {

    $("taskNameInput")
      .focus();


    return;

  }


  const type =
    $("taskTypeInput")
      .value;


  const category =
    $("taskCategoryInput")
      .value;


  const frequency =
    $("taskFrequencyInput")
      .value;


  const target =
    type ===
    "boolean"
      ? null
      : Number(
          $("taskTargetInput")
            .value
        ) || null;


  if (
    editingTaskId
  ) {

    const task =
      HABITS.find(
        habit =>
          habit.id ===
          editingTaskId
      );


    if (!task) {

      return;

    }


    task.name =
      name;


    task.type =
      type;


    task.category =
      category;


    task.frequency =
      frequency;


    task.target =
      target;

  }

  else {

    let id =
      createTaskId(
        name
      );


    while (
      HABITS.some(
        habit =>
          habit.id ===
          id
      )
    ) {

      id =
        `${
          createTaskId(
            name
          )
        }-${Date.now()}`;

    }


    const now =
      new Date();


    const activeFrom =
      makeDateKey(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );


    HABITS.push({

      id,

      name,

      type,

      category,

      frequency,

      target,

      activeFrom,

      archivedAt:
        null

    });

  }


  saveHabits();

  renderTracker();

  closeTaskModal();

}


function renderTaskList() {

  const list =
    $("taskList");


  list.innerHTML =
    "";


  HABITS.forEach(
    task => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "task-list-item";


      const typeLabel =
        task.type
          ? task.type
              .toUpperCase()
          : "YES / NO";


      row.innerHTML =
        `
        <div class="task-list-info">

          <strong>
            ${task.name}
          </strong>

          <span>
            ${typeLabel}
            ·
            ${
              (
                task.category ||
                "habit"
              ).toUpperCase()
            }
          </span>

        </div>


        <div class="task-list-actions">

          <button
            class="edit-task-btn"
            type="button"
          >
            EDIT
          </button>

          <button
            class="delete-task-btn"
            type="button"
          >
            DELETE
          </button>

        </div>
        `;


      row
        .querySelector(
          ".edit-task-btn"
        )
        .addEventListener(
          "click",
          () => {

            openTaskEditor(
              task.id
            );

          }
        );


      row
        .querySelector(
          ".delete-task-btn"
        )
        .addEventListener(
          "click",
          () => {

            deleteTask(
              task.id
            );

          }
        );


      list.appendChild(
        row
      );

    }
  );

}


function openTaskEditor(
  taskId
) {

  const task =
    HABITS.find(
      habit =>
        habit.id ===
        taskId
    );


  if (!task) {

    return;

  }


  editingTaskId =
    taskId;


  $("taskModalOverlay")
    .classList
    .remove(
      "mode-edit"
    );


  $("taskModalTitle").textContent =
    "EDIT TASK";


  $("saveTaskButton").textContent =
    "SAVE CHANGES";


  $("taskNameInput").value =
    task.name;


  $("taskTypeInput").value =
    task.type ||
    "boolean";


  $("taskCategoryInput").value =
    task.category ||
    "habit";


  $("taskFrequencyInput").value =
    task.frequency ||
    "daily";


  $("taskTargetInput").value =
    task.target ??
    "";


  updateTargetField();

}


function deleteTask(
  taskId
) {

  const task =
    HABITS.find(
      habit =>
        habit.id ===
        taskId
    );


  if (!task) {

    return;

  }


  const confirmed =
    confirm(
      `Delete "${task.name}" from the tracker?`
    );


  if (
    !confirmed
  ) {

    return;

  }


  HABITS =
    HABITS.filter(
      habit =>
        habit.id !==
        taskId
    );


  saveHabits();

  renderTracker();

  renderTaskList();

}


$("addTaskButton")
  .addEventListener(
    "click",
    openAddTaskModal
  );


$("editTasksButton")
  .addEventListener(
    "click",
    openEditTasksModal
  );


$("taskModalClose")
  .addEventListener(
    "click",
    closeTaskModal
  );


$("cancelTaskButton")
  .addEventListener(
    "click",
    closeTaskModal
  );


$("createFromEditButton")
  .addEventListener(
    "click",
    openAddTaskModal
  );


$("saveTaskButton")
  .addEventListener(
    "click",
    saveTaskFromForm
  );


$("taskTypeInput")
  .addEventListener(
    "change",
    updateTargetField
  );


$("taskModalOverlay")
  .addEventListener(
    "click",
    event => {

      if (
        event.target ===
        $("taskModalOverlay")
      ) {

        closeTaskModal();

      }

    }
  );


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Escape" &&

      $("taskModalOverlay")
        .classList
        .contains(
          "is-open"
        )
    ) {

      closeTaskModal();

    }

  }
);


/* =========================================================
   INFINITY GATEWAY
========================================================= */

const infinityGateway =
  document.getElementById("infinityGateway");

if (infinityGateway) {

  infinityGateway.addEventListener("click", (event) => {

    event.preventDefault();

    infinityGateway.classList.add("entering");

    setTimeout(() => {
      window.location.href = "hub.html";
    }, 760);

  });

}