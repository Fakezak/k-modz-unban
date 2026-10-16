// api/id.js — responses in the format the client understands
const SUSPENSION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

const BANS = {
  "8749607076": "2026-10-15T00:00:00Z",
};

export default function handler(req, res) {
  res.setHeader("content-type", "text/plain");
  res.setHeader("cache-control", "no-store");
  res.setHeader("access-control-allow-origin", "*");

  const playerId = req.query.id;

  // No UID → OK
  if (!playerId) {
    return res.status(200).send("OK");
  }

  // Not in ban list → OK
  const banStart = BANS[playerId];
  if (!banStart) {
    return res.status(200).send("OK");
  }

  // Check 5-day window
  const endTime = Date.parse(banStart) + SUSPENSION_MS;

  if (Date.now() >= endTime) {
    return res.status(200).send("OK");
  }

  // Still suspended — plain ISO date only
  return res.status(200).send(`SUSPENDED ${new Date(endTime).toISOString()}`);
}
