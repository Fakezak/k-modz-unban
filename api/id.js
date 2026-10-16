// api/id.js — no hash, only /id?id=<UID>
const SUSPENSION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days
const DAY_MS = 24 * 60 * 60 * 1000;

// ============================================================
// BAN LIST — "UID": "ISO date ban started"
// Server adds 5 days. Delete the line to unban early.
// ============================================================
const BANS = {
  "8749607076": "2026-10-15T00:00:00Z",
};

// ============================================================
// MESSAGES
// ============================================================
const MESSAGES = {
  banned:     "You are suspended",
  unbanNotif: "Your suspension has ended — welcome back",
  ok:         "OK",
};

export default function handler(req, res) {
  res.setHeader("content-type", "text/plain");
  res.setHeader("cache-control", "no-store");
  res.setHeader("access-control-allow-origin", "*");

  const playerId = req.query.id;

  // ---- No UID → OK ----
  if (!playerId) {
    res.setHeader("x-ban-status", "ok");
    res.setHeader("x-ban-color", "green");
    res.setHeader("x-ban-message", MESSAGES.ok);
    return res.status(200).send(MESSAGES.ok);
  }

  // ---- UID not banned → OK ----
  const banStart = BANS[playerId];
  if (!banStart) {
    res.setHeader("x-ban-status", "ok");
    res.setHeader("x-ban-color", "green");
    res.setHeader("x-ban-message", MESSAGES.ok);
    res.setHeader("x-ban-uid", playerId);
    return res.status(200).send(MESSAGES.ok);
  }

  // ---- Check 5-day window ----
  const endTime = Date.parse(banStart) + SUSPENSION_MS;
  const now = Date.now();

  if (now >= endTime) {
    res.setHeader("x-ban-status", "ok");
    res.setHeader("x-ban-color", "green");
    res.setHeader("x-ban-message", MESSAGES.unbanNotif);
    res.setHeader("x-ban-uid", playerId);
    res.setHeader("x-ban-expired", "true");
    return res.status(200).send(MESSAGES.unbanNotif);
  }

  // ---- Still suspended → red ----
  const endDate = new Date(endTime).toISOString();
  const daysLeft = Math.max(1, Math.ceil((endTime - now) / DAY_MS));
  const hoursLeft = Math.max(1, Math.ceil((endTime - now) / (60 * 60 * 1000)));
  const detail = `You have been suspended for 5 days (${daysLeft} day(s) left)`;

  res.setHeader("x-ban-status", "suspended");
  res.setHeader("x-ban-color", "red");
  res.setHeader("x-ban-message", detail);
  res.setHeader("x-ban-uid", playerId);
  res.setHeader("x-ban-until", endDate);
  res.setHeader("x-ban-days-left", String(daysLeft));
  res.setHeader("x-ban-hours-left", String(hoursLeft));
  return res.status(200).send(detail);
}
