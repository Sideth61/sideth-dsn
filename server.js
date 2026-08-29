import "dotenv/config";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT || 3000);
const PIN = process.env.DSN_ADMIN_PIN || "";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "change-this-secret";
const POLL_SECONDS = Math.max(15, Number(process.env.POLL_SECONDS || 30));
const STATE_FILE = path.resolve(process.env.STATE_FILE || "./data/email-state.json");

const mailboxes = [
  {
    id: "gmail1",
    name: "sansidet63@gmail.com",
    user: process.env.EMAIL_1_USER || "sansidet63@gmail.com",
    pass: process.env.EMAIL_1_PASS || "",
    host: process.env.EMAIL_1_HOST || "imap.gmail.com",
    port: Number(process.env.EMAIL_1_PORT || 993),
    secure: process.env.EMAIL_1_SECURE !== "false",
  },
  {
    id: "gmail2",
    name: "sideth7554@gmail.com",
    user: process.env.EMAIL_2_USER || "sideth7554@gmail.com",
    pass: process.env.EMAIL_2_PASS || "",
    host: process.env.EMAIL_2_HOST || "imap.gmail.com",
    port: Number(process.env.EMAIL_2_PORT || 993),
    secure: process.env.EMAIL_2_SECURE !== "false",
  },
  {
    id: "gmail3",
    name: "sansideth016@gmail.com",
    user: process.env.EMAIL_3_USER || "sansideth016@gmail.com",
    pass: process.env.EMAIL_3_PASS || "",
    host: process.env.EMAIL_3_HOST || "imap.gmail.com",
    port: Number(process.env.EMAIL_3_PORT || 993),
    secure: process.env.EMAIL_3_SECURE !== "false",
  },
  {
    id: "gmail4",
    name: "sidetuza@gmail.com",
    user: process.env.EMAIL_4_USER || "sidetuza@gmail.com",
    pass: process.env.EMAIL_4_PASS || "",
    host: process.env.EMAIL_4_HOST || "imap.gmail.com",
    port: Number(process.env.EMAIL_4_PORT || 993),
    secure: process.env.EMAIL_4_SECURE !== "false",
  },
  {
    id: "cloud",
    name: "",
    user: process.env.EMAIL_5_USER || "",
    pass: process.env.EMAIL_5_PASS || "",
    host: process.env.EMAIL_5_HOST || "",
    port: Number(process.env.EMAIL_5_PORT || 993),
    secure: process.env.EMAIL_5_SECURE !== "false",
  },
];

const runtime = new Map();

async function ensureStateDir() {
  await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
}

async function loadState() {
  await ensureStateDir();
  try {
    return JSON.parse(await fs.readFile(STATE_FILE, "utf8"));
  } catch {
    return { mailboxes: {} };
  }
}

async function saveState(state) {
  await ensureStateDir();
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

function requirePin(req, res, next) {
  if (!PIN) return res.status(503).json({ ok: false, error: "DSN_ADMIN_PIN is not configured" });
  const supplied = req.get("x-dsn-pin") || req.query.pin || "";
  if (supplied !== PIN) return res.status(401).json({ ok: false, error: "Unauthorized" });
  next();
}

async function telegram(method, body) {
  if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.description || `Telegram ${method} failed`);
  return data;
}

function cleanText(value, max = 3000) {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim()
    .slice(0, max);
}

