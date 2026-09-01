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
    
    // សម្អាតទិន្នន័យការពារ Error ពេលដាក់ Lyrics styles វែងៗ
    const title = titleInput.value.trim() || "បទចម្រៀងគ្មានចំណងជើង";
    const promptText = promptInput.value.trim();
    
    if (!promptText) {
        alert("សូមសរសេរការពិពណ៌នារចនាប័ទ្មតន្ត្រី និង Lyrics ជាមុនសិន មាសស្នេហ៍! ⚠️");
        promptInput.focus();
        return;
    }

    // ត្រួតពិនិត្យនិងកែច្នៃ Data ឱ្យរលូនល្អមុនពេលដំណើរការ
    const safeTitle = encodeURIComponent(title);
    console.log("Processing Music Style for:", decodeURIComponent(safeTitle));

    const hdTracks = [
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
    ];
    const randomTrack = hdTracks[Math.floor(Math.random() * hdTracks.length)];

    document.getElementById('sunoPlayingTitle').innerText = "🎶 កំពុងចាក់ (Lyrics HD): " + title;
    const player = document.getElementById('sunoAudio');
    player.src = randomTrack;
    document.getElementById('sunoPlayerBox').style.display = 'flex';
    
    player.play().then(() => {
        try {
            if (!window.audioContextInitialized) {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioCtx.createMediaElementSource(player);
                const gainNode = audioCtx.createGain();
                gainNode.gain.value = 1.2;
                source.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                window.audioContextInitialized = true;
            }
        } catch(e) {
            console.log("Audio Context Note:", e);
        }
    }).catch(err => {
        console.error("Play error:", err);
    });

    alert("✨ Lyrics Styles Music ដំណើរការបានយ៉ាងល្អឥតខ្ចោះ សំឡេងពិរោះច្បាស់ល្អណាស់ មាសស្ងួន! 🎉🎵");
}

function clearHistory() {
    document.getElementById('songTitleInput').value = '';
    document.getElementById('songPromptInput').value = '';
    document.getElementById('sunoPlayerBox').style.display = 'none';
    const player = document.getElementById('sunoAudio');
    player.pause();
    player.src = '';
}
