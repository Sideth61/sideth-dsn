DSN-MAIL/
├── index.html
├── inbox.html
├── compose.html
├── contacts.html
├── settings.html
├── admin.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── api.js
│   ├── auth.js
│   ├── inbox.js
│   ├── compose.js
│   ├── contacts.js
│   └── settings.js
├── server/
│   ├── server.js
│   ├── routes.js
│   ├── auth.js
│   ├── mail.js
│   └── storage.js
├── data/
│   ├── users.json
│   └── config.json
├── manifest.json
├── .env.example
└── README.md


🌐 Domain & Mail Server Configuration (MX, SPF, DKIM, DMARC)
ដើម្បីឱ្យវេបសាយ និងប្រព័ន្ធ Server ខាងលើអាចຮັບ-ផ្ញើ Email ចេញចូលជាមួយពិភពលោកបានពិតប្រាកដតាមដូម៉ែន ⁠sideth.site⁠ អ្នកត្រូវកំណត់ DNS Records នៅកន្លែងទិញ Domain (Cloudflare/Namecheap) ដូចខាងក្រោម៖
ខាងក្រោមនេះគឺជាកូដពេញលេញ និងស្ថាបត្យកម្មប្រព័ន្ធ (Full-Stack Architecture) សម្រាប់ DSN Mail Web App (@sideth.site) ដែលរៀបចំឡើងយ៉ាងស្អាតទាន់សម័យ ស្របតាមរចនាសម្ព័ន្ធဖိုင်ដែលបានកំណត់។
📂 File Structure
DSN-MAIL/
├── index.html
├── inbox.html
├── compose.html
├── contacts.html
├── settings.html
├── admin.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── api.js
│   ├── auth.js
│   ├── inbox.js
│   ├── compose.js
│   ├── contacts.js
│   └── settings.js
├── server/
│   ├── server.js
│   ├── routes.js
│   ├── auth.js
│   ├── mail.js
│   └── storage.js
├── data/
│   ├── users.json
│   └── config.json
├── manifest.json
├── .env.example
└── README.md

1. 🖥️ Frontend Files
index.html (Login & Entry Page)
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DSN Mail — Login</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body class="auth-body">
  <div class="auth-card">
    <div class="brand-header">
      <h2>📧 DSN MAIL</h2>
      <p>@sideth.site Secure Mail System</p>
    </div>
    <form id="loginForm">
      <div class="form-group">
        <label>Username / Email</label>
        <input type="text" id="username" placeholder="sideth61@sideth.site" required>
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="password" placeholder="••••••••" required>
      </div>
      <button type="submit" class="btn-primary">🔓 ចូលប្រព័ន្ធ (Login)</button>
      <p id="errorMsg" class="error-text"></p>
    </form>
  </div>
  <script type="module" src="js/auth.js"></script>
</body>
</html>

inbox.html (Main Mailbox Dashboard)
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inbox — DSN Mail</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body class="app-body">
  <div class="app-container">
    <aside class="sidebar">
      <div class="sidebar-brand">📧 DSN Mail</div>
      <a href="compose.html" class="btn-compose">✏️ Compose</a>
      <nav class="nav-menu">
        <a href="inbox.html" class="active">📥 Inbox</a>
        <a href="inbox.html?box=starred">⭐ Starred</a>
        <a href="inbox.html?box=sent">📤 Sent</a>
        <a href="inbox.html?box=drafts">📝 Drafts</a>
        <a href="inbox.html?box=archive">📦 Archive</a>
        <a href="inbox.html?box=spam">🚫 Spam</a>
        <a href="inbox.html?box=trash">🗑️ Trash</a>
        <a href="contacts.html">👥 Contacts</a>
        <a href="settings.html">⚙️ Settings</a>
        <a href="admin.html" id="adminLink" style="display:none;">🛡️ Admin Panel</a>
      </nav>
    </aside>
    <main class="main-content">
      <header class="top-bar">
        <input type="text" id="searchMail" placeholder="🔍 Search mail...">
        <div class="user-profile">
          <span id="userDisplayName">User</span>
          <button id="logoutBtn" class="btn-sm">🚪 ចេញ</button>
        </div>
      </header>
      <section class="mail-list-container">
        <div class="mail-toolbar">
          <button id="selectAll">selectAll</button>
          <button id="deleteSelected">🗑️ Delete</button>
          <button id="markRead">📖 Mark Read</button>
        </div>
        <div id="mailList" class="mail-list">
          <!-- Mail items loaded dynamically -->
        </div>
      </section>
    </main>
  </div>
  <script type="module" src="js/inbox.js"></script>
</body>
</html>

compose.html (Send Mail)
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <title>Compose — DSN Mail</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body class="app-body">
  <div class="compose-container">
    <h2>✨ សរសេរអ៊ីមែលថ្មី (New Message)</h2>
    <form id="composeForm">
      <input type="email" id="to" placeholder="To: recipient@sideth.site" required>
      <input type="text" id="subject" placeholder="Subject" required>
      <textarea id="body" rows="10" placeholder="Write your message here..."></textarea>
      <div class="compose-actions">
        <input type="file" id="attachment">
        <button type="submit" class="btn-primary">📤 ផ្ញើ (Send)</button>
        <button type="button" id="saveDraft" class="btn-secondary">📝 រក្សាទុកព្រាង (Draft)</button>
      </div>
    </form>
  </div>
  <script type="module" src="js/compose.js"></script>
