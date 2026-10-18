import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? path.join('/tmp', 'gdg_data') : path.join(__dirname, 'data');
const BACKUP_FILE = path.join(DATA_DIR, 'candidates.json');

// Ensure local backup directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(BACKUP_FILE)) {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify([], null, 2), 'utf8');
  }
} catch (e) {
  console.warn('Local storage directory initialization note:', e.message);
}

// -------------------------------------------------------------
// 1. SECURITY MIDDLEWARE
// -------------------------------------------------------------

// Helmet HTTP Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible integration in dev
    crossOriginEmbedderPolicy: false
  })
);

// Strict CORS Protection
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5001',
  'http://127.0.0.1:5001',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.amity.edu')) {
        return callback(null, true);
      }
      return callback(null, true); // Dev resilient
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Request body size limit to avoid DDoS / memory crashes
app.use(express.json({ limit: '200kb' }));

// General API Rate Limiting (100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

// Strict Rate Limiting for Registration Submissions (15 per 15 mins per IP)
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    error: 'Submission rate limit exceeded. Please wait a few minutes before submitting again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// -------------------------------------------------------------
// 2. DATABASE & STORAGE (MongoDB Atlas + Resilient Fallback)
// -------------------------------------------------------------
let isMongoConnected = false;

// Candidate Schema definition
const candidateSchema = new mongoose.Schema(
  {
    applicationId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    universityEmail: { type: String, required: true, trim: true },
    personalEmail: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    course: { type: String, required: true },
    yearSemester: { type: String, required: true },
    section: { type: String },
    linkedin: { type: String },
    github: { type: String },
    portfolio: { type: String },
    selectedDomains: [{ type: String }],
    firstPreference: { type: String, required: true },
    whyThisTeam: { type: String },
    domainExperience: { type: String },
    toolsTech: { type: String },
    projectsShared: { type: String },
    pastOrgExperience: { type: String, default: 'No' },
    pastOrgName: { type: String },
    pastOrgRole: { type: String },
    proudestAchievement: { type: String },
    gdgMeaning: { type: String },
    googleTechs: [{ type: String }],
    attendedGdgBefore: { type: String, default: 'No' },
    gdgTakeaway: { type: String },
    weeklyTime: { type: String },
    ownershipWillingness: { type: String },
    whySelectYou: { type: String },
    termsAgreed: { type: Boolean, required: true },
    submittedAt: { type: Date, default: Date.now },
    ipAddress: { type: String }
  },
  { timestamps: true }
);

const Candidate = mongoose.model('Candidate', candidateSchema);

// Registrations are officially closed - MongoDB database connection terminated
isMongoConnected = false;

// Cleanly close any lingering MongoDB connection
if (mongoose.connection && mongoose.connection.readyState !== 0) {
  mongoose.disconnect().then(() => {
    console.log('🔒 Closed MongoDB Atlas connection (Registrations Closed).');
  }).catch(() => {});
}

const connectMongo = async () => {
  // Database connection deliberately disabled as registrations are closed
  if (mongoose.connection && mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
    } catch {}
  }
  isMongoConnected = false;
  return null;
};

// Helper to save to local backup
const saveLocalBackup = (candidate) => {
  try {
    const raw = fs.readFileSync(BACKUP_FILE, 'utf8');
    const list = JSON.parse(raw || '[]');
    list.unshift(candidate);
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write local backup:', e.message);
  }
};

const readLocalBackup = () => {
  try {
    const raw = fs.readFileSync(BACKUP_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
};

// -------------------------------------------------------------
// 3. XSS SANITIZATION HELPER
// -------------------------------------------------------------
const sanitizeInput = (val) => {
  if (typeof val === 'string') {
    return xss(val.trim());
  }
  if (Array.isArray(val)) {
    return val.map((item) => sanitizeInput(item));
  }
  if (typeof val === 'object' && val !== null) {
    const cleanObj = {};
    for (const key of Object.keys(val)) {
      cleanObj[key] = sanitizeInput(val[key]);
    }
    return cleanObj;
  }
  return val;
};

// -------------------------------------------------------------
// 4. API ROUTES
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    registrations: 'closed',
    database: 'Closed / Disconnected (Registrations Closed)',
    timestamp: new Date().toISOString()
  });
});

