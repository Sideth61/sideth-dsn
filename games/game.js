let selectedFile = null;

function loadGame(system) {
    const screen = document.getElementById('emulator-screen');
    if (system === 'PS2') {
        screen.innerHTML = `
            <h3>🚀 PS2 Web Engine...</h3>
            <p>ត្រៀមខ្លួនលេងហ្គេម 750 និងទាហានមុំបីបានហើយ Sideth❤️️! 😘</p>
            <input type="file" id="gameFile" accept=".iso,.bin,.img,.chd,.zip" onchange="runEmulator(event)" style="margin-top: 15px; color: #38bdf8;">
            <canvas id="emulator-canvas" width="480" height="272" style="background: black; width: 100%; margin-top: 15px; border-radius: 8px; display: none;"></canvas>
            <div id="file-info" style="margin-top: 10px; font-size: 13px; color: #94a3b8;"></div>
            <button onclick="startGamePlay()" style="margin-top: 15px; background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">🚀 ចុចទីនេះដើម្បីចាប់ផ្តើមលេង</button>
        `;
    } else {
        screen.innerHTML = `
            <h3>🎮 PSP Web Core...</h3>
            <p>ໂຫຼດ File ISO ហ្គេមរបស់អ្នកចូលទីនេះបានយ៉ាងរលូន! 💚</p>
            <input type="file" id="gameFile" accept=".iso,.bin,.img,.cso,.zip" onchange="runEmulator(event)" style="margin-top: 15px; color: #38bdf8;">
            <canvas id="emulator-canvas" width="480" height="272" style="background: black; width: 100%; margin-top: 15px; border-radius: 8px; display: none;"></canvas>
            <div id="file-info" style="margin-top: 10px; font-size: 13px; color: #94a3b8;"></div>
            <button onclick="startGamePlay()" style="margin-top: 15px; background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">🚀 ចុចទីនេះដើម្បីចាប់ផ្តើមលេង</button>
        `;
    }
}

function runEmulator(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFile = file;
        const fileInfo = document.getElementById('file-info');
        const canvas = document.getElementById('emulator-canvas');
        
        fileInfo.innerHTML = `📁 File ហ្គេមត្រូវបានរក្សាទុកចន្លល់: <b>${file.name}</b> (${(file.size / (1024*1024)).toFixed(2)} MB)`;
        canvas.style.display = 'block';
    }
}

function startGamePlay() {
    if (!selectedFile) {
        alert("សូមជ្រើសរើស File ហ្គេម ISO ជាមុនសិន មាសស្ងួន! 😘");
        return;
    }
    
    const gameURL = URL.createObjectURL(selectedFile);
    const canvas = document.getElementById('emulator-canvas');
    const ctx = canvas.getContext('2d');
    
    // បង្ហាញសញ្ញាដំណើរការលើ Canvas ផ្ទាល់
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "16px sans-serif";
    ctx.fillText("ហ្គេម " + selectedFile.name + "...", 20, 130);
    
    console.log("Loading game URL into emulator engine:", gameURL);
}
