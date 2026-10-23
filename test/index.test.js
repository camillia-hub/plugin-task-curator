import test from "node:test";
import assert from "node:assert/strict";
import { buildChecklist, hooks, looksLikeBug, taskCreated } from "../index.js";

test("hooks map registers task.created", () => {
  assert.deepEqual(Object.keys(hooks), ["task.created"]);
  assert.equal(typeof hooks["task.created"], "function");
});

test("posts the base welcome checklist", async () => {
  const ops = await taskCreated({ taskTitle: "Add profile page", taskDescription: "New screen for users" });
  assert.equal(ops.length, 1);
  assert.equal(ops[0].type, "comment");
  assert.ok(ops[0].value.includes("Acceptance criteria"));
  assert.ok(ops[0].value.includes("Size estimate"));
  assert.ok(ops[0].value.includes("links"));
  assert.ok(ops[0].value.includes("**Add profile page**"));
  assert.ok(!ops[0].value.includes("Reproduction"));
});

test("adds reproduction steps when the task looks like a bug", async () => {
  const ops = await taskCreated({ taskTitle: "Fix crash on login", taskDescription: "It breaks with a 500 error" });
  assert.equal(ops.length, 1);
  assert.ok(ops[0].value.includes("Reproduction steps"));
  assert.ok(ops[0].value.includes("Expected vs actual"));
});

test("looksLikeBug matches whole words only", () => {
  assert.ok(looksLikeBug("there is a bug in checkout"));
  assert.ok(looksLikeBug("Crash on startup"));
  assert.ok(!looksLikeBug("Add a fixture for prefixes"));
});

test("still posts when only some fields exist", async () => {
  const ops = await taskCreated({});
  assert.equal(ops.length, 1);
  assert.ok(ops[0].value.includes("this task"));
});

test("never throws on missing or malformed events", async () => {
  assert.deepEqual(await taskCreated(undefined), []);
  assert.deepEqual(await taskCreated(null), []);
  assert.deepEqual(await taskCreated(7), []);
  assert.equal(buildChecklist(undefined), "");
});
