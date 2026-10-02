import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { sound } from '../utils/sound';

export default function IntroAssembly({ onComplete }) {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Strictly execute only once per mount
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    if (sessionStorage.getItem('gdg_amity_seen_intro_v12') === 'true') {
      onCompleteRef.current?.();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem('gdg_amity_seen_intro_v12', 'true');
          onCompleteRef.current?.();
        }
      });
      timelineRef.current = tl;

      // Viewport dynamic corner vectors
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

      const cornerX = Math.max(vw * 0.85, 700);
      const cornerY = Math.max(vh * 0.85, 500);

      // 1. Initial positions: Sticks start outside the entire screen at the 4 corners
      gsap.set(['#fly-border-1', '#fly-fill-1-red'], { x: -cornerX, y: -cornerY, rotation: -135, opacity: 0 });
      gsap.set(['#fly-border-2', '#fly-fill-2-blue'], { x: -cornerX, y: cornerY, rotation: 135, opacity: 0 });
      gsap.set(['#fly-border-3', '#fly-fill-3-green'], { x: cornerX, y: -cornerY, rotation: 135, opacity: 0 });
      gsap.set(['#fly-border-4', '#fly-fill-4-yellow'], { x: cornerX, y: cornerY, rotation: -135, opacity: 0 });

      // Initially, brackets assemble nearly touching (x=46 and x=-46, gap ~36px)
      gsap.set('#bracket-left-half', { x: 46 });
      gsap.set('#bracket-right-half', { x: -46 });

      gsap.set('.kinetic-word', { y: 35, opacity: 0, rotationX: -60 });
      gsap.set('.intro-sub-text', { opacity: 0, y: 15 });

      // -------------------------------------------------------------
      // 1. Stick 1: Red flies in from Top-Left corner (0.15s)
      // -------------------------------------------------------------
      tl.to(['#fly-border-1', '#fly-fill-1-red'], {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        duration: 0.48,
        ease: 'power3.out',
        onStart: () => sound.playTone(420, 'triangle', 0.1, 0.06)
      }, 0.15);

      // -------------------------------------------------------------
      // 2. Stick 2: Blue flies in from Bottom-Left corner (0.45s) -> Overlaps Red
      // -------------------------------------------------------------
      tl.to(['#fly-border-2', '#fly-fill-2-blue'], {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        duration: 0.48,
        ease: 'power3.out',
        onStart: () => sound.playSnap()
      }, 0.45);

      // -------------------------------------------------------------
      // 3. Stick 3: Green flies in from Top-Right corner (0.75s)
      // -------------------------------------------------------------
      tl.to(['#fly-border-3', '#fly-fill-3-green'], {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        duration: 0.48,
        ease: 'power3.out',
        onStart: () => sound.playTone(540, 'triangle', 0.1, 0.06)
      }, 0.75);

      // -------------------------------------------------------------
      // 4. Stick 4: Yellow flies in from Bottom-Right corner (1.05s)
      // -------------------------------------------------------------
      tl.to(['#fly-border-4', '#fly-fill-4-yellow'], {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        duration: 0.48,
        ease: 'power3.out',
        onStart: () => sound.playSnap()
      }, 1.05);

      // -------------------------------------------------------------
      // 5. AUTOMATIC GAP EXPANSION:
      // Brackets automatically glide outward to the authentic pinch gap (x: 16 and x: -16)
      // -------------------------------------------------------------
      tl.to('#bracket-left-half', {
        x: 16,
        duration: 0.42,
        ease: 'back.out(2.2)',
        onStart: () => sound.playSnap()
      }, 1.40)
      .to('#bracket-right-half', {
        x: -16,
        duration: 0.42,
        ease: 'back.out(2.2)'
      }, 1.40)
      // Logo shockwave bounce on auto-gap snap
      .to('#full-gdg-flying-logo', {
        scale: 1.05,
        duration: 0.08,
        yoyo: true,
        repeat: 1
      }, 1.45);

      // -------------------------------------------------------------
      // 6. EXPANDS THEMSELVES IN ORDER: 1, 2, 3, 4 (1.78s)
      // -------------------------------------------------------------
      // 1. Red stick expands
      tl.to(['#fly-border-1', '#fly-fill-1-red'], {
        scale: 1.15,
        duration: 0.11,
        yoyo: true,
        repeat: 1,
        transformOrigin: '130px 94px',
        ease: 'power2.out',
        onStart: () => sound.playTone(400, 'sine', 0.08, 0.05)
      }, 1.78)
      // 2. Blue stick expands
      .to(['#fly-border-2', '#fly-fill-2-blue'], {
        scale: 1.15,
        duration: 0.11,
        yoyo: true,
        repeat: 1,
        transformOrigin: '130px 166px',
        ease: 'power2.out',
        onStart: () => sound.playTone(480, 'sine', 0.08, 0.05)
      }, 1.90)
      // 3. Green stick expands
      .to(['#fly-border-3', '#fly-fill-3-green'], {
        scale: 1.15,
        duration: 0.11,
        yoyo: true,
        repeat: 1,
        transformOrigin: '330px 94px',
        ease: 'power2.out',
        onStart: () => sound.playTone(560, 'sine', 0.08, 0.05)
      }, 2.02)
      // 4. Yellow stick expands
      .to(['#fly-border-4', '#fly-fill-4-yellow'], {
        scale: 1.15,
        duration: 0.11,
        yoyo: true,
        repeat: 1,
        transformOrigin: '330px 166px',
        ease: 'power2.out',
        onStart: () => sound.playTone(640, 'sine', 0.08, 0.05)
      }, 2.14)

      // Entire Assembled Logo punches together (2.30s)
      .to('#full-gdg-flying-logo', {
        scale: 1.08,
        duration: 0.14,
        ease: 'power2.out'
      }, 2.30)
      .to('#full-gdg-flying-logo', {
        scale: 1,
        duration: 0.2,
        ease: 'back.out(2)'
      }, 2.44);

      // -------------------------------------------------------------
      // 7. Kinetic Typography Reveal (2.54s) - NO COLORFUL LINE!
      // -------------------------------------------------------------
      tl.to('.kinetic-word', {
        y: 0,
        opacity: 1,
        rotationX: 0,
        stagger: 0.07,
        duration: 0.35,
        ease: 'back.out(1.6)'
      }, 2.54)
      .to('.intro-sub-text', {
        opacity: 1,
        y: 0,
        duration: 0.28,
        ease: 'power2.out'
      }, 2.80);

      // -------------------------------------------------------------
      // 8. Smooth Transition to Portal (3.22s)
      // -------------------------------------------------------------
      tl.to(containerRef.current, {
        opacity: 0,
        scale: 1.02,
        duration: 0.42,
        ease: 'power2.inOut',
        delay: 0.35
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const handleSkip = () => {
    sound.playClick();
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        sessionStorage.setItem('gdg_amity_seen_intro_v12', 'true');
        onCompleteRef.current?.();
      }
    });
  };

  return (
    <div ref={containerRef} className="intro-assembly-overlay" role="dialog" aria-modal="true">
      <button type="button" className="btn-skip-assembly" onClick={handleSkip}>
        Skip Intro ✕
      </button>

      <div className="assembly-stage">
        {/* Full-width flying sticks stage with visible overflow for sky animations */}
        <div className="flying-sticks-stage">
          <svg
            id="full-gdg-flying-logo"
            viewBox="0 0 460 260"
            width="420"
            height="237"
            fill="none"
            className="gdg-flying-svg"
            style={{ overflow: 'visible' }}
          >


            {/* LEFT BRACKET < HALF (Blue capsule cleanly overlaps Red with complete dark border) */}
            <g id="bracket-left-half">
              {/* 1. Stick 1: Red Stick (Base) */}
              <g id="fly-border-1">
                <path d="M 166 58 L 94 130" stroke="#121212" strokeWidth="74" strokeLinecap="round" />
              </g>
              <g id="fly-fill-1-red">
                <path d="M 166 58 L 94 130" stroke="#EA4335" strokeWidth="56" strokeLinecap="round" />
              </g>

              {/* 2. Stick 2: Blue Stick (Overlaps Red with full dark border around entire capsule) */}
              <g id="fly-border-2">
                <path d="M 94 130 L 166 202" stroke="#121212" strokeWidth="74" strokeLinecap="round" />
              </g>
              <g id="fly-fill-2-blue">
                <path d="M 94 130 L 166 202" stroke="#4285F4" strokeWidth="56" strokeLinecap="round" />
              </g>
            </g>

            {/* RIGHT BRACKET > HALF (Green capsule cleanly overlaps Yellow with complete dark border) */}
            <g id="bracket-right-half">
              {/* 4. Stick 4: Yellow Stick (Base) */}
              <g id="fly-border-4">
                <path d="M 366 130 L 294 202" stroke="#121212" strokeWidth="74" strokeLinecap="round" />
              </g>
              <g id="fly-fill-4-yellow">
                <path d="M 366 130 L 294 202" stroke="#FBBC05" strokeWidth="56" strokeLinecap="round" />
              </g>

              {/* 3. Stick 3: Green Stick (Overlaps Yellow with full dark border around entire capsule) */}
              <g id="fly-border-3">
                <path d="M 294 58 L 366 130" stroke="#121212" strokeWidth="74" strokeLinecap="round" />
              </g>
              <g id="fly-fill-3-green">
                <path d="M 294 58 L 366 130" stroke="#34A853" strokeWidth="56" strokeLinecap="round" />
              </g>
            </g>
          </svg>
        </div>

        {/* Kinetic Typography Lockup (NO colorful line below!) */}
        <div className="assembly-text-lockup mt-4">
          <h1 className="kinetic-brand-title">
            <span className="kinetic-word google-word">
              <span style={{ color: '#4285F4' }}>G</span>
              <span style={{ color: '#EA4335' }}>o</span>
              <span style={{ color: '#FBBC05' }}>o</span>
              <span style={{ color: '#4285F4' }}>g</span>
              <span style={{ color: '#34A853' }}>l</span>
              <span style={{ color: '#EA4335' }}>e</span>
            </span>{' '}
            <span className="kinetic-word" style={{ color: '#202124' }}>Developer</span>{' '}
            <span className="kinetic-word" style={{ color: '#5F6368' }}>Groups</span>
          </h1>

          <p className="intro-sub-text">
            On Campus • <strong>Amity University Noida</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
