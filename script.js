// DOM要素の取得
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerImage = document.getElementById('playerImage');
const messageScreen = document.getElementById('messageScreen');
const messageTitle = document.getElementById('messageTitle');
const messageText = document.getElementById('messageText');
const messageButton = document.getElementById('messageButton');
const currentStageSpan = document.getElementById('currentStage');
const currentLifeSpan = document.getElementById('currentLife');
const soundToggle = document.getElementById('soundToggle');
const volumeDown = document.getElementById('volumeDown');
const volumeUp = document.getElementById('volumeUp');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const jumpBtn = document.getElementById('jumpBtn');

// オーディオ要素の取得
const bgm = document.getElementById('bgm');
const seJump = document.getElementById('seJump');
const seCollect = document.getElementById('seCollect');
const seHit = document.getElementById('seHit');
const seStageClear = document.getElementById('seStageClear');
const seGameOver = document.getElementById('seGameOver');

// ゲーム状態と設定
let gameState = 'menu';
let currentStage = 1;
let playerLife = 3; // 初期ライフを3に設定
let soundEnabled = true;
let volume = 0.5;
let score = 0;
let stageStartTime = 0;
const keys = { left: false, right: false, space: false };

// 敵画像をステージごとに切り替え
let stageEnemyImage = null;

// === ここから追加・修正 ===

// 全ての画像要素を非表示にする関数
function hideAllImages() {
    const images = document.querySelectorAll('img[id$="Image"], img[id^="enemy"], img[id="goburin"], img[id="naito"], img[id^="summon"]');
    images.forEach(img => {
        img.style.display = 'none';
    });
}

// ゲーム初期化時、または最初にスクリプトが読み込まれた時に画像を非表示にする
// これにより、HTMLで指定されているにも関わらず見えてしまう問題を回避します。
hideAllImages();

// === ここまで追加・修正 ===

// 追加: ゲームの最大ステージ数
const maxStages = 10; // ここを5から10に変更

// プレイヤー設定
const player = {
  x: 50, y: 200,
  width: 40, height: 40,
  velocityX: 0, velocityY: 0,
  speed: 5, jumpPower: 12,
  onGround: false,
  invulnerable: false,
  invulnerableTime: 0,
  // === パワーアップ関連のプロパティ追加 ===
  speedBoostActive: false,
  speedBoostTimer: 0,
  highJumpActive: false,
  highJumpTimer: 0,
  shieldActive: false,
  shieldTimer: 0
  // =====================================
};

// 物理設定
const gravity = 0.5;
const maxFallSpeed = 10;
let items = [];
let particles = [];

