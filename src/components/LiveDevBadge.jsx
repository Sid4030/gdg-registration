import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, Cpu, Award } from 'lucide-react';

export default function LiveDevBadge({ formData, currentStep }) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate completeness / match score
  let score = 0;
  if (formData.fullName) score += 15;
  if (formData.universityEmail) score += 15;
  if (formData.selectedDomains?.length > 0) score += 20;
  if (formData.firstPreference) score += 10;
  if (formData.domainExperience) score += 15;
  if (formData.googleTechs?.length > 0) score += 10;
  if (formData.whySelectYou) score += 15;

  return (
    <div className={`live-dev-badge-wrap ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className="live-badge-bar"
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle Candidate Inspector"
      >
        <div className="badge-bar-left">
          <Terminal size={14} className="text-blue-500" />
          <span className="badge-bar-title">
            Candidate: <strong>{formData.fullName || 'Anonymous Dev'}</strong>
          </span>
          {formData.firstPreference && (
            <span className="badge-tag-pill">{formData.firstPreference}</span>
          )}
        </div>

        <div className="badge-bar-right">
          <span className="score-label">
            <Award size={13} className="text-amber-500" />
            <span>Profile Match: {score}%</span>
          </span>
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </button>

      {isOpen && (
        <div className="badge-terminal-content animate-fade-in">
          <div className="terminal-header">
            <span className="term-dot red"></span>
            <span className="term-dot yellow"></span>
            <span className="term-dot green"></span>
            <span className="term-title">gdg-amity://candidate-preview.json</span>
          </div>

          <pre className="terminal-code">
            <code>
{JSON.stringify(
  {
    candidate: formData.fullName || null,
    chapter: "GDG on Campus • Amity University Noida",
    academic: {
      email: formData.universityEmail || null,
      course: formData.course || null,
      semester: formData.yearSemester || null
    },
    preferences: {
      domains: formData.selectedDomains?.length ? formData.selectedDomains : [],
      primary: formData.firstPreference || null
    },
    readiness: {
      level: formData.domainExperience || 'Pending',
      completion: `${score}%`
    }
  },
  null,
  2
)}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
}
