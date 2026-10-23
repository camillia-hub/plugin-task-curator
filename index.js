// plugin-task-curator
// Posts a welcome checklist comment on every new task so it becomes actionable.
// Grant requested: comment-task (the plugin only ever returns comment operations).

const MAX_COMMENT_LENGTH = 10000;

const BUG_KEYWORDS = ["bug", "crash", "error", "broken", "regression", "fix", "defect"];

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const BUG_MATCHERS = BUG_KEYWORDS.map(
  (word) => new RegExp("(?<![A-Za-z0-9])" + escapeRegExp(word) + "(?![A-Za-z0-9])", "i"),
);

export function looksLikeBug(text) {
  return typeof text === "string" && BUG_MATCHERS.some((regex) => regex.test(text));
}

export function buildChecklist(event) {
  if (!event || typeof event !== "object") return "";
  const title = typeof event.taskTitle === "string" ? event.taskTitle.trim() : "";
  const description = typeof event.taskDescription === "string" ? event.taskDescription : "";
  const lines = [];
  lines.push("### Welcome checklist");
  lines.push("Thanks for creating " + (title ? "**" + title + "**" : "this task") + "! Please make sure it is actionable:");
  lines.push("");
  lines.push("- [ ] Acceptance criteria are written down");
  lines.push("- [ ] Size estimate added (S / M / L)");
  lines.push("- [ ] Related links attached (designs, docs, prior tasks)");
  if (looksLikeBug(title + "\n" + description)) {
    lines.push("- [ ] Reproduction steps included (this looks like a bug)");
    lines.push("- [ ] Expected vs actual behaviour described");
  }
  let text = lines.join("\n");
  if (text.length > MAX_COMMENT_LENGTH) {
    text = text.slice(0, MAX_COMMENT_LENGTH - 3) + "...";
  }
  return text;
}

export async function taskCreated(event) {
  const text = buildChecklist(event);
  if (!text) return [];
  return [{ type: "comment", value: text }];
}

export const hooks = {
  "task.created": taskCreated,
};
