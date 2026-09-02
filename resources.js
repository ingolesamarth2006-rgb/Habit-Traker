/* =========================================================
   RESOURCES PAGE
   SPACE STONE / KNOWLEDGE VAULT
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const RESOURCE_KEY = "growthMapResourcesV1";
const COLLECTION_KEY = "growthMapCollectionsV1";
const QUICK_NOTE_KEY = "growthMapQuickNotesV1";


let activeFilter = "all";
let activeCollection = null;

let editingResourceId = null;
let editingCollectionId = null;
let editingQuickNoteId = null;



/* =========================================================
   HELPERS
========================================================= */

const $ = (selector) =>
  document.querySelector(selector);

const $$ = (selector) =>
  [...document.querySelectorAll(selector)];


function loadData(key, fallback = []) {

  try {

    const data = JSON.parse(
      localStorage.getItem(key)
    );

    return data ?? fallback;

  } catch {

    return fallback;

  }

}


function saveData(key, data) {

  localStorage.setItem(
    key,
    JSON.stringify(data)
  );

}


function createId(prefix) {

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;

}


function escapeHTML(value = "") {

  return String(value)

    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function safeUrl(value = "") {

  const urlValue =
    String(value).trim();

  if (!urlValue) {
    return "";
  }

  try {

    const url =
      new URL(
        urlValue,
        window.location.href
      );

    if (
      url.protocol === "http:" ||
      url.protocol === "https:"
    ) {

      return url.href;

    }

  } catch {
    return "";
  }

  return "";

}


function localDateKey(date = new Date()) {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;

}


function isThisWeek(dateString) {

  if (!dateString) {
    return false;
  }

  const now =
    new Date();

  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

  const weekday =
    today.getDay();

  const mondayOffset =
    weekday === 0
      ? -6
      : 1 - weekday;

  const start =
    new Date(today);

  start.setDate(
    start.getDate() + mondayOffset
  );

  const end =
    new Date(start);

  end.setDate(
    end.getDate() + 7
  );

  const itemDate =
    new Date(dateString);

  return (
    itemDate >= start &&
    itemDate < end
  );

}



/* =========================================================
   DATA
========================================================= */

function getResources() {

  return loadData(
    RESOURCE_KEY,
    []
  );

}


function getCollections() {

  return loadData(
    COLLECTION_KEY,
    []
  );

}


function getQuickNotes() {

  return loadData(
    QUICK_NOTE_KEY,
    []
  );

}



/* =========================================================
   RESOURCE MODAL
========================================================= */

const resourceModal =
  $("#resourceModal");


function openResourceModal(resource = null) {

  editingResourceId =
    resource?.id || null;


  $("#resourceModalKicker")
    .textContent =
    resource
      ? "EDIT"
      : "ADD";


  $("#resourceModalTitle")
    .textContent =
    resource
      ? "Edit Resource"
      : "New Resource";


  $("#resourceTitle").value =
    resource?.title || "";

  $("#resourceType").value =
    resource?.type || "link";

  $("#resourceUrl").value =
    resource?.url || "";

  $("#resourceTags").value =
    resource?.tags?.join(", ") || "";

  $("#resourceNote").value =
    resource?.note || "";

  $("#resourcePinned").checked =
    Boolean(resource?.pinned);


  renderCollectionOptions(
    resource?.collection || ""
  );


  resourceModal.classList.add(
    "open"
  );

  resourceModal.setAttribute(
    "aria-hidden",
    "false"
  );


  setTimeout(
    () =>
      $("#resourceTitle")?.focus(),
    30
  );

}


function closeResourceModal() {

  resourceModal.classList.remove(
    "open"
  );

  resourceModal.setAttribute(
    "aria-hidden",
    "true"
  );

  editingResourceId =
    null;

}


function saveResource() {

  const title =
    $("#resourceTitle")
      .value
      .trim();

  if (!title) {

    alert(
      "Resource title is required."
    );

    return;

  }


  const resources =
    getResources();


  const tags =
    $("#resourceTags")
      .value
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean);


  const data = {

    id:
      editingResourceId ||
      createId("resource"),

    title,

    type:
      $("#resourceType").value,

    url:
      $("#resourceUrl")
        .value
        .trim(),

    collection:
      $("#resourceCollection")
        .value,

    tags,

    note:
      $("#resourceNote")
        .value
        .trim(),

    pinned:
      $("#resourcePinned")
        .checked,

    createdAt:
      editingResourceId
        ? (
          resources.find(
            item =>
              item.id ===
              editingResourceId
          )?.createdAt
          ||
          new Date().toISOString()
        )
        : new Date().toISOString(),

    updatedAt:
      new Date().toISOString()

  };


  if (editingResourceId) {

    const index =
      resources.findIndex(
        item =>
          item.id ===
          editingResourceId
      );


    if (index !== -1) {

      resources[index] =
        data;

    }

  } else {

    resources.unshift(
      data
    );

  }


  saveData(
    RESOURCE_KEY,
    resources
  );


  closeResourceModal();

  renderEverything();

}



