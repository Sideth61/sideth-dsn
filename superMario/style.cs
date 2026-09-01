:root {
    --primary-glow: rgba(92, 148, 252, 0.5);
    --glass-bg: rgba(20, 20, 30, 0.75);
    --border-color: rgba(255, 255, 255, 0.2);
}
*{
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
}
html, body{
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #0a0a0f;
    color: white;
    font-family: 'Poppins', Arial, sans-serif;
    touch-action: none;
}
#gameWrap{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at center, #1a1a2f 0%, #0a0a0f 100%);
}
#hud{
    width: min(100%, 900px);
    padding: 10px 16px;
    display: flex;
    justify-content: space-between;
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    font-size: 15px;
    font-weight: 600;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    border: 1px solid var(--border-color);
    border-bottom: none;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}
#gameCanvas{
    width: min(100vw, 900px);
    height: auto;
    max-height: 70vh;
    border-left: 1px solid var(--border-color);
    border-right: 1px solid var(--border-color);
    display: block;
    background: #5c94fc;
    box-shadow: 0 10px 30px rgba(0,0,0,0.8);
}
#gamepadStatus{
    position: fixed;
    top: 60px;
    left: 15px;
    z-index: 10;
    padding: 6px 12px;
    border-radius: 20px;
    background: var(--glass-bg);
    backdrop-filter: blur(5px);
    font-size: 12px;
    border: 1px solid var(--border-color);
}
.top-btns {
    position: fixed;
    top: 12px;
    right: 15px;
    display: flex;
    gap: 10px;
    z-index: 10;
}
.ctrl-top-btn{
    width: 42px;
    height: 42px;
    border: 1px solid var(--border-color);
    border-radius: 50%;
    background: var(--glass-bg);
    backdrop-filter: blur(5px);
    color: white;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}
.ctrl-top-btn:active{
    transform: scale(0.9);
}
#controls{
    position: fixed;
    bottom: 16px;
    left: 0;
    width: 100%;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
}
.group{
    display: flex;
    gap: 14px;
    pointer-events: auto;
}
.btn{
    width: 70px;
    height: 70px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.3);
    background: linear-gradient(135deg, rgba(40,40,60,0.8), rgba(15,15,25,0.9));
    backdrop-filter: blur(8px);
    color: white;
    font-size: 26px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    touch-action: none;
    box-shadow: 0 6px 15px rgba(0,0,0,0.4);
    transition: transform 0.1s, background 0.2s;
}
.btn:active{
    transform: scale(.9);
    background: linear-gradient(135deg, rgba(92,148,252,0.6), rgba(40,40,60,0.9));
}
#message{
    position: fixed;
    top: 45%;
    left: 50%;
    transform: translate(-50%,-50%);
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    text-shadow: 0 3px 6px rgba(0,0,0,0.8);
    z-index: 20;
    pointer-events: none;
    background: rgba(0,0,0,0.7);
    padding: 20px 30px;
    border-radius: 16px;
    border: 1px solid var(--border-color);
    backdrop-filter: blur(10px);
}
#message:empty {
    display: none;
}
@media(min-width: 700px){
    .btn{
        width: 64px;
        height: 64px;
    }
}
