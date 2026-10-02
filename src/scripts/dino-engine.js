import { sound } from './sound.js';

// Dino Pixel Matrix (20x22 pixels)
const DINO_RUN_1 = [
  '.........XXXXXX.....',
  '........XXXXXXXX....',
  '........XX.XXXXX....',
  '........XXXXXXXX....',
  '........XXXXXXXX....',
  '........XXXXX.......',
  '........XXXXXXXX....',
  '.X.....XXXXXXXXX....',
  '.XX...XXXXXXXXXX....',
  '.XXXXXXXXXXXXXX.....',
  '..XXXXXXXXXXXXX.....',
  '...XXXXXXXXXXX......',
  '....XXXXXXXXXX......',
  '.....XXXXXXXX.......',
  '......XXXXXX........',
  '......XX..XX........',
  '......XX...X........',
  '......X....X........',
  '......XX............',
  '......XXX...........',
  '....................'
];

const DINO_RUN_2 = [
  '.........XXXXXX.....',
  '........XXXXXXXX....',
  '........XX.XXXXX....',
  '........XXXXXXXX....',
  '........XXXXXXXX....',
  '........XXXXX.......',
  '........XXXXXXXX....',
  '.X.....XXXXXXXXX....',
  '.XX...XXXXXXXXXX....',
  '.XXXXXXXXXXXXXX.....',
  '..XXXXXXXXXXXXX.....',
  '...XXXXXXXXXXX......',
  '....XXXXXXXXXX......',
  '.....XXXXXXXX.......',
  '......XXXXXX........',
  '......XX..XX........',
  '......X....XX.......',
  '......X.....X.......',
  '............XX......',
  '...........XXX......',
  '....................'
];

const CACTUS_SMALL = [
  '...XX...',
  '...XX...',
  '.X.XX...',
  '.X.XX.X.',
  '.X.XX.X.',
  '.XXXXXX.',
  '...XX...',
  '...XX...',
  '...XX...',
  '...XX...',
  '...XX...',
  '...XX...'
];

const CACTUS_LARGE = [
  '....XX....',
  '....XX....',
  '.XX.XX....',
  '.XX.XX.XX.',
  '.XX.XX.XX.',
  '.XX.XX.XX.',
  '.XXXXX.XX.',
  '....XXXXX.',
  '....XX....',
  '....XX....',
  '....XX....',
  '....XX....',
  '....XX....',
  '....XX....',
  '....XX....'
];

const CLOUD = [
  '....XXXXX.......',
  '..XXXXXXXXX.....',
  '.XXXXXXXXXXX....',
  'XXXXXXXXXXXXX...',
  'XXXXXXXXXXXXXXXX',
  'XXXXXXXXXXXXXXXX'
];

