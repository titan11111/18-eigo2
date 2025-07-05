/* Cyberpunk English Learning Game - CSS */

/* 基本設定 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Courier New', monospace;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
    color: #00ff41;
    overflow-x: hidden;
    min-height: 100vh;
    position: relative;
}

.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    position: relative;
    z-index: 1;
}

/* グリッチエフェクト */
.glitch-text {
    position: relative;
    font-weight: bold;
    text-shadow: 
        0 0 5px #00ff41,
        0 0 10px #00ff41,
        0 0 20px #00ff41;
    animation: textGlow 2s ease-in-out infinite alternate;
}

.glitch-text.glitch-active {
    animation: glitch 0.3s ease-in-out;
}

@keyframes textGlow {
    from {
        text-shadow: 
            0 0 5px #00ff41,
            0 0 10px #00ff41,
            0 0 20px #00ff41;
    }
    to {
        text-shadow: 
            0 0 10px #00ff41,
            0 0 20px #00ff41,
            0 0 30px #00ff41,
            0 0 40px #00ff41;
    }
}

@keyframes glitch {
    0%, 100% {
        transform: translate(0);
    }
    10% {
        transform: translate(-2px, 2px);
    }
    20% {
        transform: translate(2px, -2px);
    }
    30% {
        transform: translate(-2px, -2px);
    }
    40% {
        transform: translate(2px, 2px);
    }
    50% {
        transform: translate(-2px, 2px);
    }
    60% {
        transform: translate(2px, -2px);
    }
    70% {
        transform: translate(-2px, -2px);
    }
    80% {
        transform: translate(2px, 2px);
    }
    90% {
        transform: translate(-2px, 2px);
    }
}

/* メニュー画面 */
.logo {
    text-align: center;
    margin-bottom: 40px;
}

.logo h1 {
    font-size: 3rem;
    line-height: 1;
    margin-bottom: 10px;
    background: linear-gradient(45deg, #00ff41, #00d4ff, #ff0080);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.subtitle {
    font-size: 1.2rem;
    color: #888;
    margin-bottom: 30px;
}

.menu-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
}

.game-info {
    background: rgba(0, 255, 65, 0.1);
    border: 2px solid #00ff41;
    border-radius: 10px;
    padding: 20px;
    text-align
