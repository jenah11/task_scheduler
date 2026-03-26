from flask import Flask, render_template, request, redirect
from task_scheduler import TaskScheduler # Import the TaskScheduler class from task_scheduler.py python file (module)

app = Flask(__name__)

scheduler = TaskScheduler()

@app.route("/")
def home():
    tasks = scheduler.get_all_tasks()
    next_task = scheduler.peek_task()

    return render_template("ui.html", tasks=tasks, next_task=next_task)


@app.route("/add", methods=["POST"])
def add():
    task = request.form["task_name"].strip()
    priority = request.form["priority"].strip()

    if not task or not priority:
        return render_template("ui.html", error_message="Both task name and priority are required!")

    scheduler.add_task(task, int(priority))
    return redirect("/")
    

@app.route("/execute")
def execute():
    scheduler.execute_task()

    return redirect("/")


@app.route("/change", methods=["POST"])
def change():
    task = request.form["task"]
    priority = int(request.form["priority"])
    scheduler.change_priority(task, priority)
    
    return redirect("/")



if __name__ == "__main__":
    app.run(debug=True)