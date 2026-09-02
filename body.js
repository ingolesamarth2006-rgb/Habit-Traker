/* =========================================================
   GROWTH MAP — BODY SYSTEM
   Clean version: Running + Diet History + Water + Supplements
========================================================= */

const BODY_STORAGE_KEY = "growthMapBodySystemV1";

const DEFAULT_BODY_DATA = {
  runningTarget: 3,
  runs: [],

  dietItems: [],
  dietLogs: [],
  proteinTarget: 120,

  waterTarget: 4,
  waterLogs: [],

  supplements: [],
  supplementLogs: [],

  exercises: [],
  workouts: [],
  recovery: [],
  skinCare: [],
  hairCare: []
};


/* =========================================================
   LOAD / SAVE
========================================================= */

function cloneDefault() {
  return JSON.parse(
    JSON.stringify(DEFAULT_BODY_DATA)
  );
}


function loadBodyData() {

  try {

    const saved =
      localStorage.getItem(
        BODY_STORAGE_KEY
      );


    if (!saved) {
      return cloneDefault();
    }


    const parsed =
      JSON.parse(saved);


    const data = {
      ...cloneDefault(),
      ...parsed
    };


    [
      "runs",
      "dietItems",
      "dietLogs",
      "waterLogs",
      "supplements",
      "supplementLogs",
      "exercises",
      "workouts",
      "recovery",
      "skinCare",
      "hairCare"
    ].forEach((key) => {

      if (
        !Array.isArray(
          data[key]
        )
      ) {

        data[key] = [];

      }

    });


    /*
      Remove obsolete Diet entries
      created by the old system where
      food was added every single day.

      Current valid Diet logs always
      contain dietItemId.
    */

    data.dietLogs =
      data.dietLogs.filter(
        (log) =>
          log &&
          log.dietItemId &&
          log.date
      );


    return data;

  }

  catch (error) {

    console.error(
      "Body System load failed:",
      error
    );


    return cloneDefault();

  }

}


let bodyData =
  loadBodyData();


function saveBodyData() {

  localStorage.setItem(
    BODY_STORAGE_KEY,
    JSON.stringify(bodyData)
  );

}


/* =========================================================
   SAFE TEXT
========================================================= */

function escapeHTML(
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


/* =========================================================
   DATE HELPERS
========================================================= */

function makeDateKey(
  date
) {

  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    )
      .padStart(
        2,
        "0"
      );


  const day =
    String(
      date.getDate()
    )
      .padStart(
        2,
        "0"
      );


  return (
    `${year}-${month}-${day}`
  );

}


function getTodayKey() {

  return makeDateKey(
    new Date()
  );

}


function dateKeyToDate(
  key
) {

  return new Date(
    `${key}T12:00:00`
  );

}


function moveDateKey(
  key,
  amount
) {

  const date =
    dateKeyToDate(
      key
    );


  date.setDate(
    date.getDate() +
    amount
  );


  return makeDateKey(
    date
  );

}


function getWeekStart(
  date = new Date()
) {

  const copy =
    new Date(date);


  const day =
    copy.getDay();


  copy.setDate(
    copy.getDate() +
    (
      day === 0
        ? -6
        : 1 - day
    )
  );


  copy.setHours(
    0,
    0,
    0,
    0
  );


  return copy;

}


function isDateInsideCurrentWeek(
  key
) {

  if (!key) {
    return false;
  }


  const date =
    dateKeyToDate(
      key
    );


  const start =
    getWeekStart();


  const end =
    new Date(start);


  end.setDate(
    start.getDate() +
    6
  );


  end.setHours(
    23,
    59,
    59,
    999
  );


  return (
    date >= start &&
    date <= end
  );

}


function isoToDateKey(
  iso
) {

  if (!iso) {
    return null;
  }


  const date =
    new Date(iso);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return null;

  }


  return makeDateKey(
    date
  );

}


/* =========================================================
   SELECTED DIET DATE
========================================================= */

let selectedDietDate =
  getTodayKey();


/* =========================================================
   CURRENT DATE
========================================================= */

function renderCurrentDate() {

  const element =
    document.getElementById(
      "currentBodyDate"
    );


  if (!element) {
    return;
  }


  element.textContent =
    new Date()
      .toLocaleDateString(
        "en-US",
        {
          weekday:
            "long",

          day:
            "numeric",

          month:
            "long",

          year:
            "numeric"
        }
      )
      .toUpperCase();

}


/* =========================================================
   TAB NAVIGATION
   NO SUDDEN HERO JUMP
========================================================= */

const bodyTabs =
  document.querySelectorAll(
    ".body-tab"
  );


const bodySections =
  document.querySelectorAll(
    ".body-section"
  );


bodyTabs.forEach(
  (tab) => {

    tab.addEventListener(
      "click",
      () => {

        const target =
          document.getElementById(
            tab.dataset.section
          );


        if (
          !target ||
          tab.classList.contains(
            "active"
          )
        ) {

          return;

        }


        const currentScroll =
          window.scrollY;


        bodyTabs.forEach(
          (item) => {

            item.classList.remove(
              "active"
            );

          }
        );


        bodySections.forEach(
          (section) => {

            section.classList.remove(
              "active-section"
            );

          }
        );


        tab.classList.add(
          "active"
        );


        target.classList.add(
          "active-section"
        );


        requestAnimationFrame(
          () => {

            window.scrollTo(
              0,
              currentScroll
            );

          }
        );

      }
    );

  }
);


/* =========================================================
   UNIVERSAL MODAL
========================================================= */

const bodyModal =
  document.getElementById(
    "bodyModal"
  );


const bodyModalContent =
  document.getElementById(
    "bodyModalContent"
  );


const bodyModalClose =
  document.getElementById(
    "bodyModalClose"
  );


const modalBackdrop =
  document.querySelector(
    ".modal-backdrop"
  );


function openBodyModal(
  html
) {

  if (
    !bodyModal ||
    !bodyModalContent
  ) {

    return;

  }


  bodyModalContent.innerHTML =
    html;


  bodyModal.classList.add(
    "open"
  );


  bodyModal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";

}


function closeBodyModal() {

  if (!bodyModal) {
    return;
  }


  bodyModal.classList.remove(
    "open"
  );


  bodyModal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.style.overflow =
    "";

}


bodyModalClose
  ?.addEventListener(
    "click",
    closeBodyModal
  );


modalBackdrop
  ?.addEventListener(
    "click",
    closeBodyModal
  );


document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key ===
        "Escape" &&

      bodyModal
        ?.classList
        .contains(
          "open"
        )
    ) {

      closeBodyModal();

    }

  }
);


/* =========================================================
   RUNNING
========================================================= */

function getCurrentWeekRuns() {

  return bodyData.runs.filter(
    (run) =>
      isDateInsideCurrentWeek(
        run.date
      )
  );

}


function calculateRunningProgress() {

  const weeklyRuns =
    getCurrentWeekRuns();


  const target =
    Math.max(
      1,
      Number(
        bodyData.runningTarget
      ) || 3
    );


  const completed =
    weeklyRuns.length;


  const percentage =
    Math.min(
      100,
      Math.round(
        (
          completed /
          target
        ) * 100
      )
    );


  return {
    weeklyRuns,
    target,
    completed,
    percentage
  };

}


function getRunningMessage(
  completed,
  target
) {

  if (
    completed === 0
  ) {

    return (
      "Start the week. First run builds momentum."
    );

  }


  if (
    completed <
    target / 2
  ) {

    return (
      "Momentum started. Keep moving."
    );

  }


  if (
    completed <
    target
  ) {

    return (
      "Good progress. You're getting close."
    );

  }


  if (
    completed === target
  ) {

    return (
      "Weekly target complete. Strong work."
    );

  }


  return (
    "Above target. You pushed beyond the plan."
  );

}


function renderRunning() {

  const {
    weeklyRuns,
    target,
    completed,
    percentage
  } =
    calculateRunningProgress();


  [
    "todayRunning",
    "runWeekCount"
  ]
    .forEach(
      (id) => {

        const element =
          document.getElementById(
            id
          );


        if (element) {

          element.textContent =
            `${completed} / ${target}`;

        }

      }
    );


  const progress =
    document.getElementById(
      "runningTargetProgress"
    );


  const message =
    document.getElementById(
      "runningMessage"
    );


  const smallRunner =
    document.getElementById(
      "runnerCharacter"
    );


  const largeRunner =
    document.getElementById(
      "largeRunner"
    );


  if (progress) {

    progress.textContent =
      `${completed} / ${target} RUNS`;

  }


  if (message) {

    message.textContent =
      getRunningMessage(
        completed,
        target
      );

  }


  const safeRunnerPosition =
    5 +
    (
      Math.min(100, Math.max(0, percentage)) *
      0.77
    );


  if (smallRunner) {

    smallRunner.style.left =
      `${safeRunnerPosition}%`;

  }


  if (largeRunner) {

    largeRunner.style.left =
      `${safeRunnerPosition}%`;

  }


  const distance =
    weeklyRuns.reduce(
      (
        sum,
        run
      ) =>
        sum +
        (
          Number(
            run.distance
          ) || 0
        ),
      0
    );


  const minutes =
    weeklyRuns.reduce(
      (
        sum,
        run
      ) =>
        sum +
        (
          Number(
            run.minutes
          ) || 0
        ),
      0
    );


  const distanceElement =
    document.getElementById(
      "weeklyRunDistance"
    );


  const timeElement =
    document.getElementById(
      "weeklyRunTime"
    );


  const scoreElement =
    document.getElementById(
      "runningScore"
    );


  const scoreBar =
    document.getElementById(
      "runningScoreBar"
    );


  if (distanceElement) {

    distanceElement.textContent =
      distance.toFixed(1);

  }


  if (timeElement) {

    timeElement.textContent =
      Math.round(minutes);

  }


  if (scoreElement) {

    scoreElement.textContent =
      `${percentage}%`;

  }


  if (scoreBar) {

    scoreBar.style.width =
      `${percentage}%`;

  }

}


/* =========================================================
   RUNNING TARGET
========================================================= */

document
  .getElementById(
    "editRunningTargetButton"
  )
  ?.addEventListener(
    "click",
    () => {

      openBodyModal(`

        <form
          class="modal-form"
          id="runningTargetForm"
        >

          <h2>
            Weekly Running Target
          </h2>

          <p class="form-description">
            Set how many runs you want each week.
          </p>

          <div class="form-group">

            <label>
              RUNS PER WEEK
            </label>

            <input
              type="number"
              id="runningTargetInput"
              min="1"
              max="14"
              value="${bodyData.runningTarget || 3}"
              required
            />

          </div>

          <div class="modal-actions">

            <button
              type="button"
              class="secondary-action"
              id="cancelRunningTarget"
            >
              CANCEL
            </button>

            <button
              type="submit"
              class="primary-action"
            >
              SAVE TARGET
            </button>

          </div>

        </form>

      `);


      document
        .getElementById(
          "cancelRunningTarget"
        )
        ?.addEventListener(
          "click",
          closeBodyModal
        );


      document
        .getElementById(
          "runningTargetForm"
        )
        ?.addEventListener(
          "submit",
          (event) => {

            event.preventDefault();


            const target =
              Number(
                document
                  .getElementById(
                    "runningTargetInput"
                  )
                  .value
              );


            if (
              !Number.isFinite(
                target
              ) ||
              target < 1
            ) {

              return;

            }


            bodyData.runningTarget =
              target;


            saveBodyData();

            renderRunning();

            renderPhysicalScores();

            closeBodyModal();

          }
        );

    }
  );


/* =========================================================
   LOG RUN
========================================================= */

document
  .getElementById(
    "logRunButton"
  )
  ?.addEventListener(
    "click",
    () => {

      openBodyModal(`

        <form
          class="modal-form"
          id="logRunForm"
        >

          <h2>
            Log Run
          </h2>

          <div class="form-group">

            <label>
              DATE
            </label>

            <input
              type="date"
              id="runDate"
              value="${getTodayKey()}"
              required
            />

          </div>

          <div class="form-group">

            <label>
              DISTANCE — KM
            </label>

            <input
              type="number"
              id="runDistance"
              min="0"
              step="0.01"
              placeholder="Example: 4.5"
            />

          </div>

          <div class="form-group">

            <label>
              DURATION — MINUTES
            </label>

            <input
              type="number"
              id="runMinutes"
              min="0"
              step="1"
              placeholder="Example: 28"
            />

          </div>

          <div class="form-group">

            <label>
              NOTES
            </label>

            <textarea
              id="runNotes"
              placeholder="How did the run feel?"
            ></textarea>

          </div>

          <div class="modal-actions">

            <button
              type="button"
              class="secondary-action"
              id="cancelRun"
            >
              CANCEL
            </button>

            <button
              type="submit"
              class="primary-action"
            >
              SAVE RUN
            </button>

          </div>

        </form>

      `);


      document
        .getElementById(
          "cancelRun"
        )
        ?.addEventListener(
          "click",
          closeBodyModal
        );


      document
        .getElementById(
          "logRunForm"
        )
        ?.addEventListener(
          "submit",
          (event) => {

            event.preventDefault();


            bodyData.runs.push({

              id:
                `run_${Date.now()}`,

              date:
                document
                  .getElementById(
                    "runDate"
                  )
                  .value,

              distance:
                Number(
                  document
                    .getElementById(
                      "runDistance"
                    )
                    .value
                ) || 0,

              minutes:
                Number(
                  document
                    .getElementById(
                      "runMinutes"
                    )
                    .value
                ) || 0,

              notes:
                document
                  .getElementById(
                    "runNotes"
                  )
                  .value
                  .trim(),

              createdAt:
                new Date()
                  .toISOString()

            });


            saveBodyData();

            renderRunning();

            renderPhysicalScores();

            closeBodyModal();

          }
        );

    }
  );


/* =========================================================
   DIET PLAN
========================================================= */

function getDietItemsForDate(
  dateKey
) {

  return bodyData.dietItems.filter(
    (item) => {

      if (
        !item?.id ||
        !item?.name
      ) {

        return false;

      }


      const created =
        isoToDateKey(
          item.createdAt
        );


      const archived =
        isoToDateKey(
          item.archivedAt
        );


      const existed =
        !created ||
        created <= dateKey;


      const notArchived =
        !archived ||
        archived > dateKey;


      return (
        existed &&
        notArchived
      );

    }
  );

}


function getDietLogsForDate(
  dateKey
) {

  return bodyData.dietLogs.filter(
    (log) =>
      log.date ===
        dateKey &&
      log.dietItemId
  );

}


function getDietLogForDate(
  dietItemId,
  dateKey
) {

  return bodyData.dietLogs.find(
    (log) =>
      log.dietItemId ===
        dietItemId &&
      log.date ===
        dateKey
  );

}


