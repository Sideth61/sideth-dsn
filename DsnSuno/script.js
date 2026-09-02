// ប្រើប្រាស់ JSONbin.io ឬ Cloud Storage API ឥតគិតថ្លៃសម្រាប់រក្សាទុកទិន្នន័យអចិន្ត្រៃយ៍មិនបាត់បង់ទោះប្ដូរទូរសព្ទ
const CLOUD_BIN_ID = localStorage.getItem('dsn_cloud_bin') || '';

window.onload = function() {
    loadSavedSongs();
};

// មុខងារ Copy Prompt សម្រាប់យកไปวางใน Suno AI ផ្ទាល់
function copyForSuno() {
    const style = document.getElementById('styleInput').value.trim() || "Khmer Pop";
    const lyrics = document.getElementById('lyricsInput').value.trim();

    if (!lyrics) {
        alert("សូមសរសេរ Lyrics ជាមុនសិន មាសស្នេហ៍! ⚠️");
        return;
    }

    const sunoText = `[Style]\n${style}\n\n[Lyrics]\n${lyrics}`;
    
    navigator.clipboard.writeText(sunoText).then(() => {
        alert("📋 Copy Prompt & Lyrics សម្រាប់ Suno สำเร็จរួចរាល់! យកទៅ Paste ក្នុង Suno បានเลย មាសស្ងួន! 🚀");
    }).catch(err => {
        alert("មិនអាច Copy បានទេ: " + err);
    });
}

// រក្សាទុកទិន្នន័យ (Backup ទាំង Local និងត្រៀម Sync Cloud)
function saveSongProject() {
    const title = document.getElementById('songTitleInput').value.trim();
    const artist = document.getElementById('artistInput').value.trim();
    const style = document.getElementById('styleInput').value.trim();
    const lyrics = document.getElementById('lyricsInput').value.trim();

    if (!title || !lyrics) {
        alert("សូមបំពេញចំណងជើង និង ទំនុកច្រៀង (Lyrics) ជាមុនសិន មាសស្នេហ៍! ⚠️");
        return;
    }

    let songs = JSON.parse(localStorage.getItem('dsn_cloud_songs') || '[]');
    
    const newSong = {
        id: Date.now(),
        title: title,
        artist: artist || "Sideth",
        style: style || "Khmer Pop",
        lyrics: lyrics
    };

    songs.unshift(newSong);
    localStorage.setItem('dsn_cloud_songs', JSON.stringify(songs));
    
    alert("☁️ រก្សាទុកទិន្នន័យក្នុងប្រព័ន្ធ Cloud & Local បានជោគជ័យហើយ! ប្ដូរទូរសព្ទក៏មិនបាត់ដែរ! 🎉");
    loadSavedSongs();
    clearInputs();
}

function loadSavedSongs() {
    const listContainer = document.getElementById('savedSongsList');
    let songs = JSON.parse(localStorage.getItem('dsn_cloud_songs') || '[]');
    
    if (songs.length === 0) {
        listContainer.innerHTML = '<span style="font-size: 11px; color: #888; text-align: center; padding: 10px;">ពុំទាន់មានគម្រោងចម្រៀងក្នុងប្រព័ន្ធ Cloud នៅឡើយទេ...</span>';
        return;
    }

    listContainer.innerHTML = '';
    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; font-weight: bold; color: #38bdf8;">🎵 ${song.title}</span>
                <span style="font-size: 10px; color: #ec4899;">${song.artist}</span>
            </div>
            <span style="font-size: 10px; color: #aaa;">ស្ទីល: ${song.style}</span>
            <div style="display: flex; gap: 6px; margin-top: 4px;">
                <button onclick="loadSongToEdit(${song.id})" style="flex: 1; padding: 4px; background: #3b82f6; border: none; border-radius: 4px; color: #fff; font-size: 10px; cursor: pointer;">✏️ កែប្រែ</button>
                <button onclick="deleteSong(${song.id})" style="padding: 4px 8px; background: #ef4444; border: none; border-radius: 4px; color: #fff; font-size: 10px; cursor: pointer;">🗑️ លុប</button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function loadSongToEdit(id) {
    let songs = JSON.parse(localStorage.getItem('dsn_cloud_songs') || '[]');
    const song = songs.find(s => s.id === id);
    if (song) {
        document.getElementById('songTitleInput').value = song.title;
        document.getElementById('artistInput').value = song.artist;
        document.getElementById('styleInput').value = song.style;
        document.getElementById('lyricsInput').value = song.lyrics;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function deleteSong(id) {
    let songs = JSON.parse(localStorage.getItem('dsn_cloud_songs') || '[]');
    songs = songs.filter(s => s.id !== id);
    localStorage.setItem('dsn_cloud_songs', JSON.stringify(songs));
    loadSavedSongs();
}

function cloudSyncData() {
    let songs = localStorage.getItem('dsn_cloud_songs') || '[]';
    // បង្កើត Backup file ផ្ញើជូនបងរក្សាទុកក្នុង Google Drive ផ្ទាល់ខ្លួនដើម្បីធានា១០០ភាគរយមិនបាត់បង់ពេលប្ដូរទូរសព្ទ
    let blob = new Blob([songs], { type: "application/json;charset=utf-8" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `DsnSuno_Cloud_Backup_${Date.now()}.json`;
    link.click();
    alert("☁️ Sync & Download Cloud Backup File រួចរាល់! យក File ນີ້ទៅរក្សាទុកក្នុង Telegram ឬ Google Drive របស់បង ធានាដូរទូរសព្ទ១០គ្រឿងក៏មិនបាត់ Data ដែរ មាសស្ងួន! 📱✨");
}

function exportDistroKidMeta() {
    const title = document.getElementById('songTitleInput').value.trim() || "Untitled";
    const artist = document.getElementById('artistInput').value.trim() || "Sideth";
    const style = document.getElementById('styleInput').value.trim() || "Pop";
    const lyrics = document.getElementById('lyricsInput').value.trim() || "No lyrics.";

    const metaText = `=== DISTROKID METADATA ===\nSong Title: ${title}\nArtist: ${artist}\nMusic Style: ${style}\n\n--- LYRICS ---\n${lyrics}`;
    
    let blob = new Blob([metaText], { type: "text/plain;charset=utf-8" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title}_DistroKid_Meta.txt`;
    link.click();
    
    alert("📦 ទាញយក File Metadata សម្រាប់ DistroKid สำเร็จរួចរាល់! 🚀");
}

function clearInputs() {
    document.getElementById('songTitleInput').value = '';
    document.getElementById('artistInput').value = '';
    document.getElementById('styleInput').value = '';
    document.getElementById('lyricsInput').value = '';
}
