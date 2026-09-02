/* =========================================================
   GROWTH MAP — PROJECT OS V2
   This file matches the current V2 projects.html exactly.
========================================================= */

const STORAGE_KEY = "growthMapProjectOSV2";
const LEGACY_KEYS = [
  "growthMapProjectOSV1",
  "growthMapProjectsV5",
  "growthMapProjectsV4",
  "growthMapProjectsV3",
  "growthMapProjectsV2",
  "growthMapProjects"
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

let projects = loadProjects().map(normalizeProject);
let selectedProjectId = projects[0]?.id || null;
let activeModule = "overview";
let editingProjectId = null;
let itemSaveHandler = null;
let commandIndex = 0;
let openedFileId = null;
let draggedTaskId = null;

/* =========================================================
   STORAGE
========================================================= */

function loadProjects() {
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(current) && current.length) return current;
  } catch (_) {}

  for (const key of LEGACY_KEYS) {
    try {
      const legacy = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(legacy) && legacy.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
        return legacy;
      }
    } catch (_) {}
  }

  return [];
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function uid(prefix = "item") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/* =========================================================
   HELPERS
========================================================= */

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function currentProject() {
  return projects.find(project => project.id === selectedProjectId) || null;
}

function statusText(value = "") {
  const map = {
    planning: "PLANNING",
    active: "ACTIVE",
    "on-hold": "ON HOLD",
    shipped: "SHIPPED"
  };

  return map[value] || String(value || "—").toUpperCase();
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).toUpperCase();
}

