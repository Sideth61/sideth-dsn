"use strict";

let audioCtx = null, soundEnabled = true;
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playSound(type) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode); gainNode.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'jump') {
        osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);
        gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'coin') {
        osc.frequency.setValueAtTime(987.77, now); osc.frequency.setValueAtTime(1318.51, now + 0.08);
        gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'stomp') {
        osc.frequency.setValueAtTime(120, now); osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        gainNode.gain.setValueAtTime(0.15, now); gainNode.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now); osc.stop(now + 0.12);
    }
}

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;

let score = 0, highScore = localStorage.getItem("sideth_highscore") || 0, coins = 0;
let level = 1, maxLevel = 10, lives = 3, gravity = 0.65;
let paused = false, gameOver = false, gameWon = false;
let screenShake = 0;

let floatingTexts = [];
function addFloatingText(text, x, y, color = "#f1c40f") {
    floatingTexts.push({ text, x, y, vy: -1.5, alpha: 1, color });
}

const input = { left: false, right: false, jump: false };
const player = {
    x: 70, y: 350, width: 34, height: 46, vx: 0, vy: 0,
    speed: 5.2, jumpPower: -13.2, grounded: false, invincible: 0,
    color: "#e74c3c"
};

let platforms = [], coinList = [], enemies = [], flagPole = { x: 820, y: 150, reached: false };

function createLevel() {
    flagPole.reached = false;
    platforms = [{ x: 0, y: 430, width: 900, height: 70 }];
    for(let i = 1; i <= 4; i++) {
        platforms.push({
            x: i * 180 - 40,
            y: 350 - (i % 2) * 85 - (Math.sin(level * i) * 25),
            width: 105, height: 18
        });
    }

    coinList = [];
    for (let i = 0; i < 5 + Math.floor(level * 1.2); i++) {
        coinList.push({ x: 100 + Math.random() * 700, y: 140 + Math.random() * 220, size: 16, collected: false });
    }

    enemies = [];
    for (let i = 0; i < Math.min(1 + Math.floor(level * 0.6), 5); i++) {
        enemies.push({ x: 200 + Math.random() * 550, y: 395, width: 35, height: 35, vx: 1 + level * 0.22, alive: true });
    }
}

function collision(a, b) {
    return (a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y);
}

function resetPlayer() {
    player.x = 70; player.y = 350; player.vx = 0; player.vy = 0; player.invincible = 120;
}

function update() {
    if (paused || gameOver || gameWon) return;

    if (input.left) player.vx = -player.speed;
    else if (input.right) player.vx = player.speed;
    else player.vx *= .75;
    player.x += player.vx;

    if (input.jump && player.grounded) {
        player.vy = player.jumpPower; player.grounded = false; input.jump = false;
        playSound('jump');
    }

    player.vy += gravity; player.y += player.vy; player.grounded = false;

    for (const p of platforms) {
        if (player.x + player.width > p.x && player.x < p.x + p.width &&
            player.y + player.height >= p.y && player.y + player.height <= p.y + 25 && player.vy >= 0) {
            player.y = p.y - player.height; player.vy = 0; player.grounded = true;
        }
    }

    if (player.x < 0) player.x = 0; if (player.x + player.width > W) player.x = W - player.width;

    if (player.y > H + 50) {
        lives--; screenShake = 20; resetPlayer();
        if (lives <= 0) gameOver = true;
    }

    for (const coin of coinList) {
        if (!coin.collected && collision(player, { x: coin.x, y: coin.y, width: coin.size, height: coin.size })) {
            coin.collected = true; coins++; score += 10;
            addFloatingText("+10", coin.x, coin.y);
            playSound('coin');
        }
    }

    for (const enemy of enemies) {
        if (!enemy.alive) continue;
        enemy.x += enemy.vx; if (enemy.x < 50 || enemy.x > W - 50) enemy.vx *= -1;

        if (collision(player, enemy)) {
            if (player.vy > 0 && player.y + player.height - 10 < enemy.y + 15) {
                enemy.alive = false; player.vy = -9.5; score += 50;
                addFloatingText("+50", enemy.x, enemy.y, "#9b59b6");
                playSound('stomp');
            } else {
                if (player.invincible === 0) {
                    lives--; player.invincible = 120; screenShake = 15;
                    if (lives <= 0) gameOver = true;
                }
            }
        }
    }

    if (player.invincible > 0) player.invincible--;
    if (screenShake > 0) screenShake--;

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        let ft = floatingTexts[i];
        ft.y += ft.vy; ft.alpha -= 0.03;
        if (ft.alpha <= 0) floatingTexts.splice(i, 1);
    }

    if (!flagPole.reached && collision(player, { x: flagPole.x, y: flagPole.y, width: 20, height: 180 })) {
        flagPole.reached = true; score += 150 * level;
        if (level >= maxLevel) gameWon = true;
        else { level++; createLevel(); resetPlayer(); }
    }
    
    document.getElementById("score").textContent = score;
    document.getElementById("coins").textContent = coins;
    document.getElementById("level").textContent = level;
    document.getElementById("lives").textContent = lives;
}

function draw() {
    ctx.save();
    if (screenShake > 0) {
        let offsetX = (Math.random() - 0.5) * 8;
        let offsetY = (Math.random() - 0.5) * 8;
        ctx.translate(offsetX, offsetY);
    }

    ctx.fillStyle = "#2c3e50"; ctx.fillRect(0, 0, W, H);

    for (const p of platforms) {
        ctx.fillStyle = "#4a3525"; ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.fillStyle = "#2ecc71"; ctx.fillRect(p.x, p.y, p.width, 6);
    }

    for (const coin of coinList) {
        if (coin.collected) continue;
        ctx.fillStyle = "#f1c40f"; ctx.beginPath(); ctx.arc(coin.x + 8, coin.y + 8, 8, 0, Math.PI * 2); ctx.fill();
    }

    for (const enemy of enemies) {
        if (!enemy.alive) continue;
        ctx.fillStyle = "#8e44ad"; ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }

    ctx.fillStyle = player.color;
    ctx.fillRect(player.x + 4, player.y, 27, 40);

    for (const ft of floatingTexts) {
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.alpha;
        ctx.font = "bold 16px Poppins";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1.0;
    }

    ctx.restore();
    requestAnimationFrame(loop);
}

function holdButton(element, property) {
    const down = e => { e.preventDefault(); input[property] = true; };
    const up = e => { e.preventDefault(); input[property] = false; };
    element.addEventListener("touchstart", down, { passive: false });
    element.addEventListener("touchend", up, { passive: false });
    element.addEventListener("mousedown", down);
    element.addEventListener("mouseup", up);
}

holdButton(document.getElementById("leftBtn"), "left");
holdButton(document.getElementById("rightBtn"), "right");
document.getElementById("jumpBtn").addEventListener("touchstart", e => { e.preventDefault(); input.jump = true; }, { passive: false });
document.getElementById("jumpBtn").addEventListener("mousedown", () => { input.jump = true; });

function loop() {
    update();
    draw();
}

createLevel();
resetPlayer();
loop();