/* =========================================================
   RESOURCE MODAL EVENTS
========================================================= */

$("#heroAddResource")
  ?.addEventListener(
    "click",
    () =>
      openResourceModal()
  );


$("#addResourceButton")
  ?.addEventListener(
    "click",
    () =>
      openResourceModal()
  );


$("#resourceModalClose")
  ?.addEventListener(
    "click",
    closeResourceModal
  );


$("#resourceModalCancel")
  ?.addEventListener(
    "click",
    closeResourceModal
  );


$("#resourceModalSave")
  ?.addEventListener(
    "click",
    saveResource
  );


resourceModal
  ?.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        resourceModal
      ) {

        closeResourceModal();

      }

    }
  );



/* =========================================================
   COLLECTION MODAL
========================================================= */

const collectionModal =
  $("#collectionModal");


function openCollectionModal(collection = null) {

  editingCollectionId =
    collection?.id || null;


  $("#collectionName").value =
    collection?.name || "";

  $("#collectionDescription").value =
    collection?.description || "";


  const title =
    collectionModal
      .querySelector(".modal-header h2");


  if (title) {

    title.textContent =
      collection
        ? "Edit Collection"
        : "New Collection";

  }


  collectionModal.classList.add(
    "open"
  );

  collectionModal.setAttribute(
    "aria-hidden",
    "false"
  );


  setTimeout(
    () =>
      $("#collectionName")?.focus(),
    30
  );

}


function closeCollectionModal() {

  collectionModal.classList.remove(
    "open"
  );

  collectionModal.setAttribute(
    "aria-hidden",
    "true"
  );

  editingCollectionId =
    null;

}


function saveCollection() {

  const name =
    $("#collectionName")
      .value
      .trim();


  if (!name) {

    alert(
      "Collection name is required."
    );

    return;

  }


  const collections =
    getCollections();


  const data = {

    id:
      editingCollectionId ||
      createId("collection"),

    name,

    description:
      $("#collectionDescription")
        .value
        .trim(),

    createdAt:
      editingCollectionId
        ? (
          collections.find(
            item =>
              item.id ===
              editingCollectionId
          )?.createdAt
          ||
          new Date().toISOString()
        )
        : new Date().toISOString()

  };


  if (editingCollectionId) {

    const index =
      collections.findIndex(
        item =>
          item.id ===
          editingCollectionId
      );


    if (index !== -1) {

      collections[index] =
        data;

    }

  } else {

    collections.unshift(
      data
    );

  }


  saveData(
    COLLECTION_KEY,
    collections
  );


  closeCollectionModal();

  renderEverything();

}



/* =========================================================
   COLLECTION EVENTS
========================================================= */

$("#addCollectionButton")
  ?.addEventListener(
    "click",
    () =>
      openCollectionModal()
  );


$("#collectionModalClose")
  ?.addEventListener(
    "click",
    closeCollectionModal
  );


$("#collectionModalCancel")
  ?.addEventListener(
    "click",
    closeCollectionModal
  );


$("#collectionModalSave")
  ?.addEventListener(
    "click",
    saveCollection
  );


