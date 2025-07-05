// Cyberpunk English Learning Game - JavaScript
class CyberpunkEnglishGame {
    constructor() {
        this.playerData = {
            level: 1,
            exp: 0,
            expToNext: 100,
            hackingSkill: 1,
            currentMission: 0,
            score: 0,
            lives: 3
        };
        
        this.gameState = 'menu'; // menu, playing, gameOver, victory
        this.currentQuestion = null;
        this.timeLeft = 30;
        this.timer = null;
        this.glitchInterval = null;
        this.typingSound = null;
        
        // 英語問題データ（中3レベル）
        this.missions = [
            {
                title: "SYSTEM BREACH - Grammar Hack",
                description: "文法エラーを修正してシステムに侵入せよ！",
                questions: [
                    {
                        question: "I have ____ this movie before.",
                        options: ["see", "saw", "seen", "seeing"],
                        correct: 2,
                        explanation: "現在完了形では過去分詞(seen)を使います"
                    },
                    {
                        question: "If I ____ rich, I would buy a house.",
                        options: ["am", "was", "were", "be"],
                        correct: 2,
                        explanation: "仮定法過去ではwereを使います"
                    },
                    {
                        question: "The book ____ by many students.",
                        options: ["reads", "read", "is read", "was read"],
                        correct: 2,
                        explanation: "受動態の現在形は「is/are + 過去分詞」"
                    }
                ]
            },
            {
                title: "DATA EXTRACTION - Vocabulary Virus",
                description: "暗号化された単語の意味を解読せよ！",
                questions: [
                    {
                        question: "ENCRYPTED WORD: 'ACCOMPLISH'",
                        options: ["失敗する", "達成する", "始める", "終了する"],
                        correct: 1,
                        explanation: "accomplish = 達成する、成し遂げる"
                    },
                    {
                        question: "DECRYPT: 'ARTIFICIAL'",
                        options: ["自然の", "人工の", "美しい", "危険な"],
                        correct: 1,
                        explanation: "artificial = 人工の、人造の"
                    },
                    {
                        question: "DECODE: 'FUNDAMENTAL'",
                        options: ["表面的な", "複雑な", "基本的な", "最終的な"],
                        correct: 2,
                        explanation: "fundamental = 基本的な、根本的な"
                    }
                ]
            },
            {
                title: "NETWORK INFILTRATION - Reading Comprehension",
                description: "機密文書を読解してパスワードを取得せよ！",
                questions: [
                    {
                        question: "Text: 'The advanced AI system was designed to protect the city from cyber attacks. However, it became too powerful and started making decisions without human control.' What is the main problem?",
                        options: ["AI protects the city", "AI became uncontrollable", "Cyber attacks increased", "Humans lost jobs"],
                        correct: 1,
                        explanation: "AIが人間の制御なしに決定を下すようになったことが主な問題"
                    },
                    {
                        question: "According to the text, what was the AI's original purpose?",
                        options: ["Control humans", "Make decisions", "Protect from cyber attacks", "Replace workers"],
                        correct: 2,
                        explanation: "元々はサイバー攻撃から街を守るために設計された"
                    }
                ]
            }
        ];
        
        this.hackingCommands = [
            "EXEC_A", "EXEC_B", "EXEC_C", "EXEC_D",
            "RUN_1", "RUN_2", "RUN_3", "RUN_4"
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startGlitchEffect();
        this.updateUI();
    }
    
    setupEventListeners() {
        // メニューボタン
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        // 回答ボタン
        document.querySelectorAll('.answer-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.selectAnswer(index);
            });
        });
        
        // キーボード入力（ハッキングコマンド）
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'playing') {
                this.handleKeyInput(e);
            }
        });
        
        // 次の問題ボタン
        document.getElementById('nextButton').addEventListener('click', () => {
            this.nextQuestion();
        });
        
        // リスタートボタン
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.playerData.currentMission = 0;
        this.playerData.lives = 3;
        this.playerData.score = 0;
        this.showMissionBrief();
        this.updateUI();
        this.typewriterEffect(document.getElementById('missionTitle'), this.missions[0].title);
    }
    
    showMissionBrief() {
        const mission = this.missions[this.playerData.currentMission];
        document.getElementById('missionTitle').textContent = mission.title;
        document.getElementById('missionDescription').textContent = mission.description;
        
        setTimeout(() => {
            this.loadQuestion();
        }, 2000);
    }
    
    loadQuestion() {
        const mission = this.missions[this.playerData.currentMission];
        const questionIndex = Math.floor(Math.random() * mission.questions.length);
        this.currentQuestion = { ...mission.questions[questionIndex], index: questionIndex };
        
        // 質問を表示
        document.getElementById('questionText').textContent = this.currentQuestion.question;
        
        // 選択肢を表示（ハッキングコマンド付き）
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach((btn, index) => {
            btn.textContent = `${this.hackingCommands[index]}: ${this.currentQuestion.options[index]}`;
            btn.classList.remove('correct', 'incorrect');
            btn.disabled = false;
        });
        
        // タイマー開始
        this.startTimer();
        
        // ハッキングエフェクト
        this.showHackingEffect();
    }
    
    startTimer() {
        this.timeLeft = 30;
        this.updateTimer();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }
    
    updateTimer() {
        const timerEl = document.getElementById('timer');
        timerEl.textContent = `TIME: ${this.timeLeft}`;
        
        if (this.timeLeft <= 10) {
            timerEl.classList.add('warning');
        } else {
            timerEl.classList.remove('warning');
        }
    }
    
    timeUp() {
        clearInterval(this.timer);
        this.playerData.lives--;
        this.showResult(false, "TIME UP!");
        
        if (this.playerData.lives <= 0) {
            this.gameOver();
        }
    }
    
    selectAnswer(answerIndex) {
        if (!this.currentQuestion) return;
        
        clearInterval(this.timer);
        
        const isCorrect = answerIndex === this.currentQuestion.correct;
        this.showResult(isCorrect, this.currentQuestion.explanation);
        
        // ボタンの色を変更
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach((btn, index) => {
            btn.disabled = true;
            if (index === this.currentQuestion.correct) {
                btn.classList.add('correct');
            } else if (index === answerIndex && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        if (isCorrect) {
            this.playerData.score += 100;
            this.playerData.exp += 50;
            this.playSuccessSound();
            this.checkLevelUp();
        } else {
            this.playerData.lives--;
            this.playErrorSound();
            
            if (this.playerData.lives <= 0) {
                setTimeout(() => this.gameOver(), 2000);
                return;
            }
        }
        
        this.updateUI();
    }
    
    showResult(isCorrect, explanation) {
        const resultEl = document.getElementById('result');
        const explanationEl = document.getElementById('explanation');
        
        resultEl.textContent = isCorrect ? "ACCESS GRANTED!" : "ACCESS DENIED!";
        resultEl.className = isCorrect ? 'result success' : 'result error';
        explanationEl.textContent = explanation;
        
        document.getElementById('nextButton').style.display = 'block';
    }
    
    nextQuestion() {
        document.getElementById('result').textContent = '';
        document.getElementById('explanation').textContent = '';
        document.getElementById('nextButton').style.display = 'none';
        
        // 次のミッションに進むかチェック
        if (this.playerData.score >= (this.playerData.currentMission + 1) * 300) {
            this.playerData.currentMission++;
            
            if (this.playerData.currentMission >= this.missions.length) {
                this.victory();
                return;
            }
            
            this.showMissionBrief();
        } else {
            this.loadQuestion();
        }
    }
    
    checkLevelUp() {
        if (this.playerData.exp >= this.playerData.expToNext) {
            this.playerData.level++;
            this.playerData.exp -= this.playerData.expToNext;
            this.playerData.expToNext = Math.floor(this.playerData.expToNext * 1.5);
            this.playerData.hackingSkill++;
            
            this.showLevelUpEffect();
        }
    }
    
    showLevelUpEffect() {
        const levelUpEl = document.createElement('div');
        levelUpEl.className = 'level-up-effect';
        levelUpEl.textContent = `LEVEL UP! Lv.${this.playerData.level}`;
        document.body.appendChild(levelUpEl);
        
        setTimeout(() => {
            levelUpEl.remove();
        }, 3000);
    }
    
    handleKeyInput(e) {
        const key = e.key.toUpperCase();
        
        // ハッキングコマンド
        if (key === 'A' || key === '1') this.selectAnswer(0);
        else if (key === 'B' || key === '2') this.selectAnswer(1);
        else if (key === 'C' || key === '3') this.selectAnswer(2);
        else if (key === 'D' || key === '4') this.selectAnswer(3);
        
        // 隠しコマンド
        if (key === 'H' && e.ctrlKey) {
            this.showHiddenMenu();
        }
    }
    
    showHiddenMenu() {
        const hiddenEl = document.createElement('div');
        hiddenEl.className = 'hidden-menu';
        hiddenEl.innerHTML = `
            <h3>HIDDEN COMMANDS</h3>
            <p>A/1: Option A</p>
            <p>B/2: Option B</p>
            <p>C/3: Option C</p>
            <p>D/4: Option D</p>
            <p>Ctrl+H: This menu</p>
        `;
        document.body.appendChild(hiddenEl);
        
        setTimeout(() => {
            hiddenEl.remove();
        }, 5000);
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.updateUI();
        this.showGameOverEffect();
    }
    
    victory() {
        this.gameState = 'victory';
        this.updateUI();
        this.showVictoryEffect();
    }
    
    showGameOverEffect() {
        const gameOverEl = document.createElement('div');
        gameOverEl.className = 'game-over-effect';
        gameOverEl.innerHTML = `
            <h2>SYSTEM COMPROMISED</h2>
            <p>Final Score: ${this.playerData.score}</p>
            <p>Level Reached: ${this.playerData.level}</p>
        `;
        document.body.appendChild(gameOverEl);
    }
    
    showVictoryEffect() {
        const victoryEl = document.createElement('div');
        victoryEl.className = 'victory-effect';
        victoryEl.innerHTML = `
            <h2>MISSION COMPLETE!</h2>
            <p>Perfect Score: ${this.playerData.score}</p>
            <p>Master Level: ${this.playerData.level}</p>
            <p>You are now a Cyber English Master!</p>
        `;
        document.body.appendChild(victoryEl);
    }
    
    restartGame() {
        this.playerData = {
            level: 1,
            exp: 0,
            expToNext: 100,
            hackingSkill: 1,
            currentMission: 0,
            score: 0,
            lives: 3
        };
        
        this.gameState = 'menu';
        this.currentQuestion = null;
        this.timeLeft = 30;
        
        // エフェクトをクリア
        document.querySelectorAll('.game-over-effect, .victory-effect, .level-up-effect').forEach(el => {
            el.remove();
        });
        
        this.updateUI();
    }
    
    startGlitchEffect() {
        this.glitchInterval = setInterval(() => {
            this.applyGlitchEffect();
        }, 3000);
    }
    
    applyGlitchEffect() {
        const elements = document.querySelectorAll('.glitch-text');
        elements.forEach(el => {
            el.classList.add('glitch-active');
            setTimeout(() => {
                el.classList.remove('glitch-active');
            }, 300);
        });
    }
    
    showHackingEffect() {
        const hackingEl = document.createElement('div');
        hackingEl.className = 'hacking-effect';
        hackingEl.textContent = 'HACKING IN PROGRESS...';
        document.body.appendChild(hackingEl);
        
        setTimeout(() => {
            hackingEl.remove();
        }, 1500);
    }
    
    typewriterEffect(element, text) {
        element.textContent = '';
        let i = 0;
        const speed = 100;
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }
    
    playSuccessSound() {
        // Web Audio API を使用した効果音
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    playErrorSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }
    
    updateUI() {
        // プレイヤー情報更新
        document.getElementById('playerLevel').textContent = this.playerData.level;
        document.getElementById('playerExp').textContent = `${this.playerData.exp}/${this.playerData.expToNext}`;
        document.getElementById('playerScore').textContent = this.playerData.score;
        document.getElementById('playerLives').textContent = this.playerData.lives;
        
        // 画面の表示切り替え
        document.getElementById('menuScreen').style.display = 
            this.gameState === 'menu' ? 'block' : 'none';
        document.getElementById('gameScreen').style.display = 
            this.gameState === 'playing' ? 'block' : 'none';
        document.getElementById('gameOverScreen').style.display = 
            this.gameState === 'gameOver' ? 'block' : 'none';
        document.getElementById('victoryScreen').style.display = 
            this.gameState === 'victory' ? 'block' : 'none';
    }
}

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    new CyberpunkEnglishGame();
});

// スマホ対応：画面向き変更対応
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        document.body.style.height = window.innerHeight + 'px';
    }, 100);
});
