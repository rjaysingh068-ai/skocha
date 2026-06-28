import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { readDB, writeDB } from './src/db.ts';
import { Profile, Ad, Transaction } from './src/types.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper password strength checker
  function validatePassword(password: string): boolean {
    if (password.length < 8) return false;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    return hasUpper && hasLower && hasDigit && hasSpecial;
  }

  // Helper word count checker
  function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  // API Routes

  // Privacy Policy Document View
  app.get('/privacy-policy', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - Skocha</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
    .serif {
      font-family: 'Playfair Display', serif;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      body {
        background-color: white !important;
        color: black !important;
      }
      .print-card {
        border: none !important;
        box-shadow: none !important;
        background: transparent !important;
      }
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-200 min-h-screen py-12 px-4 sm:px-6">
  <div class="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-10 print-card">
    
    <!-- Action buttons header -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-6 mb-8 no-print">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-base tracking-tighter shadow-lg shadow-amber-500/20">SK</div>
        <span class="text-lg font-black tracking-widest text-white">SKOCHA</span>
      </div>
      <div class="flex items-center space-x-3">
        <button onclick="window.close()" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer">
          Close Window
        </button>
        <button onclick="window.print()" class="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-md shadow-amber-500/10">
          Print / Save PDF
        </button>
      </div>
    </div>

    <!-- Document Body -->
    <div class="space-y-6 text-slate-300 text-sm leading-relaxed">
      <div class="text-center pb-6 border-b border-slate-800/60">
        <h1 class="serif text-3xl sm:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p class="text-xs text-amber-500 font-mono tracking-wider">Effective Date: June 29, 2026</p>
      </div>

      <p class="text-slate-200 font-light text-base italic">
        Welcome to our website. By accessing or using this platform, you agree to the terms of this Privacy Policy.
      </p>

      <section class="space-y-2">
        <h2 class="text-base font-bold text-white uppercase tracking-wider text-amber-500">About Our Website</h2>
        <p>
          This website is intended to provide information and advertisement services related to Call Girls Services, Adult Meetings, and Escort Services. The website operates only for its intended purpose, and the required official permissions and physical documents related to the platform are maintained by the developer.
        </p>
      </section>

      <section class="space-y-2">
        <h2 class="text-base font-bold text-white uppercase tracking-wider text-amber-500">User Information</h2>
        <p>
          We may collect basic information such as your name, email address, phone number, and other details that you voluntarily provide while using our services. This information is used only for providing and improving our services.
        </p>
        <p>
          We do not sell or share your personal information with unauthorized third parties unless required by applicable law.
        </p>
      </section>

      <section class="space-y-2">
        <h2 class="text-base font-bold text-white uppercase tracking-wider text-amber-500">Account & Coins</h2>
        <p>
          If any registered agent experiences any issue related to coins, account balance, or any other website functionality, they may contact our support team.
        </p>
        <div class="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-1.5 font-mono text-xs">
          <p><span class="text-slate-500">Email:</span> <a href="mailto:support.skocha@gmail.com" class="text-amber-400 hover:underline">support.skocha@gmail.com</a></p>
          <p><span class="text-slate-500">Phone:</span> <a href="tel:+916378490489" class="text-amber-400 hover:underline">+91 63784 90489</a></p>
        </div>
      </section>

      <section class="space-y-2">
        <h2 class="text-base font-bold text-white uppercase tracking-wider text-amber-500">User Responsibility</h2>
        <p>
          Users are solely responsible for their own actions, communications, transactions, and interactions while using this platform. Every user is expected to comply with the laws applicable in their respective jurisdiction.
        </p>
      </section>

      <section class="space-y-2">
        <h2 class="text-base font-bold text-white uppercase tracking-wider text-amber-500">Website Usage</h2>
        <p>
          The website is provided <strong class="text-white">"as is"</strong> without any guarantee that the services will always be uninterrupted or error-free. We reserve the right to update, modify, suspend, or discontinue any part of the platform at any time.
        </p>
      </section>

      <section class="space-y-2">
        <h2 class="text-base font-bold text-white uppercase tracking-wider text-amber-500">Legal Notice</h2>
        <p>
          This website operates only for its intended purpose. If any authority, individual, or organization has any legal concern regarding the operation of this platform, they should contact the developer through proper legal channels. Any unnecessary harassment or unlawful interference may be addressed through appropriate legal remedies available under applicable law.
        </p>
      </section>

      <section class="space-y-2">
        <h2 class="text-base font-bold text-white uppercase tracking-wider text-amber-500">Changes to This Privacy Policy</h2>
        <p>
          We reserve the right to update this Privacy Policy at any time. Continued use of the website after any changes constitutes acceptance of the revised policy.
        </p>
      </section>

      <section class="space-y-2">
        <h2 class="text-base font-bold text-white uppercase tracking-wider text-amber-500">Contact Us</h2>
        <p>For any questions or support related to the website:</p>
        <div class="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-1.5 font-mono text-xs">
          <p><span class="text-slate-500">Email:</span> <a href="mailto:support.skocha@gmail.com" class="text-amber-400 hover:underline">support.skocha@gmail.com</a></p>
          <p><span class="text-slate-500">Phone:</span> <a href="tel:+916378490489" class="text-amber-400 hover:underline">+91 63784 90489</a></p>
        </div>
        <p class="text-xs text-amber-500 font-bold mt-2">Be aware of frauds.</p>
      </section>

      <div class="text-center pt-8 border-t border-slate-800/60 text-xs text-slate-500 font-mono">
        <p>Thank you for using our website.</p>
        <p class="mt-1">© 2026 SKOCHA PLATFORM</p>
      </div>
    </div>
  </div>
</body>
</html>
    `);
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Register Agent
  app.post('/api/auth/register', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and contain at least one Capital Letter, one Lowercase Letter, one Number, and one Special Character.'
      });
    }

    const db = readDB();
    const existing = db.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'This email is already registered.' });
    }

    const newProfile: Profile = {
      id: 'agent_' + Math.random().toString(36).substring(2, 11),
      email,
      passwordHash: password, // Plain text for local environment
      coinBalance: 0, // Starts with 0 coins
      isDeveloper: email.toLowerCase() === 'developer49@gmail.com',
      createdAt: new Date().toISOString()
    };

    // Special rule: if registering as developer, give 30 coins initially
    if (newProfile.isDeveloper) {
      newProfile.coinBalance = 30;
    }

    db.profiles.push(newProfile);
    writeDB(db);

    res.status(201).json({
      id: newProfile.id,
      email: newProfile.email,
      coinBalance: newProfile.coinBalance,
      isDeveloper: newProfile.isDeveloper,
      createdAt: newProfile.createdAt
    });
  });

  // Login Agent
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = readDB();

    // Check hardcoded developer details
    if (email.toLowerCase() === 'developer49@gmail.com' && password === '@Developer49') {
      let dev = db.profiles.find(p => p.email.toLowerCase() === 'developer49@gmail.com');
      if (!dev) {
        dev = {
          id: 'dev_user_49',
          email: 'developer49@gmail.com',
          passwordHash: '@Developer49',
          coinBalance: 30,
          isDeveloper: true,
          createdAt: new Date().toISOString()
        };
        db.profiles.push(dev);
        writeDB(db);
      }
      return res.json({
        id: dev.id,
        email: dev.email,
        coinBalance: dev.coinBalance,
        isDeveloper: dev.isDeveloper,
        createdAt: dev.createdAt
      });
    }

    // Standard match
    const user = db.profiles.find(
      p => p.email.toLowerCase() === email.toLowerCase() && p.passwordHash === password
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({
      id: user.id,
      email: user.email,
      coinBalance: user.coinBalance,
      isDeveloper: user.isDeveloper,
      createdAt: user.createdAt
    });
  });

  // Fetch ads
  app.get('/api/ads', (req, res) => {
    const db = readDB();
    const { category, location } = req.query;

    let filtered = db.ads.filter(ad => ad.status === 'active');

    if (category && category !== 'All') {
      filtered = filtered.filter(ad => ad.category.toLowerCase() === (category as string).toLowerCase());
    }

    if (location && location !== 'All') {
      filtered = filtered.filter(ad => ad.location.toLowerCase() === (location as string).toLowerCase());
    }

    // Sort: Paid Ads (priority) first, then newer ads first
    filtered.sort((a, b) => {
      if (a.type === 'paid' && b.type !== 'paid') return -1;
      if (a.type !== 'paid' && b.type === 'paid') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.json(filtered);
  });

  // Post Ad
  app.post('/api/ads', (req, res) => {
    const {
      agentId,
      category,
      title,
      bio,
      photos,
      attributes,
      type,
      location,
      phone
    } = req.body;

    if (!agentId || !category || !title || !bio || !location || !phone) {
      return res.status(400).json({ error: 'Missing required ad details' });
    }

    // Description validation: minimum 300 words
    const words = countWords(bio);
    if (words < 300) {
      return res.status(400).json({
        error: `Your bio description is too short (${words} words). It must be at least 300 words to ensure quality verification.`
      });
    }

    const db = readDB();
    const agent = db.profiles.find(p => p.id === agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent profile not found.' });
    }

    // Paid Ad logic
    if (type === 'paid') {
      if (agent.coinBalance < 4) {
        return res.status(400).json({
          error: 'Insufficient coins. A Paid Ad costs 4 Coins. Please purchase coins to proceed.'
        });
      }
      agent.coinBalance -= 4; // Deduct 4 coins
    }

    const adValidityDays = type === 'paid' ? 7 : 3;
    const expiresAt = new Date(Date.now() + adValidityDays * 24 * 60 * 60 * 1000).toISOString();

    const newAd: Ad = {
      id: 'ad_' + Math.random().toString(36).substring(2, 11),
      agentId,
      agentEmail: agent.email,
      category,
      title,
      bio,
      photos: photos && photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800'],
      attributes: {
        eyes: attributes?.eyes || 'Brown',
        chest: attributes?.chest || '34B',
        height: attributes?.height || "5'5\"",
        hair: attributes?.hair || 'Black',
        figure: attributes?.figure || 'Slim'
      },
      status: 'active',
      type,
      location,
      phone,
      createdAt: new Date().toISOString(),
      expiresAt
    };

    db.ads.push(newAd);
    writeDB(db);

    res.status(201).json({
      ad: newAd,
      coinBalance: agent.coinBalance
    });
  });

  // Submit Transaction/UTR Payment
  app.post('/api/payments/submit', (req, res) => {
    const { agentId, utrNumber, amount, coins } = req.body;

    if (!agentId || !utrNumber || !amount || !coins) {
      return res.status(400).json({ error: 'All transaction details are required.' });
    }

    // Validate 12-digit UTR
    const isTwelveDigits = /^\d{12}$/.test(utrNumber);
    if (!isTwelveDigits) {
      return res.status(400).json({ error: 'The UTR Number must be exactly 12 numeric digits.' });
    }

    const db = readDB();
    const agent = db.profiles.find(p => p.id === agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent profile not found.' });
    }

    const newTx: Transaction = {
      id: 'tx_' + Math.random().toString(36).substring(2, 11),
      agentId,
      agentEmail: agent.email,
      utrNumber,
      amount: Number(amount),
      coins: Number(coins),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.transactions.push(newTx);
    writeDB(db);

    res.status(201).json(newTx);
  });

  // Developer Admin Panels

  // Get all agent profiles and transactions (Developer only)
  app.get('/api/developer/data', (req, res) => {
    const { devId } = req.query;
    const db = readDB();

    const dev = db.profiles.find(p => p.id === devId && p.isDeveloper);
    if (!dev) {
      return res.status(403).json({ error: 'Access denied. Developer administrative rights required.' });
    }

    res.json({
      profiles: db.profiles.map(p => ({
        id: p.id,
        email: p.email,
        coinBalance: p.coinBalance,
        isDeveloper: p.isDeveloper,
        createdAt: p.createdAt
      })),
      transactions: db.transactions,
      adsCount: db.ads.length
    });
  });

  // Credit/Manage Coins manually
  app.post('/api/developer/credit-coins', (req, res) => {
    const { devId, agentId, coins } = req.body;

    const db = readDB();
    const dev = db.profiles.find(p => p.id === devId && p.isDeveloper);
    if (!dev) {
      return res.status(403).json({ error: 'Access denied. Developer administrative rights required.' });
    }

    const agent = db.profiles.find(p => p.id === agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found.' });
    }

    agent.coinBalance += Number(coins);
    writeDB(db);

    res.json({ success: true, agentId: agent.id, newBalance: agent.coinBalance });
  });

  // Approve UTR Payment
  app.post('/api/developer/approve-payment', (req, res) => {
    const { devId, transactionId } = req.body;

    const db = readDB();
    const dev = db.profiles.find(p => p.id === devId && p.isDeveloper);
    if (!dev) {
      return res.status(403).json({ error: 'Access denied. Developer administrative rights required.' });
    }

    const tx = db.transactions.find(t => t.id === transactionId);
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    if (tx.status === 'completed') {
      return res.status(400).json({ error: 'Transaction already completed.' });
    }

    const agent = db.profiles.find(p => p.id === tx.agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent linked to transaction not found.' });
    }

    tx.status = 'completed';
    agent.coinBalance += tx.coins;
    writeDB(db);

    res.json({ success: true, tx, agentBalance: agent.coinBalance });
  });

  // Reset Developer Coins explicitly (Manual trigger of the 1:00 AM reset)
  app.post('/api/developer/reset-developer-coins', (req, res) => {
    const { devId } = req.body;

    const db = readDB();
    const dev = db.profiles.find(p => p.id === devId && p.isDeveloper);
    if (!dev) {
      return res.status(403).json({ error: 'Access denied. Developer administrative rights required.' });
    }

    dev.coinBalance = 30; // Clear previous balance and set exactly to 30 Coins
    writeDB(db);

    res.json({ success: true, coinBalance: dev.coinBalance });
  });

  // Get current agent details (Balance, etc.)
  app.get('/api/agent/profile', (req, res) => {
    const { agentId } = req.query;
    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID is required' });
    }

    const db = readDB();
    const agent = db.profiles.find(p => p.id === agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({
      id: agent.id,
      email: agent.email,
      coinBalance: agent.coinBalance,
      isDeveloper: agent.isDeveloper,
      createdAt: agent.createdAt
    });
  });

  // Serve static assets or mount Vite dev server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
