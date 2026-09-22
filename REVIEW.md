# Frontend code review

## Scope and status

This review covers the supplied Next.js frontend: Task Dashboard, Activity Feed, API proxies, shared code, and the missing Reports UI.

The findings below describe the original supplied code. Implementation outcomes and actual verification are recorded at the end of this file. High priority means a correctness or required-feature issue; medium means a meaningful maintainability, performance, or UX improvement; low means cleanup.

## Strengths to preserve

- The Task Dashboard separates page composition, list rendering, individual tasks, and status filters.
- `hooks/useTasks.ts` separates data handling from presentation and derives filtered tasks rather than storing another list.
- Task rendering uses stable IDs, functional state updates, and typed props.
- Task filters expose `aria-pressed`, and task actions have descriptive accessible labels.
- Existing task loading, retry, empty-list, and saving states provide a useful foundation.
- `lib/backendApi.ts` centralizes backend access and uses `cache: "no-store"` for changing data.
- CSS variables provide reusable colors and layout values.

## React best practices and performance

### FE-01: Redundant activity state and unnecessary effects — Medium

**Location:** `app/activity/page.tsx`.

**What is wrong:** `allActivity`, `shownActivity`, and `forcedList` represent copies or derivations of the same data. A timer increments `tick` every 1.4 seconds, triggering filtering and copying even when the data and search query have not changed. It does not fetch fresh activity.

**Why it matters:** The page does extra work, renders intermediate state, and has more synchronization logic to maintain. Copying every item also creates unnecessary allocations.

**Suggested improvement:** Store the fetched list and query, derive the visible list during rendering, and remove the timer and copying effects. Memoize the filter only where useful. Preserve the total and visible counts.

### FE-02: Requests lack cancellation or stale-result protection — Medium

**Location:** `hooks/useTasks.ts`, `app/activity/page.tsx`.

**What is wrong:** Fetch effects do not cancel obsolete requests. `fetchTasks` can also be called repeatedly without identifying which response is current.

**Why it matters:** Overlapping requests can resolve out of order and overwrite more recent state. Navigation can leave unnecessary requests running.

**Suggested improvement:** Use abort signals and/or request identity checks for reads. Ignore cancellation errors and prevent obsolete requests from changing loading or data state. Treat mutations separately: cancelling a client request does not undo a backend write.

## Correctness and user experience

### FE-03: Activity failures are hidden or treated as valid data — High

**Location:** `app/activity/page.tsx`.

**What is wrong:** The fetch chain parses JSON without checking `response.ok`. A JSON error object can enter state as though it were an activity array; subsequent list operations can fail. Rejected requests are converted to empty lists without feedback.

**Why it matters:** Users cannot distinguish a failed request from an empty feed, and error responses can break rendering.

**Suggested improvement:** Check the HTTP result and response shape before storing data. Add loading, error with retry, empty-feed, and no-search-results states.

### FE-04: One pending ID cannot represent concurrent task updates — High

**Location:** `hooks/useTasks.ts`, `components/tasks/TaskList.tsx`.

**What is wrong:** Updating task B overwrites the pending ID for task A. Either request's `finally` block then clears the shared ID while another request may still be running.

**Why it matters:** Saving feedback and disabled buttons become inaccurate, allowing repeated updates on a task that is still saving.

**Suggested improvement:** Track pending IDs per task and remove only the completed request's ID, or deliberately serialize mutations. Verify delayed, overlapping responses and failures.

### FE-05: A failed toggle hides the entire task list — Medium

**Location:** `components/tasks/TaskDashboard.tsx`, `hooks/useTasks.ts`.

**What is wrong:** Loading and mutation errors share one state value. Any error prevents `TaskList` from rendering, and Retry always reloads tasks rather than retrying the failed toggle.

**Why it matters:** One failed action removes otherwise usable data and gives unclear recovery feedback.

**Suggested improvement:** Separate loading errors from mutation errors. Keep loaded tasks visible, show a relevant action error, and offer recovery appropriate to that action.

### FE-06: Search labeling and dynamic feedback need improvement — Medium

**Location:** `app/activity/page.tsx`, `components/tasks/TaskDashboard.tsx`, `app/globals.css`.

**What is wrong:** Activity search relies on placeholder text instead of a persistent label. Loading/error feedback has no explicit live announcement semantics, and shared CSS does not define consistent focus-visible or disabled styles.

**Why it matters:** Search becomes harder to identify after typing, and keyboard or assistive-technology users may miss state changes.

**Suggested improvement:** Add a search label, appropriate status/alert announcements, and clear focus/disabled styling. Check keyboard navigation and narrow-screen layouts during implementation.

## API integration and code quality

### FE-07: Proxy routes lose useful error statuses — High

**Location:** `lib/backendApi.ts`, `app/api/tasks/route.ts`, `app/api/tasks/[id]/route.ts`, `app/api/activity/route.ts`.

