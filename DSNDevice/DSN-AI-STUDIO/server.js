const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// API Gateway Endpoint for AI Chat
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, model } = req.body;
        const apiKey = process.env.AI_API_KEY; // 🔐 រក្សាទុកក្នុង .env មានសុវត្ថិភាពខ្ពស់

        if (!message) {
            return res.status(400).json({ error: "សូមបញ្ចូលសារជាមុនសិន!" });
        }

        // ត្រミュកទិន្នន័យឆ្លើយតប (អាចប្តូរទៅហៅ External AI Provider API ពិតប្រាកដនៅទីនេះ)
        res.json({
            status: "success",
            reply: `បាទ/ចាស៑ សាររបស់បង " ${message} " ត្រូវបានដំណើរការដោយសុវត្ថិភាពតាម DSN Server ចាស៑! 😘`,
            modelUsed: model || "dsn-default-model"
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "មានបញ្ហាបច្ចេកទេសលើម៉ាស៊ីនមេ (Server Error)!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 DSN Server កំពុងដំណើរការលើ Port ${PORT} ជូនបង Sideth❤️️ ហើយ!`);
});
