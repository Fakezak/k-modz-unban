// api/id.js — auto-UID ban check
import { readFileSync } from "fs";
import { join } from "path";

const VALID_HASH = "d5a89b7c8deb5413cc7d3abec084b113d0b5f367cf84ca68c3a934754a9483f8";
const SUSPENSION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

function getBans() {
  try {
    const raw = readFileSync(join(process.cwd(), "bans.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default function handler(req, res) {
  res.setHeader("content-type", "text/plain");
  res.setHeader("cache-control", "no-store");

  // 1. Verify secret hash
  if (req.query.unban !== VALID_HASH) {
    return res.status(403).send("invalid");
  }

  // 2. Read the UID the client sent
  const playerId = req.query.id;
  if (!playerId) {
    return res.status(200).send("OK");
  }

  // 3. Not banned → OK
  const bans = getBans();
  const banStart = bans[playerId];
  if (!banStart) {
    return res.status(200).send("OK");
  }

  // 4. Ban expired → OK
  const endTime = Date.parse(banStart) + SUSPENSION_MS;
  if (Date.now() >= endTime) {
    return res.status(200).send("OK");
  }

  // 5. Still suspended
  return res.status(403).send(`SUSPENDED ${new Date(endTime).toISOString()}`);
}
