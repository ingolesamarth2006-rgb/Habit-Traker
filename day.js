const JOURNAL_STORAGE_KEY = "growthMapJournalV1";
const TRACKER_STORAGE_KEY = "growthMapTrackerV1";
const TASKS_STORAGE_KEY = "growthMapTasksV1";


/* =========================================================
   HELPERS
========================================================= */

const $ = (id) =>
  document.getElementById(id);


const pad = (number) =>
  String(number).padStart(2, "0");


function makeDateKey(
  year,
  month,
  day
) {

  return `${year}-${pad(month + 1)}-${pad(day)}`;

}


function todayKey() {

  const now =
    new Date();


  return makeDateKey(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

}


function parseDateKey(dateKey) {

  const [
    year,
    month,
    day
  ] =
    dateKey
      .split("-")
      .map(Number);


  return new Date(
    year,
    month - 1,
    day
  );

}


function clamp(
  value,
  min,
  max
) {

  return Math.min(
    Math.max(
      value,
      min
    ),
    max
  );

}


/* =========================================================
   SELECTED DATE
========================================================= */

const params =
  new URLSearchParams(
    window.location.search
  );


const requestedDate =
  params.get("date");


const selectedDateKey =
  /^\d{4}-\d{2}-\d{2}$/.test(
    requestedDate || ""
  )
    ? requestedDate
    : todayKey();


const selectedDate =
  parseDateKey(
    selectedDateKey
  );


/* =========================================================
   STORAGE
========================================================= */

function loadAllJournalData() {

  try {

    return (
      JSON.parse(
        localStorage.getItem(
          JOURNAL_STORAGE_KEY
        )
      ) || {}
    );

  }

  catch {

    return {};

  }

}


let allJournalData =
  loadAllJournalData();


function createEmptyDayData() {

  return {

    mood: 5,

    energy: 5,

    focus: 5,


    metrics: {

      water: "",

      protein: "",

      sleep: "",

      study: "",

      communication: "",

      meditation: ""

    },


    journal: "",

    win: "",

    difficult: "",

    learned: "",

    gratitude: "",

    notCompleted: "",

    notCompletedReason: "",


    memory: "",


    priorities: {

      one: "",

      two: "",

      three: ""

    },


    carryForward: "",

    freeNotes: "",


    vault: []

  };

}


let dayData = {

  ...createEmptyDayData(),

  ...(
    allJournalData[
      selectedDateKey
    ] || {}
  )

};


dayData.metrics = {

  ...createEmptyDayData().metrics,

  ...(
    dayData.metrics || {}
  )

};


dayData.priorities = {

  ...createEmptyDayData().priorities,

  ...(
    dayData.priorities || {}
  )

};


dayData.vault =
  Array.isArray(
    dayData.vault
  )
    ? dayData.vault
    : [];


/* =========================================================
   AUTOSAVE
========================================================= */

let saveTimer =
  null;


function showSaving() {

  const status =
    $("saveStatus");


  status.innerHTML =
    `
    <span class="save-dot"></span>
    SAVING...
    `;

}


function showSaved() {

  const status =
    $("saveStatus");


  status.innerHTML =
    `
    <span class="save-dot"></span>
    AUTOSAVED
    `;

}


function saveDayData() {

  allJournalData[
    selectedDateKey
  ] =
    dayData;


  localStorage.setItem(
    JOURNAL_STORAGE_KEY,
    JSON.stringify(
      allJournalData
    )
  );


  showSaved();

}


function queueSave() {

  showSaving();


  clearTimeout(
    saveTimer
  );


  saveTimer =
    setTimeout(
      saveDayData,
      450
    );

}


/* =========================================================
   DATE DISPLAY
========================================================= */

function updateDateDisplay() {

  const monthLong =
    selectedDate
      .toLocaleString(
        "en-US",
        {
          month: "long"
        }
      )
      .toUpperCase();


  const monthShort =
    selectedDate
      .toLocaleString(
        "en-US",
        {
          month: "short"
        }
      )
      .toUpperCase();


  const weekday =
    selectedDate
      .toLocaleString(
        "en-US",
        {
          weekday: "long"
        }
      )
      .toUpperCase();


  const day =
    selectedDate.getDate();


  const year =
    selectedDate.getFullYear();


  $("journalDate").textContent =
    `${monthLong} ${day}`;


  $("journalWeekday").textContent =
    weekday;


  $("journalYear").textContent =
    year;


  $("topDate").textContent =
    `${monthShort} ${day}`;


  $("summaryDate").textContent =
    `${monthShort} ${day}, ${year}`;

}


/* =========================================================
   TRACKER CONNECTION — READ ONLY
========================================================= */

function loadTrackerTasks() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          TASKS_STORAGE_KEY
        )
      );


    return Array.isArray(saved)
      ? saved
      : [];

  }

  catch {

    return [];

  }

}


