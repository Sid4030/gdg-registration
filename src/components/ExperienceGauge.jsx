import React from 'react';
import { Sprout, BookOpen, Zap, Flame, Crown } from 'lucide-react';
import { sound } from '../utils/sound';

const LEVELS = [
  {
    value: 'Beginner',
    label: 'Beginner',
    sub: 'Just starting out, eager to learn and explore',
    icon: <Sprout size={20} />,
    color: '#34A853',
    pct: 20
  },
  {
    value: 'Familiar',
    label: 'Familiar',
    sub: 'Know the core concepts, syntax, and principles',
    icon: <BookOpen size={20} />,
    color: '#4285F4',
    pct: 40
  },
  {
    value: 'Intermediate',
    label: 'Intermediate',
    sub: 'Built standalone projects and working apps',
    icon: <Zap size={20} />,
    color: '#FBBC05',
    pct: 65
  },
  {
    value: 'Advanced',
    label: 'Advanced',
    sub: 'Deep hands-on experience, production tooling',
    icon: <Flame size={20} />,
    color: '#EA4335',
    pct: 85
  },
  {
    value: 'Experienced / Have led projects',
    label: 'Experienced / Lead',
    sub: 'Have led teams, shipped full-scale apps & hackathons',
    icon: <Crown size={20} />,
    color: '#673AB7',
    pct: 100
  }
];

export default function ExperienceGauge({ value, onChange, error }) {
  const currentObj = LEVELS.find((l) => l.value === value) || null;
  const currentPct = currentObj ? currentObj.pct : 0;

  const handleSelect = (level) => {
    sound.playTone(400 + level.pct * 4, 'triangle', 0.1, 0.05);
    onChange(level.value);
  };

  return (
    <div className="experience-gauge-wrap">
      <div className="gauge-head">
        <label className="section-sub-heading">
          Rate your experience in your selected domain: <span className="req-star">*</span>
        </label>
        <span className="gauge-level-indicator">
          {currentObj ? (
            <span style={{ color: currentObj.color, fontWeight: 700 }}>
              Level: {currentObj.label} ({currentPct}%)
            </span>
          ) : (
            'Select your level'
          )}
        </span>
      </div>

      {/* Animated Power Gauge Bar */}
      <div className="gauge-bar-track">
        <div
          className="gauge-bar-fill"
          style={{
            width: `${currentPct}%`,
            background: currentObj
              ? `linear-gradient(90deg, #4285F4, ${currentObj.color})`
              : '#DADCE0'
          }}
        ></div>
      </div>

      {/* Level Selection Cards */}
      <div className="gauge-cards-grid">
        {LEVELS.map((level) => {
          const isSelected = value === level.value;
          return (
            <div
              key={level.value}
              className={`gauge-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => handleSelect(level)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleSelect(level);
                }
              }}
            >
              <div className="gauge-card-icon" style={{ color: isSelected ? level.color : '#5F6368' }}>
                {level.icon}
              </div>
              <strong className="gauge-card-title">{level.label}</strong>
              <p className="gauge-card-sub">{level.sub}</p>

              {isSelected && (
                <div className="gauge-selected-dot" style={{ background: level.color }}></div>
              )}
            </div>
          );
        })}
      </div>

      {error && <div className="input-error-banner">{error}</div>}
    </div>
  );
}
