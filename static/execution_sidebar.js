const executeAllForm = document.getElementById("executeAllForm");
const executionQueue = document.getElementById("executionQueue");
const executionStatus = document.getElementById("executionStatus");
const interruptExecution = document.getElementById("interruptExecution");
const executedTaskTray = document.getElementById("executedTaskTray");
const executionPreviewData = document.getElementById("executionPreviewData");

let executionPreview = [];
let isRunningPreview = false;
let interruptRequested = false;
let executedTasks = [];

const EXECUTED_TASKS_KEY = "lastExecutedTasks";

if (executionPreviewData) {
  try {
    executionPreview = JSON.parse(executionPreviewData.textContent || "[]");
  } catch (error) {
    executionPreview = [];
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setExecutionStatus(message, tone) {
  if (!executionStatus) {
    return;
  }

  executionStatus.textContent = message;
  executionStatus.style.color = tone || "#065f46";
}

function renderExecutedTray(items) {
  if (!executedTaskTray) {
    return;
  }

  executedTaskTray.innerHTML = "";

  if (!items.length) {
    const emptyState = document.createElement("li");
    emptyState.textContent = "No tasks executed yet.";
    executedTaskTray.appendChild(emptyState);
    return;
  }

  items.forEach((task) => {
    const item = document.createElement("li");
    item.textContent = `${task.task_id} (Priority ${task.priority})`;
    executedTaskTray.appendChild(item);
  });
}

function buildQueueRows(tasks) {
  if (!executionQueue) {
    return;
  }

  executionQueue.innerHTML = "";

  tasks.forEach((task) => {
    const row = document.createElement("div");
    row.className = "execution-item";

    const meta = document.createElement("div");
    meta.className = "execution-item__meta";
    meta.innerHTML = `<strong>${task.task_id}</strong><span>${task.seconds}s</span>`;

    const track = document.createElement("div");
    track.className = "execution-item__track";

    const bar = document.createElement("div");
    bar.className = "execution-item__bar";

    track.appendChild(bar);
    row.appendChild(meta);
    row.appendChild(track);
    executionQueue.appendChild(row);
  });
}

async function runTaskDuration(seconds, bar) {
  const totalMs = seconds * 1000;
  const stepMs = 100;
  let elapsed = 0;

  while (elapsed < totalMs) {
    if (interruptRequested) {
      return false;
    }

    await sleep(stepMs);
    elapsed += stepMs;
    bar.style.width = `${Math.min(100, (elapsed / totalMs) * 100)}%`;
  }

  return true;
}

async function executeOneTaskOnServer() {
  const response = await fetch("/execute-one", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return { ok: false, task: null };
  }

  return response.json();
}

function persistExecutedTasks() {
  sessionStorage.setItem(EXECUTED_TASKS_KEY, JSON.stringify(executedTasks));
}

function loadPersistedExecutedTasks() {
  const raw = sessionStorage.getItem(EXECUTED_TASKS_KEY);
  if (!raw) {
    renderExecutedTray([]);
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      renderExecutedTray(parsed);
      return;
    }
  } catch (error) {
    // Ignore malformed saved values.
  }

  renderExecutedTray([]);
}

async function runPreview(tasks) {
  isRunningPreview = true;
  interruptRequested = false;
  executedTasks = [];
  renderExecutedTray([]);
  setExecutionStatus("Running...", "#1f2937");

  buildQueueRows(tasks);

  const rows = Array.from(executionQueue.querySelectorAll(".execution-item"));

  for (let i = 0; i < tasks.length; i += 1) {
    if (interruptRequested) {
      break;
    }

    const row = rows[i];
    const bar = row.querySelector(".execution-item__bar");
    const seconds = tasks[i].seconds;

    row.classList.add("is-running");
    const finished = await runTaskDuration(seconds, bar);

    if (!finished) {
      row.classList.remove("is-running");
      break;
    }

    const result = await executeOneTaskOnServer();
    if (!result.ok || !result.task) {
      row.classList.remove("is-running");
      setExecutionStatus("No more tasks to execute.", "#6b7280");
      break;
    }

    row.classList.remove("is-running");
    row.classList.add("is-complete");

    executedTasks.push(result.task);
    renderExecutedTray(executedTasks);
    persistExecutedTasks();
  }

  isRunningPreview = false;

  if (interruptRequested) {
    setExecutionStatus("Execution interrupted.", "#b42318");
  } else {
    setExecutionStatus("Execution complete.", "#065f46");
  }

  setTimeout(() => {
    window.location.href = "/";
  }, 900);
}

if (executeAllForm) {
  executeAllForm.addEventListener("submit", (event) => {
    if (!executionPreview.length || isRunningPreview) {
      return;
    }

    event.preventDefault();
    runPreview(executionPreview);
  });
}

if (interruptExecution) {
  interruptExecution.addEventListener("click", () => {
    if (!isRunningPreview) {
      setExecutionStatus("Nothing is running.", "#6b7280");
      return;
    }

    interruptRequested = true;
    setExecutionStatus("Stopping...", "#b45309");
  });
}

loadPersistedExecutedTasks();
