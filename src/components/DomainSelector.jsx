import React from 'react';
import {
  Code,
  Cpu,
  Cloud,
  Palette,
  FileText,
  Share2,
  Calendar,
  Handshake,
  Camera,
  Users,
  Check,
  Star
} from 'lucide-react';
import { sound } from '../utils/sound';

const DOMAINS_DATA = [
  {
    id: 'Technical / Development',
    title: 'Technical / Development',
    desc: 'Web apps, mobile solutions, systems, and open-source APIs',
    icon: <Code size={22} />,
    color: '#4285F4'
  },
  {
    id: 'AI/ML',
    title: 'AI/ML',
    desc: 'Generative AI, Gemini, TensorFlow, machine learning models',
    icon: <Cpu size={22} />,
    color: '#EA4335'
  },
  {
    id: 'Cloud / Google Cloud',
    title: 'Cloud / Google Cloud',
    desc: 'Google Cloud Platform (GCP), Kubernetes, DevOps, Docker',
    icon: <Cloud size={22} />,
    color: '#4285F4'
  },
  {
    id: 'UI/UX & Design',
    title: 'UI/UX & Design',
    desc: 'Figma prototypes, user research, brand assets & visual design',
    icon: <Palette size={22} />,
    color: '#FBBC05'
  },
  {
    id: 'Content & Documentation',
    title: 'Content & Documentation',
    desc: 'Technical blogs, documentation, newsletters, community writing',
    icon: <FileText size={22} />,
    color: '#34A853'
  },
  {
    id: 'Social Media & Marketing',
    title: 'Social Media & Marketing',
    desc: 'Content creation, viral campaigns, reels, student engagement',
    icon: <Share2 size={22} />,
    color: '#EA4335'
  },
  {
    id: 'Event Management & Operations',
    title: 'Event Management & Operations',
    desc: 'Campus hackathons, workshop logistics, venue management',
    icon: <Calendar size={22} />,
    color: '#4285F4'
  },
  {
    id: 'Sponsorships & Partnerships',
    title: 'Sponsorships & Partnerships',
    desc: 'Industry sponsorships, developer swag, community tie-ups',
    icon: <Handshake size={22} />,
    color: '#FBBC05'
  },
  {
    id: 'Photography / Videography',
    title: 'Photography / Videography',
    desc: 'Event aftermovies, video editing, photography, YouTube media',
    icon: <Camera size={22} />,
    color: '#34A853'
  },
  {
    id: 'Community / Outreach',
    title: 'Community / Outreach',
    desc: 'Campus ambassadors, student relations, university networking',
    icon: <Users size={22} />,
    color: '#4285F4'
  }
];

export default function DomainSelector({
  selectedDomains = [],
  firstPreference = '',
  whyThisTeam = '',
  onChangeDomains,
  onChangeFirstPreference,
  onChangeWhyThisTeam,
  errorDomain,
  errorFirstPreference,
  errorWhyThisTeam
}) {
  const toggleDomain = (domainId) => {
    sound.playClick();
    let updated;
    if (selectedDomains.includes(domainId)) {
      updated = selectedDomains.filter((d) => d !== domainId);
    } else {
      if (selectedDomains.length >= 2) {
        sound.playTone(280, 'sawtooth', 0.15, 0.08);
        return; // Max 2
      }
      updated = [...selectedDomains, domainId];
    }

    onChangeDomains(updated);

    // Auto-update first preference
    if (updated.length === 1) {
      onChangeFirstPreference(updated[0]);
    } else if (updated.length === 0) {
      onChangeFirstPreference('');
    } else if (updated.length === 2 && !updated.includes(firstPreference)) {
      onChangeFirstPreference(updated[0]);
    }
  };

  return (
    <div className="domain-selector-component">
      {/* Selection Header & Counter */}
      <div className="domain-head-bar">
        <div>
          <label className="section-sub-heading">
            Which domain/team are you interested in? <span className="req-star">*</span>
          </label>
          <p className="section-sub-desc">Select <strong>up to 2</strong> specialized teams you want to join.</p>
        </div>

        <div className={`selection-counter-pill ${selectedDomains.length === 2 ? 'is-max' : ''}`}>
          <span>{selectedDomains.length} / 2 selected</span>
        </div>
      </div>

      {errorDomain && <div className="input-error-banner">{errorDomain}</div>}

      {/* 10 Domain Cards Grid */}
      <div className="domain-cards-grid">
        {DOMAINS_DATA.map((domain) => {
          const isSelected = selectedDomains.includes(domain.id);
          const isFirstPref = firstPreference === domain.id;
          const isDisabled = !isSelected && selectedDomains.length >= 2;

          return (
            <div
              key={domain.id}
              className={`domain-item-card ${isSelected ? 'is-active' : ''} ${isDisabled ? 'is-disabled' : ''}`}
              onClick={() => !isDisabled && toggleDomain(domain.id)}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  if (!isDisabled) toggleDomain(domain.id);
                }
              }}
            >
              <div className="domain-card-main">
                <div className="domain-card-icon" style={{ color: domain.color }}>
                  {domain.icon}
                </div>

                <div className="domain-card-text">
                  <div className="domain-card-title-row">
                    <span className="domain-title">{domain.title}</span>
                    {isSelected && (
                      <span className="domain-check-badge">
                        <Check size={14} />
                      </span>
                    )}
                  </div>
                  <p className="domain-desc">{domain.desc}</p>
                </div>
              </div>

              {isSelected && isFirstPref && (
                <div className="pref-ribbon">
                  <Star size={11} /> 1st Preference
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* First Preference Selector (Dynamically Visible when domains selected) */}
      {selectedDomains.length > 0 && (
        <div className="first-pref-section animate-fade-in">
          <label className="section-sub-heading">
            Which one would be your first preference? <span className="req-star">*</span>
          </label>
          <p className="section-sub-desc">Choose which of your selected teams is your primary focus.</p>

          <div className="first-pref-options-row">
            {selectedDomains.map((domain) => {
              const isFirst = firstPreference === domain;
              return (
                <button
                  key={domain}
                  type="button"
                  className={`pref-option-pill ${isFirst ? 'is-selected' : ''}`}
                  onClick={() => {
                    sound.playClick();
                    onChangeFirstPreference(domain);
                  }}
                >
                  <Star size={14} className={isFirst ? 'text-amber-500 fill-amber-500' : 'text-gray-400'} />
                  <span>{domain}</span>
                  {isFirst && <span className="pill-status-check">✓ Primary</span>}
                </button>
              );
            })}
          </div>

          {errorFirstPreference && <div className="input-error-banner">{errorFirstPreference}</div>}
        </div>
      )}

      {/* Why are you interested in this team? */}
      <div className="why-team-box mt-5">
        <div className="label-counter-row">
          <label htmlFor="whyThisTeam" className="section-sub-heading">
            Why are you interested in this team? <span className="req-star">*</span>
          </label>
          <span className="char-badge">{whyThisTeam.length} chars</span>
        </div>
        <p className="section-sub-desc">Tell us what draws you to this domain and what you hope to achieve together.</p>

        <textarea
          id="whyThisTeam"
          className="creative-textarea"
          rows={4}
          value={whyThisTeam}
          onChange={(e) => onChangeWhyThisTeam(e.target.value)}
          placeholder="I want to join this team because I love building systems that solve practical student problems..."
        />
        {errorWhyThisTeam && <div className="input-error-banner">{errorWhyThisTeam}</div>}
      </div>
    </div>
  );
}
