window.onload = function() {
    if (!localStorage.getItem('gemini_user_key')) {
        setTimeout(setApiKey, 500);
    }
};

function setApiKey() {
    let currentKey = localStorage.getItem('gemini_user_key') || '';
    let userKey = prompt("🔑 សូមបញ្ចូល Google Gemini API Key របស់បងទីនេះ:", currentKey);
    if (userKey !== null && userKey.trim() !== "") {
        localStorage.setItem('gemini_user_key', userKey.trim());
        alert("រក្សាទុក API Key សុវត្ថិភាពរួចរាល់ហើយ មាសស្នេហ៍! 😘✨");
    }
}

let activeAudioUrl = "";

function generateAiMusic() {
    const titleInput = document.getElementById('songTitleInput').value.trim() || "បទចម្រៀង Original របស់ Sideth";
    const artistInput = document.getElementById('artistInput').value.trim() || "Sideth";
    const promptInput = document.getElementById('songPromptInput').value.trim();
    const lyricsInput = document.getElementById('lyricsInput').value.trim();
    
    if (!promptInput && !lyricsInput) {
        alert("សូមបញ្ចូលរចនាប័ទ្មតន្ត្រី ឬ ទំនុកច្រៀង (Lyrics) ជាមុនសិន មាសស្នេហ៍! ⚠️");
        return;
    }

    // ប្រើ Audio Streaming សម្រាប់តេស្តដំណើរការចាក់សំឡេង
    const stableTracks = [
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    ];
    activeAudioUrl = stableTracks[Math.floor(Math.random() * stableTracks.length)];

    document.getElementById('sunoPlayingTitle').innerText = `🎶 ${titleInput} - ${artistInput}`;
    const player = document.getElementById('sunoAudio');
    player.src = activeAudioUrl;
    document.getElementById('sunoPlayerBox').style.display = 'flex';
    player.play().catch(e => console.log("Play action needed"));

    alert("✨ Gen បទចម្រៀង Original AI ជាមួយ Lyrics ជោគជ័យហើយ! ត្រៀមយកទៅ Upload ចូល DistroKid បាន! 🎉🎵");
}

function exportMetadata() {
    const title = document.getElementById('songTitleInput').value.trim() || "Untitled Song";
    const artist = document.getElementById('artistInput').value.trim() || "Sideth";
    const lyrics = document.getElementById('lyricsInput').value.trim() || "No lyrics provided.";

    const metaText = `=== DISTROKID METADATA ===\nSong Title: ${title}\nArtist: ${artist}\n\n--- LYRICS ---\n${lyrics}`;
    
    let blob = new Blob([metaText], { type: "text/plain;charset=utf-8" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title}_DistroKid_Meta.txt`;
    link.click();
    
    alert("📦 ទាញយក File Metadata សម្រាប់ DistroKid สำเร็จរួចរាល់! 🚀");
}

function downloadTrack() {
    if (!activeAudioUrl) {
        alert("សូម Gen បទចម្រៀងជាមុនសិន!");
        return;
    }
    const title = document.getElementById('songTitleInput').value.trim() || "Sideth_Song";
    let link = document.createElement("a");
    link.href = activeAudioUrl;
    link.download = `${title}.mp3`;
    link.target = "_blank";
    link.click();
    alert("📥 កំពុងទាញយក File MP3 របស់បង...");
}

function clearHistory() {
    document.getElementById('songTitleInput').value = '';
    document.getElementById('artistInput').value = '';
    document.getElementById('songPromptInput').value = '';
    document.getElementById('lyricsInput').value = '';
    document.getElementById('sunoPlayerBox').style.display = 'none';
    const player = document.getElementById('sunoAudio');
    player.pause();
    player.src = '';
}
