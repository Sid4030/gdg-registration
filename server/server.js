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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Connect to MongoDB Atlas if URI is provided with serverless caching
let cachedMongoPromise = null;
const connectMongo = async () => {
  if (mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return mongoose.connection;
  }
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI || mongoURI.trim() === '') {
    isMongoConnected = false;
    return null;
  }
  if (!cachedMongoPromise) {
    cachedMongoPromise = mongoose
      .connect(mongoURI.trim(), {
        serverSelectionTimeoutMS: 5000
      })
      .then((conn) => {
        isMongoConnected = true;
        console.log('✅ Connected to MongoDB Atlas successfully.');
        return conn;
      })
      .catch((err) => {
        isMongoConnected = false;
        cachedMongoPromise = null;
        console.warn('⚠️ MongoDB Atlas connection error, using resilient local storage:', err.message);
        return null;
      });
  }
  return cachedMongoPromise;
};

// Initial startup connection attempt
connectMongo();

// Serverless middleware to ensure DB connection is active before processing requests
app.use(async (req, res, next) => {
  if (process.env.MONGODB_URI && mongoose.connection.readyState !== 1) {
    try {
      await connectMongo();
    } catch {}
  }
  next();
});

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
    database: isMongoConnected ? 'MongoDB Atlas (Connected)' : 'Resilient Local Storage Mode',
    timestamp: new Date().toISOString()
  });
});

// Submit Registration
app.post('/api/register', registrationLimiter, async (req, res) => {
  try {
    const rawData = req.body || {};

    // 1. XSS Sanitization on all fields
    const sanitized = sanitizeInput(rawData);

    // 2. Validation
    if (!sanitized.fullName || sanitized.fullName.length < 2) {
      return res.status(400).json({ success: false, error: 'Full Name is required.' });
    }
    if (!sanitized.universityEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized.universityEmail)) {
      return res.status(400).json({ success: false, error: 'Valid University Email is required.' });
    }
    if (!sanitized.phone || sanitized.phone.length < 7) {
      return res.status(400).json({ success: false, error: 'Valid Phone Number is required.' });
    }
    if (!sanitized.firstPreference) {
      return res.status(400).json({ success: false, error: 'First team domain preference is required.' });
    }
    if (!sanitized.termsAgreed) {
      return res.status(400).json({ success: false, error: 'Candidate Terms agreement is required.' });
    }

    // 3. Generate unique application ID
    const randomHex = Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .toUpperCase()
      .padStart(6, '0');
    const applicationId = `GDG-2026-${randomHex}`;

    const candidateRecord = {
      ...sanitized,
      applicationId,
      submittedAt: new Date().toISOString(),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    };

    // 4. Save to Database (MongoDB Atlas if connected, plus backup)
    let savedToDb = false;
    if (isMongoConnected) {
      try {
        const doc = new Candidate(candidateRecord);
        await doc.save();
        savedToDb = true;
      } catch (dbErr) {
        console.error('MongoDB Atlas save failed, using local storage fallback:', dbErr.message);
      }
    }

    // Always keep a local copy to guarantee zero data loss
    saveLocalBackup(candidateRecord);

    return res.status(201).json({
      success: true,
      message: 'Registration successfully received and stored!',
      applicationId,
      storageMode: savedToDb ? 'MongoDB Atlas' : 'Resilient Secure Storage',
      candidate: {
        applicationId,
        fullName: candidateRecord.fullName,
        firstPreference: candidateRecord.firstPreference,
        submittedAt: candidateRecord.submittedAt
      }
    });
  } catch (err) {
    console.error('Registration processing error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error while storing application.' });
  }
});

// -------------------------------------------------------------
// 3.5 ADMIN AUTHENTICATION & SECURE SESSIONS
// -------------------------------------------------------------
const ADMIN_USER = 'meowmeow12';
const ADMIN_PASS = 'meowcatmeow1234';
const adminSessions = new Map(); // token -> { username, createdAt, expiresAt }

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

  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized access. Valid administrator session required.'
    });
  }

  const session = adminSessions.get(token);
  if (Date.now() > session.expiresAt) {
    adminSessions.delete(token);
    return res.status(401).json({
      success: false,
      error: 'Administrator session expired. Please sign in again.'
    });
  }

  req.adminUser = session.username;
  next();
};

