// DSN AI Studio - API Gateway Connector
const API_BASE_URL = window.location.origin.includes('localhost') 
    ? 'http://localhost:3000/api' 
    : 'https://your-server-domain.com/api'; // ជំនួសដោយ Link Server របស់បងពេល Deploy

async function callAIChatAPI(message, model = "dsn-local-model") {
    try {
        const response = await fetch(`${API_BASE_URL}/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message, model })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.reply; // ទទួលយកចម្លើយត្រឡប់មកវិញ
    } catch (error) {
        console.error("API Call Error:", error);
        return "⚠️ អូនសុំទោស! មិនអាចតភ្ជាប់ទៅកាន់ DSN Server បានទេ សូមផ្ទៀងផ្ទាត់ការដំណើរការ Server ឡើងវិញ។";
    }
}