function getProteinTotalForDate(
  dateKey
) {

  return getDietLogsForDate(
    dateKey
  )
    .reduce(
      (
        total,
        log
      ) => {

        if (!log.done) {

          return total;

        }


        const snapshot =
          Number(
            log.proteinAtCompletion
          );


        if (
          Number.isFinite(
            snapshot
          )
        ) {

          return (
            total +
            snapshot
          );

        }


        const item =
          bodyData.dietItems.find(
            (diet) =>
              diet.id ===
              log.dietItemId
          );


        return (
          total +
          (
            Number(
              item?.protein
            ) || 0
          )
        );

      },
      0
    );

}


function getDietCompletionForDate(
  dateKey
) {

  const items =
    getDietItemsForDate(
      dateKey
    );


  const completed =
    items.filter(
      (item) =>
        Boolean(
          getDietLogForDate(
            item.id,
            dateKey
          )?.done
        )
    )
      .length;


  return {
    completed,
    total:
      items.length
  };

}


/* =========================================================
   RENDER DIET
========================================================= */

function renderDiet() {

  const container =
    document.getElementById(
      "todayMeals"
    );


  const items =
    getDietItemsForDate(
      selectedDietDate
    );


  const selectedProtein =
    getProteinTotalForDate(
      selectedDietDate
    );


  /*
    Overview must always show
    TODAY even if user is viewing
    yesterday inside Diet.
  */

  const actualTodayProtein =
    getProteinTotalForDate(
      getTodayKey()
    );


  const target =
    Math.max(
      1,
      Number(
        bodyData.proteinTarget
      ) || 120
    );


  const percentage =
    Math.min(
      100,
      Math.round(
        (
          selectedProtein /
          target
        ) * 100
      )
    );


  const remaining =
    Math.max(
      0,
      target -
      selectedProtein
    );


  const todayCard =
    document.getElementById(
      "todayProtein"
    );


  const currentProtein =
    document.getElementById(
      "dietProteinCurrent"
    );


  const targetElement =
    document.getElementById(
      "proteinTargetValue"
    );


  const progressFill =
    document.getElementById(
      "proteinProgressFill"
    );


  const progressText =
    document.getElementById(
      "proteinProgressText"
    );


  const remainingElement =
    document.getElementById(
      "proteinRemaining"
    );


  if (todayCard) {

    todayCard.textContent =
      `${Math.round(
        actualTodayProtein
      )} g`;

  }


  if (currentProtein) {

    currentProtein.textContent =
      Math.round(
        selectedProtein
      );

  }


  if (targetElement) {

    targetElement.textContent =
      target;

  }


  if (progressFill) {

    progressFill.style.width =
      `${percentage}%`;

  }


  if (progressText) {

    progressText.textContent =
      `${percentage}% COMPLETE`;

  }


  if (remainingElement) {

    remainingElement.textContent =
      remaining > 0
        ? `${Math.round(
            remaining
          )}g remaining`
        : "TARGET COMPLETE";

  }


  if (!container) {

    return;

  }


  if (
    items.length === 0
  ) {

    container.innerHTML = `

      <div class="diet-empty">

        <span>
          NO DIET PLAN FOR THIS DAY
        </span>

        <p>
          ${
            selectedDietDate ===
            getTodayKey()

              ? "Add your diet once. After that, just tick it every day."

              : "No diet items existed in the plan on this date."
          }
        </p>

      </div>

    `;


    return;

  }


  container.innerHTML =
    items
      .map(
        (item) => {

          const log =
            getDietLogForDate(
              item.id,
              selectedDietDate
            );


          const done =
            Boolean(
              log?.done
            );


          const snapshot =
            Number(
              log?.proteinAtCompletion
            );


          /*
            For old history we display
            the protein value that was
            actually recorded on that day.

            Editing protein later will
            not rewrite old history.
          */

          const displayedProtein =
            done &&
            Number.isFinite(
              snapshot
            )

              ? snapshot

              : Number(
                  item.protein
                ) || 0;


          /*
            Edit / Remove buttons only
            appear on TODAY.

            Historical days remain
            history rather than changing
            the current diet plan.
          */

          const actions =
            selectedDietDate ===
            getTodayKey()

              ? `

                  <button
                    type="button"
                    class="
                      mini-action
                      edit-diet-plan
                    "
                    data-id="${item.id}"
                  >
                    EDIT
                  </button>


                  <button
                    type="button"
                    class="
                      mini-action
                      danger
                      remove-diet-plan
                    "
                    data-id="${item.id}"
                  >
                    REMOVE
                  </button>

                `

              : "";


          return `

            <div
              class="
                diet-log-row
                ${done ? "diet-done" : ""}
              "
              data-id="${item.id}"
            >

              <div class="diet-log-left">

                <button
                  type="button"
                  class="
                    diet-plan-check
                    ${done ? "done" : ""}
                  "
                  data-id="${item.id}"
                  title="Mark completed"
                >
                  ${done ? "✓" : ""}
                </button>


                <div>

                  <strong>
                    ${escapeHTML(
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

              </div>


              <div class="diet-log-protein">

                <strong>
                  ${displayedProtein}g
                </strong>

                <span>
                  PROTEIN
                </span>

              </div>


              <div class="diet-log-actions">

                ${actions}

              </div>

            </div>

          `;

        }
      )
      .join("");


  container
    .querySelectorAll(
      ".diet-plan-check"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            toggleDietForSelectedDay(
              button.dataset.id
            );

          }
        );

      }
    );


  container
    .querySelectorAll(
      ".edit-diet-plan"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            openDietPlanForm(
              button.dataset.id
            );

          }
        );

      }
    );


  container
    .querySelectorAll(
      ".remove-diet-plan"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            removeDietPlanItem(
              button.dataset.id
            );

          }
        );

      }
    );

}


/* =========================================================
   TOGGLE DIET FOR SELECTED DAY
========================================================= */

function toggleDietForSelectedDay(
  dietItemId
) {

  const item =
    bodyData.dietItems.find(
      (diet) =>
        diet.id ===
        dietItemId
    );


  if (!item) {
    return;
  }


  const existing =
    getDietLogForDate(
      dietItemId,
      selectedDietDate
    );


  if (existing) {

    existing.done =
      !existing.done;


    if (existing.done) {

      existing.proteinAtCompletion =
        Number(
          item.protein
        ) || 0;


      existing.updatedAt =
        new Date()
          .toISOString();

    }

  }

  else {

    bodyData.dietLogs.push({

      id:
        `diet_log_${Date.now()}`,

      dietItemId,

      date:
        selectedDietDate,

      done:
        true,

      proteinAtCompletion:
        Number(
          item.protein
        ) || 0,

      createdAt:
        new Date()
          .toISOString()

    });

  }


  saveBodyData();

  renderDiet();

  renderDietWeekStrip();

}


/* =========================================================
   ADD / EDIT DIET PLAN
========================================================= */

function openDietPlanForm(
  editId = null
) {

  const existing =
    editId

      ? bodyData.dietItems.find(
          (item) =>
            item.id ===
            editId
        )

      : null;


  openBodyModal(`

    <form
      class="modal-form"
      id="dietPlanForm"
    >

      <h2>
        ${
          existing
            ? "Edit Diet"
            : "Add Diet"
        }
      </h2>


      <p class="form-description">
        Add once. Every day you only tick complete or pending.
      </p>


      <div class="form-group">

        <label>
          DIET NAME
        </label>

        <input
          type="text"
          id="dietPlanName"
          value="${escapeHTML(existing?.name || "")}"
          placeholder="Example: Milk + Whey"
          required
        />

      </div>


      <div class="form-group">

        <label>
          PROTEIN — GRAMS
        </label>

        <input
          type="number"
          id="dietPlanProtein"
          value="${existing?.protein ?? ""}"
          min="0"
          step="0.1"
          placeholder="Example: 32"
          required
        />

      </div>


      <div class="modal-actions">

        <button
          type="button"
          class="secondary-action"
          id="cancelDietPlan"
        >
          CANCEL
        </button>


        <button
          type="submit"
          class="primary-action"
        >
          ${
            existing
              ? "SAVE CHANGES"
              : "ADD TO PLAN"
          }
        </button>

      </div>

    </form>

  `);


  document
    .getElementById(
      "cancelDietPlan"
    )
    ?.addEventListener(
      "click",
      closeBodyModal
    );


  document
    .getElementById(
      "dietPlanForm"
    )
    ?.addEventListener(
      "submit",
      (event) => {

        event.preventDefault();


        const name =
          document
            .getElementById(
              "dietPlanName"
            )
            .value
            .trim();


        const protein =
          Number(
            document
              .getElementById(
                "dietPlanProtein"
              )
              .value
          );


        if (
          !name ||
          !Number.isFinite(
            protein
          ) ||
          protein < 0
        ) {

          return;

        }


        if (existing) {

          existing.name =
            name;


          existing.protein =
            protein;


          existing.updatedAt =
            new Date()
              .toISOString();

        }

        else {

          bodyData.dietItems.push({

            id:
              `diet_item_${Date.now()}`,

            name,

            protein,

            createdAt:
              new Date()
                .toISOString(),

            archivedAt:
              null

          });

        }


        saveBodyData();

        renderDiet();

        renderDietWeekStrip();

        closeBodyModal();

      }
    );

}


/* =========================================================
   ADD DIET BUTTON
========================================================= */

document
  .getElementById(
    "addDietItemButton"
  )
  ?.addEventListener(
    "click",
    () => {

      /*
        If user is viewing yesterday,
        ADD DIET returns to TODAY first.

        Diet plan editing always happens
        on the current plan.
      */

      if (
        selectedDietDate !==
        getTodayKey()
      ) {

        selectDietDate(
          getTodayKey()
        );

      }


      openDietPlanForm();

    }
  );


/* =========================================================
   REMOVE DIET
========================================================= */

function removeDietPlanItem(
  id
) {

  const item =
    bodyData.dietItems.find(
      (diet) =>
        diet.id === id
    );


  if (!item) {
    return;
  }


  const confirmed =
    confirm(

      `Remove "${item.name}" from your future diet plan?\n\nOld history will remain saved.`

    );


  if (!confirmed) {
    return;
  }


  item.archivedAt =
    new Date()
      .toISOString();


  saveBodyData();

  renderDiet();

  renderDietWeekStrip();

}


/* =========================================================
   PROTEIN TARGET
========================================================= */

document
  .getElementById(
    "editProteinTargetButton"
  )
  ?.addEventListener(
    "click",
    () => {

      openBodyModal(`

        <form
          class="modal-form"
          id="proteinTargetForm"
        >

          <h2>
            Protein Target
          </h2>


          <div class="form-group">

            <label>
              DAILY PROTEIN — GRAMS
            </label>

            <input
              type="number"
              id="proteinTargetInput"
              min="1"
              step="1"
              value="${bodyData.proteinTarget || 120}"
              required
            />

          </div>


          <div class="modal-actions">

            <button
              type="button"
              class="secondary-action"
              id="cancelProteinTarget"
            >
              CANCEL
            </button>


            <button
              type="submit"
              class="primary-action"
            >
              SAVE TARGET
            </button>

          </div>

        </form>

      `);


      document
        .getElementById(
          "cancelProteinTarget"
        )
        ?.addEventListener(
          "click",
          closeBodyModal
        );


      document
        .getElementById(
          "proteinTargetForm"
        )
        ?.addEventListener(
          "submit",
          (event) => {

            event.preventDefault();


            const value =
              Number(
                document
                  .getElementById(
                    "proteinTargetInput"
                  )
                  .value
              );


            if (
              !Number.isFinite(
                value
              ) ||
              value < 1
            ) {

              return;

            }


            bodyData.proteinTarget =
              value;


            saveBodyData();

            renderDiet();

            renderDietWeekStrip();

            closeBodyModal();

          }
        );

    }
  );


/* =========================================================
   WATER
========================================================= */

function getWaterTotalForDate(
  dateKey
) {

  return bodyData.waterLogs

    .filter(
      (log) =>
        log.date ===
        dateKey
    )

    .reduce(
      (
        sum,
        log
      ) =>
        sum +
        (
          Number(
            log.litres
          ) || 0
        ),
      0
    );

}


function renderWater() {

  const selectedTotal =
    getWaterTotalForDate(
      selectedDietDate
    );


  const todayTotal =
    getWaterTotalForDate(
      getTodayKey()
    );


  const target =
    Math.max(
      0.1,
      Number(
        bodyData.waterTarget
      ) || 4
    );


  const percentage =
    Math.min(
      100,
      Math.round(
        (
          selectedTotal /
          target
        ) * 100
      )
    );


  const remaining =
    Math.max(
      0,
      target -
      selectedTotal
    );


  const todayCard =
    document.getElementById(
      "todayWater"
    );


  const current =
    document.getElementById(
      "dietWaterCurrent"
    );


  const targetElement =
    document.getElementById(
      "waterTargetValue"
    );


  const fill =
    document.getElementById(
      "waterProgressFill"
    );


  const progress =
    document.getElementById(
      "waterProgressText"
    );


  const remainingElement =
    document.getElementById(
      "waterRemaining"
    );


  if (todayCard) {

    todayCard.textContent =
      `${todayTotal.toFixed(1)} L`;

  }


  if (current) {

    current.textContent =
      selectedTotal.toFixed(1);

  }


  if (targetElement) {

    targetElement.textContent =
      target;

  }


  if (fill) {

    fill.style.width =
      `${percentage}%`;

  }


  if (progress) {

    progress.textContent =
      `${percentage}% COMPLETE`;

  }


  if (remainingElement) {

    remainingElement.textContent =
      remaining > 0

        ? `${remaining.toFixed(1)}L remaining`

        : "TARGET COMPLETE";

  }

}


/* =========================================================
   ADD WATER
========================================================= */

function addWater(
  litres
) {

  if (
    !Number.isFinite(
      litres
    ) ||
    litres <= 0
  ) {

    return;

  }


  /*
    IMPORTANT:
    Water is stored against the
    selected Diet date.

    So yesterday can be corrected
    from history.
  */

  bodyData.waterLogs.push({

    id:
      `water_${Date.now()}`,

    date:
      selectedDietDate,

    litres,

    createdAt:
      new Date()
        .toISOString()

  });


  saveBodyData();

  renderWater();

}


/* =========================================================
   QUICK WATER
========================================================= */

document
  .querySelectorAll(
    ".water-quick-button[data-water]"
  )
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          addWater(
            Number(
              button.dataset.water
            )
          );

        }
      );

    }
  );


/* =========================================================
   CUSTOM WATER
========================================================= */