function loadTrackerData() {

  try {

    return (
      JSON.parse(
        localStorage.getItem(
          TRACKER_STORAGE_KEY
        )
      ) || {}
    );

  }

  catch {

    return {};

  }

}


function getTrackerStatsForDay() {

  const tasks =
    loadTrackerTasks();


  const trackerData =
    loadTrackerData();


  const year =
    selectedDate.getFullYear();


  const month =
    selectedDate.getMonth();


  const day =
    selectedDate.getDate();


  const monthKey =
    `${year}-${pad(month + 1)}`;


  const activeTasks =
    tasks.filter(
      task => {

        const activeFrom =
          task.activeFrom ||
          "2000-01-01";


        const archivedAt =
          task.archivedAt ||
          null;


        return (
          selectedDateKey >=
            activeFrom &&

          (
            !archivedAt ||
            selectedDateKey <
              archivedAt
          )
        );

      }
    );


  let completed =
    0;


  activeTasks.forEach(
    task => {

      const state =
        trackerData?.[
          monthKey
        ]?.[
          task.id
        ]?.[
          day
        ];


      if (
        state ===
        "done"
      ) {

        completed++;

      }

    }
  );


  const total =
    activeTasks.length;


  const percentage =
    total > 0
      ? Math.round(
          (
            completed /
            total
          ) *
          100
        )
      : 0;


  return {

    completed,

    total,

    percentage

  };

}


function updateTrackerScore() {

  const stats =
    getTrackerStatsForDay();


  $("dayScore").textContent =
    stats.percentage;


  $("summaryScore").textContent =
    `${stats.percentage}%`;


  $("completedTasks").textContent =
    `${stats.completed} / ${stats.total}`;


  $("dayScoreRing")
    .style
    .setProperty(
      "--score",
      stats.percentage
    );

}


/* =========================================================
   STATE SLIDERS
========================================================= */

function updateStateDisplay() {

  $("moodValue").textContent =
    dayData.mood;


  $("energyValue").textContent =
    dayData.energy;


  $("focusValue").textContent =
    dayData.focus;


  $("summaryMood").textContent =
    `${dayData.mood}/10`;


  $("summaryEnergy").textContent =
    `${dayData.energy}/10`;


  $("summaryFocus").textContent =
    `${dayData.focus}/10`;

}


function setupStateSlider(
  inputId,
  key
) {

  const input =
    $(inputId);


  input.value =
    dayData[key];


  input.addEventListener(
    "input",
    () => {

      dayData[key] =
        Number(
          input.value
        );


      updateStateDisplay();

      queueSave();

    }
  );

}


/* =========================================================
   METRICS
========================================================= */

const METRIC_CONFIG = {

  water: {

    input:
      "waterInput",

    progress:
      "waterProgress",

    target:
      4

  },


  protein: {

    input:
      "proteinInput",

    progress:
      "proteinProgress",

    target:
      120

  },


  sleep: {

    input:
      "sleepInput",

    progress:
      "sleepProgress",

    target:
      8

  },


  study: {

    input:
      "studyInput",

    progress:
      "studyProgress",

    target:
      5

  },


  communication: {

    input:
      "communicationInput",

    progress:
      "communicationProgress",

    target:
      30

  },


  meditation: {

    input:
      "meditationInput",

    progress:
      "meditationProgress",

    target:
      15

  }

};


function updateMetricProgress(
  metricKey
) {

  const config =
    METRIC_CONFIG[
      metricKey
    ];


  const value =
    Number(
      dayData.metrics[
        metricKey
      ]
    ) || 0;


  const percentage =
    clamp(
      (
        value /
        config.target
      ) *
      100,
      0,
      100
    );


  $(
    config.progress
  ).style.width =
    `${percentage}%`;

}


function setupMetric(
  metricKey
) {

  const config =
    METRIC_CONFIG[
      metricKey
    ];


  const input =
    $(
      config.input
    );


  input.value =
    dayData.metrics[
      metricKey
    ];


  updateMetricProgress(
    metricKey
  );


  input.addEventListener(
    "input",
    () => {

      dayData.metrics[
        metricKey
      ] =
        input.value;


      updateMetricProgress(
        metricKey
      );


      updateSummary();

      queueSave();

    }
  );

}


/* =========================================================
   TEXT FIELD BINDING
========================================================= */

