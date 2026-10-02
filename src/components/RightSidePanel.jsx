import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/sound';

export default function RightSidePanel({ lastSaved }) {
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [isSwiping, setIsSwiping] = useState(false);
  const prevSavedRef = useRef(lastSaved);

  useEffect(() => {
    if (lastSaved && lastSaved !== prevSavedRef.current) {
      prevSavedRef.current = lastSaved;
      setIsSwiping(true);
      const timer = setTimeout(() => setIsSwiping(false), 600);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  return (
    <aside className="fixed-vertical-side-panel" aria-label="Quick Controls Panel">
      <div className="vertical-panel-dock">
        {/* 1. Saved Status Pill with Tactile Swipe-Out Swipe-In Animation */}
        <div
          className={`side-dock-saved-pill ${isSwiping ? 'is-swiping' : ''}`}
          title="Automatic draft backup enabled"
          role="status"
          aria-live="polite"
        >
          <div className="saved-icon-pulse-wrap">
            <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
            <span className="saved-pulse-ring" />
          </div>
          <span className="saved-status-label">
            {lastSaved ? `Saved ${lastSaved}` : 'Auto-Save Ready'}
          </span>
        </div>

        {/* Vertical Divider Line */}
        <div className="side-dock-divider" aria-hidden="true" />

        {/* 2. Music / SFX Audio Toggle Button */}
        <button
          type="button"
          className={`side-dock-audio-btn ${isMuted ? 'is-muted' : 'is-active'}`}
          onClick={toggleSound}
          title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? (
            <VolumeX size={17} className="audio-icon muted-icon" />
          ) : (
            <Volume2 size={17} className="audio-icon active-icon" />
          )}
          <span className="audio-btn-tooltip">
            {isMuted ? 'Sound Off' : 'Sound On'}
          </span>
        </button>
      </div>
    </aside>
  );
}