document
  .getElementById(
    "customWaterButton"
  )
  ?.addEventListener(
    "click",
    () => {

      openBodyModal(`

        <form
          class="modal-form"
          id="customWaterForm"
        >

          <h2>
            Add Water
          </h2>


          <div class="form-group">

            <label>
              WATER — LITRES
            </label>

            <input
              type="number"
              id="customWaterInput"
              min="0.05"
              step="0.05"
              placeholder="Example: 0.75"
              required
            />

          </div>


          <div class="modal-actions">

            <button
              type="button"
              class="secondary-action"
              id="cancelCustomWater"
            >
              CANCEL
            </button>


            <button
              type="submit"
              class="primary-action"
            >
              ADD WATER
            </button>

          </div>

        </form>

      `);


      document
        .getElementById(
          "cancelCustomWater"
        )
        ?.addEventListener(
          "click",
          closeBodyModal
        );


      document
        .getElementById(
          "customWaterForm"
        )
        ?.addEventListener(
          "submit",
          (event) => {

            event.preventDefault();


            addWater(
              Number(
                document
                  .getElementById(
                    "customWaterInput"
                  )
                  .value
              )
            );


            closeBodyModal();

          }
        );

    }
  );


/* =========================================================
   WATER TARGET
========================================================= */

document
  .getElementById(
    "editWaterTargetButton"
  )
  ?.addEventListener(
    "click",
    () => {

      openBodyModal(`

        <form
          class="modal-form"
          id="waterTargetForm"
        >

          <h2>
            Water Target
          </h2>


          <div class="form-group">

            <label>
              DAILY TARGET — LITRES
            </label>

            <input
              type="number"
              id="waterTargetInput"
              min="0.5"
              step="0.1"
              value="${bodyData.waterTarget || 4}"
              required
            />

          </div>


          <div class="modal-actions">

            <button
              type="button"
              class="secondary-action"
              id="cancelWaterTarget"
            >
              CANCEL
            </button>


            <button
              type="submit"
              class="primary-action"
            >
              SAVE TARGET
            </button>

          </div>

        </form>

      `);


      document
        .getElementById(
          "cancelWaterTarget"
        )
        ?.addEventListener(
          "click",
          closeBodyModal
        );


      document
        .getElementById(
          "waterTargetForm"
        )
        ?.addEventListener(
          "submit",
          (event) => {

            event.preventDefault();


            const value =
              Number(
                document
                  .getElementById(
                    "waterTargetInput"
                  )
                  .value
              );


            if (
              !Number.isFinite(
                value
              ) ||
              value <= 0
            ) {

              return;

            }


            bodyData.waterTarget =
              value;


            saveBodyData();

            renderWater();

            closeBodyModal();

          }
        );

    }
  );


/* =========================================================
   SUPPLEMENTS
========================================================= */

function getActiveSupplements() {

  return bodyData.supplements.filter(
    (item) =>
      !item.archivedAt
  );

}


function getSupplementsForDate(
  dateKey
) {

  return bodyData.supplements.filter(
    (item) => {

      if (
        !item?.id ||
        !item?.name
      ) {

        return false;

      }


      const created =
        isoToDateKey(
          item.createdAt
        );


      const archived =
        isoToDateKey(
          item.archivedAt
        );


      return (
        (
          !created ||
          created <= dateKey
        ) &&
        (
          !archived ||
          archived > dateKey
        )
      );

    }
  );

}


function getSupplementCompletionForDate(
  dateKey
) {

  const items =
    getSupplementsForDate(
      dateKey
    );


  const completedIds =
    new Set(

      bodyData.supplementLogs

        .filter(
          (log) =>
            log.date ===
              dateKey &&
            log.done
        )

        .map(
          (log) =>
            log.supplementId
        )

    );


  return {

    completedIds,

    total:
      items.length,

    completed:
      items.filter(
        (item) =>
          completedIds.has(
            item.id
          )
      )
        .length

  };

}


/* =========================================================
   RENDER SUPPLEMENTS
========================================================= */

function renderSupplements() {

  const container =
    document.getElementById(
      "supplementList"
    );


  const items =
    getSupplementsForDate(
      selectedDietDate
    );


  const selected =
    getSupplementCompletionForDate(
      selectedDietDate
    );


  /*
    Overview remains TODAY.
  */

  const today =
    getSupplementCompletionForDate(
      getTodayKey()
    );


  const todayCard =
    document.getElementById(
      "todaySupplements"
    );


  if (todayCard) {

    todayCard.textContent =
      today.total

        ? `${today.completed} / ${today.total}`

        : "--";

  }


  if (!container) {

    renderSupplementConsistency();

    return;

  }


  if (
    items.length === 0
  ) {

    container.innerHTML = `

      <div class="diet-empty">

        <span>
          NO SUPPLEMENTS
        </span>

        <p>
          Add them once, then tick them every day.
        </p>

      </div>

    `;


    renderSupplementConsistency();

    return;

  }


  container.innerHTML =
    items
      .map(
        (item) => {

          const done =
            selected.completedIds.has(
              item.id
            );


          return `

            <button
              type="button"
              class="
                supplement-check
                ${done ? "done" : ""}
              "
              data-id="${item.id}"
            >

              <span
                class="supplement-status"
              >
                ${done ? "✓" : ""}
              </span>


              <span
                class="supplement-copy"
              >

                <strong>
                  ${escapeHTML(
                    item.name
                  )}
                </strong>

                <small>
                  ${escapeHTML(
                    item.frequency ||
                    "Daily"
                  )}
                </small>

              </span>


              <span
                class="supplement-state"
              >
                ${
                  done
                    ? "COMPLETED"
                    : "PENDING"
                }
              </span>

            </button>

          `;

        }
      )
      .join("");


  container
    .querySelectorAll(
      ".supplement-check"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            toggleSupplementForSelectedDay(
              button.dataset.id
            );

          }
        );

      }
    );


  renderSupplementConsistency();

}


/* =========================================================
   TOGGLE SUPPLEMENT
========================================================= */

function toggleSupplementForSelectedDay(
  supplementId
) {

  const existing =
    bodyData.supplementLogs.find(
      (log) =>
        log.supplementId ===
          supplementId &&
        log.date ===
          selectedDietDate
    );


  if (existing) {

    existing.done =
      !existing.done;


    existing.updatedAt =
      new Date()
        .toISOString();

  }

  else {

    bodyData.supplementLogs.push({

      id:
        `supplement_log_${Date.now()}`,

      supplementId,

      date:
        selectedDietDate,

      done:
        true,

      createdAt:
        new Date()
          .toISOString()

    });

  }


  saveBodyData();

  renderSupplements();

}


/* =========================================================
   SUPPLEMENT MANAGER
========================================================= */

function openSupplementManager() {

  const items =
    getActiveSupplements();


  const rows =
    items.length

      ? items
          .map(
            (item) => `

              <div
                class="manage-row"
              >

                <div>

                  <strong>
                    ${escapeHTML(
                      item.name
                    )}
                  </strong>

                  <small>
                    ${escapeHTML(
                      item.frequency ||
                      "Daily"
                    )}
                  </small>

                </div>


                <div
                  class="manage-actions"
                >

                  <button
                    type="button"
                    class="
                      mini-action
                      edit-supplement
                    "
                    data-id="${item.id}"
                  >
                    EDIT
                  </button>


                  <button
                    type="button"
                    class="
                      mini-action
                      danger
                      remove-supplement
                    "
                    data-id="${item.id}"
                  >
                    REMOVE
                  </button>

                </div>

              </div>

            `
          )
          .join("")

      : `

          <p class="empty-state">
            No supplements added.
          </p>

        `;


  openBodyModal(`

    <div
      class="modal-form"
    >

      <h2>
        Manage Supplements
      </h2>


      <p class="form-description">
        Add once. Tick every day.
      </p>


      <div
        class="manage-list"
      >
        ${rows}
      </div>


      <div
        class="modal-actions"
      >

        <button
          type="button"
          class="primary-action"
          id="addSupplementInside"
        >
          + ADD SUPPLEMENT
        </button>

      </div>

    </div>

  `);


  document
    .getElementById(
      "addSupplementInside"
    )
    ?.addEventListener(
      "click",
      () => {

        openSupplementForm();

      }
    );


  document
    .querySelectorAll(
      ".edit-supplement"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            openSupplementForm(
              button.dataset.id
            );

          }
        );

      }
    );


  document
    .querySelectorAll(
      ".remove-supplement"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            removeSupplement(
              button.dataset.id
            );

          }
        );

      }
    );

}


/* =========================================================
   ADD / EDIT SUPPLEMENT
========================================================= */

function openSupplementForm(
  editId = null
) {

  const existing =
    editId

      ? bodyData.supplements.find(
          (item) =>
            item.id === editId
        )

      : null;


  openBodyModal(`

    <form
      class="modal-form"
      id="supplementForm"
    >

      <h2>
        ${
          existing
            ? "Edit Supplement"
            : "Add Supplement"
        }
      </h2>


      <div class="form-group">

        <label>
          SUPPLEMENT NAME
        </label>

        <input
          type="text"
          id="supplementName"
          value="${escapeHTML(existing?.name || "")}"
          placeholder="Creatine, Whey Protein..."
          required
        />

      </div>


      <div class="form-group">

        <label>
          FREQUENCY
        </label>

        <select
          id="supplementFrequency"
        >

          <option value="Daily">
            Daily
          </option>

          <option value="Training Days">
            Training Days
          </option>

          <option value="3x / Week">
            3x / Week
          </option>

          <option value="Custom">
            Custom
          </option>

        </select>

      </div>


      <div class="modal-actions">

        <button
          type="button"
          class="secondary-action"
          id="cancelSupplement"
        >
          CANCEL
        </button>


        <button
          type="submit"
          class="primary-action"
        >
          SAVE
        </button>

      </div>

    </form>

  `);


  const select =
    document.getElementById(
      "supplementFrequency"
    );


  if (
    select &&
    existing?.frequency
  ) {

    select.value =
      existing.frequency;

  }


  document
    .getElementById(
      "cancelSupplement"
    )
    ?.addEventListener(
      "click",
      closeBodyModal
    );


  document
    .getElementById(
      "supplementForm"
    )
    ?.addEventListener(
      "submit",
      (event) => {

        event.preventDefault();


        const name =
          document
            .getElementById(
              "supplementName"
            )
            .value
            .trim();


        const frequency =
          document
            .getElementById(
              "supplementFrequency"
            )
            .value;


        if (!name) {
          return;
        }


        if (existing) {

          existing.name =
            name;


          existing.frequency =
            frequency;


          existing.updatedAt =
            new Date()
              .toISOString();

        }

        else {

          bodyData.supplements.push({

            id:
              `supplement_${Date.now()}`,

            name,

            frequency,

            createdAt:
              new Date()
                .toISOString(),

            archivedAt:
              null

          });

        }


        saveBodyData();

        renderSupplements();

        closeBodyModal();

      }
    );

}


/* =========================================================
   REMOVE SUPPLEMENT
========================================================= */

function removeSupplement(
  id
) {

  const item =
    bodyData.supplements.find(
      (supplement) =>
        supplement.id === id
    );


  if (!item) {
    return;
  }


  const confirmed =
    confirm(

      `Remove "${item.name}" from future tracking?\n\nOld history will remain saved.`

    );


  if (!confirmed) {
    return;
  }


  item.archivedAt =
    new Date()
      .toISOString();


  saveBodyData();

  closeBodyModal();

  renderSupplements();

}


document
  .getElementById(
    "manageSupplementsButton"
  )
  ?.addEventListener(
    "click",
    openSupplementManager
  );


/* =========================================================
   SUPPLEMENT CONSISTENCY
========================================================= */

function renderSupplementConsistency() {

  const container =
    document.getElementById(
      "supplementConsistency"
    );


  if (!container) {
    return;
  }


  const items =
    getSupplementsForDate(
      selectedDietDate
    );


  if (
    items.length === 0
  ) {

    container.innerHTML = `

      <p class="empty-state">
        No supplements for this week.
      </p>

    `;


    return;

  }


  const weekStart =
    getWeekStart(
      dateKeyToDate(
        selectedDietDate
      )
    );


  const days = [];


  for (
    let index = 0;
    index < 7;
    index++
  ) {

    const date =
      new Date(
        weekStart
      );


    date.setDate(
      weekStart.getDate() +
      index
    );


    days.push(
      makeDateKey(
        date
      )
    );

  }


  container.innerHTML = `

    <div
      class="consistency-days"
    >

      <span></span>

      <span>M</span>
      <span>T</span>
      <span>W</span>
      <span>T</span>
      <span>F</span>
      <span>S</span>
      <span>S</span>

    </div>


    ${
      items
        .map(
          (item) => `

            <div
              class="consistency-row"
            >

              <strong>
                ${escapeHTML(
                  item.name
                )}
              </strong>


              ${
                days
                  .map(
                    (date) => {

                      const done =
                        bodyData
                          .supplementLogs
                          .some(
                            (log) =>
                              log.supplementId ===
                                item.id &&
                              log.date ===
                                date &&
                              log.done
                          );


                      return `

                        <span
                          class="
                            consistency-cell
                            ${done ? "complete" : ""}
                          "
                        >
                          ${done ? "✓" : ""}
                        </span>

                      `;

                    }
                  )
                  .join("")
              }

            </div>

          `
        )
        .join("")
    }

  `;

}


/* =========================================================
   DIET HISTORY NAVIGATOR
========================================================= */

