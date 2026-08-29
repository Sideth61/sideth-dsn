// កូដ JavaScript សម្រាប់ផ្ញើសារដំណឹងពី DSN PS2 Web Player ទៅកាន់ Telegram Bot
function sendTelegramAlert(playerName) {
    // ⚠️ ជំនួសលេខ 8678990806:AAELrvs8pD-MNBK0AT0IYo2x0LbFNMtxcCw ជាមួយ Bot Token របស់បង
    const botToken = "8678990806:AAELrvs8pD-MNBK0AT0IYo2x0LbFNMtxcCw";
    
    // ⚠️ ជំនួស -100xxxxxxxxxx ឬ @dethdsn ជាមួយ Chat ID របស់ Channel បង
    const chatId = "@dethdsn"; 
    
    // សារដែលត្រូវផ្ញើទៅកាន់ Channel
    const message = `🎮 ដំណឹងជ្រាប៖ មានកីឡាករឈ្មោះ [${playerName}] កំពុងចាប់ផ្តើមលេងហ្គេម PS2 នៅលើ DSN PS2 Web Player แล้วចាស៎! 🔥`;

    const url = `https://api.telegram.org/bot${8678990806: AAEL rv58pD-MNBKØATØIYo2x0LbFNMtxcCw}/sendMessage`;

    // ផ្ញើទិន្នន័យទៅកាន់ Telegram API តាមរយៈ POST Method
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            console.log("ផ្ញើសារដំណឹងទៅ Telegram បានជោគជ័យហើយប្រុសស្អិត! 🎉");
        } else {
            console.log("មានបញ្ហាបន្តិចបន្តួច៖", data.description);
        }
    })
    .catch(error => console.error("Error:", error));
}

// ឧទាហរណ៍ពេលមានអ្នកចុចប៊ូតុងលេងហ្គេម PS2 
// sendTelegramAlert("Sideth វីរបុរសប៉ៃលិន");
