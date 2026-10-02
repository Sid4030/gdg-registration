import React from 'react';
import { sound } from '../utils/sound';

const STEPS = [
  { num: 1, label: 'Basic Info', fullLabel: 'Basic Information' },
  { num: 2, label: 'Domain Teams', fullLabel: 'Domain & Team Preference' },
  { num: 3, label: 'Experience', fullLabel: 'Skills & Technical Experience' },
  { num: 4, label: 'GDG & Google', fullLabel: 'GDG & Google Alignment' },
  { num: 5, label: 'Commitment', fullLabel: 'Commitment & Availability' },
  { num: 6, label: 'Pitch', fullLabel: 'Selection Pitch' },
  { num: 7, label: 'Review', fullLabel: 'Review & Submit' }
];

export default function DinoTimeline({ currentStep, totalSteps = 7, stepProgress = 0, onStepClick }) {
  // Clamp stepProgress between 0 and 1
  const activeStepProgress = Math.min(Math.max(stepProgress || 0, 0), 1);
  const continuousStep = (currentStep - 1) + activeStepProgress;
  const overallPercent = Math.min(Math.max((continuousStep / (totalSteps - 1)) * 100, 0), 100);

  const activeStepObj = STEPS.find((s) => s.num === currentStep) || STEPS[0];

  const handleStepClick = (stepNum) => {
    sound.playClick();
    if (onStepClick) {
      onStepClick(stepNum);
    }
  };

  return (
    <div className="dino-timeline-container" aria-label="Registration Milestones">
      {/* -------------------------------------------------------------
          1. DESKTOP TIMELINE (Visible on Laptop / Desktop >= 769px)
          Full interactive 7-step Google milestone track with labels
          ------------------------------------------------------------- */}
      <div className="timeline-desktop-stepper">
        <div className="timeline-meta-bar">
          <div className="timeline-step-badge">
            <span className="badge-step-pill">STEP {currentStep} OF {totalSteps}</span>
            <span className="badge-step-name">{activeStepObj.fullLabel}</span>
          </div>
          <div className="timeline-percent-pill">
            <span>{Math.round(overallPercent)}% COMPLETED</span>
          </div>
        </div>

        <div className="timeline-ground-track">
          <div className="timeline-ground-fill" style={{ width: `${overallPercent}%` }}>
            <span className="timeline-leader-dot" />
          </div>
        </div>

        <div className="timeline-nodes-row">
          {STEPS.map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;

            return (
              <button
                key={step.num}
                type="button"
                className={`timeline-node-btn ${isActive ? 'is-active' : ''} ${isCompleted ? 'is-completed' : ''}`}
                onClick={() => handleStepClick(step.num)}
                aria-label={`Step ${step.num}: ${step.label}`}
                title={`Step ${step.num}: ${step.label}`}
              >
                <div className="timeline-node-circle">
                  {isCompleted ? (
                    <span className="node-check">✓</span>
                  ) : (
                    <span>{step.num}</span>
                  )}
                </div>
                <span className="timeline-node-label">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* -------------------------------------------------------------
          2. MOBILE CLEAN STEP HEADER (Visible ONLY on Mobile <= 768px)
          Timeline dots & track removed completely as requested.
          Renders clean, aesthetic Step X and heading with zero clutter.
          ------------------------------------------------------------- */}
      <div className="timeline-mobile-view">
        <div className="mobile-step-pill-banner">
          <span className="mobile-step-pill">STEP {currentStep} OF {totalSteps}</span>
          <span className="mobile-step-heading">{activeStepObj.label}</span>
          <span className="mobile-step-pct">{Math.round(overallPercent)}%</span>
        </div>
      </div>
    </div>
  );
}