// ステージデータ定義（ステージ1〜5を含む）
const stages = [
  {
    name: "CYBER_LAB",
    bgColor: "#001122",
    platforms: [
      { x: 0, y: 250, width: 200, height: 20 },
      { x: 250, y: 350, width: 150, height: 20 },
      { x: 450, y: 280, width: 100, height: 20 },
      { x: 600, y: 400, width: 200, height: 20 },
      { x: 300, y: 500, width: 200, height: 20 },
      { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 } // Floor
    ],
    enemies: [
      { x: 100, y: 210, width: 30, height: 30, startX: 100, range: 50, velocityX: 1, direction: 1 },
      { x: 500, y: 240, width: 30, height: 30, startX: 500, range: 40, velocityX: 1.2, direction: -1 }
    ],
    items: [
      { x: 100, y: 220, width: 20, height: 20, type: 'coin' },
      { x: 480, y: 250, width: 20, height: 20, type: 'coin' },
      { x: 350, y: 470, width: 20, height: 20, type: 'heart' },
      { x: 50, y: 180, width: 20, height: 20, type: 'speedBoost' } // スピードブースト追加
    ],
    goal: { x: 750, y: 360, width: 30, height: 30 }
  },
  {
    name: "NEON_ALLEYS",
    bgColor: "#1a0a2a",
    platforms: [
      { x: 0, y: 450, width: 100, height: 20 }, // 調整済み
      { x: 150, y: 380, width: 120, height: 20 }, // 調整済み
      { x: 300, y: 310, width: 80, height: 20 }, // 調整済み
      { x: 450, y: 240, width: 150, height: 20 }, // 調整済み
      { x: 650, y: 170, width: 100, height: 20 }, // 調整済み
      { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 }
    ],
    enemies: [
      { x: 200, y: 350, width: 30, height: 30, startX: 200, range: 70, velocityX: 1.5, direction: 1 }, // 敵の位置も調整
      { x: 500, y: 200, width: 30, height: 30, startX: 500, range: 60, velocityX: 1.8, direction: -1 }  // 敵の位置も調整
    ],
    items: [
      { x: 200, y: 360, width: 20, height: 20, type: 'coin' }, // アイテムの位置も調整
      { x: 500, y: 210, width: 20, height: 20, type: 'coin' }, // アイテムの位置も調整
      { x: 700, y: 140, width: 20, height: 20, type: 'coin' },  // アイテムの位置も調整
      { x: 350, y: 280, width: 20, height: 20, type: 'highJump' } // ハイジャンプ追加
    ],
    goal: { x: 700, y: 130, width: 30, height: 30 } // ゴールの位置も調整
  },
  {
    name: "SKY_BRIDGE",
    bgColor: "#000a1a",
    platforms: [
      { x: 0, y: 450, width: 150, height: 20 },
      { x: 200, y: 350, width: 100, height: 20 },
      { x: 350, y: 250, width: 80, height: 20 },
      { x: 500, y: 150, width: 120, height: 20 },
      { x: 650, y: 300, width: 150, height: 20 },
      { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 }
    ],
    enemies: [
      { x: 250, y: 310, width: 30, height: 30, startX: 250, range: 50, velocityX: 2, direction: 1 },
      { x: 550, y: 110, width: 30, height: 30, startX: 550, range: 40, velocityX: 2.2, direction: -1 },
      { x: 700, y: 260, width: 30, height: 30, startX: 700, range: 70, velocityX: 1.5, direction: 1 }
    ],
    items: [
      { x: 250, y: 320, width: 20, height: 20, type: 'coin' },
      { x: 550, y: 120, width: 20, height: 20, type: 'heart' },
      { x: 700, y: 270, width: 20, height: 20, type: 'coin' },
      { x: 400, y: 220, width: 20, height: 20, type: 'shield' } // シールド追加
    ],
    goal: { x: 750, y: 260, width: 30, height: 30 }
  },
  {
    name: "URBAN_JUNGLE",
    bgColor: "#0a1a0a",
    platforms: [
      { x: 0, y: 420, width: 180, height: 20 }, // Yを少し下げ、幅を広げた
      { x: 230, y: 330, width: 130, height: 20 }, // Yを少し下げ、幅を広げた
      { x: 430, y: 470, width: 120, height: 20 }, // Yを少し下げ、幅を広げた
      { x: 580, y: 370, width: 180, height: 20 }, // Yを少し下げ、幅を広げた
      { x: 80, y: 220, width: 100, height: 20 }, // Yを少し下げ、幅を広げた
      { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 }
    ],
    enemies: [
      { x: 150, y: 360, width: 30, height: 30, startX: 150, range: 60, velocityX: 1.7, direction: 1 },
      { x: 300, y: 260, width: 30, height: 30, startX: 300, range: 50, velocityX: 2, direction: -1 },
      { x: 500, y: 410, width: 30, height: 30, startX: 500, range: 40, velocityX: 1.8, direction: 1 }
    ],
    items: [
      { x: 150, y: 370, width: 20, height: 20, type: 'coin' },
      { x: 300, y: 270, width: 20, height: 20, type: 'coin' },
      { x: 500, y: 420, width: 20, height: 20, type: 'heart' },
      { x: 150, y: 170, width: 20, height: 20, type: 'coin' },
      { x: 650, y: 320, width: 20, height: 20, type: 'speedBoost' } // スピードブースト追加
    ],
    goal: { x: 750, y: 310, width: 30, height: 30 }
  },
  {
    name: "CORE_MATRIX",
    bgColor: "#2a0a2a",
    platforms: [
      { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 }, // Floor (常に存在)
      { x: 80, y: 440, width: 180, height: 20 }, // 幅を広げ、Y座標を調整
      { x: 300, y: 350, width: 150, height: 20 }, // 幅を広げ、X, Y座標を調整
      { x: 500, y: 260, width: 130, height: 20 }, // 幅を広げ、X, Y座標を調整
      { x: 680, y: 170, width: 100, height: 20 },  // X, Y座標を調整
      { x: 150, y: 190, width: 100, height: 20 }, // 新しい足場を追加
      { x: 50, y: canvas.height - 150, width: 100, height: 20 }, // 追加の足場
      { x: canvas.width - 150, y: canvas.height - 150, width: 100, height: 20 }, // 追加の足場
      { x: 200, y: canvas.height - 250, width: 120, height: 20 }, // 追加の足場
      { x: canvas.width - 320, y: canvas.height - 250, width: 120, height: 20 }, // 追加の足場
      { x: canvas.width / 2 - 250, y: canvas.height - 300, width: 80, height: 20 } // 更に追加の足場
    ],
    enemies: [
      { x: 150, y: 400, width: 40, height: 40, startX: 150, range: 70, velocityX: 2.0, direction: 1 }, // 速度を調整
      { x: 370, y: 310, width: 40, height: 40, startX: 370, range: 60, velocityX: 2.3, direction: -1 }, // 速度を調整
      { x: 550, y: 220, width: 40, height: 40, startX: 550, range: 50, velocityX: 2.5, direction: 1 },  // 速度を調整
      // ボス敵（CORE_MATRIXは通常のステージなので、もしボスステージとして定義するならボスロジックをここに組み込む）
      // 例: { x: canvas.width / 2 - 50, y: canvas.height - 250, width: 100, height: 100, dx: 1.5, dy: 0, type: 'boss', life: 10, maxLife: 10, lastAttackTime: 0, attackInterval: 180, attackType: 'projectile', canBeDamaged: true, invincibleTimer: 0 }
    ],
    items: [
      { x: 180, y: 410, width: 20, height: 20, type: 'coin' },
      { x: 400, y: 320, width: 20, height: 20, type: 'coin' },
      { x: 580, y: 230, width: 20, height: 20, type: 'coin' },
      { x: 700, y: 130, width: 20, height: 20, type: 'heart' },
      { x: 200, y: 150, width: 20, height: 20, type: 'shield' }, // シールド追加
      { x: 450, y: 220, width: 20, height: 20, type: 'highJump' }, // ハイジャンプ追加
      { x: 50, y: canvas.height - 200, radius: 10, type: 'life' }, // ライフ回復追加
      { x: canvas.width - 70, y: canvas.height - 200, radius: 10, type: 'life' }, // ライフ回復追加
      { x: canvas.width / 2, y: canvas.height - 350, radius: 10, type: 'life' } // ライフ回復追加
    ],
    goal: { x: 750, y: 120, width: 40, height: 40 } // ゴールの位置を調整
  },
  {
    name: "CYBER_FORTRESS",
    bgColor: "#0a0a2a",
    platforms: [
      { x: 0, y: 480, width: 180, height: 20 }, // 幅を広げた
      { x: 180, y: 390, width: 120, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 330, y: 290, width: 100, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 480, y: 190, width: 120, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 630, y: 390, width: 180, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 280, y: 490, width: 140, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 }
    ],
    enemies: [
      { x: 250, y: 340, width: 35, height: 35, startX: 250, range: 80, velocityX: 2.2, direction: 1 },
      { x: 550, y: 140, width: 35, height: 35, startX: 550, range: 60, velocityX: 2.5, direction: -1 },
      { x: 700, y: 340, width: 35, height: 35, startX: 700, range: 70, velocityX: 2.8, direction: 1 },
      { x: 350, y: 440, width: 35, height: 35, startX: 350, range: 50, velocityX: 3, direction: -1 }
    ],
    items: [
      { x: 250, y: 350, width: 20, height: 20, type: 'coin' },
      { x: 550, y: 150, width: 20, height: 20, type: 'coin' },
      { x: 700, y: 350, width: 20, height: 20, type: 'heart' },
      { x: 380, y: 250, width: 20, height: 20, type: 'speedBoost' },
      { x: 350, y: 450, width: 20, height: 20, type: 'shield' }
    ],
    goal: { x: 750, y: 340, width: 30, height: 30 }
  },
  {
    name: "NEON_DEPTHS",
    bgColor: "#2a1a0a",
    platforms: [
      { x: 0, y: 460, width: 140, height: 20 }, // Yを少し下げ、幅を広げた
      { x: 150, y: 370, width: 100, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 280, y: 270, width: 120, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 430, y: 420, width: 110, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 580, y: 320, width: 140, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 730, y: 220, width: 70, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 180, y: 520, width: 440, height: 20 }, // 幅を広げた
      { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 }
    ],
    enemies: [
      { x: 200, y: 310, width: 35, height: 35, startX: 200, range: 60, velocityX: 2.5, direction: 1 },
      { x: 330, y: 210, width: 35, height: 35, startX: 330, range: 50, velocityX: 3, direction: -1 },
      { x: 500, y: 360, width: 35, height: 35, startX: 500, range: 40, velocityX: 2.8, direction: 1 },
      { x: 650, y: 260, width: 35, height: 35, startX: 650, range: 70, velocityX: 3.2, direction: -1 },
      { x: 300, y: 460, width: 35, height: 35, startX: 300, range: 200, velocityX: 2, direction: 1 }
    ],
    items: [
      { x: 200, y: 320, width: 20, height: 20, type: 'coin' },
      { x: 330, y: 220, width: 20, height: 20, type: 'coin' },
      { x: 500, y: 370, width: 20, height: 20, type: 'coin' },
      { x: 650, y: 270, width: 20, height: 20, type: 'highJump' },
      { x: 400, y: 470, width: 20, height: 20, type: 'heart' },
      { x: 750, y: 170, width: 20, height: 20, type: 'shield' }
    ],
    goal: { x: 750, y: 160, width: 30, height: 30 }
  },
  {
    name: "DIGITAL_STORM",
    bgColor: "#1a2a1a",
    platforms: [
      { x: 0, y: 500, width: 120, height: 20 }, // 幅を広げた
      { x: 130, y: 430, width: 90, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 250, y: 350, width: 110, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 390, y: 270, width: 100, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 520, y: 190, width: 120, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 670, y: 110, width: 130, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 80, y: 220, width: 80, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 330, y: 460, width: 170, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 }
    ],
    enemies: [
      { x: 180, y: 380, width: 40, height: 40, startX: 180, range: 80, velocityX: 3, direction: 1 },
      { x: 300, y: 300, width: 40, height: 40, startX: 300, range: 60, velocityX: 3.5, direction: -1 },
      { x: 440, y: 220, width: 40, height: 40, startX: 440, range: 50, velocityX: 3.2, direction: 1 },
      { x: 570, y: 140, width: 40, height: 40, startX: 570, range: 70, velocityX: 3.8, direction: -1 },
      { x: 400, y: 410, width: 40, height: 40, startX: 400, range: 100, velocityX: 2.5, direction: 1 },
      { x: 130, y: 160, width: 40, height: 40, startX: 130, range: 30, velocityX: 4, direction: -1 }
    ],
    items: [
      { x: 180, y: 390, width: 20, height: 20, type: 'coin' },
      { x: 300, y: 310, width: 20, height: 20, type: 'coin' },
      { x: 440, y: 230, width: 20, height: 20, type: 'speedBoost' },
      { x: 570, y: 150, width: 20, height: 20, type: 'coin' },
      { x: 720, y: 70, width: 20, height: 20, type: 'heart' },
      { x: 400, y: 420, width: 20, height: 20, type: 'shield' },
      { x: 130, y: 170, width: 20, height: 20, type: 'highJump' }
    ],
    goal: { x: 750, y: 60, width: 30, height: 30 }
  },
  {
    name: "VOID_NEXUS",
    bgColor: "#2a0a1a",
    platforms: [
      { x: 0, y: 500, width: 100, height: 20 }, // 幅を広げた
      { x: 110, y: 460, width: 80, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 220, y: 390, width: 100, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 350, y: 310, width: 90, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 470, y: 230, width: 110, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 610, y: 150, width: 100, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 730, y: 70, width: 70, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 80, y: 330, width: 70, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 180, y: 250, width: 80, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 530, y: 390, width: 120, height: 20 }, // Xを左に、Yを少し下げ、幅を広げた
      { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 }
    ],
    enemies: [
      { x: 160, y: 410, width: 40, height: 40, startX: 160, range: 60, velocityX: 3.5, direction: 1 },
      { x: 270, y: 340, width: 40, height: 40, startX: 270, range: 50, velocityX: 4, direction: -1 },
      { x: 400, y: 260, width: 40, height: 40, startX: 400, range: 40, velocityX: 3.8, direction: 1 },
      { x: 520, y: 180, width: 40, height: 40, startX: 520, range: 60, velocityX: 4.2, direction: -1 },
      { x: 660, y: 100, width: 40, height: 40, startX: 660, range: 50, velocityX: 4.5, direction: 1 },
      { x: 130, y: 280, width: 40, height: 40, startX: 130, range: 30, velocityX: 3, direction: -1 },
      { x: 580, y: 340, width: 40, height: 40, startX: 580, range: 70, velocityX: 3.2, direction: 1 }
    ],
    items: [
      { x: 160, y: 420, width: 20, height: 20, type: 'coin' },
      { x: 270, y: 350, width: 20, height: 20, type: 'speedBoost' },
      { x: 400, y: 270, width: 20, height: 20, type: 'coin' },
      { x: 520, y: 190, width: 20, height: 20, type: 'highJump' },
      { x: 660, y: 110, width: 20, height: 20, type: 'coin' },
      { x: 770, y: 30, width: 20, height: 20, type: 'heart' },
      { x: 130, y: 290, width: 20, height: 20, type: 'shield' },
      { x: 580, y: 350, width: 20, height: 20, type: 'coin' }
    ],
    goal: { x: 770, y: 20, width: 30, height: 30 }
  },
  {
    name: "FINAL_CORE",
    bgColor: "#3a0a3a",
    platforms: [
      { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 },
      { x: 0, y: 510, width: 80, height: 20 }, // Yを少し上げ、幅を広げた
      { x: 90, y: 470, width: 70, height: 20 }, // Xを左に、Yを少し上げ、幅を広げた
      { x: 170, y: 410, width: 80, height: 20 }, // Xを左に、Yを少し上げ、幅を広げた
      { x: 270, y: 350, width: 70, height: 20 }, // Xを左に、Yを少し上げ、幅を広げた
      { x: 360, y: 290, width: 90, height: 20 }, // Xを左に、Yを少し上げ、幅を広げた
      { x: 470, y: 230, width: 80, height: 20 }, // Xを左に、Yを少し上げ、幅を広げた
      { x: 570, y: 170, width: 70, height: 20 }, // Xを左に、Yを少し上げ、幅を広げた
      { x: 660, y: 110, width: 80, height: 20 }, // Xを左に、Yを少し上げ、幅を広げた
      { x: 730, y: 50, width: 70, height: 20 }, // Xを左に、Yを少し上げ、幅を広げた
      { x: 130, y: 330, width: 60, height: 20 }, // Xを左に、Yを少し上げ、幅を広げた
      { x: 230, y: 270, width: 60, height: 20 }, // Xを左に、Yを少し上げ、幅を広げた
      { x: 330, y: 210, width: 60, height: 20 }, // Xを左に、Yを少し上げ、幅を広げた
      { x: 430, y: 150, width: 60, height: 20 }, // Xを左に、Yを少し上げ、幅を広げた
      { x: 510, y: 390, width: 100, height: 20 }, // Xを左に、Yを少し上げ、幅を広げた
      { x: 630, y: 330, width: 80, height: 20 }  // Xを左に、Yを少し上げ、幅を広げた
    ],
    enemies: [
      { x: 130, y: 420, width: 45, height: 45, startX: 130, range: 60, velocityX: 4, direction: 1 },
      { x: 220, y: 360, width: 45, height: 45, startX: 220, range: 50, velocityX: 4.5, direction: -1 },
      { x: 320, y: 300, width: 45, height: 45, startX: 320, range: 40, velocityX: 4.2, direction: 1 },
      { x: 410, y: 240, width: 45, height: 45, startX: 410, range: 80, velocityX: 5, direction: -1 },
      { x: 520, y: 180, width: 45, height: 45, startX: 520, range: 30, velocityX: 4.8, direction: 1 },
      { x: 620, y: 120, width: 45, height: 45, startX: 620, range: 60, velocityX: 5.2, direction: -1 },
      { x: 710, y: 60, width: 45, height: 45, startX: 710, range: 40, velocityX: 5.5, direction: 1 },
      { x: 180, y: 280, width: 45, height: 45, startX: 180, range: 30, velocityX: 4.5, direction: -1 },
      { x: 380, y: 160, width: 45, height: 45, startX: 380, range: 40, velocityX: 5, direction: 1 },
      { x: 560, y: 340, width: 45, height: 45, startX: 560, range: 50, velocityX: 4.2, direction: -1 }
    ],
    items: [
      { x: 130, y: 430, width: 20, height: 20, type: 'coin' },
      { x: 220, y: 370, width: 20, height: 20, type: 'speedBoost' },
      { x: 320, y: 310, width: 20, height: 20, type: 'coin' },
      { x: 410, y: 250, width: 20, height: 20, type: 'highJump' },
      { x: 520, y: 190, width: 20, height: 20, type: 'coin' },
      { x: 620, y: 130, width: 20, height: 20, type: 'shield' },
      { x: 710, y: 70, width: 20, height: 20, type: 'coin' },
      { x: 770, y: 10, width: 20, height: 20, type: 'heart' },
      { x: 180, y: 290, width: 20, height: 20, type: 'coin' },
      { x: 380, y: 170, width: 20, height: 20, type: 'coin' },
      { x: 560, y: 350, width: 20, height: 20, type: 'speedBoost' }
    ],
    goal: { x: 770, y: 0, width: 30, height: 30 }
  }
];
let currentStageData = stages[0];

