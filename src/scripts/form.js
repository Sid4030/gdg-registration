import { animations } from './animations.js';
import { sound } from './sound.js';
import { storage } from './storage.js';

export class FormController {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 7; // Steps 1-6 + Step 7 Review
    this.formData = {
      // Step 1
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

      // Step 2
      selectedDomains: [],
      firstPreference: '',
      whyThisTeam: '',

      // Step 3
      domainExperience: '',
      toolsTech: '',
      projectsShared: '',
      pastOrgExperience: 'No',
      pastOrgName: '',
      pastOrgRole: '',
      pastOrgContribution: '',
      proudestAchievement: '',

      // Step 4
      gdgMeaning: '',
      googleTechs: [],
      googleTechOther: '',
      attendedGdgBefore: 'No',
      gdgTakeaway: '',

      // Step 5
      weeklyTime: '',
      outsideEventContribution: '',
      teamDeadlines: '',
      ownershipWillingness: '',

      // Step 6
      whySelectYou: '',
      changeCampusCommunities: '',

      // Metadata
      applicationId: '',
      submittedAt: ''
    };

    this.init();
  }

  init() {
    this.bindDomEvents();
    this.loadSavedDraft();
    this.updateStepperUI();
    this.updateStepVisibility();
  }

  bindDomEvents() {
    // Nav buttons
    const prevBtn = document.getElementById('btn-prev-step');
    const nextBtn = document.getElementById('btn-next-step');
    const submitBtn = document.getElementById('btn-submit-application');
    const saveDraftBtn = document.getElementById('btn-save-draft');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        sound.playPrev();
        this.goToStep(this.currentStep - 1, -1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.validateCurrentStep()) {
          sound.playNext();
          this.goToStep(this.currentStep + 1, 1);
        }
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.handleFinalSubmit());
    }

    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => {
        this.saveCurrentDraft(true);
      });
    }

    // Domain selection checkboxes (max 2)
    const domainCheckboxes = document.querySelectorAll('input[name="domains"]');
    domainCheckboxes.forEach((cb) => {
      cb.addEventListener('change', (e) => this.handleDomainChange(e));
    });

    // Conditional radio: Past Organization Experience
    const pastOrgRadios = document.querySelectorAll('input[name="pastOrgExperience"]');
    pastOrgRadios.forEach((radio) => {
      radio.addEventListener('change', (e) => {
        const val = e.target.value;
        this.formData.pastOrgExperience = val;
        const group = document.getElementById('past-org-details-group');
        if (group) {
          animations.animateAccordion(group, val === 'Yes');
        }
        this.saveCurrentDraft();
      });
    });

    // Conditional radio: Attended GDG event before
    const attendedRadios = document.querySelectorAll('input[name="attendedGdgBefore"]');
    attendedRadios.forEach((radio) => {
      radio.addEventListener('change', (e) => {
        const val = e.target.value;
        this.formData.attendedGdgBefore = val;
        const group = document.getElementById('gdg-takeaway-group');
        if (group) {
          animations.animateAccordion(group, val === 'Yes');
        }
        this.saveCurrentDraft();
      });
    });

    // Google Tech checkboxes & Other field
    const techCheckboxes = document.querySelectorAll('input[name="googleTechs"]');
    const techOtherInput = document.getElementById('googleTechOtherInput');
    techCheckboxes.forEach((cb) => {
      cb.addEventListener('change', (e) => {
        if (cb.value === 'Other' && techOtherInput) {
          techOtherInput.style.display = cb.checked ? 'block' : 'none';
          if (cb.checked) techOtherInput.focus();
        }
        this.saveCurrentDraft();
      });
    });

    // Auto-save on general input changes with debounce
    let saveTimeout;
    const form = document.getElementById('gdg-registration-form');
    if (form) {
      form.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => this.saveCurrentDraft(), 600);
        this.updateCharCounters();
      });
    }

    // Stepper header click navigation (for completed steps)
    const stepIndicators = document.querySelectorAll('.stepper-node');
    stepIndicators.forEach((node) => {
      node.addEventListener('click', () => {
        const targetStep = parseInt(node.getAttribute('data-step'), 10);
        if (targetStep < this.currentStep) {
          sound.playPrev();
          this.goToStep(targetStep, -1);
        } else if (targetStep > this.currentStep) {
          // Check if previous steps valid
          if (this.validateCurrentStep()) {
            sound.playNext();
            this.goToStep(targetStep, 1);
          }
        }
      });
    });
  }

  handleDomainChange(e) {
    const checked = Array.from(document.querySelectorAll('input[name="domains"]:checked')).map(
      (c) => c.value
    );

    if (checked.length > 2) {
      e.target.checked = false;
      const card = e.target.closest('.domain-pill');
      if (card) animations.shakeField(card);
      this.showToast('You can select a maximum of 2 domains/teams.', 'warning');
      return;
    }

    sound.playClick();
    this.formData.selectedDomains = checked;

    // Update count indicator
    const counterEl = document.getElementById('domain-selected-count');
    if (counterEl) {
      counterEl.textContent = `${checked.length} of 2 selected`;
      counterEl.className = checked.length === 2 ? 'badge-full' : 'badge-count';
    }

    // Refresh First Preference Options
    this.updateFirstPreferenceOptions();
    this.saveCurrentDraft();
  }

  updateFirstPreferenceOptions() {
    const container = document.getElementById('first-preference-container');
    const select = document.getElementById('firstPreference');
    if (!container || !select) return;

    const domains = this.formData.selectedDomains;

    if (domains.length === 0) {
      container.style.display = 'none';
      select.innerHTML = '<option value="">-- Please select your domains above first --</option>';
      this.formData.firstPreference = '';
      return;
    }

    container.style.display = 'block';
    select.innerHTML = '<option value="">-- Choose your primary domain --</option>';

    domains.forEach((d) => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      if (d === this.formData.firstPreference || domains.length === 1) {
        opt.selected = true;
        this.formData.firstPreference = d;
      }
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      this.formData.firstPreference = e.target.value;
      this.saveCurrentDraft();
    });
  }

  updateCharCounters() {
    const counterFields = [
      { id: 'whyThisTeam', max: 500, counterId: 'whyThisTeam-count' },
      { id: 'proudestAchievement', max: 600, counterId: 'proudestAchievement-count' },
      { id: 'gdgMeaning', max: 400, counterId: 'gdgMeaning-count' },
      { id: 'whySelectYou', max: 700, counterId: 'whySelectYou-count' },
      { id: 'changeCampusCommunities', max: 500, counterId: 'changeCampusCommunities-count' }
    ];

    counterFields.forEach(({ id, counterId }) => {
      const el = document.getElementById(id);
      const cnt = document.getElementById(counterId);
      if (el && cnt) {
        cnt.textContent = `${el.value.length} characters`;
      }
    });
  }

  goToStep(stepNumber, direction = 1) {
    if (stepNumber < 1 || stepNumber > this.totalSteps) return;

    const currentEl = document.getElementById(`step-card-${this.currentStep}`);
    const nextEl = document.getElementById(`step-card-${stepNumber}`);

    if (!currentEl || !nextEl) return;

    this.currentStep = stepNumber;
    this.updateStepperUI();

    animations.animateStepTransition(currentEl, nextEl, direction, () => {
      if (stepNumber === this.totalSteps) {
        this.populateReviewSummary();
      }
    });
  }

  updateStepperUI() {
    // Update progress bar
    const progressPercent = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
    const bar = document.getElementById('stepper-progress-fill');
    if (bar) {
      bar.style.width = `${progressPercent}%`;
    }

    // Update stepper nodes
    const nodes = document.querySelectorAll('.stepper-node');
    nodes.forEach((node) => {
      const step = parseInt(node.getAttribute('data-step'), 10);
      node.classList.remove('active', 'completed');
      if (step < this.currentStep) {
        node.classList.add('completed');
      } else if (step === this.currentStep) {
        node.classList.add('active');
      }
    });

    // Update bottom navigation bar controls
    const prevBtn = document.getElementById('btn-prev-step');
    const nextBtn = document.getElementById('btn-next-step');
    const submitBtn = document.getElementById('btn-submit-application');
    const trackerText = document.getElementById('step-tracker-label');

    if (prevBtn) {
      prevBtn.style.visibility = this.currentStep === 1 ? 'hidden' : 'visible';
    }

    if (trackerText) {
      trackerText.textContent =
        this.currentStep === this.totalSteps
          ? 'Step 7 of 7 • Final Review'
          : `Step ${this.currentStep} of ${this.totalSteps}`;
    }

    if (this.currentStep === this.totalSteps) {
      if (nextBtn) nextBtn.style.display = 'none';
      if (submitBtn) submitBtn.style.display = 'inline-flex';
    } else {
      if (nextBtn) nextBtn.style.display = 'inline-flex';
      if (submitBtn) submitBtn.style.display = 'none';
    }
  }

  updateStepVisibility() {
    for (let i = 1; i <= this.totalSteps; i++) {
      const el = document.getElementById(`step-card-${i}`);
      if (el) {
        if (i === this.currentStep) {
          el.style.display = 'block';
          el.classList.add('active');
        } else {
          el.style.display = 'none';
          el.classList.remove('active');
        }
      }
    }
  }

  validateCurrentStep() {
    this.collectFormData();
    let isValid = true;
    let firstErrorField = null;

    const setError = (elementId, message) => {
      isValid = false;
      const el = document.getElementById(elementId);
      if (el) {
        if (!firstErrorField) firstErrorField = el;
        animations.shakeField(el);

        const group = el.closest('.form-group') || el.parentElement;
        let errEl = group.querySelector('.field-error-msg');
        if (!errEl) {
          errEl = document.createElement('div');
          errEl.className = 'field-error-msg';
          group.appendChild(errEl);
        }
        errEl.textContent = message;
        errEl.style.display = 'block';
      }
    };

    const clearErrors = (stepEl) => {
      stepEl.querySelectorAll('.field-error-msg').forEach((e) => (e.style.display = 'none'));
    };

    const currentCard = document.getElementById(`step-card-${this.currentStep}`);
    if (currentCard) clearErrors(currentCard);

    if (this.currentStep === 1) {
      // Basic info
      if (!this.formData.fullName.trim()) {
        setError('fullName', 'Please enter your full name.');
      }

      if (!this.formData.universityEmail.trim()) {
        setError('universityEmail', 'University Email ID is required.');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.universityEmail)) {
        setError('universityEmail', 'Please enter a valid email address.');
      }

      if (!this.formData.personalEmail.trim()) {
        setError('personalEmail', 'Personal Email ID is required.');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.personalEmail)) {
        setError('personalEmail', 'Please enter a valid email address.');
      }

      if (!this.formData.phone.trim()) {
        setError('phone', 'Phone Number is required.');
      } else if (!/^[0-9]{10}$/.test(this.formData.phone.replace(/[\s-+]/g, ''))) {
        setError('phone', 'Please enter a valid 10-digit phone number.');
      }

      if (!this.formData.course.trim()) {
        setError('course', 'Please select or enter your Course/Degree.');
      }

      if (!this.formData.yearSemester.trim()) {
        setError('yearSemester', 'Please select your Year & Semester.');
      }

      if (!this.formData.section.trim()) {
        setError('section', 'Please enter your Section.');
      }
    } else if (this.currentStep === 2) {
      // Team Preference
      if (this.formData.selectedDomains.length === 0) {
        setError('domain-grid-container', 'Please select at least 1 domain (up to 2).');
      }

      if (!this.formData.firstPreference) {
        setError('firstPreference', 'Please select your 1st preference domain.');
      }

      if (!this.formData.whyThisTeam.trim() || this.formData.whyThisTeam.trim().length < 20) {
        setError('whyThisTeam', 'Please explain why you are interested in this team (minimum 20 characters).');
      }
    } else if (this.currentStep === 3) {
      // Experience
      if (!this.formData.domainExperience) {
        setError('experience-radios-container', 'Please rate your experience in your selected domain.');
      }

      if (!this.formData.toolsTech.trim()) {
        setError('toolsTech', 'Please list the tools/technologies you work with.');
      }

      if (!this.formData.projectsShared.trim()) {
        setError('projectsShared', 'Please share 1–3 projects, designs, posts or campaigns with links/descriptions.');
      }

      if (this.formData.pastOrgExperience === 'Yes') {
        if (!this.formData.pastOrgName.trim()) {
          setError('pastOrgName', 'Please provide the organization name.');
        }
        if (!this.formData.pastOrgRole.trim()) {
          setError('pastOrgRole', 'Please state your role.');
        }
        if (!this.formData.pastOrgContribution.trim()) {
          setError('pastOrgContribution', 'Please tell us what you contributed.');
        }
      }

      if (!this.formData.proudestAchievement.trim()) {
        setError('proudestAchievement', 'Please share something you are genuinely proud of.');
      }
    } else if (this.currentStep === 4) {
      // GDG & Google
      if (!this.formData.gdgMeaning.trim()) {
        setError('gdgMeaning', 'Please tell us what GDG means to you.');
      }

      if (this.formData.googleTechs.length === 0) {
        setError('google-techs-container', 'Please select at least one Google technology you are interested in.');
      }

      if (this.formData.attendedGdgBefore === 'Yes' && !this.formData.gdgTakeaway.trim()) {
        setError('gdgTakeaway', 'Please share your key takeaway from previous events.');
      }
    } else if (this.currentStep === 5) {
      // Commitment & Fit
      if (!this.formData.weeklyTime) {
        setError('weeklyTime-container', 'Please select your weekly time commitment.');
      }

      if (!this.formData.outsideEventContribution) {
        setError('outsideContribution-container', 'Please answer if you can contribute outside event days.');
      }

      if (!this.formData.teamDeadlines) {
        setError('teamDeadlines-container', 'Please answer if you are comfortable working in a team with deadlines.');
      }

      if (!this.formData.ownershipWillingness) {
        setError('ownership-container', 'Please confirm your willingness to take task ownership.');
      }
    } else if (this.currentStep === 6) {
      // Deciding Questions
      if (!this.formData.whySelectYou.trim() || this.formData.whySelectYou.trim().length < 30) {
        setError('whySelectYou', 'Please show us why we should select you through something you have done (minimum 30 characters).');
      }

      if (!this.formData.changeCampusCommunities.trim()) {
        setError('changeCampusCommunities', 'Please share what one thing you would change about campus communities.');
      }
    }

    if (!isValid && firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.showToast('Please fill out all required fields marked above.', 'error');
    }

    return isValid;
  }

  collectFormData() {
    const getValue = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    const getRadioValue = (name) => {
      const checked = document.querySelector(`input[name="${name}"]:checked`);
      return checked ? checked.value : '';
    };

    const getCheckedValues = (name) => {
      return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(
        (c) => c.value
      );
    };

    // Step 1
    this.formData.fullName = getValue('fullName');
    this.formData.universityEmail = getValue('universityEmail');
    this.formData.personalEmail = getValue('personalEmail');
    this.formData.phone = getValue('phone');
    this.formData.course = getValue('course');
    this.formData.yearSemester = getValue('yearSemester');
    this.formData.section = getValue('section');
    this.formData.linkedin = getValue('linkedin');
    this.formData.github = getValue('github');
    this.formData.portfolio = getValue('portfolio');

    // Step 2
    this.formData.selectedDomains = getCheckedValues('domains');
    this.formData.firstPreference = getValue('firstPreference');
    this.formData.whyThisTeam = getValue('whyThisTeam');

    // Step 3
    this.formData.domainExperience = getRadioValue('domainExperience');
    this.formData.toolsTech = getValue('toolsTech');
    this.formData.projectsShared = getValue('projectsShared');
    this.formData.pastOrgExperience = getRadioValue('pastOrgExperience') || 'No';
    this.formData.pastOrgName = getValue('pastOrgName');
    this.formData.pastOrgRole = getValue('pastOrgRole');
    this.formData.pastOrgContribution = getValue('pastOrgContribution');
    this.formData.proudestAchievement = getValue('proudestAchievement');

    // Step 4
    this.formData.gdgMeaning = getValue('gdgMeaning');
    this.formData.googleTechs = getCheckedValues('googleTechs');
    this.formData.googleTechOther = getValue('googleTechOtherInput');
    this.formData.attendedGdgBefore = getRadioValue('attendedGdgBefore') || 'No';
    this.formData.gdgTakeaway = getValue('gdgTakeaway');

    // Step 5
    this.formData.weeklyTime = getRadioValue('weeklyTime');
    this.formData.outsideEventContribution = getRadioValue('outsideEventContribution');
    this.formData.teamDeadlines = getRadioValue('teamDeadlines');
    this.formData.ownershipWillingness = getRadioValue('ownershipWillingness');

    // Step 6
    this.formData.whySelectYou = getValue('whySelectYou');
    this.formData.changeCampusCommunities = getValue('changeCampusCommunities');
  }

  saveCurrentDraft(showFeedback = false) {
    this.collectFormData();
    const success = storage.saveDraft(this.formData);

    const indicator = document.getElementById('draft-status-indicator');
    if (indicator) {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      indicator.innerHTML = `<span class="draft-dot"></span> Draft saved at ${time}`;
      indicator.classList.add('saved-active');
      setTimeout(() => indicator.classList.remove('saved-active'), 2500);
    }

    if (showFeedback && success) {
      sound.playClick();
      this.showToast('Your progress has been safely saved on this device.', 'success');
    }
  }

  loadSavedDraft() {
    const draft = storage.loadDraft();
    if (!draft || !draft.data) return;

    const data = draft.data;
    Object.assign(this.formData, data);

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.value = val;
    };

    const setRadio = (name, val) => {
      if (!val) return;
      const radio = document.querySelector(`input[name="${name}"][value="${val}"]`);
      if (radio) radio.checked = true;
    };

    const setCheckedGroup = (name, arr) => {
      if (!Array.isArray(arr)) return;
      document.querySelectorAll(`input[name="${name}"]`).forEach((cb) => {
        cb.checked = arr.includes(cb.value);
      });
    };

    // Step 1
    setVal('fullName', data.fullName);
    setVal('universityEmail', data.universityEmail);
    setVal('personalEmail', data.personalEmail);
    setVal('phone', data.phone);
    setVal('course', data.course);
    setVal('yearSemester', data.yearSemester);
    setVal('section', data.section);
    setVal('linkedin', data.linkedin);
    setVal('github', data.github);
    setVal('portfolio', data.portfolio);

    // Step 2
    setCheckedGroup('domains', data.selectedDomains);
    this.updateFirstPreferenceOptions();
    setVal('firstPreference', data.firstPreference);
    setVal('whyThisTeam', data.whyThisTeam);

    const countEl = document.getElementById('domain-selected-count');
    if (countEl && data.selectedDomains) {
      countEl.textContent = `${data.selectedDomains.length} of 2 selected`;
    }

    // Step 3
    setRadio('domainExperience', data.domainExperience);
    setVal('toolsTech', data.toolsTech);
    setVal('projectsShared', data.projectsShared);
    setRadio('pastOrgExperience', data.pastOrgExperience);
    setVal('pastOrgName', data.pastOrgName);
    setVal('pastOrgRole', data.pastOrgRole);
    setVal('pastOrgContribution', data.pastOrgContribution);
    setVal('proudestAchievement', data.proudestAchievement);

    if (data.pastOrgExperience === 'Yes') {
      const group = document.getElementById('past-org-details-group');
      if (group) group.style.display = 'block';
    }

    // Step 4
    setVal('gdgMeaning', data.gdgMeaning);
    setCheckedGroup('googleTechs', data.googleTechs);
    setVal('googleTechOtherInput', data.googleTechOther);
    setRadio('attendedGdgBefore', data.attendedGdgBefore);
    setVal('gdgTakeaway', data.gdgTakeaway);

    if (data.attendedGdgBefore === 'Yes') {
      const group = document.getElementById('gdg-takeaway-group');
      if (group) group.style.display = 'block';
    }

    if (data.googleTechs && data.googleTechs.includes('Other')) {
      const input = document.getElementById('googleTechOtherInput');
      if (input) input.style.display = 'block';
    }

    // Step 5
    setRadio('weeklyTime', data.weeklyTime);
    setRadio('outsideEventContribution', data.outsideEventContribution);
    setRadio('teamDeadlines', data.teamDeadlines);
    setRadio('ownershipWillingness', data.ownershipWillingness);

    // Step 6
    setVal('whySelectYou', data.whySelectYou);
    setVal('changeCampusCommunities', data.changeCampusCommunities);

    this.updateCharCounters();

    const indicator = document.getElementById('draft-status-indicator');
    if (indicator) {
      indicator.innerHTML = `<span class="draft-dot"></span> Draft restored`;
    }
  }

  populateReviewSummary() {
    this.collectFormData();
    const container = document.getElementById('review-summary-content');
    if (!container) return;

    const d = this.formData;

    const renderItem = (label, val) => {
      const cleanVal = val ? (typeof val === 'string' ? val : val.join(', ')) : '<span class="empty-val">—</span>';
      return `
        <div class="review-item">
          <span class="review-label">${label}</span>
          <span class="review-value">${cleanVal}</span>
        </div>
      `;
    };

    container.innerHTML = `
      <div class="review-section-card">
        <div class="review-section-header">
          <h4>1. Basic Information</h4>
          <button type="button" class="btn-review-edit" data-jump-step="1">Edit</button>
        </div>
        <div class="review-grid">
          ${renderItem('Full Name', d.fullName)}
          ${renderItem('University Email', d.universityEmail)}
          ${renderItem('Personal Email', d.personalEmail)}
          ${renderItem('Phone Number', d.phone)}
          ${renderItem('Course / Degree', d.course)}
          ${renderItem('Year & Semester', d.yearSemester)}
          ${renderItem('Section', d.section)}
          ${renderItem('LinkedIn', d.linkedin)}
          ${renderItem('GitHub', d.github)}
          ${renderItem('Portfolio', d.portfolio)}
        </div>
      </div>

      <div class="review-section-card">
        <div class="review-section-header">
          <h4>2. Team & Domain Preference</h4>
          <button type="button" class="btn-review-edit" data-jump-step="2">Edit</button>
        </div>
        <div class="review-grid">
          ${renderItem('Selected Domains', d.selectedDomains)}
          ${renderItem('First Preference', d.firstPreference)}
          ${renderItem('Why this team?', d.whyThisTeam)}
        </div>
      </div>

      <div class="review-section-card">
        <div class="review-section-header">
          <h4>3. Experience & Projects</h4>
          <button type="button" class="btn-review-edit" data-jump-step="3">Edit</button>
        </div>
        <div class="review-grid">
          ${renderItem('Experience Level', d.domainExperience)}
          ${renderItem('Tools & Tech', d.toolsTech)}
          ${renderItem('Shared Projects', d.projectsShared)}
          ${renderItem('Previous Organization', d.pastOrgExperience === 'Yes' ? `${d.pastOrgName} (${d.pastOrgRole})` : 'None')}
          ${d.pastOrgExperience === 'Yes' ? renderItem('Organization Contribution', d.pastOrgContribution) : ''}
          ${renderItem('Proudest Achievement', d.proudestAchievement)}
        </div>
      </div>

      <div class="review-section-card">
        <div class="review-section-header">
          <h4>4. GDG & Google Alignment</h4>
          <button type="button" class="btn-review-edit" data-jump-step="4">Edit</button>
        </div>
        <div class="review-grid">
          ${renderItem('What GDG means', d.gdgMeaning)}
          ${renderItem('Google Tech Interest', d.googleTechs.concat(d.googleTechOther ? [`Other: ${d.googleTechOther}`] : []))}
          ${renderItem('Attended GDG event before?', d.attendedGdgBefore)}
          ${d.attendedGdgBefore === 'Yes' ? renderItem('Event Takeaway', d.gdgTakeaway) : ''}
        </div>
      </div>

      <div class="review-section-card">
        <div class="review-section-header">
          <h4>5. Commitment & Fit</h4>
          <button type="button" class="btn-review-edit" data-jump-step="5">Edit</button>
        </div>
        <div class="review-grid">
          ${renderItem('Weekly Hours', d.weeklyTime)}
          ${renderItem('Outside Event Days?', d.outsideEventContribution)}
          ${renderItem('Deadlines & Teamwork', d.teamDeadlines)}
          ${renderItem('Task Ownership', d.ownershipWillingness)}
        </div>
      </div>

      <div class="review-section-card">
        <div class="review-section-header">
          <h4>6. Pitch & Perspective</h4>
          <button type="button" class="btn-review-edit" data-jump-step="6">Edit</button>
        </div>
        <div class="review-grid">
          ${renderItem('Why select YOU?', d.whySelectYou)}
          ${renderItem('Change 1 thing on campus', d.changeCampusCommunities)}
        </div>
      </div>
    `;

    // Hook edit buttons
    container.querySelectorAll('.btn-review-edit').forEach((btn) => {
      btn.addEventListener('click', () => {
        const step = parseInt(btn.getAttribute('data-jump-step'), 10);
        sound.playPrev();
        this.goToStep(step, -1);
      });
    });
  }

  handleFinalSubmit() {
    const termsCb = document.getElementById('terms-agreement-checkbox');
    if (termsCb && !termsCb.checked) {
      animations.shakeField(termsCb.parentElement);
      this.showToast('Please agree to the GDG Community Guidelines & Code of Conduct.', 'warning');
      return;
    }

    const submitBtn = document.getElementById('btn-submit-application');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        Submitting Application...
      `;
    }

    // Generate credentials
    const appId = storage.generateApplicationId();
    this.formData.applicationId = appId;
    this.formData.submittedAt = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    // Save final submission
    storage.saveSubmission(this.formData);
    storage.clearDraft();

    // Populate Member Pass Card
    this.renderSuccessPass();

    setTimeout(() => {
      animations.animateSubmissionSuccess(() => {
        // Post-submit bindings
        this.bindPassActions();
      });
    }, 700);
  }

  renderSuccessPass() {
    const d = this.formData;
    const nameEl = document.getElementById('pass-candidate-name');
    const idEl = document.getElementById('pass-candidate-id');
    const domainEl = document.getElementById('pass-candidate-domain');
    const emailEl = document.getElementById('pass-candidate-email');
    const courseEl = document.getElementById('pass-candidate-course');
    const dateEl = document.getElementById('pass-candidate-date');

    if (nameEl) nameEl.textContent = d.fullName;
    if (idEl) idEl.textContent = d.applicationId;
    if (domainEl) domainEl.textContent = d.firstPreference || (d.selectedDomains ? d.selectedDomains.join(' & ') : 'General Member');
    if (emailEl) emailEl.textContent = d.universityEmail;
    if (courseEl) courseEl.textContent = `${d.course} • ${d.yearSemester}`;
    if (dateEl) dateEl.textContent = d.submittedAt;
  }

  bindPassActions() {
    const copyBtn = document.getElementById('btn-copy-app-id');
    const printBtn = document.getElementById('btn-print-pass');
    const resetBtn = document.getElementById('btn-new-application');

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(this.formData.applicationId).then(() => {
          sound.playTone(880, 'sine', 0.1, 0.08);
          this.showToast('Application ID copied to clipboard!', 'success');
          copyBtn.textContent = '✓ Copied!';
          setTimeout(() => (copyBtn.textContent = 'Copy Application ID'), 2000);
        });
      });
    }

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        sessionStorage.removeItem('gdg_amity_seen_intro');
        window.location.reload();
      });
    }
  }

  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}
