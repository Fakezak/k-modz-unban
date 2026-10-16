// api/id.js — expanded server
import { readFileSync } from "fs";
import { join } from "path";

const VALID_HASH = "d5a89b7c8deb5413cc7d3abec084b113d0b5f367cf84ca68c3a934754a9483f8";
const SUSPENSION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days
const DAY_MS = 24 * 60 * 60 * 1000;

function getBans() {
  try {
    const raw = readFileSync(join(process.cwd(), "bans.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function send(res, body, headers = {}) {
  res.setHeader("content-type", "text/plain");
  res.setHeader("cache-control", "no-store");
  res.setHeader("access-control-allow-origin", "*"); // let any game read it
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  return res.status(200).send(body);
}

export default function handler(req, res) {
  // 1. hash check
  if (req.query.unban !== VALID_HASH) {
    return send(res, "invalid", {
      "x-ban-status": "invalid",
      "x-ban-message": "Config invalid — contact admin"
    });
  }

  // 2. no id → OK
  const playerId = req.query.id;
  if (!playerId) {
    return send(res, "OK", {
      "x-ban-status": "ok"
    });
  }

  // 3. look up ban
  const bans = getBans();
  const banStart = bans[playerId];

  if (!banStart) {
    return send(res, "OK", {
      "x-ban-status": "ok",
      "x-ban-uid": playerId
    });
  }

  // 4. ban expired → OK
  const endTime = Date.parse(banStart) + SUSPENSION_MS;
  const now = Date.now();

  if (now >= endTime) {
    return send(res, "OK", {
      "x-ban-status": "ok",
      "x-ban-uid": playerId,
      "x-ban-expired": "true"
    });
  }

  // 5. still suspended → send everything the client needs
  const endDate = new Date(endTime).toISOString();
  const daysLeft = Math.max(1, Math.ceil((endTime - now) / DAY_MS));
  const hoursLeft = Math.max(1, Math.ceil((endTime - now) / (60 * 60 * 1000)));

  // human-readable body: "SUSPENDED <iso>|<days>|<hours>"
  const body = `SUSPENDED ${endDate}|${daysLeft}|${hoursLeft}`;

  return send(res, body, {
    "x-ban-status": "suspended",
    "x-ban-uid": playerId,
    "x-ban-until": endDate,
    "x-ban-days-left": String(daysLeft),
    "x-ban-hours-left": String(hoursLeft),
    "x-ban-reason": "Policy violation" // edit per UID if you want
  });
}