// 初期化
function init() {
  updateUI();
  setupEventListeners();
  // resetStage() と resetPlayer() は startGame() で呼ばれるのでここでは不要
  gameLoop();
  setVolume(); // 初期音量設定を適用
  showMessage('ゲームスタート', 'ボタンを押してゲームを開始！', 'スタート'); // 初期メッセージ表示
}

// ステージリセット
function resetStage() {
  currentStageData = stages[currentStage - 1];
  // 敵の初期位置もリセット
  currentStageData.enemies.forEach(enemy => {
    enemy.x = enemy.startX;
    enemy.direction = 1; // 向きを初期化
  });
  // ステージ5の場合、ボスの設定を個別に調整
  if (currentStage === 5 && currentStageData.enemies.some(e => e.type === 'boss')) {
    const boss = currentStageData.enemies.find(e => e.type === 'boss');
    if (boss) {
      boss.life = boss.maxLife; // ボスのライフをリセット
      boss.dx = 1.5; // ボスの移動速度を調整
      boss.y = canvas.height - 250; // ボスの初期Y座標を調整
    }
  }
  items = currentStageData.items.map(item => ({...item}));
  particles = [];
  stageStartTime = Date.now();

  // ステージに応じた敵画像を設定
  updateEnemyImageForStage(); // 関数呼び出しに変更
}

