const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Database ----------
const db = new DatabaseSync(path.join(__dirname, 'covid.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    amount REAL NOT NULL,
    fund TEXT,
    message TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// ---------- Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'covid-response-portal-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 4 } // 4 hours
}));
app.use(express.static(path.join(__dirname, 'public')));

function requireFields(body, fields) {
  return fields.filter(f => !body[f] || String(body[f]).trim() === '');
}

// ---------- Auth routes ----------
app.post('/api/register', (req, res) => {
  const { full_name, email, password } = req.body;
  const missing = requireFields(req.body, ['full_name', 'email', 'password']);
  if (missing.length) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }
    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)');
    const info = stmt.run(full_name.trim(), email.toLowerCase().trim(), hash);
    req.session.userId = Number(info.lastInsertRowid);
    req.session.userName = full_name.trim();
    res.json({ success: true, message: 'Account created successfully.', user: { full_name, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while creating account.' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const missing = requireFields(req.body, ['email', 'password']);
  if (missing.length) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
  }
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    req.session.userId = user.id;
    req.session.userName = user.full_name;
    res.json({ success: true, message: 'Logged in successfully.', user: { full_name: user.full_name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while logging in.' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get('/api/session', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ loggedIn: true, full_name: req.session.userName });
  } else {
    res.json({ loggedIn: false });
  }
});

// ---------- Contact ----------
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  const missing = requireFields(req.body, ['name', 'email', 'message']);
  if (missing.length) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
  }
  try {
    db.prepare('INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)')
      .run(name.trim(), email.trim(), (subject || '').trim(), message.trim());
    res.json({ success: true, message: 'Message received. We will respond soon.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while sending message.' });
  }
});

// ---------- Donations ----------
app.post('/api/donate', (req, res) => {
  const { name, email, amount, fund, message } = req.body;
  const missing = requireFields(req.body, ['name', 'email', 'amount']);
  if (missing.length) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
  }
  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: 'Enter a valid donation amount.' });
  }
  try {
    db.prepare('INSERT INTO donations (name, email, amount, fund, message) VALUES (?, ?, ?, ?, ?)')
      .run(name.trim(), email.trim(), amt, fund || 'General Relief Fund', (message || '').trim());
    const totalRow = db.prepare('SELECT SUM(amount) as total, COUNT(*) as count FROM donations').get();
    res.json({
      success: true,
      message: 'Thank you for your donation.',
      total: totalRow.total || 0,
      count: totalRow.count || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while processing donation.' });
  }
});

app.get('/api/donate/stats', (req, res) => {
  try {
    const totalRow = db.prepare('SELECT SUM(amount) as total, COUNT(*) as count FROM donations').get();
    res.json({ total: totalRow.total || 0, count: totalRow.count || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`COVID-19 Response Portal running at http://localhost:${PORT}`);
});
