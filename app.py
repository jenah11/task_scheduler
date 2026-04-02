from flask import Flask, render_template, request, redirect, jsonify
from task_scheduler import TaskScheduler # Import the TaskScheduler class from task_scheduler.py python file (module)
from execution_timing import build_execution_preview

app = Flask(__name__)

scheduler = TaskScheduler()

@app.route("/")
def home():
    tasks = scheduler.get_all_tasks()
    next_task = scheduler.peek_task()
    execution_preview = build_execution_preview(tasks)

    return render_template("ui.html", tasks=tasks, next_task=next_task, execution_preview=execution_preview)


@app.route("/add", methods=["POST"])
def add():
    task = request.form["task_name"].strip()
    priority = request.form["priority"].strip()

    if not task or not priority:
        return render_template("ui.html", error_message="Both task name and priority are required!")

    scheduler.add_task(task, int(priority))
    return redirect("/")
    

@app.route("/execute_first_task", methods=["POST"])
def execute_first_task():
    scheduler.execute_first_task()

    return redirect("/")


@app.route("/execute-all", methods=["POST"])
def execute_all():
    scheduler.execute_all_tasks()

    return redirect("/")


@app.route("/execute-one", methods=["POST"])
def execute_one():
    task = scheduler.execute_first_task()

    if task is None:
        return jsonify({"ok": False, "task": None})

    return jsonify({
        "ok": True,
        "task": {
            "task_id": task[0],
            "priority": task[1],
        }
    })


@app.route("/change", methods=["POST"])
def change():
    task = request.form["task"]
    priority = int(request.form["priority"])
    scheduler.change_priority(task, priority)
    
    return redirect("/")


@app.route("/delete", methods=["POST"])
def delete():
    task = request.form["task"]
    scheduler.delete_task(task)

    return redirect("/")



if __name__ == "__main__":
    app.run(debug=True)