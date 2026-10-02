import React from 'react';
import { Sparkles, Cloud, Smartphone, Flame, Layers, Brain, Globe, MapPin, Shield, Database, Plus } from 'lucide-react';
import { sound } from '../utils/sound';

const TECHS = [
  { id: 'Gemini / Generative AI', label: 'Gemini / Generative AI', icon: <Sparkles size={16} />, color: '#4285F4' },
  { id: 'Google Cloud', label: 'Google Cloud (GCP)', icon: <Cloud size={16} />, color: '#4285F4' },
  { id: 'Android', label: 'Android Development', icon: <Smartphone size={16} />, color: '#34A853' },
  { id: 'Firebase', label: 'Firebase', icon: <Flame size={16} />, color: '#FBBC05' },
  { id: 'Flutter', label: 'Flutter', icon: <Layers size={16} />, color: '#4285F4' },
  { id: 'TensorFlow', label: 'TensorFlow', icon: <Brain size={16} />, color: '#EA4335' },
  { id: 'Web technologies', label: 'Web Technologies (Chrome, V8, PWA)', icon: <Globe size={16} />, color: '#4285F4' },
  { id: 'Google Maps Platform', label: 'Google Maps Platform', icon: <MapPin size={16} />, color: '#34A853' },
  { id: 'Cybersecurity', label: 'Cybersecurity', icon: <Shield size={16} />, color: '#EA4335' },
  { id: 'Data/ML', label: 'Data Science & ML', icon: <Database size={16} />, color: '#FBBC05' },
  { id: 'Other', label: 'Other Technology', icon: <Plus size={16} />, color: '#70757A' }
];

export default function GoogleTechCloud({ selected = [], otherText = '', onToggle, onChangeOther, error }) {
  const handleToggle = (id) => {
    sound.playClick();
    onToggle(id);
  };

  return (
    <div className="google-tech-cloud-wrap">
      <div className="tech-cloud-head">
        <label className="section-sub-heading">
          Which Google technologies/topics are you most interested in? <span className="req-star">*</span>
        </label>
        <p className="section-sub-desc">Select the developer tracks and technologies you want to master.</p>
      </div>

      <div className="tech-pills-flow">
        {TECHS.map((tech) => {
          const isSelected = selected.includes(tech.id);
          return (
            <button
              key={tech.id}
              type="button"
              className={`tech-pill-btn ${isSelected ? 'is-selected' : ''}`}
              onClick={() => handleToggle(tech.id)}
            >
              <span className="tech-pill-icon" style={{ color: isSelected ? '#FFFFFF' : tech.color }}>
                {tech.icon}
              </span>
              <span className="tech-pill-text">{tech.label}</span>
              {isSelected && <span className="tech-pill-check">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Conditional Other input */}
      {selected.includes('Other') && (
        <div className="other-tech-input-box animate-fade-in mt-3">
          <input
            type="text"
            className="creative-input"
            value={otherText}
            onChange={(e) => onChangeOther(e.target.value)}
            placeholder="Please specify which other Google technology or topic you're passionate about..."
          />
        </div>
      )}

      {error && <div className="input-error-banner">{error}</div>}
    </div>
  );
}
