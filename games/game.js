let selectedFile = null;

function runEmulator(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFile = file;
        const fileInfo = document.getElementById('file-info');
        const canvas = document.getElementById('emulator-canvas');
        
        fileInfo.innerHTML = `📁 កំពុងអាន File: <b>${file.name}</b> (${(file.size / (1024*1024)).toFixed(2)} MB)`;
        canvas.style.display = 'block';
    }
}

// មុខងារសម្រាប់ពេលចុចប៊ូតុង "ចុចទីនេះដើម្បីចាប់ផ្តើមលេង"
function startGamePlay() {
    if (!selectedFile) {
        alert("សូមជ្រើសរើស File ហ្គេម ISO ជាមុនសិន បង Sideth❤️️! 😘");
        return;
    }
    
    const screen = document.getElementById('emulator-screen');
    screen.innerHTML = `
        <h3>🎮 កំពុងដំណើរការហ្គេម ${selectedFile.name}...</h3>
        <p>กำลังจำลองระบบ Emulator บน iPhone ของបង Sideth❤️️! 🚀</p>
        <canvas id="game-canvas" width="480" height="272" style="background: black; width: 100%; border-radius: 8px;"></canvas>
    `;
    
    // បញ្ជូន File ចូលទៅកាន់ WebAssembly / Emulator Core ទីនេះ
    const gameURL = URL.createObjectURL(selectedFile);
    console.log("Starting game from URL:", gameURL);
}