function renderDietDateNavigator() {

  const selected =
    dateKeyToDate(
      selectedDietDate
    );


  const today =
    getTodayKey();


  const dayLabel =
    document.getElementById(
      "dietSelectedDayLabel"
    );


  const dateLabel =
    document.getElementById(
      "dietSelectedDateLabel"
    );


  const nextButton =
    document.getElementById(
      "nextDietDay"
    );


  const todayButton =
    document.getElementById(
      "dietTodayButton"
    );


  if (dayLabel) {

    dayLabel.textContent =
      selectedDietDate === today

        ? "TODAY"

        : selected
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
      selected
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


  if (nextButton) {

    nextButton.disabled =
      selectedDietDate >=
      today;

  }


  if (todayButton) {

    todayButton.disabled =
      selectedDietDate ===
      today;

  }


  const dietLogTitle =
    document.getElementById(
      "dietLogTitle"
    );


  if (dietLogTitle) {

    dietLogTitle.textContent =
      selectedDietDate === today
        ? "Today's Diet"
        : `${selected
            .toLocaleDateString(
              "en-US",
              {
                weekday: "short",
                day: "numeric",
                month: "short"
              }
            )} Diet`;

  }


  renderDietWeekStrip();

}


/* =========================================================
   SELECT DIET DATE
========================================================= */

function selectDietDate(
  dateKey
) {

  if (
    !dateKey ||
    dateKey >
    getTodayKey()
  ) {

    return;

  }


  selectedDietDate =
    dateKey;


  renderDietDateNavigator();

  renderDiet();

  renderWater();

  renderSupplements();

}


/* =========================================================
   PREVIOUS DAY
========================================================= */

document
  .getElementById(
    "previousDietDay"
  )
  ?.addEventListener(
    "click",
    () => {

      selectDietDate(

        moveDateKey(
          selectedDietDate,
          -1
        )

      );

    }
  );


/* =========================================================
   NEXT DAY
========================================================= */

document
  .getElementById(
    "nextDietDay"
  )
  ?.addEventListener(
    "click",
    () => {

      selectDietDate(

        moveDateKey(
          selectedDietDate,
          1
        )

      );

    }
  );


/* =========================================================
   TODAY BUTTON
========================================================= */

document
  .getElementById(
    "dietTodayButton"
  )
  ?.addEventListener(
    "click",
    () => {

      selectDietDate(
        getTodayKey()
      );

    }
  );


/* =========================================================
   7-DAY DIET STRIP
========================================================= */

function renderDietWeekStrip() {

  const container =
    document.getElementById(
      "dietWeekStrip"
    );


  if (!container) {
    return;
  }


  const start =
    getWeekStart(
      dateKeyToDate(
        selectedDietDate
      )
    );


  const today =
    getTodayKey();


  let html = "";


  for (
    let index = 0;
    index < 7;
    index++
  ) {

    const date =
      new Date(
        start
      );


    date.setDate(
      start.getDate() +
      index
    );


    const dateKey =
      makeDateKey(
        date
      );


    const protein =
      getProteinTotalForDate(
        dateKey
      );


    const completion =
      getDietCompletionForDate(
        dateKey
      );


    const future =
      dateKey >
      today;


    const active =
      dateKey ===
      selectedDietDate;


    const isToday =
      dateKey ===
      today;


    const day =
      date
        .toLocaleDateString(
          "en-US",
          {
            weekday:
              "short"
          }
        )
        .toUpperCase();


    /*
      Example:
      94g · 4/5
    */

    const summary =
      completion.total

        ? `${Math.round(
            protein
          )}g · ${completion.completed}/${completion.total}`

        : "--";


    html += `

      <button
        type="button"

        class="
          diet-week-day
          ${active ? "active" : ""}
          ${isToday ? "today" : ""}
        "

        data-date="${dateKey}"

        ${future ? "disabled" : ""}
      >

        <span>
          ${day}
        </span>

        <strong>
          ${date.getDate()}
        </strong>

        <small>
          ${summary}
        </small>

      </button>

    `;

  }


  container.innerHTML =
    html;


  container
    .querySelectorAll(
      ".diet-week-day:not(:disabled)"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            selectDietDate(
              button.dataset.date
            );

          }
        );

      }
    );

}


/* =========================================================
   PHYSICAL SCORE

   Currently only Running is finalized.
   No fake score for Training / Recovery / Care yet.
========================================================= */

function renderPhysicalScores() {

  const runningScore =
    calculateRunningProgress()
      .percentage;


  const overall =
    runningScore;


  const weekly =
    document.getElementById(
      "weeklyPhysicalScore"
    );


  const hero =
    document.getElementById(
      "todayPhysicalScore"
    );


  const status =
    document.querySelector(
      ".score-status"
    );


  if (weekly) {

    weekly.textContent =
      `${overall}%`;

  }


  if (hero) {

    hero.textContent =
      `${overall}%`;

  }


  if (!status) {
    return;
  }


  if (
    overall === 0
  ) {

    status.textContent =
      "START LOGGING";

  }

  else if (
    overall < 40
  ) {

    status.textContent =
      "BUILD MOMENTUM";

  }

  else if (
    overall < 70
  ) {

    status.textContent =
      "GOOD PROGRESS";

  }

  else if (
    overall < 90
  ) {

    status.textContent =
      "STRONG WEEK";

  }

  else {

    status.textContent =
      "TARGET CRUSHED";

  }

}


/* =========================================================
   GRAPH RANGE BUTTONS
========================================================= */

const graphRangeButtons =
  document.querySelectorAll(
    ".graph-range button"
  );


graphRangeButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        graphRangeButtons.forEach(
          (item) => {

            item.classList.remove(
              "active"
            );

          }
        );


        button.classList.add(
          "active"
        );

      }
    );

  }
);


/* =========================================================
   INITIALIZE
========================================================= */

function initializeBodySystem() {

  renderCurrentDate();

  renderRunning();

  renderDietDateNavigator();

  renderDiet();

  renderWater();

  renderSupplements();

  renderPhysicalScores();

}


initializeBodySystem();
/* =========================================================
   BODY SYSTEM V3
   Weekly Training Split + Running Fix + Rest Day + Care + Graphs
========================================================= */

/* ---------- DATA MIGRATION ---------- */
bodyData.trainingSplit ??= {};
bodyData.restDays ??= [];
bodyData.careLogs ??= [];
if (!Array.isArray(bodyData.workouts)) bodyData.workouts = [];
if (!Array.isArray(bodyData.exercises)) bodyData.exercises = [];
if (!Array.isArray(bodyData.skinCare)) bodyData.skinCare = [];
if (!Array.isArray(bodyData.hairCare)) bodyData.hairCare = [];
if (!Array.isArray(bodyData.careLogs)) bodyData.careLogs = [];
if (!Array.isArray(bodyData.restDays)) bodyData.restDays = [];

const TRAINING_DAYS_V3 = [
  { day: 1, short: "MON", label: "MONDAY" },
  { day: 2, short: "TUE", label: "TUESDAY" },
  { day: 3, short: "WED", label: "WEDNESDAY" },
  { day: 4, short: "THU", label: "THURSDAY" },
  { day: 5, short: "FRI", label: "FRIDAY" },
  { day: 6, short: "SAT", label: "SATURDAY" }
];

TRAINING_DAYS_V3.forEach(({ day }) => {
  const current = bodyData.trainingSplit[String(day)];
  if (!current || typeof current !== "object") {
    bodyData.trainingSplit[String(day)] = { name: "", exercises: [] };
  } else {
    current.name = String(current.name || "");
    if (!Array.isArray(current.exercises)) current.exercises = [];
  }
});

saveBodyData();

function gmClamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function gmCurrentWeekKeys() {
  const start = getWeekStart(new Date());
  const keys = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    keys.push(makeDateKey(d));
  }
  return keys;
}

function gmResetButton(id, handler) {
  const oldButton = document.getElementById(id);
  if (!oldButton) return null;
  const button = oldButton.cloneNode(true);
  oldButton.replaceWith(button);
  button.addEventListener("click", handler);
  return button;
}

function gmEmpty(text) {
  return `<p class="empty-state">${escapeHTML(text)}</p>`;
}

function gmSlug(text = "") {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "exercise";
}

function dayInfoV3(dayNumber) {
  return TRAINING_DAYS_V3.find(item => item.day === Number(dayNumber)) || null;
}

function getDateDayV3(dateKey) {
  return dateKeyToDate(dateKey).getDay();
}

function getPlanForDateV3(dateKey) {
  const day = getDateDayV3(dateKey);
  if (day === 0) return null;
  return bodyData.trainingSplit[String(day)] || null;
}

function isRestDayV3(dateKey) {
  return bodyData.restDays.some(item => {
    if (typeof item === "string") return item === dateKey;
    return item?.date === dateKey && item?.active !== false;
  });
}

function setRestDayV3(dateKey, active) {
  bodyData.restDays = bodyData.restDays.filter(item => {
    const key = typeof item === "string" ? item : item?.date;
    return key !== dateKey;
  });

  if (active) {
    bodyData.restDays.push({
      date: dateKey,
      active: true,
      createdAt: new Date().toISOString()
    });
  }

  saveBodyData();
}

function getWorkoutsForDateV3(dateKey) {
  return bodyData.workouts.filter(workout => workout?.date === dateKey);
}

function getCurrentWeekWorkoutsV3() {
  const keys = new Set(gmCurrentWeekKeys());
  return bodyData.workouts.filter(workout => keys.has(workout?.date));
}

function getSplitExerciseCatalogV3() {
  const map = new Map();

  TRAINING_DAYS_V3.forEach(({ day }) => {
    const plan = bodyData.trainingSplit[String(day)] || { exercises: [] };
    (plan.exercises || []).forEach(exercise => {
      if (exercise?.id && exercise?.name) map.set(exercise.id, { id: exercise.id, name: exercise.name });
    });
  });

  bodyData.workouts.forEach(workout => {
    (workout.entries || []).forEach(entry => {
      if (entry?.exerciseId && entry?.exerciseName && !map.has(entry.exerciseId)) {
        map.set(entry.exerciseId, { id: entry.exerciseId, name: entry.exerciseName });
      }
    });
  });

  return [...map.values()];
}

/* Compatibility name used by graph functions. */
function getActiveExercisesV2() {
  return getSplitExerciseCatalogV3();
}

function getPreviousExerciseMaxV3(exerciseId) {
  let max = 0;
  bodyData.workouts.forEach(workout => {
    (workout.entries || []).forEach(entry => {
      if (entry.exerciseId !== exerciseId) return;
      (entry.sets || []).forEach(set => {
        max = Math.max(max, Number(set.weight) || 0);
      });
    });
  });
  return max;
}

function getExpectedTrainingDatesV3() {
  const start = getWeekStart(new Date());
  const today = getTodayKey();
  const expected = [];

  TRAINING_DAYS_V3.forEach(({ day }) => {
    const plan = bodyData.trainingSplit[String(day)];
    if (!plan || !(plan.exercises || []).length) return;

    const d = new Date(start);
    d.setDate(start.getDate() + (day - 1));
    const key = makeDateKey(d);

    if (key > today) return;
    if (isRestDayV3(key)) return;
    expected.push(key);
  });

  return expected;
}

function trainingScoreV3() {
  const expected = getExpectedTrainingDatesV3();
  if (!expected.length) return null;

  const completedDates = new Set(
    getCurrentWeekWorkoutsV3().map(workout => workout.date)
  );

  const completed = expected.filter(date => completedDates.has(date)).length;
  return Math.min(100, Math.round((completed / expected.length) * 100));
}

/* =========================================================
   TRAINING V3 — WEEKLY SPLIT
========================================================= */

function renderWeeklySplitV3() {
  const container = document.getElementById("weeklySplitGridV3");
  if (!container) return;

  const todayKey = getTodayKey();
  const todayDay = new Date().getDay();
  const weekKeys = gmCurrentWeekKeys();
  const completedDates = new Set(getCurrentWeekWorkoutsV3().map(w => w.date));

  container.innerHTML = TRAINING_DAYS_V3.map(({ day, short, label }) => {
    const plan = bodyData.trainingSplit[String(day)] || { name: "", exercises: [] };
    const dateKey = weekKeys[day - 1];
    const rest = isRestDayV3(dateKey);
    const complete = completedDates.has(dateKey);
    const isToday = day === todayDay;
    const count = (plan.exercises || []).length;

    let state = "NOT SET";
    if (rest) state = "REST DAY";
    else if (complete) state = "COMPLETE";
    else if (count) state = isToday ? "TODAY" : "PLANNED";

    return `
      <article class="split-day-card-v3 ${isToday ? "today" : ""} ${complete ? "complete" : ""} ${rest ? "rest" : ""}">
        <span class="split-day-name-v3">${short}</span>
        <h4>${escapeHTML(plan.name || label)}</h4>
        <p>${count ? `${count} exercise${count === 1 ? "" : "s"}` : "No exercises set"}</p>
        <span class="split-day-state-v3">${state}</span>
      </article>
    `;
  }).join("");

  const reactor = document.querySelector(".training-reactor-v3");
  const title = document.getElementById("trainingTodayTitleV3");
  const text = document.getElementById("trainingReactorTextV3");
  const progress = document.getElementById("trainingWeekProgressV3");

  const plannedPast = getExpectedTrainingDatesV3();
  const completedDatesCount = plannedPast.filter(date => completedDates.has(date)).length;
  const allConfigured = TRAINING_DAYS_V3.filter(({ day }) => (bodyData.trainingSplit[String(day)]?.exercises || []).length).length;

  if (progress) progress.textContent = `${completedDatesCount} / ${plannedPast.length}`;

  const todayPlan = getPlanForDateV3(todayKey);
  const todayRest = isRestDayV3(todayKey) || todayDay === 0;
  const todayDone = completedDates.has(todayKey);

  reactor?.classList.toggle("session-complete", todayDone);

  if (title && text) {
    if (todayRest) {
      title.textContent = "Recovery Day";
      text.textContent = "Today is excluded from expected training. Recover without a penalty.";
    } else if (todayDone) {
      title.textContent = "Session Complete";
      text.textContent = `${todayPlan?.name || "Today's workout"} is logged. Keep the week moving.`;
    } else if (todayPlan && (todayPlan.exercises || []).length) {
      title.textContent = todayPlan.name || "Today's Training";
      text.textContent = `${todayPlan.exercises.length} planned exercises are ready to log.`;
    } else if (allConfigured) {
      title.textContent = "No Plan Today";
      text.textContent = "This day has no workout assigned in your weekly split.";
    } else {
      title.textContent = "Build Your Split";
      text.textContent = "Set Monday to Saturday once. Every training day will load automatically.";
    }
  }
}