function bindTextField(
  id,
  object,
  key
) {

  const element =
    $(id);


  element.value =
    object[key] ||
    "";


  element.addEventListener(
    "input",
    () => {

      object[key] =
        element.value;


      updateSummary();

      queueSave();

    }
  );

}


/* =========================================================
   MAIN JOURNAL WORD COUNT
========================================================= */

function updateWordCount() {

  const text =
    $("mainJournal")
      .value
      .trim();


  const words =
    text
      ? text
          .split(
            /\s+/
          )
          .filter(Boolean)
          .length
      : 0;


  $("journalWordCount").textContent =
    `${words} ${
      words === 1
        ? "WORD"
        : "WORDS"
    }`;

}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary() {

  const water =
    dayData.metrics.water ||
    0;


  $("summaryWater").textContent =
    `${water} L`;


  const memory =
    (
      dayData.memory ||
      ""
    ).trim();


  $("summaryMemory").textContent =
    memory ||
    "Write something worth remembering.";

}


/* =========================================================
   VAULT
========================================================= */

let currentVaultType =
  "note";


const VAULT_LABELS = {

  note:
    "IMPORTANT NOTE",

  link:
    "IMPORTANT LINK",

  idea:
    "IDEA",

  event:
    "EVENT",

  person:
    "PERSON",

  decision:
    "DECISION",

  memory:
    "MEMORY"

};


function openVaultModal(
  type
) {

  currentVaultType =
    type;


  $("vaultModalType").textContent =
    VAULT_LABELS[type] ||
    "IMPORTANT";


  $("vaultModalTitle").textContent =
    `Add ${
      (
        VAULT_LABELS[type] ||
        type
      ).toLowerCase()
    }`;


  $("vaultTitleInput").value =
    "";


  $("vaultContentInput").value =
    "";


  $("vaultLinkInput").value =
    "";


  $("vaultLinkField")
    .classList
    .toggle(
      "is-visible",
      type ===
      "link"
    );


  $("vaultModalOverlay")
    .classList
    .add(
      "is-open"
    );


  setTimeout(
    () => {

      $("vaultTitleInput")
        .focus();

    },
    100
  );

}


function closeVaultModal() {

  $("vaultModalOverlay")
    .classList
    .remove(
      "is-open"
    );

}


function saveVaultItem() {

  const title =
    $("vaultTitleInput")
      .value
      .trim();


  const content =
    $("vaultContentInput")
      .value
      .trim();


  const link =
    $("vaultLinkInput")
      .value
      .trim();


  if (
    !title &&
    !content &&
    !link
  ) {

    $("vaultTitleInput")
      .focus();


    return;

  }


  dayData.vault.unshift({

    id:
      `${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`,

    type:
      currentVaultType,

    title:
      title ||
      VAULT_LABELS[
        currentVaultType
      ],

    content,

    link:
      currentVaultType ===
      "link"
        ? link
        : "",

    createdAt:
      new Date()
        .toISOString()

  });


  renderVault();

  saveDayData();

  closeVaultModal();

}


