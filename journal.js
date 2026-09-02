/* =========================================================
   JOURNAL / THE INNER WORLD
   SOUL STONE
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const JOURNAL_KEYS = {

  thoughts:
    "growthMapInnerThoughtsV1",

  targets:
    "growthMapInnerTargetsV1",

  lessons:
    "growthMapInnerLessonsV1",

  weekly:
    "growthMapInnerWeeklyReviewsV1",

  monthly:
    "growthMapInnerMonthlyReviewsV1",

  media:
    "growthMapInnerMediaV1",

  curiosity:
    "growthMapInnerCuriosityV1",

  letters:
    "growthMapInnerLettersV1",

  questions:
    "growthMapInnerQuestionsV1",

  future:
    "growthMapInnerFutureDirectionV1",

  hardTruths:
    "growthMapInnerHardTruthsV1",

  lifeBalance:
    "growthMapInnerLifeBalanceV1",

  reality:
    "growthMapInnerRealityReflectionV1",

  ending:
    "growthMapInnerEndingV1"

};


/* EXISTING GROWTH MAP DATA */

const EXTERNAL_KEYS = {

  studies:
    "growthMapStudySessionsV1",

  coding:
    "growthMapCodingProblemsV1",

  projectLogs:
    "growthMapProjectBuildLogsV1",

  dailyJournal:
    "growthMapJournalV1",

  tracker:
    "growthMapTrackerV1"

};


/* =========================================================
   BASIC HELPERS
========================================================= */

const $ = (selector) =>
  document.querySelector(selector);


const $$ = (selector) =>
  [...document.querySelectorAll(selector)];


function loadData(
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


function saveData(
  key,
  value
) {

  localStorage.setItem(
    key,
    JSON.stringify(value)
  );

}


function createId(
  prefix = "item"
) {

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;

}


function escapeHTML(
  value = ""
) {

  return String(value)

    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function localDateKey(
  date = new Date()
) {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;

}


function monthKey(
  date = new Date()
) {

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(
    2,
    "0"
  )}`;

}


function startOfWeek(
  date = new Date()
) {

  const result =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

  const day =
    result.getDay();

  const difference =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() + difference
  );

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;

}


function getWeekKey() {

  return localDateKey(
    startOfWeek()
  );

}


function parseDate(
  value
) {

  if (!value) {
    return null;
  }


  if (
    value instanceof Date
  ) {

    return value;

  }


  if (
    /^\d{4}-\d{2}-\d{2}$/
      .test(value)
  ) {

    const [
      y,
      m,
      d
    ] =
      value
        .split("-")
        .map(Number);

    return new Date(
      y,
      m - 1,
      d
    );

  }


  const parsed =
    new Date(value);


  return Number.isNaN(
    parsed.getTime()
  )
    ? null
    : parsed;

}


function isThisWeek(
  value
) {

  const date =
    parseDate(value);

  if (!date) {
    return false;
  }


  const start =
    startOfWeek();

  const end =
    new Date(start);

  end.setDate(
    end.getDate() + 7
  );


  return (
    date >= start &&
    date < end
  );

}


function isThisMonth(
  value
) {

  const date =
    parseDate(value);

  if (!date) {
    return false;
  }


  const now =
    new Date();


  return (
    date.getFullYear() ===
      now.getFullYear() &&

    date.getMonth() ===
      now.getMonth()
  );

}


function prettyDate(
  value
) {

  const date =
    parseDate(value);

  if (!date) {
    return "";
  }


  return date.toLocaleDateString(
    "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


function clamp(
  number,
  min = 0,
  max = 100
) {

  return Math.min(
    max,
    Math.max(
      min,
      Number(number) || 0
    )
  );

}


function debounce(
  callback,
  wait = 350
) {

  let timer;

  return (...args) => {

    clearTimeout(timer);

    timer =
      setTimeout(
        () =>
          callback(...args),
        wait
      );

  };

}


/* =========================================================
   HERO
========================================================= */

function renderHero() {

  const now =
    new Date();


  $("#heroDate").textContent =
    now
      .toLocaleDateString(
        "en-US",
        {
          day: "2-digit",
          month: "long",
          year: "numeric"
        }
      )
      .toUpperCase();


  $("#chapterNumber")
    .textContent =
      String(
        now.getMonth() + 1
      ).padStart(
        2,
        "0"
      );


  $("#chapterMonth")
    .textContent =
      now
        .toLocaleDateString(
          "en-US",
          {
            month: "long",
            year: "numeric"
          }
        )
        .toUpperCase();


  $("#storyYear")
    .textContent =
      now.getFullYear();


  const questions = [

    "If I repeat this exact week for a year, where will I end up?",

    "What am I avoiding because doing it would force me to grow?",

    "What deserves more of my attention right now?",

    "Which part of my current life would future me be grateful I protected?",

    "Am I building the life I want, or only staying busy?",

    "What would change if I trusted myself more?",

    "What am I doing today that I know I will eventually have to stop?"

  ];


  const dayIndex =
    Math.floor(
      new Date(
        now.getFullYear(),
        0,
        0
      )
        .getTime() /
      86400000
    );


  $("#heroQuestion")
    .textContent =
      questions[
        Math.abs(dayIndex) %
        questions.length
      ];


  const start =
    startOfWeek();


  const end =
    new Date(start);

  end.setDate(
    end.getDate() + 6
  );


  $("#weeklyPeriodLabel")
    .textContent =
      `${start.toLocaleDateString(
        "en-US",
        {
          day: "2-digit",
          month: "short"
        }
      )} — ${end.toLocaleDateString(
        "en-US",
        {
          day: "2-digit",
          month: "short"
        }
      )}`.toUpperCase();

}


/* =========================================================
   MODAL
========================================================= */

const modal =
  $("#journalModal");


let modalSaveHandler =
  null;


let modalDeleteHandler =
  null;


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
        value="${escapeHTML(value)}"
        placeholder="${escapeHTML(placeholder)}"
      >

    </label>

  `;

}


function textareaField(
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
        placeholder="${escapeHTML(placeholder)}"
      >${escapeHTML(value)}</textarea>

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
                  value="${escapeHTML(value)}"
                  ${
                    value === selected
                      ? "selected"
                      : ""
                  }
                >
                  ${escapeHTML(text)}
                </option>

              `;

            }
          )
          .join("")}

      </select>

    </label>

  `;

}


function openModal({
  kicker = "ADD",
  title = "New Entry",
  html = "",
  onSave,
  onDelete = null
}) {

  $("#journalModalKicker")
    .textContent =
      kicker;


  $("#journalModalTitle")
    .textContent =
      title;


  $("#journalModalBody")
    .innerHTML =
      html;


  modalSaveHandler =
    onSave;


  modalDeleteHandler =
    onDelete;


  $("#journalModalDelete")
    .hidden =
      !onDelete;


  modal.classList.add(
    "open"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  setTimeout(
    () =>
      $("#journalModalBody input, #journalModalBody textarea, #journalModalBody select")
        ?.focus(),
    40
  );

}


function closeModal() {

  modal.classList.remove(
    "open"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  $("#journalModalBody")
    .innerHTML =
      "";


  modalSaveHandler =
    null;


  modalDeleteHandler =
    null;


  $("#journalModalDelete")
    .hidden =
      true;

}


$("#journalModalClose")
  ?.addEventListener(
    "click",
    closeModal
  );


$("#journalModalCancel")
  ?.addEventListener(
    "click",
    closeModal
  );


$("#journalModalSave")
  ?.addEventListener(
    "click",
    () =>
      modalSaveHandler?.()
  );


$("#journalModalDelete")
  ?.addEventListener(
    "click",
    () =>
      modalDeleteHandler?.()
  );


modal
  ?.addEventListener(
    "click",
    (event) => {

      if (
        event.target === modal
      ) {

        closeModal();

      }

    }
  );


document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Escape" &&
      modal.classList
        .contains("open")
    ) {

      closeModal();

    }

  }
);


