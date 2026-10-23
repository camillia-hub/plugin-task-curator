# Task Curator

Gives every new task a head start: the moment a task is created, the plugin
posts a friendly welcome checklist so the author can make the task actionable
before someone picks it up.

## Hook registered

- `task.created` → `taskCreated(event)` via the exported `hooks` map.

## Grants requested

- `comment-task` — the plugin's only operation is posting the checklist
  comment. It never edits the task, so it does not need `edit-task`.

## Behaviour

- Returns at most one `comment` operation per event.
- Base checklist: acceptance criteria, size estimate (S / M / L) and related
  links.
- When the title or description contains bug keywords (`bug`, `crash`,
  `error`, `broken`, `regression`, `fix`, `defect`, matched as whole words),
  two extra items are added: reproduction steps and expected-vs-actual
  behaviour.
- A missing title degrades to a generic greeting; a missing or malformed
  event returns `[]` (no-op) and never throws.
- The comment is capped at the 10 000 character platform limit.

## Example

Event:

```json
{
  "hook": "task.created",
  "taskTitle": "Fix crash on login",
  "taskDescription": "It breaks with a 500 error"
}
```

Operations returned:

```json
[
  {
    "type": "comment",
    "value": "### Welcome checklist\nThanks for creating **Fix crash on login**! Please make sure it is actionable:\n\n- [ ] Acceptance criteria are written down\n- [ ] Size estimate added (S / M / L)\n- [ ] Related links attached (designs, docs, prior tasks)\n- [ ] Reproduction steps included (this looks like a bug)\n- [ ] Expected vs actual behaviour described"
  }
]
```

## Install

Install from the Camillia marketplace (or upload the files listed in
`hub.json`: `plugin.json`, `index.js`, `package.json`) and enable the plugin
for your workspace. Requires Node.js 22 or newer to run the tests with
`npm test`.
