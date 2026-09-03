let selectedFile = null;

function runEmulator(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFile = file;
        const fileInfo = document.getElementById('file-info');
        const canvas = document.getElementById('emulator-canvas');
        
        fileInfo.innerHTML = `📁 File ហ្គេម: <b>${file.name}</b> (${(file.size / (1024*1024)).toFixed(2)} MB) ✅ រួចរាល់!`;
        canvas.style.display = 'block';
    }
}

function startGamePlay() {
    if (!selectedFile) {
        alert("សូមជ្រើសរើស File ហ្គេម ISO ជាមុនសិន មាសស្ងួន Sideth❤️️! 😘");
        return;
    }
    
    // បញ្ជូន File ចូលទៅកាន់ emulator.html ຜ່ານ sessionStorage
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            sessionStorage.setItem('gameData', e.target.result);
            sessionStorage.setItem('gameName', selectedFile.name);
            window.location.href = 'emulator.html';
        } catch (err) {
            alert("File ហ្គេមធំពេក សូមព្យាយាមប្រើ File តូចជាងបន្តិច ឬភ្ជាប់ Emulator Core ផ្ទាល់!");
        }
    };
    reader.readAsDataURL(selectedFile);
}
