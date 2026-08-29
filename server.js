នេះមែន
const TelegramBot = require('node-telegram-bot-api');

// យក Token ពី Environment Variables របស់ Render ដោយស្វ័យប្រវត្តិ
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// ពេលមានគេផ្ញើសារ /start មកកាន់ Bot
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "សួស្តីបង! Telegram Bot (@sideth_bot) របស់បងបានដំណើរការជោគជ័យហើយ 🎉");
});

// ចាប់គ្រប់សារទាំងអស់ដែលគេឆាតមក
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text && !text.startsWith('/start')) {
    bot.sendMessage(chatId, `បងបានផ្ញើសារមកថា៖ "${text}"`);
  }
});

console.log("Telegram Bot is running...");