function escapeTelegram(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatEmail(mailbox, parsed, uid) {
  const from = parsed.from?.text || parsed.from?.value?.map(x => x.address).join(", ") || "Unknown";
  const subject = parsed.subject || "(No subject)";
  const date = parsed.date ? parsed.date.toLocaleString() : new Date().toLocaleString();
  const text = cleanText(parsed.text || parsed.html?.replace(/<[^>]+>/g, " ") || "(No message body)", 2800);

  return [
    "📩 <b>NEW EMAIL</b>",
    "",
    `📬 <b>To:</b> ${escapeTelegram(mailbox.name)}`,
    `👤 <b>From:</b> ${escapeTelegram(from)}`,
    `📌 <b>Subject:</b> ${escapeTelegram(subject)}`,
    `🕐 <b>Date:</b> ${escapeTelegram(date)}`,
    `🆔 <b>UID:</b> ${uid}`,
    "",
    `📝 <b>Message:</b>`,
    escapeTelegram(text || "(empty)"),
  ].join("\n");
}

async function notifyTelegram(mailbox, parsed, uid) {
  if (!TELEGRAM_CHAT_ID) throw new Error("TELEGRAM_CHAT_ID is not configured");
  await telegram("sendMessage", {
    chat_id: TELEGRAM_CHAT_ID,
    text: formatEmail(mailbox, parsed, uid),
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
}

async function pollMailbox(mailbox, state) {
  if (!mailbox.pass || !mailbox.host) {
    runtime.set(mailbox.id, { status: "not-configured", error: "Missing password or IMAP host", at: new Date().toISOString() });
    return;
  }

  const previousUid = Number(state.mailboxes[mailbox.id]?.lastUid || 0);
  const client = new ImapFlow({
    host: mailbox.host,
    port: mailbox.port,
    secure: mailbox.secure,
    auth: { user: mailbox.user, pass: mailbox.pass },
    logger: false,
    socketTimeout: 30000,
    greetingTimeout: 30000,
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      const search = previousUid > 0
        ? { uid: `${previousUid + 1}:*` }
        : { all: true };

      const messages = [];
      for await (const msg of client.fetch(search, { uid: true, envelope: true, source: true })) {
        messages.push(msg);
      }

      messages.sort((a, b) => Number(a.uid) - Number(b.uid));

      let highestUid = previousUid;

      for (const msg of messages) {
        const uid = Number(msg.uid);
        if (uid <= previousUid) continue;
        const parsed = await simpleParser(msg.source);
        await notifyTelegram(mailbox, parsed, uid);
        highestUid = Math.max(highestUid, uid);
      }

      if (highestUid !== previousUid) {
        state.mailboxes[mailbox.id] = {
          lastUid: highestUid,
          lastChecked: new Date().toISOString(),
        };
        await saveState(state);
      } else {
        state.mailboxes[mailbox.id] = {
          ...(state.mailboxes[mailbox.id] || {}),
          lastChecked: new Date().toISOString(),
        };
        await saveState(state);
      }

      runtime.set(mailbox.id, {
        status: "online",
        lastUid: highestUid,
        lastChecked: new Date().toISOString(),
        newMessages: Math.max(0, messages.length),
      });
    } finally {
      lock.release();
    }
    await client.logout();
  } catch (error) {
    runtime.set(mailbox.id, {
      status: "error",
      error: error.message,
      at: new Date().toISOString(),
    });
    try { await client.logout(); } catch {}
    console.error(`[EMAIL ERROR] ${mailbox.name}: ${error.message}`);
  }
}

let pollRunning = false;
async function pollAll() {
  if (pollRunning) return;
  pollRunning = true;
  try {
    const state = await loadState();
    for (const mailbox of mailboxes) {
      await pollMailbox(mailbox, state);
    }
  } finally {
    pollRunning = false;
  }
}

// Telegram webhook: useful for /start and /status.
// Email delivery itself uses TELEGRAM_CHAT_ID and does not require webhook.
app.post(`/telegram/webhook/${encodeURIComponent(TELEGRAM_WEBHOOK_SECRET)}`, async (req, res) => {
  try {
    const update = req.body || {};
    const message = update.message;
    if (!message?.chat?.id) return res.json({ ok: true });

    const text = String(message.text || "").trim().toLowerCase();
    if (text === "/start") {
      await telegram("sendMessage", {
        chat_id: message.chat.id,
        text: "🤖 <b>DSN Email Bridge</b> online.\n\n📩 ខ្ញុំនឹងបញ្ជូន Email ថ្មីពី 5 Inbox ទៅ Telegram។\n\n/status — មើលស្ថានភាព",
        parse_mode: "HTML",
      });
    } else if (text === "/status") {
      const lines = mailboxes.map(m => {
        const s = runtime.get(m.id);
        return `${s?.status === "online" ? "🟢" : s?.status === "not-configured" ? "⚪" : "🔴"} ${m.name} — ${s?.status || "waiting"}`;
      });
      await telegram("sendMessage", {
        chat_id: message.chat.id,
        text: "📊 <b>DSN Email Bridge Status</b>\n\n" + lines.map(escapeTelegram).join("\n"),
        parse_mode: "HTML",
      });
    }
    res.json({ ok: true });
  } catch (error) {
    console.error("[TELEGRAM WEBHOOK]", error.message);
    res.json({ ok: true });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "DSN Email → Telegram Bridge",
    pollSeconds: POLL_SECONDS,
    mailboxes: mailboxes.map(m => m.name),
  });
});

app.get("/api/status", requirePin, (_req, res) => {
  res.json({
    ok: true,
    runtime: Object.fromEntries(runtime.entries()),
  });
});

app.post("/api/poll", requirePin, async (_req, res) => {
  await pollAll();
  res.json({ ok: true, message: "Poll completed" });
});

async function configureWebhook() {
  if (!TELEGRAM_BOT_TOKEN || !process.env.PUBLIC_BASE_URL) return;
  const url = `${process.env.PUBLIC_BASE_URL.replace(/\/$/, "")}/telegram/webhook/${encodeURIComponent(TELEGRAM_WEBHOOK_SECRET)}`;
  try {
    await telegram("setWebhook", { url });
    console.log(`[TELEGRAM] Webhook set: ${url}`);
  } catch (error) {
    console.error(`[TELEGRAM] Webhook setup failed: ${error.message}`);
  }
}

app.listen(PORT, async () => {
  console.log(`\n🚀 DSN Email Bridge running on http://localhost:${PORT}`);
  console.log(`📩 Poll interval: ${POLL_SECONDS}s`);
  console.log(`📬 Mailboxes configured: ${mailboxes.length}`);
  await configureWebhook();
  await pollAll();
  setInterval(pollAll, POLL_SECONDS * 1000);
});
