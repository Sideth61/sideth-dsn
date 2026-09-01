const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const TRANSLATE_API_KEY = process.env.TRANSLATE_API_KEY;
const TRANSLATE_ENDPOINT = process.env.TRANSLATE_ENDPOINT || "https://translationprovider.org/api/v1/translate";

// API Endpoint សម្រាប់ទទួលសំណើពី Frontend DSN Translator
app.post('/api/translate', async (req, res) => {
    try {
        const { text, source, target } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });

        // ផ្ញើសំណើទៅកាន់ External API ដោយលាក់ Secret Key ក្នុង Server មិនឱ្យធ្លាយក្នុង Browser
        const response = await fetch(TRANSLATE_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${TRANSLATE_API_KEY}`
            },
            body: JSON.stringify({ q: text, source: source, target: target })
        });

        const data = await response.json();
        res.json({ translatedText: data.translatedText || data.data?.translations?.[0]?.translatedText });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 DSN OS Server is running securely on port ${PORT} for Sideth ❤️️`);
});
