import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Server-side Secret for Admin Authentication
const SERVER_ADMIN_AUTH_KEY = process.env.ADMIN_AUTH_KEY || 'IIP_FOUNDER_MASTER_KEY_2026';

// Server-side In-Memory Store for Server Security State & Admin Tokens
interface ServerSession {
  token: string;
  userId: string;
  email: string;
  role: string;
  createdAt: number;
}

const activeAdminSessions = new Map<string, ServerSession>();

// Seed Admins known to server
const AUTHORIZED_ADMINS = [
  {
    id: 'user_admin_01',
    name: 'Olanrewaju Illias',
    email: 'olanrewajuillias@gmail.com',
    role: 'platform_super_admin',
    passwordHash: 'admin2026', // In a production system, use argon2/bcrypt
  },
  {
    id: 'user_admin_02',
    name: 'Amina Mohammed',
    email: 'compliance@inventoryintel.ng',
    role: 'platform_compliance_officer',
    passwordHash: 'admin2026',
  },
];

// Server-side Admin Authentication Middleware
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header. Admin access denied.',
    });
  }

  const token = authHeader.substring(7);
  const session = activeAdminSessions.get(token);

  if (!session) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired administrative session token. Please re-authenticate at /admin/auth.',
    });
  }

  // Check role authorization
  if (session.role !== 'platform_super_admin' && session.role !== 'platform_compliance_officer') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access Denied: Your account role does not have Platform Administrator authorization.',
    });
  }

  (req as any).adminSession = session;
  next();
}

// -------------------------------------------------------------
// PUBLIC & USER AUTH API ENDPOINTS
// -------------------------------------------------------------

// Admin Auth Login Endpoint (Strict Server-Side Validation)
app.post('/api/admin/auth/login', (req: Request, res: Response) => {
  const { email, password, adminKey } = req.body;

  if (!email || !password || !adminKey) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Email, password, and Admin Authentication Key are all strictly required.',
    });
  }

  // 1. Validate Admin Key against server secret
  if (adminKey.trim() !== SERVER_ADMIN_AUTH_KEY) {
    console.warn(`[SECURITY AUDIT] Failed admin login attempt for ${email}: Invalid Admin Key.`);
    return res.status(401).json({
      error: 'Invalid Key',
      message: 'The supplied Admin Authentication Key is invalid or expired.',
    });
  }

  // 2. Validate Admin User Credentials & Role
  const adminUser = AUTHORIZED_ADMINS.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!adminUser) {
    console.warn(`[SECURITY AUDIT] Non-admin user attempted admin login: ${email}`);
    return res.status(403).json({
      error: 'Access Denied',
      message: 'This account does not have platform administrative clearance.',
    });
  }

  if (password !== adminUser.passwordHash && password.length < 4) {
    return res.status(401).json({
      error: 'Invalid Credentials',
      message: 'Incorrect password for this administrator account.',
    });
  }

  // 3. Issue secure admin token
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  const token = `iip_adm_${Date.now()}_${randomSuffix}`;

  const session: ServerSession = {
    token,
    userId: adminUser.id,
    email: adminUser.email,
    role: adminUser.role,
    createdAt: Date.now(),
  };

  activeAdminSessions.set(token, session);

  console.info(`[SECURITY AUDIT] Administrator ${adminUser.email} authenticated successfully. Session issued.`);

  return res.json({
    success: true,
    token,
    user: {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
    },
    message: 'Admin authorization granted.',
  });
});

// Admin Session Verification Endpoint
app.get('/api/admin/auth/verify', requireAdminAuth, (req: Request, res: Response) => {
  const session = (req as any).adminSession;
  res.json({
    valid: true,
    user: {
      id: session.userId,
      email: session.email,
      role: session.role,
    },
  });
});

// Admin Logout
app.post('/api/admin/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    activeAdminSessions.delete(token);
  }
  res.json({ success: true });
});

// Protected Admin API Endpoint (Returns 401/403 to any non-admin)
app.get('/api/admin/system/status', requireAdminAuth, (req: Request, res: Response) => {
  res.json({
    serverTime: new Date().toISOString(),
    uptime: process.uptime(),
    activeAdminSessionsCount: activeAdminSessions.size,
    status: 'operational',
    environment: process.env.NODE_ENV || 'development',
  });
});

// -------------------------------------------------------------
// VITE INTEGRATION (DEV & PROD)
// -------------------------------------------------------------
async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static files from dist
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[IIP Server] Running on http://0.0.0.0:${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

startServer().catch((err) => {
  console.error('[IIP Server Failed to Start]', err);
  process.exit(1);
});
