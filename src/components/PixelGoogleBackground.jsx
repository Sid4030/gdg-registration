import React, { useEffect, useRef } from 'react';

// Exact Chrome T-Rex Matrices (24x25 pixels)
const DINO_STEP_1 = [
  '.............XXXXXXXXXX.',
  '............XXXXXXXXXXXX',
  '............XXWWXXXXXXXX',
  '............XXXXXXXXXXXX',
  '............XXXXXXXXXXXX',
  '............XXXXXXXXXXXX',
  '............XXXXXX......',
  '............XXXXXX......',
  '............XXXXXXXXXX..',
  'X..........XXXXXX.......',
  'X........XXXXXXXX.......',
  'XX.....XXXXXXXXXXXX.....',
  'XXX...XXXXXXXXXXX.X.....',
  'XXX...XXXXXXXXXXX.......',
  'XXXXXXXXXXXXXXXXX.......',
  'XXXXXXXXXXXXXXXXX.......',
  '.XXXXXXXXXXXXXX.........',
  '...XXXXXXXXXXXX.........',
  '....XXXXXXXXXX..........',
  '.....XXXXXXXX...........',
  '......XXX..XX...........',
  '......XXX...X...........',
  '......XX................',
  '......X.................',
  '......XX................'
];

const DINO_STEP_2 = [
  '.............XXXXXXXXXX.',
  '............XXXXXXXXXXXX',
  '............XXWWXXXXXXXX',
  '............XXXXXXXXXXXX',
  '............XXXXXXXXXXXX',
  '............XXXXXXXXXXXX',
  '............XXXXXX......',
  '............XXXXXX......',
  '............XXXXXXXXXX..',
  'X..........XXXXXX.......',
  'X........XXXXXXXX.......',
  'XX.....XXXXXXXXXXXX.....',
  'XXX...XXXXXXXXXXX.X.....',
  'XXX...XXXXXXXXXXX.......',
  'XXXXXXXXXXXXXXXXX.......',
  'XXXXXXXXXXXXXXXXX.......',
  '.XXXXXXXXXXXXXX.........',
  '...XXXXXXXXXXXX.........',
  '....XXXXXXXXXX..........',
  '.....XXXXXXXX...........',
  '......XXX..XX...........',
  '......XXX...X...........',
  '............X...........',
  '............X...........',
  '............XX..........'
];

const DINO_JUMP = [
  '.............XXXXXXXXXX.',
  '............XXXXXXXXXXXX',
  '............XXWWXXXXXXXX',
  '............XXXXXXXXXXXX',
  '............XXXXXXXXXXXX',
  '............XXXXXXXXXXXX',
  '............XXXXXX......',
  '............XXXXXX......',
  '............XXXXXXXXXX..',
  'X..........XXXXXX.......',
  'X........XXXXXXXX.......',
  'XX.....XXXXXXXXXXXX.....',
  'XXX...XXXXXXXXXXX.X.....',
  'XXX...XXXXXXXXXXX.......',
  'XXXXXXXXXXXXXXXXX.......',
  'XXXXXXXXXXXXXXXXX.......',
  '.XXXXXXXXXXXXXX.........',
  '...XXXXXXXXXXXX.........',
  '....XXXXXXXXXX..........',
  '.....XXXXXXXX...........',
  '......XXX..XX...........',
  '......XXX...X...........',
  '........................',
  '........................',
  '........................'
];

// Randomized Cacti Sprites
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
  '....XX....'
];

const CACTUS_DOUBLE = [
  '...XX.....XX...',
  '...XX.....XX...',
  '.X.XX...X.XX...',
  '.X.XX.X.X.XX.X.',
  '.XXXXXX.XXXXXX.',
  '...XX.....XX...',
  '...XX.....XX...',
  '...XX.....XX...',
  '...XX.....XX...'
];

// Soft Aesthetic Whitish Clouds (Translucent white body, soft shaded bottom)
const BIG_WHITISH_CLOUD = [
  '.........XXXXXXXXXX.........',
  '......XXXWWWWWWWWWWXXX......',
  '....XXWWWWWWWWWWWWWWWWXX....',
  '..XXWWWWWWWWWWWWWWWWWWWWXX..',
  '..XWWWWWWWWWWWWWWWWWWWWWWX..',
  'XXWWWWWWWWWWWWWWWWWWWWWWWWXX',
  'XWWWWWWWWWWWWWWWWWWWWWWWWWWX',
  'XSSSSSSSSSSSSSSSSSSSSSSSSSSX',
  '.XXSSSSSSSSSSSSSSSSSSSSSSXX.',
  '...XXXXXXXXXXXXXXXXXXXXXX...'
];

