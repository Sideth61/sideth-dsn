"use strict";

let audioCtx = null;
let soundEnabled = true;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
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

    if (type === 'jump') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
    } else if (type === 'coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.08);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
    } else if (type === 'stomp') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
    } else if (type === 'hurt') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.3);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'win') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const noteOsc = audioCtx.createOscillator();
            const noteGain = audioCtx.createGain();
            noteOsc.connect(noteGain);
            noteGain.connect(audioCtx.destination);
            noteOsc.type = 'square';
            noteOsc.frequency.setValueAtTime(freq, now + idx * 0.12);
            noteGain.gain.setValueAtTime(0.1, now + idx * 0.12);
            noteGain.gain.linearRampToValueAtTime(0.01, now + idx * 0.12 + 0.15);
            noteOsc.start(now + idx * 0.12);
            noteOsc.stop(now + idx * 0.12 + 0.15);
        });
    }
}

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

let score = 0, coins = 0, level = 1, maxLevel = 10, lives = 3, gravity = 0.65;
let paused = false, gameOver = false, gameWon = false;

const input = { left: false, right: false, jump: false, pause: false };

const player = {
    x: 70, y: 350, width: 34, height: 46, vx: 0, vy: 0,
    speed: 5, jumpPower: -13, grounded: false, invincible: 0
};

let platforms = [], coinList = [], enemies = [], flagPole = { x: 820, y: 150, reached: false };

function createLevel() {
    flagPole.reached = false;
    platforms = [{ x: 0, y: 430, width: 900, height: 70 }];

    for(let i = 1; i <= 4; i++) {
        platforms.push({
            x: i * 180 - 40,
            y: 360 - (i % 2) * 80 - (Math.sin(level * i) * 30),
            width: 110,
            height: 18
        });
    }

    coinList = [];
    const count = 5 + Math.floor(level * 1.2);
    for (let i = 0; i < count; i++) {
        coinList.push({
            x: 100 + Math.random() * 700,
            y: 140 + Math.random() * 220,
            size: 16,
            collected: false
        });
    }

    enemies = [];
    const enemyCount = Math.min(1 + Math.floor(level * 0.6), 5);
    for (let i = 0; i < enemyCount; i++) {
        enemies.push({
            x: 200 + Math.random() * 550,
            y: 395,
            width: 35,
            height: 35,
            vx: 1 + level * 0.2,
            alive: true
        });
    }
}

function collision(a, b) {
    return (a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y);
}

function resetPlayer() {
    player.x = 70; player.y = 350; player.vx = 0; player.vy = 0; player.invincible = 120;
}

function loseLife() {
    if (player.invincible > 0 || gameOver || gameWon) return;
    playSound('hurt');
    lives--;
    if (lives <= 0) {
        gameOver = true;
        document.getElementById("message").innerHTML = "💀 GAME OVER<br><small style='font-size:14px; color:#aaa;'>ចុចលើអេក្រង់ដើម្បីលេងម្ដងទៀត</small>";
    } else {
        resetPlayer();
    }
    updateHUD();
}

function update() {
    if (paused || gameOver || gameWon) return;

    if (input.left) player.vx = -player.speed;
    else if (input.right) player.vx = player.speed;
    else player.vx *= .75;
    
    player.x += player.vx;

    if (input.jump && player.grounded) {
        player.vy = player.jumpPower;
        player.grounded = false;
        input.jump = false;
        playSound('jump');
    }

    player.vy += gravity;
    player.y += player.vy;
    player.grounded = false;

    for (const p of platforms) {
        if (player.x + player.width > p.x && player.x < p.x + p.width &&
            player.y + player.height >= p.y && player.y + player.height <= p.y + 25 && player.vy >= 0) {
            player.y = p.y - player.height;
            player.vy = 0;
            player.grounded = true;
        }
    }

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > W) player.x = W - player.width;

    if (player.y > H + 50) {
        loseLife();
        return;
    }

    for (const coin of coinList) {
        if (coin.collected) continue;
        if (collision(player, { x: coin.x, y: coin.y, width: coin.size, height: coin.size })) {
            coin.collected = true;
            coins++;
            score += 10;
            playSound('coin');
        }
    }

    for (const enemy of enemies) {
        if (!enemy.alive) continue;
        enemy.x += enemy.vx;
        if (enemy.x < 50 || enemy.x > W - 50) enemy.vx *= -1;

        if (collision(player, enemy)) {
            if (player.vy > 0 && player.y + player.height - 10 < enemy.y + 15) {
                enemy.alive = false;
                player.vy = -9;
                score += 50;
                playSound('stomp');
            } else {
                loseLife();
                return;
            }
        }
    }

    if (player.invincible > 0) player.invincible--;

    if (!flagPole.reached && collision(player, { x: flagPole.x, y: flagPole.y, width: 20, height: 180 })) {
        flagPole.reached = true;
        score += 100 * level;
        playSound('win');

        if (level >= maxLevel) {
            gameWon = true;
            document.getElementById("message").innerHTML = "🏆 CONGRATULATIONS!<br><small style='font-size:14px; color:#aaa;'>អ្នកបានឈ្នះទាំង ១០ កម្រិតដោយជោគជ័យ! 🎉</small>";
        } else {
            level++;
            gravity += 0.01;
            createLevel();
            resetPlayer();
        }
    }
    updateHUD();
}