function renderTodayTrainingV3() {
  const container = document.getElementById("todayWorkoutList");
  const heading = document.getElementById("todayWorkoutHeadingV3");
  const badge = document.getElementById("todayPlanBadgeV3");
  const todayTraining = document.getElementById("todayTraining");
  const logButton = document.getElementById("addWorkoutButton");
  if (!container) return;

  const today = getTodayKey();
  const day = new Date().getDay();
  const plan = getPlanForDateV3(today);
  const sessions = getWorkoutsForDateV3(today);
  const rest = isRestDayV3(today) || day === 0;

  if (heading) heading.textContent = rest ? "Today's Recovery" : "Today's Workout";

  if (rest) {
    if (badge) {
      badge.textContent = "REST DAY";
      badge.className = "today-plan-badge-v3 rest";
    }
    if (todayTraining) todayTraining.textContent = "REST DAY";
    if (logButton) {
      logButton.disabled = true;
      logButton.textContent = "REST DAY ACTIVE";
    }
    container.innerHTML = `
      <div class="diet-empty">
        <span>RECOVERY MODE ACTIVE</span>
        <p>This day is excluded from your expected training count.</p>
      </div>
    `;
    return;
  }

  if (logButton) {
    logButton.disabled = false;
    logButton.textContent = "+ LOG TODAY";
  }

  if (sessions.length) {
    if (badge) {
      badge.textContent = "LOGGED";
      badge.className = "today-plan-badge-v3 ready";
    }
    if (todayTraining) todayTraining.textContent = `${sessions.length} SESSION${sessions.length === 1 ? "" : "S"}`;

    container.innerHTML = sessions.map(workout => `
      <article class="workout-session-v3 ${workout.prCount ? "has-pr" : ""}">
        <div class="workout-session-head-v3">
          <div>
            <span class="panel-kicker">${escapeHTML(workout.title || "WORKOUT")}</span>
            <h4>${Number(workout.duration) || 0} min ${workout.prCount ? `· ${workout.prCount} PR` : ""}</h4>
          </div>
          <button type="button" class="mini-action danger delete-workout-v3" data-id="${workout.id}">DELETE</button>
        </div>
        <div class="workout-exercise-list-v3">
          ${(workout.entries || []).map(entry => `
            <div class="training-plan-exercise-v3">
              <strong>${escapeHTML(entry.exerciseName || "Exercise")}</strong>
              <div class="set-chip-row-v3">
                ${(entry.sets || []).map((set, index) => `<span class="set-chip-v3">S${index + 1} · ${Number(set.reps) || 0} × ${Number(set.weight) || 0}kg</span>`).join("")}
              </div>
            </div>
          `).join("")}
        </div>
        ${workout.notes ? `<p class="workout-note-v2">${escapeHTML(workout.notes)}</p>` : ""}
      </article>
    `).join("");

    container.querySelectorAll(".delete-workout-v3").forEach(button => {
      button.addEventListener("click", () => {
        if (!confirm("Delete this workout session?")) return;
        bodyData.workouts = bodyData.workouts.filter(workout => workout.id !== button.dataset.id);
        saveBodyData();
        renderTrainingV3();
        renderAllGraphsV2();
        renderPhysicalScoresV3();
      });
    });
    return;
  }

  if (!plan || !(plan.exercises || []).length) {
    if (badge) {
      badge.textContent = "NOT SET";
      badge.className = "today-plan-badge-v3";
    }
    if (todayTraining) todayTraining.textContent = "NOT PLANNED";
    container.innerHTML = gmEmpty("No workout is assigned to today. Use Edit Weekly Split.");
    return;
  }

  if (badge) {
    badge.textContent = "READY";
    badge.className = "today-plan-badge-v3 ready";
  }
  if (todayTraining) todayTraining.textContent = "READY";

  container.innerHTML = `
    <div class="training-plan-preview-v3">
      ${plan.exercises.map((exercise, index) => `
        <div class="training-plan-exercise-v3">
          <strong>${escapeHTML(exercise.name)}</strong>
          <small>Exercise ${index + 1} · sets/reps/weight logged during session</small>
        </div>
      `).join("")}
    </div>
  `;
}

function renderTrainingMetricsV3() {
  const week = getCurrentWeekWorkoutsV3();
  const weeklySessions = document.getElementById("weeklyTrainingSessions");
  const weeklyPR = document.getElementById("weeklyPRCount");
  const score = trainingScoreV3();

  if (weeklySessions) weeklySessions.textContent = new Set(week.map(w => w.date)).size;
  if (weeklyPR) weeklyPR.textContent = week.reduce((sum, w) => sum + (Number(w.prCount) || 0), 0);

  const scoreText = document.getElementById("trainingScore");
  const scoreBar = document.getElementById("trainingScoreBar");
  if (scoreText) scoreText.textContent = score === null ? "--" : `${score}%`;
  if (scoreBar) scoreBar.style.width = `${score || 0}%`;
}

function renderTrainingV3() {
  renderWeeklySplitV3();
  renderTodayTrainingV3();
  renderTrainingMetricsV3();
}

function openWeeklySplitEditorV3() {
  openBodyModal(`
    <form class="modal-form split-editor-v3" id="weeklySplitFormV3">
      <h2>Edit Weekly Training Split</h2>
      <p class="form-description">Set Monday to Saturday once. Put one exercise per line. You can change this anytime without deleting old workout history.</p>

      <div class="split-editor-grid-v3">
        ${TRAINING_DAYS_V3.map(({ day, label }) => {
          const plan = bodyData.trainingSplit[String(day)] || { name: "", exercises: [] };
          return `
            <section class="split-editor-day-v3" data-day="${day}">
              <strong>${label}</strong>
              <div class="form-group">
                <label>WORKOUT NAME / MUSCLE GROUP</label>
                <input class="split-name-v3" type="text" value="${escapeHTML(plan.name || "")}" placeholder="Chest + Triceps" />
              </div>
              <div class="form-group">
                <label>EXERCISES — ONE PER LINE</label>
                <textarea class="split-exercises-v3" placeholder="Bench Press\nIncline Dumbbell Press\nCable Fly\nTricep Pushdown">${escapeHTML((plan.exercises || []).map(x => x.name).join("\n"))}</textarea>
              </div>
            </section>
          `;
        }).join("")}
      </div>

      <div class="modal-actions">
        <button type="button" class="secondary-action" id="cancelSplitV3">CANCEL</button>
        <button type="submit" class="primary-action">SAVE WEEKLY SPLIT</button>
      </div>
    </form>
  `);

  document.getElementById("cancelSplitV3")?.addEventListener("click", closeBodyModal);

  document.getElementById("weeklySplitFormV3")?.addEventListener("submit", event => {
    event.preventDefault();

    document.querySelectorAll(".split-editor-day-v3").forEach(section => {
      const day = Number(section.dataset.day);
      const oldPlan = bodyData.trainingSplit[String(day)] || { name: "", exercises: [] };
      const name = section.querySelector(".split-name-v3")?.value.trim() || "";
      const names = (section.querySelector(".split-exercises-v3")?.value || "")
        .split("\n")
        .map(x => x.trim())
        .filter(Boolean);

      const oldByName = new Map((oldPlan.exercises || []).map(x => [String(x.name || "").toLowerCase(), x]));
      const exercises = names.map((exerciseName, index) => {
        const old = oldByName.get(exerciseName.toLowerCase());
        return {
          id: old?.id || `split_ex_${day}_${gmSlug(exerciseName)}_${Date.now()}_${index}`,
          name: exerciseName
        };
      });

      bodyData.trainingSplit[String(day)] = { name, exercises };
    });

    saveBodyData();
    closeBodyModal();
    renderTrainingV3();
    populateStrengthExercisesV2();
    renderAllGraphsV2();
    renderPhysicalScoresV3();
  });
}

function addWorkoutSetRowV3(holder, index, reps = "", weight = "") {
  const row = document.createElement("div");
  row.className = "workout-set-row-v3";
  row.innerHTML = `
    <span>SET ${index}</span>
    <input type="number" class="set-reps-v3" min="0" step="1" value="${reps}" placeholder="Reps" />
    <input type="number" class="set-weight-v3" min="0" step="0.5" value="${weight}" placeholder="kg" />
    <button type="button" class="workout-set-remove-v3">×</button>
  `;
  row.querySelector(".workout-set-remove-v3")?.addEventListener("click", () => row.remove());
  holder.appendChild(row);
}

function renderWorkoutPlanInsideModalV3(dateKey) {
  const holder = document.getElementById("workoutPlanHolderV3");
  const save = document.getElementById("saveWorkoutV3");
  if (!holder) return;

  const day = getDateDayV3(dateKey);
  const plan = getPlanForDateV3(dateKey);
  const rest = isRestDayV3(dateKey) || day === 0;

  if (rest) {
    holder.innerHTML = `<div class="diet-empty"><span>REST DAY ACTIVE</span><p>Turn Rest Day off for this date before logging a workout.</p></div>`;
    if (save) save.disabled = true;
    return;
  }

  if (!plan || !(plan.exercises || []).length) {
    holder.innerHTML = `<div class="diet-empty"><span>NO PLAN FOR THIS DAY</span><p>Edit Weekly Split first.</p></div>`;
    if (save) save.disabled = true;
    return;
  }

  if (save) save.disabled = false;

  holder.innerHTML = `
    <div class="workout-plan-header-v3">
      <div>
        <span class="panel-kicker">${dayInfoV3(day)?.label || "TRAINING"}</span>
        <h3>${escapeHTML(plan.name || "Workout")}</h3>
      </div>
      <strong>${plan.exercises.length} EXERCISES</strong>
    </div>
    <div class="workout-exercises-v3">
      ${plan.exercises.map(exercise => `
        <section class="workout-exercise-block-v3" data-id="${exercise.id}" data-name="${escapeHTML(exercise.name)}">
          <h4>${escapeHTML(exercise.name)}</h4>
          <div class="workout-set-holder-v3"></div>
          <button type="button" class="secondary-action add-set-v3">+ ADD SET</button>
        </section>
      `).join("")}
    </div>
  `;

  holder.querySelectorAll(".workout-exercise-block-v3").forEach(block => {
    const setHolder = block.querySelector(".workout-set-holder-v3");
    addWorkoutSetRowV3(setHolder, 1);
    block.querySelector(".add-set-v3")?.addEventListener("click", () => {
      const next = setHolder.querySelectorAll(".workout-set-row-v3").length + 1;
      addWorkoutSetRowV3(setHolder, next);
    });
  });
}

function openWorkoutLoggerV3() {
  const today = getTodayKey();
  const todayPlan = getPlanForDateV3(today);

  if (!todayPlan || !(todayPlan.exercises || []).length) {
    if (!isRestDayV3(today) && new Date().getDay() !== 0) {
      openWeeklySplitEditorV3();
      return;
    }
  }

  openBodyModal(`
    <form class="modal-form workout-modal-v3" id="workoutFormV3">
      <h2>Log Workout</h2>
      <p class="form-description">The exercises come from your weekly split automatically. Just enter what you actually performed.</p>

      <div class="form-grid-v2">
        <div class="form-group">
          <label>DATE</label>
          <input type="date" id="workoutDateV3" value="${today}" required />
        </div>
        <div class="form-group">
          <label>DURATION — MIN</label>
          <input type="number" id="workoutDurationV3" min="0" step="1" placeholder="60" />
        </div>
      </div>

      <div id="workoutPlanHolderV3"></div>

      <div class="form-group">
        <label>NOTES</label>
        <textarea id="workoutNotesV3" placeholder="Energy, form, tempo, anything important..."></textarea>
      </div>

      <div class="modal-actions">
        <button type="button" class="secondary-action" id="cancelWorkoutV3">CANCEL</button>
        <button type="submit" class="primary-action" id="saveWorkoutV3">SAVE WORKOUT</button>
      </div>
    </form>
  `);

  const dateInput = document.getElementById("workoutDateV3");
  renderWorkoutPlanInsideModalV3(dateInput.value);
  dateInput.addEventListener("change", () => renderWorkoutPlanInsideModalV3(dateInput.value));
  document.getElementById("cancelWorkoutV3")?.addEventListener("click", closeBodyModal);

  document.getElementById("workoutFormV3")?.addEventListener("submit", event => {
    event.preventDefault();

    const date = dateInput.value;
    const plan = getPlanForDateV3(date);
    if (!plan || isRestDayV3(date) || getDateDayV3(date) === 0) return;

    const entries = [];
    document.querySelectorAll(".workout-exercise-block-v3").forEach(block => {
      const sets = [...block.querySelectorAll(".workout-set-row-v3")]
        .map(row => ({
          reps: Number(row.querySelector(".set-reps-v3")?.value) || 0,
          weight: Number(row.querySelector(".set-weight-v3")?.value) || 0
        }))
        .filter(set => set.reps > 0 || set.weight > 0);

      if (sets.length) {
        entries.push({
          exerciseId: block.dataset.id,
          exerciseName: block.dataset.name,
          sets
        });
      }
    });

    if (!entries.length) {
      alert("Enter at least one valid set.");
      return;
    }

    let prCount = 0;
    entries.forEach(entry => {
      const oldMax = getPreviousExerciseMaxV3(entry.exerciseId);
      const newMax = Math.max(0, ...entry.sets.map(set => Number(set.weight) || 0));
      if (newMax > oldMax && newMax > 0) prCount += 1;
    });

    bodyData.workouts.push({
      id: `workout_${Date.now()}`,
      date,
      title: plan.name || "Workout",
      duration: Number(document.getElementById("workoutDurationV3")?.value) || 0,
      notes: document.getElementById("workoutNotesV3")?.value.trim() || "",
      entries,
      prCount,
      splitDay: getDateDayV3(date),
      createdAt: new Date().toISOString()
    });

    saveBodyData();
    closeBodyModal();
    renderTrainingV3();
    populateStrengthExercisesV2();
    renderAllGraphsV2();
    renderPhysicalScoresV3();
  });
}

/* =========================================================
   RUNNING — CLEAN BUTTONS + HISTORY
========================================================= */

function openRunLoggerV3() {
  openBodyModal(`
    <form class="modal-form" id="runFormV3">
      <h2>Log Run</h2>
      <div class="form-group"><label>DATE</label><input type="date" id="runDateV3" value="${getTodayKey()}" required /></div>
      <div class="form-grid-v2">
        <div class="form-group"><label>DISTANCE — KM</label><input type="number" id="runDistanceV3" min="0" step="0.01" placeholder="5.0" /></div>
        <div class="form-group"><label>TIME — MIN</label><input type="number" id="runMinutesV3" min="0" step="1" placeholder="30" /></div>
      </div>
      <div class="form-group"><label>NOTES</label><textarea id="runNotesV3" placeholder="Pace, route, feeling..."></textarea></div>
      <div class="modal-actions"><button type="button" class="secondary-action" id="cancelRunV3">CANCEL</button><button type="submit" class="primary-action">SAVE RUN</button></div>
    </form>
  `);

  document.getElementById("cancelRunV3")?.addEventListener("click", closeBodyModal);
  document.getElementById("runFormV3")?.addEventListener("submit", event => {
    event.preventDefault();
    bodyData.runs.push({
      id: `run_${Date.now()}`,
      date: document.getElementById("runDateV3").value,
      distance: Number(document.getElementById("runDistanceV3").value) || 0,
      minutes: Number(document.getElementById("runMinutesV3").value) || 0,
      notes: document.getElementById("runNotesV3").value.trim(),
      createdAt: new Date().toISOString()
    });
    saveBodyData();
    closeBodyModal();
    renderRunning();
    renderRunningHistoryV3();
    renderAllGraphsV2();
    renderPhysicalScoresV3();
  });
}

function openRunningTargetV3() {
  openBodyModal(`
    <form class="modal-form" id="runTargetFormV3">
      <h2>Weekly Running Target</h2>
      <div class="form-group"><label>RUNS PER WEEK</label><input type="number" id="runTargetV3" min="1" max="14" value="${bodyData.runningTarget || 3}" required /></div>
      <div class="modal-actions"><button type="button" class="secondary-action" id="cancelRunTargetV3">CANCEL</button><button type="submit" class="primary-action">SAVE TARGET</button></div>
    </form>
  `);
  document.getElementById("cancelRunTargetV3")?.addEventListener("click", closeBodyModal);
  document.getElementById("runTargetFormV3")?.addEventListener("submit", event => {
    event.preventDefault();
    const value = Number(document.getElementById("runTargetV3").value);
    if (!Number.isFinite(value) || value < 1) return;
    bodyData.runningTarget = value;
    saveBodyData();
    closeBodyModal();
    renderRunning();
    renderPhysicalScoresV3();
  });
}