// Pterodactyl Bird Matrices
const BIRD_WING_UP = [
  '.......X............',
  '.......XX...........',
  '.......XXX..........',
  '.......XXXX.........',
  '...XX..XXXXX........',
  '..XXXX.XXXXXX.......',
  '.XXXXX.XXXXXXX......',
  'XXXXXXXXXXXXXXX.XX..',
  '..XXXXXXXXXXXXXX....',
  '...XXXXXXXXXXXX.....',
  '...XXXXXXXX.........',
  '...XXXXX............',
  '....XX..............'
];

const BIRD_WING_DOWN = [
  '....................',
  '....................',
  '...XX...............',
  '..XXXX..............',
  '.XXXXX..............',
  'XXXXXXXXXXXXXXX.XX..',
  '..XXXXXXXXXXXXXX....',
  '...XXXXXXXXXXXX.....',
  '...XXXXXXXX.........',
  '...XXXXXXXXX........',
  '...XXXXXXXXXX.......',
  '...XXXX.XXXXXX......',
  '...XX...XXXXX.......',
  '........XXXX........',
  '.........XX.........'
];

// Exact Pixel Airplane Matrix (38x19 pixels)
const PIXEL_AIRPLANE = [
  '......XXX.............................',
  '......XWWX............................',
  '......XWWWX...........................',
  '......XWWWX...........................',
  '......XWWWX...........................',
  '......XWWWX...........................',
  '......XWWWX...........................',
  '......XWWWWX..........................',
  '......XWWWWWX.........................',
  '......XWWWWWWXXXXXXXXXXXXXXXXXXXXXX...',
  'XXXXXXXWWWWWWWWWWWWWWWWWWWWWWWWWWWWX..',
  '.XWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWXXX.',
  '..XXXXXWWWWWXXWWXXWWXXWWXXWWXXWWWWXXXX',
  '......XWWWWWXXWWXXWWXXWWXXWWXXWWWWXXXX',
  '.......XWWWWWWWWWWWWWWWWWWWWWWWWWWWWWX',
  '........XWWWWWWWWWWWWWXXXXWWWWWWWWWWX.',
  '.........XXXXXXXXXXXXXXWWWXXXXXXXXXX..',
  '......................XWWWX...........',
  '......................XXXX............'
];

/**
 * Pre-renders a pixel matrix into a dedicated offscreen canvas.
 * This replaces thousands of fillRect calls per frame with 1 single drawImage call!
 */
function renderSpriteToCanvas(matrix, colorMap, scale = 1) {
  const h = matrix.length;
  const w = matrix[0].length;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(w * scale);
  canvas.height = Math.ceil(h * scale);
  const sCtx = canvas.getContext('2d');

  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const char = matrix[r][c];
      const color = colorMap[char];
      if (color) {
        sCtx.fillStyle = color;
        sCtx.fillRect(
          Math.round(c * scale),
          Math.round(r * scale),
          Math.ceil(scale),
          Math.ceil(scale)
        );
      }
    }
  }
  return canvas;
}