collectionModal
  ?.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        collectionModal
      ) {

        closeCollectionModal();

      }

    }
  );



/* =========================================================
   COLLECTION OPTIONS IN RESOURCE MODAL
========================================================= */

function renderCollectionOptions(
  selected = ""
) {

  const select =
    $("#resourceCollection");

  const collections =
    getCollections();


  select.innerHTML = `

    <option value="">
      No Collection
    </option>

    ${collections
      .map(
        item => `

          <option
            value="${item.id}"
            ${
              item.id === selected
                ? "selected"
                : ""
            }
          >
            ${escapeHTML(item.name)}
          </option>

        `
      )
      .join("")}

  `;

}



/* =========================================================
   QUICK NOTE MODAL
========================================================= */

const quickNoteModal =
  $("#quickNoteModal");


function openQuickNoteModal(
  note = null
) {

  editingQuickNoteId =
    note?.id || null;


  $("#quickNoteTitle").value =
    note?.title || "";

  $("#quickNoteText").value =
    note?.text || "";


  $("#quickNoteModalTitle")
    .textContent =
    note
      ? "Edit Quick Note"
      : "Quick Note";


  quickNoteModal.classList.add(
    "open"
  );

  quickNoteModal.setAttribute(
    "aria-hidden",
    "false"
  );


  setTimeout(
    () =>
      $("#quickNoteTitle")?.focus(),
    30
  );

}


function closeQuickNoteModal() {

  quickNoteModal.classList.remove(
    "open"
  );

  quickNoteModal.setAttribute(
    "aria-hidden",
    "true"
  );

  editingQuickNoteId =
    null;

}


function saveQuickNote() {

  const title =
    $("#quickNoteTitle")
      .value
      .trim();


  const text =
    $("#quickNoteText")
      .value
      .trim();


  if (
    !title &&
    !text
  ) {

    alert(
      "Write something first."
    );

    return;

  }


  const notes =
    getQuickNotes();


  const data = {

    id:
      editingQuickNoteId ||
      createId("note"),

    title:
      title || "Untitled Note",

    text,

    createdAt:
      editingQuickNoteId
        ? (
          notes.find(
            item =>
              item.id ===
              editingQuickNoteId
          )?.createdAt
          ||
          new Date().toISOString()
        )
        : new Date().toISOString(),

    updatedAt:
      new Date().toISOString()

  };


  if (editingQuickNoteId) {

    const index =
      notes.findIndex(
        item =>
          item.id ===
          editingQuickNoteId
      );


    if (index !== -1) {

      notes[index] =
        data;

    }

  } else {

    notes.unshift(
      data
    );

  }


  saveData(
    QUICK_NOTE_KEY,
    notes
  );


  closeQuickNoteModal();

  renderQuickNotes();

}



/* =========================================================
   QUICK NOTE EVENTS
========================================================= */

$("#addQuickNoteButton")
  ?.addEventListener(
    "click",
    () =>
      openQuickNoteModal()
  );


$("#quickNoteModalClose")
  ?.addEventListener(
    "click",
    closeQuickNoteModal
  );


$("#quickNoteModalCancel")
  ?.addEventListener(
    "click",
    closeQuickNoteModal
  );


$("#quickNoteModalSave")
  ?.addEventListener(
    "click",
    saveQuickNote
  );


quickNoteModal
  ?.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        quickNoteModal
      ) {

        closeQuickNoteModal();

      }

    }
  );



/* =========================================================
   RESOURCE FILTERS
========================================================= */

$$(".filter-button")
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          activeFilter =
            button.dataset.filter;

          activeCollection =
            null;


          $$(".filter-button")
            .forEach(
              item =>
                item.classList.remove(
                  "active"
                )
            );


          button.classList.add(
            "active"
          );


          renderResources();

        }
      );

    }
  );


$("#resourceSearch")
  ?.addEventListener(
    "input",
    renderResources
  );



/* =========================================================
   RESOURCE CARD
========================================================= */

