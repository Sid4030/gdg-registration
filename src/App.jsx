import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import gsap from 'gsap';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Layers,
  Globe,
  ArrowRight,
  ArrowLeft,
  Send,
  Save,
  CheckCircle2,
  FileEdit,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

const LinkedinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const GithubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
  </svg>
);

import Navbar from './components/Navbar';
import RightSidePanel from './components/RightSidePanel';
import IntroAssembly from './components/IntroAssembly';
import PixelGoogleBackground from './components/PixelGoogleBackground';
import DinoTimeline from './components/DinoTimeline';
import ElasticStringInput from './components/ElasticStringInput';
import DomainSelector from './components/DomainSelector';
import ExperienceGauge from './components/ExperienceGauge';
import GoogleTechCloud from './components/GoogleTechCloud';
import CandidatePass from './components/CandidatePass';
import AdminPortal from './components/AdminPortal';
import Lenis from 'lenis';

import { sound } from './utils/sound';
import { storage } from './utils/storage';

const INITIAL_FORM_DATA = {
  // Step 1: Basic Information
  fullName: '',
  universityEmail: '',
  personalEmail: '',
  phone: '',
  course: '',
  yearSemester: '',
  section: '',
  linkedin: '',
  github: '',
  portfolio: '',

  // Step 2: Team Preference
  selectedDomains: [],
  firstPreference: '',
  whyThisTeam: '',

  // Step 3: Experience & Technical Background
  domainExperience: '',
  toolsTech: '',
  projectsShared: '',
  pastOrgExperience: 'No',
  pastOrgName: '',
  pastOrgRole: '',
  pastOrgContribution: '',
  proudestAchievement: '',

  // Step 4: GDG & Google Alignment
  gdgMeaning: '',
  googleTechs: [],
  googleTechOther: '',
  attendedGdgBefore: 'No',
  gdgTakeaway: '',

  // Step 5: Commitment & Fit
  weeklyTime: '',
  outsideEventContribution: '',
  teamDeadlines: '',
  ownershipWillingness: '',

  // Step 6: Deciding Questions (Selection Pitch)
  whySelectYou: '',
  changeCampusCommunities: '',

  // Terms & Submission
  termsAgreed: false,
  applicationId: '',
  submittedAt: ''
};

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const handleIntroComplete = React.useCallback(() => {
    setShowIntro(false);
  }, []);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [lastSaved, setLastSaved] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const formCardRef = useRef(null);
  const totalSteps = 7;

  // Dedicated Route for Administrator Console (/meoww or #/meoww)
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return (
      typeof window !== 'undefined' &&
      (window.location.pathname === '/meoww' ||
        window.location.pathname === '/meoww/' ||
        window.location.hash === '#/meoww' ||
        window.location.hash === '#meoww')
    );
  });

  useEffect(() => {
    const checkRoute = () => {
      const isMeoww =
        window.location.pathname === '/meoww' ||
        window.location.pathname === '/meoww/' ||
        window.location.hash === '#/meoww' ||
        window.location.hash === '#meoww';
      setIsAdminRoute(isMeoww);
    };

    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  if (isAdminRoute) {
    return <AdminPortal />;
  }

  // Lenis smooth scroll initialization (Optimized: native 120Hz hardware touch for mobile, silky wheel on desktop)
  useEffect(() => {
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (isTouch) return;

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    let reqId;
    function raf(time) {
      lenis.raf(time);
      reqId = requestAnimationFrame(raf);
    }
    reqId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(reqId);
      lenis.destroy();
    };
  }, []);

  // Load draft on mount
  useEffect(() => {
    const draft = storage.loadDraft();
    if (draft && draft.data) {
      setFormData(draft.data);
      if (draft.updatedAt) {
        const time = new Date(draft.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSaved(time);
      }
    }
  }, []);

  // Auto-save draft on data change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!submittedData) {
        storage.saveDraft(formData);
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSaved(time);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [formData, submittedData]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Step Validation
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required.';
      if (!formData.universityEmail.trim()) {
        newErrors.universityEmail = 'University Email is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.universityEmail)) {
        newErrors.universityEmail = 'Please enter a valid university email address.';
      }
      if (!formData.personalEmail.trim()) {
        newErrors.personalEmail = 'Personal Email is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalEmail)) {
        newErrors.personalEmail = 'Please enter a valid personal email address.';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required.';
      } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/[\s-+]/g, ''))) {
        newErrors.phone = 'Please enter a valid 10-digit phone number.';
      }
      if (!formData.course) newErrors.course = 'Please select your Course / Degree.';
      if (!formData.yearSemester) newErrors.yearSemester = 'Please select your Year & Semester.';
      if (!formData.section.trim()) newErrors.section = 'Please enter your Section.';
    } else if (step === 2) {
      if (!formData.selectedDomains || formData.selectedDomains.length === 0) {
        newErrors.domain = 'Please select at least 1 domain (up to 2).';
      }
      if (!formData.firstPreference) {
        newErrors.firstPreference = 'Please select your 1st preference domain.';
      }
      if (!formData.whyThisTeam.trim() || formData.whyThisTeam.trim().length < 20) {
        newErrors.whyThisTeam = 'Please explain why you are interested in this team (minimum 20 characters).';
      }
    } else if (step === 3) {
      if (!formData.domainExperience) {
        newErrors.domainExperience = 'Please rate your experience in your selected domain.';
      }
      if (!formData.toolsTech.trim()) {
        newErrors.toolsTech = 'Please list the tools/technologies you work with.';
      }
      if (!formData.projectsShared.trim()) {
        newErrors.projectsShared = 'Please share 1–3 projects, designs, posts or campaigns with links.';
      }
      if (formData.pastOrgExperience === 'Yes') {
        if (!formData.pastOrgName.trim()) newErrors.pastOrgName = 'Organization name is required.';
        if (!formData.pastOrgRole.trim()) newErrors.pastOrgRole = 'Role is required.';
        if (!formData.pastOrgContribution.trim()) newErrors.pastOrgContribution = 'Contribution details required.';
      }
      if (!formData.proudestAchievement.trim()) {
        newErrors.proudestAchievement = 'Please share something you are genuinely proud of.';
      }
    } else if (step === 4) {
      if (!formData.gdgMeaning.trim()) {
        newErrors.gdgMeaning = 'Please tell us what GDG means to you.';
      }
      if (!formData.googleTechs || formData.googleTechs.length === 0) {
        newErrors.googleTechs = 'Please select at least one Google technology you are interested in.';
      }
      if (formData.attendedGdgBefore === 'Yes' && !formData.gdgTakeaway.trim()) {
        newErrors.gdgTakeaway = 'Please share your key takeaway from previous events.';
      }
    } else if (step === 5) {
      if (!formData.weeklyTime) newErrors.weeklyTime = 'Please select your weekly time commitment.';
      if (!formData.outsideEventContribution) newErrors.outsideEventContribution = 'Please answer this question.';
      if (!formData.teamDeadlines) newErrors.teamDeadlines = 'Please answer this question.';
      if (!formData.ownershipWillingness) newErrors.ownershipWillingness = 'Please answer this question.';
    } else if (step === 6) {
      if (!formData.whySelectYou.trim() || formData.whySelectYou.trim().length < 30) {
        newErrors.whySelectYou = 'Please show us why we should select you through something you have done (minimum 30 characters).';
      }
      if (!formData.changeCampusCommunities.trim()) {
        newErrors.changeCampusCommunities = 'Please share what one thing you would change about campus communities.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      sound.playNext();
      animateStepChange(currentStep + 1, 1);
    } else {
      sound.playTone(280, 'sawtooth', 0.15, 0.08);
      if (formCardRef.current) {
        gsap.timeline()
          .to(formCardRef.current, { x: -8, duration: 0.06 })
          .to(formCardRef.current, { x: 8, duration: 0.06 })
          .to(formCardRef.current, { x: -5, duration: 0.05 })
          .to(formCardRef.current, { x: 0, duration: 0.05 });
      }
    }
  };

  const handlePrev = () => {
    sound.playPrev();
    animateStepChange(currentStep - 1, -1);
  };

  const jumpToStep = (targetStep) => {
    if (targetStep < currentStep) {
      sound.playPrev();
      animateStepChange(targetStep, -1);
    } else if (targetStep > currentStep && validateStep(currentStep)) {
      sound.playNext();
      animateStepChange(targetStep, 1);
    }
  };

  const animateStepChange = (targetStep, direction) => {
    if (!formCardRef.current) {
      setCurrentStep(targetStep);
      return;
    }

    const xDist = direction > 0 ? 30 : -30;
    gsap.to(formCardRef.current, {
      x: -xDist,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setCurrentStep(targetStep);
        window.scrollTo({ top: 120, behavior: 'smooth' });
        gsap.fromTo(
          formCardRef.current,
          { x: xDist, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
        );
      }
    });
  };

  // Final Submission to MongoDB Atlas Backend API + Resilient local fallback
  const handleSubmit = async () => {
    if (!formData.termsAgreed) {
      setErrors((prev) => ({ ...prev, termsAgreed: 'Please accept the GDG Guidelines & Code of Conduct.' }));
      sound.playTone(280, 'sawtooth', 0.15, 0.08);
      return;
    }

    setIsSubmitting(true);
    sound.playClick();

    let appId = storage.generateApplicationId();
    let submittedPayload = {
      ...formData,
      applicationId: appId,
      submittedAt: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    };

    // Post to secure MongoDB Atlas backend (dynamically relative for Vercel & local proxy)
    try {
      const apiEndpoint = import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api/register`
        : '/api/register';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const result = await response.json();
        if (result.applicationId) {
          appId = result.applicationId;
          submittedPayload.applicationId = appId;
        }
      }
    } catch (apiErr) {
      console.warn('API call offline or failed, falling back to resilient local storage:', apiErr.message);
    }

    storage.saveSubmission(submittedPayload);
    storage.clearDraft();

    setSubmittedData(submittedPayload);
    setIsSubmitting(false);

    // Trigger multi-stream confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#FFFFFF']
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853']
      });
    }, 200);
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853']
      });
    }, 350);

    sound.playSuccess();
  };

  // Calculate dynamic step completion progress based on required fields in active step
  const calculateStepProgress = (step, data) => {
    if (step === 1) {
      let count = 0;
      if (data.fullName && data.fullName.trim().length >= 2) count++;
      if (data.universityEmail && data.universityEmail.trim().includes('@') && data.universityEmail.trim().length >= 5) count++;
      if (data.personalEmail && data.personalEmail.trim().includes('@') && data.personalEmail.trim().length >= 5) count++;
      if (data.phone && data.phone.trim().length >= 10) count++;
      if (data.course && data.course.trim().length >= 2) count++;
      if (data.yearSemester && data.yearSemester.trim().length >= 1) count++;
      if (data.section && data.section.trim().length >= 1) count++;
      return count / 7;
    }
    if (step === 2) {
      let count = 0;
      if (data.selectedDomains && data.selectedDomains.length >= 1) count++;
      if (data.firstPreference && data.firstPreference.trim().length >= 1) count++;
      if (data.whyThisTeam && data.whyThisTeam.trim().length >= 20) count++;
      return count / 3;
    }
    if (step === 3) {
      let count = 0;
      if (data.domainExperience && data.domainExperience.trim().length >= 1) count++;
      if (data.toolsTech && data.toolsTech.trim().length >= 2) count++;
      if (data.projectsShared && data.projectsShared.trim().length >= 10) count++;
      if (data.proudestAchievement && data.proudestAchievement.trim().length >= 10) count++;
      return count / 4;
    }
    if (step === 4) {
      let count = 0;
      if (data.gdgMeaning && data.gdgMeaning.trim().length >= 15) count++;
      if (data.googleTechs && data.googleTechs.length >= 1) count++;
      return count / 2;
    }
    if (step === 5) {
      let count = 0;
      if (data.weeklyTime && data.weeklyTime.trim().length >= 1) count++;
      if (data.outsideEventContribution && data.outsideEventContribution.trim().length >= 1) count++;
      if (data.teamDeadlines && data.teamDeadlines.trim().length >= 1) count++;
      if (data.ownershipWillingness && data.ownershipWillingness.trim().length >= 1) count++;
      return count / 4;
    }
    if (step === 6) {
      let count = 0;
      if (data.whySelectYou && data.whySelectYou.trim().length >= 25) count++;
      if (data.changeCampusCommunities && data.changeCampusCommunities.trim().length >= 15) count++;
      return count / 2;
    }
    if (step === 7) {
      return data.termsAgreed ? 1 : 0;
    }
    return 0;
  };

  const activeStepProgress = calculateStepProgress(currentStep, formData);

  const handleResetApplication = () => {
    setSubmittedData(null);
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(1);
    setErrors({});
    window.location.reload();
  };

  return (
    <div className="gdg-app-root">
      {/* GSAP Keyboard Arrow Keys to GDG Logo Intro Preloader */}
      {showIntro && <IntroAssembly onComplete={handleIntroComplete} />}

      {/* Pixelated Google & Chrome Dino Background Canvas */}
      <PixelGoogleBackground />

      {/* Official Navigation Header with Centered Larger Logos and Jumping GDG */}
      <Navbar />

      {/* Floating Right Hand Side Panel: Vertical Flow of Saved Status & Music SFX Toggle */}
      <RightSidePanel lastSaved={lastSaved} />

      <main className="portal-page-body">
        <div className="portal-container">
          {!submittedData ? (
            <>
              {/* Elevated Hero Typography */}
              <div className="portal-hero-block">
                <h1 className="hero-main-title">
                  Build the Future with{' '}
                  <span className="hero-word-gdg">GDG</span>{' '}
                  <span className="hero-word-amity">Amity</span>
                </h1>

                <p className="hero-lead-text">
                  Join the official Google Developer Group community at Amity University Noida. 
                  Select your domain, showcase your craft, and build industry-grade products alongside fellow developers.
                </p>
              </div>

              {/* Dino Progress Timeline with real-time field completion movement */}
              <DinoTimeline
                currentStep={currentStep}
                totalSteps={totalSteps}
                stepProgress={activeStepProgress}
                onStepClick={jumpToStep}
              />

              {/* Active Step Card */}
              <div ref={formCardRef} className="form-card-container">
                {/* STEP 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="step-pane">
                    <div className="step-header">
                      <span className="step-tag">STEP 01 OF 07</span>
                      <h2 className="step-heading">Basic Information</h2>
                      <p className="step-subtitle">Please enter your personal contact and academic details.</p>
                    </div>

                    <div className="form-fields-grid">
                      <div className="col-span-12">
                        <ElasticStringInput
                          label="Full Name"
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => updateField('fullName', e.target.value)}
                          placeholder="e.g. Aarav Sharma"
                          icon={<User size={16} />}
                          required
                          error={errors.fullName}
                        />
                      </div>

                      <div className="col-span-6">
                        <ElasticStringInput
                          label="University Email ID"
                          id="universityEmail"
                          type="email"
                          value={formData.universityEmail}
                          onChange={(e) => updateField('universityEmail', e.target.value)}
                          placeholder="e.g. student@s.amity.edu"
                          icon={<Mail size={16} />}
                          required
                          hint="Official Amity student email ID"
                          error={errors.universityEmail}
                        />
                      </div>

                      <div className="col-span-6">
                        <ElasticStringInput
                          label="Personal Email ID"
                          id="personalEmail"
                          type="email"
                          value={formData.personalEmail}
                          onChange={(e) => updateField('personalEmail', e.target.value)}
                          placeholder="e.g. aarav.dev@gmail.com"
                          icon={<Mail size={16} />}
                          required
                          hint="For communication and invitations"
                          error={errors.personalEmail}
                        />
                      </div>

                      <div className="col-span-6">
                        <ElasticStringInput
                          label="Phone Number"
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          placeholder="9876543210"
                          prefix="+91"
                          icon={<Phone size={16} />}
                          required
                          maxLength={10}
                          hint="WhatsApp enabled contact number"
                          error={errors.phone}
                        />
                      </div>

                      <div className="col-span-6">
                        <label className="elastic-label">
                          Course / Degree <span className="req-star">*</span>
                        </label>
                        <select
                          className="creative-select"
                          value={formData.course}
                          onChange={(e) => updateField('course', e.target.value)}
                        >
                          <option value="">-- Select Course / Degree --</option>
                          <option value="B.Tech Computer Science & Engineering (CSE)">B.Tech CSE</option>
                          <option value="B.Tech CSE (AI & ML)">B.Tech CSE (AI & ML)</option>
                          <option value="B.Tech Information Technology (IT)">B.Tech IT</option>
                          <option value="B.Tech CSE (Data Science)">B.Tech CSE (Data Science)</option>
                          <option value="BCA (Bachelor of Computer Applications)">BCA</option>
                          <option value="MCA (Master of Computer Applications)">MCA</option>
                          <option value="B.Tech Electronics & Communication (ECE)">B.Tech ECE</option>
                          <option value="B.Sc / M.Sc Computer Science">B.Sc / M.Sc Computer Science</option>
                          <option value="Other Engineering / Degree">Other Engineering / Degree</option>
                        </select>
                        {errors.course && <div className="input-error-text">{errors.course}</div>}
                      </div>

                      <div className="col-span-6">
                        <label className="elastic-label">
                          Year & Semester <span className="req-star">*</span>
                        </label>
                        <select
                          className="creative-select"
                          value={formData.yearSemester}
                          onChange={(e) => updateField('yearSemester', e.target.value)}
                        >
                          <option value="">-- Select Year & Semester --</option>
                          <option value="1st Year • Semester 1">1st Year • Semester 1</option>
                          <option value="1st Year • Semester 2">1st Year • Semester 2</option>
                          <option value="2nd Year • Semester 3">2nd Year • Semester 3</option>
                          <option value="2nd Year • Semester 4">2nd Year • Semester 4</option>
                          <option value="3rd Year • Semester 5">3rd Year • Semester 5</option>
                          <option value="3rd Year • Semester 6">3rd Year • Semester 6</option>
                          <option value="4th Year • Semester 7">4th Year • Semester 7</option>
                          <option value="4th Year • Semester 8">4th Year • Semester 8</option>
                          <option value="Postgraduate (1st/2nd Year)">Postgraduate (1st/2nd Year)</option>
                        </select>
                        {errors.yearSemester && <div className="input-error-text">{errors.yearSemester}</div>}
                      </div>

                      <div className="col-span-6">
                        <ElasticStringInput
                          label="Section"
                          id="section"
                          value={formData.section}
                          onChange={(e) => updateField('section', e.target.value)}
                          placeholder="e.g. 1CSE2, 3BCA1"
                          required
                          error={errors.section}
                        />
                      </div>

                      <div className="col-span-4">
                        <ElasticStringInput
                          label="LinkedIn Profile"
                          id="linkedin"
                          type="url"
                          value={formData.linkedin}
                          onChange={(e) => updateField('linkedin', e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          icon={<LinkedinIcon />}
                        />
                      </div>

                      <div className="col-span-4">
                        <ElasticStringInput
                          label="GitHub Profile"
                          id="github"
                          type="url"
                          value={formData.github}
                          onChange={(e) => updateField('github', e.target.value)}
                          placeholder="https://github.com/username"
                          icon={<GithubIcon />}
                        />
                      </div>

                      <div className="col-span-4">
                        <ElasticStringInput
                          label="Portfolio / Website"
                          id="portfolio"
                          type="url"
                          value={formData.portfolio}
                          onChange={(e) => updateField('portfolio', e.target.value)}
                          placeholder="https://yourportfolio.dev"
                          icon={<Globe size={15} />}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Team Preference */}
                {currentStep === 2 && (
                  <div className="step-pane">
                    <div className="step-header">
                      <span className="step-tag">STEP 02 OF 07</span>
                      <h2 className="step-heading">Team Preference</h2>
                      <p className="step-subtitle">Which domain/team are you interested in joining?</p>
                    </div>

                    <DomainSelector
                      selectedDomains={formData.selectedDomains}
                      firstPreference={formData.firstPreference}
                      whyThisTeam={formData.whyThisTeam}
                      onChangeDomains={(domains) => updateField('selectedDomains', domains)}
                      onChangeFirstPreference={(pref) => updateField('firstPreference', pref)}
                      onChangeWhyThisTeam={(text) => updateField('whyThisTeam', text)}
                      errorDomain={errors.domain}
                      errorFirstPreference={errors.firstPreference}
                      errorWhyThisTeam={errors.whyThisTeam}
                    />
                  </div>
                )}

                {/* STEP 3: Experience & Technical Background */}
                {currentStep === 3 && (
                  <div className="step-pane">
                    <div className="step-header">
                      <span className="step-tag">STEP 03 OF 07</span>
                      <h2 className="step-heading">Experience & Technical Background</h2>
                      <p className="step-subtitle">Tell us about your hands-on journey, tooling, and projects.</p>
                    </div>

                    <div className="space-y-6">
                      <ExperienceGauge
                        value={formData.domainExperience}
                        onChange={(val) => updateField('domainExperience', val)}
                        error={errors.domainExperience}
                      />

                      <div className="form-group mt-5">
                        <ElasticStringInput
                          label="What tools/technologies do you currently work with?"
                          id="toolsTech"
                          value={formData.toolsTech}
                          onChange={(e) => updateField('toolsTech', e.target.value)}
                          placeholder="e.g. React, Next.js, Python, TensorFlow, Figma, Docker, Flutter, etc."
                          required
                          hint="Comma separated list of your preferred tech stack or software"
                          error={errors.toolsTech}
                        />
                      </div>

                      <div className="form-group mt-5">
                        <label className="section-sub-heading">
                          Share 1–3 projects, designs, events, posts, campaigns, etc. that you've worked on. <span className="req-star">*</span>
                        </label>
                        <p className="section-sub-desc">Provide links (GitHub, Behance, Drive, Live URL) + a brief summary for each.</p>
                        <textarea
                          className="creative-textarea mt-2"
                          rows={4}
                          value={formData.projectsShared}
                          onChange={(e) => updateField('projectsShared', e.target.value)}
                          placeholder="Project 1: Campus Navigation App (GitHub link) - Built pathfinding in React Native...&#10;Project 2: Hackathon Brand Identity (Behance link)..."
                        />
                        {errors.projectsShared && <div className="input-error-banner">{errors.projectsShared}</div>}
                      </div>

                      {/* Prior Organization Experience */}
                      <div className="form-group mt-5">
                        <label className="section-sub-heading">
                          Have you previously been part of a technical/community/student organization? <span className="req-star">*</span>
                        </label>
                        <div className="pill-choice-row mt-2">
                          {['Yes', 'No'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              className={`pill-choice-btn ${formData.pastOrgExperience === opt ? 'is-selected' : ''}`}
                              onClick={() => {
                                sound.playClick();
                                updateField('pastOrgExperience', opt);
                              }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Conditional if Yes */}
                      {formData.pastOrgExperience === 'Yes' && (
                        <div className="conditional-card animate-fade-in">
                          <ElasticStringInput
                            label="Organization Name"
                            id="pastOrgName"
                            value={formData.pastOrgName}
                            onChange={(e) => updateField('pastOrgName', e.target.value)}
                            placeholder="e.g. ACM Amity, IEEE, Design Club, Enactus"
                            required
                            error={errors.pastOrgName}
                          />

                          <div className="mt-3">
                            <ElasticStringInput
                              label="Your Role"
                              id="pastOrgRole"
                              value={formData.pastOrgRole}
                              onChange={(e) => updateField('pastOrgRole', e.target.value)}
                              placeholder="e.g. Frontend Lead, Event Coordinator, Graphic Designer"
                              required
                              error={errors.pastOrgRole}
                            />
                          </div>

                          <div className="mt-3">
                            <label className="elastic-label">
                              What did you actually contribute? <span className="req-star">*</span>
                            </label>
                            <textarea
                              className="creative-textarea"
                              rows={3}
                              value={formData.pastOrgContribution}
                              onChange={(e) => updateField('pastOrgContribution', e.target.value)}
                              placeholder="Explain specific initiatives, workshops organized, or code contributed..."
                            />
                            {errors.pastOrgContribution && <div className="input-error-banner">{errors.pastOrgContribution}</div>}
                          </div>
                        </div>
                      )}

                      {/* Tell us about something you are proud of */}
                      <div className="form-group mt-5">
                        <div className="label-counter-row">
                          <label className="section-sub-heading">
                            Tell us about something you built, organized, designed or solved that you're genuinely proud of. What was YOUR contribution? <span className="req-star">*</span>
                          </label>
                          <span className="char-badge">{formData.proudestAchievement.length} chars</span>
                        </div>
                        <p className="section-sub-desc">Be candid and specific about your personal role in solving it.</p>
                        <textarea
                          className="creative-textarea mt-2"
                          rows={4}
                          value={formData.proudestAchievement}
                          onChange={(e) => updateField('proudestAchievement', e.target.value)}
                          placeholder="A situation where you built something remarkable or solved a roadblock..."
                        />
                        {errors.proudestAchievement && <div className="input-error-banner">{errors.proudestAchievement}</div>}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: GDG & Google Alignment */}
                {currentStep === 4 && (
                  <div className="step-pane">
                    <div className="step-header">
                      <span className="step-tag">STEP 04 OF 07</span>
                      <h2 className="step-heading">GDG & Google Alignment</h2>
                      <p className="step-subtitle">Your connection to the Google Developer Group developer ecosystem.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="form-group">
                        <div className="label-counter-row">
                          <label className="section-sub-heading">
                            What does GDG mean to you? <span className="req-star">*</span>
                          </label>
                          <span className="char-badge">{formData.gdgMeaning.length} chars</span>
                        </div>
                        <textarea
                          className="creative-textarea mt-2"
                          rows={3}
                          value={formData.gdgMeaning}
                          onChange={(e) => updateField('gdgMeaning', e.target.value)}
                          placeholder="GDG to me represents collaborative peer-to-peer learning, open source exploration, and building impactful community projects..."
                        />
                        {errors.gdgMeaning && <div className="input-error-banner">{errors.gdgMeaning}</div>}
                      </div>

                      <div className="mt-5">
                        <GoogleTechCloud
                          selected={formData.googleTechs}
                          otherText={formData.googleTechOther}
                          onToggle={(techId) => {
                            const cur = formData.googleTechs;
                            const next = cur.includes(techId)
                              ? cur.filter((t) => t !== techId)
                              : [...cur, techId];
                            updateField('googleTechs', next);
                          }}
                          onChangeOther={(val) => updateField('googleTechOther', val)}
                          error={errors.googleTechs}
                        />
                      </div>

                      <div className="form-group mt-5">
                        <label className="section-sub-heading">
                          Have you attended a GDG/GDSC/Google developer event before? <span className="req-star">*</span>
                        </label>
                        <div className="pill-choice-row mt-2">
                          {['Yes', 'No'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              className={`pill-choice-btn ${formData.attendedGdgBefore === opt ? 'is-selected' : ''}`}
                              onClick={() => {
                                sound.playClick();
                                updateField('attendedGdgBefore', opt);
                              }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {formData.attendedGdgBefore === 'Yes' && (
                        <div className="conditional-card animate-fade-in">
                          <label className="elastic-label">
                            What did you take away from it? <span className="req-star">*</span>
                          </label>
                          <textarea
                            className="creative-textarea"
                            rows={3}
                            value={formData.gdgTakeaway}
                            onChange={(e) => updateField('gdgTakeaway', e.target.value)}
                            placeholder="Share which event you attended, speaker sessions, or key learnings..."
                          />
                          {errors.gdgTakeaway && <div className="input-error-banner">{errors.gdgTakeaway}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 5: Commitment & Fit */}
                {currentStep === 5 && (
                  <div className="step-pane">
                    <div className="step-header">
                      <span className="step-tag">STEP 05 OF 07</span>
                      <h2 className="step-heading">Commitment & Fit</h2>
                      <p className="step-subtitle">A great developer community relies on consistent teamwork and accountability.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="form-group">
                        <label className="section-sub-heading">
                          How much time can you realistically contribute per week? <span className="req-star">*</span>
                        </label>
                        <div className="time-cards-grid mt-3">
                          {[
                            { val: '1–2 hours', badge: 'Light Support' },
                            { val: '3–5 hours', badge: 'Recommended' },
                            { val: '5–8 hours', badge: 'Active Core' },
                            { val: '8+ hours', badge: 'Leadership' }
                          ].map((item) => (
                            <button
                              key={item.val}
                              type="button"
                              className={`time-card-btn ${formData.weeklyTime === item.val ? 'is-selected' : ''}`}
                              onClick={() => {
                                sound.playClick();
                                updateField('weeklyTime', item.val);
                              }}
                            >
                              <strong className="time-val-title">{item.val}</strong>
                              <span className="time-val-badge">{item.badge}</span>
                            </button>
                          ))}
                        </div>
                        {errors.weeklyTime && <div className="input-error-banner">{errors.weeklyTime}</div>}
                      </div>

                      <div className="form-group mt-5">
                        <label className="section-sub-heading">
                          Are you comfortable contributing outside event days when required? <span className="req-star">*</span>
                        </label>
                        <div className="pill-choice-row mt-2">
                          {['Yes', 'Sometimes', 'No'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              className={`pill-choice-btn ${formData.outsideEventContribution === opt ? 'is-selected' : ''}`}
                              onClick={() => {
                                sound.playClick();
                                updateField('outsideEventContribution', opt);
                              }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        {errors.outsideEventContribution && <div className="input-error-banner">{errors.outsideEventContribution}</div>}
                      </div>

                      <div className="form-group mt-5">
                        <label className="section-sub-heading">
                          Are you comfortable working in a team with deadlines? <span className="req-star">*</span>
                        </label>
                        <div className="pill-choice-row mt-2">
                          {['Yes', 'No'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              className={`pill-choice-btn ${formData.teamDeadlines === opt ? 'is-selected' : ''}`}
                              onClick={() => {
                                sound.playClick();
                                updateField('teamDeadlines', opt);
                              }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        {errors.teamDeadlines && <div className="input-error-banner">{errors.teamDeadlines}</div>}
                      </div>

                      <div className="form-group mt-5">
                        <label className="section-sub-heading">
                          Are you willing to take ownership of tasks instead of only attending events? <span className="req-star">*</span>
                        </label>
                        <div className="pill-choice-row mt-2">
                          {['Yes', 'No'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              className={`pill-choice-btn ${formData.ownershipWillingness === opt ? 'is-selected' : ''}`}
                              onClick={() => {
                                sound.playClick();
                                updateField('ownershipWillingness', opt);
                              }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        {errors.ownershipWillingness && <div className="input-error-banner">{errors.ownershipWillingness}</div>}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: The Deciding Questions (Selection Pitch) */}
                {currentStep === 6 && (
                  <div className="step-pane">
                    <div className="step-header">
                      <span className="step-tag">STEP 06 OF 07</span>
                      <h2 className="step-heading">The Deciding Questions</h2>
                      <p className="step-subtitle">This is your moment to stand out through proof of execution and fresh vision.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="form-group">
                        <div className="creative-pitch-callout">
                          <div className="pitch-callout-icon">✨</div>
                          <div>
                            <strong className="text-gray-900 font-bold block">Why should we select YOU for GDG Amity? <span className="req-star">*</span></strong>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                              Skip generic buzzwords like "hardworking" or "passionate". Show us real proof: a project you built, a technical obstacle you overcame, or an initiative you organized.
                            </p>
                          </div>
                        </div>

                        <div className="label-counter-row mt-3">
                          <span className={`input-hint-text font-medium ${formData.whySelectYou.length >= 30 ? 'text-emerald-600' : 'text-gray-500'}`}>
                            {formData.whySelectYou.length >= 30 ? '✓ Minimum length satisfied' : `Minimum 30 characters (${Math.max(0, 30 - formData.whySelectYou.length)} more needed)`}
                          </span>
                          <span className="char-badge">{formData.whySelectYou.length} chars</span>
                        </div>

                        <textarea
                          className="creative-textarea mt-1"
                          rows={5}
                          value={formData.whySelectYou}
                          onChange={(e) => updateField('whySelectYou', e.target.value)}
                          placeholder="Talk about a project you shipped, a tricky bug you resolved under pressure, or an initiative you led from scratch..."
                        />
                        {errors.whySelectYou && <div className="input-error-banner">{errors.whySelectYou}</div>}
                      </div>

                      <div className="form-group mt-5">
                        <div className="label-counter-row">
                          <label className="section-sub-heading">
                            If you could change ONE thing about technical communities on campus, what would it be? <span className="req-star">*</span>
                          </label>
                          <span className="char-badge">{formData.changeCampusCommunities.length} chars</span>
                        </div>
                        <p className="section-sub-desc">Be candid — whether it’s hands-on project building, inclusivity, mentorship, or peer hackathons.</p>

                        {/* Quick Idea Starter Chips */}
                        <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                          {['Hands-on Hackathons', 'Open Source Culture', 'Peer Mentorship', 'Beginner Inclusivity', 'Industry Dev Workshops'].map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-medium px-2.5 py-1 rounded-full border border-gray-200 transition-colors"
                              onClick={() => {
                                sound.playClick();
                                const current = formData.changeCampusCommunities.trim();
                                const addition = current ? `${current}, particularly focusing on ${chip.toLowerCase()}` : `I would like to improve ${chip.toLowerCase()}`;
                                updateField('changeCampusCommunities', addition);
                              }}
                            >
                              + {chip}
                            </button>
                          ))}
                        </div>

                        <textarea
                          className="creative-textarea mt-1"
                          rows={4}
                          value={formData.changeCampusCommunities}
                          onChange={(e) => updateField('changeCampusCommunities', e.target.value)}
                          placeholder="Share your authentic perspective on what tech culture at Amity needs most..."
                        />
                        {errors.changeCampusCommunities && <div className="input-error-banner">{errors.changeCampusCommunities}</div>}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 7: Review & Confirm */}
                {currentStep === 7 && (
                  <div className="step-pane">
                    <div className="step-header">
                      <span className="step-tag">STEP 07 OF 07</span>
                      <h2 className="step-heading">Review & Confirm Application</h2>
                      <p className="step-subtitle">Review all your entered details before locking in your GDG registration.</p>
                    </div>

                    <div className="review-cards-list">
                      {/* Section 1 */}
                      <div className="review-card-box">
                        <div className="review-card-head">
                          <h4>1. Basic Information</h4>
                          <button type="button" className="btn-edit-section" onClick={() => jumpToStep(1)}>
                            <FileEdit size={13} /> Edit
                          </button>
                        </div>
                        <div className="review-fields-grid">
                          <div><span className="lbl">Name:</span> <strong className="val">{formData.fullName}</strong></div>
                          <div><span className="lbl">Univ Email:</span> <strong className="val">{formData.universityEmail}</strong></div>
                          <div><span className="lbl">Personal Email:</span> <strong className="val">{formData.personalEmail}</strong></div>
                          <div><span className="lbl">Phone:</span> <strong className="val">{formData.phone}</strong></div>
                          <div><span className="lbl">Course:</span> <strong className="val">{formData.course}</strong></div>
                          <div><span className="lbl">Year & Sem:</span> <strong className="val">{formData.yearSemester}</strong></div>
                          <div><span className="lbl">Section:</span> <strong className="val">{formData.section}</strong></div>
                          {formData.linkedin && <div><span className="lbl">LinkedIn:</span> <a href={formData.linkedin} target="_blank" rel="noreferrer" className="val link">{formData.linkedin}</a></div>}
                          {formData.github && <div><span className="lbl">GitHub:</span> <a href={formData.github} target="_blank" rel="noreferrer" className="val link">{formData.github}</a></div>}
                        </div>
                      </div>

                      {/* Section 2 */}
                      <div className="review-card-box">
                        <div className="review-card-head">
                          <h4>2. Team & Domain Preference</h4>
                          <button type="button" className="btn-edit-section" onClick={() => jumpToStep(2)}>
                            <FileEdit size={13} /> Edit
                          </button>
                        </div>
                        <div className="review-fields-grid">
                          <div><span className="lbl">Selected Domains:</span> <strong className="val">{formData.selectedDomains.join(', ')}</strong></div>
                          <div><span className="lbl">1st Preference:</span> <strong className="val text-blue-600">{formData.firstPreference}</strong></div>
                          <div className="col-span-full"><span className="lbl">Why this team:</span> <p className="val mt-1">{formData.whyThisTeam}</p></div>
                        </div>
                      </div>

                      {/* Section 3 */}
                      <div className="review-card-box">
                        <div className="review-card-head">
                          <h4>3. Experience & Projects</h4>
                          <button type="button" className="btn-edit-section" onClick={() => jumpToStep(3)}>
                            <FileEdit size={13} /> Edit
                          </button>
                        </div>
                        <div className="review-fields-grid">
                          <div><span className="lbl">Skill Level:</span> <strong className="val">{formData.domainExperience}</strong></div>
                          <div><span className="lbl">Tools / Tech:</span> <strong className="val">{formData.toolsTech}</strong></div>
                          <div className="col-span-full"><span className="lbl">Projects:</span> <p className="val mt-1">{formData.projectsShared}</p></div>
                          {formData.pastOrgExperience === 'Yes' && (
                            <div className="col-span-full">
                              <span className="lbl">Prior Org:</span>
                              <strong className="val"> {formData.pastOrgName} ({formData.pastOrgRole})</strong>
                              <p className="val mt-1">{formData.pastOrgContribution}</p>
                            </div>
                          )}
                          <div className="col-span-full"><span className="lbl">Proudest Achievement:</span> <p className="val mt-1">{formData.proudestAchievement}</p></div>
                        </div>
                      </div>

                      {/* Section 4 & 5 */}
                      <div className="review-card-box">
                        <div className="review-card-head">
                          <h4>4 & 5. Community Alignment & Commitment</h4>
                          <button type="button" className="btn-edit-section" onClick={() => jumpToStep(4)}>
                            <FileEdit size={13} /> Edit
                          </button>
                        </div>
                        <div className="review-fields-grid">
                          <div><span className="lbl">Weekly Hours:</span> <strong className="val">{formData.weeklyTime}</strong></div>
                          <div><span className="lbl">Outside Events:</span> <strong className="val">{formData.outsideEventContribution}</strong></div>
                          <div><span className="lbl">Deadlines:</span> <strong className="val">{formData.teamDeadlines}</strong></div>
                          <div><span className="lbl">Task Ownership:</span> <strong className="val">{formData.ownershipWillingness}</strong></div>
                          <div className="col-span-full"><span className="lbl">Google Tech:</span> <strong className="val">{formData.googleTechs.join(', ')}</strong></div>
                        </div>
                      </div>

                      {/* Section 6 */}
                      <div className="review-card-box">
                        <div className="review-card-head">
                          <h4>6. Pitch & Campus Vision</h4>
                          <button type="button" className="btn-edit-section" onClick={() => jumpToStep(6)}>
                            <FileEdit size={13} /> Edit
                          </button>
                        </div>
                        <div className="review-fields-grid">
                          <div className="col-span-full"><span className="lbl">Why select YOU:</span> <p className="val mt-1">{formData.whySelectYou}</p></div>
                          <div className="col-span-full"><span className="lbl">Campus Change:</span> <p className="val mt-1">{formData.changeCampusCommunities}</p></div>
                        </div>
                      </div>
                    </div>

                    {/* Guidelines & Terms Agreement */}
                    <div className="terms-card mt-5">
                      <label className="terms-checkbox-row">
                        <input
                          type="checkbox"
                          checked={formData.termsAgreed}
                          onChange={(e) => updateField('termsAgreed', e.target.checked)}
                        />
                        <span className="terms-statement">
                          I certify that all details provided are accurate and truthful. I understand and agree that this information will be accessed by the GDG Amity community members and organizers, and may be used for event communications, community updates, and promotional or marketing activities.
                        </span>
                      </label>
                      {errors.termsAgreed && <div className="input-error-banner mt-2">{errors.termsAgreed}</div>}
                    </div>
                  </div>
                )}

                {/* Bottom Navigation Buttons */}
                <div className="form-card-footer">
                  <div className="footer-left">
                    {currentStep > 1 && (
                      <button type="button" className="btn-nav-back" onClick={handlePrev}>
                        <ArrowLeft size={16} /> Back
                      </button>
                    )}
                  </div>

                  <div className="footer-center">
                    <span className="step-counter-text">
                      Step {currentStep} of {totalSteps}
                    </span>
                  </div>

                  <div className="footer-right">
                    {currentStep < totalSteps ? (
                      <button type="button" className="btn-nav-next" onClick={handleNext}>
                        <span>Continue</span> <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-nav-submit"
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                      >
                        {isSubmitting ? (
                          <span>Submitting...</span>
                        ) : (
                          <>
                            <Send size={16} />
                            <span>Lock & Submit Application</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Digital Candidate Pass Screen */
            <CandidatePass submission={submittedData} onReset={handleResetApplication} />
          )}
        </div>
      </main>
    </div>
  );
}