/* =========================================================
   QUICK CAPTURE + THOUGHT VAULT
========================================================= */

let activeCaptureType =
  "Thought";


let activeThoughtFilter =
  "all";


$$(".capture-type")
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          activeCaptureType =
            button.dataset.type;


          $$(".capture-type")
            .forEach(
              (item) =>
                item.classList.toggle(
                  "active",
                  item === button
                )
            );

        }
      );

    }
  );


$("#startWritingButton")
  ?.addEventListener(
    "click",
    () => {

      $(".quick-capture")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });


      setTimeout(
        () =>
          $("#quickCaptureText")
            ?.focus(),
        450
      );

    }
  );


function saveQuickCapture() {

  const text =
    $("#quickCaptureText")
      .value
      .trim();


  if (!text) {

    return;

  }


  const thoughts =
    loadData(
      JOURNAL_KEYS.thoughts,
      []
    );


  thoughts.unshift({

    id:
      createId("thought"),

    type:
      activeCaptureType,

    title:
      "",

    text,

    tags:
      [],

    source:
      "Quick Capture",

    createdAt:
      new Date()
        .toISOString(),

    updatedAt:
      new Date()
        .toISOString()

  });


  saveData(
    JOURNAL_KEYS.thoughts,
    thoughts
  );


  $("#quickCaptureText")
    .value =
      "";


  renderThoughts();

  renderLessons();

  renderStoryTimeline();

}


$("#saveQuickCapture")
  ?.addEventListener(
    "click",
    saveQuickCapture
  );


function thoughtModal(
  item = null,
  defaultType = "Thought"
) {

  openModal({

    kicker:
      item
        ? "EDIT"
        : "WRITE",

    title:
      item
        ? "Edit Entry"
        : "Write Something",

    html:

      selectField(
        "TYPE",
        "mThoughtType",
        [
          "Thought",
          "Idea",
          "Lesson",
          "Memory",
          "Question",
          "Random",
          "Realization",
          "Quote"
        ],
        item?.type ||
        defaultType
      )

      +

      field(
        "TITLE — OPTIONAL",
        "mThoughtTitle",
        item?.title || "",
        "Give this thought a name..."
      )

      +

      textareaField(
        "WRITE",
        "mThoughtText",
        item?.text || "",
        "Write without editing yourself..."
      )

      +

      field(
        "TAGS",
        "mThoughtTags",
        (
          item?.tags ||
          []
        ).join(", "),
        "life, coding, future..."
      )

      +

      field(
        "SOURCE / CONTEXT",
        "mThoughtSource",
        item?.source || "",
        "Personal experience, book, conversation..."
      ),


    onSave:
      () => {

        const text =
          $("#mThoughtText")
            .value
            .trim();


        if (!text) {

          return alert(
            "Write something first."
          );

        }


        const thoughts =
          loadData(
            JOURNAL_KEYS.thoughts,
            []
          );


        const data = {

          id:
            item?.id ||
            createId("thought"),

          type:
            $("#mThoughtType")
              .value,

          title:
            $("#mThoughtTitle")
              .value
              .trim(),

          text,

          tags:
            $("#mThoughtTags")
              .value
              .split(",")
              .map(
                (tag) =>
                  tag.trim()
              )
              .filter(Boolean),

          source:
            $("#mThoughtSource")
              .value
              .trim(),

          createdAt:
            item?.createdAt ||
            new Date()
              .toISOString(),

          updatedAt:
            new Date()
              .toISOString()

        };


        if (item) {

          const index =
            thoughts.findIndex(
              (thought) =>
                thought.id ===
                item.id
            );


          if (
            index >= 0
          ) {

            thoughts[index] =
              data;

          }

        }

        else {

          thoughts.unshift(
            data
          );

        }


        saveData(
          JOURNAL_KEYS.thoughts,
          thoughts
        );


        closeModal();

        renderThoughts();

        renderLessons();

        renderStoryTimeline();

      },


    onDelete:
      item

        ? () => {

          if (
            !confirm(
              "Delete this entry?"
            )
          ) {
            return;
          }


          saveData(
            JOURNAL_KEYS.thoughts,

            loadData(
              JOURNAL_KEYS.thoughts,
              []
            )
              .filter(
                (thought) =>
                  thought.id !==
                  item.id
              )
          );


          closeModal();

          renderThoughts();

          renderLessons();

          renderStoryTimeline();

        }

        : null

  });

}


$("#addThoughtButton")
  ?.addEventListener(
    "click",
    () =>
      thoughtModal()
  );


$("#addLessonButton")
  ?.addEventListener(
    "click",
    () =>
      thoughtModal(
        null,
        "Lesson"
      )
  );


$("#thoughtSearch")
  ?.addEventListener(
    "input",
    renderThoughts
  );


$$(".thought-filter")
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          activeThoughtFilter =
            button.dataset.filter;


          $$(".thought-filter")
            .forEach(
              (item) =>
                item.classList.toggle(
                  "active",
                  item === button
                )
            );


          renderThoughts();

        }
      );

    }
  );


function renderThoughts() {

  const search =
    $("#thoughtSearch")
      ?.value
      .trim()
      .toLowerCase() ||
    "";


  let thoughts =
    loadData(
      JOURNAL_KEYS.thoughts,
      []
    );


  if (
    activeThoughtFilter !==
    "all"
  ) {

    thoughts =
      thoughts.filter(
        (item) =>
          item.type ===
          activeThoughtFilter
      );

  }


  if (search) {

    thoughts =
      thoughts.filter(
        (item) => {

          const haystack = [

            item.title,
            item.text,
            item.type,
            item.source,
            ...(item.tags || [])

          ]
            .join(" ")
            .toLowerCase();


          return haystack.includes(
            search
          );

        }
      );

  }


  const grid =
    $("#thoughtGrid");


  if (!thoughts.length) {

    grid.innerHTML = `

      <div class="empty-state">
        Your thoughts will start living here.
      </div>

    `;

    return;

  }


  grid.innerHTML =
    thoughts

      .map(
        (item) => `

          <article class="thought-card">

            <span class="thought-type">
              ${escapeHTML(
                item.type
              )}
            </span>


            <h3>

              ${escapeHTML(
                item.title ||
                item.text
                  .slice(
                    0,
                    55
                  )
              )}

            </h3>


            <p>

              ${escapeHTML(
                item.text.length > 240

                  ? `${item.text.slice(
                    0,
                    240
                  )}...`

                  : item.text
              )}

            </p>


            ${
              item.tags?.length

                ? `

                  <p>

                    ${item.tags
                      .map(
                        (tag) =>
                          `#${escapeHTML(tag)}`
                      )
                      .join(" ")}

                  </p>

                `

                : ""
            }


            <small>

              ${prettyDate(
                item.createdAt
              )}

              ${
                item.source

                  ? ` · ${escapeHTML(item.source)}`

                  : ""
              }

            </small>


            <div class="card-actions">

              <button
                data-edit-thought="${item.id}"
                type="button"
              >
                OPEN / EDIT
              </button>

            </div>

          </article>

        `
      )
      .join("");

}


