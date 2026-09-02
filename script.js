/* =========================================================
   STUDY ATLAS V4
   Interactive Roadmap
========================================================= */


const STUDY_ATLAS_DATA = {

  "core-java": {

    title:
      "Core Java",

    kicker:
      "ACTIVE FOUNDATION",

    description:
      "Your current programming foundation.",

    why:
      "Builds the programming base required for DSA, backend engineering and Java systems projects.",

    prerequisites:
      "Start here.",

    unlocks: [
      "DSA",
      "Spring Boot",
      "Mini Redis"
    ]

  },


  "growth-backend": {

    title:
      "Growth Map Backend",

    kicker:
      "PARALLEL BUILD",

    description:
      "Learn backend engineering by solving your own real persistence problem.",

    why:
      "Turns Java concepts into a real system using APIs, databases and file storage.",

    prerequisites:
      "Basic Java + willingness to learn while building.",

    unlocks: [
      "REST APIs",
      "PostgreSQL",
      "Backend Engineering"
    ]

  },


  dsa: {

    title:
      "DSA in Java",

    kicker:
      "PLACEMENT TRACK",

    description:
      "Your long-running problem-solving and interview track.",

    why:
      "Improves problem solving, algorithmic thinking and placement readiness.",

    prerequisites:
      "Comfortable Core Java foundations.",

    unlocks: [
      "LeetCode",
      "Interviews",
      "Algorithmic Thinking"
    ]

  },


  "mini-redis": {

    title:
      "Mini Redis",

    kicker:
      "JAVA SYSTEMS PROJECT",

    description:
      "A serious Java project that grows with your systems knowledge.",

    why:
      "Teaches memory storage, TTL, persistence, sockets, threads and concurrency through one project.",

    prerequisites:
      "Java Collections + basic DSA.",

    unlocks: [
      "Networking",
      "Concurrency",
      "Caching"
    ]

  },


  "system-design": {

    title:
      "System Design",

    kicker:
      "ENGINEERING LAYER",

    description:
      "Learn how real software systems are structured and scaled.",

    why:
      "Connects backend, databases, caching, networking and reliability into one engineering mental model.",

    prerequisites:
      "Real experience with backend, databases and one systems-style project.",

    unlocks: [
      "Scalability",
      "Architecture",
      "Distributed Systems"
    ]

  },


  hardware: {

    title:
      "Hardware Literacy",

    kicker:
      "SUPPORTING SKILL",

    description:
      "Enough electronics knowledge to build hardware projects without blindly copying wiring.",

    why:
      "Helps you understand sensors, power, GPIO, protocols and component selection.",

    prerequisites:
      "No dependency on the main software roadmap.",

    unlocks: [
      "GPIO",
      "Sensors",
      "Embedded Projects"
    ]

  },


  python: {

    title:
      "Python",

    kicker:
      "FUTURE AI LANGUAGE",

    description:
      "Your serious second language for the AI track.",

    why:
      "Python becomes the practical language for machine learning and modern AI development.",

    prerequisites:
      "Finish the current Java-first foundation phase.",

    unlocks: [
      "AI / ML",
      "Data Tools",
      "GenAI"
    ]

  },


  genai: {

    title:
      "Generative AI",

    kicker:
      "AI ENGINEERING",

    description:
      "Build systems around modern language models instead of only using prompts.",

    why:
      "Introduces LLM APIs, embeddings, RAG, structured outputs and evaluation.",

    prerequisites:
      "Python + APIs + basic AI/ML understanding.",

    unlocks: [
      "RAG",
      "LLM Apps",
      "Tool Calling"
    ]

  },


  agentic: {

    title:
      "Agentic AI",

    kicker:
      "ADVANCED AI",

    description:
      "Build AI systems that can use tools, state and workflows to execute multi-step tasks.",

    why:
      "Moves from generating answers to building AI systems that actually perform actions.",

    prerequisites:
      "GenAI fundamentals + tool calling + APIs.",

    unlocks: [
      "Agents",
      "MCP",
      "AI Workflows"
    ]

  }

};



