# About Task Scheduler

## How It Works

1. The user adds a task and assigns it a priority number
2. Higher-priority tasks are always executed first
3. Tasks with equal priority follow the order they were added (FIFO)

---

## Data Structure

### Priority Queue (Heap)

Tasks are managed using a **priority queue** backed by a heap. This allows the scheduler to always access the highest-priority task efficiently.

| Operation | Time Complexity |
|-----------|-----------------|
| Insert    | O(log n)        |
| Remove    | O(log n)        |
| View top  | O(1)            |

---

## Algorithm

### Greedy Scheduling Algorithm

The scheduler always selects the highest-priority task available at each step. It does not look ahead — it simply picks the best option right now and executes it, then repeats.

---

## Functions

| Function | Description |
|---|---|
| `add_task()` | Adds a new task with a given priority to the queue |
| `peek_task()` | Views the highest-priority task without removing it |
| `execute_task()` | Removes and runs the highest-priority task |
| `change_priority()` | Updates the priority of an existing task |
| `get_all_tasks()` | Returns a list of all current tasks |

---

## Project Structure

```
task_scheduler/
│
├── (to be filled as project develops)
```

---

## Error Handling

*(To be documented)*