</body>
</html>

admin.html (Admin Panel)
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <title>Admin Panel — DSN Mail</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body class="app-body">
  <div class="admin-container">
    <h2>🛡️ Admin Management Panel</h2>
    <div class="card">
      <h3>បង្កើតអ៊ីមែលថ្មី (Create Account)</h3>
      <form id="createUserForm">
        <input type="text" id="newUsername" placeholder="Username (เช่น sideth61)">
        <input type="text" id="newDisplayName" placeholder="Display Name">
        <input type="password" id="newPassword" placeholder="Password">
        <button type="submit" class="btn-primary">បង្កើតគណនី @sideth.site</button>
      </form>
    </div>
    <div class="card">
      <h3>បញ្ជីអ្នកប្រើប្រាស់ (User List)</h3>
      <div id="userList"></div>
    </div>
  </div>
  <script type="module" src="js/admin.js"></script>
</body>
</html>

2. 🎨 Stylesheet (css/style.css)
:root {
  --bg-color: #0f172a;
  --surface-color: #1e293b;
  --text-color: #f8fafc;
  --primary-color: #38bdf8;
  --border-color: #334155;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: var(--bg-color);
  color: var(--text-color);
}
.auth-body, .app-body { display: flex; height: 100vh; justify-content: center; align-items: center; }
.app-body { align-items: stretch; }
.auth-card, .card { background: var(--surface-color); padding: 30px; border-radius: 16px; border: 1px solid var(--border-color); width: 400px; }
.app-container { display: flex; width: 100%; height: 100vh; }
.sidebar { width: 240px; background: var(--surface-color); border-right: 1px solid var(--border-color); padding: 20px; display: flex; flex-direction: column; gap: 10px; }
.sidebar a { color: var(--text-color); text-decoration: none; padding: 10px; border-radius: 8px; display: block; }
.sidebar a:hover, .sidebar a.active { background: var(--primary-color); color: #000; font-weight: bold; }
.main-content { flex: 1; display: flex; flex-direction: column; }
.top-bar { display: flex; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid var(--border-color); background: var(--surface-color); }
input, textarea { width: 100%; padding: 12px; margin: 8px 0; background: var(--bg-color); border: 1px solid var(--border-color); color: #fff; border-radius: 8px; }
button { padding: 10px 16px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
.btn-primary { background: var(--primary-color); color: #000; }
.btn-secondary { background: var(--border-color); color: #fff; }
.mail-list { flex: 1; overflow-y: auto; padding: 20px; }
.mail-item { display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid var(--border-color); cursor: pointer; }
.mail-item:hover { background: rgba(56, 189, 248, 0.1); }

3. ⚙️ JavaScript Client Layer
js/api.js
const API_URL = "/api";

export async function apiRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem("DSN_MAIL_TOKEN");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API Request Failed");
  return data;
}

js/auth.js
import { apiRequest } from "./api.js";

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  try {
    const res = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    sessionStorage.setItem("DSN_MAIL_TOKEN", res.token);
    window.location.href = "inbox.html";
  } catch (err) {
    document.getElementById("errorMsg").textContent = err.message;
  }
});

js/inbox.js
import { apiRequest } from "./api.js";

async function loadInbox() {
  try {
    const data = await apiRequest("/mail/inbox");
    const mailList = document.getElementById("mailList");
    mailList.innerHTML = data.mails.map(m => `
      <div class="mail-item">
        <span><b>${m.sender}</b> - ${m.subject}</span>
        <span>${m.date}</span>
      </div>
    `).join("");
  } catch (err) {
    console.error(err);
  }
}
loadInbox();

4. 🖥️ Backend Server Layer (server/)
server/server.js
const express = require("express");
const app = express();
const routes = require("./routes");

app.use(express.json());
app.use(express.static(".")) // Serve frontend files

app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 DSN Mail Server running on port ${PORT}`);
});

server/routes.js
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

🌐 Domain & Mail Server Configuration (MX, SPF, DKIM, DMARC)
ដើម្បីឱ្យវេបសាយ និងប្រព័ន្ធ Server ខាងលើអាចຮັບ-ផ្ញើ Email ចេញចូលជាមួយពិភពលោកបានពិតប្រាកដតាមដូម៉ែន sideth.site អ្នកត្រូវកំណត់ DNS Records នៅកន្លែងទិញ Domain (Cloudflare/Namecheap) ដូចខាងក្រោម៖
| Type | Name / Host | Value / Target | Priority | Description |
|---|---|---|---|---|
| A | mail | IP របស់ Server អ្នក | - | កំណត់ mail.sideth.site |
| MX | @ | mail.sideth.site | 10 | កំណត់ Server ទទួល Email |
| TXT | @ | v=spf1 mx ~all | - | SPF Record (ការពារ Spam) |
| TXT | dkim._domainkey | v=DKIM1; k=rsa; p=... | - | DKIM Key (ហត្ថលេខាអ៊ីមែល) |
| TXT | _dmarc | v=DMARC1; p=reject; rua=mailto:admin@sideth.site | - | DMARC Policy (ប្រឆាំង Spoofing) |