const STUDY_ATLAS_LINKS = {

  "core-java": [
    "dsa",
    "growth-backend"
  ],

  dsa: [
    "core-java",
    "mini-redis",
    "system-design"
  ],

  "growth-backend": [
    "core-java",
    "system-design"
  ],

  "mini-redis": [
    "dsa",
    "system-design"
  ],

  "system-design": [
    "dsa",
    "growth-backend",
    "mini-redis",
    "hardware",
    "python"
  ],

  hardware: [
    "system-design"
  ],

  python: [
    "system-design",
    "genai"
  ],

  genai: [
    "python",
    "agentic"
  ],

  agentic: [
    "genai"
  ]

};



let selectedAtlasNode =
  "core-java";



function guessCurrentAtlasNode() {

  const settings =
    getStudyOSSettings();


  const value =
    String(
      settings.currentPhase || ""
    )
      .toLowerCase();


  if (
    value.includes("dsa")
  ) {

    return "dsa";

  }


  if (
    value.includes("backend") ||
    value.includes("spring")
  ) {

    return "growth-backend";

  }


  if (
    value.includes("redis")
  ) {

    return "mini-redis";

  }


  if (
    value.includes("system design")
  ) {

    return "system-design";

  }


  if (
    value.includes("hardware")
  ) {

    return "hardware";

  }


  if (
    value.includes("python")
  ) {

    return "python";

  }


  if (
    value.includes("gen")
  ) {

    return "genai";

  }


  if (
    value.includes("agent")
  ) {

    return "agentic";

  }


  return "core-java";

}



function setAtlasNode(
  nodeId,
  temporary = false
) {

  const atlas =
    document.getElementById(
      "atlasMap"
    );


  const data =
    STUDY_ATLAS_DATA[
      nodeId
    ];


  if (
    !atlas ||
    !data
  ) {

    return;

  }


  if (!temporary) {

    selectedAtlasNode =
      nodeId;

  }



  atlas.classList.add(
    "is-exploring"
  );



  document
    .querySelectorAll(
      "[data-map-node]"
    )
    .forEach(
      node => {

        const id =
          node.dataset
            .mapNode;


        const related =
          id === nodeId ||
          (
            STUDY_ATLAS_LINKS[
              nodeId
            ] || []
          )
            .includes(
              id
            );


        node.classList.toggle(
          "selected",
          id === nodeId
        );


        node.classList.toggle(
          "map-related",
          related
        );

      }
    );



  document
    .querySelectorAll(
      ".atlas-edge"
    )
    .forEach(
      edge => {

        const related =
          edge.dataset.from ===
            nodeId ||
          edge.dataset.to ===
            nodeId;


        edge.classList.toggle(
          "lit",
          related
        );

      }
    );



  const title =
    document.getElementById(
      "mapInspectorTitle"
    );


  const kicker =
    document.getElementById(
      "mapInspectorKicker"
    );


  const description =
    document.getElementById(
      "mapInspectorDescription"
    );


  const why =
    document.getElementById(
      "mapInspectorWhy"
    );


  const prerequisites =
    document.getElementById(
      "mapInspectorPrerequisites"
    );


  const unlocks =
    document.getElementById(
      "mapInspectorUnlocks"
    );


  const topic =
    document.getElementById(
      "mapInspectorTopic"
    );



  if (title) {

    title.textContent =
      data.title;

  }


  if (kicker) {

    kicker.textContent =
      data.kicker;

  }


  if (description) {

    description.textContent =
      data.description;

  }


  if (why) {

    why.textContent =
      data.why;

  }


  if (prerequisites) {

    prerequisites.textContent =
      data.prerequisites;

  }


  if (unlocks) {

    unlocks.innerHTML =
      data.unlocks

        .map(
          item => `

            <span>
              ${esc(item)}
            </span>

          `
        )

        .join("");

  }



  const settings =
    getStudyOSSettings();


  const activeTrack =
    getTracks()
      .find(
        track =>
          String(
            track.status
          )
            .toLowerCase() ===
          "active"
      );



  if (topic) {

    if (
      nodeId ===
      guessCurrentAtlasNode()
    ) {

      topic.textContent =
        settings.currentTopic ||
        activeTrack?.current ||
        "Set today's topic";

    }

    else {

      topic.textContent =
        "Not active yet";

    }

  }



  const signalTitle =
    document.getElementById(
      "atlasSignalTitle"
    );


  const signalTopic =
    document.getElementById(
      "atlasSignalTopic"
    );


  if (signalTitle) {

    signalTitle.textContent =
      data.title;

  }


  if (signalTopic) {

    signalTopic.textContent =
      nodeId ===
      guessCurrentAtlasNode()

        ? (
          settings.currentTopic ||
          activeTrack?.current ||
          "Set today's current topic."
        )

        : data.description;

  }

}