export class AmbientDinoBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.groundY = 0;
    this.pixelSize = 2;
    this.speed = 2.4;
    this.frame = 0;
    this.cacti = [];
    this.clouds = [];
    this.particles = [];
    this.dinoLeg = 0;
    this.dinoY = 0;
    this.dinoVy = 0;
    this.isJumping = false;
    this.nextJumpTime = 200 + Math.random() * 200;

    this.googleColors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initElements();
    this.animate();
  }

  resize() {
    this.width = this.canvas.parentElement.clientWidth || window.innerWidth;
    this.height = Math.min(260, window.innerHeight * 0.35);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.groundY = this.height - 35;
    this.pixelSize = window.innerWidth < 768 ? 1.5 : 2;
  }

  initElements() {
    this.clouds = [
      { x: this.width * 0.15, y: 25, speed: 0.3 },
      { x: this.width * 0.55, y: 40, speed: 0.25 },
      { x: this.width * 0.85, y: 20, speed: 0.35 }
    ];

    this.cacti = [
      { x: this.width * 0.4, type: 'small' },
      { x: this.width * 0.75, type: 'large' },
      { x: this.width * 1.15, type: 'small' }
    ];

    // Ambient Google floating particles
    this.particles = Array.from({ length: 18 }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: 2 + Math.random() * 3,
      color: this.googleColors[Math.floor(Math.random() * this.googleColors.length)],
      alpha: 0.25 + Math.random() * 0.4,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -0.3 - Math.random() * 0.5
    }));
  }

  drawPixelMatrix(matrix, startX, startY, color, scale = this.pixelSize) {
    this.ctx.fillStyle = color;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] === 'X') {
          this.ctx.fillRect(startX + c * scale, startY + r * scale, scale, scale);
        }
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.frame++;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw subtle ambient Google floating particles
    this.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // 2. Clouds
    this.clouds.forEach((cloud) => {
      cloud.x -= cloud.speed;
      if (cloud.x < -80) cloud.x = this.width + 40;
      this.drawPixelMatrix(CLOUD, cloud.x, cloud.y, 'rgba(180, 195, 215, 0.45)', 2);
    });

    // 3. Ground line & bumps
    this.ctx.strokeStyle = 'rgba(150, 160, 175, 0.35)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.groundY);
    this.ctx.lineTo(this.width, this.groundY);
    this.ctx.stroke();

    // Ground pebbles
    this.ctx.fillStyle = 'rgba(170, 180, 195, 0.3)';
    for (let i = 0; i < this.width; i += 32) {
      const offsetX = (i - (this.frame * this.speed * 0.8) % 32);
      this.ctx.fillRect(offsetX, this.groundY + 6, 3, 2);
      this.ctx.fillRect(offsetX + 12, this.groundY + 12, 4, 2);
    }

    // 4. Cacti
    this.cacti.forEach((cactus) => {
      cactus.x -= this.speed;
      if (cactus.x < -40) {
        cactus.x = this.width + 100 + Math.random() * 200;
        cactus.type = Math.random() > 0.5 ? 'large' : 'small';
      }

      if (cactus.type === 'large') {
        const h = CACTUS_LARGE.length * this.pixelSize;
        this.drawPixelMatrix(CACTUS_LARGE, cactus.x, this.groundY - h, '#5F6368', this.pixelSize);
      } else {
        const h = CACTUS_SMALL.length * this.pixelSize;
        this.drawPixelMatrix(CACTUS_SMALL, cactus.x, this.groundY - h, '#5F6368', this.pixelSize);
      }
    });

    // 5. Dino Auto-Runner with auto-jump near cactus
    const dinoX = 80;
    const dinoH = 21 * this.pixelSize;

    // Check if cactus is approaching to jump!
    const approachingCactus = this.cacti.find((c) => c.x > dinoX && c.x < dinoX + 90);
    if (approachingCactus && !this.isJumping) {
      this.isJumping = true;
      this.dinoVy = -9;
    }

    if (this.isJumping) {
      this.dinoY += this.dinoVy;
      this.dinoVy += 0.55; // gravity
      if (this.dinoY >= 0) {
        this.dinoY = 0;
        this.dinoVy = 0;
        this.isJumping = false;
      }
    }

    if (this.frame % 8 === 0) {
      this.dinoLeg = 1 - this.dinoLeg;
    }

    const currentSprite = this.isJumping ? DINO_RUN_1 : (this.dinoLeg === 0 ? DINO_RUN_1 : DINO_RUN_2);
    this.drawPixelMatrix(currentSprite, dinoX, this.groundY - dinoH + this.dinoY, '#4285F4', this.pixelSize);
  }
}