function renderVault() {

  const container =
    $("vaultItems");


  container.innerHTML =
    "";


  if (
    !dayData.vault.length
  ) {

    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "vault-empty";


    empty.innerHTML =
      `
      <span>
        NOTHING SAVED YET
      </span>

      <p>
        Add an idea, link, memory, person, decision or important note from today.
      </p>
      `;


    container.appendChild(
      empty
    );


    return;

  }


  dayData.vault.forEach(
    item => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "vault-item";


      const type =
        document.createElement(
          "span"
        );


      type.className =
        "vault-item-type";


      type.textContent =
        (
          VAULT_LABELS[
            item.type
          ] ||
          item.type ||
          "IMPORTANT"
        ).toUpperCase();


      const title =
        document.createElement(
          "h3"
        );


      title.textContent =
        item.title ||
        "Untitled";


      card.appendChild(
        type
      );


      card.appendChild(
        title
      );


      if (
        item.content
      ) {

        const content =
          document.createElement(
            "p"
          );


        content.textContent =
          item.content;


        card.appendChild(
          content
        );

      }


      if (
        item.link
      ) {

        const anchor =
          document.createElement(
            "a"
          );


        anchor.href =
          item.link;


        anchor.target =
          "_blank";


        anchor.rel =
          "noopener noreferrer";


        anchor.textContent =
          item.link;


        card.appendChild(
          anchor
        );

      }


      const deleteButton =
        document.createElement(
          "button"
        );


      deleteButton.type =
        "button";


      deleteButton.className =
        "vault-item-delete";


      deleteButton.textContent =
        "×";


      deleteButton.title =
        "Remove";


      deleteButton.addEventListener(
        "click",
        () => {

          dayData.vault =
            dayData.vault.filter(
              vaultItem =>
                vaultItem.id !==
                item.id
            );


          renderVault();

          saveDayData();

        }
      );


      card.appendChild(
        deleteButton
      );


      container.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   LOAD VALUES INTO PAGE
========================================================= */

function loadPageValues() {

  setupStateSlider(
    "moodInput",
    "mood"
  );


  setupStateSlider(
    "energyInput",
    "energy"
  );


  setupStateSlider(
    "focusInput",
    "focus"
  );


  Object.keys(
    METRIC_CONFIG
  ).forEach(
    setupMetric
  );


  bindTextField(
    "mainJournal",
    dayData,
    "journal"
  );


  bindTextField(
    "todayWin",
    dayData,
    "win"
  );


  bindTextField(
    "todayDifficult",
    dayData,
    "difficult"
  );


  bindTextField(
    "todayLearned",
    dayData,
    "learned"
  );


  bindTextField(
    "gratitudeInput",
    dayData,
    "gratitude"
  );


  bindTextField(
    "notCompleted",
    dayData,
    "notCompleted"
  );


  bindTextField(
    "notCompletedReason",
    dayData,
    "notCompletedReason"
  );


  bindTextField(
    "memoryOfDay",
    dayData,
    "memory"
  );


  bindTextField(
    "priorityOne",
    dayData.priorities,
    "one"
  );


  bindTextField(
    "priorityTwo",
    dayData.priorities,
    "two"
  );


  bindTextField(
    "priorityThree",
    dayData.priorities,
    "three"
  );


  bindTextField(
    "carryForward",
    dayData,
    "carryForward"
  );


  bindTextField(
    "freeNotes",
    dayData,
    "freeNotes"
  );


  $("mainJournal")
    .addEventListener(
      "input",
      updateWordCount
    );


  updateWordCount();

  updateStateDisplay();

  updateSummary();

  renderVault();

}


/* =========================================================
   VAULT EVENTS
========================================================= */

document
  .querySelectorAll(
    ".vault-add-button"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          openVaultModal(
            button.dataset.type
          );

        }
      );

    }
  );


$("vaultModalClose")
  .addEventListener(
    "click",
    closeVaultModal
  );


$("vaultCancelButton")
  .addEventListener(
    "click",
    closeVaultModal
  );


$("vaultSaveButton")
  .addEventListener(
    "click",
    saveVaultItem
  );


$("vaultModalOverlay")
  .addEventListener(
    "click",
    event => {

      if (
        event.target ===
        $("vaultModalOverlay")
      ) {

        closeVaultModal();

      }

    }
  );


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Escape"
    ) {

      closeVaultModal();

    }

  }
);


/* =========================================================
   BEFORE LEAVING
========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    clearTimeout(
      saveTimer
    );


    saveDayData();

  }
);


/* =========================================================
   START
========================================================= */

updateDateDisplay();

updateTrackerScore();

loadPageValues();

showSaved();

/* =========================================================
   CUSTOM METRIC MANAGER
========================================================= */

const CUSTOM_METRICS_KEY =
  "growthMapCustomMetricsV1";


function loadCustomMetrics() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          CUSTOM_METRICS_KEY
        )
      );

    return Array.isArray(saved)
      ? saved
      : [];

  }

  catch {

    return [];

  }

}


let customMetrics =
  loadCustomMetrics();
  let editingMetricId = null;


function saveCustomMetrics() {

  localStorage.setItem(
    CUSTOM_METRICS_KEY,
    JSON.stringify(
      customMetrics
    )
  );

}


function createCustomMetricId(name) {

  const clean =
    name
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      );

  return (
    `custom-${clean}-${Date.now()}`
  );

}


function openMetricModal(metric = null) {

  editingMetricId =
    metric ? metric.id : null;

  $("newMetricName").value =
    metric ? metric.name : "";

  $("newMetricUnit").value =
    metric ? metric.unit : "";

  $("newMetricTarget").value =
    metric ? metric.target : "";

  $("newMetricColor").value =
    metric ? metric.color : "blue";

  $("saveMetricButton").textContent =
    metric
      ? "SAVE CHANGES"
      : "ADD METRIC";

  $("metricModalOverlay")
    .classList
    .add("is-open");

}


function closeMetricModal() {

  $("metricModalOverlay")
    .classList
    .remove(
      "is-open"
    );

}