function ensureRunningHistoryV3() {
  const section = document.getElementById("running");
  if (!section || document.getElementById("runningHistoryV3")) return;
  const grid = section.querySelector(".module-grid");
  if (!grid) return;
  grid.insertAdjacentHTML("afterend", `
    <article class="module-card wide running-history-card-v2">
      <div class="module-title-row"><h3>Recent Runs</h3><span class="panel-kicker">LAST 5</span></div>
      <div id="runningHistoryV3"></div>
    </article>
  `);
}

function renderRunningHistoryV3() {
  ensureRunningHistoryV3();
  const container = document.getElementById("runningHistoryV3");
  if (!container) return;
  const items = [...bodyData.runs].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 5);
  if (!items.length) {
    container.innerHTML = gmEmpty("No runs logged yet.");
    return;
  }
  container.innerHTML = items.map(run => `
    <div class="run-history-row-v2">
      <span>${escapeHTML(run.date)}</span>
      <strong>${Number(run.distance || 0).toFixed(1)} km</strong>
      <small>${Math.round(Number(run.minutes) || 0)} min</small>
      <button type="button" class="mini-action danger delete-run-v3" data-id="${run.id}">DELETE</button>
    </div>
  `).join("");

  container.querySelectorAll(".delete-run-v3").forEach(button => {
    button.addEventListener("click", () => {
      if (!confirm("Delete this run?")) return;
      bodyData.runs = bodyData.runs.filter(run => run.id !== button.dataset.id);
      saveBodyData();
      renderRunning();
      renderRunningHistoryV3();
      renderAllGraphsV2();
      renderPhysicalScoresV3();
    });
  });
}

/* =========================================================
   REST DAY MODE
========================================================= */

function renderRestDayV3() {
  const input = document.getElementById("restDayDateV3");
  if (!input) return;
  if (!input.value) input.value = getTodayKey();

  const date = input.value;
  const active = isRestDayV3(date) || getDateDayV3(date) === 0;
  const sunday = getDateDayV3(date) === 0;
  const consoleEl = document.querySelector(".rest-day-console-v3");
  const state = document.getElementById("restDayStateV3");
  const message = document.getElementById("restDayMessageV3");
  const button = document.getElementById("restDayToggleButtonV3");
  const buttonText = document.getElementById("restToggleTextV3");
  const weekly = document.getElementById("weeklyRestDaysV3");

  consoleEl?.classList.toggle("active", active);
  if (state) state.textContent = active ? "REST DAY ON" : "REST DAY OFF";
  if (message) {
    message.textContent = sunday
      ? "Sunday is already outside your six-day training split."
      : active
        ? "This date is excluded from expected training. It will not be treated as a missed session."
        : "Turn it on when you intentionally take a recovery day. That date will be excluded from your expected training count.";
  }
  if (button) {
    button.disabled = sunday;
    button.setAttribute("aria-pressed", String(active));
  }
  if (buttonText) buttonText.textContent = sunday ? "SUNDAY — AUTO REST" : active ? "TURN REST DAY OFF" : "TURN REST DAY ON";

  const count = gmCurrentWeekKeys().filter(key => isRestDayV3(key)).length;
  if (weekly) weekly.textContent = count;
}

function toggleSelectedRestDayV3() {
  const input = document.getElementById("restDayDateV3");
  if (!input?.value || getDateDayV3(input.value) === 0) return;
  setRestDayV3(input.value, !isRestDayV3(input.value));
  renderRestDayV3();
  renderTrainingV3();
  renderPhysicalScoresV3();
}


/* =========================================================
   CARE — SKIN + HAIR
========================================================= */

function getCareItemsV2(category) {
  const source = category === "skin" ? bodyData.skinCare : bodyData.hairCare;
  return source.filter(item => item && !item.archivedAt);
}

function getCareLogV2(routineId, dateKey) {
  return bodyData.careLogs.find(log => log.routineId === routineId && log.date === dateKey);
}

function getCareStatsV2(category, dateKey = getTodayKey()) {
  const items = getCareItemsV2(category);
  const completed = items.filter(item => getCareLogV2(item.id, dateKey)?.done).length;
  return { items, completed, total: items.length };
}

function ensureCareVisualV2() {
  const section = document.getElementById("care");
  if (!section || section.querySelector(".care-energy-v2")) return;
  const heading = section.querySelector(".section-heading");
  heading?.insertAdjacentHTML("afterend", `
    <article class="care-energy-v2">
      <div class="care-spark-v2"><span></span><span></span><span></span><strong id="carePercentV2">0%</strong></div>
      <div><span class="panel-kicker">DAILY RITUAL</span><h3 id="careHeadlineV2">Build your routine</h3><p id="careSublineV2">Add skin and hair care once, then tick completion every day.</p></div>
    </article>
  `);
}

function renderCareListV2(category) {
  const container = document.getElementById(category === "skin" ? "skinCareList" : "hairCareList");
  if (!container) return;
  const stats = getCareStatsV2(category);

  if (!stats.items.length) {
    container.innerHTML = gmEmpty(`No ${category} care routines added.`);
    return;
  }

  container.innerHTML = stats.items.map(item => {
    const done = Boolean(getCareLogV2(item.id, getTodayKey())?.done);
    return `
      <button type="button" class="care-check-v2 ${done ? "done" : ""}" data-id="${item.id}" data-category="${category}">
        <span class="care-checkmark-v2">${done ? "✓" : ""}</span>
        <span><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.time || "Any time")}</small></span>
        <b>${done ? "DONE" : "PENDING"}</b>
      </button>
    `;
  }).join("");

  container.querySelectorAll(".care-check-v2").forEach(button => {
    button.addEventListener("click", () => toggleCareTodayV2(button.dataset.id, button.dataset.category));
  });
}

function renderCareConsistencyV2() {
  const container = document.getElementById("careConsistency");
  if (!container) return;
  const items = [...getCareItemsV2("skin"), ...getCareItemsV2("hair")];
  if (!items.length) {
    container.innerHTML = gmEmpty("Add care routines to begin.");
    return;
  }

  const days = gmCurrentWeekKeys();
  container.innerHTML = `
    <div class="consistency-days"><span></span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
    ${items.map(item => `
      <div class="consistency-row">
        <strong>${escapeHTML(item.name)}</strong>
        ${days.map(date => `<span class="consistency-cell ${getCareLogV2(item.id, date)?.done ? "complete" : ""}">${getCareLogV2(item.id, date)?.done ? "✓" : ""}</span>`).join("")}
      </div>
    `).join("")}
  `;
}

function renderCareV2() {
  ensureCareVisualV2();
  renderCareListV2("skin");
  renderCareListV2("hair");
  renderCareConsistencyV2();

  const skin = getCareStatsV2("skin");
  const hair = getCareStatsV2("hair");
  const todaySkin = document.getElementById("todaySkin");
  const todayHair = document.getElementById("todayHair");
  if (todaySkin) todaySkin.textContent = skin.total ? `${skin.completed} / ${skin.total}` : "--";
  if (todayHair) todayHair.textContent = hair.total ? `${hair.completed} / ${hair.total}` : "--";

  const total = skin.total + hair.total;
  const completed = skin.completed + hair.completed;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const percentElement = document.getElementById("carePercentV2");
  const headline = document.getElementById("careHeadlineV2");
  const subline = document.getElementById("careSublineV2");
  if (percentElement) percentElement.textContent = `${percent}%`;
  if (headline) headline.textContent = !total ? "Build your routine" : percent === 100 ? "Ritual complete" : "Routine in progress";
  if (subline) subline.textContent = !total ? "Add skin and hair care once, then tick completion every day." : `${completed} of ${total} care steps completed today.`;

  const weekDays = gmCurrentWeekKeys().filter(day => day <= getTodayKey());
  const careScore = document.getElementById("careScore");
  const careScoreBar = document.getElementById("careScoreBar");
  if (itemsForCareScoreV2().length && weekDays.length) {
    const percentages = weekDays.map(day => {
      const all = itemsForCareScoreV2();
      const done = all.filter(item => getCareLogV2(item.id, day)?.done).length;
      return all.length ? (done / all.length) * 100 : 0;
    });
    const avg = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
    if (careScore) careScore.textContent = `${avg}%`;
    if (careScoreBar) careScoreBar.style.width = `${avg}%`;
  }
}

function itemsForCareScoreV2() {
  return [...getCareItemsV2("skin"), ...getCareItemsV2("hair")];
}

function toggleCareTodayV2(routineId, category) {
  const today = getTodayKey();
  const existing = getCareLogV2(routineId, today);
  if (existing) existing.done = !existing.done;
  else bodyData.careLogs.push({ id: `care_log_${Date.now()}`, routineId, category, date: today, done: true, createdAt: new Date().toISOString() });
  saveBodyData();
  renderCareV2();
  renderPhysicalScoresV2();
}

function openCareFormV2(category = "skin", editId = null) {
  const source = category === "skin" ? bodyData.skinCare : bodyData.hairCare;
  const existing = editId ? source.find(item => item.id === editId) : null;
  openBodyModal(`
    <form class="modal-form" id="careFormV2">
      <h2>${existing ? "Edit Routine" : "Add Care Routine"}</h2>
      <div class="form-group"><label>CATEGORY</label><select id="careCategoryV2"><option value="skin">Skin Care</option><option value="hair">Hair Care</option></select></div>
      <div class="form-group"><label>ROUTINE / PRODUCT</label><input id="careNameV2" type="text" value="${escapeHTML(existing?.name || "")}" placeholder="Cleanser, Sunscreen, Hair Serum..." required /></div>
      <div class="form-group"><label>TIME</label><select id="careTimeV2"><option value="AM">AM</option><option value="PM">PM</option><option value="AM + PM">AM + PM</option><option value="Any time">Any time</option></select></div>
      <div class="modal-actions"><button type="button" class="secondary-action" id="cancelCareV2">CANCEL</button><button type="submit" class="primary-action">SAVE ROUTINE</button></div>
    </form>
  `);

  const categorySelect = document.getElementById("careCategoryV2");
  categorySelect.value = category;
  if (existing) categorySelect.disabled = true;
  const timeSelect = document.getElementById("careTimeV2");
  if (existing?.time) timeSelect.value = existing.time;
  document.getElementById("cancelCareV2")?.addEventListener("click", closeBodyModal);
  document.getElementById("careFormV2")?.addEventListener("submit", event => {
    event.preventDefault();
    const finalCategory = categorySelect.value;
    const finalSource = finalCategory === "skin" ? bodyData.skinCare : bodyData.hairCare;
    const name = document.getElementById("careNameV2").value.trim();
    const time = document.getElementById("careTimeV2").value;
    if (!name) return;

    if (existing) {
      existing.name = name;
      existing.time = time;
      existing.updatedAt = new Date().toISOString();
    } else {
      finalSource.push({ id: `care_${Date.now()}`, name, time, category: finalCategory, createdAt: new Date().toISOString(), archivedAt: null });
    }
    saveBodyData();
    closeBodyModal();
    renderCareV2();
  });
}

function openCareManagerV2(category) {
  const items = getCareItemsV2(category);
  openBodyModal(`
    <div class="modal-form">
      <h2>${category === "skin" ? "Skin" : "Hair"} Care Manager</h2>
      <div class="manage-list">
        ${items.length ? items.map(item => `
          <div class="manage-row">
            <div><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.time || "Any time")}</small></div>
            <div class="manage-actions">
              <button type="button" class="mini-action edit-care-v2" data-id="${item.id}">EDIT</button>
              <button type="button" class="mini-action danger remove-care-v2" data-id="${item.id}">REMOVE</button>
            </div>
          </div>
        `).join("") : gmEmpty("No routines added yet.")}
      </div>
      <div class="modal-actions"><button type="button" class="primary-action" id="addCareInsideV2">+ ADD ROUTINE</button></div>
    </div>
  `);

  document.getElementById("addCareInsideV2")?.addEventListener("click", () => openCareFormV2(category));
  document.querySelectorAll(".edit-care-v2").forEach(button => button.addEventListener("click", () => openCareFormV2(category, button.dataset.id)));
  document.querySelectorAll(".remove-care-v2").forEach(button => {
    button.addEventListener("click", () => {
      const source = category === "skin" ? bodyData.skinCare : bodyData.hairCare;
      const item = source.find(routine => routine.id === button.dataset.id);
      if (!item || !confirm(`Remove "${item.name}" from future tracking? Old history stays saved.`)) return;
      item.archivedAt = new Date().toISOString();
      saveBodyData();
      openCareManagerV2(category);
      renderCareV2();
    });
  });
}

/* =========================================================

/* =========================================================
   INTERACTIVE GRAPHS
========================================================= */

let activeGraphRangeV2 = 28;

