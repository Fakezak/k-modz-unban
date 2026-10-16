// api/id.js — always OK, no validation
export default function handler(req, res) {
  res.setHeader("content-type", "text/plain");
  res.setHeader("cache-control", "no-store");
  res.setHeader("access-control-allow-origin", "*");

  return res.status(200).send("OK");
}
