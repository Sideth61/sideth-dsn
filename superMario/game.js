:root {
    --glass-bg: rgba(15,15,25,.86);
    --border-color: rgba(255,255,255,.16);
}
* { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
html,body {
    margin:0; width:100%; height:100%; overflow:hidden;
    background:#050508; color:white;
    font-family:Poppins,system-ui,sans-serif; touch-action:none;
}
#gameWrap {
    width:100%; height:100%; display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    background:radial-gradient(circle at center,#1b1b3a 0%,#050508 100%);
}
#hud {
    width:min(100%,900px); padding:9px 14px; display:flex;
    justify-content:space-between; gap:8px;
    background:var(--glass-bg); backdrop-filter:blur(12px);
    font-size:13px; font-weight:700;
    border:1px solid var(--border-color); border-bottom:none;
    border-top-left-radius:14px; border-top-right-radius:14px;
}
#gameCanvas {
    width:min(100vw,900px); height:auto; max-height:70vh;
    border:1px solid var(--border-color); display:block;
    background:#5c94fc; box-shadow:0 15px 35px rgba(0,0,0,.8);
}
.top-btns {
    position:fixed; top:12px; right:15px; display:flex;
    gap:8px; z-index:40;
}
.ctrl-top-btn {
    width:42px; height:42px; border:1px solid var(--border-color);
    border-radius:50%; background:var(--glass-bg);
    backdrop-filter:blur(8px); color:white; font-size:16px;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer;
}
#gamepadStatus {
    position:fixed; top:12px; left:12px; z-index:40;
    padding:8px 11px; border-radius:12px;
    background:var(--glass-bg); border:1px solid var(--border-color);
    font-size:11px; opacity:.9;
}
#controls {
    position:fixed; bottom:max(16px,env(safe-area-inset-bottom));
    left:0; width:100%; padding:0 20px;
    display:flex; justify-content:space-between;
    pointer-events:none; z-index:35;
}
.group { display:flex; gap:14px; pointer-events:auto; }
.btn {
    width:72px; height:72px; border-radius:50%;
    border:2px solid rgba(255,255,255,.25);
    background:linear-gradient(135deg,rgba(40,40,65,.85),rgba(15,15,25,.95));
    color:white; font-size:26px; font-weight:bold;
    display:flex; align-items:center; justify-content:center;
    touch-action:none; user-select:none;
}
.btn:active,.ctrl-top-btn:active { transform:scale(.94); }
#message {
    position:fixed; top:45%; left:50%;
    transform:translate(-50%,-50%);
    text-align:center; font-size:22px; font-weight:800; z-index:50;
    pointer-events:none; background:rgba(10,10,20,.88);
    padding:22px 35px; border-radius:18px;
    border:1px solid var(--border-color);
    backdrop-filter:blur(15px); display:none;
}
#message.show { display:block; }
#message small { font-size:12px; font-weight:500; }
.restart-btn {
    margin-top:12px; padding:10px 18px; border:0; border-radius:10px;
    background:#fff; color:#111; font-weight:800; cursor:pointer;
}
.modal {
    position:fixed; inset:0; background:rgba(0,0,0,.62);
    display:none; align-items:center; justify-content:center;
    z-index:100; padding:20px;
}
.modal.open { display:flex; }
.modal-card {
    width:min(360px,94vw); max-height:80vh; overflow:auto;
    padding:22px; border-radius:18px;
    background:rgba(20,20,35,.97);
    border:1px solid var(--border-color);
    box-shadow:0 20px 60px rgba(0,0,0,.6);
}
.modal-card h3 { margin:0 0 15px; text-align:center; }
.skin-item {
    width:100%; display:flex; align-items:center; gap:10px;
    margin:8px 0; padding:10px; border-radius:12px;
    color:white; background:rgba(255,255,255,.07);
    border:1px solid transparent; cursor:pointer; text-align:left;
}
.skin-item.selected { border-color:#fff; background:rgba(255,255,255,.13); }
.skin-item span:nth-child(2) { flex:1; }
.skin-item small { opacity:.8; }
.skin-preview {
    width:28px; height:28px; border-radius:8px;
    border:2px solid rgba(255,255,255,.5);
}
.btn-close {
    width:100%; padding:11px; margin-top:8px; border:0;
    border-radius:10px; cursor:pointer; font-weight:800;
}
@media (max-width:600px) {
    #hud { font-size:11px; padding:8px 9px; }
    #gameCanvas { max-height:62vh; }
    .btn { width:64px; height:64px; }
    #gamepadStatus { display:none; }
    .top-btns { top:8px; right:8px; }
    .ctrl-top-btn { width:38px; height:38px; }
}
