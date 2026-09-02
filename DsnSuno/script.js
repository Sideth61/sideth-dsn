window.onload = function() {
    loadSavedSongs();
};

function saveSongProject() {
    const title = document.getElementById('songTitleInput').value.trim();
    const artist = document.getElementById('artistInput').value.trim();
    const style = document.getElementById('styleInput').value.trim();
    const lyrics = document.getElementById('lyricsInput').value.trim();

    if (!title || !lyrics) {
        alert("សូមបំពេញចំណងជើង និង ទំនុកច្រៀង (Lyrics) ជាមុនសិន មាសស្នេហ៍! ⚠️");
        return;
    }

    let songs = JSON.parse(localStorage.getItem('dsn_songs') || '[]');
    
    const newSong = {
        id: Date.now(),
        title: title,
        artist: artist || "Sideth",
        style: style || "Khmer Pop",
        lyrics: lyrics
    };

    songs.unshift(newSong);
    localStorage.setItem('dsn_songs', JSON.stringify(songs));
    
    alert("💾 រក្សាទុកគម្រោងចម្រៀងបានដោយជោគជ័យហើយ មាសស្ងួន! 🎉");
    loadSavedSongs();
    clearInputs();
}

function loadSavedSongs() {
    const listContainer = document.getElementById('savedSongsList');
    let songs = JSON.parse(localStorage.getItem('dsn_songs') || '[]');
    
    if (songs.length === 0) {
        listContainer.innerHTML = '<span style="font-size: 11px; color: #888; text-align: center; padding: 10px;">ពុំទាន់មានគម្រោងចម្រៀងបានរក្សាទុកនៅឡើយទេ...</span>';
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
    let songs = JSON.parse(localStorage.getItem('dsn_songs') || '[]');
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
    let songs = JSON.parse(localStorage.getItem('dsn_songs') || '[]');
    songs = songs.filter(s => s.id !== id);
    localStorage.setItem('dsn_songs', JSON.stringify(songs));
    loadSavedSongs();
}

function exportDistroKidMeta() {
    const title = document.getElementById('songTitleInput').value.trim() || "Untitled";
    const artist = document.getElementById('artistInput').value.trim() || "Sideth";
    const style = document.getElementById('styleInput').value.trim() || "Pop";
    const lyrics = document.getElementById('lyricsInput').value.trim() || "No lyrics.";

    const metaText = `=== DISTROKID METADATA & SUNO PROMPT ===\nSong Title: ${title}\nArtist: ${artist}\nMusic Style/Prompt: ${style}\n\n--- LYRICS ---\n${lyrics}`;
    
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

function clearAllData() {
    if (confirm("តើបងពិតជាចង់លុបទិន្នន័យទាំងអស់មែនទេ?")) {
        localStorage.removeItem('dsn_songs');
        loadSavedSongs();
        clearInputs();
        alert("សម្អាតទិន្នន័យរួចរាល់!");
    }
}
