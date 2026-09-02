/* =========================================================
   STUDIES PAGE
   GROWTH MAP
========================================================= */


const STORAGE = {
  sessions: "growthMapStudySessionsV1",
  tracks: "growthMapLearningTracksV1",
  plans: "growthMapStudyPlansV1",
  problems: "growthMapCodingProblemsV1",
  resources: "growthMapStudyResourcesV1",
  doubts: "growthMapStudyDoubtsV1",
  focus: "growthMapStudyTopFocusV1"
};


const $ = (selector) =>
  document.querySelector(selector);


const $$ = (selector) =>
  [...document.querySelectorAll(selector)];



/* =========================================================
   MODAL
========================================================= */

const modalOverlay =
  $("#modalOverlay");

const modalTitle =
  $("#modalTitle");

const modalKicker =
  $("#modalKicker");

const modalBody =
  $("#modalBody");

const modalSave =
  $("#modalSave");


let modalSaveHandler = null;



/* =========================================================
   TIMER VARIABLES
========================================================= */

let plannerView =
  "today";

let selectedMinutes =
  25;

let timerRemaining =
  selectedMinutes * 60;

let timerTotal =
  timerRemaining;

let timerInterval =
  null;

let timerRunning =
  false;



/* =========================================================
   STORAGE HELPERS
========================================================= */

function load(
  key,
  fallback = []
) {

  try {

    const value =
      JSON.parse(
        localStorage.getItem(key)
      );

    return value ?? fallback;

  }

  catch {

    return fallback;

  }

}


function save(
  key,
  value
) {

  localStorage.setItem(
    key,
    JSON.stringify(value)
  );

}



function uid(
  prefix = "item"
) {

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;

}



function esc(
  value = ""
) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}



function safeUrl(
  value = ""
) {

  const v =
    String(value).trim();

  if (!v) {

    return "#";

  }


  try {

    const url =
      new URL(
        v,
        window.location.href
      );


    return [
      "http:",
      "https:"
    ].includes(
      url.protocol
    )
      ? url.href
      : "#";

  }

  catch {

    return "#";

  }

}



/* =========================================================
   DATE HELPERS
========================================================= */

