// api/id.js — always returns login error with green color hint
export default function handler(req, res) {
  res.setHeader("content-type", "text/plain");
  res.setHeader("cache-control", "no-store");
  res.setHeader("access-control-allow-origin", "*");

  res.setHeader("x-ban-status", "error");
  res.setHeader("x-ban-color", "green");
  res.setHeader("x-ban-message", "Login error — please try again");

  return res.status(200).send("Login error — please try again");
}
