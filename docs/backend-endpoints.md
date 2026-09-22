# Backend API Endpoints

Base URL: `http://localhost:4000`

## Shared Error Shape

```ts
type ErrorResponse = {
  error: {
    message: string;
  };
};
```

## Task Endpoints

### GET /tasks

Fetch all tasks.

```ts
type Task = {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  completed: boolean; // compatibility field: status === 'completed'
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
};

type GetTasksResponse = {
  data: Task[];
};
```

### GET /tasks/:id

Fetch one task by ID.

```ts
type GetTaskResponse = {
  data: Task;
};
```

Possible errors:
- `404` when task does not exist.

### POST /tasks

Create a task.

```ts
type CreateTaskRequest = {
  title: string; // required, trimmed, non-empty
  status?: 'pending' | 'in-progress' | 'completed'; // default pending
  completed?: boolean; // legacy input: false maps to pending, true to completed
};

type CreateTaskResponse = {
  data: Task;
};
```

Possible errors:
- `400` when body is not an object.
- `400` when title is missing/invalid/empty.
- `400` when completed is not a boolean.
- `400` for an invalid status or conflicting status/completed values.
- `400` when unsupported fields are provided. Only `title`, `status`, and `completed` are accepted.

### PATCH /tasks/:id

Update task title or status.

```ts
type PatchTaskRequest = {
  title?: string; // if provided, trimmed and non-empty; one character is accepted
  status?: 'pending' | 'in-progress' | 'completed';
  completed?: boolean;
};

type PatchTaskResponse = {
  data: Task;
};
```

Possible errors:
- `400` when body is invalid.
- `400` when no supported fields are provided.
- `400` when unsupported fields are provided; IDs and timestamps cannot be updated by clients.
- `404` when task does not exist.

### DELETE /tasks/:id

Delete task by ID.

```ts
type DeleteTaskResponse = void; // status 204
```

Possible errors:
- `404` when task does not exist.

## Activity Endpoints

### GET /activity

Fetch activity logs.

```ts
type ActivityLog = {
  id: string;
  taskId?: string; // present on automatically generated task activity
  action?: string;
  info?: string;
  when: string; // ISO datetime
};

type GetActivityResponse = ActivityLog[];
```

### POST /activity

Create activity log entry.

```ts
type CreateActivityRequest = {
  action?: string;
  info?: string;
};

type CreateActivityResponse = ActivityLog;
```

Notes:
- The body must be a JSON object. Only optional string `action` and `info` fields are accepted; supplied strings are trimmed. An empty object is allowed for compatibility.
- Invalid field types, array bodies, and unsupported fields return `400`.
- New activity records use UUIDs; existing IDs remain unchanged.
- Task creation, renaming, completion/reopening, and deletion automatically create activity entries with a `taskId`. Deleting a task preserves its activity history.
- Failed task requests and updates that change no values create no activity. A PATCH changing title and completion together creates one `Task updated` event describing both changes.
- Generated actions are `Task created`, `Task renamed`, `Task completed`, `Task reopened`, `Task updated`, and `Task deleted`. `info` describes the affected title and change.
- Response shape for activity endpoints is raw objects/arrays (not wrapped in `data`).

## Reports Endpoints

### GET /reports/tasks-summary

Fetch summary statistics for tasks and activity.

```ts
type TasksSummary = {
  total: number;
  byStatus: {
    todo: number;
    "in-progress": number;
    done: number;
  };
  recentActivityCount: number;
};

type GetTasksSummaryResponse = TasksSummary;
```

Notes:
- `todo` counts pending tasks, `in-progress` counts tasks in progress, and `done` counts completed tasks.
- `recentActivityCount` counts activity timestamps in the inclusive interval `[now - 7 days, now]`. Future timestamps are excluded. Invalid stored timestamps cause a controlled `500` error rather than a misleading report.
- Response shape is raw object.

## Frontend proxy routes

Existing stored tasks without `status` are interpreted as pending/completed from their boolean flag. Reads return a normalized status without rewriting files; updates persist it. New records always store both fields consistently. Title-only updates preserve the current status, including in-progress. Conflicting `status` and `completed` values are rejected. A status-only change produces one activity entry (Task started/completed/reopened); a combined title/status change produces one Task updated entry. Unchanged values produce no activity.

The UI uses these Next.js routes:

| Route | Behavior |
| --- | --- |
| `GET /api/tasks` | List tasks newest first by creation time, then ID ascending for ties, wrapped in `data` |
| `POST /api/tasks` | Create with required `title` and optional `status` (or legacy `completed`); returns 201 and `data` |
| `GET /api/tasks/:id` | Read one task, wrapped in `data` |
| `PATCH /api/tasks/:id` | Update `title` and/or `status` (or legacy `completed`), wrapped in `data` |
| `DELETE /api/tasks/:id` | Delete a task; returns 204 with no body |
| `GET /api/activity` | Read raw activity array, including generated task history |
| `GET /api/reports/tasks-summary` | Read current task totals and recent activity count |

Task mutations and generated activity are coordinated by the backend before a success response. Reports read both datasets behind the same in-process queue. Stored task/activity records are validated for required fields, types, timestamps, and unique non-empty IDs. Invalid stored records cause a controlled `500` error; writes are rejected without changing either dataset. Optional activity action/info fields remain supported, and deleted-task history does not require an existing task reference.

Frontend mutations notify open Tasks, Activity, and Reports pages to reload; navigation, window focus, and Refresh also fetch current data. Task refreshes wait until all local mutations settle. Background refresh preserves the visible content and any open task draft.

Proxy routes preserve backend HTTP errors, return `400` for invalid JSON/request bodies, `502` for invalid upstream data, and `503` for backend connection failure or the 10-second upstream timeout. Response data is runtime-validated before reaching the UI. Requests and report responses are not cached.
