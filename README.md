# Task Scheduler

A Python GUI application with flask that schedules and executes tasks based on priority.

---

## Features

- **Add a task** — Enter a task name and assign it a priority
- **Delete a task** — Remove a task; the next task in line inherits its priority
- **Run tasks** — Reorders and executes all tasks from highest to lowest priority
- **Interrupt** — Stops all running tasks at any point

---

## Requirements

- Python 3
- Flask

## How to Run
1. Download python <https://www.python.org/downloads/>

2. Clone the repository
```
git clone https://github.com/betsekpoe/task_scheduler.git
```
3. Install flask
```
pip install flask
```
4. Run the main application file
```
python app.py
```

---

## Usage

1. Run the app
2. Add a task by entering a name and a priority number
3. Click **Execute All Tasks** to execute tasks in priority order *(Yet to be added)*
4. Click **Interrupt** to stop execution at any time *(Yet to be added)*


[About this project](ABOUT.md)