$("#thoughtGrid")
  ?.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          "[data-edit-thought]"
        );


      if (!button) {
        return;
      }


      const item =
        loadData(
          JOURNAL_KEYS.thoughts,
          []
        )
          .find(
            (thought) =>
              thought.id ===
              button.dataset
                .editThought
          );


      if (item) {

        thoughtModal(
          item
        );

      }

    }
  );


/* =========================================================
   LESSONS
========================================================= */

function renderLessons() {

  const lessons =
    loadData(
      JOURNAL_KEYS.thoughts,
      []
    )
      .filter(
        (item) =>
          item.type ===
          "Lesson"
      );


  const list =
    $("#lessonList");


  if (!lessons.length) {

    list.innerHTML = `

      <div class="empty-state">
        Save lessons from life, mistakes, people and experiences.
      </div>

    `;

    return;

  }


  list.innerHTML =
    lessons

      .map(
        (item, index) => `

          <article class="lesson-card">

            <div class="lesson-index">

              ${String(
                index + 1
              ).padStart(
                2,
                "0"
              )}

            </div>


            <div>

              <h3>

                ${escapeHTML(
                  item.title ||
                  item.text
                    .slice(
                      0,
                      90
                    )
                )}

              </h3>


              <p>

                ${escapeHTML(
                  item.text
                )}

              </p>


              <div class="card-actions">

                <button
                  data-edit-lesson="${item.id}"
                  type="button"
                >
                  EDIT
                </button>

              </div>

            </div>


            <div class="lesson-source">

              ${
                item.source
                  ? escapeHTML(
                    item.source
                  )
                  : "PERSONAL"
              }

              <br>

              ${prettyDate(
                item.createdAt
              )}

            </div>

          </article>

        `
      )
      .join("");

}


$("#lessonList")
  ?.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          "[data-edit-lesson]"
        );


      if (!button) {
        return;
      }


      const item =
        loadData(
          JOURNAL_KEYS.thoughts,
          []
        )
          .find(
            (thought) =>
              thought.id ===
              button.dataset
                .editLesson
          );


      if (item) {

        thoughtModal(
          item
        );

      }

    }
  );


/* =========================================================
   TARGETS
========================================================= */

function targetModal(
  item = null
) {

  openModal({

    kicker:
      item
        ? "EDIT"
        : "TARGET",

    title:
      item
        ? "Edit Target"
        : "New Target",

    html:

      field(
        "TARGET",
        "mTargetTitle",
        item?.title || "",
        "Gym 5 days this week"
      )

      +

      selectField(
        "TIMEFRAME",
        "mTargetPeriod",
        [
          {
            value: "short",
            label: "Next Few Days"
          },
          {
            value: "week",
            label: "This Week"
          },
          {
            value: "month",
            label: "This Month"
          }
        ],
        item?.period ||
        "week"
      )

      +

      selectField(
        "AREA",
        "mTargetArea",
        [
          "General",
          "Gym",
          "Studies",
          "Coding",
          "Projects",
          "Habits",
          "Communication",
          "Health",
          "Personal"
        ],
        item?.area ||
        "General"
      )

      +

      field(
        "TARGET VALUE — OPTIONAL",
        "mTargetValue",
        item?.targetValue ?? "",
        "5",
        "number"
      )

      +

      field(
        "UNIT — OPTIONAL",
        "mTargetUnit",
        item?.unit || "",
        "days / hours / problems..."
      )

      +

      field(
        "DEADLINE — OPTIONAL",
        "mTargetDeadline",
        item?.deadline || "",
        "",
        "date"
      )

      +

      selectField(
        "STATUS",
        "mTargetStatus",
        [
          "Not Started",
          "Moving",
          "Done",
          "Dropped"
        ],
        item?.status ||
        "Not Started"
      )

      +

      textareaField(
        "WHY DOES THIS MATTER?",
        "mTargetWhy",
        item?.why || "",
        "Why is this target worth your effort?"
      ),


    onSave:
      () => {

        const title =
          $("#mTargetTitle")
            .value
            .trim();


        if (!title) {

          return alert(
            "Target is required."
          );

        }


        const targets =
          loadData(
            JOURNAL_KEYS.targets,
            []
          );


        const data = {

          id:
            item?.id ||
            createId("target"),

          title,

          period:
            $("#mTargetPeriod")
              .value,

          area:
            $("#mTargetArea")
              .value,

          targetValue:
            $("#mTargetValue")
              .value === ""

              ? null

              : Number(
                $("#mTargetValue")
                  .value
              ),

          unit:
            $("#mTargetUnit")
              .value
              .trim(),

          deadline:
            $("#mTargetDeadline")
              .value,

          status:
            $("#mTargetStatus")
              .value,

          why:
            $("#mTargetWhy")
              .value
              .trim(),

          createdAt:
            item?.createdAt ||
            new Date()
              .toISOString(),

          updatedAt:
            new Date()
              .toISOString()

        };


        if (item) {

          const index =
            targets.findIndex(
              (target) =>
                target.id ===
                item.id
            );


          if (
            index >= 0
          ) {

            targets[index] =
              data;

          }

        }

        else {

          targets.unshift(
            data
          );

        }


        saveData(
          JOURNAL_KEYS.targets,
          targets
        );


        closeModal();

        renderTargets();

        renderTargetReality();

        renderStoryTimeline();

      },


    onDelete:
      item

        ? () => {

          if (
            !confirm(
              "Delete this target?"
            )
          ) {
            return;
          }


          saveData(
            JOURNAL_KEYS.targets,

            loadData(
              JOURNAL_KEYS.targets,
              []
            )
              .filter(
                (target) =>
                  target.id !==
                  item.id
              )
          );


          closeModal();

          renderTargets();

          renderTargetReality();

          renderStoryTimeline();

        }

        : null

  });

}


$("#addTargetButton")
  ?.addEventListener(
    "click",
    () =>
      targetModal()
  );


function targetHTML(
  target
) {

  const completed =
    target.status === "Done";


  return `

    <div
      class="target-item
      ${completed ? "completed" : ""}"
    >

      <div>

        <div class="target-title">

          ${escapeHTML(
            target.title
          )}

        </div>


        <span class="target-meta">

          ${escapeHTML(
            target.area
          )}

          ·

          ${escapeHTML(
            target.status
          )}

          ${
            target.targetValue !== null &&
            target.targetValue !== undefined

              ? ` · ${escapeHTML(
                target.targetValue
              )} ${escapeHTML(
                target.unit || ""
              )}`

              : ""
          }

        </span>

      </div>


      <div class="target-actions">

        ${
          target.status !== "Done"

            ? `

              <button
                data-complete-target="${target.id}"
                type="button"
              >
                DONE
              </button>

            `

            : ""
        }


        <button
          data-edit-target="${target.id}"
          type="button"
        >
          EDIT
        </button>

      </div>

    </div>

  `;

}


function renderTargets() {

  const targets =
    loadData(
      JOURNAL_KEYS.targets,
      []
    );


  const groups = {

    short:
      $("#shortTargetList"),

    week:
      $("#weeklyTargetList"),

    month:
      $("#monthlyTargetList")

  };


  Object.entries(
    groups
  )
    .forEach(
      ([
        period,
        container
      ]) => {

        const items =
          targets.filter(
            (target) =>
              target.period ===
              period
          );


        container.innerHTML =
          items.length

            ? items
              .map(
                targetHTML
              )
              .join("")

            : `

              <div class="mini-target-empty">

                Nothing here yet.

              </div>

            `;

      }
    );

}