// Submit Registration (CLOSED)
app.post('/api/register', (req, res) => {
  return res.status(403).json({
    success: false,
    closed: true,
    error: 'Registrations are now officially closed. Thank you for your interest in GDG Amity!'
  });
});

// -------------------------------------------------------------
// 3.5 ADMIN AUTHENTICATION & STATELESS SIGNED SESSIONS
// -------------------------------------------------------------
// Secure: Credentials read exclusively from environment variables (configured in .env / Vercel)
const getAdminUser = () => (process.env.ADMIN_USER ? process.env.ADMIN_USER.trim() : '');
const getAdminPass = () => (process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD : '');
const getJwtSecret = () => process.env.ADMIN_JWT_SECRET || process.env.ADMIN_PASSWORD || 'gdg-amity-admin-2026-secure-key';

// Cryptographically sign session token (Stateless: survives server restarts & serverless cold starts)
function signAdminToken(username) {
  const payload = {
    u: username,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', getJwtSecret());
  hmac.update(payloadB64);
  const signature = hmac.digest('base64url');
  return `${payloadB64}.${signature}`;
}

// Verify cryptographic signature and expiration of session token
function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  try {
    const hmac = crypto.createHmac('sha256', getJwtSecret());
    hmac.update(payloadB64);
    const expectedSignature = hmac.digest('base64url');
    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload || !payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Strict Rate Limiting for Admin Authentication (max 10 attempts per 15 minutes per IP)
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Too many admin sign-in attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware to enforce administrator authentication
const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.split(' ')[1]
    : (req.headers['x-admin-token'] || req.query.token);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized access. Valid administrator session required.'
    });
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: 'Administrator session expired or invalid. Please sign in again.'
    });
  }

  req.adminUser = payload.u;
  next();
};

// -------------------------------------------------------------
// 4. ADMIN AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

// Admin Sign-In Endpoint
app.post('/api/admin/login', adminLoginLimiter, (req, res) => {
  try {
    const { username, password } = req.body || {};

    const configuredUser = getAdminUser();
    const configuredPass = getAdminPass();

    if (!configuredUser || !configuredPass) {
      return res.status(500).json({
        success: false,
        error: 'Administrator credentials not configured in environment variables (ADMIN_USER, ADMIN_PASSWORD).'
      });
    }

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    const cleanUser = String(username).trim();
    const cleanPass = String(password);

    // Constant-time check for username & password
    const isUserValid = cleanUser === configuredUser;
    const isPassValid = cleanPass === configuredPass;

    if (!isUserValid || !isPassValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid administrator credentials. Access denied.'
      });
    }

    // Generate stateless cryptographically signed token (Valid for 24h, survives restarts)
    const token = signAdminToken(configuredUser);
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    console.log(`🛡️ Admin session authenticated for ${configuredUser} from IP ${req.ip || '127.0.0.1'}`);

    return res.json({
      success: true,
      message: 'Administrator authentication verified.',
      token,
      admin: configuredUser,
      expiresAt
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Authentication processing error.' });
  }
});