export default function PixelGoogleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let isMobile = width < 768;
    let groundY = height - (isMobile ? 28 : 42);
    let dinoScale = isMobile ? 3.6 : 6.0;
    let obstacleScale = isMobile ? 2.2 : 3.6;
    let speed = isMobile ? 2.8 : 4.0;

    // Sprite Caches (Generated once per scale change)
    let spriteCache = {};

    const buildSprites = () => {
      // 1. Airplane
      const planeScale = isMobile ? 1.6 : 2.5;
      spriteCache.plane = renderSpriteToCanvas(
        PIXEL_AIRPLANE,
        { 'X': '#202124', 'W': '#FFFFFF' },
        planeScale
      );

      // 2. Soft Aesthetic Clouds
      const cloudScale = isMobile ? 2.4 : 4.6;
      spriteCache.cloud = renderSpriteToCanvas(
        BIG_WHITISH_CLOUD,
        {
          'X': 'rgba(190, 205, 222, 0.75)',
          'W': 'rgba(255, 255, 255, 0.88)',
          'S': 'rgba(235, 242, 250, 0.85)'
        },
        cloudScale
      );

      // 3. Pterodactyl Birds
      const birdScale = isMobile ? 1.6 : 2.4;
      spriteCache.birdUp = renderSpriteToCanvas(BIRD_WING_UP, { 'X': '#5F6368' }, birdScale);
      spriteCache.birdDown = renderSpriteToCanvas(BIRD_WING_DOWN, { 'X': '#5F6368' }, birdScale);

      // 4. Dino Runners
      spriteCache.dino1 = renderSpriteToCanvas(DINO_STEP_1, { 'X': '#202124', 'W': '#FFFFFF' }, dinoScale);
      spriteCache.dino2 = renderSpriteToCanvas(DINO_STEP_2, { 'X': '#202124', 'W': '#FFFFFF' }, dinoScale);
      spriteCache.dinoJump = renderSpriteToCanvas(DINO_JUMP, { 'X': '#202124', 'W': '#FFFFFF' }, dinoScale);

      // 5. Cacti
      spriteCache.cactusSmall = renderSpriteToCanvas(CACTUS_SMALL, { 'X': '#535353' }, obstacleScale);
      spriteCache.cactusLarge = renderSpriteToCanvas(CACTUS_LARGE, { 'X': '#535353' }, obstacleScale);
      spriteCache.cactusDouble = renderSpriteToCanvas(CACTUS_DOUBLE, { 'X': '#535353' }, obstacleScale);
    };

    buildSprites();

    let frame = 0;
    let dinoLeg = 0;
    let dinoY = 0;
    let dinoVy = 0;
    let isJumping = false;

    // Obstacles
    let obstacles = [
      { x: width * 0.45, type: 'large' },
      { x: width * 0.85, type: 'double' }
    ];

    // Flying Clouds: Overlapping directly across "Build the Future with GDG Amity"
    // Altitudes chosen to float gracefully right over the hero text band
    const clouds = [
      { x: width * 0.15, y: isMobile ? 85 : 125, speed: 0.65 },
      { x: width * 0.68, y: isMobile ? 115 : 165, speed: 0.85 }
    ];

    // Flying Pixel Airplane: Cruises left-to-right right across the hero title
    let plane = {
      x: -140,
      y: isMobile ? 95 : 140,
      baseY: isMobile ? 95 : 140,
      speed: isMobile ? 1.3 : 1.75,
      contrailPuffs: []
    };

    // Flying Pterodactyl Bird: Passes across the sky at relaxed intervals
    let bird = {
      x: width * 1.2,
      y: isMobile ? 135 : 185,
      speed: isMobile ? 1.8 : 2.2
    };

    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      isMobile = width < 768;
      groundY = height - (isMobile ? 28 : 42);
      dinoScale = isMobile ? 3.6 : 6.0;
      obstacleScale = isMobile ? 2.2 : 3.6;
      speed = isMobile ? 2.8 : 4.0;

      plane.baseY = isMobile ? 95 : 140;
      plane.speed = isMobile ? 1.3 : 1.75;

      buildSprites();
    };

    window.addEventListener('resize', handleResize);

    const loop = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // -----------------------------------------------------------
      // 1. CLOUDS (OVERLAPPING ACROSS "Build the Future with GDG Amity")
      // -----------------------------------------------------------
      if (spriteCache.cloud) {
        clouds.forEach((c) => {
          c.x -= c.speed;
          if (c.x < -280) c.x = width + 80;
          ctx.drawImage(spriteCache.cloud, Math.round(c.x), Math.round(c.y));
        });
      }

      // -----------------------------------------------------------
      // 2. FLYING PIXEL AIRPLANE (Cruises across the hero text)
      // -----------------------------------------------------------
      if (spriteCache.plane) {
        plane.x += plane.speed;
        plane.y = plane.baseY + Math.sin(frame * 0.035) * 4;

        // Subtle contrail puffs (emitted behind tail)
        if (frame % 8 === 0) {
          plane.contrailPuffs.push({
            x: plane.x + 8,
            y: plane.y + (isMobile ? 18 : 28) + (Math.random() - 0.5) * 3,
            size: isMobile ? 4 : 6,
            opacity: 0.65,
            life: 0
          });
        }

        // Draw contrail puffs
        for (let i = plane.contrailPuffs.length - 1; i >= 0; i--) {
          const puff = plane.contrailPuffs[i];
          puff.life++;
          puff.x -= 0.5;
          puff.opacity -= 0.015;
          if (puff.opacity <= 0 || puff.life > 45) {
            plane.contrailPuffs.splice(i, 1);
          } else {
            ctx.fillStyle = `rgba(225, 235, 248, ${Math.max(puff.opacity, 0)})`;
            ctx.fillRect(Math.round(puff.x), Math.round(puff.y), Math.ceil(puff.size), Math.ceil(puff.size));
          }
        }

        ctx.drawImage(spriteCache.plane, Math.round(plane.x), Math.round(plane.y));

        // Re-enter from left when offscreen right
        if (plane.x > width + 60) {
          plane.x = -200;
          plane.baseY = (isMobile ? 80 : 120) + Math.random() * (isMobile ? 40 : 60);
        }
      }

      // -----------------------------------------------------------
      // 3. FLYING PTERODACTYL BIRD (Wings flap every 14 frames)
      // -----------------------------------------------------------
      const birdSprite = Math.floor(frame / 14) % 2 === 0 ? spriteCache.birdUp : spriteCache.birdDown;
      if (birdSprite) {
        bird.x -= bird.speed;
        const birdY = bird.y + Math.sin(frame * 0.05) * 3;
        if (bird.x < -100) {
          bird.x = width + Math.random() * 250 + 100;
          bird.y = (isMobile ? 120 : 170) + Math.random() * (isMobile ? 35 : 50);
        }
        ctx.drawImage(birdSprite, Math.round(bird.x), Math.round(birdY));
      }

      // -----------------------------------------------------------
      // 4. CHROME DINO GROUND LINE & TERRAIN PEBBLES
      // -----------------------------------------------------------
      ctx.strokeStyle = 'rgba(100, 115, 130, 0.4)';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(120, 130, 145, 0.3)';
      for (let i = 0; i < width; i += 45) {
        const offX = (i - (frame * speed * 0.7) % 45);
        ctx.fillRect(offX, groundY + 4, 4, 2);
        ctx.fillRect(offX + 16, groundY + 9, 4, 2);
      }

      // -----------------------------------------------------------
      // 5. CACTI OBSTACLES (Ultra fast cached drawImage)
      // -----------------------------------------------------------
      obstacles.forEach((obs) => {
        obs.x -= speed;
        let cSprite = spriteCache.cactusLarge;
        if (obs.type === 'small') cSprite = spriteCache.cactusSmall;
        if (obs.type === 'double') cSprite = spriteCache.cactusDouble;

        if (cSprite) {
          ctx.drawImage(cSprite, Math.round(obs.x), groundY - cSprite.height);
        }
      });

      if (obstacles.length > 0 && obstacles[0].x < -100) {
        obstacles.shift();
      }
      const lastObs = obstacles[obstacles.length - 1];
      if (!lastObs || lastObs.x < width - (260 + Math.random() * 300)) {
        const types = ['small', 'large', 'double'];
        const chosenType = types[Math.floor(Math.random() * types.length)];
        obstacles.push({
          x: width + 50,
          type: chosenType
        });
      }

      // -----------------------------------------------------------
      // 6. CHROME DINO RUNNER
      // -----------------------------------------------------------
      const dinoX = isMobile ? 22 : 90;
      const dinoH = 25 * dinoScale;

      const closeObs = obstacles.find((o) => o.x > dinoX && o.x < dinoX + (isMobile ? 110 : 150));
      if (closeObs && !isJumping) {
        isJumping = true;
        dinoVy = isMobile ? -12.5 : -16.5;
      }

      if (isJumping) {
        dinoY += dinoVy;
        dinoVy += 0.8;
        if (dinoY >= 0) {
          dinoY = 0;
          dinoVy = 0;
          isJumping = false;
        }
      }

      if (frame % 6 === 0) {
        dinoLeg = 1 - dinoLeg;
      }

      const dinoSprite = isJumping
        ? spriteCache.dinoJump
        : (dinoLeg === 0 ? spriteCache.dino1 : spriteCache.dino2);

      if (dinoSprite) {
        ctx.drawImage(dinoSprite, dinoX, Math.round(groundY - dinoH + dinoY));
      }

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pixel-google-bg-canvas" aria-hidden="true" />;
}
