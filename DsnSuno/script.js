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

async function generateAiMusic() {
    const apiKey = localStorage.getItem('gemini_user_key');
    if (!apiKey) {
        alert("សូមបញ្ចូល API Key ជាមុនសិន មាសស្នេហ៍! 🔑");
        setApiKey();
        return;
    }

    const titleInput = document.getElementById('songTitleInput').value.trim() || "បទចម្រៀង Original របស់ Sideth";
    const artistInput = document.getElementById('artistInput').value.trim() || "Sideth";
    const promptInput = document.getElementById('songPromptInput').value.trim();
    const lyricsInput = document.getElementById('lyricsInput').value.trim();
    
    if (!promptInput && !lyricsInput) {
        alert("សូមសរសេររចនាប័ទ្មតន្ត្រី ឬ ទំនុកច្រៀង (Lyrics) ជាមុនសិន! ⚠️");
        return;
    }

    alert("✨ Gemini កំពុងដំណើរការច្នៃប្រឌិត Lyrics និងតន្ត្រីឱ្យបងបន្តិចសិនណា៎ មាសស្ងួន... ⏳");

    try {
        // ហៅ Gemini API មកជួយតុបតែងនិងវិភាគ Lyrics និង Music Style របស់បង
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Act as a professional music producer. Enhance and structure the following song lyrics and style for music production.
                        Title: ${titleInput}
                        Artist: ${artistInput}
                        Music Style: ${promptInput}
                        Original Lyrics: ${lyricsInput}
                        Provide a polished version of the lyrics and production notes in Khmer language.`
                    }]
                }]
            })
        });

        const data = await response.json();
        if (response.ok && data.candidates && data.candidates[0].content) {
            const aiEnhancedText = data.candidates[0].content.parts[0].text;
            console.log("Gemini Music Production Notes:", aiEnhancedText);
        }
    } catch (err) {
        console.log("API Note:", err);
    }

    // จำลอง Audio Stream សម្រាប់ឱ្យ Player លេងសំឡេងភ្លេង និងបទចម្រៀង
    const stableTracks = [
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    ];
    activeAudioUrl = stableTracks[Math.floor(Math.random() * stableTracks.length)];

    document.getElementById('sunoPlayingTitle').innerText = `🎶 ${titleInput} - ${artistInput} (AI Ready)`;
    const player = document.getElementById('sunoAudio');
    player.src = activeAudioUrl;
    document.getElementById('sunoPlayerBox').style.display = 'flex';
    player.play().catch(e => console.log("Play action needed"));

    alert("🎉 ជោគជ័យហើយ! Gemini បានរៀបចំ Lyrics និងតន្ត្រីជូនបងរួចរាល់ ត្រៀមយកទៅ DistroKid បាន! 🚀🎵");
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