function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#3a7bd5");
    sky.addColorStop(1, "#3a6073");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath(); ctx.arc(150, 100, 30, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(520, 120, 40, 0, Math.PI * 2); ctx.fill();
}

function drawWorld() {
    for (const p of platforms) {
        ctx.fillStyle = "#5c4033";
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(p.x, p.y, p.width, 6);
    }

    ctx.fillStyle = "#95a5a6";
    ctx.fillRect(flagPole.x + 8, flagPole.y, 4, 180);
    ctx.fillStyle = "#e74c3c";
    ctx.beginPath();
    ctx.moveTo(flagPole.x + 12, flagPole.y);
    ctx.lineTo(flagPole.x + 38, flagPole.y + 15);
    ctx.lineTo(flagPole.x + 12, flagPole.y + 30);
    ctx.closePath();
    ctx.fill();

    for (const coin of coinList) {
        if (coin.collected) continue;
        ctx.fillStyle = "#f1c40f";
        ctx.beginPath(); ctx.arc(coin.x + 8, coin.y + 8, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#f39c12";
        ctx.beginPath(); ctx.arc(coin.x + 8, coin.y + 8, 5, 0, Math.PI * 2); ctx.fill();
    }

    for (const enemy of enemies) {
        if (!enemy.alive) continue;
        ctx.fillStyle = "#9b59b6";
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.fillStyle = "white";
        ctx.fillRect(enemy.x + 6, enemy.y + 8, 6, 6);
        ctx.fillRect(enemy.x + 22, enemy.y + 8, 6, 6);
    }
}

function drawPlayer() {
    if (player.invincible > 0 && Math.floor(player.invincible / 5) % 2 === 0) return;
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(player.x + 4, player.y, 27, 9);
    ctx.fillStyle = "#f39c12";
    ctx.fillRect(player.x + 7, player.y + 13, 20, 17);
    ctx.fillStyle = "#2980b9";
    ctx.fillRect(player.x + 5, player.y + 29, 24, 12);
}

function draw() {
    drawBackground();
    drawWorld();
    drawPlayer();

    if (paused && !gameOver && !gameWon) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "white";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("⏸️ PAUSED", W / 2, H / 2);
        ctx.textAlign = "left";
    }
}

function updateHUD() {
    document.getElementById("score").textContent = score;
    document.getElementById("coins").textContent = coins;
    document.getElementById("level").textContent = level;
    document.getElementById("lives").textContent = lives;
}

function holdButton(element, property) {
    const down = e => { e.preventDefault(); initAudio(); input[property] = true; };
    const up = e => { e.preventDefault(); input[property] = false; };
    element.addEventListener("touchstart", down, { passive: false });
    element.addEventListener("touchend", up, { passive: false });
    element.addEventListener("mousedown", down);
    element.addEventListener("mouseup", up);
}

holdButton(document.getElementById("leftBtn"), "left");
holdButton(document.getElementById("rightBtn"), "right");

const jumpBtn = document.getElementById("jumpBtn");
jumpBtn.addEventListener("touchstart", e => { e.preventDefault(); initAudio(); input.jump = true; }, { passive: false });
jumpBtn.addEventListener("mousedown", () => { initAudio(); input.jump = true; });

const soundBtn = document.getElementById("soundBtn");
soundBtn.addEventListener("click", () => {
    initAudio();
    soundEnabled = !soundEnabled;
    soundBtn.textContent = soundEnabled ? "🔊" : "🔇";
});

document.getElementById("pauseBtn").addEventListener("click", () => {
    if (!gameOver && !gameWon) paused = !paused;
});

window.addEventListener("keydown", e => {
    initAudio();
    if (e.code === "ArrowLeft" || e.code === "KeyA") input.left = true;
    if (e.code === "ArrowRight" || e.code === "KeyD") input.right = true;
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault(); input.jump = true;
    }
});
window.addEventListener("keyup", e => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") input.left = false;
    if (e.code === "ArrowRight" || e.code === "KeyD") input.right = false;
});

function restartGame() {
    score = 0; coins = 0; level = 1; lives = 3; gravity = 0.65;
    gameOver = false; gameWon = false; paused = false;
    document.getElementById("message").innerHTML = "";
    createLevel(); resetPlayer(); updateHUD();
}

canvas.addEventListener("click", () => { if (gameOver || gameWon) restartGame(); });

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

createLevel();
resetPlayer();
updateHUD();
loop();