// ステージに応じた敵画像を設定する関数
function updateEnemyImageForStage() {
  // 既存の敵画像を非表示にする
  const existingEnemies = document.querySelectorAll('[id^="enemy"], #goburin, #naito, #summon2, #summon3, #summon5');
  existingEnemies.forEach(img => img.style.display = 'none');

  let enemyId = '';
  switch (currentStage) {
    case 1:
      enemyId = 'enemy1'; // 例: enemy1.png
      break;
    case 2:
      enemyId = 'enemy2'; // 例: enemy2.png
      break;
    case 3:
      enemyId = 'enemy3'; // 例: enemy3.png
      break;
    case 4:
      enemyId = 'enemy4'; // 例: enemy4.png
      break;
    case 5:
      enemyId = 'summon5'; // ← 召喚獣をステージ5に割当
      break;
    case 6: // 追加: ステージ6
      enemyId = 'goburin'; // goburin.png
      break;
    case 7: // 追加: ステージ7
      enemyId = 'naito'; // naito.png
      break;
    case 8: // 追加: ステージ8
      enemyId = 'summon2'; // summon_2.png
      break;
    case 9: // 追加: ステージ9
      enemyId = 'summon3'; // summon_3.jpg
      break;
    case 10: // ← 魔王をステージ10に割当
      enemyId = 'enemy5'; // maou.png
      break;
    default:
      enemyId = 'enemy1'; // デフォルト
      break;
  }

  stageEnemyImage = document.getElementById(enemyId);
  if (stageEnemyImage) {
    stageEnemyImage.style.display = 'block'; // 選択された敵画像を表示
  } else {
    console.warn(`Enemy image for stage ${currentStage} (${enemyId}) not found.`);
  }
}