$(".target-world")
  ?.addEventListener(
    "click",
    (event) => {

      const edit =
        event.target.closest(
          "[data-edit-target]"
        );


      const complete =
        event.target.closest(
          "[data-complete-target]"
        );


      if (edit) {

        const target =
          loadData(
            JOURNAL_KEYS.targets,
            []
          )
            .find(
              (item) =>
                item.id ===
                edit.dataset
                  .editTarget
            );


        if (target) {

          targetModal(
            target
          );

        }

      }


      if (complete) {

        const targets =
          loadData(
            JOURNAL_KEYS.targets,
            []
          );


        const target =
          targets.find(
            (item) =>
              item.id ===
              complete.dataset
                .completeTarget
          );


        if (!target) {
          return;
        }


        target.status =
          "Done";


        target.completedAt =
          new Date()
            .toISOString();


        target.updatedAt =
          new Date()
            .toISOString();


        saveData(
          JOURNAL_KEYS.targets,
          targets
        );


        renderTargets();

        renderTargetReality();

        renderStoryTimeline();

      }

    }
  );


/* =========================================================
   FUTURE SELF / 90 DAYS
========================================================= */

function renderFutureDirection() {

  const data =
    loadData(
      JOURNAL_KEYS.future,
      {}
    );


  $("#ninetyDayDirection")
    .value =
      data.direction || "";


  $("#futureSkills")
    .value =
      data.skills || "";


  $("#futureHabits")
    .value =
      data.habits || "";


  $("#futureLeaveBehind")
    .value =
      data.leaveBehind || "";

}


function saveFutureDirection() {

  saveData(
    JOURNAL_KEYS.future,
    {

      direction:
        $("#ninetyDayDirection")
          .value,

      skills:
        $("#futureSkills")
          .value,

      habits:
        $("#futureHabits")
          .value,

      leaveBehind:
        $("#futureLeaveBehind")
          .value,

      updatedAt:
        new Date()
          .toISOString()

    }
  );

}


[
  "#ninetyDayDirection",
  "#futureSkills",
  "#futureHabits",
  "#futureLeaveBehind"
]
  .forEach(
    (selector) => {

      $(selector)
        ?.addEventListener(
          "input",
          debounce(
            saveFutureDirection
          )
        );

    }
  );


/* =========================================================
   EXTERNAL GROWTH MAP ANALYTICS
========================================================= */

function getItemDate(
  item
) {

  return (
    item.date ||
    item.sessionDate ||
    item.completedAt ||
    item.updatedAt ||
    item.createdAt ||
    item.day ||
    ""
  );

}


function getStudyMinutesThisWeek() {

  const sessions =
    loadData(
      EXTERNAL_KEYS.studies,
      []
    );


  return sessions.reduce(
    (
      total,
      session
    ) => {

      if (
        !isThisWeek(
          getItemDate(session)
        )
      ) {

        return total;

      }


      const minutes =

        Number(
          session.minutes
        )

        ||

        Number(
          session.durationMinutes
        )

        ||

        Number(
          session.duration
        )

        ||

        0;


      return total +
        minutes;

    },
    0
  );

}


function getCodingSolvedThisWeek() {

  const problems =
    loadData(
      EXTERNAL_KEYS.coding,
      []
    );


  return problems.filter(
    (problem) => {

      const status =
        String(
          problem.status ||
          ""
        )
          .toLowerCase();


      const solved =
        problem.solved === true ||

        [
          "done",
          "solved",
          "completed"
        ]
          .includes(status);


      return (
        solved &&
        isThisWeek(
          problem.completedAt ||
          problem.solvedAt ||
          problem.updatedAt ||
          problem.date ||
          problem.createdAt
        )
      );

    }
  ).length;

}


function getProjectHoursThisWeek() {

  const logs =
    loadData(
      EXTERNAL_KEYS.projectLogs,
      []
    );


  return logs.reduce(
    (
      total,
      log
    ) => {

      if (
        !isThisWeek(
          log.date ||
          log.createdAt
        )
      ) {

        return total;

      }


      return total +
        (
          Number(
            log.hours
          ) ||
          0
        );

    },
    0
  );

}


function countJournalDaysThisMonth() {

  const journal =
    loadData(
      EXTERNAL_KEYS.dailyJournal,
      {}
    );


  if (
    Array.isArray(journal)
  ) {

    const unique =
      new Set();


    journal.forEach(
      (entry) => {

        const date =
          getItemDate(entry);


        if (
          isThisMonth(date)
        ) {

          unique.add(
            localDateKey(
              parseDate(date)
            )
          );

        }

      }
    );


    return unique.size;

  }


  if (
    journal &&
    typeof journal === "object"
  ) {

    return Object.keys(
      journal
    )
      .filter(
        (key) =>
          /^\d{4}-\d{2}-\d{2}$/
            .test(key) &&
          isThisMonth(key)
      )
      .length;

  }


  return 0;

}


/* =========================================================
   TARGET VS REALITY
========================================================= */

function findWeeklyTarget(
  area
) {

  const targets =
    loadData(
      JOURNAL_KEYS.targets,
      []
    );


  return targets

    .filter(
      (target) =>
        target.period === "week" &&
        target.area.toLowerCase() ===
        area.toLowerCase() &&
        target.targetValue !== null
    )

    .at(0);

}


function formatReality(
  actual,
  target,
  unit = ""
) {

  if (
    target === null ||
    target === undefined
  ) {

    return `${actual}${unit ? ` ${unit}` : ""}`;
  }


  return `${actual} / ${target}${unit ? ` ${unit}` : ""}`;

}


function renderTargetReality() {

  const studyMinutes =
    getStudyMinutesThisWeek();


  const studyHours =
    Number(
      (
        studyMinutes / 60
      )
        .toFixed(1)
    );


  const coding =
    getCodingSolvedThisWeek();


  const projectHours =
    Number(
      getProjectHoursThisWeek()
        .toFixed(1)
    );


  const gymTarget =
    findWeeklyTarget(
      "Gym"
    );


  const studyTarget =
    findWeeklyTarget(
      "Studies"
    );


  const codingTarget =
    findWeeklyTarget(
      "Coding"
    );


  const projectTarget =
    findWeeklyTarget(
      "Projects"
    );


  $("#gymReality")
    .textContent =
      gymTarget

        ? `— / ${gymTarget.targetValue} ${gymTarget.unit || ""}`

        : "Set a target";


  $("#studyReality")
    .textContent =
      formatReality(
        studyHours,
        studyTarget?.targetValue,
        studyTarget?.unit ||
        "h"
      );


  $("#codingReality")
    .textContent =
      formatReality(
        coding,
        codingTarget?.targetValue,
        codingTarget?.unit ||
        "problems"
      );


  $("#projectsReality")
    .textContent =
      formatReality(
        projectHours,
        projectTarget?.targetValue,
        projectTarget?.unit ||
        "h"
      );


  $("#weekStudy")
    .textContent =
      `${studyHours}h`;


  $("#weekCoding")
    .textContent =
      coding;


  $("#weekProjects")
    .textContent =
      `${projectHours}h`;


  $("#journalDays")
    .textContent =
      countJournalDaysThisMonth();

}


/* =========================================================
   REALITY REFLECTION
========================================================= */

function renderRealityReflection() {

  const all =
    loadData(
      JOURNAL_KEYS.reality,
      {}
    );


  const current =
    all[
      getWeekKey()
    ] ||
    {};


  $("#missedReason")
    .value =
      current.missedReason ||
      "";


  $("#changeNext")
    .value =
      current.changeNext ||
      "";

}


function saveRealityReflection() {

  const all =
    loadData(
      JOURNAL_KEYS.reality,
      {}
    );


  all[
    getWeekKey()
  ] = {

    missedReason:
      $("#missedReason")
        .value,

    changeNext:
      $("#changeNext")
        .value,

    updatedAt:
      new Date()
        .toISOString()

  };


  saveData(
    JOURNAL_KEYS.reality,
    all
  );

}