function graphStartDateV2() {
  if (activeGraphRangeV2 === "all") return null;
  const date = new Date();
  date.setDate(date.getDate() - (Number(activeGraphRangeV2) - 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

function withinGraphRangeV2(dateKey) {
  const start = graphStartDateV2();
  if (!start) return true;
  return dateKeyToDate(dateKey) >= start;
}

function setupCanvasV2(canvas) {
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(300, rect.width || 500);
  const height = Math.max(180, rect.height || 220);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}

function drawLineChartV2(canvas, series, emptyElement, options = {}) {
  const hasData = series.some(s => s.points?.length);
  if (emptyElement) emptyElement.style.display = hasData ? "none" : "grid";
  if (!hasData || !canvas) return;

  const setup = setupCanvasV2(canvas);
  if (!setup) return;
  const { ctx, width, height } = setup;
  const pad = { left: 38, right: 18, top: 20, bottom: 28 };
  const allValues = series.flatMap(s => s.points.map(p => Number(p.value) || 0));
  const max = Math.max(options.max || 0, ...allValues, 1);
  const min = options.min ?? 0;
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  ctx.clearRect(0, 0, width, height);
  ctx.font = "10px Segoe UI";
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.strokeStyle = "rgba(255,255,255,.08)";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (plotH * i) / 4;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
    const value = Math.round(max - ((max - min) * i) / 4);
    ctx.fillText(String(value), 4, y + 3);
  }

  series.forEach((s, seriesIndex) => {
    const points = s.points;
    ctx.strokeStyle = s.color || (seriesIndex ? "#58d7ff" : "#8d7cff");
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((point, index) => {
      const x = pad.left + (points.length === 1 ? plotW / 2 : (plotW * index) / (points.length - 1));
      const y = pad.top + plotH - ((Number(point.value) - min) / (max - min || 1)) * plotH;
      if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    points.forEach((point, index) => {
      const x = pad.left + (points.length === 1 ? plotW / 2 : (plotW * index) / (points.length - 1));
      const y = pad.top + plotH - ((Number(point.value) - min) / (max - min || 1)) * plotH;
      ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill();
    });
  });

  const labels = series[0].points;
  const step = Math.max(1, Math.ceil(labels.length / 5));
  ctx.fillStyle = "rgba(255,255,255,.32)";
  labels.forEach((point, index) => {
    if (index % step !== 0 && index !== labels.length - 1) return;
    const x = pad.left + (labels.length === 1 ? plotW / 2 : (plotW * index) / (labels.length - 1));
    ctx.fillText((point.label || "").slice(0, 6), x - 14, height - 8);
  });

  canvas.onmousemove = event => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const relative = gmClamp((x - pad.left) / plotW, 0, 1);
    const index = Math.round(relative * Math.max(0, labels.length - 1));
    canvas.title = series.map(s => {
      const point = s.points[index];
      return point ? `${s.name}: ${point.tooltip || point.value}` : "";
    }).filter(Boolean).join(" | ");
  };
}

function drawBarChartV2(canvas, points, emptyElement) {
  if (emptyElement) emptyElement.style.display = points.length ? "none" : "grid";
  if (!points.length || !canvas) return;
  const setup = setupCanvasV2(canvas);
  if (!setup) return;
  const { ctx, width, height } = setup;
  const pad = { left: 34, right: 14, top: 18, bottom: 28 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const max = Math.max(...points.map(p => Number(p.value) || 0), 1);
  const gap = 7;
  const barW = Math.max(5, (plotW - gap * (points.length - 1)) / points.length);

  ctx.clearRect(0, 0, width, height);
  ctx.font = "10px Segoe UI";
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.strokeStyle = "rgba(255,255,255,.08)";
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (plotH * i) / 4;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
  }
  points.forEach((point, index) => {
    const x = pad.left + index * (barW + gap);
    const h = ((Number(point.value) || 0) / max) * plotH;
    ctx.fillStyle = "#ff6576";
    ctx.fillRect(x, pad.top + plotH - h, barW, h);
  });

  canvas.onmousemove = event => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - pad.left;
    const index = gmClamp(Math.floor(x / (barW + gap)), 0, points.length - 1);
    const p = points[index];
    canvas.title = p ? `${p.label}: ${p.tooltip || p.value}` : "";
  };
}

function populateStrengthExercisesV2() {
  const select = document.getElementById("strengthExerciseSelect");
  if (!select) return;
  const old = select.value;
  select.innerHTML = `<option value="">Select Exercise</option>${getActiveExercisesV2().map(item => `<option value="${item.id}">${escapeHTML(item.name)}</option>`).join("")}`;
  if (getActiveExercisesV2().some(item => item.id === old)) select.value = old;
  else if (getActiveExercisesV2()[0]) select.value = getActiveExercisesV2()[0].id;
}

function strengthPointsV2(exerciseId) {
  const byDate = new Map();
  bodyData.workouts.filter(workout => withinGraphRangeV2(workout.date)).forEach(workout => {
    (workout.entries || []).forEach(entry => {
      if (entry.exerciseId !== exerciseId) return;
      const maxWeight = Math.max(0, ...(entry.sets || []).map(set => Number(set.weight) || 0));
      byDate.set(workout.date, Math.max(byDate.get(workout.date) || 0, maxWeight));
    });
  });
  return [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, value]) => ({ label: date.slice(5), value, tooltip: `${value} kg` }));
}

function runningPointsV2() {
  return bodyData.runs.filter(run => withinGraphRangeV2(run.date)).sort((a, b) => a.date.localeCompare(b.date)).map(run => ({ label: run.date.slice(5), value: Number(run.distance) || 0, tooltip: `${Number(run.distance || 0).toFixed(1)} km · ${Number(run.minutes) || 0} min` }));
}

function nutritionPointsV2() {
  const start = graphStartDateV2();
  const end = new Date();
  const dates = [];
  const first = start || (() => {
    const all = [...bodyData.dietLogs.map(x => x.date), ...bodyData.waterLogs.map(x => x.date)].filter(Boolean).sort();
    return all.length ? dateKeyToDate(all[0]) : new Date();
  })();
  for (let d = new Date(first); d <= end; d.setDate(d.getDate() + 1)) dates.push(makeDateKey(d));
  const proteinTarget = Math.max(1, Number(bodyData.proteinTarget) || 120);
  const waterTarget = Math.max(.1, Number(bodyData.waterTarget) || 4);
  return {
    protein: dates.map(date => { const grams = getProteinTotalForDate(date); return { label: date.slice(5), value: Math.min(120, Math.round((grams / proteinTarget) * 100)), tooltip: `${Math.round(grams)} g` }; }),
    water: dates.map(date => { const litres = getWaterTotalForDate(date); return { label: date.slice(5), value: Math.min(120, Math.round((litres / waterTarget) * 100)), tooltip: `${litres.toFixed(1)} L` }; })
  };
}

function sleepPointsV2() {
  return bodyData.recovery.filter(item => item?.date && withinGraphRangeV2(item.date)).sort((a, b) => a.date.localeCompare(b.date)).map(item => ({ label: item.date.slice(5), value: Number(item.sleep) || 0, tooltip: `${Number(item.sleep || 0).toFixed(1)} h` }));
}

function renderAllGraphsV2() {
  populateStrengthExercisesV2();
  const strengthSelect = document.getElementById("strengthExerciseSelect");
  const strengthPoints = strengthSelect?.value ? strengthPointsV2(strengthSelect.value) : [];
  drawLineChartV2(document.getElementById("strengthChart"), [{ name: "Weight", points: strengthPoints, color: "#8d7cff" }], document.getElementById("strengthEmpty"));

  drawBarChartV2(document.getElementById("runningChart"), runningPointsV2(), document.getElementById("runningEmpty"));

  const nutrition = nutritionPointsV2();
  drawLineChartV2(document.getElementById("nutritionChart"), [
    { name: "Protein", points: nutrition.protein, color: "#9b7cff" },
    { name: "Water", points: nutrition.water, color: "#58d7ff" }
  ], document.getElementById("nutritionEmpty"), { max: 120 });

  drawLineChartV2(document.getElementById("sleepChart"), [{ name: "Sleep", points: sleepPointsV2(), color: "#7f92ff" }], document.getElementById("sleepEmpty"), { max: 10 });
}

/* =========================================================

/* =========================================================
   SCORE V3 — REST DAY IS EXCLUDED, NOT PENALIZED
========================================================= */

function nutritionWeeklyScoreV3() {
  const days = gmCurrentWeekKeys().filter(day => day <= getTodayKey());
  const values = [];
  days.forEach(day => {
    const hasProtein = bodyData.dietLogs.some(log => log.date === day && log.done);
    const hasWater = bodyData.waterLogs.some(log => log.date === day);
    if (hasProtein) values.push(Math.min(100, (getProteinTotalForDate(day) / Math.max(1, Number(bodyData.proteinTarget) || 120)) * 100));
    if (hasWater) values.push(Math.min(100, (getWaterTotalForDate(day) / Math.max(.1, Number(bodyData.waterTarget) || 4)) * 100));
  });
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
}

function careWeeklyScoreV3() {
  const items = itemsForCareScoreV2();
  if (!items.length) return null;
  const days = gmCurrentWeekKeys().filter(day => day <= getTodayKey());
  if (!days.length) return null;
  const values = days.map(day => (items.filter(item => getCareLogV2(item.id, day)?.done).length / items.length) * 100);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function renderPhysicalScoresV3() {
  const training = trainingScoreV3();
  const running = calculateRunningProgress().percentage;
  const nutrition = nutritionWeeklyScoreV3();
  const care = careWeeklyScoreV3();

  const trainingText = document.getElementById("trainingScore");
  const trainingBar = document.getElementById("trainingScoreBar");
  const nutritionText = document.getElementById("nutritionScore");
  const nutritionBar = document.getElementById("nutritionScoreBar");
  const careText = document.getElementById("careScore");
  const careBar = document.getElementById("careScoreBar");

  if (trainingText) trainingText.textContent = training === null ? "--" : `${training}%`;
  if (trainingBar) trainingBar.style.width = `${training || 0}%`;
  if (nutritionText) nutritionText.textContent = nutrition === null ? "--" : `${nutrition}%`;
  if (nutritionBar) nutritionBar.style.width = `${nutrition || 0}%`;
  if (careText) careText.textContent = care === null ? "--" : `${care}%`;
  if (careBar) careBar.style.width = `${care || 0}%`;

  const scores = [training, running, nutrition, care].filter(value => value !== null && Number.isFinite(value));
  const overall = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const weekly = document.getElementById("weeklyPhysicalScore");
  const hero = document.getElementById("todayPhysicalScore");
  const status = document.querySelector(".score-status");
  if (weekly) weekly.textContent = `${overall}%`;
  if (hero) hero.textContent = `${overall}%`;
  if (status) status.textContent = overall >= 90 ? "TARGET CRUSHED" : overall >= 70 ? "STRONG WEEK" : overall >= 40 ? "GOOD PROGRESS" : overall > 0 ? "BUILD MOMENTUM" : "START LOGGING";
}

/* Compatibility for Care V2 functions that call this name. */
function renderPhysicalScoresV2() {
  renderPhysicalScoresV3();
}

/* =========================================================
   WIRE V3
========================================================= */

gmResetButton("addWorkoutButton", openWorkoutLoggerV3);
gmResetButton("editWeeklySplitButton", openWeeklySplitEditorV3);
gmResetButton("logRunButton", openRunLoggerV3);
gmResetButton("editRunningTargetButton", openRunningTargetV3);
gmResetButton("addCareRoutineButton", () => openCareFormV2("skin"));
gmResetButton("manageSkinCareButton", () => openCareManagerV2("skin"));
gmResetButton("manageHairCareButton", () => openCareManagerV2("hair"));
gmResetButton("restDayToggleButtonV3", toggleSelectedRestDayV3);

document.getElementById("restDayDateV3")?.addEventListener("change", renderRestDayV3);
document.getElementById("strengthExerciseSelect")?.addEventListener("change", renderAllGraphsV2);

document.querySelectorAll(".graph-range button").forEach(button => {
  button.addEventListener("click", () => {
    activeGraphRangeV2 = button.dataset.range === "all" ? "all" : Number(button.dataset.range || 28);
    renderAllGraphsV2();
  });
});

window.addEventListener("resize", () => {
  clearTimeout(window.__bodyGraphResizeV3);
  window.__bodyGraphResizeV3 = setTimeout(renderAllGraphsV2, 120);
});

renderTrainingV3();
renderRunning();
renderRunningHistoryV3();
renderRestDayV3();
renderCareV2();
renderAllGraphsV2();
renderPhysicalScoresV3();

/* =========================================================
   TRAINING V4 — REPEATABLE 6-DAY SPLIT + DAY SLIDER
   Simple daily tracking:
   - choose day
   - tick exercises actually done
   - store weight only for memory
   - history stays long term
========================================================= */

let selectedTrainingDateV4 = getTodayKey();

function getWorkoutForDateV4(dateKey) {
  const items = bodyData.workouts
    .filter(workout => workout?.date === dateKey)
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  return items[0] || null;
}

function getEntryWeightV4(entry) {
  if (!entry) return 0;
  return Math.max(0, ...(entry.sets || []).map(set => Number(set.weight) || 0));
}

function getPreviousWeightV4(exerciseId, beforeDate) {
  const records = bodyData.workouts
    .filter(workout => workout?.date && workout.date < beforeDate)
    .sort((a, b) => b.date.localeCompare(a.date));

  for (const workout of records) {
    const entry = (workout.entries || []).find(item => item.exerciseId === exerciseId);
    if (entry) {
      const weight = getEntryWeightV4(entry);
      if (weight > 0) return { weight, date: workout.date };
    }
  }
  return null;
}

function getTrainingDateStatusV4(dateKey) {
  const day = getDateDayV3(dateKey);
  const plan = getPlanForDateV3(dateKey);
  const workout = getWorkoutForDateV4(dateKey);
  const today = getTodayKey();

  if (day === 0) return "SUNDAY REST";
  if (isRestDayV3(dateKey)) return "REST DAY";
  if (workout) return "LOGGED";
  if (!plan || !(plan.exercises || []).length) return "NOT SET";
  if (dateKey === today) return "TODAY";
  if (dateKey > today) return "UPCOMING";
  return "NOT LOGGED";
}

function moveTrainingDateV4(amount) {
  selectedTrainingDateV4 = moveDateKey(selectedTrainingDateV4, amount);
  renderTrainingV4();
}

function renderTrainingDateStripV4() {
  const container = document.getElementById("trainingDateStripV4");
  if (!container) return;

  const today = getTodayKey();
  let html = "";

  for (let offset = -3; offset <= 3; offset++) {
    const key = moveDateKey(selectedTrainingDateV4, offset);
    const date = dateKeyToDate(key);
    const day = date.getDay();
    const plan = getPlanForDateV3(key);
    const workout = getWorkoutForDateV4(key);
    const rest = day === 0 || isRestDayV3(key);
    const active = key === selectedTrainingDateV4;
    const isToday = key === today;
    const status = getTrainingDateStatusV4(key);

    html += `
      <button
        type="button"
        class="training-day-chip-v4 ${active ? "active" : ""} ${isToday ? "today" : ""} ${rest ? "rest" : ""} ${workout ? "logged" : ""}"
        data-date="${key}"
      >
        <span>${date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}</span>
        <strong>${date.getDate()}</strong>
        <b>${escapeHTML(day === 0 ? "REST" : (plan?.name || "NO PLAN"))}</b>
        <small>${escapeHTML(status)}</small>
      </button>
    `;
  }

  container.innerHTML = html;
  container.querySelectorAll(".training-day-chip-v4").forEach(button => {
    button.addEventListener("click", () => {
      selectedTrainingDateV4 = button.dataset.date;
      renderTrainingV4();
    });
  });
}

function renderTrainingDateHeaderV4() {
  const date = dateKeyToDate(selectedTrainingDateV4);
  const today = getTodayKey();
  const dayLabel = document.getElementById("selectedTrainingDayLabelV4");
  const dateLabel = document.getElementById("selectedTrainingDateLabelV4");
  const todayButton = document.getElementById("trainingTodayButtonV4");

  if (dayLabel) {
    dayLabel.textContent = selectedTrainingDateV4 === today
      ? "TODAY"
      : date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  }

  if (dateLabel) {
    dateLabel.textContent = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).toUpperCase();
  }

  if (todayButton) todayButton.disabled = selectedTrainingDateV4 === today;
}

