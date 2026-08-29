// db.js - រួមបញ្ចូលទាំង Save, Load, Delete និង Search
let db;
const dbRequest = indexedDB.open("NitaLoveDB", 2);

dbRequest.onerror = (event) => {
    console.error("Database error: ", event.target.error);
};

dbRequest.onsuccess = (event) => {
    db = event.target.result;
    console.log("Database NitaLoveDB បានបើកដំណើរការជោគជ័យ!");
};

dbRequest.onupgradeneeded = (event) => {
    let database = event.target.result;
    if (!database.objectStoreNames.contains("loveStore")) {
        database.createObjectStore("loveStore", { autoIncrement: true });
    }
};

// មុខងារ Save
function saveOfflineData(dataValue, callback) {
    if (!db) return;
    const transaction = db.transaction(["loveStore"], "readwrite");
    const store = transaction.objectStore("loveStore");
    const request = store.add({ content: dataValue, time: new Date() });
    request.onsuccess = () => { if (callback) callback(true); };
}

// មុខងារ Load ទាំងអស់
function loadAllOfflineData(callback) {
    if (!db) return;
    const transaction = db.transaction(["loveStore"], "readonly");
    const store = transaction.objectStore("loveStore");
    const request = store.getAll();
    request.onsuccess = (event) => { callback(event.target.result); };
}

// មុខងារ លុបទិន្នន័យតាម ID
function deleteOfflineData(id, callback) {
    if (!db) return;
    const transaction = db.transaction(["loveStore"], "readwrite");
    const store = transaction.objectStore("loveStore");
    const request = store.delete(Number(id));
    request.onsuccess = () => { if (callback) callback(true); };
}