function resourceCard(
  resource,
  pinnedVersion = false
) {

  const collections =
    getCollections();


  const collection =
    collections.find(
      item =>
        item.id ===
        resource.collection
    );


  const url =
    safeUrl(
      resource.url
    );


  return `

    <article
      class="${
        pinnedVersion
          ? "pinned-card"
          : "resource-card"
      }"
    >

      <span class="resource-type">

        ${escapeHTML(
          resource.type
            .toUpperCase()
        )}

      </span>


      <h3 class="resource-title">

        ${escapeHTML(
          resource.title
        )}

      </h3>


      ${
        collection

          ? `

            <div
              style="
                margin-top:7px;
                color:rgba(120,239,255,.55);
                font-size:8px;
                font-weight:700;
              "
            >

              ${escapeHTML(
                collection.name
              )}

            </div>

          `

          : ""
      }


      ${
        resource.note

          ? `

            <p class="resource-note">

              ${escapeHTML(
                resource.note
              )}

            </p>

          `

          : ""
      }


      ${
        resource.tags?.length

          ? `

            <div class="resource-tags">

              ${resource.tags
                .map(
                  tag => `

                    <span>
                      ${escapeHTML(tag)}
                    </span>

                  `
                )
                .join("")}

            </div>

          `

          : ""
      }


      <div class="resource-card-actions">

        ${
          url

            ? `

              <a
                href="${url}"
                target="_blank"
                rel="noopener"
              >
                OPEN
              </a>

            `

            : ""
        }


        <button
          data-pin-resource="${resource.id}"
          type="button"
        >

          ${
            resource.pinned
              ? "UNPIN"
              : "PIN"
          }

        </button>


        <button
          data-edit-resource="${resource.id}"
          type="button"
        >
          EDIT
        </button>


        <button
          data-delete-resource="${resource.id}"
          type="button"
        >
          REMOVE
        </button>

      </div>

    </article>

  `;

}



/* =========================================================
   RENDER RESOURCES
========================================================= */

function renderResources() {

  const resources =
    getResources();


  const search =
    $("#resourceSearch")
      .value
      .trim()
      .toLowerCase();


  let visible =
    [...resources];


  if (
    activeFilter ===
    "pinned"
  ) {

    visible =
      visible.filter(
        item =>
          item.pinned
      );

  } else if (
    activeFilter !==
    "all"
  ) {

    visible =
      visible.filter(
        item =>
          item.type ===
          activeFilter
      );

  }


  if (activeCollection) {

    visible =
      visible.filter(
        item =>
          item.collection ===
          activeCollection
      );

  }


  if (search) {

    visible =
      visible.filter(
        item => {

          const text = [

            item.title,
            item.type,
            item.note,
            ...(item.tags || [])

          ]
            .join(" ")
            .toLowerCase();


          return text.includes(
            search
          );

        }
      );

  }


  $("#visibleResourceCount")
    .textContent =
    visible.length;


  const resourceGrid =
    $("#resourceGrid");


  if (!visible.length) {

    resourceGrid.innerHTML = `

      <div class="empty-state">

        No matching resources found.

      </div>

    `;

  } else {

    resourceGrid.innerHTML =
      visible
        .map(
          item =>
            resourceCard(item)
        )
        .join("");

  }


  const pinned =
    resources.filter(
      item =>
        item.pinned
    );


  const pinnedGrid =
    $("#pinnedGrid");


  if (!pinned.length) {

    pinnedGrid.innerHTML = `

      <div class="empty-state">

        Pin important resources and they will appear here.

      </div>

    `;

  } else {

    pinnedGrid.innerHTML =
      pinned
        .slice(0, 6)
        .map(
          item =>
            resourceCard(
              item,
              true
            )
        )
        .join("");

  }

}



/* =========================================================
   RESOURCE ACTIONS
========================================================= */

