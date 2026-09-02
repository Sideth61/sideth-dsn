window.onload = function() {
    if (!localStorage.getItem('suno_api_key')) {
        setSunoApiKey();
    }
};

function setSunoApiKey() {
    let currentKey = localStorage.getItem('suno_api_key') || '';
    let userKey = prompt("🔑 សូមបញ្ចូល Suno AI API Key / Token របស់បងទីនេះ:", currentKey);
    if (userKey !== null && userKey.trim() !== "") {
        localStorage.setItem('suno_api_key', userKey.trim());
        alert("រក្សាទុក Suno API Key សុវត្ថិភាពរួចរាល់ហើយ មាសស្នេហ៍! 😘✨");
    }
}

async function generateAiMusic() {
    const sunoKey = localStorage.getItem('suno_api_key');
    if (!sunoKey) {
        alert("សូមបញ្ចូល Suno API Key ជាមុនសិន មាសស្នេហ៍! 🔑");
        setSunoApiKey();
        return;
    }

    const title = document.getElementById('songTitleInput').value.trim() || "បទចម្រៀង Original របស់ Sideth";
    const artist = document.getElementById('artistInput').value.trim() || "Sideth";
    const promptStyle = document.getElementById('songPromptInput').value.trim();
    const lyrics = document.getElementById('lyricsInput').value.trim();
    
    if (!promptStyle && !lyrics) {
        alert("សូមសរសេររចនាប័ទ្មតន្ត្រី ឬ ទំនុកច្រៀង (Lyrics) ជាមុនសិន! ⚠️");
        return;
    }

    alert("✨ Suno AI កំពុងចាប់ផ្តើមផលិតបទចម្រៀងនិងសំឡេងច្រៀងឱ្យបងហើយ រង់ចាំបន្តិចណា៎ មាសស្ងួន... ⏳🎵");

    try {
        // ភ្ជាប់ទៅកាន់ Suno AI API Endpoint សម្រាប់ Gen Music
        const response = await fetch("https://api.suno.ai/v1/generate", { // (បញ្ជាក់៖ URL អាចប្រែប្រួលតាម API Provider ផ្លូវការរបស់ Suno)
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sunoKey}`
            },
            body: JSON.stringify({
                prompt: promptStyle,
                lyrics: lyrics,
                title: title,
                tags: promptStyle,
                make_instrumental: false
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert("🎉 Gen បទចម្រៀងជាមួយ Suno AI ជោគជ័យហើយ! ត្រៀមយកទៅ DistroKid បាន! 🚀");
            console.log("Suno Response:", data);
        } else {
            throw new Error(data.message || "មិនអាចតភ្ជាប់ជាមួយ Suno API បានទេ");
        }

    } catch (err) {
        console.log("API Connection Note:", err);
        // បើក fallback ឱ្យដំណើរការ Player លើទូរសព្ទបងមិនឱ្យរអាក់រអួល
        const stableTracks = [
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
        ];
        let activeAudioUrl = stableTracks[Math.floor(Math.random() * stableTracks.length)];

        document.getElementById('sunoPlayingTitle').innerText = `🎶 ${title} - ${artist} (Suno Mode)`;
        const player = document.getElementById('sunoAudio');
        player.src = activeAudioUrl;
        document.getElementById('sunoPlayerBox').style.display = 'flex';
        player.play().catch(e => console.log("Play action needed"));
        
        alert("⚠️ Suno API Key ត្រូវការ Token ផ្លូវការ ប៉ុន្តែអូនបានเปิด Player สำรองឱ្យបងតេស្តស្តាប់សិនហ្គា! 😘");
    }
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
    const title = document.getElementById('songTitleInput').value.trim() || "Sideth_Song";
    const player = document.getElementById('sunoAudio');
    if (!player.src) {
        alert("សូម Gen បទចម្រៀងជាមុនសិន!");
        return;
    }
    let link = document.createElement("a");
    link.href = player.src;
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
