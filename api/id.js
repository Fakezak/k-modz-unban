// api/id.js — full server (only file you update)
import { readFileSync } from "fs";
import { join } from "path";

const VALID_HASH = "d5a89b7c8deb5413cc7d3abec084b113d0b5f367cf84ca68c3a934754a9483f8";
const SUSPENSION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days
const DAY_MS = 24 * 60 * 60 * 1000;

// ============================================================
// BAN LIST — "UID": "ISO date ban started"
// Server adds 5 days automatically. Delete the line to unban.
// ============================================================
const BANS = {
  "8749607076": "2026-10-15T00:00:00Z",
};

// ============================================================
// MESSAGES the server sends back
// ============================================================
const MESSAGES = {
  banned:     "You are suspended",
  unbanNotif: "Your suspension has ended — welcome back",
  ok:         "OK",
  invalid:    "Data type error — contact admin",
};

// ============================================================
// Helper — sends the response with status in both body and headers
// ============================================================
function respond(res, status, message, extra = {}) {
  res.setHeader("content-type", "text/plain");
  res.setHeader("cache-control", "no-store");
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("x-ban-status", status);
  res.setHeader("x-ban-message", message);
  for (const [k, v] of Object.entries(extra)) res.setHeader(k, v);
  return res.status(200).send(message);
}

export default function handler(req, res) {
  // 1. Hash check
  if (req.query.unban !== VALID_HASH) {
    return respond(res, "invalid", MESSAGES.invalid);
  }

  // 2. Read UID from URL
  const playerId = req.query.id;
  if (!playerId) {
    return respond(res, "ok", MESSAGES.ok);
  }

  // 3. UID not banned
  const banStart = BANS[playerId];
  if (!banStart) {
    return respond(res, "ok", MESSAGES.ok, { "x-ban-uid": playerId });
  }

  // 4. Check 5-day timer
  const endTime = Date.parse(banStart) + SUSPENSION_MS;
  const now = Date.now();

  if (now >= endTime) {
    return respond(res, "ok", MESSAGES.unbanNotif, {
      "x-ban-uid": playerId,
      "x-ban-expired": "true",
    });
  }

  // 5. Still suspended
  const endDate = new Date(endTime).toISOString();
  const daysLeft = Math.max(1, Math.ceil((endTime - now) / DAY_MS));
  const hoursLeft = Math.max(1, Math.ceil((endTime - now) / (60 * 60 * 1000)));

  return respond(res, "suspended", MESSAGES.banned, {
    "x-ban-uid": playerId,
    "x-ban-until": endDate,
    "x-ban-days-left": String(daysLeft),
    "x-ban-hours-left": String(hoursLeft),
    "x-ban-message-detail": `You have been suspended for 5 days (${daysLeft} day(s) left)`,
  });
}