$("#missedReason")
  ?.addEventListener(
    "input",
    debounce(
      saveRealityReflection
    )
  );


$("#changeNext")
  ?.addEventListener(
    "input",
    debounce(
      saveRealityReflection
    )
  );


/* =========================================================
   WEEKLY REVIEW
========================================================= */

function renderWeeklyReview() {

  const reviews =
    loadData(
      JOURNAL_KEYS.weekly,
      {}
    );


  const current =
    reviews[
      getWeekKey()
    ] ||
    {};


  $$(
    "[data-weekly-field]"
  )
    .forEach(
      (textarea) => {

        textarea.value =
          current[
            textarea.dataset
              .weeklyField
          ] ||
          "";

      }
    );

}


function saveWeeklyReview() {

  const reviews =
    loadData(
      JOURNAL_KEYS.weekly,
      {}
    );


  const data =
    {};


  $$(
    "[data-weekly-field]"
  )
    .forEach(
      (textarea) => {

        data[
          textarea.dataset
            .weeklyField
        ] =
          textarea.value;

      }
    );


  data.updatedAt =
    new Date()
      .toISOString();


  reviews[
    getWeekKey()
  ] =
    data;


  saveData(
    JOURNAL_KEYS.weekly,
    reviews
  );

}


$$(
  "[data-weekly-field]"
)
  .forEach(
    (textarea) => {

      textarea.addEventListener(
        "input",
        debounce(
          saveWeeklyReview
        )
      );

    }
  );


/* =========================================================
   CONSISTENCY BOARD
========================================================= */

function percentageFromTarget(
  actual,
  target
) {

  if (
    !target ||
    target <= 0
  ) {

    return 0;

  }


  return clamp(
    (
      actual /
      target
    ) *
    100
  );

}


function setConsistency(
  textId,
  barId,
  percent
) {

  const safe =
    Math.round(
      clamp(percent)
    );


  $(textId)
    .textContent =
      `${safe}%`;


  $(barId)
    .style.width =
      `${safe}%`;

}


function renderConsistency() {

  const studyHours =
    getStudyMinutesThisWeek() /
    60;


  const coding =
    getCodingSolvedThisWeek();


  const projects =
    getProjectHoursThisWeek();


  const studyTarget =
    findWeeklyTarget(
      "Studies"
    )?.targetValue;


  const codingTarget =
    findWeeklyTarget(
      "Coding"
    )?.targetValue;


  const projectTarget =
    findWeeklyTarget(
      "Projects"
    )?.targetValue;


  const studyScore =
    percentageFromTarget(
      studyHours,
      studyTarget
    );


  const codingScore =
    percentageFromTarget(
      coding,
      codingTarget
    );


  const projectScore =
    percentageFromTarget(
      projects,
      projectTarget
    );


  /*
    Gym / Habits / Communication tracker structures may vary.
    Until their exact metric structure is connected,
    they remain 0 rather than inventing data.
  */

  const healthScore =
    0;


  const habitScore =
    0;


  const communicationScore =
    0;


  setConsistency(
    "#healthConsistency",
    "#healthConsistencyBar",
    healthScore
  );


  setConsistency(
    "#studyConsistency",
    "#studyConsistencyBar",
    studyScore
  );


  setConsistency(
    "#codingConsistency",
    "#codingConsistencyBar",
    codingScore
  );


  setConsistency(
    "#projectConsistency",
    "#projectConsistencyBar",
    projectScore
  );


  setConsistency(
    "#habitConsistency",
    "#habitConsistencyBar",
    habitScore
  );


  setConsistency(
    "#communicationConsistency",
    "#communicationConsistencyBar",
    communicationScore
  );


  const available =
    [
      studyScore,
      codingScore,
      projectScore
    ]
      .filter(
        (value) =>
          value > 0
      );


  const average =
    available.length

      ? available.reduce(
        (
          sum,
          value
        ) =>
          sum + value,
        0
      ) /
      available.length

      : 0;


  $("#weekConsistency")
    .textContent =
      available.length
        ? `${Math.round(average)}%`
        : "—";

}


/* =========================================================
   MONTHLY REVIEW
========================================================= */

function renderMonthlyReview() {

  const reviews =
    loadData(
      JOURNAL_KEYS.monthly,
      {}
    );


  const current =
    reviews[
      monthKey()
    ] ||
    {};


  $("#monthTitle")
    .value =
      current.title ||
      "";


  $("#monthSentence")
    .value =
      current.sentence ||
      "";


  $$(
    "[data-monthly-field]"
  )
    .forEach(
      (field) => {

        field.value =
          current[
            field.dataset
              .monthlyField
          ] ||
          "";

      }
    );

}


function saveMonthlyReview() {

  const reviews =
    loadData(
      JOURNAL_KEYS.monthly,
      {}
    );


  const data = {

    title:
      $("#monthTitle")
        .value,

    sentence:
      $("#monthSentence")
        .value,

    updatedAt:
      new Date()
        .toISOString()

  };


  $$(
    "[data-monthly-field]"
  )
    .forEach(
      (field) => {

        data[
          field.dataset
            .monthlyField
        ] =
          field.value;

      }
    );


  reviews[
    monthKey()
  ] =
    data;


  saveData(
    JOURNAL_KEYS.monthly,
    reviews
  );

}


[
  "#monthTitle",
  "#monthSentence"
]
  .forEach(
    (selector) => {

      $(selector)
        ?.addEventListener(
          "input",
          debounce(
            saveMonthlyReview
          )
        );

    }
  );


$$(
  "[data-monthly-field]"
)
  .forEach(
    (field) => {

      field.addEventListener(
        "input",
        debounce(
          saveMonthlyReview
        )
      );

    }
  );


/* =========================================================
   LIFE BALANCE
========================================================= */

function renderLifeBalance() {

  const all =
    loadData(
      JOURNAL_KEYS.lifeBalance,
      {}
    );


  const current =
    all[
      monthKey()
    ] ||
    {};


  $$(".life-rating")
    .forEach(
      (card) => {

        const area =
          card.dataset.area;


        const input =
          card.querySelector(
            "input"
          );


        const output =
          card.querySelector(
            "strong"
          );


        const value =
          current[area] ||
          5;


        input.value =
          value;


        output.textContent =
          value;


        input.oninput =
          () => {

            output.textContent =
              input.value;


            const latest =
              loadData(
                JOURNAL_KEYS.lifeBalance,
                {}
              );


            latest[
              monthKey()
            ] =
              latest[
                monthKey()
              ] ||
              {};


            latest[
              monthKey()
            ][area] =
              Number(
                input.value
              );


            saveData(
              JOURNAL_KEYS.lifeBalance,
              latest
            );

          };

      }
    );

}


/* =========================================================
   MEDIA UNIVERSE
========================================================= */

let activeMediaFilter =
  "all";


