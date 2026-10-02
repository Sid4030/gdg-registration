import { sound } from './scripts/sound.js';
import { AmbientDinoBackground, PlayableDinoGame } from './scripts/dino-engine.js';
import { animations } from './scripts/animations.js';
import { FormController } from './scripts/form.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Sound Toggle
  const soundBtn = document.getElementById('btn-toggle-sound');
  const soundIcon = document.getElementById('sound-icon');

  const updateSoundUI = () => {
    if (soundIcon) {
      soundIcon.textContent = sound.isMuted ? '🔇' : '🔊';
    }
    if (soundBtn) {
      soundBtn.title = sound.isMuted ? 'Sound is Muted (Click to Unmute)' : 'Sound is Active (Click to Mute)';
    }
  };
  updateSoundUI();

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      updateSoundUI();
      if (!isMuted) {
        sound.playClick();
      }
    });
  }

  // 2. Initialize Ambient Dino Background Runner
  const ambientDino = new AmbientDinoBackground('dino-bg-canvas');

  // 3. Initialize Playable Dino Easter Egg Modal
  const dinoModal = document.getElementById('dino-game-modal');
  const triggerDinoBtn = document.getElementById('btn-trigger-dino');
  const closeDinoBtn = document.getElementById('btn-close-dino-modal');

  let playableDino = null;

  const openDinoModal = () => {
    sound.playClick();
    if (dinoModal) {
      dinoModal.style.display = 'flex';
      dinoModal.setAttribute('aria-hidden', 'false');
    }
    if (!playableDino) {
      playableDino = new PlayableDinoGame(
        'dino-modal-canvas',
        'dino-modal-score',
        'dino-modal-hi',
        'btn-dino-restart'
      );
    }
    playableDino.start();
  };

  const closeDinoModal = () => {
    sound.playClick();
    if (dinoModal) {
      dinoModal.style.display = 'none';
      dinoModal.setAttribute('aria-hidden', 'true');
    }
    if (playableDino) {
      playableDino.stop();
    }
  };

  if (triggerDinoBtn) {
    triggerDinoBtn.addEventListener('click', openDinoModal);
  }

  if (closeDinoBtn) {
    closeDinoBtn.addEventListener('click', closeDinoModal);
  }

  const modalBackdrop = document.querySelector('.dino-modal-backdrop');
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeDinoModal);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dinoModal && dinoModal.style.display === 'flex') {
      closeDinoModal();
    }
  });

  // 4. Initialize Multi-Step Form Controller
  const formController = new FormController();

  // 5. Initialize GSAP Intro Timeline & Skip
  const skipIntroBtn = document.getElementById('btn-skip-intro');
  if (skipIntroBtn) {
    skipIntroBtn.addEventListener('click', () => {
      sound.playClick();
      animations.skipIntro();
    });
  }

  // Trigger cinematic GSAP Intro
  animations.playIntro();

  // Global user interaction listener to allow Web Audio API context unlock
  const unlockAudio = () => {
    sound.init();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
});
