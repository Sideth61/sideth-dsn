"use strict";

const VERSION = "3.0";
let audioCtx = null;
let soundEnabled = localStorage.getItem("sideth_sound") !== "off";

function initAudio() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();
    } catch (_) {}
}

function playSound(type) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === "jump") {
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
    } else if (type === "coin") {
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.08);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now); osc.stop(now + 0.25);
    } else if (type === "stomp") {
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now); osc.stop(now + 0.12);
    } else if (type === "win") {
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.12);
        osc.frequency.setValueAtTime(784, now + 0.24);
        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.start(now); osc.stop(now + 0.5);
    }
}

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;

let score = 0;
let highScore = Number(localStorage.getItem("sideth_highscore") || 0);
let coins = 0;
let level = 1, maxLevel = 10, lives = 3, gravity = 0.65;
let paused = false, gameOver = false, gameWon = false;
let screenShake = 0;
let floatingTexts = [];
let lastTime = 0;
let gamepadConnected = false;

const input = { left: false, right: false, jump: false };

const skins = [
    { id: "classic", name: "Classic ❤️", color: "#e74c3c", cost: 0 },
    { id: "blue", name: "Blue 💙", color: "#3498db", cost: 50 },
    { id: "green", name: "Green 💚", color: "#2ecc71", cost: 100 },
    { id: "gold", name: "Gold 💛", color: "#f1c40f", cost: 200 },
    { id: "purple", name: "Purple 💜", color: "#9b59b6", cost: 300 }
];

let unlockedSkins = JSON.parse(localStorage.getItem("sideth_skins") || '["classic"]');
let selectedSkin = localStorage.getItem("sideth_skin") || "classic";

const player = {
    x: 70, y: 350, width: 34, height: 46, vx: 0, vy: 0,
    speed: 5.2, jumpPower: -13.2, grounded: false,
    invincible: 0, color: "#e74c3c"
};

let platforms = [], coinList = [], enemies = [];
let flagPole = { x: 820, y: 150, reached: false };

function $(id) { return document.getElementById(id); }

function addFloatingText(text, x, y, color = "#f1c40f") {
    floatingTexts.push({ text, x, y, vy: -1.5, alpha: 1, color });
}

function applySkin() {
    const skin = skins.find(s => s.id === selectedSkin) || skins[0];
    player.color = skin.color;
    localStorage.setItem("sideth_skin", selectedSkin);
}

function createLevel() {
    flagPole.reached = false;
    platforms = [{ x: 0, y: 430, width: 900, height: 70 }];

    for (let i = 1; i <= 4; i++) {
        platforms.push({
            x: i * 180 - 40,
            y: 350 - (i % 2) * 85 - (Math.sin(level * i) * 25),
            width: 105, height: 18
        });
    }

    coinList = [];
    for (let i = 0; i < 5 + Math.floor(level * 1.2); i++) {
        coinList.push({
            x: 100 + Math.random() * 700,
            y: 140 + Math.random() * 220,
            size: 16,
            collected: false
        });
    }

    enemies = [];
    for (let i = 0; i < Math.min(1 + Math.floor(level * 0.6), 5); i++) {
        enemies.push({
            x: 200 + Math.random() * 550,
            y: 395,
            width: 35, height: 35,
            vx: 1 + level * 0.22,
            alive: true
        });
    }
}

function collision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function resetPlayer() {
    player.x = 70;
    player.y = 350;
    player.vx = 0;
    player.vy = 0;
    player.invincible = 120;
}

function loseLife() {
    lives--;
    screenShake = 20;
    playSound("stomp");
    particles.add(player.x + player.width / 2, player.y + player.height / 2, "#e74c3c", 12);
    resetPlayer();
    if (lives <= 0) {
        gameOver = true;
        paused = false;
        showMessage("💀 Game Over<br><small>ចុច R ឬប៊ូតុង Restart ដើម្បីលេងម្ដងទៀត</small>");
    }
}