// UI更新
function updateUI() {
  currentStageSpan.textContent = currentStage;
  currentStageSpan.nextElementSibling.textContent = `/ ${maxStages}`; // ステージ総数をmaxStagesから取得
  currentLifeSpan.textContent = playerLife;
  const lifeFill = document.querySelector('.life-fill');
  if (lifeFill) {
    lifeFill.style.width = `${(playerLife / 3) * 100}%`;
  }
}

// イベントリスナー
function setupEventListeners() {
  document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'Space') {
      if (player.onGround && gameState === 'playing') {
        playSE(seJump);
      }
      keys.space = true;
      e.preventDefault();
    }
  });
  document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'Space') keys.space = false;
  });

  leftBtn.addEventListener('touchstart', (e) => { keys.left = true; e.preventDefault(); }, { passive: false });
  leftBtn.addEventListener('touchend', () => keys.left = false);
  leftBtn.addEventListener('mousedown', () => keys.left = true);
  leftBtn.addEventListener('mouseup', () => keys.left = false);

  rightBtn.addEventListener('touchstart', (e) => { keys.right = true; e.preventDefault(); }, { passive: false });
  rightBtn.addEventListener('touchend', () => keys.right = false);
  rightBtn.addEventListener('mousedown', () => keys.right = true);
  rightBtn.addEventListener('mouseup', () => keys.right = false);

  jumpBtn.addEventListener('touchstart', (e) => {
    if (player.onGround && gameState === 'playing') playSE(seJump);
    keys.space = true;
    e.preventDefault();
  }, { passive: false });
  jumpBtn.addEventListener('touchend', () => keys.space = false);
  jumpBtn.addEventListener('mousedown', () => keys.space = true);
  jumpBtn.addEventListener('mouseup', () => keys.space = false);

  messageButton.addEventListener('click', handleMessageButton);
  soundToggle.addEventListener('click', toggleSound);
  volumeDown.addEventListener('click', () => changeVolume(-0.1));
  volumeUp.addEventListener('click', () => changeVolume(0.1));
}
// メッセージボタン処理
function handleMessageButton() {
  if (gameState === 'menu') {
    startGame();
  } else if (gameState === 'gameOver') {
    restartGame();
  } else if (gameState === 'stageClear') {
    nextStage();
  } else if (gameState === 'gameComplete') {
    restartGame();
  }
}

