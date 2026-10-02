import React, { useEffect, useRef } from 'react';

// Exact Chrome T-Rex Matrix from User Uploaded Reference Image 1 (24x25 pixels)
const DINO_STEP_1 = [
  '.............XXXXXXXXXX.',
  '............XXXXXXXXXXXX',
  '............XXWWXXXXXXXX', // Crisp white square pixel eye
  '............XXXXXXXXXXXX',
  '............XXXXXXXXXXXX',
  '............XXXXXXXXXXXX',
  '............XXXXXX......', // Open jaw cutout
  '............XXXXXX......',
  '............XXXXXXXXXX..',
  'X..........XXXXXX.......', // Tail tip starts
  'X........XXXXXXXX.......',
  'XX.....XXXXXXXXXXXX.....',
  'XXX...XXXXXXXXXXX.X.....', // Front arms
  'XXX...XXXXXXXXXXX.......',
  'XXXXXXXXXXXXXXXXX.......',
  'XXXXXXXXXXXXXXXXX.......',
  '.XXXXXXXXXXXXXX.........',
  '...XXXXXXXXXXXX.........',
  '....XXXXXXXXXX..........',
  '.....XXXXXXXX...........',
  '......XXX..XX...........',
  '......XXX...X...........',
  '......XX................', // Left foot down
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
  '............X...........', // Right foot down
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
  '........................', // Both feet tucked up
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

const CACTUS_TRIPLE = [
  '...XX.....XX.....XX...',
  '...XX.....XX.....XX...',
  '.X.XX...X.XX...X.XX...',
  '.X.XX.X.X.XX.X.X.XX.X.',
  '.XXXXXX.XXXXXX.XXXXXX.',
  '...XX.....XX.....XX...',
  '...XX.....XX.....XX...',
  '...XX.....XX.....XX...',
  '...XX.....XX.....XX...'
];

// Big Whitish Pixel Clouds (W: White, S: Soft Underside Shade, X: Pixel Border)
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

// Pixel Android Bugdroid Alien Head
const PIXEL_ANDROID = [
  '..G......G..',
  '...G....G...',
  '..GGGGGGGG..',
  '.GGWGGGGWGG.',
  '.GGGGGGGGGG.',
  '.GGGGGGGGGG.',
  '............',
  '.GGGGGGGGGG.',
  '.GGGGGGGGGG.',
  '.GGGGGGGGGG.',
  '..GG....GG..'
];

// Exact Chrome Dino Pterodactyl Bird Matrices from Reference Image 2
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

// Exact Pixel Airplane Matrix from User's Uploaded Reference (38x19 pixels)
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
    let dinoScale = isMobile ? 3.8 : 6.5;
    let obstacleScale = isMobile ? 2.4 : 3.8;
    let speed = isMobile ? 3.2 : 4.5;

    let frame = 0;
    let dinoLeg = 0;
    let dinoY = 0;
    let dinoVy = 0;
    let isJumping = false;

    // Randomized Cacti obstacles
    let obstacles = [
      { x: width * 0.45, type: 'large' },
      { x: width * 0.85, type: 'double' }
    ];

    // 2-3 Big Whitish Clouds placed below the navbar with a good gap, drifting leftward as Dino runs
    const clouds = [
      { x: width * 0.12, y: isMobile ? 95 : 155, speed: 0.85, scale: isMobile ? 3.0 : 5.8 },
      { x: width * 0.55, y: isMobile ? 130 : 205, speed: 1.15, scale: isMobile ? 2.6 : 5.2 },
      { x: width * 0.88, y: isMobile ? 110 : 175, speed: 0.75, scale: isMobile ? 3.2 : 6.4 }
    ];

    // Animated Chrome Dino Pterodactyl birds flying below clouds (Reference Image 2)
    const birds = [
      { x: width * 1.15, y: isMobile ? 140 : 210, speed: isMobile ? 2.1 : 2.5, scale: isMobile ? 1.9 : 2.8 },
      { x: width * 1.65, y: isMobile ? 175 : 255, speed: isMobile ? 2.5 : 2.9, scale: isMobile ? 1.7 : 2.5 }
    ];

    // Playful Google 4-Color Pixel Sparkles in the Upper Mobile Sky
    const sparkles = [
      { x: width * 0.18, y: isMobile ? 70 : 90, color: '#4285F4', phase: 0 },
      { x: width * 0.38, y: isMobile ? 85 : 120, color: '#EA4335', phase: 1.5 },
      { x: width * 0.72, y: isMobile ? 65 : 100, color: '#FBBC05', phase: 3.0 },
      { x: width * 0.86, y: isMobile ? 80 : 130, color: '#34A853', phase: 4.5 }
    ];

    // Flying Pixel Airplane from Reference Image (Cruises smoothly left to right)
    let plane = {
      x: -160,
      y: isMobile ? 85 : 125,
      baseY: isMobile ? 85 : 125,
      speed: isMobile ? 1.35 : 1.85,
      scale: isMobile ? 1.75 : 2.65,
      contrailPuffs: []
    };

    const drawPixelMatrix = (matrix, startX, startY, defaultColor, scale = obstacleScale) => {
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          const char = matrix[r][c];
          if (char === 'X') {
            ctx.fillStyle = defaultColor;
            ctx.fillRect(Math.round(startX + c * scale), Math.round(startY + r * scale), Math.ceil(scale), Math.ceil(scale));
          } else if (char === 'W') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(Math.round(startX + c * scale), Math.round(startY + r * scale), Math.ceil(scale), Math.ceil(scale));
          } else if (char === 'S') {
            ctx.fillStyle = '#E8EEF5';
            ctx.fillRect(Math.round(startX + c * scale), Math.round(startY + r * scale), Math.ceil(scale), Math.ceil(scale));
          } else if (char === 'R') {
            ctx.fillStyle = '#EA4335';
            ctx.fillRect(Math.round(startX + c * scale), Math.round(startY + r * scale), Math.ceil(scale), Math.ceil(scale));
          } else if (char === 'Y') {
            ctx.fillStyle = '#FBBC05';
            ctx.fillRect(Math.round(startX + c * scale), Math.round(startY + r * scale), Math.ceil(scale), Math.ceil(scale));
          } else if (char === 'G') {
            ctx.fillStyle = '#34A853';
            ctx.fillRect(Math.round(startX + c * scale), Math.round(startY + r * scale), Math.ceil(scale), Math.ceil(scale));
          } else if (char === 'B') {
            ctx.fillStyle = '#4285F4';
            ctx.fillRect(Math.round(startX + c * scale), Math.round(startY + r * scale), Math.ceil(scale), Math.ceil(scale));
          }
        }
      }
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
      dinoScale = isMobile ? 3.8 : 6.5;
      obstacleScale = isMobile ? 2.4 : 3.8;
      speed = isMobile ? 3.2 : 4.5;
      plane.scale = isMobile ? 1.75 : 2.65;
      plane.baseY = isMobile ? 85 : 125;
      plane.speed = isMobile ? 1.35 : 1.85;
    };
    window.addEventListener('resize', handleResize);

    const loop = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // 1. Google 4-Color Twinkling Pixel Sparkles in upper sky
      sparkles.forEach((sp) => {
        const glow = Math.sin(frame * 0.06 + sp.phase);
        if (glow > 0.1) {
          ctx.fillStyle = sp.color;
          const sz = isMobile ? 3 : 4;
          const alpha = 0.35 + glow * 0.45;
          ctx.globalAlpha = alpha;
          ctx.fillRect(sp.x, sp.y, sz, sz);
          ctx.fillRect(sp.x - sz, sp.y, sz * 3, 1);
          ctx.fillRect(sp.x, sp.y - sz, 1, sz * 3);
          ctx.globalAlpha = 1.0;
        }
      });

      // 2. Draw 2-3 Big Whitish Clouds below navbar drifting leftward (leaving behind)
      clouds.forEach((cloud) => {
        cloud.x -= cloud.speed;
        if (cloud.x < -260) cloud.x = width + 100;
        drawPixelMatrix(BIG_WHITISH_CLOUD, cloud.x, cloud.y, '#CBD5E1', cloud.scale);
      });

      // 2.5 Draw Flying Pixel Airplane (User Reference: Cruises left-to-right with bobbing & vapor puffs)
      plane.x += plane.speed;
      plane.y = plane.baseY + Math.sin(frame * 0.035) * 5;

      // Spawn subtle contrail puffs behind airplane tail/engine
      if (frame % 7 === 0) {
        plane.contrailPuffs.push({
          x: plane.x + 3 * plane.scale,
          y: plane.y + 11 * plane.scale + (Math.random() - 0.5) * 2,
          size: plane.scale * (Math.random() > 0.5 ? 2.2 : 3.2),
          opacity: 0.7,
          life: 0
        });
      }

      // Draw and dissipate contrail puffs
      for (let i = plane.contrailPuffs.length - 1; i >= 0; i--) {
        const puff = plane.contrailPuffs[i];
        puff.life++;
        puff.x -= 0.5;
        puff.opacity -= 0.016;
        if (puff.opacity <= 0 || puff.life > 45) {
          plane.contrailPuffs.splice(i, 1);
        } else {
          ctx.fillStyle = `rgba(225, 235, 245, ${Math.max(puff.opacity, 0)})`;
          ctx.fillRect(Math.round(puff.x), Math.round(puff.y), Math.ceil(puff.size), Math.ceil(puff.size));
        }
      }

      // Draw pixel airplane sprite
      drawPixelMatrix(PIXEL_AIRPLANE, plane.x, plane.y, '#202124', plane.scale);

      // Loop airplane back to left with varied cruise altitude
      const planeWidth = 38 * plane.scale;
      if (plane.x > width + 80) {
        plane.x = -planeWidth - 60;
        plane.baseY = (isMobile ? 70 : 105) + Math.random() * (isMobile ? 55 : 85);
      }

      // 3. Draw Flying Chrome Dino Pterodactyl Birds below clouds (Flapping Wings UP / Wings DOWN)
      const birdFrame = Math.floor(frame / 14) % 2 === 0 ? BIRD_WING_UP : BIRD_WING_DOWN;
      birds.forEach((bird) => {
        bird.x -= bird.speed;
        const floatY = bird.y + Math.sin(frame * 0.05 + bird.x * 0.01) * 3.5;
        if (bird.x < -140) {
          bird.x = width + Math.random() * 200 + 60;
          bird.y = (isMobile ? 130 : 205) + Math.random() * (isMobile ? 40 : 65);
        }
        drawPixelMatrix(birdFrame, bird.x, floatY, '#5F6368', bird.scale);
      });

      // 4. Ground line & realistic pixel ground bumps/pebbles
      ctx.strokeStyle = 'rgba(100, 115, 130, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // Ground bumps/pebbles
      ctx.fillStyle = 'rgba(120, 130, 145, 0.35)';
      for (let i = 0; i < width; i += 40) {
        const offX = (i - (frame * speed * 0.8) % 40);
        ctx.fillRect(offX, groundY + 4, 5, 2);
        ctx.fillRect(offX + 18, groundY + 10, 5, 2);
        ctx.fillRect(offX + 30, groundY + 6, 3, 2);
      }

      // 5. Update & Draw Randomized Cacti
      obstacles.forEach((obs) => {
        obs.x -= speed;
        let matrix = CACTUS_LARGE;
        if (obs.type === 'small') matrix = CACTUS_SMALL;
        if (obs.type === 'double') matrix = CACTUS_DOUBLE;
        if (obs.type === 'triple') matrix = CACTUS_TRIPLE;

        const obsH = matrix.length * obstacleScale;
        drawPixelMatrix(matrix, obs.x, groundY - obsH, '#535353', obstacleScale);
      });

      // Respawn obstacles randomly with variable distances
      if (obstacles.length > 0 && obstacles[0].x < -120) {
        obstacles.shift();
      }
      const lastObs = obstacles[obstacles.length - 1];
      if (!lastObs || lastObs.x < width - (260 + Math.random() * 320)) {
        const types = ['small', 'large', 'double', 'triple'];
        const chosenType = types[Math.floor(Math.random() * types.length)];
        obstacles.push({
          x: width + 60,
          type: chosenType
        });
      }

      // 6. Authentic Chrome Dino Runner
      const dinoX = isMobile ? 24 : 95;
      const dinoH = 25 * dinoScale;

      // Auto-detect approaching cactus to jump smoothly
      const closeObs = obstacles.find((o) => o.x > dinoX && o.x < dinoX + (isMobile ? 120 : 160));
      if (closeObs && !isJumping) {
        isJumping = true;
        dinoVy = isMobile ? -13.0 : -17.0;
      }

      if (isJumping) {
        dinoY += dinoVy;
        dinoVy += 0.8; // Gravity
        if (dinoY >= 0) {
          dinoY = 0;
          dinoVy = 0;
          isJumping = false;
        }
      }

      if (frame % 6 === 0) {
        dinoLeg = 1 - dinoLeg;
      }

      const dinoMatrix = isJumping ? DINO_JUMP : (dinoLeg === 0 ? DINO_STEP_1 : DINO_STEP_2);
      drawPixelMatrix(dinoMatrix, dinoX, groundY - dinoH + dinoY, '#222222', dinoScale);

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
