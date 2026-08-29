import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// យក Token ពី Environment Variables របស់ Render
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("Error: TELEGRAM_BOT_TOKEN is missing in environment variables!");
}

// បង្កើត Telegram Bot ដោយប្រើ Polling
const bot = new TelegramBot(token, { polling: true });

// បង្កើត Express Server ធម្មតាដើម្បីទប់កុំឱ្យ Render Sleep
app.get('/', (req, res) => {
  res.send('DSN Email Telegram Bridge is running!');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// កូដសម្រាប់ឱ្យ Bot ចាប់យកសារ /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "សួស្តីបង! Bot របស់បងបានតភ្ជាប់និងដំណើរការជោគជ័យហើយ 🎉");
});

// កូដសម្រាប់ឱ្យ Bot តបាល់រាល់សារទាំងអស់ដែលផ្ញើមក
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text && !text.startsWith('/start')) {
    bot.sendMessage(chatId, `បងបានផ្ញើសារមកថា៖ "${text}"`);
  }
});
