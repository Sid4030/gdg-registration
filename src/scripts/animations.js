import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { sound } from './sound.js';

export class AnimationController {
  constructor() {
    this.introTimeline = null;
    this.isIntroSkipped = false;
  }

  playIntro(onComplete) {
    const introOverlay = document.getElementById('intro-overlay');
    if (!introOverlay) {
      if (onComplete) onComplete();
      return;
    }

    // Check if user already saw intro in this session
    const seenIntro = sessionStorage.getItem('gdg_amity_seen_intro');
    if (seenIntro === 'true') {
      introOverlay.style.display = 'none';
      this.animateMainEntrance();
      if (onComplete) onComplete();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('gdg_amity_seen_intro', 'true');
        introOverlay.style.display = 'none';
        this.animateMainEntrance();
        if (onComplete) onComplete();
      }
    });

    this.introTimeline = tl;

    // Initial states
    gsap.set('#intro-overlay', { opacity: 1, visibility: 'visible' });
    gsap.set('.intro-capsule', { scale: 0, opacity: 0 });
    gsap.set('.intro-text-item', { y: 24, opacity: 0 });
    gsap.set('#intro-dino-runner', { x: -60, opacity: 0 });
    gsap.set('.intro-progress-bar-fill', { width: '0%' });

    // Timeline execution
    tl
      // 1. Google GDG bracket capsules snap in with elastic bounce
      .to('#capsule-red', { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }, 0.2)
      .to('#capsule-blue', { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }, 0.35)
      .to('#capsule-green', { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }, 0.5)
      .to('#capsule-yellow', { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }, 0.65)
      
      // 2. Bracket glow pulse
      .to('.intro-bracket-box', {
        scale: 1.08,
        filter: 'drop-shadow(0 0 20px rgba(66, 133, 244, 0.4))',
        duration: 0.35,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      }, 0.85)

      // 3. Staggered text reveals
      .to('.intro-title', { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 1.1)
      .to('.intro-subtitle', { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 1.25)
      .to('.intro-chapter', { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 1.4)

      // 4. Dino sprints across the intro progress line!
      .to('#intro-dino-runner', { opacity: 1, duration: 0.2 }, 1.5)
      .to('#intro-dino-runner', { x: 260, duration: 1.2, ease: 'power1.inOut' }, 1.5)
      .to('.intro-progress-bar-fill', { width: '100%', duration: 1.2, ease: 'power1.inOut' }, 1.5)

      // 5. Final exit transition: smooth zoom & fade
      .to('#intro-overlay', {
        opacity: 0,
        scale: 1.03,
        duration: 0.6,
        ease: 'power2.inOut',
        pointerEvents: 'none'
      }, 2.8);
  }

  skipIntro(onComplete) {
    if (this.introTimeline) {
      this.introTimeline.progress(1);
    }
    const introOverlay = document.getElementById('intro-overlay');
    if (introOverlay) {
      gsap.to(introOverlay, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          introOverlay.style.display = 'none';
          sessionStorage.setItem('gdg_amity_seen_intro', 'true');
          this.animateMainEntrance();
          if (onComplete) onComplete();
        }
      });
    }
  }

  animateMainEntrance() {
    gsap.fromTo(
      '#main-nav',
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    );

    gsap.fromTo(
      '#hero-section',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, delay: 0.1, ease: 'power3.out' }
    );

    gsap.fromTo(
      '#stepper-container',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'power3.out' }
    );

    gsap.fromTo(
      '#form-card-container',
      { y: 40, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 0.7, delay: 0.25, ease: 'power3.out' }
    );
  }

  animateStepTransition(fromEl, toEl, direction = 1, onComplete) {
    const xDist = direction > 0 ? 35 : -35;

    // Out animation
    gsap.to(fromEl, {
      x: -xDist,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        fromEl.classList.remove('active');
        fromEl.style.display = 'none';

        // Prepare new element
        toEl.style.display = 'block';
        toEl.classList.add('active');

        // Scroll smoothly to top of card on mobile & desktop
        const portalCard = document.getElementById('form-card-container');
        if (portalCard) {
          const y = portalCard.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        }

        // In animation
        gsap.fromTo(
          toEl,
          { x: xDist, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.38,
            ease: 'power2.out',
            onComplete: () => {
              // Stagger animate inside fields
              const inputs = toEl.querySelectorAll('.form-group, .choice-card, .rating-card');
              if (inputs.length > 0) {
                gsap.fromTo(
                  inputs,
                  { y: 12, opacity: 0 },
                  { y: 0, opacity: 1, duration: 0.35, stagger: 0.04, ease: 'power1.out' }
                );
              }
              if (onComplete) onComplete();
            }
          }
        );
      }
    });
  }

  shakeField(fieldEl) {
    sound.playTone(280, 'sawtooth', 0.15, 0.08);
    gsap.timeline()
      .to(fieldEl, { x: -8, duration: 0.06 })
      .to(fieldEl, { x: 8, duration: 0.06 })
      .to(fieldEl, { x: -6, duration: 0.06 })
      .to(fieldEl, { x: 6, duration: 0.06 })
      .to(fieldEl, { x: -3, duration: 0.05 })
      .to(fieldEl, { x: 0, duration: 0.05 });
  }

  animateAccordion(element, isOpen) {
    if (isOpen) {
      element.style.display = 'block';
      element.style.height = '0px';
      element.style.opacity = '0';
      const fullHeight = element.scrollHeight;

      gsap.to(element, {
        height: fullHeight,
        opacity: 1,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => {
          element.style.height = 'auto';
        }
      });
    } else {
      gsap.to(element, {
        height: 0,
        opacity: 0,
        duration: 0.28,
        ease: 'power2.in',
        onComplete: () => {
          element.style.display = 'none';
        }
      });
    }
  }

  fireConfetti() {
    sound.playSuccess();

    // 1. Center cannon
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#FFFFFF']
    });

    // 2. Left side stream
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853']
      });
    }, 200);

    // 3. Right side stream
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853']
      });
    }, 350);
  }

  animateSubmissionSuccess(onComplete) {
    this.fireConfetti();

    const formCard = document.getElementById('form-card-container');
    const successCard = document.getElementById('success-pass-container');

    gsap.to(formCard, {
      scale: 0.95,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        formCard.style.display = 'none';
        successCard.style.display = 'block';

        gsap.fromTo(
          successCard,
          { scale: 0.9, opacity: 0, y: 30 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: 'back.out(1.4)',
            onComplete: () => {
              if (onComplete) onComplete();
            }
          }
        );

        // Animate digital pass badge shine
        gsap.fromTo(
          '.pass-hologram-overlay',
          { x: '-100%', opacity: 0 },
          { x: '200%', opacity: 0.8, duration: 1.5, delay: 0.4, ease: 'power2.inOut' }
        );
      }
    });
  }
}

export const animations = new AnimationController();