export class PlayableDinoGame {
  constructor(canvasId, scoreId, highScoreId, restartBtnId) {
    this.canvas = document.getElementById(canvasId);
    this.scoreEl = document.getElementById(scoreId);
    this.highScoreEl = document.getElementById(highScoreId);
    this.restartBtn = document.getElementById(restartBtnId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.width = 600;
    this.height = 200;
    this.groundY = 165;
    this.pixelSize = 2;

    this.dino = {
      x: 40,
      y: 0,
      vy: 0,
      isJumping: false,
      isDucking: false,
      legFrame: 0,
      width: 20 * 2,
      height: 21 * 2
    };

    this.obstacles = [];
    this.clouds = [];
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('gdg_dino_hi') || '0', 10);
    this.speed = 6;
    this.isGameOver = false;
    this.isPlaying = false;
    this.animationId = null;
    this.lastObstacleSpawn = 0;
    this.frame = 0;
    this.isNight = false;

    if (this.highScoreEl) {
      this.highScoreEl.innerText = this.highScore.toString().padStart(5, '0');
    }

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (!this.isPlaying) return;
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        this.jump();
      }
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (!this.isPlaying) {
        this.start();
      } else if (this.isGameOver) {
        this.reset();
      } else {
        this.jump();
      }
    });

    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => {
        this.reset();
      });
    }
  }

  start() {
    this.isPlaying = true;
    this.isGameOver = false;
    this.score = 0;
    this.speed = 6;
    this.obstacles = [];
    this.clouds = [
      { x: 200, y: 30, speed: 0.8 },
      { x: 450, y: 50, speed: 0.6 }
    ];
    this.dino.y = 0;
    this.dino.vy = 0;
    this.dino.isJumping = false;
    this.loop();
  }

  reset() {
    this.start();
  }

  stop() {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  jump() {
    if (this.dino.isJumping || this.isGameOver) return;
    this.dino.isJumping = true;
    this.dino.vy = -12;
    sound.playDinoJump();
  }

  drawPixelMatrix(matrix, startX, startY, color, scale = this.pixelSize) {
    this.ctx.fillStyle = color;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] === 'X') {
          this.ctx.fillRect(startX + c * scale, startY + r * scale, scale, scale);
        }
      }
    }
  }

  loop() {
    if (!this.isPlaying) return;
    this.animationId = requestAnimationFrame(() => this.loop());
    this.update();
    this.render();
  }

  update() {
    if (this.isGameOver) return;
    this.frame++;

    // Score & speed progression
    if (this.frame % 5 === 0) {
      this.score++;
      if (this.score % 100 === 0) {
        sound.playDinoScore();
      }
      if (this.scoreEl) {
        this.scoreEl.innerText = this.score.toString().padStart(5, '0');
      }
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('gdg_dino_hi', this.highScore.toString());
        if (this.highScoreEl) {
          this.highScoreEl.innerText = this.highScore.toString().padStart(5, '0');
        }
      }
    }

    if (this.frame % 600 === 0 && this.speed < 13) {
      this.speed += 0.5;
    }

    this.isNight = Math.floor(this.score / 700) % 2 === 1;

    // Dino Physics
    if (this.dino.isJumping) {
      this.dino.y += this.dino.vy;
      this.dino.vy += 0.72; // gravity
      if (this.dino.y >= 0) {
        this.dino.y = 0;
        this.dino.vy = 0;
        this.dino.isJumping = false;
      }
    }

    if (this.frame % 6 === 0) {
      this.dino.legFrame = 1 - this.dino.legFrame;
    }

    // Spawn Obstacles
    if (this.frame - this.lastObstacleSpawn > 60 + Math.random() * 80) {
      const type = Math.random() > 0.4 ? 'large' : 'small';
      this.obstacles.push({
        x: this.width + 20,
        type: type,
        width: (type === 'large' ? CACTUS_LARGE[0].length : CACTUS_SMALL[0].length) * this.pixelSize,
        height: (type === 'large' ? CACTUS_LARGE.length : CACTUS_SMALL.length) * this.pixelSize
      });
      this.lastObstacleSpawn = this.frame;
    }

    // Update Obstacles & Collision Check
    const dinoHitBox = {
      x: this.dino.x + 8,
      y: this.groundY - this.dino.height + this.dino.y + 4,
      width: this.dino.width - 16,
      height: this.dino.height - 8
    };

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.speed;

      // Collision
      const obsHitBox = {
        x: obs.x + 2,
        y: this.groundY - obs.height + 2,
        width: obs.width - 4,
        height: obs.height - 2
      };

      if (
        dinoHitBox.x < obsHitBox.x + obsHitBox.width &&
        dinoHitBox.x + dinoHitBox.width > obsHitBox.x &&
        dinoHitBox.y < obsHitBox.y + obsHitBox.height &&
        dinoHitBox.y + dinoHitBox.height > obsHitBox.y
      ) {
        this.gameOver();
      }

      if (obs.x < -60) {
        this.obstacles.splice(i, 1);
      }
    }

    // Clouds
    this.clouds.forEach((cloud) => {
      cloud.x -= cloud.speed;
      if (cloud.x < -60) cloud.x = this.width + 40;
    });
  }

  gameOver() {
    this.isGameOver = true;
    sound.playDinoHit();
    if (this.restartBtn) {
      this.restartBtn.style.display = 'inline-flex';
    }
  }

  render() {
    this.ctx.fillStyle = this.isNight ? '#202124' : '#F8F9FA';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const fgColor = this.isNight ? '#E8EAED' : '#5F6368';
    const dinoColor = '#4285F4';

    // Clouds
    this.clouds.forEach((cloud) => {
      this.drawPixelMatrix(CLOUD, cloud.x, cloud.y, this.isNight ? '#3C4043' : '#DADCE0', 1.5);
    });

    // Ground
    this.ctx.strokeStyle = this.isNight ? '#5F6368' : '#BDC1C6';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.groundY);
    this.ctx.lineTo(this.width, this.groundY);
    this.ctx.stroke();

    // Obstacles
    this.obstacles.forEach((obs) => {
      const matrix = obs.type === 'large' ? CACTUS_LARGE : CACTUS_SMALL;
      this.drawPixelMatrix(matrix, obs.x, this.groundY - obs.height, fgColor, this.pixelSize);
    });

    // Dino
    const sprite = this.dino.isJumping ? DINO_RUN_1 : (this.dino.legFrame === 0 ? DINO_RUN_1 : DINO_RUN_2);
    this.drawPixelMatrix(sprite, this.dino.x, this.groundY - this.dino.height + this.dino.y, dinoColor, this.pixelSize);

    // Game Over Overlay
    if (this.isGameOver) {
      this.ctx.fillStyle = this.isNight ? '#FFFFFF' : '#202124';
      this.ctx.font = '12px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('G A M E  O V E R', this.width / 2, this.height / 2 - 10);
      this.ctx.font = '8px "Press Start 2P", monospace';
      this.ctx.fillStyle = fgColor;
      this.ctx.fillText('TAP OR PRESS RESTART TO PLAY AGAIN', this.width / 2, this.height / 2 + 18);
    }
  }
}