function resetAtlasToCurrent() {

  const current =
    guessCurrentAtlasNode();


  selectedAtlasNode =
    current;


  setAtlasNode(
    current
  );



  const currentNode =
    document.querySelector(
      `[data-map-node="${current}"]`
    );


  currentNode
    ?.scrollIntoView(
      {
        behavior:
          "smooth",

        block:
          "nearest",

        inline:
          "center"
      }
    );

}



function renderAtlasCurrentState() {

  const settings =
    getStudyOSSettings();


  const current =
    guessCurrentAtlasNode();



  const currentLabel =
    document.getElementById(
      "mapCurrentPhaseLabel"
    );


  const nextLabel =
    document.getElementById(
      "mapNextPhaseLabel"
    );


  if (currentLabel) {

    currentLabel.textContent =
      settings.currentPhase ||
      "Core Java";

  }


  if (nextLabel) {

    nextLabel.textContent =
      settings.nextPhase ||
      "DSA in Java";

  }



  document
    .querySelectorAll(
      "[data-map-node]"
    )
    .forEach(
      node => {

        node.classList.toggle(
          "atlas-node-current",
          node.dataset.mapNode ===
          current
        );

      }
    );



  document
    .querySelectorAll(
      ".atlas-edge"
    )
    .forEach(
      edge => {

        edge.classList.remove(
          "main-active"
        );


        if (
          edge.dataset.from ===
          current
        ) {

          edge.classList.add(
            "main-active"
          );

        }

      }
    );



  setAtlasNode(
    selectedAtlasNode || current
  );

}



document
  .querySelectorAll(
    "[data-map-node]"
  )
  .forEach(
    node => {


      node.addEventListener(
        "click",
        () => {

          setAtlasNode(
            node.dataset
              .mapNode
          );

        }
      );



      node.addEventListener(
        "mouseenter",
        () => {

          setAtlasNode(
            node.dataset
              .mapNode,
            true
          );

        }
      );



      node.addEventListener(
        "mouseleave",
        () => {

          setAtlasNode(
            selectedAtlasNode
          );

        }
      );

    }
  );



document
  .getElementById(
    "mapFocusCurrent"
  )
  ?.addEventListener(
    "click",
    resetAtlasToCurrent
  );



document
  .getElementById(
    "mapOpenPlaylist"
  )
  ?.addEventListener(
    "click",
    () => {

      const active =
        getTracks()
          .find(
            track =>
              String(
                track.status
              )
                .toLowerCase() ===
              "active"
          );


      const url =
        safeUrl(
          active?.playlist || ""
        );


      if (
        url !== "#"
      ) {

        window.open(
          url,
          "_blank",
          "noopener"
        );


        return;

      }



      document
        .getElementById(
          "learningTrackGrid"
        )
        ?.scrollIntoView(
          {
            behavior:
              "smooth",

            block:
              "center"
          }
        );

    }
  );



const studyAtlas =
  document.getElementById(
    "studyAtlas"
  );



studyAtlas
  ?.addEventListener(
    "mousemove",
    event => {

      const rect =
        studyAtlas
          .getBoundingClientRect();


      const x =
        (
          (
            event.clientX -
            rect.left
          ) /
          rect.width
        ) *
        100;


      const y =
        (
          (
            event.clientY -
            rect.top
          ) /
          rect.height
        ) *
        100;


      studyAtlas
        .style
        .setProperty(
          "--atlas-x",
          `${x}%`
        );


      studyAtlas
        .style
        .setProperty(
          "--atlas-y",
          `${y}%`
        );

    }
  );



/* =========================================================
   KEEP ATLAS SYNCED WITH REST OF STUDY OS
========================================================= */

const previousRenderAllAtlasV4 =
  renderAll;


renderAll =
  function () {

    previousRenderAllAtlasV4();

    renderAtlasCurrentState();

  };



renderAtlasCurrentState();