function handleResourceActions(
  event
) {

  const editButton =
    event.target.closest(
      "[data-edit-resource]"
    );


  const deleteButton =
    event.target.closest(
      "[data-delete-resource]"
    );


  const pinButton =
    event.target.closest(
      "[data-pin-resource]"
    );


  if (editButton) {

    const resource =
      getResources()
        .find(
          item =>
            item.id ===
            editButton.dataset
              .editResource
        );


    if (resource) {

      openResourceModal(
        resource
      );

    }

  }


  if (pinButton) {

    const resources =
      getResources();


    const resource =
      resources.find(
        item =>
          item.id ===
          pinButton.dataset
            .pinResource
      );


    if (resource) {

      resource.pinned =
        !resource.pinned;


      resource.updatedAt =
        new Date()
          .toISOString();


      saveData(
        RESOURCE_KEY,
        resources
      );


      renderEverything();

    }

  }


  if (
    deleteButton &&
    confirm(
      "Remove this resource?"
    )
  ) {

    const resources =
      getResources()
        .filter(
          item =>
            item.id !==
            deleteButton.dataset
              .deleteResource
        );


    saveData(
      RESOURCE_KEY,
      resources
    );


    renderEverything();

  }

}


$("#resourceGrid")
  ?.addEventListener(
    "click",
    handleResourceActions
  );


$("#pinnedGrid")
  ?.addEventListener(
    "click",
    handleResourceActions
  );



/* =========================================================
   COLLECTION RENDER
========================================================= */

function renderCollections() {

  const collections =
    getCollections();

  const resources =
    getResources();

  const grid =
    $("#collectionGrid");


  if (!collections.length) {

    grid.innerHTML = `

      <div class="empty-state">

        Create collections like AI, DSA,
        Design, Career, Research or Inspiration.

      </div>

    `;


    return;

  }


  grid.innerHTML =
    collections
      .map(
        collection => {

          const count =
            resources.filter(
              item =>
                item.collection ===
                collection.id
            ).length;


          return `

            <article class="collection-card">

              <span class="resource-type">
                COLLECTION
              </span>


              <h3>

                ${escapeHTML(
                  collection.name
                )}

              </h3>


              <p>

                ${escapeHTML(
                  collection.description ||
                  "No description."
                )}

              </p>


              <div class="collection-meta">

                ${count}
                RESOURCE${count === 1 ? "" : "S"}

              </div>


              <div class="resource-card-actions">

                <button
                  data-view-collection="${collection.id}"
                  type="button"
                >
                  VIEW
                </button>


                <button
                  data-edit-collection="${collection.id}"
                  type="button"
                >
                  EDIT
                </button>


                <button
                  data-delete-collection="${collection.id}"
                  type="button"
                >
                  REMOVE
                </button>

              </div>

            </article>

          `;

        }
      )
      .join("");

}



/* =========================================================
   COLLECTION ACTIONS
========================================================= */