function startGame() {
  gameState = 'playing';
  hideMessage();
  currentStage = 1; // ゲーム開始時にステージを1にリセット
  playerLife = 3; // ゲーム開始時にライフを3にリセット
  score = 0; // スコアをリセット
  resetPlayerPosition(); // プレイヤーの位置をリセット
  resetPowerUps(); // パワーアップ状態をリセット
  resetStage(); // ステージをリセット
  updateUI();
  playBGM();
}

function restartGame() {
  currentStage = 1;
  playerLife = 3;
  score = 0;
  gameState = 'playing';
  hideMessage();
  resetPlayerPosition(); // プレイヤーの位置をリセット
  resetPowerUps(); // パワーアップ状態をリセット
  resetStage();
  updateUI();
  playBGM();
}

function nextStage() {
  if (currentStage < maxStages) { // stages.length の代わりに maxStages を使用
    currentStage++;
    gameState = 'playing';
    hideMessage();
    resetPlayerPosition(); // プレイヤーの位置をリセット
    resetPowerUps(); // パワーアップ状態をリセット
    resetStage();
    updateUI();
    playBGM();
  } else {
    gameState = 'gameComplete';
    stopBGM();
    playSE(seStageClear);
    showMessage('ゲームクリア！', '全ステージクリアおめでとう！', 'もう一度遊ぶ');
  }
}

// プレイヤー位置のリセット（ライフが減った時など）
function resetPlayerPosition() {
  player.x = 50;
  player.y = 200;
  player.velocityX = 0;
  player.velocityY = 0;
  player.onGround = false;
  player.invulnerable = false;
  player.invulnerableTime = 0;
}

// パワーアップ状態をリセット
function resetPowerUps() {
  player.speedBoostActive = false;
  player.speedBoostTimer = 0;
  player.highJumpActive = false;
  player.highJumpTimer = 0;
  player.shieldActive = false;
  player.shieldTimer = 0;
  player.speed = 5; // 基本速度に戻す
  player.jumpPower = 12; // 基本ジャンプ力に戻す
}

// サウンド関係
function setVolume() {
  bgm.volume = volume;
  seJump.volume = volume;
  seCollect.volume = volume;
  seHit.volume = volume;
  seStageClear.volume = volume;
  seGameOver.volume = volume;
}

function playBGM() {
  if (soundEnabled) {
    bgm.play().catch(e => console.log("BGM再生エラー:", e));
  }
}

function stopBGM() {
  bgm.pause();
  bgm.currentTime = 0;
}

