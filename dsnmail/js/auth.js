import { apiRequest } from "./api.js";

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  try {
    const res = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    sessionStorage.setItem("DSN_MAIL_TOKEN", res.token);
    window.location.href = "inbox.html";
  } catch (err) {
    document.getElementById("errorMsg").textContent = err.message;
  }
});
