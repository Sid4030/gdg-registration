import React, { useState, useEffect, useMemo } from 'react';
import {
  Lock,
  Shield,
  Download,
  LogOut,
  Search,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Database,
  ChevronRight,
  X,
  FileSpreadsheet,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import { sound } from '../utils/sound';

const API_BASE = import.meta.env.VITE_API_URL || '';

const getStoredToken = () => {
  try {
    return localStorage.getItem('gdg_admin_token') || sessionStorage.getItem('gdg_admin_token') || '';
  } catch {
    return '';
  }
};

const getStoredAdmin = () => {
  try {
    return localStorage.getItem('gdg_admin_user') || sessionStorage.getItem('gdg_admin_user') || '';
  } catch {
    return '';
  }
};

export default function AdminPortal() {
  const [token, setToken] = useState(getStoredToken);
  const [adminUser, setAdminUser] = useState(getStoredAdmin);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [candidates, setCandidates] = useState([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('All');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [databaseSource, setDatabaseSource] = useState('Secure Database');

  // Verify existing token on initial mount
  useEffect(() => {
    const existing = getStoredToken();
    if (existing) {
      verifyToken(existing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyToken = async (tok) => {
    if (!tok) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/verify`, {
        headers: { Authorization: `Bearer ${tok}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDatabaseSource(data.database || 'Database Online');
        fetchCandidates(tok);
      } else if (res.status === 401) {
        handleLogout();
      } else {
        // Non-401 errors (e.g. temporary server glitch) should not log out the admin
        fetchCandidates(tok);
      }
    } catch {
      fetchCandidates(tok);
    }
  };

  const fetchCandidates = async (tok = token) => {
    if (!tok) return;
    setIsLoadingCandidates(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/candidates`, {
        headers: { Authorization: `Bearer ${tok}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
        if (data.source) setDatabaseSource(data.source);
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error('Failed to load candidate applications:', err);
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!usernameInput.trim() || !passwordInput) {
      setLoginError('Please enter both username and password.');
      return;
    }

    setIsLoggingIn(true);
    sound.playClick();

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput.trim(),
          password: passwordInput
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('gdg_admin_token', data.token);
        localStorage.setItem('gdg_admin_user', data.admin);
        sessionStorage.setItem('gdg_admin_token', data.token);
        sessionStorage.setItem('gdg_admin_user', data.admin);
        setToken(data.token);
        setAdminUser(data.admin);
        setPasswordInput('');
        sound.playSnap();
        fetchCandidates(data.token);
      } else {
        setLoginError(data.error || 'Invalid credentials. Access denied.');
      }
    } catch {
      setLoginError('Unable to connect to authentication server. Please ensure backend is running.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sound.playClick();
    if (token) {
      fetch(`${API_BASE}/api/admin/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    localStorage.removeItem('gdg_admin_token');
    localStorage.removeItem('gdg_admin_user');
    sessionStorage.removeItem('gdg_admin_token');
    sessionStorage.removeItem('gdg_admin_user');
    setToken('');
    setAdminUser('');
    setCandidates([]);
    setSelectedCandidate(null);
  };

  const handleExportExcel = async () => {
    if (!token) return;
    setIsExporting(true);
    sound.playClick();

    try {
      const res = await fetch(`${API_BASE}/api/admin/export`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Export request failed.');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gdg_amity_candidates_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      sound.playSnap();
    } catch (err) {
      alert('Failed to export candidate records: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Filtered Candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesDomain =
        selectedDomainFilter === 'All' || c.firstPreference === selectedDomainFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (c.fullName && c.fullName.toLowerCase().includes(q)) ||
        (c.universityEmail && c.universityEmail.toLowerCase().includes(q)) ||
        (c.applicationId && c.applicationId.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.firstPreference && c.firstPreference.toLowerCase().includes(q));

      return matchesDomain && matchesSearch;
    });
  }, [candidates, selectedDomainFilter, searchQuery]);

  // Unique domains list for filtering
  const allDomains = useMemo(() => {
    const set = new Set();
    candidates.forEach((c) => {
      if (c.firstPreference) set.add(c.firstPreference);
    });
    return Array.from(set);
  }, [candidates]);

  // -------------------------------------------------------------
  // VIEW 1: ADMIN LOGIN SCREEN (Clean Google Material 3 Security)
  // -------------------------------------------------------------
  if (!token) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-card-header">
            <div className="admin-shield-icon-wrap">
              <Shield size={28} className="text-blue-600" />
            </div>
            <h1 className="admin-header-title">GDG Amity • Administrator Console</h1>
            <p className="admin-header-subtitle">
              Secure server-side access to stored candidate registrations & exports.
            </p>
          </div>

          {loginError && (
            <div className="admin-error-banner" role="alert">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="admin-field-group">
              <label htmlFor="admin-username" className="admin-field-label">
                Admin Username
              </label>
              <div className="admin-input-wrap">
                <User size={16} className="admin-input-icon" />
                <input
                  id="admin-username"
                  type="text"
                  className="admin-input-text"
                  placeholder="Enter administrator username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="admin-field-group">
              <label htmlFor="admin-password" className="admin-field-label">
                Password
              </label>
              <div className="admin-input-wrap">
                <Lock size={16} className="admin-input-icon" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  className="admin-input-text"
                  placeholder="Enter administrator password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="admin-toggle-pwd-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="admin-btn-primary" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <span>Authenticating with Server...</span>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Sign In to Admin Console</span>
                </>
              )}
            </button>
          </form>

          <div className="admin-footer-links">
            <a href="/" className="admin-back-link">
              ← Return to Candidate Registration Portal
            </a>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD COMMAND CENTER
  // -------------------------------------------------------------
  return (
    <div className="admin-dashboard-container">
      {/* Top Navigation Bar */}
      <header className="admin-top-navbar">
        <div className="admin-nav-left">
          <div className="admin-brand-lockup">
            <span className="admin-brand-pill">GDG Amity</span>
            <span className="admin-brand-divider">/</span>
            <span className="admin-brand-section">Admin Command Center</span>
          </div>
          <div className="admin-db-status-badge">
            <Database size={13} className="text-emerald-500" />
            <span>{databaseSource}</span>
          </div>
        </div>

        <div className="admin-nav-right">
          <span className="admin-user-pill">
            <User size={13} />
            <span>{adminUser}</span>
          </span>

          <a href="/" target="_blank" rel="noreferrer" className="admin-portal-link" title="Open Public Portal">
            <span>View Portal</span>
            <ExternalLink size={13} />
          </a>

          <button type="button" className="admin-logout-btn" onClick={handleLogout} title="Sign Out">
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="admin-main-content">
        {/* Metric Cards Banner */}
        <section className="admin-stats-grid">
          <div className="admin-metric-card">
            <div className="metric-icon-wrap bg-blue-50 text-blue-600">
              <User size={22} />
            </div>
            <div>
              <p className="metric-label">Total Candidate Registrations</p>
              <h3 className="metric-value">{candidates.length}</h3>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="metric-icon-wrap bg-emerald-50 text-emerald-600">
              <Layers size={22} />
            </div>
            <div>
              <p className="metric-label">Specialized Domain Teams</p>
              <h3 className="metric-value">{allDomains.length}</h3>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="metric-icon-wrap bg-amber-50 text-amber-600">
              <Award size={22} />
            </div>
            <div>
              <p className="metric-label">Current Filter Results</p>
              <h3 className="metric-value">{filteredCandidates.length}</h3>
            </div>
          </div>
        </section>

        {/* Action Controls & Export Bar */}
        <section className="admin-action-bar">
          <div className="admin-search-wrapper">
            <Search size={16} className="admin-search-icon" />
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by name, email, application ID, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="admin-clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="admin-filter-export-group">
            <div className="admin-domain-select-wrap">
              <Filter size={14} className="admin-filter-icon" />
              <select
                className="admin-domain-select"
                value={selectedDomainFilter}
                onChange={(e) => setSelectedDomainFilter(e.target.value)}
              >
                <option value="All">All Domains ({candidates.length})</option>
                {allDomains.map((d) => (
                  <option key={d} value={d}>
                    {d} ({candidates.filter((c) => c.firstPreference === d).length})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="admin-btn-refresh"
              onClick={() => fetchCandidates()}
              disabled={isLoadingCandidates}
              title="Refresh candidate records from database"
            >
              <RefreshCw size={15} className={isLoadingCandidates ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            {/* ONE-CLICK EXCEL EXPORT BUTTON */}
            <button
              type="button"
              className="admin-btn-excel-export"
              onClick={handleExportExcel}
              disabled={isExporting || candidates.length === 0}
              title="Download Excel spreadsheet with all application responses"
            >
              <FileSpreadsheet size={16} />
              <span>{isExporting ? 'Generating Excel...' : 'Export to Excel (.csv)'}</span>
            </button>
          </div>
        </section>

        {/* Candidate Applications Table */}
        <section className="admin-table-container">
          {isLoadingCandidates ? (
            <div className="admin-loading-state">
              <RefreshCw size={24} className="animate-spin text-blue-600 mb-2" />
              <p>Fetching encrypted registrations from server...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="admin-empty-state">
              <AlertCircle size={32} className="text-gray-400 mb-2" />
              <h4>No matching candidate applications found</h4>
              <p className="text-sm text-gray-500">
                {searchQuery || selectedDomainFilter !== 'All'
                  ? 'Try clearing your search query or domain filter.'
                  : 'New candidate applications will automatically appear here once submitted.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Application ID</th>
                    <th>Candidate Name</th>
                    <th>University Email</th>
                    <th>Phone</th>
                    <th>Primary Domain</th>
                    <th>Year & Sem</th>
                    <th>Submitted At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((c) => (
                    <tr
                      key={c.applicationId}
                      className={selectedCandidate?.applicationId === c.applicationId ? 'is-selected-row' : ''}
                      onClick={() => {
                        sound.playClick();
                        setSelectedCandidate(c);
                      }}
                    >
                      <td>
                        <span className="app-id-tag">{c.applicationId}</span>
                      </td>
                      <td>
                        <strong className="text-gray-900">{c.fullName}</strong>
                      </td>
                      <td className="text-gray-600 font-mono text-xs">{c.universityEmail}</td>
                      <td className="text-gray-600 text-xs">{c.phone}</td>
                      <td>
                        <span className="domain-pill-badge">{c.firstPreference}</span>
                      </td>
                      <td className="text-xs text-gray-600">{c.yearSemester || c.course}</td>
                      <td className="text-xs text-gray-500">
                        {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : 'Recent'}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-inspect-candidate"
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playClick();
                            setSelectedCandidate(c);
                          }}
                        >
                          <span>Inspect</span>
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Candidate Full Detail Drawer Modal */}
      {selectedCandidate && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedCandidate(null)}>
          <div className="admin-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-sheet-header">
              <div>
                <span className="modal-app-id">{selectedCandidate.applicationId}</span>
                <h2 className="modal-candidate-name">{selectedCandidate.fullName}</h2>
                <p className="modal-domain-sub">{selectedCandidate.firstPreference} • {selectedCandidate.course}</p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedCandidate(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-sheet-body">
              {/* Contact & Academics */}
              <div className="modal-section-card">
                <h4 className="modal-card-title">1. Contact & Academic Details</h4>
                <div className="modal-grid-2">
                  <div><span className="m-lbl">University Email:</span> <strong className="m-val">{selectedCandidate.universityEmail}</strong></div>
                  <div><span className="m-lbl">Personal Email:</span> <strong className="m-val">{selectedCandidate.personalEmail || '—'}</strong></div>
                  <div><span className="m-lbl">Phone Number:</span> <strong className="m-val">{selectedCandidate.phone}</strong></div>
                  <div><span className="m-lbl">Year & Semester:</span> <strong className="m-val">{selectedCandidate.yearSemester}</strong></div>
                  <div><span className="m-lbl">Section:</span> <strong className="m-val">{selectedCandidate.section || '—'}</strong></div>
                  <div><span className="m-lbl">IP Address:</span> <strong className="m-val text-xs font-mono">{selectedCandidate.ipAddress || '127.0.0.1'}</strong></div>
                </div>

                <div className="modal-links-row mt-3">
                  {selectedCandidate.linkedin && (
                    <a href={selectedCandidate.linkedin} target="_blank" rel="noreferrer" className="modal-link-chip">
                      <span>LinkedIn Profile</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                  {selectedCandidate.github && (
                    <a href={selectedCandidate.github} target="_blank" rel="noreferrer" className="modal-link-chip">
                      <span>GitHub Profile</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                  {selectedCandidate.portfolio && (
                    <a href={selectedCandidate.portfolio} target="_blank" rel="noreferrer" className="modal-link-chip">
                      <span>Portfolio Website</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>

              {/* Team & Domain Preferences */}
              <div className="modal-section-card">
                <h4 className="modal-card-title">2. Team & Domain Preferences</h4>
                <p className="text-sm">
                  <span className="m-lbl">Primary Preference:</span>{' '}
                  <span className="domain-pill-badge">{selectedCandidate.firstPreference}</span>
                </p>
                {selectedCandidate.selectedDomains && (
                  <p className="text-sm mt-2">
                    <span className="m-lbl">All Selected Teams:</span>{' '}
                    <strong>{Array.isArray(selectedCandidate.selectedDomains) ? selectedCandidate.selectedDomains.join(', ') : selectedCandidate.selectedDomains}</strong>
                  </p>
                )}
                {selectedCandidate.whyThisTeam && (
                  <div className="mt-2.5">
                    <span className="m-lbl">Why this team:</span>
                    <p className="m-essay-box">{selectedCandidate.whyThisTeam}</p>
                  </div>
                )}
              </div>

              {/* Technical Experience & Projects */}
              <div className="modal-section-card">
                <h4 className="modal-card-title">3. Experience, Tools & Prior Contributions</h4>
                <div className="modal-grid-2">
                  <div><span className="m-lbl">Self-Assessed Skill:</span> <strong className="m-val">{selectedCandidate.domainExperience || '—'}</strong></div>
                  <div><span className="m-lbl">Tools & Tech:</span> <strong className="m-val">{selectedCandidate.toolsTech || '—'}</strong></div>
                </div>

                {selectedCandidate.projectsShared && (
                  <div className="mt-2.5">
                    <span className="m-lbl">Projects & Code Repositories:</span>
                    <p className="m-essay-box">{selectedCandidate.projectsShared}</p>
                  </div>
                )}

                {selectedCandidate.pastOrgExperience === 'Yes' && (
                  <div className="mt-2.5">
                    <span className="m-lbl">Prior Organization / Society:</span>
                    <strong className="block text-gray-900 text-sm mt-0.5">
                      {selectedCandidate.pastOrgName} ({selectedCandidate.pastOrgRole})
                    </strong>
                    <p className="m-essay-box mt-1">{selectedCandidate.pastOrgContribution}</p>
                  </div>
                )}

                {selectedCandidate.proudestAchievement && (
                  <div className="mt-2.5">
                    <span className="m-lbl">Proudest Achievement:</span>
                    <p className="m-essay-box">{selectedCandidate.proudestAchievement}</p>
                  </div>
                )}
              </div>

              {/* Deciding Questions (The Pitch) */}
              <div className="modal-section-card bg-blue-50/40 border-blue-200">
                <h4 className="modal-card-title text-blue-900">⚡ The Deciding Selection Answers</h4>
                {selectedCandidate.whySelectYou && (
                  <div className="mt-2">
                    <span className="m-lbl text-blue-800">Why should we select YOU for GDG Amity?</span>
                    <p className="m-essay-box bg-white border-blue-200 font-medium text-gray-900">
                      {selectedCandidate.whySelectYou}
                    </p>
                  </div>
                )}

                {selectedCandidate.changeCampusCommunities && (
                  <div className="mt-3">
                    <span className="m-lbl text-blue-800">What would you change about campus technical communities?</span>
                    <p className="m-essay-box bg-white border-blue-200 text-gray-800">
                      {selectedCandidate.changeCampusCommunities}
                    </p>
                  </div>
                )}
              </div>

              {/* Alignment & Availability */}
              <div className="modal-section-card">
                <h4 className="modal-card-title">4. Commitment & Ecosystem Alignment</h4>
                <div className="modal-grid-2">
                  <div><span className="m-lbl">Weekly Commitment:</span> <strong className="m-val">{selectedCandidate.weeklyTime || '—'}</strong></div>
                  <div><span className="m-lbl">Outside Events Work:</span> <strong className="m-val">{selectedCandidate.outsideEventContribution || '—'}</strong></div>
                  <div><span className="m-lbl">Deadlines Comfort:</span> <strong className="m-val">{selectedCandidate.teamDeadlines || '—'}</strong></div>
                  <div><span className="m-lbl">Task Ownership:</span> <strong className="m-val">{selectedCandidate.ownershipWillingness || '—'}</strong></div>
                </div>

                {selectedCandidate.googleTechs && (
                  <div className="mt-2.5">
                    <span className="m-lbl">Google Tech of Interest:</span>
                    <strong className="block text-gray-800 text-sm mt-0.5">
                      {Array.isArray(selectedCandidate.googleTechs) ? selectedCandidate.googleTechs.join(', ') : selectedCandidate.googleTechs}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