function mediaModal(
  item = null
) {

  openModal({

    kicker:
      item
        ? "EDIT"
        : "ADD",

    title:
      item
        ? "Edit Media"
        : "Add to Media Universe",

    html:

      field(
        "TITLE",
        "mMediaTitle",
        item?.title || "",
        "Interstellar / Deep Work / Monster..."
      )

      +

      selectField(
        "TYPE",
        "mMediaType",
        [
          "Book",
          "Movie",
          "Series",
          "Anime",
          "Documentary",
          "Podcast"
        ],
        item?.type ||
        "Book"
      )

      +

      selectField(
        "STATUS",
        "mMediaStatus",
        [
          "Want",
          "Reading",
          "Watching",
          "Finished",
          "Dropped",
          "Rewatch",
          "Reread"
        ],
        item?.status ||
        "Want"
      )

      +

      selectField(
        "PRIORITY",
        "mMediaPriority",
        [
          "Low",
          "Medium",
          "High"
        ],
        item?.priority ||
        "Medium"
      )

      +

      field(
        "RATING / 10 — OPTIONAL",
        "mMediaRating",
        item?.rating ?? "",
        "9",
        "number"
      )

      +

      textareaField(
        "WHY DO I WANT THIS?",
        "mMediaWhy",
        item?.why || "",
        "Why should this be worth your time?"
      )

      +

      textareaField(
        "WHAT STAYED WITH ME?",
        "mMediaReflection",
        item?.reflection || "",
        "Favorite idea, scene, lesson, character..."
      )

      +

      textareaField(
        "LESSON / TAKEAWAY",
        "mMediaLesson",
        item?.lesson || "",
        "What did this change in the way you think?"
      ),


    onSave:
      () => {

        const title =
          $("#mMediaTitle")
            .value
            .trim();


        if (!title) {

          return alert(
            "Title is required."
          );

        }


        const media =
          loadData(
            JOURNAL_KEYS.media,
            []
          );


        const data = {

          id:
            item?.id ||
            createId("media"),

          title,

          type:
            $("#mMediaType")
              .value,

          status:
            $("#mMediaStatus")
              .value,

          priority:
            $("#mMediaPriority")
              .value,

          rating:
            $("#mMediaRating")
              .value === ""

              ? null

              : clamp(
                $("#mMediaRating")
                  .value,
                0,
                10
              ),

          why:
            $("#mMediaWhy")
              .value
              .trim(),

          reflection:
            $("#mMediaReflection")
              .value
              .trim(),

          lesson:
            $("#mMediaLesson")
              .value
              .trim(),

          createdAt:
            item?.createdAt ||
            new Date()
              .toISOString(),

          updatedAt:
            new Date()
              .toISOString(),

          finishedAt:
            $("#mMediaStatus")
              .value ===
              "Finished"

              ? (
                item?.finishedAt ||
                new Date()
                  .toISOString()
              )

              : null

        };


        if (item) {

          const index =
            media.findIndex(
              (entry) =>
                entry.id ===
                item.id
            );


          if (
            index >= 0
          ) {

            media[index] =
              data;

          }

        }

        else {

          media.unshift(
            data
          );

        }


        saveData(
          JOURNAL_KEYS.media,
          media
        );


        closeModal();

        renderMedia();

        renderStoryTimeline();

      },


    onDelete:
      item

        ? () => {

          if (
            !confirm(
              "Remove this from your Media Universe?"
            )
          ) {
            return;
          }


          saveData(
            JOURNAL_KEYS.media,

            loadData(
              JOURNAL_KEYS.media,
              []
            )
              .filter(
                (entry) =>
                  entry.id !==
                  item.id
              )
          );


          closeModal();

          renderMedia();

          renderStoryTimeline();

        }

        : null

  });

}


$("#addMediaButton")
  ?.addEventListener(
    "click",
    () =>
      mediaModal()
  );


$$(".media-filter")
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          activeMediaFilter =
            button.dataset
              .mediaFilter;


          $$(".media-filter")
            .forEach(
              (item) =>
                item.classList.toggle(
                  "active",
                  item === button
                )
            );


          renderMedia();

        }
      );

    }
  );


function renderMedia() {

  let media =
    loadData(
      JOURNAL_KEYS.media,
      []
    );


  if (
    activeMediaFilter !==
    "all"
  ) {

    media =
      media.filter(
        (item) =>
          item.type ===
          activeMediaFilter
      );

  }


  const grid =
    $("#mediaGrid");


  if (!media.length) {

    grid.innerHTML = `

      <div class="empty-state">

        Books, movies, series and anime you want to experience will appear here.

      </div>

    `;

    return;

  }


  grid.innerHTML =
    media

      .map(
        (item) => `

          <article class="media-card">

            <span class="media-type">

              ${escapeHTML(
                item.type
              )}

            </span>


            <h3>

              ${escapeHTML(
                item.title
              )}

            </h3>


            <span class="media-status">

              ${escapeHTML(
                item.status
              )}

              ${
                item.rating !== null &&
                item.rating !== undefined

                  ? ` · ${item.rating}/10`

                  : ""
              }

            </span>


            <p>

              ${escapeHTML(
                item.reflection ||
                item.why ||
                "Nothing written yet."
              )}

            </p>


            ${
              item.lesson

                ? `

                  <p>

                    <strong>
                      TAKEAWAY
                    </strong>

                    <br>

                    ${escapeHTML(
                      item.lesson
                    )}

                  </p>

                `

                : ""
            }


            <div class="card-actions">

              <button
                data-edit-media="${item.id}"
                type="button"
              >
                OPEN / EDIT
              </button>

            </div>

          </article>

        `
      )
      .join("");

}


$("#mediaGrid")
  ?.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          "[data-edit-media]"
        );


      if (!button) {
        return;
      }


      const item =
        loadData(
          JOURNAL_KEYS.media,
          []
        )
          .find(
            (entry) =>
              entry.id ===
              button.dataset
                .editMedia
          );


      if (item) {

        mediaModal(
          item
        );

      }

    }
  );


/* =========================================================
   CURIOSITY / SOMEDAY
========================================================= */

function curiosityModal(
  item = null
) {

  openModal({

    kicker:
      item
        ? "EDIT"
        : "SOMEDAY",

    title:
      item
        ? "Edit Someday Item"
        : "Something I Want to Experience",

    html:

      field(
        "WHAT?",
        "mCuriosityTitle",
        item?.title || "",
        "Learn guitar / Visit Ladakh / Build an AI assistant..."
      )

      +

      selectField(
        "CATEGORY",
        "mCuriosityType",
        [
          "Learn",
          "Visit",
          "Build",
          "Try",
          "Experience"
        ],
        item?.type ||
        "Learn"
      )

      +

      textareaField(
        "WHY?",
        "mCuriosityWhy",
        item?.why || "",
        "Why does this interest you?"
      )

      +

      selectField(
        "STATUS",
        "mCuriosityStatus",
        [
          "Someday",
          "Soon",
          "Doing",
          "Done"
        ],
        item?.status ||
        "Someday"
      ),


    onSave:
      () => {

        const title =
          $("#mCuriosityTitle")
            .value
            .trim();


        if (!title) {

          return alert(
            "Write what you want to do."
          );

        }


        const items =
          loadData(
            JOURNAL_KEYS.curiosity,
            []
          );


        const data = {

          id:
            item?.id ||
            createId("curiosity"),

          title,

          type:
            $("#mCuriosityType")
              .value,

          why:
            $("#mCuriosityWhy")
              .value
              .trim(),

          status:
            $("#mCuriosityStatus")
              .value,

          createdAt:
            item?.createdAt ||
            new Date()
              .toISOString(),

          updatedAt:
            new Date()
              .toISOString()

        };


        if (item) {

          const index =
            items.findIndex(
              (entry) =>
                entry.id ===
                item.id
            );


          if (
            index >= 0
          ) {

            items[index] =
              data;

          }

        }

        else {

          items.unshift(
            data
          );

        }


        saveData(
          JOURNAL_KEYS.curiosity,
          items
        );


        closeModal();

        renderCuriosity();

      },


    onDelete:
      item

        ? () => {

          if (
            !confirm(
              "Delete this someday item?"
            )
          ) {
            return;
          }


          saveData(
            JOURNAL_KEYS.curiosity,

            loadData(
              JOURNAL_KEYS.curiosity,
              []
            )
              .filter(
                (entry) =>
                  entry.id !==
                  item.id
              )
          );


          closeModal();

          renderCuriosity();

        }

        : null

  });

}


