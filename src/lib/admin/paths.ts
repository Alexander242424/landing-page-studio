import { join } from "node:path";

/** Server-only data root (gitignored except .gitkeep). */
export function dataRoot() {
  return join(process.cwd(), "data");
}

export function adminUsersPath() {
  return join(dataRoot(), "admin-users.json");
}

export function analyticsDir() {
  return join(dataRoot(), "analytics");
}

export function analyticsEventsPath() {
  return join(analyticsDir(), "events.jsonl");
}

/** Existing chat transcript store from chatPersistence.functions.ts */
export function chatEventsPath() {
  return join(process.cwd(), ".data", "chat-events.jsonl");
}
