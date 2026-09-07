const express = require("express");
const router = express.Router();

router.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "sideth61@sideth.site" && password === "@sidet@") {
    res.json({ token: "mock-jwt-token-sideth-vip", role: "admin" });
  } else {
    res.status(401).json({ error: "ឈ្មោះ ឬ Password មិនត្រឹមត្រូវ!" });
  }
});

router.get("/mail/inbox", (req, res) => {
  res.json({
    mails: [
      { id: 1, sender: "admin@sideth.site", subject: "ស្វាគមន៍មកកាន់ DSN Mail 🎉", date: "2026-06-07" },
      { id: 2, sender: "security@sideth.site", subject: "Security Alert: Login detected", date: "2026-06-06" }
    ]
  });
});

module.exports = router;
