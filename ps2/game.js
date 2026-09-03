function loadGame(system) {
    const screen = document.getElementById('emulator-screen');
    if (system === 'PS2') {
        screen.innerHTML = `<h3>🚀 กำลังเชื่อมต่อ PS2 Web Engine...</h3><p>ត្រៀមខ្លួនលេងហ្គេម 750 និងទាហានមុំបីបានហើយ Sideth❤️️! 😘</p>`;
    } else {
        screen.innerHTML = `<h3>🎮 กำลังเปิด PSP Web Core...</h3><p>ໂຫຼດ File ISO ហ្គេមរបស់អ្នកចូលទីនេះបានយ៉ាងរលូន! 💚</p>`;
    }
}
