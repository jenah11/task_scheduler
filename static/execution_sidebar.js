const executeAllForm = document.getElementById("executeAllForm");
const executionQueue = document.getElementById("executionQueue");
const executionStatus = document.getElementById("executionStatus");
const interruptExecution = document.getElementById("interruptExecution");
const executedTaskTray = document.getElementById("executedTaskTray");
const executionPreviewData = document.getElementById("executionPreviewData");

// Keeps track of the current run state and the tasks that have already finished.
let executionPreview = [];
let isRunningPreview = false;
let interruptRequested = false;
let executedTasks = [];

// Session key used to remember the most recently executed tasks.
const EXECUTED_TASKS_KEY = "lastExecutedTasks";

if (executionPreviewData) {
  // The page sends task data as JSON so the script can build the preview panel.
  try {
    executionPreview = JSON.parse(executionPreviewData.textContent || "[]");
  } catch (error) {
    executionPreview = [];
  }
}

// Small pause helper used while animating each loading bar.
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Updates the small message shown above the execution panel.
function setExecutionStatus(message, tone) {
  if (!executionStatus) {
    return;
  }

  executionStatus.textContent = message;
  executionStatus.style.color = tone || "#065f46";
}

// Shows tasks that have already finished inside the bottom tray.
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

// Builds the list of tasks and their loading bars in the right-side panel.
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

// Fills the current loading bar little by little so interruption can happen mid-task.
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

// Asks the server to actually remove one task from the scheduler.
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

// Saves the executed task tray to the browser session so it can be shown again after refresh.
function persistExecutedTasks() {
  sessionStorage.setItem(EXECUTED_TASKS_KEY, JSON.stringify(executedTasks));
}

// Restores the tray from the previous run, if the browser still has it saved.
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

// Runs the preview panel, waits through each task, then removes it on the server.
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
  // Replace the normal form submit with the animated preview flow.
  executeAllForm.addEventListener("submit", (event) => {
    if (!executionPreview.length || isRunningPreview) {
      return;
    }

    event.preventDefault();
    runPreview(executionPreview);
  });
}

if (interruptExecution) {
  // Interrupt only affects an active run; otherwise it just shows a short message.
  interruptExecution.addEventListener("click", () => {
    if (!isRunningPreview) {
      setExecutionStatus("Nothing is running.", "#6b7280");
      return;
    }

    interruptRequested = true;
    setExecutionStatus("Stopping...", "#b45309");
  });
}

// Show any saved executed tasks as soon as the page loads.
loadPersistedExecutedTasks();
