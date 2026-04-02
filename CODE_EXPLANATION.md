# Task Scheduler Code Explanation (Plain Language)

This file explains the Python side of the project in a friendly, non-technical way.

## Big Picture

The app has two Python files:

1. `task_scheduler.py`: The "brain" that stores tasks and decides which one comes first.
2. `app.py`: The "front desk" that talks to the web page buttons and sends actions to the brain.

Think of it like this:

- `task_scheduler.py` the backend side of things
- `app.py` is the receptionist who receives requests from users.

---

## What `heapq` Is Doing (in simple words)

`heapq` helps keep tasks arranged so the most urgent one is always easy to reach.

In this project, smaller priority numbers are treated as more urgent.

- Priority `1` is more urgent than `3`.
- Priority `3` is more urgent than `7`.

So `heapq` keeps the smallest number near the top.

Why this is useful:

- You do not need to re-sort everything every time you add a task.
- Getting the next task is fast and simple.

---

## How One Task Is Stored

Each task is stored as a 3-part value:

`(priority, counter, task_id)`

What each part means:

1. `priority`: How urgent the task is (smaller = sooner).
2. `counter`: The order the task was added (1st, 2nd, 3rd...).
3. `task_id`: The task name, like "Send report".

Why include `counter`:

- If two tasks have the same priority, the one added earlier should come first.
- The counter makes that happen naturally.

---

## Why There Is Also `task_map`

The code stores tasks in two places:

1. `heap`: Good for finding the next task quickly.
2. `task_map`: Good for checking if a task is still valid and for updates/deletes.

When a task is changed or deleted, older copies may still exist inside the heap.
The code handles this safely by checking `task_map` before using a popped task.

---

## `task_scheduler.py` Walkthrough

### `__init__`

Creates empty storage when the scheduler starts:

- `self.heap = []` -> list used by `heapq`
- `self.task_map = {}` -> quick lookup by task name
- `self.counter = 0` -> counts insertion order

---

### `add_task(self, task_id, priority)`

What it does:

1. Increases `counter` by 1.
2. Builds `(priority, counter, task_id)`.
3. Adds it into the heap.
4. Updates `task_map` so this task points to the newest entry.

Result:

- Task is now in the schedule.
- If this task name already existed, the map points to the latest version.

---

### `peek_task(self)`

What it does:

- Shows the next task without removing it.

How:

1. Looks at the top task in the heap.
2. Checks whether that task is still valid in `task_map`.
3. If valid, returns `(task_id, priority)`.
4. If not valid (old copy), removes it and checks again.
5. If nothing is left, returns `None`.

Why this cleanup step exists:

- Changed/deleted tasks can leave old entries in heap.
- This function quietly skips old entries.

---

### `execute_first_task(self)`

What it does:

- Removes and returns the next valid task.

How:

1. Pops from heap (top item).
2. Checks if task still exists in `task_map`.
3. If valid, removes from `task_map` and returns it.
4. If old/invalid, keeps popping.
5. If empty, returns `None`.

Meaning:

- This is the actual "run one task" action.

Note:

- In your current file, the popped counter value is assigned into `self.counter`.
- The scheduler still works, but this is usually unnecessary and may be confusing to read.

---

### `execute_all_tasks(self)`

What it does:

- Repeats "execute first task" until nothing remains.

How:

1. Creates an empty list called `executed_tasks`.
2. Calls `execute_first_task()` in a loop.
3. Stops when it gets `None`.
4. Returns the full list of executed tasks.

Meaning:

- This powers the "Execute All Tasks" button.

---

### `change_priority(self, task_id, new_priority)`

What it does:

1. Checks if the task exists.
2. Removes old version from `task_map`.
3. Adds the same task again with new priority.

Why this style:

- Simple and reliable.
- Old heap copy is ignored later during normal cleanup.

---

### `delete_task(self, task_id)`

What it does:

1. If task exists in map, remove it and return `True`.
2. If not found, return `False`.

Important detail:

- It does not immediately remove every old copy from heap.
- That is okay because `peek_task` and `execute_first_task` skip invalid entries.

---

### `get_all_tasks(self)`

What it does:

1. Takes all active task entries from `task_map`.
2. Sorts them by `(priority, counter)`.
3. Returns clean list of `(task_id, priority)`.

Why this matters:

- The table on the page stays in a consistent order after add/change/delete.

---

## What `_` Means in Python

You see `_` in places like:

- `priority, _, task_id = ...`
- `priority, counter, _ = entry`

`_` means:

- "There is a value here, but I do not need to use it right now."

It is a common readability habit in Python.

So instead of making a variable and never using it, `_` clearly says "ignore this part".

---

## `app.py` Walkthrough

`app.py` connects buttons/forms to scheduler actions.

### Setup

- Creates Flask app.
- Creates one `TaskScheduler` object called `scheduler`.

### `/` -> `home()`

- Gets all tasks.
- Gets the next task.
- Sends both to the UI template.

### `/add` -> `add()`

- Reads form values.
- Removes extra spaces.
- Validates both fields are present.
- Adds task.
- Redirects back to home page.

### `/execute_first_task` -> `execute_first_task()`

- Runs one task from the scheduler.
- Redirects back so UI refreshes.

### `/execute-all` -> `execute_all()`

- Runs all tasks.
- Redirects back so table shows empty/updated state.

### `/change` -> `change()`

- Reads selected task and new priority.
- Updates scheduler.
- Redirects back.

### `/delete` -> `delete()`

- Reads selected task id.
- Removes it.
- Redirects back.

---

## How Data Flows

1. User clicks a button in the page.
2. Browser sends form data to one route in `app.py`.
3. That route calls one method in `TaskScheduler`.
4. Scheduler updates stored tasks.
5. Route redirects back to `/`.
6. Home page asks scheduler for fresh data and re-renders.

So every click leads to a fresh page view with updated task info.

---

## Quick Summary

- `heapq` keeps the next task easy to pick.
- `task_map` keeps active task state reliable.
- `counter` preserves order for equal priority tasks.
- `_` means "ignore this value."
- `app.py` is the web controller.
- `task_scheduler.py` is the scheduling logic.