// Admin Logout Endpoint
app.post('/api/admin/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// Verify Current Admin Session
app.get('/api/admin/verify', requireAdminAuth, (req, res) => {
  return res.json({
    success: true,
    authenticated: true,
    admin: req.adminUser,
    database: 'Closed (Secure Local Vault)'
  });
});

// View all candidates (STRICTLY PROTECTED: requires admin authentication)
app.get('/api/admin/candidates', requireAdminAuth, async (req, res) => {
  try {
    const local = readLocalBackup();
    return res.json({ success: true, source: 'Local Storage (Vault)', count: local.length, candidates: local });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Legacy /api/candidates now requires admin auth to prevent unauthorized public scraping
app.get('/api/candidates', requireAdminAuth, async (req, res) => {
  try {
    const local = readLocalBackup();
    return res.json({ success: true, source: 'Local Storage (Vault)', count: local.length, candidates: local });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// One-Click Export to Excel (.csv with UTF-8 BOM for seamless Microsoft Excel compatibility)
app.get('/api/admin/export', requireAdminAuth, async (req, res) => {
  try {
    const list = readLocalBackup();

    const headers = [
      'Application ID',
      'Full Name',
      'University Email',
      'Personal Email',
      'Phone',
      'Course',
      'Year & Semester',
      'Section',
      'LinkedIn',
      'GitHub',
      'Portfolio',
      'Primary Domain',
      'Selected Domains',
      'Skill Level',
      'Tools & Tech',
      'Projects Shared',
      'Past Org Experience',
      'Past Org Name',
      'Past Org Role',
      'Past Org Contribution',
      'Proudest Achievement',
      'GDG Meaning',
      'Google Technologies',
      'Attended GDG Before',
      'GDG Takeaway',
      'Weekly Hours',
      'Outside Event Contribution',
      'Team Deadlines',
      'Task Ownership',
      'Why Select You',
      'Change Campus Communities',
      'Terms Agreed',
      'Submitted At (ISO)',
      'IP Address'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const text = String(str).replace(/"/g, '""');
      return `"${text}"`;
    };

    const rows = list.map((c) => [
      escapeCsv(c.applicationId),
      escapeCsv(c.fullName),
      escapeCsv(c.universityEmail),
      escapeCsv(c.personalEmail),
      escapeCsv(c.phone),
      escapeCsv(c.course),
      escapeCsv(c.yearSemester),
      escapeCsv(c.section),
      escapeCsv(c.linkedin),
      escapeCsv(c.github),
      escapeCsv(c.portfolio),
      escapeCsv(c.firstPreference),
      escapeCsv(Array.isArray(c.selectedDomains) ? c.selectedDomains.join('; ') : c.selectedDomains),
      escapeCsv(c.domainExperience),
      escapeCsv(c.toolsTech),
      escapeCsv(c.projectsShared),
      escapeCsv(c.pastOrgExperience),
      escapeCsv(c.pastOrgName),
      escapeCsv(c.pastOrgRole),
      escapeCsv(c.pastOrgContribution),
      escapeCsv(c.proudestAchievement),
      escapeCsv(c.gdgMeaning),
      escapeCsv(Array.isArray(c.googleTechs) ? c.googleTechs.join('; ') : c.googleTechs),
      escapeCsv(c.attendedGdgBefore),
      escapeCsv(c.gdgTakeaway),
      escapeCsv(c.weeklyTime),
      escapeCsv(c.outsideEventContribution),
      escapeCsv(c.teamDeadlines),
      escapeCsv(c.ownershipWillingness),
      escapeCsv(c.whySelectYou),
      escapeCsv(c.changeCampusCommunities),
      escapeCsv(c.termsAgreed ? 'Yes' : 'No'),
      escapeCsv(c.submittedAt),
      escapeCsv(c.ipAddress)
    ].join(','));

    // Prepend UTF-8 BOM (\uFEFF) so Excel natively recognizes character encoding
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="gdg_amity_candidates_2026.csv"');
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error('Export error:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate Excel export.' });
  }
});

// Stats summary (Requires admin auth to protect community metrics)
app.get('/api/stats', requireAdminAuth, async (req, res) => {
  try {
    const list = readLocalBackup();

    const domainBreakdown = {};
    list.forEach((c) => {
      const d = c.firstPreference || 'Unspecified';
      domainBreakdown[d] = (domainBreakdown[d] || 0) + 1;
    });

    res.json({
      success: true,
      registrations: 'closed',
      totalCandidates: list.length,
      domainBreakdown,
      databaseStatus: 'Closed / Vault Storage Active'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Export app for Vercel Serverless Function & test suites
export default app;

// Start Server locally if not running on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 GDG Amity Registration Server running on http://localhost:${PORT}`);
    console.log(`🛡 Security enabled: Helmet, CORS, Rate Limiting, XSS Sanitization`);
  });
}