function update() {
    if (paused || gameOver || gameWon) return;

    if (input.left) player.vx = -player.speed;
    else if (input.right) player.vx = player.speed;
    else player.vx *= 0.75;

    player.x += player.vx;

    if (input.jump && player.grounded) {
        player.vy = player.jumpPower;
        player.grounded = false;
        input.jump = false;
        playSound("jump");
        particles.add(player.x + 17, player.y + 45, player.color, 5);
    }

    player.vy += gravity;
    player.y += player.vy;
    player.grounded = false;

    for (const p of platforms) {
        if (player.x + player.width > p.x &&
            player.x < p.x + p.width &&
            player.y + player.height >= p.y &&
            player.y + player.height <= p.y + 25 &&
            player.vy >= 0) {
            player.y = p.y - player.height;
            player.vy = 0;
            player.grounded = true;
        }
    }

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > W) player.x = W - player.width;

    if (player.y > H + 50) loseLife();

    for (const coin of coinList) {
        if (!coin.collected && collision(player, {
            x: coin.x, y: coin.y, width: coin.size, height: coin.size
        })) {
            coin.collected = true;
            coins++;
            score += 10;
            addFloatingText("+10", coin.x, coin.y);
            particles.add(coin.x + 8, coin.y + 8, "#f1c40f", 8);
            playSound("coin");
        }
    }

    for (const enemy of enemies) {
        if (!enemy.alive) continue;

        enemy.x += enemy.vx;
        if (enemy.x < 50 || enemy.x > W - 50) enemy.vx *= -1;

        if (collision(player, enemy)) {
            if (player.vy > 0 &&
                player.y + player.height - 10 < enemy.y + 15) {
                enemy.alive = false;
                player.vy = -9.5;
                score += 50;
                addFloatingText("+50", enemy.x, enemy.y, "#9b59b6");
                particles.add(enemy.x + 17, enemy.y + 17, "#9b59b6", 12);
                playSound("stomp");
            } else if (player.invincible === 0) {
                loseLife();
            }
        }
    }

    if (player.invincible > 0) player.invincible--;
    if (screenShake > 0) screenShake--;

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.03;
        if (ft.alpha <= 0) floatingTexts.splice(i, 1);
    }

    if (!flagPole.reached &&
        collision(player, { x: flagPole.x, y: flagPole.y, width: 20, height: 180 })) {
        flagPole.reached = true;
        score += 150 * level;
        particles.add(flagPole.x, flagPole.y + 100, "#f1c40f", 25);
        playSound("win");

        if (level >= maxLevel) {
            gameWon = true;
            showMessage("🏆 YOU WIN! 🎊<br><small>Score: " + score + "</small><br><button class='restart-btn' onclick='restartGame()'>🔄 Restart</button>");
        } else {
            level++;
            createLevel();
            resetPlayer();
            showMessage("🏁 Level " + level + "!", 900);
        }
    }

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("sideth_highscore", String(highScore));
    }

    updateHUD();
    particles.update();
}

function updateHUD() {
    $("score").textContent = score;
    $("coins").textContent = coins;
    $("level").textContent = level;
    $("lives").textContent = lives;
    $("highScore").textContent = highScore;
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "#5c94fc");
    gradient.addColorStop(1, "#87ceeb");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255,255,255,.28)";
    for (let i = 0; i < 7; i++) {
        const x = ((i * 170 + 40) % W);
        const y = 55 + (i % 3) * 45;
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.arc(x + 25, y + 4, 28, 0, Math.PI * 2);
        ctx.arc(x + 52, y, 20, 0, Math.PI * 2);
        ctx.fill();
    }
}

function draw() {
    ctx.save();

    if (screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
    }

    drawBackground();

    for (const p of platforms) {
        ctx.fillStyle = "#4a3525";
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(p.x, p.y, p.width, 6);
    }

    // Flag
    ctx.fillStyle = "#eee";
    ctx.fillRect(flagPole.x, flagPole.y, 5, 260);
    ctx.fillStyle = "#e74c3c";
    ctx.beginPath();
    ctx.moveTo(flagPole.x + 5, flagPole.y);
    ctx.lineTo(flagPole.x + 65, flagPole.y + 25);
    ctx.lineTo(flagPole.x + 5, flagPole.y + 45);
    ctx.fill();

    for (const coin of coinList) {
        if (coin.collected) continue;
        ctx.fillStyle = "#f1c40f";
        ctx.beginPath();
        ctx.arc(coin.x + 8, coin.y + 8, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff2a8";
        ctx.stroke();
    }

    for (const enemy of enemies) {
        if (!enemy.alive) continue;
        ctx.fillStyle = "#8e44ad";
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.fillStyle = "#fff";
        ctx.fillRect(enemy.x + 7, enemy.y + 8, 6, 6);
        ctx.fillRect(enemy.x + 22, enemy.y + 8, 6, 6);
    }

    // Player blink while invincible
    if (player.invincible === 0 || Math.floor(player.invincible / 6) % 2 === 0) {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x + 4, player.y, 27, 40);
        ctx.fillStyle = "#ffd7b5";
        ctx.fillRect(player.x + 9, player.y + 7, 17, 15);
    }

    particles.draw(ctx);

    for (const ft of floatingTexts) {
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.alpha;
        ctx.font = "bold 16px Poppins, sans-serif";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1;
    }

    ctx.restore();
}

function showMessage(html, duration = 0) {
    const el = $("message");
    el.innerHTML = html;
    el.classList.add("show");
    if (duration) setTimeout(() => {
        if (!gameOver && !gameWon) el.classList.remove("show");
    }, duration);
}

function hideMessage() {
    $("message").classList.remove("show");
}