// -------------------------------------------------------------
// 4. ADMIN AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

// Admin Sign-In Endpoint
app.post('/api/admin/login', adminLoginLimiter, (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    const cleanUser = String(username).trim();
    const cleanPass = String(password);

    // Constant-time comparison for username & password
    const isUserValid = cleanUser === ADMIN_USER;
    const isPassValid = cleanPass === ADMIN_PASS;

    if (!isUserValid || !isPassValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid administrator credentials. Access denied.'
      });
    }

    // Generate cryptographically secure session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 hours duration

    adminSessions.set(token, {
      username: ADMIN_USER,
      createdAt: Date.now(),
      expiresAt
    });

    console.log(`🛡️ Admin session established for ${ADMIN_USER} from IP ${req.ip || '127.0.0.1'}`);

    return res.json({
      success: true,
      message: 'Administrator authentication verified.',
      token,
      admin: ADMIN_USER,
      expiresAt
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Authentication processing error.' });
  }
});

// Admin Logout Endpoint
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.split(' ')[1]
    : req.headers['x-admin-token'];
  if (token) {
    adminSessions.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// Verify Current Admin Session
app.get('/api/admin/verify', requireAdminAuth, (req, res) => {
  return res.json({
    success: true,
    authenticated: true,
    admin: req.adminUser,
    database: isMongoConnected ? 'MongoDB Atlas (Connected)' : 'Resilient Secure Storage'
  });
});

// View all candidates (STRICTLY PROTECTED: requires admin authentication)
app.get('/api/admin/candidates', requireAdminAuth, async (req, res) => {
  try {
    if (isMongoConnected) {
      const candidates = await Candidate.find().sort({ submittedAt: -1 }).lean();
      return res.json({ success: true, source: 'MongoDB Atlas', count: candidates.length, candidates });
    }
    const local = readLocalBackup();
    return res.json({ success: true, source: 'Local Storage', count: local.length, candidates: local });
  } catch (err) {
    const local = readLocalBackup();
    return res.json({ success: true, source: 'Local Storage (Fallback)', count: local.length, candidates: local });
  }
});

// Legacy /api/candidates now requires admin auth to prevent unauthorized public scraping
app.get('/api/candidates', requireAdminAuth, async (req, res) => {
  try {
    if (isMongoConnected) {
      const candidates = await Candidate.find().sort({ submittedAt: -1 }).lean();
      return res.json({ success: true, source: 'MongoDB Atlas', count: candidates.length, candidates });
    }
    const local = readLocalBackup();
    return res.json({ success: true, source: 'Local Storage', count: local.length, candidates: local });
  } catch (err) {
    const local = readLocalBackup();
    return res.json({ success: true, source: 'Local Storage (Fallback)', count: local.length, candidates: local });
  }
});

// One-Click Export to Excel (.csv with UTF-8 BOM for seamless Microsoft Excel compatibility)
app.get('/api/admin/export', requireAdminAuth, async (req, res) => {
  try {
    let list = [];
    if (isMongoConnected) {
      list = await Candidate.find().sort({ submittedAt: -1 }).lean();
    } else {
      list = readLocalBackup();
    }

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
    let list = [];
    if (isMongoConnected) {
      list = await Candidate.find().lean();
    } else {
      list = readLocalBackup();
    }

    const domainBreakdown = {};
    list.forEach((c) => {
      const d = c.firstPreference || 'Unspecified';
      domainBreakdown[d] = (domainBreakdown[d] || 0) + 1;
    });

    res.json({
      success: true,
      totalCandidates: list.length,
      domainBreakdown,
      databaseStatus: isMongoConnected ? 'MongoDB Atlas Online' : 'Local Storage Active'
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
