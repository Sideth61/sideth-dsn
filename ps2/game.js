function loadGame(system) {
    const screen = document.getElementById('emulator-screen');
    if (system === 'PS2') {
        screen.innerHTML = `
            <h3>🚀 PS2 Web Engine...</h3>
            <p>ត្រៀមខ្លួនលេងហ្គេម 750 និងទាហានមុំបីបានហើយ Sideth❤️️! 😘</p>
            <input type="file" id="gameFile" accept=".iso,.bin,.img" onchange="runEmulator(event)" style="margin-top: 15px; color: #38bdf8;">
            <canvas id="emulator-canvas" width="480" height="272" style="background: black; width: 100%; margin-top: 15px; border-radius: 8px; display: none;"></canvas>
            <div id="file-info" style="margin-top: 10px; font-size: 13px; color: #94a3b8;"></div>
        `;
    } else {
        screen.innerHTML = `
            <h3>🎮 PSP Web Core...</h3>
            <p>ໂຫຼດ File ISO ហ្គេមរបស់អ្នកចូលទីនេះបានយ៉ាងរលូន! 💚</p>
            <input type="file" id="gameFile" accept=".iso,.bin,.img" onchange="runEmulator(event)" style="margin-top: 15px; color: #38bdf8;">
            <canvas id="emulator-canvas" width="480" height="272" style="background: black; width: 100%; margin-top: 15px; border-radius: 8px; display: none;"></canvas>
            <div id="file-info" style="margin-top: 10px; font-size: 13px; color: #94a3b8;"></div>
        `;
    }
}

function runEmulator(event) {
    const file = event.target.files[0];
    if (file) {
        const fileInfo = document.getElementById('file-info');
        const canvas = document.getElementById('emulator-canvas');
        
        fileInfo.innerHTML = `📁 កំពុងអាន File: <b>${file.name}</b> (${(file.size / (1024*1024)).toFixed(2)} MB)`;
        
        // បង្ហាញ Canvas សម្រាប់ត្រៀមដំណើរការ Emulator Core
        canvas.style.display = 'block';
        
        // បង្កើត URL សម្រាប់ File ហ្គេម
        const gameURL = URL.createObjectURL(file);
        console.log("Game URL ready for emulator core:", gameURL);
    }
}