function renderTrainingTrackerV4() {
  const container = document.getElementById("trainingExerciseTrackerV4");
  const planName = document.getElementById("trainingSelectedPlanNameV4");
  const kicker = document.getElementById("trainingSelectedKickerV4");
  const state = document.getElementById("trainingSelectedStateV4");
  const saveButton = document.getElementById("saveTrainingDayV4");
  const clearButton = document.getElementById("clearTrainingDayV4");

  if (!container) return;

  const date = dateKeyToDate(selectedTrainingDateV4);
  const day = date.getDay();
  const plan = getPlanForDateV3(selectedTrainingDateV4);
  const workout = getWorkoutForDateV4(selectedTrainingDateV4);
  const rest = day === 0 || isRestDayV3(selectedTrainingDateV4);
  const future = selectedTrainingDateV4 > getTodayKey();

  if (kicker) kicker.textContent = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  if (planName) planName.textContent = day === 0 ? "Sunday Rest" : (plan?.name || "No Training Plan");
  if (state) state.textContent = getTrainingDateStatusV4(selectedTrainingDateV4);
  if (saveButton) saveButton.disabled = rest || future || !plan || !(plan.exercises || []).length;
  if (clearButton) clearButton.disabled = !workout || future;

  if (rest) {
    container.innerHTML = `
      <div class="diet-empty">
        <span>${day === 0 ? "SUNDAY — AUTOMATIC REST" : "REST DAY ACTIVE"}</span>
        <p>This day is excluded from the expected training count. No workout log is required.</p>
      </div>
    `;
    return;
  }

  if (!plan || !(plan.exercises || []).length) {
    container.innerHTML = `
      <div class="diet-empty">
        <span>NO WORKOUT SET FOR THIS DAY</span>
        <p>Use Edit 6-Day Split and add the exercises you normally repeat on this weekday.</p>
      </div>
    `;
    return;
  }

  const existingById = new Map((workout?.entries || []).map(entry => [entry.exerciseId, entry]));

  container.innerHTML = plan.exercises.map(exercise => {
    const existing = existingById.get(exercise.id);
    const done = Boolean(existing);
    const currentWeight = existing ? getEntryWeightV4(existing) : "";
    const previous = getPreviousWeightV4(exercise.id, selectedTrainingDateV4);
    const previousText = previous
      ? `Last: ${previous.weight} kg · ${previous.date}`
      : "No previous weight saved";

    return `
      <div class="training-exercise-row-v4 ${done ? "done" : ""}" data-id="${exercise.id}" data-name="${escapeHTML(exercise.name)}">
        <button
          type="button"
          class="training-exercise-check-v4"
          aria-pressed="${done ? "true" : "false"}"
          ${future ? "disabled" : ""}
        >${done ? "✓" : ""}</button>

        <div class="training-exercise-copy-v4">
          <strong>${escapeHTML(exercise.name)}</strong>
          <small>${escapeHTML(previousText)}</small>
        </div>

        <label class="training-weight-box-v4">
          <input
            type="number"
            class="training-weight-input-v4"
            min="0"
            step="0.5"
            value="${currentWeight}"
            placeholder="Weight"
            ${future ? "disabled" : ""}
          />
          <span>KG</span>
        </label>
      </div>
    `;
  }).join("");

  container.querySelectorAll(".training-exercise-row-v4").forEach(row => {
    const check = row.querySelector(".training-exercise-check-v4");
    const weight = row.querySelector(".training-weight-input-v4");

    check?.addEventListener("click", () => {
      const next = check.getAttribute("aria-pressed") !== "true";
      check.setAttribute("aria-pressed", next ? "true" : "false");
      check.textContent = next ? "✓" : "";
      row.classList.toggle("done", next);
      if (next) weight?.focus();
    });

    weight?.addEventListener("input", () => {
      if (weight.value !== "") {
        check?.setAttribute("aria-pressed", "true");
        if (check) check.textContent = "✓";
        row.classList.add("done");
      }
    });
  });
}

function getTrainingHistoryForSelectedDayV4() {
  const selectedDay = getDateDayV3(selectedTrainingDateV4);
  if (selectedDay === 0) return [];

  return bodyData.workouts
    .filter(workout => workout?.date && getDateDayV3(workout.date) === selectedDay)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);
}

function renderTrainingHistoryV4() {
  const container = document.getElementById("trainingHistoryV4");
  if (!container) return;

  const records = getTrainingHistoryForSelectedDayV4();
  if (!records.length) {
    container.innerHTML = gmEmpty("No previous records for this weekday yet.");
    return;
  }

  container.innerHTML = records.map(workout => {
    const exerciseSummary = (workout.entries || []).map(entry => {
      const w = getEntryWeightV4(entry);
      return `${entry.exerciseName}${w > 0 ? ` ${w}kg` : ""}`;
    }).join(" · ");

    return `
      <button type="button" class="training-history-row-v4" data-date="${workout.date}">
        <span>${escapeHTML(workout.date)}</span>
        <div class="training-history-summary-v4">
          <strong>${escapeHTML(workout.title || "Workout")}</strong>
          <small>${escapeHTML(exerciseSummary || "No exercise detail")}</small>
        </div>
        <b>${(workout.entries || []).length} DONE</b>
      </button>
    `;
  }).join("");

  container.querySelectorAll(".training-history-row-v4").forEach(button => {
    button.addEventListener("click", () => {
      selectedTrainingDateV4 = button.dataset.date;
      renderTrainingV4();
    });
  });
}

function saveTrainingDayV4() {
  if (selectedTrainingDateV4 > getTodayKey()) return;
  if (getDateDayV3(selectedTrainingDateV4) === 0 || isRestDayV3(selectedTrainingDateV4)) return;

  const plan = getPlanForDateV3(selectedTrainingDateV4);
  if (!plan || !(plan.exercises || []).length) return;

  const rows = [...document.querySelectorAll("#trainingExerciseTrackerV4 .training-exercise-row-v4")];
  const entries = [];
  let prCount = 0;

  rows.forEach(row => {
    const checked = row.querySelector(".training-exercise-check-v4")?.getAttribute("aria-pressed") === "true";
    if (!checked) return;

    const exerciseId = row.dataset.id;
    const exerciseName = row.dataset.name;
    const weight = Number(row.querySelector(".training-weight-input-v4")?.value) || 0;
    const previous = getPreviousWeightV4(exerciseId, selectedTrainingDateV4);

    if (weight > 0 && (!previous || weight > previous.weight)) prCount += 1;

    entries.push({
      exerciseId,
      exerciseName,
      sets: [{ reps: 0, weight }]
    });
  });

  if (!entries.length) {
    alert("Tick at least one exercise you actually completed.");
    return;
  }

  bodyData.workouts = bodyData.workouts.filter(workout => workout?.date !== selectedTrainingDateV4);
  bodyData.workouts.push({
    id: `workout_${Date.now()}`,
    date: selectedTrainingDateV4,
    title: plan.name || "Workout",
    duration: 0,
    notes: "",
    entries,
    prCount,
    splitDay: getDateDayV3(selectedTrainingDateV4),
    createdAt: new Date().toISOString()
  });

  saveBodyData();
  renderTrainingV4();
  populateStrengthExercisesV2();
  renderAllGraphsV2();
  renderPhysicalScoresV3();

  const reactor = document.querySelector(".training-reactor-v4");
  reactor?.classList.remove("celebrate");
  requestAnimationFrame(() => reactor?.classList.add("celebrate"));
}

function clearTrainingDayV4() {
  const existing = getWorkoutForDateV4(selectedTrainingDateV4);
  if (!existing) return;
  if (!confirm(`Clear the saved training log for ${selectedTrainingDateV4}?`)) return;

  bodyData.workouts = bodyData.workouts.filter(workout => workout?.date !== selectedTrainingDateV4);
  saveBodyData();
  renderTrainingV4();
  renderAllGraphsV2();
  renderPhysicalScoresV3();
}

function renderTrainingSummaryV4() {
  const currentWeek = getCurrentWeekWorkoutsV3();
  const uniqueDates = new Set(currentWeek.map(workout => workout.date));
  const prs = currentWeek.reduce((sum, workout) => sum + (Number(workout.prCount) || 0), 0);
  const expected = getExpectedTrainingDatesV3();
  const completedExpected = expected.filter(date => uniqueDates.has(date)).length;

  const weekly = document.getElementById("weeklyTrainingSessions");
  const pr = document.getElementById("weeklyPRCount");
  const progress = document.getElementById("trainingWeekProgressV4");
  const todayTraining = document.getElementById("todayTraining");
  const title = document.getElementById("trainingTodayTitleV4");
  const text = document.getElementById("trainingReactorTextV4");

  if (weekly) weekly.textContent = uniqueDates.size;
  if (pr) pr.textContent = prs;
  if (progress) progress.textContent = `${completedExpected} / ${expected.length}`;

  const today = getTodayKey();
  const todayWorkout = getWorkoutForDateV4(today);
  const todayPlan = getPlanForDateV3(today);
  const todayRest = getDateDayV3(today) === 0 || isRestDayV3(today);

  if (todayTraining) {
    todayTraining.textContent = todayRest
      ? "REST DAY"
      : todayWorkout
        ? `${(todayWorkout.entries || []).length} DONE`
        : "NOT LOGGED";
  }

  const selectedPlan = getPlanForDateV3(selectedTrainingDateV4);
  const selectedDay = getDateDayV3(selectedTrainingDateV4);
  if (title) title.textContent = selectedDay === 0 ? "Sunday Rest" : (selectedPlan?.name || "Build Your Split");
  if (text) {
    text.textContent = selectedDay === 0
      ? "Sunday is your automatic recovery day."
      : selectedPlan?.exercises?.length
        ? `${selectedPlan.exercises.length} exercises in this repeating ${dayInfoV3(selectedDay)?.label || "day"} plan.`
        : "Add this weekday's exercises once, then repeat and track them every week.";
  }
}

function renderTrainingV4() {
  renderTrainingDateHeaderV4();
  renderTrainingDateStripV4();
  renderTrainingTrackerV4();
  renderTrainingHistoryV4();
  renderTrainingSummaryV4();
}

/* =========================================================
   SMALL 6-DAY SPLIT EDITOR
========================================================= */

function openWeeklySplitEditorV4() {
  openBodyModal(`
    <div class="modal-form split-editor-v4">
      <h2>Edit 6-Day Split</h2>
      <p class="form-description">Choose a weekday, give it a workout name, and write one repeatable exercise per line.</p>

      <div class="split-day-tabs-v4">
        ${TRAINING_DAYS_V3.map(({ day, short }) => `<button type="button" class="secondary-action split-day-tab-v4" data-day="${day}">${short}</button>`).join("")}
      </div>

      <div id="splitDayEditorHolderV4"></div>

      <div class="modal-actions">
        <button type="button" class="secondary-action" id="closeSplitEditorV4">DONE</button>
      </div>
    </div>
  `);

  let editingDay = getDateDayV3(selectedTrainingDateV4);
  if (editingDay === 0) editingDay = 1;

  function renderDayEditor(day) {
    editingDay = Number(day);
    const plan = bodyData.trainingSplit[String(editingDay)] || { name: "", exercises: [] };
    const holder = document.getElementById("splitDayEditorHolderV4");
    if (!holder) return;

    document.querySelectorAll(".split-day-tab-v4").forEach(button => {
      button.classList.toggle("active", Number(button.dataset.day) === editingDay);
    });

    holder.innerHTML = `
      <section class="split-editor-day-v4">
        <span class="panel-kicker">${dayInfoV3(editingDay)?.label || "DAY"}</span>
        <div class="form-group">
          <label>WORKOUT / MUSCLE GROUP</label>
          <input type="text" id="splitNameInputV4" value="${escapeHTML(plan.name || "")}" placeholder="Chest + Triceps" />
        </div>
        <div class="form-group">
          <label>YOUR REPEATABLE EXERCISE BOX — ONE PER LINE</label>
          <textarea id="splitExercisesInputV4" rows="8" placeholder="Bench Press\nIncline Dumbbell Press\nCable Fly\nTricep Pushdown">${escapeHTML((plan.exercises || []).map(x => x.name).join("\n"))}</textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="primary-action" id="saveSplitDayV4">SAVE ${dayInfoV3(editingDay)?.short || "DAY"}</button>
        </div>
      </section>
    `;

    document.getElementById("saveSplitDayV4")?.addEventListener("click", () => {
      const oldPlan = bodyData.trainingSplit[String(editingDay)] || { name: "", exercises: [] };
      const name = document.getElementById("splitNameInputV4")?.value.trim() || "";
      const names = (document.getElementById("splitExercisesInputV4")?.value || "")
        .split("\n")
        .map(x => x.trim())
        .filter(Boolean);

      const oldByName = new Map((oldPlan.exercises || []).map(x => [String(x.name || "").toLowerCase(), x]));
      const exercises = names.map((exerciseName, index) => {
        const old = oldByName.get(exerciseName.toLowerCase());
        return {
          id: old?.id || `split_ex_${editingDay}_${gmSlug(exerciseName)}_${Date.now()}_${index}`,
          name: exerciseName
        };
      });

      bodyData.trainingSplit[String(editingDay)] = { name, exercises };
      saveBodyData();
      renderTrainingV4();
      populateStrengthExercisesV2();
      renderAllGraphsV2();
      renderPhysicalScoresV3();
      renderDayEditor(editingDay);
    });
  }

  document.querySelectorAll(".split-day-tab-v4").forEach(button => {
    button.addEventListener("click", () => renderDayEditor(button.dataset.day));
  });

  document.getElementById("closeSplitEditorV4")?.addEventListener("click", closeBodyModal);
  renderDayEditor(editingDay);
}

/* =========================================================
   TRAINING V4 WIRING
========================================================= */

document.getElementById("previousTrainingDayV4")?.addEventListener("click", () => moveTrainingDateV4(-1));
document.getElementById("nextTrainingDayV4")?.addEventListener("click", () => moveTrainingDateV4(1));
document.getElementById("trainingTodayButtonV4")?.addEventListener("click", () => {
  selectedTrainingDateV4 = getTodayKey();
  renderTrainingV4();
});
document.getElementById("saveTrainingDayV4")?.addEventListener("click", saveTrainingDayV4);
document.getElementById("clearTrainingDayV4")?.addEventListener("click", clearTrainingDayV4);

gmResetButton("editWeeklySplitButton", openWeeklySplitEditorV4);

/* All future Training refreshes use the V4 tracker. */
renderTrainingV3 = renderTrainingV4;

renderTrainingV4();
renderPhysicalScoresV3();
