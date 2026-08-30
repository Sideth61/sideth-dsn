const TelegramBot = require('node-telegram-bot-api');

// 1. Bot ចាស់ (ប្រើ Token ចាស់ពី Render)
const oldToken = process.env.TELEGRAM_BOT_TOKEN;
if (oldToken) {
  const oldBot = new TelegramBot(oldToken, { polling: true });
  
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
if (newToken) {
  const newBot = new TelegramBot(newToken, { polling: true });

  newBot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    newBot.sendMessage(chatId, "សួស្តីបង! Telegram Bot ថ្មី (@sideth_bot) បានដំណើរការជោគជ័យហើយ 🎉");
  });

  newBot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (text && !text.startsWith('/start')) {
      newBot.sendMessage(chatId, `Bot ថ្មីបានផ្ញើសារមកថា៖ "${text}"`);
    }
  });
  console.log("New Telegram Bot is running...");
}
