import React from 'react';
import { sound } from '../utils/sound';

const STEPS = [
  { num: 1, label: 'Basic Info', shortLabel: 'Basic' },
  { num: 2, label: 'Domain Teams', shortLabel: 'Domain' },
  { num: 3, label: 'Experience', shortLabel: 'Skills' },
  { num: 4, label: 'GDG & Google', shortLabel: 'Google' },
  { num: 5, label: 'Commitment', shortLabel: 'Commit' },
  { num: 6, label: 'Pitch', shortLabel: 'Pitch' },
  { num: 7, label: 'Review', shortLabel: 'Review' }
];

export default function DinoTimeline({ currentStep, totalSteps = 7, stepProgress = 0, onStepClick }) {
  // Clamp stepProgress between 0 and 1
  const activeStepProgress = Math.min(Math.max(stepProgress || 0, 0), 1);
  // Continuous overall progress
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
      {/* Timeline Meta Header: Step Counter & Progress Badge */}
      <div className="timeline-meta-bar">
        <div className="timeline-step-badge">
          <span className="badge-step-pill">STEP {currentStep} OF {totalSteps}</span>
          <span className="badge-step-name">{activeStepObj.label}</span>
        </div>
        <div className="timeline-percent-pill">
          <span>{Math.round(overallPercent)}% COMPLETED</span>
        </div>
      </div>

      {/* Desktop Stepper Track (Nodes + Connecting Ground Bar) */}
      <div className="timeline-desktop-stepper">
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

      {/* Mobile Streamlined Stepper (Ultra Clean, Compact & Touch-Friendly) */}
      <div className="timeline-mobile-stepper">
        <div className="mobile-progress-track">
          <div className="mobile-progress-fill" style={{ width: `${overallPercent}%` }} />
        </div>

        <div className="mobile-milestones-row">
          {STEPS.map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;

            return (
              <button
                key={step.num}
                type="button"
                className={`mobile-milestone-pill ${isActive ? 'is-active' : ''} ${isCompleted ? 'is-completed' : ''}`}
                onClick={() => handleStepClick(step.num)}
                aria-label={`Step ${step.num}: ${step.label}`}
              >
                <div className="mobile-pip">
                  {isCompleted ? (
                    <span className="mobile-pip-check">✓</span>
                  ) : (
                    <span className="mobile-pip-num">{step.num}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