**What is wrong:** Backend failures become plain errors, and proxy catch blocks respond with HTTP 500. The PATCH handler also assumes parsed JSON is a non-null object; malformed JSON or `null` ends up in its generic 500 response.

**Why it matters:** Missing tasks and invalid client input are misreported as server failures. Callers cannot choose an appropriate recovery action.

**Suggested improvement:** Preserve upstream status in a structured error, validate request shape before accessing fields, return 400 for malformed input, and distinguish backend connectivity failures from backend validation errors.

### FE-08: Duplicated logic and styling increase maintenance effort — Medium

**Location:** `app/activity/page.tsx`, `hooks/useTasks.ts`, `lib/backendApi.ts`, page and task components.

**What is wrong:** The Activity Feed duplicates its filter and date formatter and renders the same timestamp twice. Request error handling is repeated, and `requestJson` catches the error it deliberately throws; invalid JSON errors can replace the intended friendly fallback. Repeated inline layout styles are scattered across components.

**Why it matters:** Related behavior can drift, presentation changes require many edits, and users may see low-level parser messages.

**Suggested improvement:** Keep one filter and formatter, render one semantic timestamp, simplify error parsing, and extract shared styles or components where repetition justifies it. Inline styles themselves are not inherently a bug.

## Implementation outcomes

Follow-up improvements (September 22): Tasks now synchronize across tabs and on window focus, deferring refresh until all local writes settle. Existing read cancellation prevents an older fetch from replacing a mutation result. Task order is creation time descending with ID ascending for ties. Tasks, Activity, and Reports retain content during background refresh and on refresh errors; open edit drafts remain unchanged.

Verification: production build and TypeScript pass. All 11 focused Playwright checks in `checks/` pass, covering cross-tab CRUD, ordering after reload, deferred refresh during saving, preserved drafts, content during slow or failed refresh, status retries, real API status selection and persistence, Activity/Reports updates, and proxy validation. Desktop and 320px mobile status dialogs were inspected, and mobile overflow checks passed. The earlier full browser suite cannot be rerun because `tests/` is currently absent. Restoration of that suite was not included in this follow-up.

Three-state status extension: create/edit forms now offer Pending, In progress, and Completed. Creation defaults to Pending; editing preselects the current status and preserves the selection after failed saves. Filters, badges, dashboard cards, and report groups reflect all three states. The checkbox remains a completion shortcut. Status retries preserve the exact requested status, and runtime validation checks status/completed consistency.

Status retry correction: failures retain the originally requested status. Retry resends that value instead of toggling the current task. A fresh snapshot removes the status error if the requested value is already saved or the task was removed. Checks cover both completing and reopening tasks, including a failed follow-up read and ensuring an old retry does not return after a later external change.

| Finding | Status | Result |
| --- | --- | --- |
| FE-01 | Resolved | One activity list, derived search, no timer or copying effects. |
| FE-02 | Resolved | Shared read hook cancels obsolete requests and ignores aborted results; mutation updates are guarded after unmount. |
| FE-03 | Resolved | HTTP and runtime data checks, loading/error/retry/empty/no-match states. |
| FE-04 | Resolved | Each task has its own pending ID, synchronous duplicate-request guard, and error. |
| FE-05 | Resolved | Failed mutations leave the task list visible and offer an inline retry for that task. |
| FE-06 | Improved and checked | Search label, status/error announcements, skip link, keyboard focus, reduced motion, and responsive layouts. |
| FE-07 | Resolved | Structured HTTP errors, guarded JSON parsing, upstream status preservation, 502 invalid data, 503 unavailable/timeout. |
| FE-08 | Resolved | Shared HTTP, feedback, date, stat, and layout components; duplicate activity formatting/filtering removed. |
| FE-09 | Implemented | Reports page, type, backend client, proxy, navigation, status bars, summary cards, and progress chart. |


## Requested CRUD extension

- Edit and Delete are available from a three-dot button beside each task status. The dropdown closes on outside interaction or Escape, supports keyboard navigation, and restores focus to its trigger after dialog cancellation. Actions are disabled while the task is saving.
- Added create and edit forms, task deletion with confirmation, and POST/GET-by-ID/PATCH/DELETE proxies. Existing list, filters, and completion toggles remain available.
- Native dialogs contain keyboard focus and return it to the triggering control, or New task after deletion. Blank titles show validation feedback, failed requests preserve form input/tasks, and saving controls block duplicate submission.
- The task hook tracks each operation separately. Only failed status updates offer the inline retry of the originally requested status; edit/delete errors stay in their own dialogs so a retry cannot trigger the wrong action.
- Successful mutations update the task list and notify dependent pages after the backend confirms persistence. Generated activity is owned by the backend and is not fabricated in the browser.
- The new tests cover the full create/rename/complete/reopen/delete sequence with Activities and Reports open simultaneously, confirmation cancellation, focus restoration, blank input, preserved drafts after failed creation, failed deletion/retry, and empty DELETE responses.
