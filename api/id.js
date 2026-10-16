// api/id.js — /id?id=<UID> returns OK + userid + isban
const SUSPENSION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days
const DAY_MS = 24 * 60 * 60 * 1000;

// ============================================================
// BAN LIST — "UID": "ISO date ban started"
// Server adds 5 days. Delete the line to unban.
// ============================================================
const BANS = {
  "8749607076": "2026-10-15T00:00:00Z",
};

export default function handler(req, res) {
  res.setHeader("content-type", "text/plain");
  res.setHeader("cache-control", "no-store");
  res.setHeader("access-control-allow-origin", "*");

  const playerId = req.query.id;

  // ---- No UID → OK with empty userid ----
  if (!playerId) {
    res.setHeader("x-ban-status", "ok");
    res.setHeader("x-ban-color", "green");
    return res.status(200).send("OK userid=unknown isban=false");
  }

  // ---- UID not in ban list → OK, isban=false ----
  const banStart = BANS[playerId];
  if (!banStart) {
    res.setHeader("x-ban-status", "ok");
    res.setHeader("x-ban-color", "green");
    return res.status(200).send(`OK userid=${playerId} isban=false`);
  }

  // ---- Check 5-day window ----
  const endTime = Date.parse(banStart) + SUSPENSION_MS;
  const now = Date.now();

  if (now >= endTime) {
    res.setHeader("x-ban-status", "ok");
    res.setHeader("x-ban-color", "green");
    res.setHeader("x-ban-expired", "true");
    return res.status(200).send(`OK userid=${playerId} isban=false`);
  }

  // ---- Still suspended → SUSPENDED, isban=true ----
  const endDate = new Date(endTime).toISOString();
  const daysLeft = Math.max(1, Math.ceil((endTime - now) / DAY_MS));

  res.setHeader("x-ban-status", "suspended");
  res.setHeader("x-ban-color", "red");
  res.setHeader("x-ban-until", endDate);
  res.setHeader("x-ban-days-left", String(daysLeft));
  return res.status(200).send(`SUSPENDED userid=${playerId} isban=true until=${endDate} daysleft=${daysLeft}`);
}