function playSE(audioElement) {
  if (soundEnabled) {
    audioElement.currentTime = 0;
    audioElement.play().catch(e => console.log("SE再生エラー:", e));
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? '🎵' : '🔇';
  if (soundEnabled) {
    if (gameState === 'playing') {
      playBGM();
    }
    setVolume();
  } else {
    stopBGM();
  }
}

function changeVolume(delta) {
  volume = Math.max(0, Math.min(1, volume + delta));
  setVolume();
}
// メッセージ表示/非表示
function showMessage(title, text, button) {
  messageTitle.textContent = title;
  messageText.textContent = text;
  messageButton.textContent = button;
  messageScreen.style.display = 'flex';
}

function hideMessage() {
  messageScreen.style.display = 'none';
}

// 衝突判定
function checkCollision(r1, r2) {
  return r1.x < r2.x + r2.width &&
         r1.x + r1.width > r2.x &&
         r1.y < r2.y + r2.height &&
         r1.y + r1.height > r2.y;
}

// ライフ減少
function loseLife() {
  if (player.invulnerable || player.shieldActive) return; // シールド中はダメージ無効

  playerLife--;
  updateUI();
  playSE(seHit);

  player.invulnerable = true;
  player.invulnerableTime = 120;
  createHitParticles(player.x + player.width/2, player.y + player.height/2);

  if (playerLife <= 0) {
    gameState = 'gameOver';
    stopBGM();
    playSE(seGameOver);
    showMessage('ゲームオーバー', 'ライフがなくなりました', 'リスタート');
  } else {
    resetPlayerPosition(); // ライフが減った時もプレイヤー位置をリセット
  }
}

// パーティクル
function createHitParticles(x, y) {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: x,
      y: y,
      velocityX: (Math.random() - 0.5) * 10,
      velocityY: Math.random() * -8 - 2,
      life: 30,
      maxLife: 30,
      color: '#ff4444'
    });
  }
}

function createItemParticles(x, y, color) {
  for (let i = 0; i < 6; i++) {
    particles.push({
      x: x,
      y: y,
      velocityX: (Math.random() - 0.5) * 6,
      velocityY: Math.random() * -4 - 1,
      life: 20,
      maxLife: 20,
      color: color
    });
  }
}

// プレイヤー処理
function updatePlayer() {
  // パワーアップ効果の適用
  let currentSpeed = player.speed;
  let currentJumpPower = player.jumpPower;

  if (player.speedBoostActive) {
    currentSpeed = player.speed * 1.5; // 速度1.5倍
    player.speedBoostTimer--;
    if (player.speedBoostTimer <= 0) {
      player.speedBoostActive = false;
      // player.speed = 5; // 元に戻す（resetPowerUpsでまとめて管理）
    }
  }

  if (player.highJumpActive) {
    currentJumpPower = player.jumpPower * 1.5; // ジャンプ力1.5倍
    player.highJumpTimer--;
    if (player.highJumpTimer <= 0) {
      player.highJumpActive = false;
      // player.jumpPower = 12; // 元に戻す（resetPowerUpsでまとめて管理）
    }
  }

  if (player.shieldActive) {
    player.shieldTimer--;
    if (player.shieldTimer <= 0) {
      player.shieldActive = false;
    }
  }

  // キー入力による移動
  if (keys.left) player.velocityX = -currentSpeed;
  else if (keys.right) player.velocityX = currentSpeed;
  else player.velocityX = 0;

  if (keys.space && player.onGround) {
    player.velocityY = -currentJumpPower; // 適用されたジャンプ力を使う
    player.onGround = false;
  }

  player.velocityY += gravity;
  if (player.velocityY > maxFallSpeed) player.velocityY = maxFallSpeed;

  player.x += player.velocityX;
  player.y += player.velocityY;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

  if (player.y > canvas.height) {
    loseLife();
    return;
  }

  // 無敵時間処理
  if (player.invulnerable) {
    player.invulnerableTime--;
    if (player.invulnerableTime <= 0) {
      player.invulnerable = false;
    }
  }

  player.onGround = false;
  for (let platform of currentStageData.platforms) {
    if (
      player.y + player.height > platform.y &&
      player.y < platform.y + platform.height &&
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x
    ) {
      if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
        player.y = platform.y - player.height;
        player.velocityY = 0;
        player.onGround = true;
      } else if (player.velocityY < 0 && player.y >= platform.y + platform.height - player.velocityY) {
        player.y = platform.y + platform.height;
        player.velocityY = 0;
      }
    }
  }
}

// 敵処理
function updateEnemies() {
  for (let enemy of currentStageData.enemies) {
    enemy.x += enemy.velocityX * enemy.direction;
    if (Math.abs(enemy.x - enemy.startX) >= enemy.range) enemy.direction *= -1;
    // シールドがアクティブな場合はダメージを受けない
    if (!player.invulnerable && !player.shieldActive && checkCollision(player, enemy)) {
      loseLife();
      return;
    }
  }
}

// アイテム処理
function updateItems() {
  for (let i = items.length - 1; i >= 0; i--) { // 後ろからループして削除に対応
    let item = items[i];
    if (item.collected) continue; // すでに収集済みならスキップ

    if (checkCollision(player, item)) {
      item.collected = true; // アイテムを収集済みにマーク
      playSE(seCollect);

      if (item.type === 'coin') {
        score += 100;
        createItemParticles(item.x + item.width/2, item.y + item.height/2, '#ffd700');
      } else if (item.type === 'heart') {
        if (playerLife < 5) { // 最大ライフを5として設定
          playerLife++;
          updateUI();
        }
        createItemParticles(item.x + item.width/2, item.y + item.height/2, '#ff6666');
      } else if (item.type === 'speedBoost') {
        player.speedBoostActive = true;
        player.speedBoostTimer = 300; // 5秒間 (60フレーム/秒 * 5秒)
        createItemParticles(item.x + item.width/2, item.y + item.height/2, '#00ffff'); // シアン
      } else if (item.type === 'highJump') {
        player.highJumpActive = true;
        player.highJumpTimer = 300; // 5秒間
        createItemParticles(item.x + item.width/2, item.y + item.height/2, '#ff00ff'); // マゼンタ
      } else if (item.type === 'shield') {
        player.shieldActive = true;
        player.shieldTimer = 300; // 5秒間
        createItemParticles(item.x + item.width/2, item.y + item.height/2, '#ffff00'); // 黄色
      }
      // 収集したアイテムを配列から削除
      items.splice(i, 1);
    }
  }
}

