// api/id.js
export default function handler(req, res) {
  res.setHeader("content-type", "text/plain");
  res.setHeader("cache-control", "no-store");
  res.setHeader("access-control-allow-origin", "*");

  res.setHeader("x-auth", "ok");
  res.setHeader("x-session", "valid");
  res.setHeader("x-handshake", "accepted");
  res.setHeader("x-status", "ok");
  res.setHeader("x-color", "green");
  res.setHeader("x-message", "Proxy connection restored");
  res.setHeader("x-server-time", String(Date.now()));

  return res.status(200).send("OK");
}
