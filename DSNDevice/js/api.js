const WORKER_URL = "https://polished-paper-2014.sansidet63.workers.dev";

const DSNAPI = {
  async checkHealth() {
    try {
      const res = await fetch(WORKER_URL);
      return await res.text();
    } catch (e) {
      return "Offline";
    }
  },

  async getGames() {
    try {
      const res = await fetch(`${WORKER_URL}/api/games`);
      return await res.json();
    } catch (e) {
      console.error("❌ មិនអាចទាញយកបញ្ជីហ្គេមបានទេ:", e);
      return [];
    }
  }
};