// ゴール判定
function checkGoal() {
  if (checkCollision(player, currentStageData.goal)) {
    stopBGM();
    playSE(seStageClear);
    if (currentStage < maxStages) { // stages.length の代わりに maxStages を使用
      gameState = 'stageClear';
      const timeBonus = Math.max(0, 30 - Math.floor((Date.now() - stageStartTime) / 1000)) * 10;
      score += 500 + timeBonus;
      showMessage(
        `SECTOR ${currentStage} CLEAR!`,
        `CODE ${currentStageData.name} を突破！\nSCORE: ${score}`,
        '次のセクターへ'
      );
    } else {
      gameState = 'gameComplete';
      score += 1000;
      showMessage('MISSION COMPLETE!', `全セクター攻略完了！\nFINAL SCORE: ${score}`, '再起動');
    }
  }
}

// パーティクル更新
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.velocityX;
    p.y += p.velocityY;
    p.velocityY += 0.3;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// 描画処理
function draw() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, currentStageData.bgColor);
  gradient.addColorStop(1, '#000000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#00ff88';
  ctx.strokeStyle = '#00cc66';
  ctx.lineWidth = 2;
  for (let platform of currentStageData.platforms) {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
  }

  // 敵描画（ステージごとに切替）
  for (let enemy of currentStageData.enemies) {
    if (stageEnemyImage && stageEnemyImage.complete && stageEnemyImage.naturalWidth > 0) {
      ctx.drawImage(stageEnemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
    } else {
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
  }

  // アイテム描画
  for (let item of items) {
    // if (item.collected) continue; // アイテムは収集されたら配列から削除されるため、このチェックは不要
    let itemColor = '';
    switch (item.type) {
      case 'coin':
        itemColor = '#ffd700'; // ゴールド
        break;
      case 'heart':
        itemColor = '#ff6666'; // レッド
        break;
      case 'speedBoost':
        itemColor = '#00ffff'; // シアン
        break;
      case 'highJump':
        itemColor = '#ff00ff'; // マゼンタ
        break;
      case 'shield':
        itemColor = '#ffff00'; // イエロー
        break;
      default:
        itemColor = '#cccccc'; // その他
    }
    ctx.fillStyle = itemColor;
    ctx.fillRect(item.x, item.y, item.width, item.height);
  }

  // ゴール描画
  const goal = currentStageData.goal;
  ctx.fillStyle = '#ffff00';
  ctx.fillRect(goal.x, goal.y, goal.width, goal.height);

  // プレイヤー描画（無敵時点滅、シールド中はシールドエフェクト）
  let playerDrawAlpha = 1;
  if (player.invulnerable && Math.floor(player.invulnerableTime / 5) % 2 !== 0) {
    playerDrawAlpha = 0.4; // 点滅効果
  }

  // シールド中はプレイヤーの上にシールドを描画
  if (player.shieldActive) {
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.2; // 脈動する透明度
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1; // 元に戻す
  }

  ctx.globalAlpha = playerDrawAlpha;
  if (playerImage.complete && playerImage.naturalWidth > 0) {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
  } else {
    ctx.fillStyle = '#4444ff';
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
  ctx.globalAlpha = 1; // 元に戻す

  // パーティクル描画
  for (let p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#ffffff';
  ctx.font = '16px "Press Start 2P", cursive';
  ctx.fillText(`SCORE: ${score}`, 10, canvas.height - 20);

  // === パワーアップ残り時間表示（HUD） ===
  let hudY = canvas.height - 40;
  if (player.speedBoostActive) {
    ctx.fillStyle = '#00ffff';
    ctx.fillText(`SPEED: ${Math.ceil(player.speedBoostTimer / 60)}s`, canvas.width - 150, hudY);
    hudY -= 20; // 次の表示位置を上に移動
  }
  if (player.highJumpActive) {
    ctx.fillStyle = '#ff00ff';
    ctx.fillText(`JUMP: ${Math.ceil(player.highJumpTimer / 60)}s`, canvas.width - 150, hudY);
    hudY -= 20;
  }
  if (player.shieldActive) {
    ctx.fillStyle = '#ffff00';
    ctx.fillText(`SHIELD: ${Math.ceil(player.shieldTimer / 60)}s`, canvas.width - 150, hudY);
    hudY -= 20;
  }
  // ======================================
}

// メインループ
function gameLoop() {
  requestAnimationFrame(gameLoop);
  if (gameState !== 'playing') return;
  updatePlayer();
  updateEnemies();
  updateItems();
  updateParticles();
  checkGoal();
  draw();
}

// ゲーム起動
init();