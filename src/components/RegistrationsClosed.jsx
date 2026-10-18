import React, { useState } from 'react';
import {
  Clock,
  Mail,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Search,
  Users,
  Calendar,
  ArrowRight,
  FileText,
  AlertCircle
} from 'lucide-react';
import { sound } from '../utils/sound';

export default function RegistrationsClosed({ savedSubmission, onViewPass }) {
  const [lookupId, setLookupId] = useState('');
  const [lookupError, setLookupError] = useState('');

  const handleLookup = (e) => {
    e.preventDefault();
    if (!lookupId.trim()) {
      setLookupError('Please enter your Application ID or University Email.');
      sound.playTone(280, 'sawtooth', 0.15, 0.08);
      return;
    }

    const cleanInput = lookupId.trim().toLowerCase();

    // Check if input matches saved submission
    if (
      savedSubmission &&
      (savedSubmission.applicationId?.toLowerCase() === cleanInput ||
        savedSubmission.universityEmail?.toLowerCase() === cleanInput)
    ) {
      sound.playSuccess();
      onViewPass(savedSubmission);
      return;
    }

    // If ID looks like a valid GDG application ID (e.g. GDG-...)
    if (cleanInput.startsWith('gdg-')) {
      const reconstructedSubmission = {
        applicationId: lookupId.trim().toUpperCase(),
        fullName: 'GDG Applicant',
        firstPreference: 'Registered Domain',
        course: 'Amity University Noida',
        yearSemester: 'Candidate Record',
        universityEmail: 'Verified Registration',
        submittedAt: 'October 2026'
      };
      sound.playSuccess();
      onViewPass(reconstructedSubmission);
      return;
    }

    setLookupError('No matching application found for this ID/Email on this browser. If you applied on another device, check your email confirmation.');
    sound.playTone(280, 'sawtooth', 0.15, 0.08);
  };

  return (
    <div className="registrations-closed-view animate-fade-in">
      {/* Closed Status Pill */}
      <div className="closed-status-pill-wrap">
        <span className="closed-status-pill">
          <span className="closed-pulse-dot" aria-hidden="true"></span>
          <span>REGISTRATIONS OFFICIALLY CLOSED</span>
        </span>
      </div>

      {/* Hero Header */}
      <div className="portal-hero-block mb-8">
        <h1 className="hero-main-title">
          Registrations for <span className="hero-word-gdg">GDG</span> <span className="hero-word-amity">Amity</span> are Closed
        </h1>
        <p className="hero-lead-text">
          Thank you for the tremendous response and passion! The recruitment window for Google Developer Groups on Campus at Amity University Noida has concluded. All submitted profiles are now undergoing domain evaluation.
        </p>
      </div>

      {/* Saved Application Pass Banner (If user previously applied on this device) */}
      {savedSubmission && (
        <div className="existing-submission-card">
          <div className="esc-left">
            <div className="esc-icon-badge">
              <Sparkles size={22} className="text-amber-500" />
            </div>
            <div className="esc-text">
              <div className="esc-title">Application Found on this Device</div>
              <div className="esc-sub">
                Candidate: <strong>{savedSubmission.fullName}</strong> • ID: <span className="esc-id-tag">{savedSubmission.applicationId}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn-view-pass"
            onClick={() => {
              sound.playClick();
              onViewPass(savedSubmission);
            }}
          >
            <span>View Candidate Pass</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Selection Pipeline Timeline */}
      <div className="closed-info-grid">
        <div className="closed-card timeline-card">
          <div className="card-header-row">
            <div className="card-header-icon blue">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="closed-card-title">Recruitment & Review Roadmap</h3>
              <p className="closed-card-sub">What to expect over the coming days</p>
            </div>
          </div>

          <div className="pipeline-steps-list">
            <div className="pipeline-step active">
              <div className="pipeline-step-marker">
                <span className="step-num">01</span>
                <span className="step-status-chip active">IN PROGRESS</span>
              </div>
              <div className="pipeline-step-content">
                <h4 className="pipeline-step-title">Application Screening & Portfolio Review</h4>
                <p className="pipeline-step-desc">
                  Domain leads are evaluating technical projects, code repositories, creative design portfolios, and leadership responses submitted by candidates.
                </p>
              </div>
            </div>

            <div className="pipeline-step upcoming">
              <div className="pipeline-step-marker">
                <span className="step-num">02</span>
                <span className="step-status-chip upcoming">UPCOMING</span>
              </div>
              <div className="pipeline-step-content">
                <h4 className="pipeline-step-title">Shortlist Announcement & Personal Interviews</h4>
                <p className="pipeline-step-desc">
                  Shortlisted candidates will receive interview slots and task briefs directly on their registered <strong>University Email</strong>. Please monitor your inbox and spam folder.
                </p>
              </div>
            </div>

            <div className="pipeline-step upcoming">
              <div className="pipeline-step-marker">
                <span className="step-num">03</span>
                <span className="step-status-chip upcoming">FINAL STAGE</span>
              </div>
              <div className="pipeline-step-content">
                <h4 className="pipeline-step-title">Team Induction & Onboarding</h4>
                <p className="pipeline-step-desc">
                  Selected core team and chapter members will be formally inducted into GDG Amity, joining working groups, Google Cloud study jams, and hackathon organization teams.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel: Lookup & Community Info */}
        <div className="closed-side-stack">
          {/* Candidate Pass Lookup Box */}
          <div className="closed-card lookup-card">
            <div className="card-header-row">
              <div className="card-header-icon green">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="closed-card-title">Candidate Pass Retrieval</h3>
                <p className="closed-card-sub">Access your digital pass receipt</p>
              </div>
            </div>

            <p className="lookup-explain-text">
              If you applied and need to view or print your Candidate Pass, enter your Application ID or registered university email below:
            </p>

            <form onSubmit={handleLookup} className="lookup-form-wrap">
              <div className="lookup-input-group">
                <Search size={16} className="lookup-search-icon" />
                <input
                  type="text"
                  placeholder="e.g. GDG-2026-XXXXXX or email"
                  value={lookupId}
                  onChange={(e) => {
                    setLookupId(e.target.value);
                    if (lookupError) setLookupError('');
                  }}
                  className="lookup-input-field"
                />
              </div>

              {lookupError && (
                <div className="lookup-error-msg">
                  <AlertCircle size={14} />
                  <span>{lookupError}</span>
                </div>
              )}

              <button type="submit" className="btn-lookup-submit">
                Find My Pass
              </button>
            </form>
          </div>

          {/* Open Community Activities */}
          <div className="closed-card community-card">
            <div className="card-header-row">
              <div className="card-header-icon yellow">
                <Users size={20} />
              </div>
              <div>
                <h3 className="closed-card-title">Stay Part of the Community</h3>
                <p className="closed-card-sub">Open events for all Amity students</p>
              </div>
            </div>

            <p className="community-explain-text">
              Even if you missed recruitment, GDG Amity workshops, developer bootcamps, and Google Cloud study tracks are 100% open to every student at Amity University.
            </p>

            <div className="community-links-grid">
              <a
                href="https://gdg.community.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="community-link-btn"
              >
                <span>GDG Community Chapter</span>
                <ExternalLink size={13} />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="community-link-btn"
              >
                <span>LinkedIn Updates</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
