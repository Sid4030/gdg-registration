import React, { useState } from 'react';
import { Copy, Check, Printer, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/sound';

export default function CandidatePass({ submission, onReset }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!submission?.applicationId) return;
    navigator.clipboard.writeText(submission.applicationId).then(() => {
      sound.playTone(880, 'sine', 0.1, 0.08);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  return (
    <div className="candidate-pass-view animate-fade-in">
      <div className="pass-celebration-head">
        <div className="pass-confetti-badge">
          <Sparkles size={28} className="text-amber-500" />
        </div>
        <h2 className="pass-success-title">Application Submitted Successfully!</h2>
        <p className="pass-success-sub">
          Welcome to the GDG Amity University Noida recruitment process. Here is your verified Candidate Pass.
        </p>
      </div>

      {/* 3D Holographic Pass Card */}
      <div className="pass-3d-card-wrapper">
        <div className="pass-card-surface">
          <div className="hologram-shimmer-stripe"></div>

          {/* Top Brand Bar */}
          <div className="pass-brand-row">
            <div className="pass-brand-left">
              <svg className="pass-brackets" viewBox="0 0 200 120" width="36" height="24" fill="none">
                <path d="M 88 22 L 32 60" stroke="#EA4335" strokeWidth="22" strokeLinecap="round" />
                <path d="M 88 98 L 32 60" stroke="#4285F4" strokeWidth="22" strokeLinecap="round" />
                <path d="M 112 22 L 168 60" stroke="#34A853" strokeWidth="22" strokeLinecap="round" />
                <path d="M 112 98 L 168 60" stroke="#FBBC05" strokeWidth="22" strokeLinecap="round" />
              </svg>
              <div className="pass-title-group">
                <span className="pass-org-name">Google Developer Groups</span>
                <span className="pass-org-sub">On Campus • Amity University Noida</span>
              </div>
            </div>

            <span className="pass-chip-tag">CANDIDATE PASS</span>
          </div>

          {/* Candidate Body */}
          <div className="pass-main-body">
            <div className="pass-name-block">
              <span className="pass-micro-label">CANDIDATE NAME</span>
              <h3 className="pass-name-text">{submission.fullName}</h3>
            </div>

            <div className="pass-meta-grid">
              <div className="pass-meta-cell">
                <span className="pass-micro-label">APPLICATION ID</span>
                <span className="pass-app-id-pill">{submission.applicationId}</span>
              </div>

              <div className="pass-meta-cell">
                <span className="pass-micro-label">PRIMARY DOMAIN</span>
                <span className="pass-domain-text">
                  {submission.firstPreference || (submission.selectedDomains ? submission.selectedDomains[0] : 'General Core')}
                </span>
              </div>

              <div className="pass-meta-cell">
                <span className="pass-micro-label">ACADEMIC INFO</span>
                <span className="pass-plain-val">{submission.course} • {submission.yearSemester}</span>
              </div>

              <div className="pass-meta-cell">
                <span className="pass-micro-label">SUBMITTED ON</span>
                <span className="pass-plain-val">{submission.submittedAt}</span>
              </div>
            </div>
          </div>

          {/* Pass Footer with Barcode & Seal */}
          <div className="pass-card-footer">
            <div className="pass-barcode-box">
              <div className="fake-barcode-lines"></div>
              <span className="barcode-caption">{submission.universityEmail}</span>
            </div>

            <div className="pass-auth-seal">
              <ShieldCheck size={18} className="text-green-600 mb-1" />
              <span>OFFICIAL 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pass-actions-container">
        <button type="button" className="btn-pass-action primary" onClick={handleCopy}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied ID!' : 'Copy Application ID'}</span>
        </button>

        <button type="button" className="btn-pass-action secondary" onClick={handlePrint}>
          <Printer size={16} />
          <span>Print / Save Pass</span>
        </button>

        <button type="button" className="btn-pass-action ghost" onClick={onReset}>
          <RefreshCw size={15} />
          <span>New Application</span>
        </button>
      </div>

      {/* Next Steps Guidance */}
      <div className="pass-next-steps-card">
        <h4>What Happens Next?</h4>
        <ul className="pass-steps-list">
          <li>
            <strong>1. Screening & Domain Review:</strong> Leads evaluate your past projects, GitHub/portfolio links, and domain alignment.
          </li>
          <li>
            <strong>2. Interview & Task Round:</strong> Shortlisted applicants will receive interview slots directly via their University Email.
          </li>
          <li>
            <strong>3. Community Induction:</strong> Onboarding into official GDG Amity developer channels, study jams, and hackathon teams.
          </li>
        </ul>
      </div>
    </div>
  );
}
