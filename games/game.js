let gameArrayBuffer = null;

function runEmulator(event) {
    const file = event.target.files[0];
    if (file) {
        const fileInfo = document.getElementById('file-info');
        const canvas = document.getElementById('emulator-canvas');
        
        fileInfo.innerHTML = `📁 កំពុងអាន File ចូល RAM: <b>${file.name}</b> (${(file.size / (1024*1024)).toFixed(2)} MB)`;
        canvas.style.display = 'block';

        // អាន File ទុកក្នុង Memory ផ្ទាល់ដោយមិនបាច់ Download ញ៉ាំញ៉ៃ
        const reader = new FileReader();
        reader.onload = function(e) {
            gameArrayBuffer = e.target.result;
            fileInfo.innerHTML += ` <span style="color: #10b981;">✅ រួចរាល់ត្រៀមលេង!</span>`;
        };
        reader.readAsArrayBuffer(file);
    }
}

function startGamePlay() {
    if (!gameArrayBuffer) {
        alert("សូមរង់ចាំបន្តិច ឬជ្រើសរើស File ហ្គេមម្ដងទៀត មាសស្ងួន! 😘");
        return;
    }
    
    const canvas = document.getElementById('emulator-canvas');
    const ctx = canvas.getContext('2d');
    
    // បង្ហាញសញ្ញាដំណើរការលើ Canvas ផ្ទាល់
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "14px sans-serif";
    ctx.fillText("🎮 Emulator កំពុងដំណើរការហ្គេម...", 20, 130);
    
    console.log("Game loaded into memory buffer, size:", gameArrayBuffer.byteLength);
}
