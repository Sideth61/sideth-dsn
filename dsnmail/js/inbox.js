import { apiRequest } from "./api.js";

async function loadInbox() {
  try {
    const data = await apiRequest("/mail/inbox");
    const mailList = document.getElementById("mailList");
    mailList.innerHTML = data.mails.map(m => `
      <div class="mail-item">
        <span><b>${m.sender}</b> - ${m.subject}</span>
        <span>${m.date}</span>
      </div>
    `).join("");
  } catch (err) {
    console.error(err);
  }
}
loadInbox();