function formatTimestamp(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function localDateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function safeOpen(url) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

/* =========================================================
   DATA NORMALIZATION / OLD DATA MIGRATION
========================================================= */

function normalizeProject(project) {
  const arrayKeys = [
    "tasks",
    "milestones",
    "resources",
    "files",
    "notes",
    "buildLog",
    "decisions",
    "blockers",
    "timeline"
  ];

  arrayKeys.forEach(key => {
    if (!Array.isArray(project[key])) project[key] = [];
  });

  if (!Array.isArray(project.techStack)) {
    project.techStack = typeof project.techStack === "string"
      ? project.techStack.split(",").map(item => item.trim()).filter(Boolean)
      : [];
  }

  if (!Array.isArray(project.tags)) {
    project.tags = typeof project.tags === "string"
      ? project.tags.split(",").map(item => item.trim()).filter(Boolean)
      : [];
  }

  project.tasks = project.tasks.map(task => {
    const status = task.status || (task.done ? "done" : "backlog");

    return {
      id: task.id || uid("task"),
      title: task.title || "Untitled Task",
      description: task.description || "",
      status,
      priority: task.priority || "Medium",
      due: task.due || task.dueDate || "",
      done: status === "done",
      createdAt: task.createdAt || "",
      updatedAt: task.updatedAt || "",
      completedAt: task.completedAt || ""
    };
  });

  project.milestones = project.milestones.map(item => ({
    id: item.id || uid("milestone"),
    title: item.title || "Untitled Milestone",
    description: item.description || "",
    date: item.date || item.targetDate || "",
    done: Boolean(item.done),
    createdAt: item.createdAt || "",
    completedAt: item.completedAt || ""
  }));

  if (!project.research || typeof project.research !== "object") {
    project.research = {};
  }

  [
    "questions",
    "existingSolutions",
    "competitors",
    "experiments",
    "findings",
    "sources"
  ].forEach(key => {
    if (!Array.isArray(project.research[key])) project.research[key] = [];
  });

  if (!project.deployment || typeof project.deployment !== "object") {
    project.deployment = {};
  }

  project.deployment = {
    environment: "",
    status: "",
    version: "",
    url: "",
    notes: "",
    ...project.deployment
  };

  project.id = project.id || uid("project");
  project.title = project.title || project.name || "Untitled Project";
  project.category = project.category || "";
  project.status = project.status || "planning";
  project.priority = project.priority || "Medium";
  project.startDate = project.startDate || "";
  project.deadline = project.deadline || "";
  project.description = project.description || "";
  project.problem = project.problem || "";
  project.objective = project.objective || "";
  project.github = project.github || "";
  project.demo = project.demo || "";
  project.createdAt = project.createdAt || "";
  project.updatedAt = project.updatedAt || "";

  return project;
}

/* =========================================================
   REAL PROJECT METRICS
========================================================= */

function taskCompletion(project) {
  if (!project.tasks.length) return null;
  const done = project.tasks.filter(task => task.status === "done").length;
  return Math.round((done / project.tasks.length) * 100);
}

function milestoneCompletion(project) {
  if (!project.milestones.length) return null;
  const done = project.milestones.filter(item => item.done).length;
  return Math.round((done / project.milestones.length) * 100);
}

function projectProgress(project) {
  const values = [taskCompletion(project), milestoneCompletion(project)]
    .filter(value => value !== null);

  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function projectHealth(project) {
  const parts = [];

  const taskScore = taskCompletion(project);
  if (taskScore !== null) parts.push({ score: taskScore, weight: 4 });

  const milestoneScore = milestoneCompletion(project);
  if (milestoneScore !== null) parts.push({ score: milestoneScore, weight: 2 });

  if (project.blockers.length) {
    const resolved = project.blockers.filter(item => item.done).length;
    parts.push({
      score: Math.round((resolved / project.blockers.length) * 100),
      weight: 2
    });
  }

  if (project.buildLog.length) {
    const times = project.buildLog
      .map(item => new Date(item.createdAt || 0).getTime())
      .filter(Number.isFinite)
      .sort((a, b) => b - a);

    if (times.length) {
      const days = (Date.now() - times[0]) / 86400000;
      const activityScore =
        days <= 1 ? 100 :
        days <= 3 ? 80 :
        days <= 7 ? 60 :
        days <= 14 ? 35 :
        15;

      parts.push({
        score: activityScore,
        weight: 1
      });
    }
  }

  if (project.deadline) {
    const deadline = new Date(`${project.deadline}T23:59:59`).getTime();

    if (Number.isFinite(deadline)) {
      const overdue =
        deadline < Date.now() &&
        project.status !== "shipped";

      parts.push({
        score: overdue ? 15 : 100,
        weight: 1
      });
    }
  }

  if (!parts.length) return 0;

  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0);
  const weighted = parts.reduce(
    (sum, part) => sum + part.score * part.weight,
    0
  );

  return Math.round(weighted / totalWeight);
}

function researchCount(project) {
  return Object.values(project.research)
    .reduce(
      (total, list) =>
        total + (Array.isArray(list) ? list.length : 0),
      0
    );
}

function healthLabel(score) {
  if (score >= 85) return "STRONG / ON TRACK";
  if (score >= 65) return "HEALTHY";
  if (score >= 40) return "NEEDS ATTENTION";
  if (score > 0) return "BUILD THE FOUNDATION";
  return "NO DATA YET";
}

/* =========================================================
   PROJECT MODAL
========================================================= */

function openProjectModal(projectId = null) {
  editingProjectId = projectId;

  const project = projectId
    ? projects.find(item => item.id === projectId)
    : null;

  $("#projectModalKicker").textContent =
    project ? "EDIT PROJECT" : "NEW PROJECT";

  $("#projectModalTitle").textContent =
    project ? project.title : "Create Project";

  $("#projectModalSave").textContent =
    project ? "SAVE CHANGES" : "CREATE PROJECT";

  $("#projectName").value = project?.title || "";
  $("#projectCategoryInput").value = project?.category || "";
  $("#projectStatus").value = project?.status || "planning";
  $("#projectPriority").value = project?.priority || "Medium";
  $("#projectStartDate").value = project?.startDate || "";
  $("#projectDeadline").value = project?.deadline || "";
  $("#projectTech").value = (project?.techStack || []).join(", ");
  $("#projectTags").value = (project?.tags || []).join(", ");
  $("#projectDescription").value = project?.description || "";
  $("#projectProblem").value = project?.problem || "";
  $("#projectObjective").value = project?.objective || "";
  $("#projectGithub").value = project?.github || "";
  $("#projectDemo").value = project?.demo || "";

  $("#projectModal").classList.add("open");

  setTimeout(() => $("#projectName")?.focus(), 60);
}

function closeProjectModal() {
  $("#projectModal")?.classList.remove("open");
  editingProjectId = null;
}

function saveProjectFromModal() {
  const title = $("#projectName").value.trim();

  if (!title) {
    $("#projectName").focus();
    return;
  }

  const data = {
    title,
    category: $("#projectCategoryInput").value.trim(),
    status: $("#projectStatus").value,
    priority: $("#projectPriority").value,
    startDate: $("#projectStartDate").value,
    deadline: $("#projectDeadline").value,
    techStack: $("#projectTech").value
      .split(",")
      .map(item => item.trim())
      .filter(Boolean),
    tags: $("#projectTags").value
      .split(",")
      .map(item => item.trim())
      .filter(Boolean),
    description: $("#projectDescription").value.trim(),
    problem: $("#projectProblem").value.trim(),
    objective: $("#projectObjective").value.trim(),
    github: $("#projectGithub").value.trim(),
    demo: $("#projectDemo").value.trim()
  };

  if (editingProjectId) {
    const project = projects.find(
      item => item.id === editingProjectId
    );

    if (!project) return;

    Object.assign(project, data, {
      updatedAt: new Date().toISOString()
    });
  } else {
    const project = normalizeProject({
      id: uid("project"),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    projects.unshift(project);
    selectedProjectId = project.id;
    activeModule = "overview";
  }

  saveProjects();
  closeProjectModal();
  renderAll();
}

function deleteCurrentProject() {
  const project = currentProject();
  if (!project) return;

  const ok = window.confirm(
    `Delete project "${project.title}"? This cannot be undone.`
  );

  if (!ok) return;

  projects = projects.filter(
    item => item.id !== project.id
  );

  selectedProjectId =
    projects[0]?.id || null;

  activeModule = "overview";

  closeFileDrawer();
  saveProjects();
  renderAll();
}

/* =========================================================
   ITEM MODAL BUILDERS
========================================================= */

function inputField(
  label,
  id,
  placeholder = "",
  value = "",
  type = "text",
  full = true
) {
  return `
    <label class="form-field ${full ? "full" : ""}">
      <span>${label}</span>

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
  placeholder = "",
  value = ""
) {
  return `
    <label class="form-field full">
      <span>${label}</span>

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
  selected,
  full = false
) {
  return `
    <label class="form-field ${full ? "full" : ""}">
      <span>${label}</span>

      <select id="${id}">

        ${options.map(option => {
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
              ${value === selected ? "selected" : ""}
            >
              ${esc(text)}
            </option>
          `;
        }).join("")}

      </select>
    </label>
  `;
}

function openItemModal({
  kicker = "PROJECT",
  title = "Add Item",
  html = "",
  saveText = "SAVE",
  onSave
}) {
  $("#itemModalKicker").textContent = kicker;
  $("#itemModalTitle").textContent = title;
  $("#itemModalContent").innerHTML = html;
  $("#itemModalSave").textContent = saveText;

  itemSaveHandler = onSave;

  $("#itemModal").classList.add("open");
}

function closeItemModal() {
  $("#itemModal")?.classList.remove("open");
  itemSaveHandler = null;
}

/* =========================================================
   PROJECT RAIL
========================================================= */

function renderProjectRail() {
  const container = $("#projectRail");

  if (!container) return;

  if (!projects.length) {
    container.innerHTML = `
      <span
        style="
          color:rgba(220,235,255,.38);
          font:500 11px 'DM Mono',monospace;
          padding:16px 4px;
        "
      >
        NO PROJECTS YET
      </span>
    `;

    return;
  }

  container.innerHTML = projects.map(project => {
    const progress = projectProgress(project);

    return `
      <button
        class="
          project-rail-card
          ${project.id === selectedProjectId ? "active" : ""}
        "
        data-project-id="${project.id}"
        type="button"
      >
        <small>
          ${statusText(project.status)}
        </small>

        <strong>
          ${esc(project.title)}
        </strong>

        <i
          style="width:${progress}%"
        ></i>
      </button>
    `;
  }).join("");

  $$("[data-project-id]", container)
    .forEach(button => {
      button.addEventListener("click", () => {
        selectedProjectId =
          button.dataset.projectId;

        activeModule =
          "overview";

        closeFileDrawer();
        renderAll();
      });
    });
}

/* =========================================================
   PROJECT STATE / CORE / INTELLIGENCE
========================================================= */

function renderProjectState() {
  const project = currentProject();

  if (!project) return;

  const progress =
    projectProgress(project);

  const health =
    projectHealth(project);

  const completedTasks =
    project.tasks.filter(
      task => task.status === "done"
    ).length;

  const openBlockers =
    project.blockers.filter(
      item => !item.done
    ).length;

  const research =
    researchCount(project);

  const nextTask =
    project.tasks.find(
      task => task.status === "active"
    )
    ||
    project.tasks.find(
      task => task.status === "review"
    )
    ||
    project.tasks.find(
      task => task.status === "backlog"
    );

  const nextMilestone =
    project.milestones.find(
      item => !item.done
    );

  $("#projectCategory").textContent =
    (
      project.category ||
      "PROJECT"
    ).toUpperCase();

  $("#projectTitle").textContent =
    project.title;

  $("#headerProgressText").textContent =
    `${progress}%`;

  $("#headerProgressBar").style.width =
    `${progress}%`;

  $("#coreProjectName").textContent =
    project.title;

  $("#coreProgressValue").textContent =
    `${progress}%`;

  $("#tasksNodeMeta").textContent =
    `${completedTasks} / ${project.tasks.length} DONE`;

  $("#researchNodeMeta").textContent =
    `${research} ITEMS`;

  $("#filesNodeMeta").textContent =
    `${project.files.length} FILES`;

  $("#buildNodeMeta").textContent =
    project.buildLog.length
      ? `${project.buildLog.length} LOGS`
      : "NO ACTIVITY";

  $("#deployNodeMeta").textContent =
    (
      project.deployment.status ||
      "NOT DEPLOYED"
    ).toUpperCase();

  $("#intelDeadline").textContent =
    formatDate(project.deadline);

  $("#intelBlockers").textContent =
    openBlockers;

  $("#intelResearch").textContent =
    research;

  $("#intelFiles").textContent =
    project.files.length;

  $("#projectHealthText").textContent =
    `${health}%`;

  $("#projectHealthLabel").textContent =
    healthLabel(health);

  $("#healthRingText").textContent =
    health;

  $("#healthRing").style.setProperty(
    "--health",
    `${health}%`
  );

  $("#nextAction").textContent =
    nextTask?.title
    ||
    nextMilestone?.title
    ||
    "Define your next move.";

  $("#nextActionMeta").textContent =
    nextTask
      ? `TASK • ${String(nextTask.status).toUpperCase()}`
      : nextMilestone
        ? "UPCOMING MILESTONE"
        : "NO ACTIVE EXECUTION ITEM";

  renderRecentActivity(project);
}

function getRecentActivity(project) {
  const activity = [];

  project.buildLog.forEach(item => {
    activity.push({
      title: item.title,
      type: "BUILD LOG",
      time: item.createdAt
    });
  });

  project.decisions.forEach(item => {
    activity.push({
      title: item.title,
      type: "DECISION",
      time: item.createdAt
    });
  });

  project.timeline.forEach(item => {
    activity.push({
      title: item.title,
      type: "TIMELINE",
      time: item.createdAt
    });
  });

  project.tasks
    .filter(item => item.completedAt)
    .forEach(item => {
      activity.push({
        title: item.title,
        type: "TASK COMPLETED",
        time: item.completedAt
      });
    });

  project.research.findings.forEach(item => {
    activity.push({
      title: item.title,
      type: "RESEARCH FINDING",
      time: item.createdAt
    });
  });

  return activity
    .filter(item => item.time)
    .sort(
      (a, b) =>
        new Date(b.time) -
        new Date(a.time)
    );
}

function renderRecentActivity(project) {
  const container =
    $("#recentContextList");

  const activity =
    getRecentActivity(project)
      .slice(0, 4);

  container.innerHTML =
    activity.length
      ? activity.map(item => `
          <div class="context-event">
            <strong>
              ${esc(item.title || "Untitled")}
            </strong>

            <small>
              ${item.type}
              •
              ${formatTimestamp(item.time)}
            </small>
          </div>
        `).join("")
      : `
          <div class="context-event">
            <strong>
              No activity yet
            </strong>

            <small>
              Start working on this project.
            </small>
          </div>
        `;
}

/* =========================================================
   ANALYTICS — VELOCITY
========================================================= */

function startOfWeek(date) {
  const copy =
    new Date(date);

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

function weeklyVelocity(project) {
  const currentWeek =
    startOfWeek(new Date());

  const data = [];

  for (let i = 7; i >= 0; i--) {
    const start =
      new Date(currentWeek);

    start.setDate(
      start.getDate() -
      i * 7
    );

    const end =
      new Date(start);

    end.setDate(
      end.getDate() +
      7
    );

    const value =
      project.tasks.filter(task => {
        if (!task.completedAt) {
          return false;
        }

        const time =
          new Date(
            task.completedAt
          ).getTime();

        return (
          Number.isFinite(time)
          &&
          time >= start.getTime()
          &&
          time < end.getTime()
        );
      }).length;

    data.push({
      label: `W${8 - i}`,
      value
    });
  }

  return data;
}

function velocitySVG(project) {
  const data =
    weeklyVelocity(project);

  const width =
    660;

  const height =
    195;

  const padX =
    35;

  const padY =
    28;

  const maxValue =
    Math.max(
      1,
      ...data.map(
        item => item.value
      )
    );

  const step =
    (
      width -
      padX * 2
    )
    /
    Math.max(
      1,
      data.length - 1
    );

  const points =
    data.map(
      (item, index) => {
        const x =
          padX +
          index * step;

        const y =
          height -
          padY -
          (
            item.value /
            maxValue
          )
          *
          (
            height -
            padY * 2
          );

        return {
          ...item,
          x,
          y
        };
      }
    );

  const path =
    points
      .map(
        (point, index) =>
          `${index ? "L" : "M"} ${point.x} ${point.y}`
      )
      .join(" ");

  const areaPath =
    `${path} L ${points.at(-1).x} ${height - padY} L ${points[0].x} ${height - padY} Z`;

  return `
    <svg
      class="velocity-chart"
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id="velocityGradient"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop
            offset="0%"
            stop-color="#438dff"
          ></stop>

          <stop
            offset="100%"
            stop-color="#67dfff"
          ></stop>
        </linearGradient>

        <linearGradient
          id="velocityArea"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="#438dff"
            stop-opacity=".24"
          ></stop>

          <stop
            offset="100%"
            stop-color="#438dff"
            stop-opacity="0"
          ></stop>
        </linearGradient>
      </defs>

      ${[0, 1, 2, 3].map(index => {
        const y =
          padY +
          index *
          (
            height -
            padY * 2
          )
          /
          3;

        return `
          <line
            class="velocity-grid-line"
            x1="${padX}"
            x2="${width - padX}"
            y1="${y}"
            y2="${y}"
          ></line>
        `;
      }).join("")}

      <path
        class="velocity-area"
        d="${areaPath}"
      ></path>

      <path
        class="velocity-path"
        d="${path}"
      ></path>

      ${points.map(point => `
        <circle
          class="velocity-point"
          cx="${point.x}"
          cy="${point.y}"
          r="5"
        >
          <title>
            ${point.label}: ${point.value} completed task${point.value === 1 ? "" : "s"}
          </title>
        </circle>

        <text
          class="chart-label"
          x="${point.x}"
          y="${height - 6}"
          text-anchor="middle"
        >
          ${point.label}
        </text>
      `).join("")}

    </svg>
  `;
}

/* =========================================================
   ANALYTICS — ACTIVITY HEATMAP
========================================================= */

function activityCounts(project) {
  const map = {};

  function add(value) {
    if (!value) return;

    const key =
      localDateKey(value);

    if (!key) return;

    map[key] =
      (map[key] || 0) + 1;
  }

  project.buildLog
    .forEach(
      item => add(item.createdAt)
    );

  project.tasks
    .forEach(
      item => add(item.completedAt)
    );

  project.research.findings
    .forEach(
      item => add(item.createdAt)
    );

  project.decisions
    .forEach(
      item => add(item.createdAt)
    );

  return map;
}

function heatmapHTML(project) {
  const counts =
    activityCounts(project);

  const today =
    new Date();

  const cells = [];

  for (let i = 41; i >= 0; i--) {
    const date =
      new Date(today);

    date.setDate(
      date.getDate() -
      i
    );

    const key =
      localDateKey(date);

    const count =
      counts[key] || 0;

    let level = 0;

    if (count >= 1) level = 1;
    if (count >= 2) level = 2;
    if (count >= 4) level = 3;
    if (count >= 6) level = 4;

    cells.push(`
      <span
        class="
          heat-cell
          ${level ? `level-${level}` : ""}
        "
        title="${key}: ${count} activit${count === 1 ? "y" : "ies"}"
      ></span>
    `);
  }

  return `
    <div class="heatmap-shell">
      <div class="heatmap">
        ${cells.join("")}
      </div>
    </div>
  `;
}

/* =========================================================
   OVERVIEW
========================================================= */

function renderOverview() {
  const project =
    currentProject();

  const progress =
    projectProgress(project);

  const health =
    projectHealth(project);

  const doneTasks =
    project.tasks.filter(
      task => task.status === "done"
    ).length;

  const openBlockers =
    project.blockers.filter(
      item => !item.done
    ).length;

  let currentFound =
    false;

  const milestoneHTML =
    project.milestones.length
      ? project.milestones.map(item => {
          let state = "";

          if (item.done) {
            state = "done";
          } else if (!currentFound) {
            state = "current";
            currentFound = true;
          }

          return `
            <div class="milestone-step ${state}">
              <div class="milestone-dot"></div>

              <strong>
                ${esc(item.title)}
              </strong>

              <small>
                ${
                  item.date
                    ? formatDate(item.date)
                    : state === "current"
                      ? "CURRENT"
                      : "UPCOMING"
                }
              </small>
            </div>
          `;
        }).join("")
      : `
          <div
            style="
              color:rgba(222,235,255,.48);
              font-size:13px;
              padding:35px 10px;
            "
          >
            No milestones added yet.
          </div>
        `;

  $("#workspaceContent").innerHTML = `
    <div class="overview-dashboard">

      <article class="dashboard-card">
        <div class="dashboard-card-header">
          <span>
            PROJECT PROGRESS
          </span>
        </div>

        <div class="big-progress-wrap">
          <div
            class="big-progress-ring"
            style="--progress:${progress}%"
          >
            <div>
              <strong>
                ${progress}%
              </strong>

              <span>
                COMPLETE
              </span>
            </div>
          </div>
        </div>
      </article>

      <article class="dashboard-card wide">
        <div class="dashboard-card-header">
          <span>
            BUILD VELOCITY — LAST 8 WEEKS
          </span>

          <button
            data-open-module="tasks"
            type="button"
          >
            TASKS →
          </button>
        </div>

        ${velocitySVG(project)}
      </article>

      <article class="dashboard-card">
        <div class="dashboard-card-header">
          <span>
            PROJECT INTELLIGENCE
          </span>

          <button
            id="overviewEditProject"
            type="button"
          >
            EDIT
          </button>
        </div>

        <div class="project-brief-block">
          <strong>
            PROBLEM
          </strong>

          <p>
            ${esc(
              project.problem ||
              "No problem statement defined yet."
            )}
          </p>
        </div>

        <div class="project-brief-block">
          <strong>
            OBJECTIVE
          </strong>

          <p>
            ${esc(
              project.objective ||
              "No objective defined yet."
            )}
          </p>
        </div>
      </article>

      <article class="dashboard-card wide">
        <div class="dashboard-card-header">
          <span>
            DEVELOPMENT ACTIVITY — 42 DAYS
          </span>

          <button
            data-open-module="buildLog"
            type="button"
          >
            BUILD LOG →
          </button>
        </div>

        ${heatmapHTML(project)}

        <p
          style="
            margin-top:18px;
            color:rgba(222,235,255,.46);
            font-size:12px;
            line-height:1.6;
          "
        >
          Real activity only: completed tasks, build logs,
          research findings and decisions.
        </p>
      </article>

      <article class="dashboard-card">
        <div class="dashboard-card-header">
          <span>
            PROJECT SIGNALS
          </span>
        </div>

        <div
          class="intelligence-stats"
          style="margin-top:14px;"
        >
          <article>
            <span>
              HEALTH
            </span>

            <strong>
              ${health}%
            </strong>
          </article>

          <article>
            <span>
              TASKS
            </span>

            <strong>
              ${doneTasks}/${project.tasks.length}
            </strong>
          </article>

          <article>
            <span>
              BLOCKERS
            </span>

            <strong>
              ${openBlockers}
            </strong>
          </article>

          <article>
            <span>
              RESEARCH
            </span>

            <strong>
              ${researchCount(project)}
            </strong>
          </article>
        </div>
      </article>

      <article class="dashboard-card full">
        <div class="dashboard-card-header">
          <span>
            MILESTONE ROADMAP
          </span>

          <button
            data-open-module="milestones"
            type="button"
          >
            MANAGE →
          </button>
        </div>

        <div class="milestone-roadmap">
          ${milestoneHTML}
        </div>
      </article>

    </div>
  `;

  $("#overviewEditProject")
    ?.addEventListener(
      "click",
      () => openProjectModal(project.id)
    );
}

/* =========================================================
   TASKS — DRAG & DROP KANBAN
========================================================= */

const TASK_COLUMNS = [
  {
    key: "backlog",
    label: "BACKLOG"
  },
  {
    key: "active",
    label: "IN PROGRESS"
  },
  {
    key: "review",
    label: "REVIEW"
  },
  {
    key: "done",
    label: "DONE"
  }
];

function renderTasks() {
  const project =
    currentProject();

  $("#workspaceContent").innerHTML = `
    <div class="kanban-board">

      ${TASK_COLUMNS.map(column => {
        const tasks =
          project.tasks.filter(
            task => task.status === column.key
          );

        return `
          <section
            class="kanban-column"
            data-kanban-column="${column.key}"
          >
            <header class="kanban-column-header">
              <strong>
                ${column.label}
              </strong>

              <span>
                ${tasks.length}
              </span>
            </header>

            <div class="kanban-list">

              ${tasks.map(task => `
                <article
                  class="task-card"
                  draggable="true"
                  data-task-id="${task.id}"
                >
                  <h4>
                    ${esc(task.title)}
                  </h4>

                  ${
                    task.description
                      ? `
                          <p>
                            ${esc(task.description)}
                          </p>
                        `
                      : ""
                  }

                  <div class="task-meta">
                    <span
                      class="
                        priority-badge
                        priority-${esc(task.priority)}
                      "
                    >
                      ${esc(task.priority)}
                    </span>

                    <span class="task-date">
                      ${
                        task.due
                          ? formatDate(task.due)
                          : "NO DUE DATE"
                      }
                    </span>
                  </div>

                  <div
                    style="
                      display:flex;
                      gap:10px;
                      margin-top:12px;
                      justify-content:flex-end;
                    "
                  >
                    <button
                      data-edit-task="${task.id}"
                      type="button"
                      style="
                        border:0;
                        background:transparent;
                        color:rgba(119,198,255,.8);
                        font:500 9px 'DM Mono',monospace;
                        cursor:pointer;
                      "
                    >
                      EDIT
                    </button>

                    <button
                      data-delete-task="${task.id}"
                      type="button"
                      style="
                        border:0;
                        background:transparent;
                        color:rgba(255,126,145,.75);
                        font:500 9px 'DM Mono',monospace;
                        cursor:pointer;
                      "
                    >
                      DELETE
                    </button>
                  </div>
                </article>
              `).join("")
              ||
              `
                <div
                  style="
                    padding:18px 5px;
                    color:rgba(222,235,255,.34);
                    font-size:11px;
                  "
                >
                  Drop tasks here.
                </div>
              `
              }

            </div>
          </section>
        `;
      }).join("")}

    </div>
  `;

  $$(
    "[data-edit-task]",
    $("#workspaceContent")
  )
    .forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          openTaskForm(
            button.dataset.editTask
          );
        }
      );
    });

  $$(
    "[data-delete-task]",
    $("#workspaceContent")
  )
    .forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          project.tasks =
            project.tasks.filter(
              task =>
                task.id !==
                button.dataset.deleteTask
            );

          project.updatedAt =
            new Date().toISOString();

          saveProjects();
          renderAll();
        }
      );
    });

  setupKanban();
}

function setupKanban() {
  $$(
    ".task-card",
    $("#workspaceContent")
  )
    .forEach(card => {
      card.addEventListener(
        "dragstart",
        event => {
          if (
            event.target.closest("button")
          ) {
            event.preventDefault();
            return;
          }

          draggedTaskId =
            card.dataset.taskId;

          card.style.opacity =
            ".45";
        }
      );

      card.addEventListener(
        "dragend",
        () => {
          draggedTaskId =
            null;

          card.style.opacity =
            "";
        }
      );
    });

  $$(
    ".kanban-column",
    $("#workspaceContent")
  )
    .forEach(column => {
      column.addEventListener(
        "dragover",
        event => {
          event.preventDefault();

          column.classList.add(
            "drag-over"
          );
        }
      );

      column.addEventListener(
        "dragleave",
        () => {
          column.classList.remove(
            "drag-over"
          );
        }
      );

      column.addEventListener(
        "drop",
        event => {
          event.preventDefault();

          column.classList.remove(
            "drag-over"
          );

          if (!draggedTaskId) {
            return;
          }

          const project =
            currentProject();

          const task =
            project.tasks.find(
              item =>
                item.id ===
                draggedTaskId
            );

          if (!task) {
            return;
          }

          const nextStatus =
            column.dataset.kanbanColumn;

          const wasDone =
            task.status === "done";

          task.status =
            nextStatus;

          task.done =
            nextStatus === "done";

          task.updatedAt =
            new Date().toISOString();

          if (
            !wasDone &&
            nextStatus === "done"
          ) {
            task.completedAt =
              new Date().toISOString();
          }

          if (
            wasDone &&
            nextStatus !== "done"
          ) {
            task.completedAt = "";
          }

          project.updatedAt =
            new Date().toISOString();

          saveProjects();
          renderAll();
        }
      );
    });
}

function openTaskForm(
  taskId = null,
  defaultStatus = "backlog"
) {
  const project =
    currentProject();

  if (!project) return;

  const task =
    taskId
      ? project.tasks.find(
          item => item.id === taskId
        )
      : null;

  openItemModal({
    kicker: "TASK BOARD",

    title:
      task
        ? "Edit Task"
        : "Add Task",

    saveText:
      task
        ? "SAVE TASK"
        : "ADD TASK",

    html:
      inputField(
        "TASK",
        "taskTitleInput",
        "Build authentication API",
        task?.title || ""
      )
      +
      textAreaField(
        "DESCRIPTION",
        "taskDescriptionInput",
        "What exactly needs to be done?",
        task?.description || ""
      )
      +
      selectField(
        "STATUS",
        "taskStatusInput",
        TASK_COLUMNS.map(
          item => ({
            value: item.key,
            label: item.label
          })
        ),
        task?.status ||
        defaultStatus
      )
      +
      selectField(
        "PRIORITY",
        "taskPriorityInput",
        [
          "Low",
          "Medium",
          "High",
          "Critical"
        ],
        task?.priority ||
        "Medium"
      )
      +
      inputField(
        "DUE DATE",
        "taskDueInput",
        "",
        task?.due || "",
        "date",
        false
      ),

    onSave: () => {
      const title =
        $("#taskTitleInput")
          .value
          .trim();

      if (!title) return;

      const status =
        $("#taskStatusInput").value;

      const now =
        new Date().toISOString();

      if (task) {
        const wasDone =
          task.status === "done";

        task.title =
          title;

        task.description =
          $("#taskDescriptionInput")
            .value
            .trim();

        task.status =
          status;

        task.priority =
          $("#taskPriorityInput")
            .value;

        task.due =
          $("#taskDueInput")
            .value;

        task.done =
          status === "done";

        task.updatedAt =
          now;

        if (
          !wasDone &&
          status === "done"
        ) {
          task.completedAt =
            now;
        }

        if (
          wasDone &&
          status !== "done"
        ) {
          task.completedAt =
            "";
        }
      } else {
        project.tasks.push({
          id: uid("task"),

          title,

          description:
            $("#taskDescriptionInput")
              .value
              .trim(),

          status,

          priority:
            $("#taskPriorityInput")
              .value,

          due:
            $("#taskDueInput")
              .value,

          done:
            status === "done",

          createdAt:
            now,

          updatedAt:
            now,

          completedAt:
            status === "done"
              ? now
              : ""
        });
      }

      project.updatedAt =
        now;

      saveProjects();
      closeItemModal();
      renderAll();
    }
  });
}

/* =========================================================
   MILESTONES
========================================================= */

function renderMilestones() {
  const project =
    currentProject();

  if (!project.milestones.length) {
    renderEmptyModule(
      "⚑",
      "No milestones yet",
      "Define the major stages from idea to final deployment."
    );

    return;
  }

  $("#workspaceContent").innerHTML = `
    <div class="module-list">

      ${project.milestones.map(item => `
        <article
          class="
            module-entry
            ${item.done ? "done" : ""}
          "
        >
          <span class="module-status"></span>

          <div>
            <h4>
              ${esc(item.title)}
            </h4>

            <p>
              ${esc(item.description || "")}
              ${
                item.date
                  ? ` • ${formatDate(item.date)}`
                  : ""
              }
            </p>
          </div>

          <div class="module-entry-actions">
            <button
              data-toggle-milestone="${item.id}"
              type="button"
            >
              ${
                item.done
                  ? "UNDO"
                  : "COMPLETE"
              }
            </button>

            <button
              data-delete-milestone="${item.id}"
              type="button"
            >
              DELETE
            </button>
          </div>
        </article>
      `).join("")}

    </div>
  `;

  $$(
    "[data-toggle-milestone]",
    $("#workspaceContent")
  )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const item =
            project.milestones.find(
              entry =>
                entry.id ===
                button.dataset.toggleMilestone
            );

          if (!item) return;

          item.done =
            !item.done;

          item.completedAt =
            item.done
              ? new Date().toISOString()
              : "";

          project.updatedAt =
            new Date().toISOString();

          saveProjects();
          renderAll();
        }
      );
    });

  $$(
    "[data-delete-milestone]",
    $("#workspaceContent")
  )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          project.milestones =
            project.milestones.filter(
              item =>
                item.id !==
                button.dataset.deleteMilestone
            );

          project.updatedAt =
            new Date().toISOString();

          saveProjects();
          renderAll();
        }
      );
    });
}

function openMilestoneForm() {
  const project =
    currentProject();

  if (!project) return;

  openItemModal({
    kicker:
      "PROJECT ROADMAP",

    title:
      "Add Milestone",

    html:
      inputField(
        "MILESTONE",
        "milestoneTitleInput",
        "Working Prototype"
      )
      +
      inputField(
        "TARGET DATE",
        "milestoneDateInput",
        "",
        "",
        "date",
        false
      )
      +
      textAreaField(
        "DESCRIPTION",
        "milestoneDescriptionInput",
        "What defines this milestone?"
      ),

    onSave: () => {
      const title =
        $("#milestoneTitleInput")
          .value
          .trim();

      if (!title) return;

      project.milestones.push({
        id:
          uid("milestone"),

        title,

        date:
          $("#milestoneDateInput")
            .value,

        description:
          $("#milestoneDescriptionInput")
            .value
            .trim(),

        done:
          false,

        createdAt:
          new Date().toISOString(),

        completedAt:
          ""
      });

      project.updatedAt =
        new Date().toISOString();

      saveProjects();
      closeItemModal();
      renderAll();
    }
  });
}

/* =========================================================
   RESEARCH LAB
========================================================= */

const RESEARCH_SECTIONS = {
  questions:
    "Research Questions",

  existingSolutions:
    "Existing Solutions",

  competitors:
    "Competitors / Similar Projects",

  experiments:
    "Experiments / Tests",

  findings:
    "Key Findings",

  sources:
    "Sources / Papers"
};

function renderResearch() {
  const project =
    currentProject();

  $("#workspaceContent").innerHTML = `
    <div class="research-dashboard">

      ${Object.entries(RESEARCH_SECTIONS)
        .map(([key, label]) => `
          <section class="research-zone">

            <header class="research-zone-header">
              <div>
                <strong>
                  ${label}
                </strong>

                <span class="research-count">
                  ${project.research[key].length}
                </span>
              </div>

              <button
                data-add-research="${key}"
                type="button"
              >
                + ADD
              </button>
            </header>

            <div
              class="module-list"
              style="margin-top:10px;"
            >

              ${project.research[key]
                .map(item => `
                  <article class="module-entry">

                    <span class="module-status"></span>

                    <div>
                      <h4>
                        ${esc(item.title)}
                      </h4>

                      <p>
                        ${esc(
                          item.description ||
                          ""
                        )}
                      </p>
                    </div>

                    <div class="module-entry-actions">
                      <button
                        data-delete-research="${key}:${item.id}"
                        type="button"
                      >
                        DELETE
                      </button>
                    </div>

                  </article>
                `)
                .join("")
                ||
                `
                  <div
                    style="
                      padding:22px 4px;
                      color:rgba(222,235,255,.38);
                      font-size:12px;
                    "
                  >
                    Nothing added yet.
                  </div>
                `
              }

            </div>
          </section>
        `)
        .join("")}

    </div>
  `;

  $$(
    "[data-add-research]",
    $("#workspaceContent")
  )
    .forEach(button => {
      button.addEventListener(
        "click",
        () =>
          openResearchForm(
            button.dataset.addResearch
          )
      );
    });

  $$(
    "[data-delete-research]",
    $("#workspaceContent")
  )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const [
            type,
            id
          ] =
            button.dataset
              .deleteResearch
              .split(":");

          project.research[type] =
            project.research[type]
              .filter(
                item =>
                  item.id !== id
              );

          project.updatedAt =
            new Date().toISOString();

          saveProjects();
          renderAll();
        }
      );
    });
}

function openResearchForm(
  type = "findings"
) {
  const project =
    currentProject();

  if (
    !project ||
    !RESEARCH_SECTIONS[type]
  ) {
    return;
  }

  openItemModal({
    kicker:
      "RESEARCH LAB",

    title:
      RESEARCH_SECTIONS[type],

    html:
      inputField(
        "TITLE",
        "researchTitleInput",
        "Research entry"
      )
      +
      textAreaField(
        "DETAILS",
        "researchDescriptionInput",
        "What did you learn, compare, discover or test?"
      ),

    onSave: () => {
      const title =
        $("#researchTitleInput")
          .value
          .trim();

      if (!title) return;

      project.research[type]
        .unshift({
          id:
            uid("research"),

          title,

          description:
            $("#researchDescriptionInput")
              .value
              .trim(),

          createdAt:
            new Date().toISOString()
        });

      project.updatedAt =
        new Date().toISOString();

      saveProjects();
      closeItemModal();
      renderAll();
    }
  });
}

/* =========================================================
   FILE VAULT
========================================================= */

function fileType(path = "") {
  const clean =
    path
      .split("?")[0]
      .split("#")[0]
      .toLowerCase();

  if (clean.endsWith(".pdf")) {
    return "PDF";
  }

  if (
    clean.endsWith(".ppt") ||
    clean.endsWith(".pptx")
  ) {
    return "PPT";
  }

  if (
    clean.endsWith(".png") ||
    clean.endsWith(".jpg") ||
    clean.endsWith(".jpeg") ||
    clean.endsWith(".webp")
  ) {
    return "IMAGE";
  }

  if (clean.endsWith(".csv")) {
    return "CSV";
  }

  if (
    clean.endsWith(".doc") ||
    clean.endsWith(".docx")
  ) {
    return "DOC";
  }

  if (clean.endsWith(".zip")) {
    return "ZIP";
  }

  return "FILE";
}

function renderFiles() {
  const project =
    currentProject();

  if (!project.files.length) {
    renderEmptyModule(
      "▣",
      "File Vault is empty",
      "Add reports, PDFs, presentations, architecture diagrams, datasets or useful project files."
    );

    return;
  }

  $("#workspaceContent").innerHTML = `
    <div class="file-vault">

      ${project.files.map(file => `
        <article
          class="file-card"
          data-file-card="${file.id}"
        >
          <div class="file-type-icon">
            ${esc(
              file.type ||
              fileType(file.url)
            )}
          </div>

          <h4>
            ${esc(file.title)}
          </h4>

          <p>
            ${esc(
              file.description ||
              "No description."
            )}
          </p>

          <small>
            ${formatTimestamp(file.createdAt)}
          </small>

          <div
            style="
              display:flex;
              gap:10px;
              margin-top:12px;
            "
          >
            <button
              data-file-open="${file.id}"
              type="button"
              style="
                border:0;
                background:transparent;
                color:rgba(103,223,255,.8);
                font:500 9px 'DM Mono',monospace;
                cursor:pointer;
              "
            >
              OPEN
            </button>

            <button
              data-file-delete="${file.id}"
              type="button"
              style="
                border:0;
                background:transparent;
                color:rgba(255,126,145,.75);
                font:500 9px 'DM Mono',monospace;
                cursor:pointer;
              "
            >
              REMOVE
            </button>
          </div>

        </article>
      `).join("")}

    </div>
  `;

  $$(
    "[data-file-card]",
    $("#workspaceContent")
  )
    .forEach(card => {
      card.addEventListener(
        "click",
        event => {
          if (
            event.target.closest("button")
          ) {
            return;
          }

          openFileDrawer(
            card.dataset.fileCard
          );
        }
      );
    });

  $$(
    "[data-file-open]",
    $("#workspaceContent")
  )
    .forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          const file =
            project.files.find(
              item =>
                item.id ===
                button.dataset.fileOpen
            );

          safeOpen(file?.url);
        }
      );
    });

  $$(
    "[data-file-delete]",
    $("#workspaceContent")
  )
    .forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          project.files =
            project.files.filter(
              item =>
                item.id !==
                button.dataset.fileDelete
            );

          project.updatedAt =
            new Date().toISOString();

          closeFileDrawer();
          saveProjects();
          renderAll();
        }
      );
    });
}

function openFileForm() {
  const project =
    currentProject();

  if (!project) return;

  openItemModal({
    kicker:
      "FILE VAULT",

    title:
      "Add File",

    html:
      inputField(
        "FILE NAME",
        "fileTitleInput",
        "Final Project Report"
      )
      +
      inputField(
        "PATH / URL",
        "filePathInput",
        "assets/docs/report.pdf"
      )
      +
      textAreaField(
        "DESCRIPTION",
        "fileDescriptionInput",
        "What is this file?"
      ),

    onSave: () => {
      const title =
        $("#fileTitleInput")
          .value
          .trim();

      const url =
        $("#filePathInput")
          .value
          .trim();

      if (!title) return;

      project.files.unshift({
        id:
          uid("file"),

        title,

        description:
          $("#fileDescriptionInput")
            .value
            .trim(),

        url,

        type:
          fileType(url),

        createdAt:
          new Date().toISOString()
      });

      project.updatedAt =
        new Date().toISOString();

      saveProjects();
      closeItemModal();
      renderAll();
    }
  });
}

function openFileDrawer(id) {
  const project =
    currentProject();

  const file =
    project?.files.find(
      item => item.id === id
    );

  if (!file) return;

  openedFileId =
    id;

  $("#drawerFileTitle").textContent =
    file.title;

  $("#drawerFileType").textContent =
    file.type ||
    fileType(file.url);

  $("#drawerFileDate").textContent =
    formatTimestamp(file.createdAt);

  $("#drawerFilePath").textContent =
    file.url || "—";

  $("#drawerFileDescription").textContent =
    file.description ||
    "No description.";

  $("#filePreview").textContent =
    file.type ||
    fileType(file.url);

  $("#fileDrawer").classList.add(
    "open"
  );
}

function closeFileDrawer() {
  $("#fileDrawer")
    ?.classList
    .remove(
      "open"
    );

  openedFileId =
    null;
}

/* =========================================================
   BUILD LOG
========================================================= */

function renderBuildLog() {
  const project =
    currentProject();

  $("#workspaceContent").innerHTML = `
    <div class="build-layout">

      <section class="build-heatmap">
        <div class="dashboard-card-header">
          <span>
            DEVELOPMENT ACTIVITY
          </span>
        </div>

        ${heatmapHTML(project)}

        <p
          style="
            margin-top:18px;
            color:rgba(222,235,255,.46);
            font-size:12px;
            line-height:1.6;
          "
        >
          Brighter squares mean more recorded work on that day.
        </p>
      </section>

      <section class="build-timeline">
        <div class="dashboard-card-header">
          <span>
            BUILD TIMELINE
          </span>
        </div>

        <div
          style="margin-top:15px;"
        >
          ${
            project.buildLog.length
              ? project.buildLog.map(item => `
                  <article class="timeline-entry">
                    <strong>
                      ${esc(item.title)}
                    </strong>

                    ${
                      item.description
                        ? `
                            <p>
                              ${esc(item.description)}
                            </p>
                          `
                        : ""
                    }

                    <small>
                      ${formatTimestamp(item.createdAt)}
                    </small>

                    <button
                      data-delete-build="${item.id}"
                      type="button"
                      style="
                        margin-top:8px;
                        border:0;
                        background:transparent;
                        color:rgba(255,126,145,.72);
                        font:500 9px 'DM Mono',monospace;
                        cursor:pointer;
                      "
                    >
                      DELETE
                    </button>
                  </article>
                `).join("")
              : `
                  <div class="empty-module">
                    <span>
                      ↗
                    </span>

                    <strong>
                      No build history
                    </strong>

                    <p>
                      Log what you build every time you work.
                    </p>
                  </div>
                `
          }
        </div>
      </section>

    </div>
  `;

  $$(
    "[data-delete-build]",
    $("#workspaceContent")
  )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          project.buildLog =
            project.buildLog.filter(
              item =>
                item.id !==
                button.dataset.deleteBuild
            );

          project.updatedAt =
            new Date().toISOString();

          saveProjects();
          renderAll();
        }
      );
    });
}

function openBuildForm() {
  const project =
    currentProject();

  if (!project) return;

  openItemModal({
    kicker:
      "BUILD LOG",

    title:
      "Log Work",

    html:
      inputField(
        "WHAT DID YOU BUILD?",
        "buildTitleInput",
        "Integrated authentication"
      )
      +
      textAreaField(
        "DETAILS",
        "buildDescriptionInput",
        "What changed, what worked, what remains?"
      ),

    onSave: () => {
      const title =
        $("#buildTitleInput")
          .value
          .trim();

      if (!title) return;

      project.buildLog.unshift({
        id:
          uid("build"),

        title,

        description:
          $("#buildDescriptionInput")
            .value
            .trim(),

        createdAt:
          new Date().toISOString()
      });

      project.updatedAt =
        new Date().toISOString();

      saveProjects();
      closeItemModal();
      renderAll();
    }
  });
}

/* =========================================================
   GENERIC MODULES
========================================================= */

const GENERIC_CONFIG = {
  resources: {
    singular:
      "Resource",

    icon:
      "◇",

    emptyTitle:
      "No resources",

    emptyCopy:
      "Save articles, repositories, videos and documentation.",

    url:
      true
  },

  notes: {
    singular:
      "Note",

    icon:
      "≡",

    emptyTitle:
      "No project notes",

    emptyCopy:
      "Capture ideas and context without losing them."
  },

  decisions: {
    singular:
      "Decision",

    icon:
      "◎",

    emptyTitle:
      "No decisions recorded",

    emptyCopy:
      "Record major technical or product decisions."
  },

  blockers: {
    singular:
      "Blocker",

    icon:
      "!",

    emptyTitle:
      "No blockers",

    emptyCopy:
      "Add anything currently blocking project execution.",

    toggle:
      true
  },

  timeline: {
    singular:
      "Timeline Event",

    icon:
      "⌁",

    emptyTitle:
      "Timeline is empty",

    emptyCopy:
      "Record major moments in the project journey."
  }
};

function renderGenericModule(module) {
  const project =
    currentProject();

  const config =
    GENERIC_CONFIG[module];

  const items =
    project[module];

  if (!items.length) {
    renderEmptyModule(
      config.icon,
      config.emptyTitle,
      config.emptyCopy
    );

    return;
  }

  $("#workspaceContent").innerHTML = `
    <div class="module-list">

      ${items.map(item => `
        <article
          class="
            module-entry
            ${item.done ? "done" : ""}
          "
        >
          <span class="module-status"></span>

          <div>
            <h4>
              ${esc(item.title)}
            </h4>

            <p>
              ${esc(
                item.description ||
                item.url ||
                ""
              )}
            </p>
          </div>

          <div class="module-entry-actions">

            ${
              config.toggle
                ? `
                    <button
                      data-toggle-generic="${item.id}"
                      type="button"
                    >
                      ${
                        item.done
                          ? "REOPEN"
                          : "RESOLVE"
                      }
                    </button>
                  `
                : ""
            }

            ${
              item.url
                ? `
                    <button
                      data-open-generic="${item.id}"
                      type="button"
                    >
                      OPEN ↗
                    </button>
                  `
                : ""
            }

            <button
              data-delete-generic="${item.id}"
              type="button"
            >
              DELETE
            </button>

          </div>
        </article>
      `).join("")}

    </div>
  `;

  $$(
    "[data-toggle-generic]",
    $("#workspaceContent")
  )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const item =
            items.find(
              entry =>
                entry.id ===
                button.dataset.toggleGeneric
            );

          if (!item) return;

          item.done =
            !item.done;

          project.updatedAt =
            new Date().toISOString();

          saveProjects();
          renderAll();
        }
      );
    });

  $$(
    "[data-open-generic]",
    $("#workspaceContent")
  )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const item =
            items.find(
              entry =>
                entry.id ===
                button.dataset.openGeneric
            );

          safeOpen(item?.url);
        }
      );
    });

  $$(
    "[data-delete-generic]",
    $("#workspaceContent")
  )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          project[module] =
            project[module].filter(
              item =>
                item.id !==
                button.dataset.deleteGeneric
            );

          project.updatedAt =
            new Date().toISOString();

          saveProjects();
          renderAll();
        }
      );
    });
}

function openGenericForm(module) {
  const project =
    currentProject();

  const config =
    GENERIC_CONFIG[module];

  if (
    !project ||
    !config
  ) {
    return;
  }

  openItemModal({
    kicker:
      module.toUpperCase(),

    title:
      `Add ${config.singular}`,

    html:
      inputField(
        "TITLE",
        "genericTitleInput",
        `${config.singular} title`
      )
      +
      textAreaField(
        "DETAILS / NOTES",
        "genericDescriptionInput",
        "Add useful context..."
      )
      +
      (
        config.url
          ? inputField(
              "URL",
              "genericUrlInput",
              "https://..."
            )
          : ""
      ),

    onSave: () => {
      const title =
        $("#genericTitleInput")
          .value
          .trim();

      if (!title) return;

      project[module].unshift({
        id:
          uid(module),

        title,

        description:
          $("#genericDescriptionInput")
            .value
            .trim(),

        url:
          $("#genericUrlInput")
            ?.value
            .trim()
          ||
          "",

        done:
          false,

        createdAt:
          new Date().toISOString()
      });

      project.updatedAt =
        new Date().toISOString();

      saveProjects();
      closeItemModal();
      renderAll();
    }
  });
}

/* =========================================================
   DEPLOYMENT
========================================================= */

function renderDeployment() {
  const project =
    currentProject();

  const data =
    project.deployment;

  $("#workspaceContent").innerHTML = `
    <div class="deployment-grid">

      <article class="deployment-card">
        <span>
          ENVIRONMENT
        </span>

        <strong>
          ${esc(
            data.environment ||
            "NOT SET"
          )}
        </strong>
      </article>

      <article class="deployment-card">
        <span>
          STATUS
        </span>

        <strong>
          ${esc(
            data.status ||
            "NOT DEPLOYED"
          )}
        </strong>
      </article>

      <article class="deployment-card">
        <span>
          VERSION
        </span>

        <strong>
          ${esc(
            data.version ||
            "—"
          )}
        </strong>
      </article>

      <article class="deployment-card">
        <span>
          LIVE URL
        </span>

        <strong>
          ${esc(
            data.url ||
            "—"
          )}
        </strong>
      </article>

      <article
        class="dashboard-card"
        style="
          grid-column:1/-1;
          min-height:180px;
        "
      >
        <div class="dashboard-card-header">
          <span>
            DEPLOYMENT NOTES
          </span>
        </div>

        <p
          style="
            margin-top:15px;
            color:rgba(222,235,255,.58);
            font-size:13px;
            line-height:1.7;
          "
        >
          ${esc(
            data.notes ||
            "No deployment notes yet."
          )}
        </p>
      </article>

    </div>
  `;
}

function openDeploymentForm() {
  const project =
    currentProject();

  if (!project) return;

  const data =
    project.deployment;

  openItemModal({
    kicker:
      "DEPLOYMENT",

    title:
      "Deployment Details",

    html:
      inputField(
        "ENVIRONMENT",
        "deploymentEnvironmentInput",
        "Vercel / Render / Local",
        data.environment
      )
      +
      inputField(
        "STATUS",
        "deploymentStatusInput",
        "Live / Testing / Offline",
        data.status
      )
      +
      inputField(
        "VERSION",
        "deploymentVersionInput",
        "v1.0.0",
        data.version
      )
      +
      inputField(
        "LIVE URL",
        "deploymentUrlInput",
        "https://...",
        data.url,
        "url"
      )
      +
      textAreaField(
        "NOTES",
        "deploymentNotesInput",
        "Deployment notes...",
        data.notes
      ),

    onSave: () => {
      project.deployment = {
        environment:
          $("#deploymentEnvironmentInput")
            .value
            .trim(),

        status:
          $("#deploymentStatusInput")
            .value
            .trim(),

        version:
          $("#deploymentVersionInput")
            .value
            .trim(),

        url:
          $("#deploymentUrlInput")
            .value
            .trim(),

        notes:
          $("#deploymentNotesInput")
            .value
            .trim()
      };

      project.updatedAt =
        new Date().toISOString();

      saveProjects();
      closeItemModal();
      renderAll();
    }
  });
}

/* =========================================================
   EMPTY MODULE
========================================================= */

function renderEmptyModule(
  icon,
  title,
  copy
) {
  $("#workspaceContent").innerHTML = `
    <div class="empty-module">
      <span>
        ${icon}
      </span>

      <strong>
        ${esc(title)}
      </strong>

      <p>
        ${esc(copy)}
      </p>
    </div>
  `;
}

/* =========================================================
   WORKSPACE CONTROLLER
========================================================= */

const MODULE_CONFIG = {
  overview: {
    title: "Overview",
    action: "EDIT PROJECT"
  },

  tasks: {
    title: "Task Board",
    action: "+ ADD TASK"
  },

  milestones: {
    title: "Milestone Roadmap",
    action: "+ ADD MILESTONE"
  },

  research: {
    title: "Research Lab",
    action: "+ ADD RESEARCH"
  },

  resources: {
    title: "Resources",
    action: "+ ADD RESOURCE"
  },

  files: {
    title: "File Vault",
    action: "+ ADD FILE"
  },

  notes: {
    title: "Project Notes",
    action: "+ ADD NOTE"
  },

  buildLog: {
    title: "Build Log",
    action: "+ LOG WORK"
  },

  decisions: {
    title: "Decision Log",
    action: "+ ADD DECISION"
  },

  blockers: {
    title: "Blockers & Risks",
    action: "+ ADD BLOCKER"
  },

  timeline: {
    title: "Project Timeline",
    action: "+ ADD EVENT"
  },

  deployment: {
    title: "Deployment",
    action: "EDIT DEPLOYMENT"
  }
};

function setModule(
  module,
  scrollToWorkspace = false
) {
  if (!MODULE_CONFIG[module]) {
    return;
  }

  activeModule =
    module;

  renderWorkspace();

  if (scrollToWorkspace) {
    setTimeout(() => {
      $(".workspace-system")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
    }, 20);
  }
}

function renderWorkspace() {
  const project =
    currentProject();

  if (!project) return;

  const config =
    MODULE_CONFIG[activeModule];

  $("#workspaceHeading").textContent =
    config.title;

  $("#workspaceAction").textContent =
    config.action;

  $$(".workspace-nav")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.module === activeModule
      );
    });

  $$(".core-node")
    .forEach(button => {
      const module =
        button.dataset.coreModule;

      button.classList.toggle(
        "active",
        module === activeModule
      );

      document.querySelector(
        `.wire-${module}`
      )
        ?.classList
        .toggle(
          "active",
          module === activeModule
        );
    });

  switch (activeModule) {
    case "overview":
      renderOverview();
      break;

    case "tasks":
      renderTasks();
      break;

    case "milestones":
      renderMilestones();
      break;

    case "research":
      renderResearch();
      break;

    case "files":
      renderFiles();
      break;

    case "buildLog":
      renderBuildLog();
      break;

    case "deployment":
      renderDeployment();
      break;

    default:
      renderGenericModule(activeModule);
  }
}

function runWorkspaceAction() {
  if (!currentProject()) return;

  switch (activeModule) {
    case "overview":
      openProjectModal(
        selectedProjectId
      );
      break;

    case "tasks":
      openTaskForm();
      break;

    case "milestones":
      openMilestoneForm();
      break;

    case "research":
      openResearchForm(
        "findings"
      );
      break;

    case "files":
      openFileForm();
      break;

    case "buildLog":
      openBuildForm();
      break;

    case "deployment":
      openDeploymentForm();
      break;

    default:
      openGenericForm(
        activeModule
      );
  }
}

/* =========================================================
   COMMAND PALETTE
========================================================= */

function commandItems() {
  const commands = [
    {
      icon: "+",
      label: "Create Project",
      description: "Start a new project",
      run: () => openProjectModal()
    }
  ];

  const project =
    currentProject();

  if (project) {
    commands.push(
      {
        icon: "✓",
        label: "Add Task",
        description: "Create a task in the Kanban board",
        run: () => {
          setModule("tasks");
          openTaskForm();
        }
      },

      {
        icon: "⌕",
        label: "Add Research Finding",
        description: "Add knowledge to Research Lab",
        run: () => {
          setModule("research");
          openResearchForm("findings");
        }
      },

      {
        icon: "▣",
        label: "Add File / PDF",
        description: "Add a document to File Vault",
        run: () => {
          setModule("files");
          openFileForm();
        }
      },

      {
        icon: "↗",
        label: "Log Work",
        description: "Record development activity",
        run: () => {
          setModule("buildLog");
          openBuildForm();
        }
      },

      {
        icon: "⚑",
        label: "Add Milestone",
        description: "Extend the project roadmap",
        run: () => {
          setModule("milestones");
          openMilestoneForm();
        }
      },

      {
        icon: "!",
        label: "Add Blocker",
        description: "Record an execution problem",
        run: () => {
          setModule("blockers");
          openGenericForm("blockers");
        }
      },

      {
        icon: "◎",
        label: "Add Decision",
        description: "Record a major project decision",
        run: () => {
          setModule("decisions");
          openGenericForm("decisions");
        }
      },

      {
        icon: "△",
        label: "Open Deployment",
        description: "View deployment state",
        run: () =>
          setModule(
            "deployment",
            true
          )
      },

      {
        icon: "×",
        label: "Delete Current Project",
        description: `Delete ${project.title}`,
        run: deleteCurrentProject
      }
    );

    projects.forEach(item => {
      commands.push({
        icon: "◇",

        label:
          `Open ${item.title}`,

        description:
          "Switch active project",

        run: () => {
          selectedProjectId =
            item.id;

          activeModule =
            "overview";

          closeFileDrawer();
          renderAll();
        }
      });
    });
  }

  return commands;
}

function filteredCommands() {
  const query =
    $("#commandSearch")
      .value
      .trim()
      .toLowerCase();

  return commandItems()
    .filter(command =>
      `${command.label} ${command.description}`
        .toLowerCase()
        .includes(query)
    );
}

function renderCommandList() {
  const commands =
    filteredCommands();

  commandIndex =
    Math.max(
      0,
      Math.min(
        commandIndex,
        Math.max(
          0,
          commands.length - 1
        )
      )
    );

  $("#commandList").innerHTML =
    commands.map((command, index) => `
      <button
        class="
          command-item
          ${index === commandIndex ? "active" : ""}
        "
        data-command-index="${index}"
        type="button"
      >
        <span class="command-icon">
          ${command.icon}
        </span>

        <div>
          <strong>
            ${esc(command.label)}
          </strong>

          <small>
            ${esc(command.description)}
          </small>
        </div>
      </button>
    `).join("")
    ||
    `
      <div
        style="
          padding:25px;
          color:rgba(222,235,255,.42);
          font-size:12px;
        "
      >
        No matching command.
      </div>
    `;

  $$(
    "[data-command-index]",
    $("#commandList")
  )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const command =
            commands[
              Number(
                button.dataset.commandIndex
              )
            ];

          closeCommandPalette();
          command?.run();
        }
      );
    });

  return commands;
}

function openCommandPalette() {
  $("#commandOverlay")
    .classList
    .add(
      "open"
    );

  $("#commandSearch").value =
    "";

  commandIndex =
    0;

  renderCommandList();

  setTimeout(
    () =>
      $("#commandSearch")
        ?.focus(),
    50
  );
}

function closeCommandPalette() {
  $("#commandOverlay")
    ?.classList
    .remove(
      "open"
    );
}

/* =========================================================
   POWER STONE QUICK MENU
========================================================= */

function togglePowerMenu() {
  if (!currentProject()) {
    openProjectModal();
    return;
  }

  $("#powerMenu")
    .classList
    .toggle(
      "open"
    );
}

function runQuickAction(action) {
  $("#powerMenu")
    .classList
    .remove(
      "open"
    );

  if (action === "tasks") {
    setModule("tasks");
    openTaskForm();
  }

  if (action === "research") {
    setModule("research");
    openResearchForm("findings");
  }

  if (action === "files") {
    setModule("files");
    openFileForm();
  }

  if (action === "buildLog") {
    setModule("buildLog");
    openBuildForm();
  }
}

/* =========================================================
   STARS / PARALLAX / MAGNETIC
========================================================= */

function createStars() {
  const container =
    $("#stars");

  if (
    !container ||
    container.children.length
  ) {
    return;
  }

  let html = "";

  for (let i = 0; i < 90; i++) {
    const left =
      Math.random() * 100;

    const top =
      Math.random() * 100;

    const duration =
      4 + Math.random() * 8;

    const x =
      (Math.random() - .5) * 35;

    const y =
      (Math.random() - .5) * 35;

    html += `
      <span
        class="star"
        style="
          left:${left}%;
          top:${top}%;
          --duration:${duration}s;
          --x:${x}px;
          --y:${y}px;
        "
      ></span>
    `;
  }

  container.innerHTML =
    html;
}

function setupMagnetic() {
  $$(".magnetic")
    .forEach(element => {
      if (
        element.dataset.magneticReady === "1"
      ) {
        return;
      }

      element.dataset.magneticReady =
        "1";

      element.addEventListener(
        "pointermove",
        event => {
          const rect =
            element.getBoundingClientRect();

          const x =
            (
              event.clientX -
              rect.left -
              rect.width / 2
            ) * .12;

          const y =
            (
              event.clientY -
              rect.top -
              rect.height / 2
            ) * .12;

          element.style.transform =
            `translate(${x}px,${y}px)`;
        }
      );

      element.addEventListener(
        "pointerleave",
        () => {
          element.style.transform = "";
        }
      );
    });
}

/* =========================================================
   GLOBAL EVENT LISTENERS
========================================================= */

$("#newProjectMini")
  ?.addEventListener(
    "click",
    () => openProjectModal()
  );

$("#createProjectMain")
  ?.addEventListener(
    "click",
    () => openProjectModal()
  );

$("#projectModalClose")
  ?.addEventListener(
    "click",
    closeProjectModal
  );

$("#projectModalCancel")
  ?.addEventListener(
    "click",
    closeProjectModal
  );

$("#projectModalSave")
  ?.addEventListener(
    "click",
    saveProjectFromModal
  );

$("#projectModal")
  ?.addEventListener(
    "click",
    event => {
      if (
        event.target ===
        $("#projectModal")
      ) {
        closeProjectModal();
      }
    }
  );

$("#itemModalClose")
  ?.addEventListener(
    "click",
    closeItemModal
  );

$("#itemModalCancel")
  ?.addEventListener(
    "click",
    closeItemModal
  );

$("#itemModalSave")
  ?.addEventListener(
    "click",
    () =>
      itemSaveHandler?.()
  );

$("#itemModal")
  ?.addEventListener(
    "click",
    event => {
      if (
        event.target ===
        $("#itemModal")
      ) {
        closeItemModal();
      }
    }
  );

$("#editProjectButton")
  ?.addEventListener(
    "click",
    () => {
      if (selectedProjectId) {
        openProjectModal(
          selectedProjectId
        );
      }
    }
  );

$("#githubButton")
  ?.addEventListener(
    "click",
    () =>
      safeOpen(
        currentProject()?.github
      )
  );

$("#demoButton")
  ?.addEventListener(
    "click",
    () =>
      safeOpen(
        currentProject()?.demo
      )
  );

$("#workspaceAction")
  ?.addEventListener(
    "click",
    runWorkspaceAction
  );

$("#workspaceCommand")
  ?.addEventListener(
    "click",
    openCommandPalette
  );

$("#commandButton")
  ?.addEventListener(
    "click",
    openCommandPalette
  );

$("#commandSearch")
  ?.addEventListener(
    "input",
    () => {
      commandIndex = 0;
      renderCommandList();
    }
  );

$("#commandOverlay")
  ?.addEventListener(
    "click",
    event => {
      if (
        event.target ===
        $("#commandOverlay")
      ) {
        closeCommandPalette();
      }
    }
  );

$("#powerStone")
  ?.addEventListener(
    "click",
    togglePowerMenu
  );

$$("[data-quick-action]")
  .forEach(button => {
    button.addEventListener(
      "click",
      () =>
        runQuickAction(
          button.dataset.quickAction
        )
    );
  });

$$(".workspace-nav")
  .forEach(button => {
    button.addEventListener(
      "click",
      () =>
        setModule(
          button.dataset.module
        )
    );
  });

$$("[data-core-module]")
  .forEach(button => {
    const module =
      button.dataset.coreModule;

    button.addEventListener(
      "mouseenter",
      () => {
        document.querySelector(
          `.wire-${module}`
        )
          ?.classList
          .add(
            "active"
          );
      }
    );

    button.addEventListener(
      "mouseleave",
      () => {
        if (
          activeModule !== module
        ) {
          document.querySelector(
            `.wire-${module}`
          )
            ?.classList
            .remove(
              "active"
            );
        }
      }
    );

    button.addEventListener(
      "click",
      () =>
        setModule(
          module,
          true
        )
    );
  });

$("#projectCore")
  ?.addEventListener(
    "click",
    () =>
      setModule(
        "overview",
        true
      )
  );

$("#closeFileDrawer")
  ?.addEventListener(
    "click",
    closeFileDrawer
  );

$("#drawerOpenFile")
  ?.addEventListener(
    "click",
    () => {
      const project =
        currentProject();

      const file =
        project?.files.find(
          item =>
            item.id ===
            openedFileId
        );

      safeOpen(
        file?.url
      );
    }
  );

/* Dynamic + static OPEN MODULE buttons */

document.addEventListener(
  "click",
  event => {
    const button =
      event.target.closest(
        "[data-open-module]"
      );

    if (!button) return;

    setModule(
      button.dataset.openModule,
      true
    );
  }
);

/* Keyboard */

document.addEventListener(
  "keydown",
  event => {
    const ctrlK =
      (
        event.ctrlKey ||
        event.metaKey
      )
      &&
      event.key
        .toLowerCase() ===
        "k";

    if (ctrlK) {
      event.preventDefault();

      if (
        $("#commandOverlay")
          ?.classList
          .contains(
            "open"
          )
      ) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }

      return;
    }

    if (event.key === "Escape") {
      closeProjectModal();
      closeItemModal();
      closeCommandPalette();
      closeFileDrawer();

      $("#powerMenu")
        ?.classList
        .remove(
          "open"
        );

      return;
    }

    if (
      $("#commandOverlay")
        ?.classList
        .contains(
          "open"
        )
    ) {
      const commands =
        filteredCommands();

      if (
        event.key ===
        "ArrowDown"
      ) {
        event.preventDefault();

        commandIndex =
          Math.min(
            commandIndex + 1,
            Math.max(
              0,
              commands.length - 1
            )
          );

        renderCommandList();
      }

      if (
        event.key ===
        "ArrowUp"
      ) {
        event.preventDefault();

        commandIndex =
          Math.max(
            commandIndex - 1,
            0
          );

        renderCommandList();
      }

      if (
        event.key ===
        "Enter"
      ) {
        event.preventDefault();

        const command =
          commands[commandIndex];

        closeCommandPalette();
        command?.run();
      }
    }
  }
);

/* Background interaction */

document.addEventListener(
  "pointermove",
  event => {
    if ($("#cursorLight")) {
      $("#cursorLight").style.left =
        `${event.clientX}px`;

      $("#cursorLight").style.top =
        `${event.clientY}px`;
    }

    if ($("#cosmosImage")) {
      const x =
        (
          event.clientX /
          window.innerWidth -
          .5
        ) * 7;

      const y =
        (
          event.clientY /
          window.innerHeight -
          .5
        ) * 5;

      $("#cosmosImage")
        .style
        .transform =
        `scale(1.06) translate(${x}px,${y}px)`;
    }
  }
);

/* =========================================================
   MASTER RENDER
========================================================= */

function renderAll() {
  projects =
    projects.map(
      normalizeProject
    );

  if (
    selectedProjectId &&
    !projects.some(
      project =>
        project.id ===
        selectedProjectId
    )
  ) {
    selectedProjectId =
      projects[0]?.id ||
      null;
  }

  if (
    !selectedProjectId &&
    projects.length
  ) {
    selectedProjectId =
      projects[0].id;
  }

  saveProjects();
  renderProjectRail();

  const project =
    currentProject();

  $("#projectOS")
    ?.classList
    .toggle(
      "has-project",
      Boolean(project)
    );

  if (!project) return;

  renderProjectState();
  renderWorkspace();
  setupMagnetic();
}

/* =========================================================
   INIT
========================================================= */

createStars();
renderAll();
setupMagnetic();