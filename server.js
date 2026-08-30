const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

// Database រក្សាទុក Mapping រវាង Username និង Telegram Chat ID
const userDatabase = {};

// ប្រើប្រាស់ Bot ថ្មីតែមួយគត់ដើម្បីការពារការជាន់គ្នា (Conflict Polling)
const token = process.env.NEW_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
let bot = null;

if (token) {
  bot = new TelegramBot(token, { polling: true });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
      "សួស្តីបង Sideth! 🤖 Telegram Mail Bot បានដំណើរការហើយ 🎉\n\n" +
      "ពាក្យបញ្ជាដែលមាន:\n" +
      "/create <username> - សម្រាប់បង្កើតអ៊ីម៉ែល (ឧ. /create test)"
    );
  });

  bot.onText(/\/create (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const username = match[1].trim().toLowerCase();
    
    // บันทึกទិន្នន័យចូល Database
    userDatabase[username] = chatId;

    bot.sendMessage(chatId, 
      `✅ បង្កើតអ៊ីម៉ែលជោគជ័យ!\n\n` +
      `📧 អាសយដ្ឋានរបស់អ្នកគឺ៖ \`${username}@sideth.site\`\n\n` +
      `ពេលមានគេផ្ញើ Verification Code មកកាន់អ៊ីម៉ែលនេះ វានឹងលោតចូលទីនេះអូតូ!`, 
      { parse_mode: 'Markdown' }
    );
  });

  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (text && !text.startsWith('/start') && !text.startsWith('/create')) {
      bot.sendMessage(chatId, `បងបានផ្ញើសារថា៖ "${text}"\nប្រើពាក្យបញ្ជា /create <name> ដើម្បីបង្កើត Email!`);
    }
  });
  console.log("Telegram Bot is running smoothly...");
}

// Webhook Endpoint សម្រាប់ទទួល Email ពី Cloudflare Worker
app.post('/webhook-email', async (req, res) => {
    try {
        const { username, to, from, subject, body } = req.body;
        const chatId = userDatabase[username]; 

        if (chatId && bot) {
            const telegramMessage = `📩 **មាន Email ថ្មីចូលមកកាន់:** \`${to}\`\n\n` +
                                    `👤 **ពី:** ${from}\n` +
                                    `📌 **ប្រធានបទ:** ${subject}\n\n` +
                                    `📜 **ខ្លឹមសារ / កូដផ្ទៀងផ្ទាត់:**\n${body.substring(0, 1500)}`;

            await bot.sendMessage(chatId, telegramMessage, { parse_mode: 'Markdown' });
        }

        res.status(200).send({ success: true });
    } catch (error) {
        console.error("Error handling incoming email:", error);
        res.status(500).send({ error: error.message });
    }
});

app.get('/', (req, res) => {
  res.send("DSN Email Telegram Bridge is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
