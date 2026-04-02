def seconds_from_task_id(task_id, min_seconds=1, max_seconds=20):
    task_text = str(task_id).strip()
    raw_seconds = len(task_text)

    if raw_seconds < min_seconds:
        return min_seconds
    if raw_seconds > max_seconds:
        return max_seconds

    return raw_seconds


def build_execution_preview(tasks):
    preview = []

    for task_id, priority in tasks:
        preview.append({
            "task_id": task_id,
            "priority": priority,
            "seconds": seconds_from_task_id(task_id),
        })

    return preview
