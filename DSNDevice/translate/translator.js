// DSN Translator Engine - Sideth
const DSNTranslatorEngine = {
    translate: async function(text, sourceLang = 'en', targetLang = 'km') {
        if (!text.trim()) return "";
        try {
            let res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, source: sourceLang, target: targetLang })
            });
            let data = await res.json();
            return data.translatedText || "⚠️ កំហុសក្នុងការតភ្ជាប់ Server!";
        } catch (err) {
            console.error("Translation Error:", err);
            return "⚠️ មិនអាចតភ្ជាប់ទៅកាន់ DSN Translator Server បានទេ!";
        }
    }
};
