import React from 'react';

export default function Navbar() {
  return (
    <header className="gdg-app-navbar">
      {/* Top Google 4-Color Spectrum Stripe */}
      <div className="navbar-spectrum" aria-hidden="true">
        <span className="spec-blue"></span>
        <span className="spec-red"></span>
        <span className="spec-yellow"></span>
        <span className="spec-green"></span>
      </div>

      <div className="navbar-inner centered-branding-nav">
        {/* Main Center Branding: GDG Logo & Amity Logo BIGGER and CENTERED */}
        <div className="nav-center-branding">
          <div className="nav-main-logos-row">
            {/* GDG Vector Logo */}
            <div className="nav-big-logo-wrap gdg-big-wrap" title="Google Developer Groups">
              <img src="/gdg-logo.svg" alt="Google Developer Groups" className="nav-big-logo-gdg" />
            </div>

            <div className="nav-logo-divider" aria-hidden="true"></div>

            {/* Amity University Noida Logo */}
            <div className="nav-big-logo-wrap amity-big-wrap" title="Amity University Noida">
              <img src="/amity-logo.png" alt="Amity University Noida" className="nav-big-logo-amity" />
            </div>
          </div>

          {/* Sub-row: Jumping GDG Logo Loop Animation beside Campus Chapter Title */}
          <div className="nav-sub-brand-row">
            <div className="nav-jumping-gdg-wrapper" title="GDG Jumping Emblem">
              <svg className="nav-jumping-gdg-svg" viewBox="0 0 350 250" width="26" height="18" fill="none">
                {/* Blue Bottom-Left */}
                <path d="M 68 125 L 142 200" stroke="#121212" strokeWidth="48" strokeLinecap="round" />
                <path d="M 68 125 L 142 200" stroke="#4285F4" strokeWidth="36" strokeLinecap="round" />
                {/* Red Top-Left */}
                <path d="M 142 50 L 68 125" stroke="#121212" strokeWidth="48" strokeLinecap="round" />
                <path d="M 142 50 L 68 125" stroke="#EA4335" strokeWidth="36" strokeLinecap="round" />
                {/* Yellow Bottom-Right */}
                <path d="M 282 125 L 208 200" stroke="#121212" strokeWidth="48" strokeLinecap="round" />
                <path d="M 282 125 L 208 200" stroke="#FBBC05" strokeWidth="36" strokeLinecap="round" />
                {/* Green Top-Right */}
                <path d="M 208 50 L 282 125" stroke="#121212" strokeWidth="48" strokeLinecap="round" />
                <path d="M 208 50 L 282 125" stroke="#34A853" strokeWidth="36" strokeLinecap="round" />
              </svg>
            </div>

            <span className="nav-chapter-title">
              Google Developer Groups on Campus • <strong>Amity University Noida</strong>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
