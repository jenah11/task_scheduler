def seconds_from_task_id(task_id, min_seconds=1, max_seconds=20):
    task_text = str(task_id).strip()
    time = len(task_text) / 2

    if time < min_seconds:
        return min_seconds
    if time > max_seconds:
        return max_seconds

    return time


def build_execution_preview(tasks):
    preview = []

    for task_id, priority in tasks:
        preview.append({
            "task_id": task_id,
            "priority": priority,
            "seconds": seconds_from_task_id(task_id),
        })

    return preview