function restartGame() {
    score = 0;
    coins = 0;
    level = 1;
    lives = 3;
    paused = false;
    gameOver = false;
    gameWon = false;
    floatingTexts = [];
    screenShake = 0;
    applySkin();
    createLevel();
    resetPlayer();
    hideMessage();
    $("pauseBtn").textContent = "⏸️";
    updateHUD();
}

function togglePause() {
    if (gameOver || gameWon) return;
    paused = !paused;
    $("pauseBtn").textContent = paused ? "▶️" : "⏸️";
    if (paused) showMessage("⏸️ PAUSED<br><small>ចុច ▶️ ដើម្បីបន្ត</small>");
    else hideMessage();
}

function renderSkins() {
    const list = $("skinList");
    list.innerHTML = "";

    skins.forEach(skin => {
        const unlocked = unlockedSkins.includes(skin.id);
        const selected = selectedSkin === skin.id;
        const item = document.createElement("button");
        item.className = "skin-item" + (selected ? " selected" : "");
        item.innerHTML =
            `<span class="skin-preview" style="background:${skin.color}"></span>
             <span>${skin.name}</span>
             <small>${selected ? "✓ កំពុងប្រើ" : unlocked ? "ជ្រើសរើស" : "🪙 " + skin.cost}</small>`;

        item.onclick = () => {
            if (!unlocked) {
                if (coins >= skin.cost) {
                    coins -= skin.cost;
                    unlockedSkins.push(skin.id);
                    localStorage.setItem("sideth_skins", JSON.stringify(unlockedSkins));
                    playSound("coin");
                } else {
                    showMessage("🪙 មិនទាន់មាន Coin គ្រប់ទេ!", 1200);
                    return;
                }
            }
            selectedSkin = skin.id;
            applySkin();
            renderSkins();
            updateHUD();
        };
        list.appendChild(item);
    });
}

function holdButton(element, property) {
    const down = e => {
        e.preventDefault();
        initAudio();
        input[property] = true;
    };
    const up = e => {
        e.preventDefault();
        input[property] = false;
    };

    element.addEventListener("touchstart", down, { passive: false });
    element.addEventListener("touchend", up, { passive: false });
    element.addEventListener("touchcancel", up, { passive: false });
    element.addEventListener("mousedown", down);
    element.addEventListener("mouseup", up);
    element.addEventListener("mouseleave", up);
}

holdButton($("leftBtn"), "left");
holdButton($("rightBtn"), "right");

function jumpPress(e) {
    if (e) e.preventDefault();
    initAudio();
    input.jump = true;
}
$("jumpBtn").addEventListener("touchstart", jumpPress, { passive: false });
$("jumpBtn").addEventListener("mousedown", jumpPress);

$("soundBtn").onclick = () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem("sideth_sound", soundEnabled ? "on" : "off");
    $("soundBtn").textContent = soundEnabled ? "🔊" : "🔇";
    if (soundEnabled) initAudio();
};

$("pauseBtn").onclick = togglePause;

$("skinBtn").onclick = () => {
    renderSkins();
    $("skinModal").classList.add("open");
};

$("closeSkinModal").onclick = () => $("skinModal").classList.remove("open");

$("skinModal").addEventListener("click", e => {
    if (e.target === $("skinModal")) $("skinModal").classList.remove("open");
});

window.addEventListener("keydown", e => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", " ", "Escape"].includes(e.key)) e.preventDefault();
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") input.left = true;
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") input.right = true;
    if (e.key === "ArrowUp" || e.key === " " || e.key.toLowerCase() === "w") input.jump = true;
    if (e.key.toLowerCase() === "p" || e.key === "Escape") togglePause();
    if (e.key.toLowerCase() === "r" && (gameOver || gameWon)) restartGame();
});

window.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") input.left = false;
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") input.right = false;
});

window.addEventListener("gamepadconnected", e => {
    gamepadConnected = true;
    $("gamepadStatus").textContent = "🎮 Gamepad: Connected";
});

window.addEventListener("gamepaddisconnected", () => {
    gamepadConnected = false;
    $("gamepadStatus").textContent = "🎮 Gamepad: រង់ចាំ...";
});

function pollGamepad() {
    if (gamepadConnected && navigator.getGamepads) {
        const gp = navigator.getGamepads()[0];
        if (gp) {
            input.left = gp.axes[0] < -0.35 || gp.buttons[14]?.pressed;
            input.right = gp.axes[0] > 0.35 || gp.buttons[15]?.pressed;
            if (gp.buttons[0]?.pressed || gp.buttons[12]?.pressed) input.jump = true;
        }
    }
}

function loop(time = 0) {
    pollGamepad();
    update();
    draw();
    requestAnimationFrame(loop);
}

window.restartGame = restartGame;

applySkin();
$("soundBtn").textContent = soundEnabled ? "🔊" : "🔇";
createLevel();
resetPlayer();
updateHUD();
loop();