function addCustomMetric() {

  const name =
    $("newMetricName").value.trim();

  const unit =
    $("newMetricUnit").value.trim();

  const target =
    Number(
      $("newMetricTarget").value
    );

  const color =
    $("newMetricColor").value;


  if (!name || !target) {
    return;
  }


  if (editingMetricId) {

    const metric =
      customMetrics.find(
        item =>
          item.id === editingMetricId
      );

    if (metric) {

      metric.name = name;
      metric.unit = unit;
      metric.target = target;
      metric.color = color;

    }

  } else {

    customMetrics.push({

      id:
        createCustomMetricId(name),

      name,
      unit,
      target,
      color

    });

  }


  editingMetricId = null;

  saveCustomMetrics();

  renderCustomMetrics();

  renderMetricManager();

  closeMetricModal();

}


function updateCustomMetricProgress(
  metric,
  value,
  fill
) {

  const percentage =
    clamp(
      (
        Number(value) /
        metric.target
      ) *
      100,
      0,
      100
    );


  fill.style.width =
    `${percentage}%`;

}


function renderCustomMetrics() {

  const grid =
    document.querySelector(
      ".metrics-grid"
    );


  document
    .querySelectorAll(
      ".custom-metric-card"
    )
    .forEach(
      card =>
        card.remove()
    );


  customMetrics.forEach(
    metric => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        `metric-card custom-metric-card custom-${metric.color}`;


      const savedValue =
        dayData.metrics[
          metric.id
        ] || "";


      card.innerHTML =
        `
        <div class="metric-top">

          <span class="metric-name">
            ${metric.name.toUpperCase()}
          </span>

          <span class="metric-unit">
            ${(metric.unit || "VALUE").toUpperCase()}
          </span>

        </div>


        <div class="metric-input-row">

          <input
            class="custom-metric-input"
            type="number"
            step="0.1"
            min="0"
            placeholder="0"
            value="${savedValue}"
          >

          <span>
            / ${metric.target} ${metric.unit}
          </span>

        </div>


        <div class="metric-progress">

          <div
            class="metric-progress-fill"
          ></div>

        </div>
        `;


      const input =
        card.querySelector(
          ".custom-metric-input"
        );


      const fill =
        card.querySelector(
          ".metric-progress-fill"
        );


      updateCustomMetricProgress(
        metric,
        savedValue,
        fill
      );


      input.addEventListener(
        "input",
        () => {

          dayData.metrics[
            metric.id
          ] =
            input.value;


          updateCustomMetricProgress(
            metric,
            input.value,
            fill
          );


          queueSave();

        }
      );


      grid.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   CUSTOM METRIC EVENTS
========================================================= */

$("addMetricButton")
  .addEventListener(
    "click",
    openMetricModal
  );


$("metricModalClose")
  .addEventListener(
    "click",
    closeMetricModal
  );


$("cancelMetricButton")
  .addEventListener(
    "click",
    closeMetricModal
  );


$("saveMetricButton")
  .addEventListener(
    "click",
    addCustomMetric
  );


$("metricModalOverlay")
  .addEventListener(
    "click",
    event => {

      if (
        event.target ===
        $("metricModalOverlay")
      ) {

        closeMetricModal();

      }

    }
  );


renderCustomMetrics();


function openEditMetricsModal() {

  renderMetricManager();

  $("editMetricsOverlay")
    .classList
    .add("is-open");

}


function closeEditMetricsModal() {

  $("editMetricsOverlay")
    .classList
    .remove("is-open");

}


function renderMetricManager() {

  const list =
    $("metricManagerList");

  list.innerHTML = "";


  customMetrics.forEach(
    metric => {

      const row =
        document.createElement("div");

      row.className =
        "metric-manager-item";

      row.innerHTML =
        `
        <div class="metric-manager-info">

          <strong>
            ${metric.name}
          </strong>

          <span>
            ${metric.target}
            ${metric.unit || ""}
          </span>

        </div>

        <div class="metric-manager-actions">

          <button
            class="metric-manager-edit"
            type="button"
          >
            EDIT
          </button>

          <button
            class="metric-manager-delete"
            type="button"
          >
            DELETE
          </button>

        </div>
        `;


      row
        .querySelector(
          ".metric-manager-edit"
        )
        .onclick =
        () => {

          closeEditMetricsModal();

          openMetricModal(
            metric
          );

        };


      row
        .querySelector(
          ".metric-manager-delete"
        )
        .onclick =
        () => {

          customMetrics =
            customMetrics.filter(
              item =>
                item.id !== metric.id
            );

          saveCustomMetrics();

          renderCustomMetrics();

          renderMetricManager();

        };


      list.appendChild(row);

    }
  );

}


$("editMetricsButton").onclick =
  openEditMetricsModal;


$("editMetricsClose").onclick =
  closeEditMetricsModal;


$("editMetricsDone").onclick =
  closeEditMetricsModal;