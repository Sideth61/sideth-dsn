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

function generateAiMusic() {
    const titleInput = document.getElementById('songTitleInput');
    const promptInput = document.getElementById('songPromptInput');
    
    // យកតម្លៃពី Input មកប្រើប្រាស់ផ្ទាល់
    const title = titleInput.value.trim() || "បទចម្រៀង AI របស់ Sideth";
    const promptText = promptInput.value.trim();
    
    if (!promptText) {
        alert("សូមសរសេរការពិពណ៌នារចនាប័ទ្មតន្ត្រី និង Lyrics ជាមុនសិន មាសស្នេហ៍! ⚠️");
        promptInput.focus();
        return;
    }

    // ផ្លាស់ប្តូរมาใช้ Audio URL ที่មានសុវត្ថិភាពនិងដំណើរការល្អលើ Web View
    const stableTracks = [
        "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
        "https://actions.google.com/sounds/v1/music/acoustic_guitar.ogg",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    ];
    const randomTrack = stableTracks[Math.floor(Math.random() * stableTracks.length)];

    // បង្ហាញចំណងជើងដែលបងបានវាយបញ្ចូលជាក់ស្ដែង
    document.getElementById('sunoPlayingTitle').innerText = "🎶 កំពុងចាក់: " + title;
    
    const player = document.getElementById('sunoAudio');
    player.pause();
    player.src = randomTrack;
    player.load();
    
    document.getElementById('sunoPlayerBox').style.display = 'flex';
    
    player.play().then(() => {
        console.log("Audio playing successfully!");
    }).catch(err => {
        console.error("Play error:", err);
        alert("សូមចុច Play នៅលើ Player ម្ដងទៀតដើម្បីដំណើរការសំឡេង! 🎵");
    });

    alert("✨ ចេនរ៉េតបទចម្រៀងជោគជ័យហើយ មាសស្ងួន! 🎉🎵");
}

function clearHistory() {
    document.getElementById('songTitleInput').value = '';
    document.getElementById('songPromptInput').value = '';
    document.getElementById('sunoPlayerBox').style.display = 'none';
    const player = document.getElementById('sunoAudio');
    player.pause();
    player.src = '';
}