$("#addCuriosityButton")
  ?.addEventListener(
    "click",
    () =>
      curiosityModal()
  );


function renderCuriosity() {

  const items =
    loadData(
      JOURNAL_KEYS.curiosity,
      []
    );


  const containers = {

    Learn:
      $("#learnCuriosityList"),

    Visit:
      $("#visitCuriosityList"),

    Build:
      $("#buildCuriosityList"),

    Try:
      $("#tryCuriosityList"),

    Experience:
      $("#experienceCuriosityList")

  };


  Object.entries(
    containers
  )
    .forEach(
      ([
        type,
        container
      ]) => {

        const list =
          items.filter(
            (item) =>
              item.type === type
          );


        container.innerHTML =
          list.length

            ? list
              .map(
                (item) => `

                  <div
                    class="curiosity-item"
                    data-curiosity-id="${item.id}"
                  >

                    <strong>

                      ${escapeHTML(
                        item.title
                      )}

                    </strong>

                    <br>

                    <small>

                      ${escapeHTML(
                        item.status
                      )}

                    </small>

                  </div>

                `
              )
              .join("")

            : `

              <div class="mini-target-empty">
                —
              </div>

            `;

      }
    );

}


$(".curiosity-columns")
  ?.addEventListener(
    "click",
    (event) => {

      const card =
        event.target.closest(
          "[data-curiosity-id]"
        );


      if (!card) {
        return;
      }


      const item =
        loadData(
          JOURNAL_KEYS.curiosity,
          []
        )
          .find(
            (entry) =>
              entry.id ===
              card.dataset
                .curiosityId
          );


      if (item) {

        curiosityModal(
          item
        );

      }

    }
  );


/* =========================================================
   LETTERS
========================================================= */

function letterModal(
  item = null,
  template = "Future Me"
) {

  openModal({

    kicker:
      item
        ? "EDIT"
        : "LETTER",

    title:
      item
        ? "Edit Letter"
        : `Letter to ${template}`,

    html:

      selectField(
        "LETTER TYPE",
        "mLetterType",
        [
          "Future Me",
          "Younger Me",
          "Unsent",
          "Someone Important",
          "Myself Today"
        ],
        item?.type ||
        template
      )

      +

      field(
        "TITLE",
        "mLetterTitle",
        item?.title || "",
        "Read this when..."
      )

      +

      textareaField(
        "LETTER",
        "mLetterText",
        item?.text || "",
        "Write what you need to say..."
      )

      +

      field(
        "OPEN ON — OPTIONAL",
        "mLetterOpenDate",
        item?.openDate || "",
        "",
        "date"
      ),


    onSave:
      () => {

        const text =
          $("#mLetterText")
            .value
            .trim();


        if (!text) {

          return alert(
            "Write your letter first."
          );

        }


        const letters =
          loadData(
            JOURNAL_KEYS.letters,
            []
          );


        const data = {

          id:
            item?.id ||
            createId("letter"),

          type:
            $("#mLetterType")
              .value,

          title:
            $("#mLetterTitle")
              .value
              .trim(),

          text,

          openDate:
            $("#mLetterOpenDate")
              .value,

          createdAt:
            item?.createdAt ||
            new Date()
              .toISOString(),

          updatedAt:
            new Date()
              .toISOString()

        };


        if (item) {

          const index =
            letters.findIndex(
              (letter) =>
                letter.id ===
                item.id
            );


          if (
            index >= 0
          ) {

            letters[index] =
              data;

          }

        }

        else {

          letters.unshift(
            data
          );

        }


        saveData(
          JOURNAL_KEYS.letters,
          letters
        );


        closeModal();

        renderLetters();

        renderStoryTimeline();

      },


    onDelete:
      item

        ? () => {

          if (
            !confirm(
              "Delete this letter?"
            )
          ) {
            return;
          }


          saveData(
            JOURNAL_KEYS.letters,

            loadData(
              JOURNAL_KEYS.letters,
              []
            )
              .filter(
                (letter) =>
                  letter.id !==
                  item.id
              )
          );


          closeModal();

          renderLetters();

          renderStoryTimeline();

        }

        : null

  });

}


$("#addLetterButton")
  ?.addEventListener(
    "click",
    () =>
      letterModal()
  );


$$(".letter-template")
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () =>
          letterModal(
            null,
            button.dataset
              .letterTemplate
          )
      );

    }
  );


function renderLetters() {

  const letters =
    loadData(
      JOURNAL_KEYS.letters,
      []
    );


  const list =
    $("#savedLetterList");


  if (!letters.length) {

    list.innerHTML =
      "";

    return;

  }


  list.innerHTML =
    letters

      .map(
        (letter) => `

          <article
            class="saved-letter-card"
          >

            <span
              style="
                color:var(--orange-bright);
                font-size:8px;
                font-weight:700;
              "
            >

              ${escapeHTML(
                letter.type
              )}

            </span>


            <h3
              style="
                margin-top:7px;
                font-family:'Playfair Display', serif;
              "
            >

              ${escapeHTML(
                letter.title ||
                `Letter to ${letter.type}`
              )}

            </h3>


            <p
              style="
                margin-top:8px;
                color:var(--text-soft);
                font-size:11px;
                line-height:1.6;
              "
            >

              ${escapeHTML(
                letter.text.length > 180

                  ? `${letter.text.slice(
                    0,
                    180
                  )}...`

                  : letter.text
              )}

            </p>


            ${
              letter.openDate

                ? `

                  <small
                    style="
                      display:block;
                      margin-top:10px;
                      color:var(--text-faint);
                    "
                  >

                    OPEN ON
                    ${prettyDate(
                      letter.openDate
                    )}

                  </small>

                `

                : ""
            }


            <div class="card-actions">

              <button
                data-edit-letter="${letter.id}"
                type="button"
              >
                OPEN / EDIT
              </button>

            </div>

          </article>

        `
      )
      .join("");

}


$("#savedLetterList")
  ?.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          "[data-edit-letter]"
        );


      if (!button) {
        return;
      }


      const letter =
        loadData(
          JOURNAL_KEYS.letters,
          []
        )
          .find(
            (item) =>
              item.id ===
              button.dataset
                .editLetter
          );


      if (letter) {

        letterModal(
          letter
        );

      }

    }
  );


/* =========================================================
   HARD TRUTHS
========================================================= */

function renderHardTruths() {

  const data =
    loadData(
      JOURNAL_KEYS.hardTruths,
      {}
    );


  $("#hardTruths")
    .value =
      data.truths || "";


  $("#repeatedExcuses")
    .value =
      data.excuses || "";


  $("#needToAccept")
    .value =
      data.accept || "";


  $("#needToLetGo")
    .value =
      data.letGo || "";

}


function saveHardTruths() {

  saveData(
    JOURNAL_KEYS.hardTruths,
    {

      truths:
        $("#hardTruths")
          .value,

      excuses:
        $("#repeatedExcuses")
          .value,

      accept:
        $("#needToAccept")
          .value,

      letGo:
        $("#needToLetGo")
          .value,

      updatedAt:
        new Date()
          .toISOString()

    }
  );

}


[
  "#hardTruths",
  "#repeatedExcuses",
  "#needToAccept",
  "#needToLetGo"
]
  .forEach(
    (selector) => {

      $(selector)
        ?.addEventListener(
          "input",
          debounce(
            saveHardTruths
          )
        );

    }
  );