function localDateKey(
  date = new Date()
) {

  const y =
    date.getFullYear();

  const m =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const d =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${y}-${m}-${d}`;

}



function dateFromKey(
  key
) {

  const [
    y,
    m,
    d
  ] =
    String(key)
      .split("-")
      .map(Number);


  return new Date(
    y,
    (m || 1) - 1,
    d || 1
  );

}



function startOfWeek(
  date = new Date()
) {

  const copy =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );


  const day =
    copy.getDay();


  const diff =
    day === 0
      ? -6
      : 1 - day;


  copy.setDate(
    copy.getDate() + diff
  );


  copy.setHours(
    0,
    0,
    0,
    0
  );


  return copy;

}



function sameWeek(
  dateKey,
  now = new Date()
) {

  const d =
    dateFromKey(
      dateKey
    );


  const start =
    startOfWeek(
      now
    );


  const end =
    new Date(
      start
    );


  end.setDate(
    end.getDate() + 7
  );


  return (
    d >= start &&
    d < end
  );

}



function formatDuration(
  minutes = 0
) {

  const total =
    Math.max(
      0,
      Math.round(
        Number(minutes) || 0
      )
    );


  const h =
    Math.floor(
      total / 60
    );


  const m =
    total % 60;


  if (!h) {

    return `${m}m`;

  }


  return `${h}h ${String(m).padStart(2, "0")}m`;

}



/* =========================================================
   UNIVERSAL MODAL
========================================================= */

function openModal({
  kicker = "ADD",
  title = "New Item",
  html = "",
  onSave
}) {

  modalSave.textContent = "SAVE";

  modalKicker.textContent =
    kicker;

  modalTitle.textContent =
    title;

  modalBody.innerHTML =
    html;

  modalSaveHandler =
    onSave;


  modalOverlay.classList.add(
    "open"
  );


  modalOverlay.setAttribute(
    "aria-hidden",
    "false"
  );


  setTimeout(
    () => {

      modalBody
        .querySelector(
          "input, textarea, select"
        )
        ?.focus();

    },
    30
  );

}



function closeModal() {

  modalOverlay.classList.remove(
    "open"
  );


  modalOverlay.setAttribute(
    "aria-hidden",
    "true"
  );


  modalBody.innerHTML =
    "";


  modalSaveHandler =
    null;

}



$("#modalClose")
  ?.addEventListener(
    "click",
    closeModal
  );


$("#modalCancel")
  ?.addEventListener(
    "click",
    closeModal
  );


modalOverlay
  ?.addEventListener(
    "click",
    (e) => {

      if (
        e.target ===
        modalOverlay
      ) {

        closeModal();

      }

    }
  );


modalSave
  ?.addEventListener(
    "click",
    () => {

      modalSaveHandler?.();

    }
  );


document.addEventListener(
  "keydown",
  (e) => {

    if (
      e.key === "Escape" &&
      modalOverlay
        ?.classList
        .contains(
          "open"
        )
    ) {

      closeModal();

    }

  }
);



/* =========================================================
   MODAL FIELD BUILDERS
========================================================= */

function field(
  label,
  id,
  value = "",
  placeholder = "",
  type = "text"
) {

  return `

    <label>

      ${label}

      <input
        id="${id}"
        type="${type}"
        value="${esc(value)}"
        placeholder="${esc(placeholder)}"
      >

    </label>

  `;

}



function textAreaField(
  label,
  id,
  value = "",
  placeholder = ""
) {

  return `

    <label>

      ${label}

      <textarea
        id="${id}"
        placeholder="${esc(placeholder)}"
      >${esc(value)}</textarea>

    </label>

  `;

}



function selectField(
  label,
  id,
  options,
  selected = ""
) {

  return `

    <label>

      ${label}

      <select id="${id}">

        ${options
          .map(
            (option) => {

              const value =
                typeof option === "string"
                  ? option
                  : option.value;


              const text =
                typeof option === "string"
                  ? option
                  : option.label;


              return `

                <option
                  value="${esc(value)}"
                  ${value === selected
                    ? "selected"
                    : ""}
                >

                  ${esc(text)}

                </option>

              `;

            }
          )
          .join("")}

      </select>

    </label>

  `;

}



/* =========================================================
   LIVE DATE + TIME
========================================================= */

function updateDateTime() {

  const now =
    new Date();


  $("#heroDay").textContent =
    now
      .toLocaleDateString(
        "en-US",
        {
          weekday: "long"
        }
      )
      .toUpperCase();


  $("#heroDate").textContent =
    now
      .toLocaleDateString(
        "en-US",
        {
          day: "2-digit",
          month: "long"
        }
      )
      .toUpperCase();


  $("#heroTime").textContent =
    now.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );

}



/* =========================================================
   STUDY SESSION
========================================================= */

function getSessions() {

  return load(
    STORAGE.sessions,
    []
  );

}



function addSessionFromCurrent(
  fromTimer = false
) {

  const topic =
    $("#sessionTopic")
      .value
      .trim();


  const note =
    $("#sessionNote")
      .value
      .trim();


  if (!topic) {

    alert(
      "Enter the subject/topic first."
    );


    $("#sessionTopic")
      .focus();


    return false;

  }


  const sessions =
    getSessions();


  sessions.unshift({

    id:
      uid(
        "session"
      ),

    topic,

    note,

    minutes:
      selectedMinutes,

    date:
      localDateKey(),

    createdAt:
      new Date()
        .toISOString(),

    source:
      fromTimer
        ? "Pomodoro"
        : "Manual"

  });


  save(
    STORAGE.sessions,
    sessions
  );


  $("#sessionTopic").value =
    "";

  $("#sessionNote").value =
    "";


  renderAll();


  return true;

}



$("#addSessionButton")
  ?.addEventListener(
    "click",
    () => {

      addSessionFromCurrent(
        false
      );

    }
  );



function renderSessions() {

  const sessions =
    getSessions();


  const today =
    localDateKey();


  const todaySessions =
    sessions.filter(
      (s) =>
        s.date === today
    );


  const list =
    $("#sessionList");


  if (
    !todaySessions.length
  ) {

    list.innerHTML = `

      <div class="empty-state">
        No study sessions logged yet.
      </div>

    `;


    return;

  }


  list.innerHTML =
    todaySessions
      .map(
        (s) => `

          <div
            style="
              padding:14px;
              border:1px solid rgba(255,244,231,.10);
              border-radius:14px;
              background:rgba(255,244,231,.04);
              display:grid;
              grid-template-columns:1fr auto;
              gap:12px;
              align-items:center;
            "
          >

            <div>

              <strong
                style="
                  display:block;
                  font-size:13px;
                "
              >
                ${esc(s.topic)}
              </strong>


              <small
                style="
                  display:block;
                  margin-top:5px;
                  color:rgba(255,248,239,.42);
                "
              >

                ${esc(s.source)}
                ·
                ${formatDuration(s.minutes)}

                ${s.note
                  ? ` · ${esc(s.note)}`
                  : ""}

              </small>

            </div>


            <div
              style="
                display:flex;
                gap:8px;
              "
            >

              <button
                data-edit-session="${s.id}"
                type="button"
                style="
                  border:0;
                  background:transparent;
                  color:#f3b09f;
                  font-size:9px;
                  cursor:pointer;
                "
              >
                EDIT
              </button>


              <button
                data-delete-session="${s.id}"
                type="button"
                style="
                  border:0;
                  background:transparent;
                  color:rgba(255,248,239,.45);
                  font-size:9px;
                  cursor:pointer;
                "
              >
                REMOVE
              </button>

            </div>

          </div>

        `
      )
      .join("");

}



/* =========================================================
   EDIT STUDY SESSION
========================================================= */

function editSession(
  id
) {

  const sessions =
    getSessions();


  const item =
    sessions.find(
      (s) =>
        s.id === id
    );


  if (!item) {

    return;

  }


  openModal({

    kicker:
      "EDIT",

    title:
      "Study Session",

    html:

      field(
        "SUBJECT / TOPIC",
        "mSessionTopic",
        item.topic
      )

      +

      field(
        "MINUTES",
        "mSessionMinutes",
        item.minutes,
        "25",
        "number"
      )

      +

      textAreaField(
        "NOTE",
        "mSessionNote",
        item.note || ""
      ),


    onSave:
      () => {

        const topic =
          $("#mSessionTopic")
            .value
            .trim();


        const minutes =
          Math.max(
            1,
            Number(
              $("#mSessionMinutes")
                .value
            ) || 0
          );


        if (
          !topic ||
          !minutes
        ) {

          return alert(
            "Topic and minutes are required."
          );

        }


        item.topic =
          topic;


        item.minutes =
          minutes;


        item.note =
          $("#mSessionNote")
            .value
            .trim();


        save(
          STORAGE.sessions,
          sessions
        );


        closeModal();


        renderAll();

      }

  });

}



$("#sessionList")
  ?.addEventListener(
    "click",
    (e) => {

      const edit =
        e.target.closest(
          "[data-edit-session]"
        );


      const del =
        e.target.closest(
          "[data-delete-session]"
        );


      if (edit) {

        editSession(
          edit.dataset
            .editSession
        );

      }


      if (
        del &&
        confirm(
          "Remove this study session?"
        )
      ) {

        save(
          STORAGE.sessions,

          getSessions()
            .filter(
              (s) =>
                s.id !==
                del.dataset
                  .deleteSession
            )
        );


        renderAll();

      }

    }
  );



/* =========================================================
   POMODORO
========================================================= */

function setTimerMinutes(
  minutes
) {

  selectedMinutes =
    Math.max(
      1,
      Number(minutes) || 25
    );


  timerTotal =
    selectedMinutes * 60;


  timerRemaining =
    timerTotal;


  stopTimer();


  updateTimerDisplay();


  $$(".duration-btn")
    .forEach(
      (btn) => {

        btn.classList.toggle(
          "active",

          Number(
            btn.dataset.minutes
          ) ===
          selectedMinutes
        );

      }
    );

}



function updateTimerDisplay() {

  const minutes =
    Math.floor(
      timerRemaining / 60
    );


  const seconds =
    timerRemaining % 60;


  $("#timerDisplay")
    .textContent =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


  const elapsed =
    timerTotal
      ? (
        timerTotal -
        timerRemaining
      ) /
      timerTotal
      : 0;


  const deg =
    Math.min(
      360,
      Math.max(
        0,
        elapsed * 360
      )
    );


  const ring =
    $(".timer-ring");


  if (ring) {

    ring.style.background = `

      conic-gradient(
        var(--peach) 0deg,
        var(--peach-light) ${deg}deg,
        rgba(255,255,255,.09) ${deg}deg
      )

    `;

  }

}



function startTimer() {

  if (
    timerRunning
  ) {

    return;

  }


  if (
    timerRemaining <= 0
  ) {

    timerRemaining =
      timerTotal;

  }


  timerRunning =
    true;


  $("#timerStatus")
    .textContent =
      "FOCUSING";


  timerInterval =
    setInterval(
      () => {

        timerRemaining -=
          1;


        updateTimerDisplay();


        if (
          timerRemaining <= 0
        ) {

          stopTimer();


          timerRemaining =
            0;


          updateTimerDisplay();


          $("#timerStatus")
            .textContent =
              "COMPLETE";


          const topic =
            $("#sessionTopic")
              .value
              .trim();


          if (topic) {

            addSessionFromCurrent(
              true
            );


            alert(
              "Pomodoro complete. Session saved."
            );

          }

          else {

            alert(
              "Pomodoro complete. Add a topic and save the session."
            );

          }

        }

      },
      1000
    );

}



function stopTimer() {

  clearInterval(
    timerInterval
  );


  timerInterval =
    null;


  timerRunning =
    false;

}



function pauseTimer() {

  stopTimer();


  $("#timerStatus")
    .textContent =
      "PAUSED";

}



function resetTimer() {

  stopTimer();


  timerRemaining =
    timerTotal;


  $("#timerStatus")
    .textContent =
      "READY";


  updateTimerDisplay();

}



$$(".duration-btn")
  .forEach(
    (btn) => {

      btn.addEventListener(
        "click",
        () => {

          setTimerMinutes(
            btn.dataset.minutes
          );

        }
      );

    }
  );


$("#customDurationButton")
  ?.addEventListener(
    "click",
    () => {

      const value =
        prompt(
          "Custom focus duration in minutes:",
          selectedMinutes
        );


      if (
        value === null
      ) {

        return;

      }


      const minutes =
        Number(value);


      if (
        !Number.isFinite(minutes) ||
        minutes < 1 ||
        minutes > 300
      ) {

        return alert(
          "Choose duration between 1 and 300 minutes."
        );

      }


      setTimerMinutes(
        minutes
      );

    }
  );


$("#timerStart")
  ?.addEventListener(
    "click",
    startTimer
  );


$("#timerPause")
  ?.addEventListener(
    "click",
    pauseTimer
  );


$("#timerReset")
  ?.addEventListener(
    "click",
    resetTimer
  );



/* =========================================================
   LEARNING TRACKS
========================================================= */

function getTracks() {

  return load(
    STORAGE.tracks,
    []
  );

}



function trackModal(
  item = null
) {

  openModal({

    kicker:
      item
        ? "EDIT"
        : "ADD",

    title:
      item
        ? "Learning Track"
        : "New Learning Track",

    html:

      field(
        "TRACK NAME",
        "mTrackTitle",
        item?.title || "",
        "Java + DSA"
      )

      +

      textAreaField(
        "DESCRIPTION",
        "mTrackDescription",
        item?.description || "",
        "What are you learning?"
      )

      +

      field(
        "TOTAL ITEMS / VIDEOS",
        "mTrackTotal",
        item?.total ?? "",
        "150",
        "number"
      )

      +

      field(
        "COMPLETED",
        "mTrackCompleted",
        item?.completed ?? "",
        "42",
        "number"
      )

      +

      field(
        "CURRENT TOPIC",
        "mTrackCurrent",
        item?.current || "",
        "Arrays"
      )

      +

      field(
        "NEXT TOPIC",
        "mTrackNext",
        item?.next || "",
        "ArrayList"
      )

      +

      field(
        "PLAYLIST / COURSE LINK",
        "mTrackPlaylist",
        item?.playlist || "",
        "https://..."
      )

      +

      selectField(
        "STATUS",
        "mTrackStatus",
        [
          "Active",
          "Paused",
          "Completed"
        ],
        item?.status ||
        "Active"
      ),


    onSave:
      () => {

        const title =
          $("#mTrackTitle")
            .value
            .trim();


        const total =
          Math.max(
            0,
            Number(
              $("#mTrackTotal")
                .value
            ) || 0
          );


        const completed =
          Math.max(
            0,
            Number(
              $("#mTrackCompleted")
                .value
            ) || 0
          );


        if (!title) {

          return alert(
            "Track name is required."
          );

        }


        const tracks =
          getTracks();


        const data = {

          id:
            item?.id ||
            uid(
              "track"
            ),

          title,

          description:
            $("#mTrackDescription")
              .value
              .trim(),

          total,

          completed:
            total
              ? Math.min(
                completed,
                total
              )
              : completed,

          current:
            $("#mTrackCurrent")
              .value
              .trim(),

          next:
            $("#mTrackNext")
              .value
              .trim(),

          playlist:
            $("#mTrackPlaylist")
              .value
              .trim(),

          status:
            $("#mTrackStatus")
              .value

        };


        if (item) {

          const index =
            tracks.findIndex(
              (t) =>
                t.id === item.id
            );


          if (
            index >= 0
          ) {

            tracks[index] =
              data;

          }

        }

        else {

          tracks.unshift(
            data
          );

        }


        save(
          STORAGE.tracks,
          tracks
        );


        closeModal();


        renderAll();

      }

  });

}



$("#addTrackButton")
  ?.addEventListener(
    "click",
    () =>
      trackModal()
  );



function renderTracks() {

  const tracks =
    getTracks();


  const grid =
    $("#learningTrackGrid");


  if (
    !tracks.length
  ) {

    grid.innerHTML = `

      <div
        class="empty-state"
        style="grid-column:1/-1;"
      >
        No learning tracks yet.
      </div>

    `;


    return;

  }


  grid.innerHTML =
    tracks
      .map(
        (t) => {

          const pct =
            t.total
              ? Math.min(
                100,
                Math.round(
                  (
                    t.completed /
                    t.total
                  ) *
                  100
                )
              )
              : 0;


          const playlist =
            safeUrl(
              t.playlist
            );


          return `

            <article class="learning-card">

              <div class="learning-card-top">

                <span class="track-status">

                  ${esc(
                    String(
                      t.status
                    ).toUpperCase()
                  )}

                </span>


                <div class="card-actions">

                  <button
                    data-edit-track="${t.id}"
                    type="button"
                  >
                    EDIT
                  </button>


                  <button
                    data-delete-track="${t.id}"
                    type="button"
                  >
                    REMOVE
                  </button>

                </div>

              </div>


              <h3>
                ${esc(t.title)}
              </h3>


              <p>

                ${esc(
                  t.description ||
                  "No description yet."
                )}

              </p>


              <div class="track-progress">

                <div>

                  <strong>
                    ${Number(t.completed) || 0}
                  </strong>

                  <span>
                    /
                    ${Number(t.total) || 0}
                  </span>

                </div>


                <span>
                  ${pct}%
                </span>

              </div>


              <div class="progress-bar">

                <span
                  style="width:${pct}%;"
                ></span>

              </div>


              <div class="track-details">

                <div>

                  <span>
                    CURRENT
                  </span>

                  <strong>
                    ${esc(
                      t.current || "—"
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    NEXT
                  </span>

                  <strong>
                    ${esc(
                      t.next || "—"
                    )}
                  </strong>

                </div>

              </div>


              ${
                playlist !== "#"

                  ? `

                    <a
                      class="track-link"
                      href="${playlist}"
                      target="_blank"
                      rel="noopener"
                    >
                      OPEN PLAYLIST
                    </a>

                  `

                  : `

                    <span
                      class="track-link"
                      style="opacity:.35;"
                    >
                      NO PLAYLIST LINK
                    </span>

                  `
              }

            </article>

          `;

        }
      )
      .join("");

}



$("#learningTrackGrid")
  ?.addEventListener(
    "click",
    (e) => {

      const edit =
        e.target.closest(
          "[data-edit-track]"
        );


      const del =
        e.target.closest(
          "[data-delete-track]"
        );


      if (edit) {

        const item =
          getTracks()
            .find(
              (t) =>
                t.id ===
                edit.dataset
                  .editTrack
            );


        if (item) {

          trackModal(
            item
          );

        }

      }


      if (
        del &&
        confirm(
          "Remove this learning track?"
        )
      ) {

        save(
          STORAGE.tracks,

          getTracks()
            .filter(
              (t) =>
                t.id !==
                del.dataset
                  .deleteTrack
            )
        );


        renderAll();

      }

    }
  );



/* =========================================================
   STUDY PLANNER
========================================================= */

function getPlans() {

  return load(
    STORAGE.plans,
    []
  );

}



function planModal(
  item = null
) {

  openModal({

    kicker:
      item
        ? "EDIT"
        : "ADD",

    title:
      item
        ? "Study Plan"
        : "New Study Plan",

    html:

      field(
        "PLAN / TOPIC",
        "mPlanTitle",
        item?.title || "",
        "Complete Arrays practice"
      )

      +

      field(
        "SUBJECT",
        "mPlanSubject",
        item?.subject || "",
        "DSA"
      )

      +

      field(
        "DATE",
        "mPlanDate",
        item?.date ||
        localDateKey(),
        "",
        "date"
      )

      +

      selectField(
        "STATUS",
        "mPlanStatus",
        [
          "Not Started",
          "In Progress",
          "Done"
        ],
        item?.status ||
        "Not Started"
      )

      +

      textAreaField(
        "NOTE",
        "mPlanNote",
        item?.note || "",
        "Optional notes..."
      ),


    onSave:
      () => {

        const title =
          $("#mPlanTitle")
            .value
            .trim();


        const date =
          $("#mPlanDate")
            .value;


        if (
          !title ||
          !date
        ) {

          return alert(
            "Plan and date are required."
          );

        }


        const plans =
          getPlans();


        const data = {

          id:
            item?.id ||
            uid(
              "plan"
            ),

          title,

          subject:
            $("#mPlanSubject")
              .value
              .trim(),

          date,

          status:
            $("#mPlanStatus")
              .value,

          note:
            $("#mPlanNote")
              .value
              .trim()

        };


        if (item) {

          const index =
            plans.findIndex(
              (p) =>
                p.id ===
                item.id
            );


          if (
            index >= 0
          ) {

            plans[index] =
              data;

          }

        }

        else {

          plans.unshift(
            data
          );

        }


        save(
          STORAGE.plans,
          plans
        );


        closeModal();


        renderPlans();

      }

  });

}



$("#addPlanButton")
  ?.addEventListener(
    "click",
    () =>
      planModal()
  );



$$(".planner-tab")
  .forEach(
    (tab) => {

      tab.addEventListener(
        "click",
        () => {

          plannerView =
            tab.dataset.view;


          $$(".planner-tab")
            .forEach(
              (t) => {

                t.classList.toggle(
                  "active",
                  t === tab
                );

              }
            );


          renderPlans();

        }
      );

    }
  );



function renderPlans() {

  let plans =
    getPlans();


  const today =
    localDateKey();


  if (
    plannerView === "today"
  ) {

    plans =
      plans.filter(
        (p) =>
          p.date === today
      );

  }


  if (
    plannerView === "week"
  ) {

    plans =
      plans.filter(
        (p) =>
          sameWeek(
            p.date
          )
      );

  }


  plans.sort(
    (a, b) =>
      a.date.localeCompare(
        b.date
      )
  );


  const list =
    $("#plannerList");


  if (
    !plans.length
  ) {

    list.innerHTML = `

      <div class="empty-state">
        No study plans in this view.
      </div>

    `;


    return;

  }


  list.innerHTML =
    plans
      .map(
        (p) => `

          <div
            style="
              padding:14px 15px;
              margin-bottom:9px;
              border-radius:14px;
              background:rgba(255,244,231,.05);
              border:1px solid rgba(255,244,231,.09);
              display:grid;
              grid-template-columns:1fr auto;
              gap:15px;
              align-items:center;
            "
          >

            <div>

              <strong
                style="
                  display:block;
                  font-size:13px;
                "
              >
                ${esc(p.title)}
              </strong>


              <small
                style="
                  display:block;
                  margin-top:5px;
                  color:rgba(255,248,239,.42);
                "
              >

                ${esc(
                  p.subject ||
                  "General"
                )}

                ·

                ${esc(p.date)}

                ·

                ${esc(p.status)}

              </small>


              ${
                p.note

                  ? `

                    <small
                      style="
                        display:block;
                        margin-top:4px;
                        color:rgba(255,248,239,.30);
                      "
                    >
                      ${esc(p.note)}
                    </small>

                  `

                  : ""
              }

            </div>


            <div
              style="
                display:flex;
                gap:8px;
              "
            >

              ${
                p.status !== "Done"

                  ? `

                    <button
                      data-done-plan="${p.id}"
                      type="button"
                      style="
                        border:0;
                        background:transparent;
                        color:#a3b296;
                        font-size:9px;
                        cursor:pointer;
                      "
                    >
                      DONE
                    </button>

                  `

                  : ""
              }


              <button
                data-edit-plan="${p.id}"
                type="button"
                style="
                  border:0;
                  background:transparent;
                  color:#f3b09f;
                  font-size:9px;
                  cursor:pointer;
                "
              >
                EDIT
              </button>


              <button
                data-delete-plan="${p.id}"
                type="button"
                style="
                  border:0;
                  background:transparent;
                  color:rgba(255,248,239,.42);
                  font-size:9px;
                  cursor:pointer;
                "
              >
                REMOVE
              </button>

            </div>

          </div>

        `
      )
      .join("");

}



$("#plannerList")
  ?.addEventListener(
    "click",
    (e) => {

      const plans =
        getPlans();


      const edit =
        e.target.closest(
          "[data-edit-plan]"
        );


      const del =
        e.target.closest(
          "[data-delete-plan]"
        );


      const done =
        e.target.closest(
          "[data-done-plan]"
        );


      if (edit) {

        const item =
          plans.find(
            (p) =>
              p.id ===
              edit.dataset
                .editPlan
          );


        if (item) {

          planModal(
            item
          );

        }

      }


      if (done) {

        const item =
          plans.find(
            (p) =>
              p.id ===
              done.dataset
                .donePlan
          );


        if (item) {

          item.status =
            "Done";

        }


        save(
          STORAGE.plans,
          plans
        );


        renderPlans();

      }


      if (
        del &&
        confirm(
          "Remove this study plan?"
        )
      ) {

        save(
          STORAGE.plans,

          plans.filter(
            (p) =>
              p.id !==
              del.dataset
                .deletePlan
          )
        );


        renderPlans();

      }

    }
  );



/* =========================================================
   TOP 3 FOCUS
========================================================= */

function loadFocus() {

  const all =
    load(
      STORAGE.focus,
      {}
    );


  const today =
    localDateKey();


  return (
    all[today] ||
    [
      "",
      "",
      ""
    ]
  );

}



function saveFocus() {

  const all =
    load(
      STORAGE.focus,
      {}
    );


  all[
    localDateKey()
  ] =
    $$("#topFocusList input")
      .map(
        (input) =>
          input.value
      );


  save(
    STORAGE.focus,
    all
  );

}



function renderFocus() {

  const values =
    loadFocus();


  $$("#topFocusList input")
    .forEach(
      (
        input,
        index
      ) => {

        input.value =
          values[index] ||
          "";


        input.oninput =
          saveFocus;

      }
    );

}



/* =========================================================
   CODING ARENA
========================================================= */

function getProblems() {

  return load(
    STORAGE.problems,
    []
  );

}



function problemModal(
  item = null
) {

  openModal({

    kicker:
      item
        ? "EDIT"
        : "ADD",

    title:
      item
        ? "Coding Problem"
        : "New Coding Problem",

    html:

      field(
        "PROBLEM NAME",
        "mProblemName",
        item?.name || "",
        "Two Sum"
      )

      +

      field(
        "PLATFORM",
        "mProblemPlatform",
        item?.platform || "",
        "LeetCode"
      )

      +

      field(
        "TOPIC",
        "mProblemTopic",
        item?.topic || "",
        "Arrays"
      )

      +

      selectField(
        "DIFFICULTY",
        "mProblemDifficulty",
        [
          "Easy",
          "Medium",
          "Hard"
        ],
        item?.difficulty ||
        "Easy"
      )

      +

      field(
        "PROBLEM LINK",
        "mProblemLink",
        item?.link || "",
        "https://..."
      )

      +

      textAreaField(
        "WHAT DID YOU LEARN?",
        "mProblemLearned",
        item?.learned || "",
        "Key idea, mistake, pattern..."
      ),


    onSave:
      () => {

        const name =
          $("#mProblemName")
            .value
            .trim();


        if (!name) {

          return alert(
            "Problem name is required."
          );

        }


        const problems =
          getProblems();


        const data = {

          id:
            item?.id ||
            uid(
              "problem"
            ),

          name,

          platform:
            $("#mProblemPlatform")
              .value
              .trim(),

          topic:
            $("#mProblemTopic")
              .value
              .trim(),

          difficulty:
            $("#mProblemDifficulty")
              .value,

          link:
            $("#mProblemLink")
              .value
              .trim(),

          learned:
            $("#mProblemLearned")
              .value
              .trim(),

          date:
            item?.date ||
            localDateKey()

        };


        if (item) {

          const index =
            problems.findIndex(
              (p) =>
                p.id ===
                item.id
            );


          if (
            index >= 0
          ) {

            problems[index] =
              data;

          }

        }

        else {

          problems.unshift(
            data
          );

        }


        save(
          STORAGE.problems,
          problems
        );


        closeModal();


        renderAll();

      }

  });

}



$("#addProblemButton")
  ?.addEventListener(
    "click",
    () =>
      problemModal()
  );



function renderProblems() {

  const problems =
    getProblems();


  const list =
    $("#problemList");


  if (
    !problems.length
  ) {

    list.innerHTML = `

      <div class="empty-state">
        No coding problems added yet.
      </div>

    `;

  }

  else {

    list.innerHTML =
      problems
        .map(
          (p) => `

            <div
              style="
                min-height:54px;
                display:grid;
                grid-template-columns:
                  2fr
                  1fr
                  1fr
                  .9fr
                  .65fr;
                gap:10px;
                align-items:center;
                padding:0 12px;
                border-bottom:
                  1px solid
                  rgba(255,244,231,.07);
                font-size:11px;
              "
            >

              <div>

                ${
                  safeUrl(
                    p.link
                  ) !== "#"

                    ? `

                      <a
                        href="${safeUrl(p.link)}"
                        target="_blank"
                        rel="noopener"
                        style="
                          color:#fff8ef;
                          text-decoration:none;
                        "
                      >
                        ${esc(p.name)}
                      </a>

                    `

                    : `

                      <span>
                        ${esc(p.name)}
                      </span>

                    `
                }


                ${
                  p.learned

                    ? `

                      <small
                        style="
                          display:block;
                          margin-top:4px;
                          color:rgba(255,248,239,.30);
                        "
                      >
                        ${esc(p.learned)}
                      </small>

                    `

                    : ""
                }

              </div>


              <span>
                ${esc(
                  p.platform ||
                  "—"
                )}
              </span>


              <span>
                ${esc(
                  p.topic ||
                  "—"
                )}
              </span>


              <span>
                ${esc(p.difficulty)}
              </span>


              <span
                style="
                  display:flex;
                  gap:7px;
                "
              >

                <button
                  data-edit-problem="${p.id}"
                  type="button"
                  style="
                    border:0;
                    background:transparent;
                    color:#f3b09f;
                    font-size:8px;
                    cursor:pointer;
                  "
                >
                  EDIT
                </button>


                <button
                  data-delete-problem="${p.id}"
                  type="button"
                  style="
                    border:0;
                    background:transparent;
                    color:rgba(255,248,239,.4);
                    font-size:8px;
                    cursor:pointer;
                  "
                >
                  X
                </button>

              </span>

            </div>

          `
        )
        .join("");

  }


  const easy =
    problems.filter(
      (p) =>
        p.difficulty ===
        "Easy"
    ).length;


  const medium =
    problems.filter(
      (p) =>
        p.difficulty ===
        "Medium"
    ).length;


  const hard =
    problems.filter(
      (p) =>
        p.difficulty ===
        "Hard"
    ).length;


  $("#codingTotal")
    .textContent =
      problems.length;


  $("#problemCount")
    .textContent =
      problems.length;


  $("#easyCount")
    .textContent =
      easy;


  $("#mediumCount")
    .textContent =
      medium;


  $("#hardCount")
    .textContent =
      hard;

}



$("#problemList")
  ?.addEventListener(
    "click",
    (e) => {

      const edit =
        e.target.closest(
          "[data-edit-problem]"
        );


      const del =
        e.target.closest(
          "[data-delete-problem]"
        );


      if (edit) {

        const item =
          getProblems()
            .find(
              (p) =>
                p.id ===
                edit.dataset
                  .editProblem
            );


        if (item) {

          problemModal(
            item
          );

        }

      }


      if (
        del &&
        confirm(
          "Remove this coding problem?"
        )
      ) {

        save(
          STORAGE.problems,

          getProblems()
            .filter(
              (p) =>
                p.id !==
                del.dataset
                  .deleteProblem
            )
        );


        renderAll();

      }

    }
  );



/* =========================================================
   RESOURCES
========================================================= */

function getResources() {

  return load(
    STORAGE.resources,
    []
  );

}



function resourceModal(
  item = null
) {

  openModal({

    kicker:
      item
        ? "EDIT"
        : "ADD",

    title:
      item
        ? "Resource"
        : "New Resource",

    html:

      field(
        "TITLE",
        "mResourceTitle",
        item?.title || "",
        "Java Notes"
      )

      +

      selectField(
        "TYPE",
        "mResourceType",
        [
          "Link",
          "PDF",
          "Video",
          "Note",
          "Code",
          "Other"
        ],
        item?.type ||
        "Link"
      )

      +

      field(
        "URL / LINK",
        "mResourceUrl",
        item?.url || "",
        "https://..."
      )

      +

      textAreaField(
        "NOTE",
        "mResourceNote",
        item?.note || "",
        "Why is this useful?"
      ),


    onSave:
      () => {

        const title =
          $("#mResourceTitle")
            .value
            .trim();


        if (!title) {

          return alert(
            "Resource title is required."
          );

        }


        const resources =
          getResources();


        const data = {

          id:
            item?.id ||
            uid(
              "resource"
            ),

          title,

          type:
            $("#mResourceType")
              .value,

          url:
            $("#mResourceUrl")
              .value
              .trim(),

          note:
            $("#mResourceNote")
              .value
              .trim(),

          date:
            item?.date ||
            localDateKey()

        };


        if (item) {

          const index =
            resources.findIndex(
              (r) =>
                r.id ===
                item.id
            );


          if (
            index >= 0
          ) {

            resources[index] =
              data;

          }

        }

        else {

          resources.unshift(
            data
          );

        }


        save(
          STORAGE.resources,
          resources
        );


        closeModal();


        renderResources();

      }

  });

}



$("#addResourceButton")
  ?.addEventListener(
    "click",
    () =>
      resourceModal()
  );



function renderResources() {

  const resources =
    getResources();


  const list =
    $("#resourceList");


  if (
    !resources.length
  ) {

    list.innerHTML = `

      <div class="empty-state">
        No resources saved yet.
      </div>

    `;


    return;

  }


  list.innerHTML =
    resources
      .map(
        (r) => {

          const url =
            safeUrl(
              r.url
            );


          return `

            <div
              style="
                padding:14px;
                border-radius:14px;
                background:rgba(255,244,231,.05);
                border:1px solid rgba(255,244,231,.08);
                display:grid;
                grid-template-columns:1fr auto;
                gap:12px;
              "
            >

              <div>

                ${
                  url !== "#"

                    ? `

                      <a
                        href="${url}"
                        target="_blank"
                        rel="noopener"
                        style="
                          color:#fff8ef;
                          text-decoration:none;
                          font-weight:600;
                        "
                      >
                        ${esc(r.title)}
                      </a>

                    `

                    : `

                      <strong>
                        ${esc(r.title)}
                      </strong>

                    `
                }


                <small
                  style="
                    display:block;
                    margin-top:4px;
                    color:#f3b09f;
                  "
                >
                  ${esc(r.type)}
                </small>


                ${
                  r.note

                    ? `

                      <small
                        style="
                          display:block;
                          margin-top:5px;
                          color:rgba(255,248,239,.34);
                        "
                      >
                        ${esc(r.note)}
                      </small>

                    `

                    : ""
                }

              </div>


              <div>

                <button
                  data-edit-resource="${r.id}"
                  type="button"
                  style="
                    border:0;
                    background:transparent;
                    color:#f3b09f;
                    font-size:8px;
                    cursor:pointer;
                  "
                >
                  EDIT
                </button>


                <button
                  data-delete-resource="${r.id}"
                  type="button"
                  style="
                    border:0;
                    background:transparent;
                    color:rgba(255,248,239,.4);
                    font-size:8px;
                    cursor:pointer;
                  "
                >
                  REMOVE
                </button>

              </div>

            </div>

          `;

        }
      )
      .join("");

}



$("#resourceList")
  ?.addEventListener(
    "click",
    (e) => {

      const edit =
        e.target.closest(
          "[data-edit-resource]"
        );


      const del =
        e.target.closest(
          "[data-delete-resource]"
        );


      if (edit) {

        const item =
          getResources()
            .find(
              (r) =>
                r.id ===
                edit.dataset
                  .editResource
            );


        if (item) {

          resourceModal(
            item
          );

        }

      }


      if (
        del &&
        confirm(
          "Remove this resource?"
        )
      ) {

        save(
          STORAGE.resources,

          getResources()
            .filter(
              (r) =>
                r.id !==
                del.dataset
                  .deleteResource
            )
        );


        renderResources();

      }

    }
  );



/* =========================================================
   DOUBT VAULT
========================================================= */

function getDoubts() {

  return load(
    STORAGE.doubts,
    []
  );

}



function doubtModal(
  item = null
) {

  openModal({

    kicker:
      item
        ? "EDIT"
        : "ADD",

    title:
      item
        ? "Doubt"
        : "New Doubt",

    html:

      textAreaField(
        "QUESTION / DOUBT",
        "mDoubtQuestion",
        item?.question || "",
        "What are you stuck on?"
      )

      +

      field(
        "SUBJECT / TOPIC",
        "mDoubtSubject",
        item?.subject || "",
        "Java / DSA / DBMS..."
      )

      +

      selectField(
        "STATUS",
        "mDoubtStatus",
        [
          "Unresolved",
          "Resolved"
        ],
        item?.status ||
        "Unresolved"
      ),


    onSave:
      () => {

        const question =
          $("#mDoubtQuestion")
            .value
            .trim();


        if (!question) {

          return alert(
            "Write your doubt first."
          );

        }


        const doubts =
          getDoubts();


        const data = {

          id:
            item?.id ||
            uid(
              "doubt"
            ),

          question,

          subject:
            $("#mDoubtSubject")
              .value
              .trim(),

          status:
            $("#mDoubtStatus")
              .value,

          date:
            item?.date ||
            localDateKey()

        };


        if (item) {

          const index =
            doubts.findIndex(
              (d) =>
                d.id ===
                item.id
            );


          if (
            index >= 0
          ) {

            doubts[index] =
              data;

          }

        }

        else {

          doubts.unshift(
            data
          );

        }


        save(
          STORAGE.doubts,
          doubts
        );


        closeModal();


        renderDoubts();

      }

  });

}



$("#addDoubtButton")
  ?.addEventListener(
    "click",
    () =>
      doubtModal()
  );



function renderDoubts() {

  const doubts =
    getDoubts();


  const list =
    $("#doubtList");


  if (
    !doubts.length
  ) {

    list.innerHTML = `

      <div class="empty-state">
        No doubts added yet.
      </div>

    `;


    return;

  }


  list.innerHTML =
    doubts
      .map(
        (d) => `

          <div
            style="
              padding:14px;
              border-radius:14px;
              background:rgba(255,244,231,.05);
              border:1px solid rgba(255,244,231,.08);
              display:grid;
              grid-template-columns:1fr auto;
              gap:12px;
            "
          >

            <div>

              <strong
                style="
                  display:block;
                  font-size:12px;
                  line-height:1.5;
                "
              >
                ${esc(d.question)}
              </strong>


              <small
                style="
                  display:block;
                  margin-top:5px;
                  color:rgba(255,248,239,.38);
                "
              >

                ${esc(
                  d.subject ||
                  "General"
                )}

                ·

                ${esc(d.status)}

              </small>

            </div>


            <div
              style="
                display:flex;
                gap:8px;
              "
            >

              ${
                d.status !==
                "Resolved"

                  ? `

                    <button
                      data-resolve-doubt="${d.id}"
                      type="button"
                      style="
                        border:0;
                        background:transparent;
                        color:#a3b296;
                        font-size:8px;
                        cursor:pointer;
                      "
                    >
                      RESOLVE
                    </button>

                  `

                  : ""
              }


              <button
                data-edit-doubt="${d.id}"
                type="button"
                style="
                  border:0;
                  background:transparent;
                  color:#f3b09f;
                  font-size:8px;
                  cursor:pointer;
                "
              >
                EDIT
              </button>


              <button
                data-delete-doubt="${d.id}"
                type="button"
                style="
                  border:0;
                  background:transparent;
                  color:rgba(255,248,239,.4);
                  font-size:8px;
                  cursor:pointer;
                "
              >
                REMOVE
              </button>

            </div>

          </div>

        `
      )
      .join("");

}



$("#doubtList")
  ?.addEventListener(
    "click",
    (e) => {

      const doubts =
        getDoubts();


      const resolve =
        e.target.closest(
          "[data-resolve-doubt]"
        );


      const edit =
        e.target.closest(
          "[data-edit-doubt]"
        );


      const del =
        e.target.closest(
          "[data-delete-doubt]"
        );


      if (resolve) {

        const item =
          doubts.find(
            (d) =>
              d.id ===
              resolve.dataset
                .resolveDoubt
          );


        if (item) {

          item.status =
            "Resolved";

        }


        save(
          STORAGE.doubts,
          doubts
        );


        renderDoubts();

      }


      if (edit) {

        const item =
          doubts.find(
            (d) =>
              d.id ===
              edit.dataset
                .editDoubt
          );


        if (item) {

          doubtModal(
            item
          );

        }

      }


      if (
        del &&
        confirm(
          "Remove this doubt?"
        )
      ) {

        save(
          STORAGE.doubts,

          doubts.filter(
            (d) =>
              d.id !==
              del.dataset
                .deleteDoubt
          )
        );


        renderDoubts();

      }

    }
  );



/* =========================================================
   STATS + ANALYTICS
========================================================= */

function updateStatsAndAnalytics() {

  const sessions =
    getSessions();


  const today =
    localDateKey();


  const todayMinutes =
    sessions

      .filter(
        (s) =>
          s.date === today
      )

      .reduce(
        (
          sum,
          s
        ) =>
          sum +
          Number(
            s.minutes || 0
          ),
        0
      );


  const weekSessions =
    sessions.filter(
      (s) =>
        sameWeek(
          s.date
        )
    );


  const weekMinutes =
    weekSessions.reduce(
      (
        sum,
        s
      ) =>
        sum +
        Number(
          s.minutes || 0
        ),
      0
    );


  $("#todayStudyTime")
    .textContent =
      formatDuration(
        todayMinutes
      );


  $("#weekStudyTime")
    .textContent =
      formatDuration(
        weekMinutes
      );


  $("#activeTrackCount")
    .textContent =
      getTracks()
        .filter(
          (t) =>
            t.status ===
            "Active"
        )
        .length;


  $("#problemCount")
    .textContent =
      getProblems()
        .length;


  $("#analyticsWeekHours")
    .textContent =
      formatDuration(
        weekMinutes
      );


  $("#analyticsSessions")
    .textContent =
      weekSessions.length;


  const dayTotals =
    {};


  weekSessions.forEach(
    (s) => {

      dayTotals[
        s.date
      ] =
        (
          dayTotals[
            s.date
          ] ||
          0
        )
        +
        Number(
          s.minutes || 0
        );

    }
  );


  const best =
    Object.entries(
      dayTotals
    )
      .sort(
        (
          a,
          b
        ) =>
          b[1] -
          a[1]
      )[0];


  $("#analyticsBestDay")
    .textContent =
      best

        ? dateFromKey(
          best[0]
        )
          .toLocaleDateString(
            "en-US",
            {
              weekday:
                "short"
            }
          )
          .toUpperCase()

        : "—";


  const activeDays =
    Object.keys(
      dayTotals
    ).length;


  $("#analyticsConsistency")
    .textContent =
      `${Math.round(
        (
          activeDays /
          7
        ) *
        100
      )}%`;


  const history =
    $("#historyList");


  const recent =
    sessions.slice(
      0,
      8
    );


  if (
    !recent.length
  ) {

    history.innerHTML = `

      <div class="empty-state">
        Your study history will appear here.
      </div>

    `;

  }

  else {

    history.innerHTML =
      recent
        .map(
          (s) => `

            <div
              style="
                padding:13px 15px;
                border-radius:13px;
                background:rgba(255,244,231,.045);
                display:flex;
                justify-content:space-between;
                gap:12px;
                align-items:center;
              "
            >

              <div>

                <strong
                  style="
                    font-size:12px;
                  "
                >
                  ${esc(s.topic)}
                </strong>


                <small
                  style="
                    display:block;
                    margin-top:4px;
                    color:rgba(255,248,239,.35);
                  "
                >

                  ${esc(s.date)}
                  ·
                  ${esc(s.source)}

                </small>

              </div>


              <span
                style="
                  color:#f3b09f;
                  font-size:10px;
                  font-weight:700;
                "
              >
                ${formatDuration(s.minutes)}
              </span>

            </div>

          `
        )
        .join("");

  }

}



/* =========================================================
   MASTER RENDER
========================================================= */

function renderAll() {

  renderSessions();

  renderTracks();

  renderPlans();

  renderFocus();

  renderProblems();

  renderResources();

  renderDoubts();

  updateStatsAndAnalytics();

}



/* =========================================================
   START PAGE
========================================================= */

updateDateTime();


setInterval(
  updateDateTime,
  30000
);


setTimerMinutes(
  25
);


renderAll();

/* =========================================================
   DAILY STUDY TRACKER
========================================================= */

const DAILY_STUDY_ITEMS_KEY =
  "growthMapDailyStudyItemsV1";

const DAILY_STUDY_LOGS_KEY =
  "growthMapDailyStudyLogsV1";


let selectedStudyTrackerDate =
  localDateKey();


/* =========================================================
   DATE
========================================================= */

function moveStudyTrackerDate(
  dateKey,
  amount
) {

  const date =
    dateFromKey(
      dateKey
    );


  date.setDate(
    date.getDate() +
    amount
  );


  return localDateKey(
    date
  );

}


function studyItemDateKey(
  iso
) {

  if (!iso) {

    return null;

  }


  const date =
    new Date(
      iso
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return null;

  }


  return localDateKey(
    date
  );

}


/* =========================================================
   DATA
========================================================= */

function getDailyStudyItems() {

  return load(
    DAILY_STUDY_ITEMS_KEY,
    []
  );

}


function getDailyStudyLogs() {

  return load(
    DAILY_STUDY_LOGS_KEY,
    []
  );

}


function getDailyStudyItemsForDate(
  dateKey
) {

  return getDailyStudyItems()
    .filter(
      item => {

        const created =
          studyItemDateKey(
            item.createdAt
          );


        const archived =
          studyItemDateKey(
            item.archivedAt
          );


        const existed =
          !created ||
          created <=
          dateKey;


        const active =
          !archived ||
          archived >
          dateKey;


        return (
          existed &&
          active
        );

      }
    );

}


function getDailyStudyLog(
  itemId,
  dateKey
) {

  return getDailyStudyLogs()
    .find(
      log =>
        log.itemId ===
          itemId &&
        log.date ===
          dateKey
    );

}


/* =========================================================
   STATS
========================================================= */

function getDailyStudyStats(
  dateKey
) {

  const items =
    getDailyStudyItemsForDate(
      dateKey
    );


  const completed =
    items.filter(
      item =>
        getDailyStudyLog(
          item.id,
          dateKey
        )?.done
    )
      .length;


  const total =
    items.length;


  const percentage =
    total

      ? Math.round(
          (
            completed /
            total
          ) * 100
        )

      : 0;


  return {

    completed,

    total,

    percentage

  };

}


/* =========================================================
   DATE NAV
========================================================= */

function renderStudyTrackerDate() {

  const date =
    dateFromKey(
      selectedStudyTrackerDate
    );


  const today =
    localDateKey();


  const day =
    document.getElementById(
      "studyTrackerDay"
    );


  const dateLabel =
    document.getElementById(
      "studyTrackerDate"
    );


  const next =
    document.getElementById(
      "studyTrackerNext"
    );


  const todayButton =
    document.getElementById(
      "studyTrackerToday"
    );


  if (day) {

    day.textContent =
      selectedStudyTrackerDate ===
      today

        ? "TODAY"

        : date
            .toLocaleDateString(
              "en-US",
              {
                weekday:
                  "long"
              }
            )
            .toUpperCase();

  }


  if (dateLabel) {

    dateLabel.textContent =
      date
        .toLocaleDateString(
          "en-US",
          {
            day:
              "numeric",

            month:
              "short",

            year:
              "numeric"
          }
        )
        .toUpperCase();

  }


  if (next) {

    next.disabled =
      selectedStudyTrackerDate >=
      today;

  }


  if (todayButton) {

    todayButton.disabled =
      selectedStudyTrackerDate ===
      today;

  }

}


/* =========================================================
   WEEK STRIP
========================================================= */

function renderStudyTrackerWeek() {

  const container =
    document.getElementById(
      "studyTrackerWeek"
    );


  if (!container) {

    return;

  }


  const selectedDate =
    dateFromKey(
      selectedStudyTrackerDate
    );


  const weekStart =
    startOfWeek(
      selectedDate
    );


  const today =
    localDateKey();


  let html = "";


  for (
    let i = 0;
    i < 7;
    i++
  ) {

    const date =
      new Date(
        weekStart
      );


    date.setDate(
      weekStart.getDate() +
      i
    );


    const key =
      localDateKey(
        date
      );


    const stats =
      getDailyStudyStats(
        key
      );


    const future =
      key >
      today;


    const active =
      key ===
      selectedStudyTrackerDate;


    const isToday =
      key ===
      today;


    const dayName =
      date
        .toLocaleDateString(
          "en-US",
          {
            weekday:
              "short"
          }
        )
        .toUpperCase();


    html += `

      <button
        type="button"

        class="
          study-tracker-day
          ${active ? "active" : ""}
          ${isToday ? "today" : ""}
        "

        data-study-date="${key}"

        ${future ? "disabled" : ""}
      >

        <span>
          ${dayName}
        </span>

        <strong>
          ${date.getDate()}
        </strong>

        <small>

          ${
            stats.total

              ? `${stats.completed}/${stats.total}`

              : "--"
          }

        </small>

      </button>

    `;

  }


  container.innerHTML =
    html;


  container
    .querySelectorAll(
      ".study-tracker-day:not(:disabled)"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            selectedStudyTrackerDate =
              button.dataset
                .studyDate;


            renderDailyStudyTracker();

          }
        );

      }
    );

}


/* =========================================================
   ITEMS
========================================================= */

function renderDailyStudyItems() {

  const container =
    document.getElementById(
      "studyTrackerList"
    );


  if (!container) {

    return;

  }


  const items =
    getDailyStudyItemsForDate(
      selectedStudyTrackerDate
    );


  if (
    !items.length
  ) {

    container.innerHTML = `

      <div class="empty-state">

        ${
          selectedStudyTrackerDate ===
          localDateKey()

            ? "Add your daily study items once."

            : "No study items existed on this date."
        }

      </div>

    `;


    return;

  }


  container.innerHTML =
    items
      .map(
        item => {

          const done =
            Boolean(
              getDailyStudyLog(
                item.id,
                selectedStudyTrackerDate
              )?.done
            );


          const actions =
            selectedStudyTrackerDate ===
            localDateKey()

              ? `

                  <div
                    class="study-tracker-actions"
                  >

                    <button
                      type="button"
                      data-edit-study-item="${item.id}"
                    >
                      EDIT
                    </button>


                    <button
                      type="button"
                      data-remove-study-item="${item.id}"
                    >
                      REMOVE
                    </button>

                  </div>

                `

              : "";


          return `

            <div
              class="
                study-tracker-item
                ${done ? "done" : ""}
              "
            >

              <button
                type="button"

                class="
                  study-tracker-check
                  ${done ? "done" : ""}
                "

                data-toggle-study-item="${item.id}"
              >
                ${done ? "✓" : ""}
              </button>


              <div
                class="study-tracker-copy"
              >

                <strong>
                  ${esc(
                    item.name
                  )}
                </strong>

                <small>

                  ${
                    done
                      ? "COMPLETED"
                      : "PENDING"
                  }

                </small>

              </div>


              ${actions}

            </div>

          `;

        }
      )
      .join("");


  container
    .querySelectorAll(
      "[data-toggle-study-item]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            toggleDailyStudyItem(
              button.dataset
                .toggleStudyItem
            );

          }
        );

      }
    );


  container
    .querySelectorAll(
      "[data-edit-study-item]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            openDailyStudyItemForm(
              button.dataset
                .editStudyItem
            );

          }
        );

      }
    );


  container
    .querySelectorAll(
      "[data-remove-study-item]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            removeDailyStudyItem(
              button.dataset
                .removeStudyItem
            );

          }
        );

      }
    );

}


/* =========================================================
   TOGGLE
========================================================= */

function toggleDailyStudyItem(
  itemId
) {

  const logs =
    getDailyStudyLogs();


  const existing =
    logs.find(
      log =>
        log.itemId ===
          itemId &&
        log.date ===
          selectedStudyTrackerDate
    );


  if (existing) {

    existing.done =
      !existing.done;


    existing.updatedAt =
      new Date()
        .toISOString();

  }

  else {

    logs.push({

      id:
        uid(
          "study-daily-log"
        ),

      itemId,

      date:
        selectedStudyTrackerDate,

      done:
        true,

      createdAt:
        new Date()
          .toISOString()

    });

  }


  save(
    DAILY_STUDY_LOGS_KEY,
    logs
  );


  renderDailyStudyTracker();

}


/* =========================================================
   ADD / EDIT
========================================================= */

function openDailyStudyItemForm(
  editId = null
) {

  const items =
    getDailyStudyItems();


  const existing =
    editId

      ? items.find(
          item =>
            item.id ===
            editId
        )

      : null;


  openModal({

    kicker:
      "DAILY TRACKER",

    title:
      existing
        ? "Edit Study Item"
        : "Add Study Item",


    html:

      field(
        "STUDY ITEM",
        "dailyStudyItemName",
        existing?.name ||
          "",
        "Java / DSA, Revision, College Study..."
      ),


    onSave:
      () => {

        const name =
          document
            .getElementById(
              "dailyStudyItemName"
            )
            .value
            .trim();


        if (!name) {

          return;

        }


        if (existing) {

          existing.name =
            name;


          existing.updatedAt =
            new Date()
              .toISOString();

        }

        else {

          items.push({

            id:
              uid(
                "daily-study"
              ),

            name,

            createdAt:
              new Date()
                .toISOString(),

            archivedAt:
              null

          });

        }


        save(
          DAILY_STUDY_ITEMS_KEY,
          items
        );


        closeModal();


        selectedStudyTrackerDate =
          localDateKey();


        renderDailyStudyTracker();

      }

  });

}


/* =========================================================
   REMOVE
========================================================= */

function removeDailyStudyItem(
  id
) {

  const items =
    getDailyStudyItems();


  const item =
    items.find(
      entry =>
        entry.id ===
        id
    );


  if (!item) {

    return;

  }


  if (
    !confirm(
      `Remove "${item.name}" from future tracking?\n\nPrevious history will stay saved.`
    )
  ) {

    return;

  }


  item.archivedAt =
    new Date()
      .toISOString();


  save(
    DAILY_STUDY_ITEMS_KEY,
    items
  );


  renderDailyStudyTracker();

}


/* =========================================================
   PROGRESS
========================================================= */

function renderDailyStudyProgress() {

  const stats =
    getDailyStudyStats(
      selectedStudyTrackerDate
    );


  const progress =
    document.getElementById(
      "studyTrackerProgress"
    );


  const percentage =
    document.getElementById(
      "studyTrackerPercentage"
    );


  const bar =
    document.getElementById(
      "studyTrackerProgressBar"
    );


  if (progress) {

    progress.textContent =
      `${stats.completed} / ${stats.total}`;

  }


  if (percentage) {

    percentage.textContent =
      `${stats.percentage}%`;

  }


  if (bar) {

    bar.style.width =
      `${stats.percentage}%`;

  }

}


/* =========================================================
   MASTER
========================================================= */

function renderDailyStudyTracker() {

  renderStudyTrackerDate();

  renderStudyTrackerWeek();

  renderDailyStudyItems();

  renderDailyStudyProgress();

}


/* =========================================================
   BUTTONS
========================================================= */

document
  .getElementById(
    "studyTrackerPrevious"
  )
  ?.addEventListener(
    "click",
    () => {

      selectedStudyTrackerDate =
        moveStudyTrackerDate(
          selectedStudyTrackerDate,
          -1
        );


      renderDailyStudyTracker();

    }
  );


document
  .getElementById(
    "studyTrackerNext"
  )
  ?.addEventListener(
    "click",
    () => {

      const next =
        moveStudyTrackerDate(
          selectedStudyTrackerDate,
          1
        );


      if (
        next >
        localDateKey()
      ) {

        return;

      }


      selectedStudyTrackerDate =
        next;


      renderDailyStudyTracker();

    }
  );


document
  .getElementById(
    "studyTrackerToday"
  )
  ?.addEventListener(
    "click",
    () => {

      selectedStudyTrackerDate =
        localDateKey();


      renderDailyStudyTracker();

    }
  );


document
  .getElementById(
    "addStudyTrackerItem"
  )
  ?.addEventListener(
    "click",
    () => {

      openDailyStudyItemForm();

    }
  );


renderDailyStudyTracker();

/* =========================================================
   STUDY OS V3
   Roadmap + Mission Control + Revision + Knowledge + Inbox
   + Milestones + Weekly Command
========================================================= */

const STUDY_OS_STORAGE = {
  settings: "growthMapStudyOSSettingsV1",
  revision: "growthMapStudyRevisionV1",
  knowledge: "growthMapStudyKnowledgeV1",
  inbox: "growthMapLearningInboxV1",
  milestones: "growthMapStudyMilestonesV1",
  weeklyTargets: "growthMapStudyWeeklyTargetsV1",
  weeklyReflection: "growthMapStudyWeeklyReflectionV1"
};


const STUDY_OS_DEFAULT_SETTINGS = {
  currentPhase: "Core Java",
  currentTopic: "",
  primaryMission: "Core Java",
  parallelMission: "Growth Map Backend",
  nextPhase: "DSA in Java"
};


const ROADMAP_DETAILS = {
  "core-java": {
    title: "Core Java",
    kicker: "ACTIVE FOUNDATION",
    body: `
      <div class="modal-note-grid">
        <p><strong>WHY:</strong> Your main language foundation for DSA, backend work and Java systems projects.</p>
        <p><strong>FOCUS:</strong> Fundamentals, OOP, Collections, Generics, Exceptions, Arrays and Strings.</p>
        <p><strong>CHECKPOINT:</strong> When the foundation is comfortable, DSA becomes the permanent practice track.</p>
      </div>
    `
  },
  "growth-backend": {
    title: "Growth Map Backend",
    kicker: "PARALLEL BUILD",
    body: `
      <div class="modal-note-grid">
        <p><strong>WHY:</strong> Learn backend by solving a real persistence problem instead of waiting to know everything first.</p>
        <p><strong>STACK:</strong> Spring Boot, REST APIs, PostgreSQL and real file storage.</p>
        <p><strong>RULE:</strong> Build first, learn the meaning of every important piece you use.</p>
      </div>
    `
  },
  dsa: {
    title: "DSA in Java",
    kicker: "PLACEMENT TRACK",
    body: `
      <div class="modal-note-grid">
        <p><strong>START:</strong> After the Core Java foundation checkpoint.</p>
        <p><strong>FLOW:</strong> Arrays → Binary Search → Strings → Linked List → Stack/Queue → Trees → Graphs → DP.</p>
        <p><strong>IMPORTANT:</strong> DSA is not a one-time phase. Practice and revision continue until placements.</p>
      </div>
    `
  },
  "mini-redis": {
    title: "Mini Redis",
    kicker: "JAVA SYSTEMS PROJECT",
    body: `
      <div class="modal-note-grid">
        <p><strong>START SIMPLE:</strong> SET, GET, DELETE and EXISTS using an in-memory key-value store.</p>
        <p><strong>THEN LEARN:</strong> File I/O, TTL, sockets, threads, concurrency, Maven and JUnit as the project needs them.</p>
        <p><strong>VALUE:</strong> Turns Java concepts into real systems knowledge.</p>
      </div>
    `
  },
  "system-design": {
    title: "System Design",
    kicker: "ENGINEERING LAYER",
    body: `
      <div class="modal-note-grid">
        <p><strong>WHEN:</strong> After you have touched backend, database, networking and caching in real projects.</p>
        <p><strong>LEARN:</strong> Client/server, HTTP, databases, caching, load balancing, scaling, replication, queues and storage.</p>
        <p><strong>GOAL:</strong> Understand why systems are shaped the way they are, not memorize architecture diagrams.</p>
      </div>
    `
  },
  hardware: {
    title: "Hardware Literacy",
    kicker: "SUPPORTING SKILL",
    body: `
      <div class="modal-note-grid">
        <p><strong>ROLE:</strong> Supporting literacy, not your primary career track.</p>
        <p><strong>LEARN:</strong> Voltage/current, multimeter, GPIO, I2C/SPI/UART, sensors, power, drivers and datasheet reading.</p>
        <p><strong>PROCESS:</strong> Requirements → block diagram → component selection → power/pin checks → test one subsystem → integrate.</p>
      </div>
    `
  },
  python: {
    title: "Python",
    kicker: "FUTURE AI LANGUAGE",
    body: `
      <div class="modal-note-grid">
        <p><strong>WHY LATER:</strong> Java is the current foundation. Python becomes the serious second language for the AI track.</p>
        <p><strong>FLOW:</strong> Python core → NumPy/Pandas → AI/ML fundamentals.</p>
      </div>
    `
  },
  genai: {
    title: "Generative AI",
    kicker: "FUTURE SPECIALIZATION",
    body: `
      <div class="modal-note-grid">
        <p><strong>PREREQUISITES:</strong> Python comfort, APIs and basic AI/ML understanding.</p>
        <p><strong>LEARN:</strong> LLM APIs, structured outputs, embeddings, vector databases, RAG and evaluation.</p>
        <p><strong>RULE:</strong> Build a serious AI application, not just a prompt wrapper.</p>
      </div>
    `
  },
  agentic: {
    title: "Agentic AI",
    kicker: "ADVANCED AI",
    body: `
      <div class="modal-note-grid">
        <p><strong>AFTER GENAI:</strong> Agents make more sense after LLM, RAG and API fundamentals.</p>
        <p><strong>LEARN:</strong> Tool calling, state, memory, workflows, planning, MCP concepts and multi-step execution.</p>
      </div>
    `
  }
};


function getStudyOSSettings() {
  return {
    ...STUDY_OS_DEFAULT_SETTINGS,
    ...load(STUDY_OS_STORAGE.settings, {})
  };
}


function getStudyDayMode(date = new Date()) {
  const day = date.getDay();

  if ([0, 2, 6].includes(day)) {
    return {
      mode: "DEEP",
      label: "DEEP WORK DAY",
      cue: "Use the extra space for long learning and build sessions."
    };
  }

  if (day === 5) {
    return {
      mode: "MEDIUM",
      label: "MEDIUM DAY",
      cue: "Keep momentum and use the half day for one meaningful build."
    };
  }

  return {
    mode: "LIGHT",
    label: "LIGHT DAY",
    cue: "Maintain continuity. Small progress is enough today."
  };
}


function renderStudyOSHero() {
  const settings = getStudyOSSettings();
  const dayMode = getStudyDayMode();

  const modeChip = $("#osDayMode");
  if (modeChip) {
    modeChip.textContent = dayMode.label;
    modeChip.dataset.mode = dayMode.mode;
    modeChip.title = dayMode.cue;
  }

  $("#osCurrentPhase") && ($("#osCurrentPhase").textContent = settings.currentPhase || "—");
  $("#osNextPhase") && ($("#osNextPhase").textContent = settings.nextPhase || "—");
  $("#osPrimaryMission") && ($("#osPrimaryMission").textContent = settings.primaryMission || "—");
  $("#osParallelMission") && ($("#osParallelMission").textContent = settings.parallelMission || "—");
  $("#osNextMission") && ($("#osNextMission").textContent = settings.nextPhase || "—");
  $("#osCurrentTopic") && ($("#osCurrentTopic").textContent = settings.currentTopic || "Set today's current topic");
}


function openStudyFocusEditor() {
  const settings = getStudyOSSettings();

  openModal({
    kicker: "FOCUS LOCK",
    title: "Current Learning Phase",
    html:
      field("CURRENT PHASE", "mOSCurrentPhase", settings.currentPhase, "Core Java") +
      field("CURRENT TOPIC", "mOSCurrentTopic", settings.currentTopic, "OOP — Interfaces") +
      field("PRIMARY MISSION", "mOSPrimaryMission", settings.primaryMission, "Core Java") +
      field("PARALLEL BUILD", "mOSParallelMission", settings.parallelMission, "Growth Map Backend") +
      field("NEXT PHASE", "mOSNextPhase", settings.nextPhase, "DSA in Java"),
    onSave: () => {
      save(STUDY_OS_STORAGE.settings, {
        currentPhase: $("#mOSCurrentPhase").value.trim(),
        currentTopic: $("#mOSCurrentTopic").value.trim(),
        primaryMission: $("#mOSPrimaryMission").value.trim(),
        parallelMission: $("#mOSParallelMission").value.trim(),
        nextPhase: $("#mOSNextPhase").value.trim()
      });
      closeModal();
      renderStudyOSHero();
    }
  });
}


$("#editStudyFocus")?.addEventListener("click", openStudyFocusEditor);


function renderMissionDeck() {
  const values = loadFocus()
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 3);

  const list = $("#missionDeckList");
  const count = $("#missionCount");
  const title = $("#missionDeckTitle");

  if (!list || !count || !title) return;

  count.textContent = `${values.length}/3`;

  if (!values.length) {
    title.textContent = "Set your Top 3 Focus";
    list.innerHTML = `<div class="mission-empty">Your Top 3 Focus from the planner will appear here.</div>`;
    return;
  }

  title.textContent = values[0];
  list.innerHTML = values
    .map((value, index) => `
      <div class="mission-item">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <strong>${esc(value)}</strong>
      </div>
    `)
    .join("");
}


$("#topFocusList")?.addEventListener("input", () => {
  setTimeout(renderMissionDeck, 0);
});


$$('[data-roadmap-node]').forEach((node) => {
  node.addEventListener("click", () => {
    const data = ROADMAP_DETAILS[node.dataset.roadmapNode];
    if (!data) return;

    openModal({
      kicker: data.kicker,
      title: data.title,
      html: data.body,
      onSave: closeModal
    });

    modalSave.textContent = "CLOSE";
  });
});


/* =========================================================
   REVISION ENGINE
========================================================= */

const REVISION_INTERVALS = [1, 3, 7, 21];

function getRevisionItems() {
  return load(STUDY_OS_STORAGE.revision, []);
}

function addDaysKey(dateKey, days) {
  const date = dateFromKey(dateKey);
  date.setDate(date.getDate() + Number(days || 0));
  return localDateKey(date);
}

function openRevisionForm() {
  openModal({
    kicker: "REVISION",
    title: "Add Topic",
    html:
      field("TOPIC", "mRevisionTopic", "", "Interfaces vs Abstract Class") +
      selectField("DOMAIN", "mRevisionDomain", ["Java", "DSA", "Backend", "Systems", "System Design", "Hardware", "Python", "AI / ML", "GenAI", "Agentic AI", "Other"], "Java") +
      field("LEARNED DATE", "mRevisionLearned", localDateKey(), "", "date"),
    onSave: () => {
      const topic = $("#mRevisionTopic").value.trim();
      const domain = $("#mRevisionDomain").value;
      const learnedDate = $("#mRevisionLearned").value || localDateKey();
      if (!topic) return alert("Topic is required.");

      const items = getRevisionItems();
      items.unshift({
        id: uid("revision"),
        topic,
        domain,
        learnedDate,
        reviewIndex: 0,
        reviewCount: 0,
        nextReview: addDaysKey(learnedDate, REVISION_INTERVALS[0]),
        createdAt: new Date().toISOString()
      });
      save(STUDY_OS_STORAGE.revision, items);
      closeModal();
      renderRevisionEngine();
    }
  });
}

function markRevisionDone(id) {
  const items = getRevisionItems();
  const item = items.find((x) => x.id === id);
  if (!item) return;

  item.reviewCount = Number(item.reviewCount || 0) + 1;
  item.reviewIndex = Math.min(Number(item.reviewIndex || 0) + 1, REVISION_INTERVALS.length - 1);
  item.lastReviewed = localDateKey();
  item.nextReview = addDaysKey(localDateKey(), REVISION_INTERVALS[item.reviewIndex]);

  save(STUDY_OS_STORAGE.revision, items);
  renderRevisionEngine();
}

function deleteRevisionItem(id) {
  save(STUDY_OS_STORAGE.revision, getRevisionItems().filter((x) => x.id !== id));
  renderRevisionEngine();
}

function renderRevisionEngine() {
  const list = $("#revisionList");
  const count = $("#revisionDueCount");
  if (!list || !count) return;

  const today = localDateKey();
  const items = getRevisionItems().sort((a, b) => String(a.nextReview).localeCompare(String(b.nextReview)));
  const dueCount = items.filter((x) => !x.nextReview || x.nextReview <= today).length;
  count.textContent = String(dueCount);

  if (!items.length) {
    list.innerHTML = `<div class="empty-state">No revision topics yet.</div>`;
    return;
  }

  list.innerHTML = items.map((item) => {
    const due = !item.nextReview || item.nextReview <= today;
    return `
      <div class="revision-item">
        <div class="revision-item-top">
          <div>
            <strong>${esc(item.topic)}</strong>
            <small>${esc(item.domain || "Other")} · ${due ? "DUE NOW" : `Next ${esc(item.nextReview)}`} · ${Number(item.reviewCount || 0)} revisions</small>
          </div>
          <div class="tool-actions">
            <button class="primary" type="button" data-revision-done="${item.id}">REVISED</button>
            <button type="button" data-revision-delete="${item.id}">REMOVE</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

$("#addRevisionButton")?.addEventListener("click", openRevisionForm);
$("#revisionList")?.addEventListener("click", (e) => {
  const done = e.target.closest("[data-revision-done]");
  const del = e.target.closest("[data-revision-delete]");
  if (done) markRevisionDone(done.dataset.revisionDone);
  if (del && confirm("Remove this revision topic?")) deleteRevisionItem(del.dataset.revisionDelete);
});


/* =========================================================
   KNOWLEDGE NOTES
========================================================= */

function getKnowledgeNotes() {
  return load(STUDY_OS_STORAGE.knowledge, []);
}

function openKnowledgeNoteForm() {
  openModal({
    kicker: "KNOWLEDGE",
    title: "Add Note",
    html:
      field("TITLE", "mKnowledgeTitle", "", "HashMap") +
      selectField("DOMAIN", "mKnowledgeDomain", ["Java", "DSA", "Backend", "Systems", "System Design", "Hardware", "Python", "AI / ML", "GenAI", "Agentic AI", "Other"], "Java") +
      textAreaField("MY UNDERSTANDING", "mKnowledgeSummary", "", "Explain it in your own words...") +
      textAreaField("KEY TAKEAWAY / EXAMPLE", "mKnowledgeTakeaway", "", "One thing you want future-you to remember..."),
    onSave: () => {
      const title = $("#mKnowledgeTitle").value.trim();
      if (!title) return alert("Title is required.");

      const notes = getKnowledgeNotes();
      notes.unshift({
        id: uid("knowledge"),
        title,
        domain: $("#mKnowledgeDomain").value,
        summary: $("#mKnowledgeSummary").value.trim(),
        takeaway: $("#mKnowledgeTakeaway").value.trim(),
        createdAt: new Date().toISOString()
      });
      save(STUDY_OS_STORAGE.knowledge, notes);
      closeModal();
      renderKnowledgeNotes();
    }
  });
}

function renderKnowledgeNotes() {
  const list = $("#knowledgeList");
  const count = $("#knowledgeCount");
  if (!list || !count) return;

  const notes = getKnowledgeNotes();
  count.textContent = String(notes.length);

  if (!notes.length) {
    list.innerHTML = `<div class="empty-state">Save short notes in your own words.</div>`;
    return;
  }

  list.innerHTML = notes.slice(0, 8).map((note) => `
    <div class="knowledge-item">
      <div class="knowledge-item-top">
        <div>
          <strong>${esc(note.title)}</strong>
          <small>${esc(note.domain || "Other")}${note.summary ? ` · ${esc(note.summary.slice(0, 120))}` : ""}</small>
          ${note.takeaway ? `<small><b>Remember:</b> ${esc(note.takeaway.slice(0, 120))}</small>` : ""}
        </div>
        <div class="tool-actions">
          <button type="button" data-knowledge-delete="${note.id}">REMOVE</button>
        </div>
      </div>
    </div>
  `).join("");
}

$("#addKnowledgeNoteButton")?.addEventListener("click", openKnowledgeNoteForm);
$("#knowledgeList")?.addEventListener("click", (e) => {
  const del = e.target.closest("[data-knowledge-delete]");
  if (!del || !confirm("Remove this note?")) return;
  save(STUDY_OS_STORAGE.knowledge, getKnowledgeNotes().filter((x) => x.id !== del.dataset.knowledgeDelete));
  renderKnowledgeNotes();
});


/* =========================================================
   LEARNING INBOX
========================================================= */

function getLearningInbox() {
  return load(STUDY_OS_STORAGE.inbox, []);
}

function openLearningInboxForm() {
  openModal({
    kicker: "NOT NOW ≠ NEVER",
    title: "Park a Skill / Resource",
    html:
      field("SKILL / IDEA", "mInboxTitle", "", "Docker") +
      textAreaField("WHY DID YOU SAVE IT?", "mInboxWhy", "", "Useful later for deployment...") +
      selectField("WHEN", "mInboxWhen", ["Later", "After current phase", "Project requirement", "Someday"], "Later"),
    onSave: () => {
      const title = $("#mInboxTitle").value.trim();
      if (!title) return alert("Skill / idea is required.");
      const items = getLearningInbox();
      items.unshift({
        id: uid("inbox"),
        title,
        why: $("#mInboxWhy").value.trim(),
        when: $("#mInboxWhen").value,
        createdAt: new Date().toISOString()
      });
      save(STUDY_OS_STORAGE.inbox, items);
      closeModal();
      renderLearningInbox();
    }
  });
}

function renderLearningInbox() {
  const list = $("#learningInboxList");
  const count = $("#learningInboxCount");
  if (!list || !count) return;

  const items = getLearningInbox();
  count.textContent = String(items.length);

  if (!items.length) {
    list.innerHTML = `<div class="empty-state">No parked skills. Good — stay focused.</div>`;
    return;
  }

  list.innerHTML = items.slice(0, 10).map((item) => `
    <div class="inbox-item">
      <div class="inbox-item-top">
        <div>
          <strong>${esc(item.title)}</strong>
          <small>${esc(item.when || "Later")}${item.why ? ` · ${esc(item.why.slice(0, 120))}` : ""}</small>
        </div>
        <div class="tool-actions">
          <button type="button" data-inbox-delete="${item.id}">REMOVE</button>
        </div>
      </div>
    </div>
  `).join("");
}

$("#addInboxButton")?.addEventListener("click", openLearningInboxForm);
$("#learningInboxList")?.addEventListener("click", (e) => {
  const del = e.target.closest("[data-inbox-delete]");
  if (!del || !confirm("Remove this parked item?")) return;
  save(STUDY_OS_STORAGE.inbox, getLearningInbox().filter((x) => x.id !== del.dataset.inboxDelete));
  renderLearningInbox();
});


/* =========================================================
   MILESTONES
========================================================= */

const DEFAULT_MILESTONES = [
  "Core Java Foundation",
  "DSA — First 50 Problems",
  "Growth Map Backend V1",
  "Mini Redis V1",
  "System Design Fundamentals",
  "Python Foundation",
  "First GenAI Project",
  "First Agentic AI System"
];

function getMilestones() {
  const raw = localStorage.getItem(STUDY_OS_STORAGE.milestones);
  if (raw !== null) return load(STUDY_OS_STORAGE.milestones, []);

  const items = DEFAULT_MILESTONES.map((title, index) => ({
    id: uid(`milestone-${index}`),
    title,
    done: false,
    targetDate: "",
    createdAt: new Date().toISOString()
  }));
  save(STUDY_OS_STORAGE.milestones, items);
  return items;
}

function openMilestoneForm() {
  openModal({
    kicker: "MILESTONE",
    title: "Add Checkpoint",
    html:
      field("MILESTONE", "mMilestoneTitle", "", "100 DSA Problems") +
      field("TARGET DATE (OPTIONAL)", "mMilestoneDate", "", "", "date"),
    onSave: () => {
      const title = $("#mMilestoneTitle").value.trim();
      if (!title) return alert("Milestone is required.");
      const items = getMilestones();
      items.push({
        id: uid("milestone"),
        title,
        targetDate: $("#mMilestoneDate").value,
        done: false,
        createdAt: new Date().toISOString()
      });
      save(STUDY_OS_STORAGE.milestones, items);
      closeModal();
      renderMilestones();
    }
  });
}

function renderMilestones() {
  const list = $("#milestoneList");
  const count = $("#milestoneCount");
  if (!list || !count) return;

  const items = getMilestones();
  const done = items.filter((x) => x.done).length;
  count.textContent = `${done}/${items.length}`;

  list.innerHTML = items.map((item, index) => `
    <div class="milestone-item ${item.done ? "done" : ""}">
      <div class="milestone-item-top">
        <span class="milestone-dot" aria-hidden="true"></span>
        <div class="milestone-copy">
          <strong>${String(index + 1).padStart(2, "0")} · ${esc(item.title)}</strong>
          <small>${item.done ? "COMPLETED" : (item.targetDate ? `Target ${esc(item.targetDate)}` : "UPCOMING")}</small>
        </div>
        <div class="tool-actions">
          <button class="${item.done ? "" : "primary"}" type="button" data-milestone-toggle="${item.id}">${item.done ? "UNDO" : "COMPLETE"}</button>
          <button type="button" data-milestone-delete="${item.id}">REMOVE</button>
        </div>
      </div>
    </div>
  `).join("");
}

$("#addMilestoneButton")?.addEventListener("click", openMilestoneForm);
$("#milestoneList")?.addEventListener("click", (e) => {
  const toggle = e.target.closest("[data-milestone-toggle]");
  const del = e.target.closest("[data-milestone-delete]");
  const items = getMilestones();

  if (toggle) {
    const item = items.find((x) => x.id === toggle.dataset.milestoneToggle);
    if (item) item.done = !item.done;
    save(STUDY_OS_STORAGE.milestones, items);
    renderMilestones();
  }

  if (del && confirm("Remove this milestone?")) {
    save(STUDY_OS_STORAGE.milestones, items.filter((x) => x.id !== del.dataset.milestoneDelete));
    renderMilestones();
  }
});


/* =========================================================
   WEEKLY COMMAND
========================================================= */

function currentWeekKey() {
  return localDateKey(startOfWeek(new Date()));
}

function getWeeklyTargets() {
  return load(STUDY_OS_STORAGE.weeklyTargets, {
    hours: 0,
    sessions: 0,
    problems: 0
  });
}

function openWeeklyTargetsForm() {
  const targets = getWeeklyTargets();
  openModal({
    kicker: "WEEKLY COMMAND",
    title: "Set Real Targets",
    html:
      field("FOCUS HOURS", "mWeekHours", targets.hours || "", "8", "number") +
      field("STUDY SESSIONS", "mWeekSessions", targets.sessions || "", "5", "number") +
      field("CODING PROBLEMS", "mWeekProblems", targets.problems || "", "10", "number"),
    onSave: () => {
      save(STUDY_OS_STORAGE.weeklyTargets, {
        hours: Math.max(0, Number($("#mWeekHours").value) || 0),
        sessions: Math.max(0, Number($("#mWeekSessions").value) || 0),
        problems: Math.max(0, Number($("#mWeekProblems").value) || 0)
      });
      closeModal();
      renderWeeklyCommand();
    }
  });
}

function getWeeklyReflectionMap() {
  return load(STUDY_OS_STORAGE.weeklyReflection, {});
}

function saveWeeklyReflection() {
  const all = getWeeklyReflectionMap();
  all[currentWeekKey()] = {
    win: $("#weekWinInput")?.value || "",
    blocker: $("#weekBlockerInput")?.value || "",
    next: $("#weekNextInput")?.value || ""
  };
  save(STUDY_OS_STORAGE.weeklyReflection, all);
}

function renderWeeklyCommand() {
  const sessions = getSessions().filter((s) => sameWeek(s.date));
  const weekMinutes = sessions.reduce((sum, s) => sum + (Number(s.minutes) || 0), 0);
  const problems = getProblems().filter((p) => sameWeek(p.date || p.createdAt?.slice(0, 10) || localDateKey()));
  const targets = getWeeklyTargets();

  $("#weekCommandHours") && ($("#weekCommandHours").textContent = formatDuration(weekMinutes));
  $("#weekCommandSessions") && ($("#weekCommandSessions").textContent = String(sessions.length));
  $("#weekCommandProblems") && ($("#weekCommandProblems").textContent = String(problems.length));

  $("#weekHoursTarget") && ($("#weekHoursTarget").textContent = targets.hours ? `Target ${targets.hours}h` : "No target set");
  $("#weekSessionsTarget") && ($("#weekSessionsTarget").textContent = targets.sessions ? `Target ${targets.sessions}` : "No target set");
  $("#weekProblemsTarget") && ($("#weekProblemsTarget").textContent = targets.problems ? `Target ${targets.problems}` : "No target set");

  const start = startOfWeek(new Date());
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  $("#weekCommandLabel") && ($("#weekCommandLabel").textContent = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`.toUpperCase());

  const reflection = getWeeklyReflectionMap()[currentWeekKey()] || {};
  if ($("#weekWinInput") && document.activeElement !== $("#weekWinInput")) $("#weekWinInput").value = reflection.win || "";
  if ($("#weekBlockerInput") && document.activeElement !== $("#weekBlockerInput")) $("#weekBlockerInput").value = reflection.blocker || "";
  if ($("#weekNextInput") && document.activeElement !== $("#weekNextInput")) $("#weekNextInput").value = reflection.next || "";
}

$("#editWeeklyTargetsButton")?.addEventListener("click", openWeeklyTargetsForm);
["#weekWinInput", "#weekBlockerInput", "#weekNextInput"].forEach((selector) => {
  $(selector)?.addEventListener("input", saveWeeklyReflection);
});


/* =========================================================
   PLAYLIST / ACTIVE TRACK SIGNAL
========================================================= */

function renderPlaylistSignal() {
  const tracks = getTracks();
  const active = tracks.find((t) => String(t.status).toLowerCase() === "active") || tracks[0];
  const settings = getStudyOSSettings();

  if (!active) return;

  // If current topic is still blank, the active playlist's current topic can
  // gently inform the hero without inventing progress.
  if (!settings.currentTopic && active.current) {
    $("#osCurrentTopic") && ($("#osCurrentTopic").textContent = active.current);
  }
}


/* =========================================================
   MASTER STUDY OS RENDER
========================================================= */

function renderStudyOS() {
  renderStudyOSHero();
  renderMissionDeck();
  renderRevisionEngine();
  renderKnowledgeNotes();
  renderLearningInbox();
  renderMilestones();
  renderWeeklyCommand();
  renderPlaylistSignal();
}


// Extend the existing render pipeline without deleting old working behavior.
const legacyRenderAllStudyOS = renderAll;
renderAll = function () {
  legacyRenderAllStudyOS();
  renderStudyOS();
};

const legacyRenderDailyStudyTrackerStudyOS = renderDailyStudyTracker;
renderDailyStudyTracker = function () {
  legacyRenderDailyStudyTrackerStudyOS();
  renderWeeklyCommand();
};


renderStudyOS();
