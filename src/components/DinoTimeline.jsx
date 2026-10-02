import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { sound } from '../utils/sound';

const STEPS = [
  { num: 1, label: 'Basic Info' },
  { num: 2, label: 'Domain Teams' },
  { num: 3, label: 'Experience' },
  { num: 4, label: 'GDG & Google' },
  { num: 5, label: 'Commitment' },
  { num: 6, label: 'Pitch' },
  { num: 7, label: 'Review' }
];

// Exact Pixel Dino 24x25 Matrices from Reference Image 1
const DINO_RUN_1 = [
  '.............XXXXXXXXXX.',
  '............XXXXXXXXXXXX',
  '............XXWWXXXXXXXX', // Crisp white square eye
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

const DINO_RUN_2 = [
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

export default function DinoTimeline({ currentStep, totalSteps = 7, stepProgress = 0, onStepClick }) {
  const dinoRef = useRef(null);
  const trackRef = useRef(null);
  const prevTargetX = useRef(0);
  const [dinoLeg, setDinoLeg] = useState(0);

  // Clamp stepProgress between 0 and 1
  const activeStepProgress = Math.min(Math.max(stepProgress || 0, 0), 1);
  // Continuous overall progress:
  const continuousStep = (currentStep - 1) + activeStepProgress;
  const overallPercent = Math.min(Math.max((continuousStep / (totalSteps - 1)) * 100, 0), 100);

  useEffect(() => {
    if (!dinoRef.current || !trackRef.current) return;
    const trackWidth = trackRef.current.clientWidth;
    const maxTravel = Math.max(trackWidth - 36, 0);
    const targetX = (overallPercent / 100) * maxTravel;

    const diff = targetX - prevTargetX.current;
    if (Math.abs(diff) > 0.5) {
      // Toggle footstep animation when moving
      setDinoLeg((prev) => 1 - prev);

      // Smooth walk animation
      gsap.to(dinoRef.current, {
        x: targetX,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      // Hop slightly when changing steps
      if (Math.abs(diff) > 15) {
        gsap.timeline()
          .to(dinoRef.current, { y: -8, duration: 0.12, ease: 'power1.out' })
          .to(dinoRef.current, { y: 0, duration: 0.14, ease: 'bounce.out' });
        sound.playTone(520, 'triangle', 0.06, 0.03);
      }

      prevTargetX.current = targetX;
    }
  }, [currentStep, overallPercent]);

  const activeMatrix = dinoLeg === 0 ? DINO_RUN_1 : DINO_RUN_2;
  const activeStepObj = STEPS.find((s) => s.num === currentStep) || STEPS[0];

  return (
    <div className="dino-timeline-container" aria-label="Registration Timeline">
      {/* Timeline Meta Header: Step Counter & Progress */}
      <div className="timeline-meta-bar">
        <div className="timeline-step-badge">
          <span className="badge-step-pill">STEP {currentStep} OF {totalSteps}</span>
          <span className="badge-step-name">{activeStepObj.label}</span>
        </div>
        <div className="timeline-percent-pill">
          <span>{Math.round(overallPercent)}% COMPLETED</span>
        </div>
      </div>

      {/* Unified Dino Track with Ground Line directly linking nodes */}
      <div ref={trackRef} className="dino-unified-track">
        {/* The Base Ground Track Bar (Clean Google Slate) */}
        <div className="dino-base-ground-bar">
          {/* Active Fill: Solid Google Blue */}
          <div className="dino-active-ground-fill" style={{ width: `${overallPercent}%` }}>
            <span className="dino-ground-leader-pulse" />
          </div>
        </div>

        {/* Animated Pixel Chrome Dino Running along the Track */}
        <div ref={dinoRef} className="pixel-dino-runner" title={`Progress: ${Math.round(overallPercent)}%`}>
          <svg viewBox="0 0 24 24" width="32" height="32" className="dino-sprite-svg">
            {activeMatrix.map((row, r) =>
              row.split('').map((char, c) => {
                if (char === 'X') {
                  return <rect key={`${r}-${c}`} x={c} y={r} width="1.05" height="1.05" fill="#202124" />;
                }
                if (char === 'W') {
                  return <rect key={`${r}-${c}`} x={c} y={r} width="1.05" height="1.05" fill="#FFFFFF" />;
                }
                return null;
              })
            )}
          </svg>
        </div>

        {/* Milestone Node Buttons situated directly along the track */}
        <div className="dino-nodes-row">
          {STEPS.map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;

            return (
              <button
                key={step.num}
                type="button"
                className={`dino-node-btn ${isActive ? 'is-active' : ''} ${isCompleted ? 'is-completed' : ''}`}
                onClick={() => onStepClick(step.num)}
                aria-label={`Step ${step.num}: ${step.label}`}
              >
                <div className="dino-node-circle">
                  {isCompleted ? (
                    <span className="check-mark">✓</span>
                  ) : (
                    <span>{step.num}</span>
                  )}
                </div>
                <span className="dino-node-label">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