/* =========================================================
   QUESTION BANK
========================================================= */

function questionModal(
  item = null
) {

  openModal({

    kicker:
      item
        ? "EDIT"
        : "QUESTION",

    title:
      item
        ? "Edit Question"
        : "A Question Worth Keeping",

    html:

      textareaField(
        "QUESTION",
        "mQuestionText",
        item?.question || "",
        "What question do you want to return to?"
      )

      +

      textareaField(
        "CURRENT ANSWER — OPTIONAL",
        "mQuestionAnswer",
        item?.answer || "",
        "What is your answer right now?"
      ),


    onSave:
      () => {

        const question =
          $("#mQuestionText")
            .value
            .trim();


        if (!question) {

          return alert(
            "Question is required."
          );

        }


        const items =
          loadData(
            JOURNAL_KEYS.questions,
            []
          );


        const data = {

          id:
            item?.id ||
            createId("question"),

          question,

          answer:
            $("#mQuestionAnswer")
              .value
              .trim(),

          createdAt:
            item?.createdAt ||
            new Date()
              .toISOString(),

          updatedAt:
            new Date()
              .toISOString()

        };


        if (item) {

          const index =
            items.findIndex(
              (entry) =>
                entry.id ===
                item.id
            );


          if (
            index >= 0
          ) {

            items[index] =
              data;

          }

        }

        else {

          items.unshift(
            data
          );

        }


        saveData(
          JOURNAL_KEYS.questions,
          items
        );


        closeModal();

        renderQuestions();

      },


    onDelete:
      item

        ? () => {

          if (
            !confirm(
              "Delete this question?"
            )
          ) {
            return;
          }


          saveData(
            JOURNAL_KEYS.questions,

            loadData(
              JOURNAL_KEYS.questions,
              []
            )
              .filter(
                (entry) =>
                  entry.id !==
                  item.id
              )
          );


          closeModal();

          renderQuestions();

        }

        : null

  });

}


$("#addQuestionButton")
  ?.addEventListener(
    "click",
    () =>
      questionModal()
  );


const DEFAULT_QUESTIONS = [

  "What kind of person am I becoming?",

  "What do I want only because other people value it?",

  "What would I do if nobody could see the result?",

  "Which part of my life looks good but does not feel good?"

];


function renderQuestions() {

  const custom =
    loadData(
      JOURNAL_KEYS.questions,
      []
    );


  const defaults =
    DEFAULT_QUESTIONS
      .map(
        (
          question,
          index
        ) => ({

          id:
            `default-${index}`,

          question,

          answer:
            "",

          default:
            true

        })
      );


  const items = [
    ...defaults,
    ...custom
  ];


  $("#questionGrid")
    .innerHTML =
      items

        .map(
          (
            item,
            index
          ) => `

            <article
              class="question-card"
              ${
                item.default
                  ? ""
                  : `data-question-id="${item.id}"`
              }
            >

              <span>

                ${String(
                  index + 1
                ).padStart(
                  2,
                  "0"
                )}

              </span>


              <p>

                ${escapeHTML(
                  item.question
                )}

              </p>


              ${
                item.answer

                  ? `

                    <small
                      style="
                        color:var(--text-soft);
                        line-height:1.5;
                      "
                    >

                      ${escapeHTML(
                        item.answer
                      )}

                    </small>

                  `

                  : ""
              }

            </article>

          `
        )
        .join("");

}


$("#questionGrid")
  ?.addEventListener(
    "click",
    (event) => {

      const card =
        event.target.closest(
          "[data-question-id]"
        );


      if (!card) {
        return;
      }


      const item =
        loadData(
          JOURNAL_KEYS.questions,
          []
        )
          .find(
            (entry) =>
              entry.id ===
              card.dataset
                .questionId
          );


      if (item) {

        questionModal(
          item
        );

      }

    }
  );


/* =========================================================
   ENDING NOTE
========================================================= */

function renderEnding() {

  const data =
    loadData(
      JOURNAL_KEYS.ending,
      {}
    );


  $("#rememberThisVersion")
    .value =
      data.text ||
      "";

}


$("#rememberThisVersion")
  ?.addEventListener(
    "input",
    debounce(
      () => {

        saveData(
          JOURNAL_KEYS.ending,
          {

            text:
              $("#rememberThisVersion")
                .value,

            updatedAt:
              new Date()
                .toISOString()

          }
        );

      }
    )
  );


/* =========================================================
   STORY TIMELINE
========================================================= */

function renderStoryTimeline() {

  const thoughts =
    loadData(
      JOURNAL_KEYS.thoughts,
      []
    );


  const targets =
    loadData(
      JOURNAL_KEYS.targets,
      []
    )
      .filter(
        (target) =>
          target.status === "Done"
      );


  const media =
    loadData(
      JOURNAL_KEYS.media,
      []
    )
      .filter(
        (item) =>
          item.status ===
          "Finished"
      );


  const letters =
    loadData(
      JOURNAL_KEYS.letters,
      []
    );


  const story = [];


  thoughts.forEach(
    (item) => {

      story.push({

        date:
          item.createdAt,

        type:
          item.type,

        title:
          item.title ||
          item.text.slice(
            0,
            80
          ),

        text:
          item.text

      });

    }
  );


  targets.forEach(
    (item) => {

      story.push({

        date:
          item.completedAt ||
          item.updatedAt,

        type:
          "TARGET COMPLETED",

        title:
          item.title,

        text:
          `${item.area} · ${item.period}`

      });

    }
  );


  media.forEach(
    (item) => {

      story.push({

        date:
          item.finishedAt ||
          item.updatedAt,

        type:
          item.type.toUpperCase(),

        title:
          `Finished ${item.title}`,

        text:
          item.lesson ||
          item.reflection ||
          ""

      });

    }
  );


  letters.forEach(
    (item) => {

      story.push({

        date:
          item.createdAt,

        type:
          "LETTER",

        title:
          item.title ||
          `Letter to ${item.type}`,

        text:
          item.text

      });

    }
  );


  story.sort(
    (
      a,
      b
    ) =>
      new Date(
        b.date
      ) -
      new Date(
        a.date
      )
  );


  const timeline =
    $("#storyTimeline");


  if (!story.length) {

    timeline.innerHTML = `

      <div class="empty-state">

        Thoughts, reviews, lessons and memories will slowly build your story here.

      </div>

    `;

    return;

  }


  timeline.innerHTML =
    story
      .slice(
        0,
        40
      )
      .map(
        (item) => `

          <article class="story-item">

            <small>

              ${escapeHTML(
                item.type
              )}

              ·

              ${prettyDate(
                item.date
              )}

            </small>


            <h3>

              ${escapeHTML(
                item.title
              )}

            </h3>


            ${
              item.text

                ? `

                  <p>

                    ${escapeHTML(
                      item.text.length > 230

                        ? `${item.text.slice(
                          0,
                          230
                        )}...`

                        : item.text
                    )}

                  </p>

                `

                : ""
            }

          </article>

        `
      )
      .join("");

}


/* =========================================================
   INITIAL RENDER
========================================================= */

function renderEverything() {

  renderHero();

  renderThoughts();

  renderLessons();

  renderTargets();

  renderFutureDirection();

  renderTargetReality();

  renderRealityReflection();

  renderWeeklyReview();

  renderConsistency();

  renderMonthlyReview();

  renderLifeBalance();

  renderMedia();

  renderCuriosity();

  renderLetters();

  renderHardTruths();

  renderQuestions();

  renderEnding();

  renderStoryTimeline();

}


renderEverything();