$("#collectionGrid")
  ?.addEventListener(
    "click",
    event => {

      const viewButton =
        event.target.closest(
          "[data-view-collection]"
        );


      const editButton =
        event.target.closest(
          "[data-edit-collection]"
        );


      const deleteButton =
        event.target.closest(
          "[data-delete-collection]"
        );


      if (viewButton) {

        activeCollection =
          viewButton.dataset
            .viewCollection;


        activeFilter =
          "all";


        $$(".filter-button")
          .forEach(
            button =>
              button.classList.toggle(
                "active",
                button.dataset.filter ===
                "all"
              )
          );


        $("#resourceSearch").value =
          "";


        renderResources();


        document
          .querySelector(
            "#resourceGrid"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

      }


      if (editButton) {

        const collection =
          getCollections()
            .find(
              item =>
                item.id ===
                editButton.dataset
                  .editCollection
            );


        if (collection) {

          openCollectionModal(
            collection
          );

        }

      }


      if (
        deleteButton &&
        confirm(
          "Remove this collection? Resources inside it will NOT be deleted."
        )
      ) {

        const id =
          deleteButton.dataset
            .deleteCollection;


        saveData(
          COLLECTION_KEY,

          getCollections()
            .filter(
              item =>
                item.id !== id
            )
        );


        const resources =
          getResources()
            .map(
              item => {

                if (
                  item.collection ===
                  id
                ) {

                  return {
                    ...item,
                    collection: ""
                  };

                }

                return item;

              }
            );


        saveData(
          RESOURCE_KEY,
          resources
        );


        if (
          activeCollection ===
          id
        ) {

          activeCollection =
            null;

        }


        renderEverything();

      }

    }
  );



/* =========================================================
   QUICK NOTES RENDER
========================================================= */

function renderQuickNotes() {

  const notes =
    getQuickNotes();

  const grid =
    $("#quickNotesGrid");


  if (!notes.length) {

    grid.innerHTML = `

      <div class="empty-state">

        Small ideas, useful commands,
        references and things you don't want to forget.

      </div>

    `;


    return;

  }


  grid.innerHTML =
    notes
      .map(
        note => `

          <article class="quick-note-card">

            <span class="resource-type">
              NOTE
            </span>


            <h3>

              ${escapeHTML(
                note.title
              )}

            </h3>


            <p>

              ${escapeHTML(
                note.text
              )}

            </p>


            <div class="resource-card-actions">

              <button
                data-edit-note="${note.id}"
                type="button"
              >
                EDIT
              </button>


              <button
                data-delete-note="${note.id}"
                type="button"
              >
                REMOVE
              </button>

            </div>

          </article>

        `
      )
      .join("");

}



/* =========================================================
   QUICK NOTE ACTIONS
========================================================= */

$("#quickNotesGrid")
  ?.addEventListener(
    "click",
    event => {

      const editButton =
        event.target.closest(
          "[data-edit-note]"
        );


      const deleteButton =
        event.target.closest(
          "[data-delete-note]"
        );


      if (editButton) {

        const note =
          getQuickNotes()
            .find(
              item =>
                item.id ===
                editButton.dataset
                  .editNote
            );


        if (note) {

          openQuickNoteModal(
            note
          );

        }

      }


      if (
        deleteButton &&
        confirm(
          "Remove this quick note?"
        )
      ) {

        saveData(
          QUICK_NOTE_KEY,

          getQuickNotes()
            .filter(
              item =>
                item.id !==
                deleteButton.dataset
                  .deleteNote
            )
        );


        renderQuickNotes();

      }

    }
  );



/* =========================================================
   RECENT ACTIVITY
========================================================= */

function renderRecent() {

  const resources =
    getResources()
      .sort(
        (a, b) =>
          new Date(
            b.createdAt
          ) -
          new Date(
            a.createdAt
          )
      );


  const list =
    $("#recentResourceList");


  if (!resources.length) {

    list.innerHTML = `

      <div class="empty-state">

        Recently added resources will appear here.

      </div>

    `;


    return;

  }


  list.innerHTML =
    resources
      .slice(0, 8)
      .map(
        item => {

          const date =
            new Date(
              item.createdAt
            );


          return `

            <div class="recent-item">

              <div>

                <strong>

                  ${escapeHTML(
                    item.title
                  )}

                </strong>


                <small>

                  ${escapeHTML(
                    item.type.toUpperCase()
                  )}

                  ·

                  ${date.toLocaleDateString(
                    "en-US",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    }
                  )}

                </small>

              </div>


              <span>

                ${item.pinned
                  ? "PINNED"
                  : "SAVED"}

              </span>

            </div>

          `;

        }
      )
      .join("");

}



/* =========================================================
   STATS
========================================================= */

function updateStats() {

  const resources =
    getResources();

  const collections =
    getCollections();


  $("#totalResources")
    .textContent =
    resources.length;


  $("#pinnedResources")
    .textContent =
    resources.filter(
      item =>
        item.pinned
    ).length;


  $("#collectionCount")
    .textContent =
    collections.length;


  $("#recentCount")
    .textContent =
    resources.filter(
      item =>
        isThisWeek(
          item.createdAt
        )
    ).length;

}



/* =========================================================
   ESCAPE CLOSE MODALS
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key !==
      "Escape"
    ) {

      return;

    }


    closeResourceModal();
    closeCollectionModal();
    closeQuickNoteModal();

  }
);



/* =========================================================
   MASTER RENDER
========================================================= */

function renderEverything() {

  renderCollectionOptions();

  renderResources();

  renderCollections();

  renderQuickNotes();

  renderRecent();

  updateStats();

}



/* =========================================================
   START
========================================================= */

renderEverything();