// LocalStorage draft state & candidate ID generator

const STORAGE_KEY = 'gdg_amity_registration_draft_v2';
const SUBMISSION_KEY = 'gdg_amity_submission_v2';

export const storage = {
  saveDraft(data) {
    try {
      const payload = {
        data,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.warn('Could not save draft:', e);
      return false;
    }
  },

  loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  clearDraft() {
    localStorage.removeItem(STORAGE_KEY);
  },

  saveSubmission(submission) {
    try {
      localStorage.setItem(SUBMISSION_KEY, JSON.stringify(submission));
    } catch (e) {}
  },

  generateApplicationId() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const year = new Date().getFullYear();
    return `GDG-AU-${year}-${rand}`;
  }
};
