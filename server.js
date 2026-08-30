const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

// Database កន្លែងເກັບ Storage Mapping រវាង Username (ឧ. sssss) និង Telegram Chat ID
const userDatabase = {};

// 1. Bot ចាស់ (ប្រើ Token ចាស់ពី Render)
const oldToken = process.env.TELEGRAM_BOT_TOKEN;
let oldBot = null;
if (oldToken) {
  oldBot = new TelegramBot(oldToken, { polling: true });
  
  oldBot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    oldBot.sendMessage(chatId, "សួស្តីបង! Bot ចាស់ដំណើរការធម្មតា 🎉");
  });

  oldBot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (text && !text.startsWith('/start')) {
      oldBot.sendMessage(chatId, `Bot ចាស់ទទួលបានសារ៖ "${text}"`);
    }
  });
  console.log("Old Telegram Bot is running...");
}

// 2. Bot ថ្មី (ប្រើ Token ថ្មី `NEW_BOT_TOKEN` ពី Render)
const newToken = process.env.NEW_BOT_TOKEN;
let newBot = null;
if (newToken) {
  newBot = new TelegramBot(newToken, { polling: true });

  newBot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    newBot.sendMessage(chatId, 
      "សួស្តីបង! Telegram Bot ថ្មី បានដំណើរការជោគជ័យហើយ 🎉\n\n" +
      "ពាក្យបញ្ជា:\n" +
      "/create <username> - សម្រាប់បង្កើតអ៊ីម៉ែលបណ្ដោះអាសន្ន (ឧ. /create sssss)"
    );
  });

  // ຄຳສັ່ງសម្រាប់ឱ្យ User បង្កើត Email ផ្ទាល់ខ្លួន ឧ. /create sssss
  newBot.onText(/\/create (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const username = match[1].trim().toLowerCase();
    
    // រក្សាទុក Mapping ចូល Database
    userDatabase[username] = chatId;

    newBot.sendMessage(chatId, 
      `✅ បង្កើតអ៊ីម៉ែលสำเร็จ!\n\n` +
      `📧 អាសយដ្ឋានរបស់អ្នកគឺ៖ \`${username}@sideth.site\`\n\n` +
      `ពេលមានគេផ្ញើ Verification Code មកកាន់អ៊ីម៉ែលនេះ វានឹងលោតចូលទីនេះអូតូ!`, 
      { parse_mode: 'Markdown' }
    );
  });

  newBot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (text && !text.startsWith('/start') && !text.startsWith('/create')) {
      newBot.sendMessage(chatId, `Bot ថ្មីបានផ្ញើសារមកថា៖ "${text}"`);
    }
  });
  console.log("New Telegram Bot is running...");
}

// 3. Webhook Endpoint ចាំទទួល Email ពី Cloudflare Worker
app.post('/webhook-email', async (req, res) => {
    try {
        const { username, to, from, subject, body } = req.body;

        // ឆែកមើលថាតើ Username ហ្នឹងមាន Telegram Chat ID ណាជាម្ចាស់
        const chatId = userDatabase[username]; 

        if (chatId && newBot) {
            const telegramMessage = `📩 **មាន Email ថ្មីចូលមកកាន់:** \`${to}\`\n\n` +
                                    `👤 **ពី:** ${from}\n` +
                                    `📌 **ប្រធានបទ:** ${subject}\n\n` +
                                    `📜 **ខ្លឹមសារ / កូដផ្ទៀងផ្ទាត់:**\n${body.substring(0, 1500)}`;

            await newBot.sendMessage(chatId, telegramMessage, { parse_mode: 'Markdown' });
        }

        res.status(200).send({ success: true });
    } catch (error) {
        console.error("Error handling incoming email:", error);
        res.status(500).send({ error: error.message });
    }
});

// Start Express Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
