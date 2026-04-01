/**
 * Thulir Construction — Local Admin Server
 * Run: node admin-server.js
 * Visit: http://localhost:3001/admin.html
 */

const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');

const app          = express();
const PORT         = 3001;
const ROOT         = __dirname;
const GALLERY_DIR  = path.join(ROOT, 'images', 'gallery');
const MANIFEST_FILE = path.join(ROOT, 'gallery-data.js');
const SITES_FILE   = path.join(ROOT, 'sites-data.js');
const PASSWORD     = 'thulir@2024';   // ← change to your preferred password

app.use(express.json());
app.use(express.static(ROOT));

/* ─── Auth middleware ─────────────────────────────────── */
function auth(req, res, next) {
  if (req.headers['x-admin-token'] === PASSWORD) return next();
  res.status(401).json({ error: 'Unauthorised' });
}

/* ─── Helpers: read / write data files ───────────────── */
function evalFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const win = {};
  try { new Function('window', src)(win); } catch(_) {}
  return win;
}

function readManifests() {
  return evalFile(MANIFEST_FILE).GALLERY_MANIFESTS || {};
}
function writeManifests(m) {
  let out = 'window.GALLERY_MANIFESTS = {\n\n';
  for (const [folder, files] of Object.entries(m)) {
    out += `  // ── ${folder} ─────────────────────────────────────────────────────────\n`;
    out += `  ${JSON.stringify(folder)}: [\n`;
    for (const f of files) out += `    ${JSON.stringify(f)},\n`;
    out += `  ],\n\n`;
  }
  out += '};\n';
  fs.writeFileSync(MANIFEST_FILE, out, 'utf8');
}

function readSites() {
  return evalFile(SITES_FILE).GALLERY_SITES || [];
}
function writeSites(sites) {
  fs.writeFileSync(SITES_FILE,
    'window.GALLERY_SITES = ' + JSON.stringify(sites, null, 2) + ';\n',
    'utf8');
}

/* ─── API: login ──────────────────────────────────────── */
app.post('/api/login', (req, res) => {
  if (req.body.password === PASSWORD)
    return res.json({ ok: true, token: PASSWORD });
  res.status(401).json({ error: 'Wrong password' });
});

/* ─── API: sites (project metadata) ──────────────────── */
app.get('/api/sites', auth, (req, res) => res.json(readSites()));

app.post('/api/sites', auth, (req, res) => {
  const sites = readSites();
  const site  = req.body;
  if (!site.folder) return res.status(400).json({ error: 'folder required' });
  if (sites.find(s => s.folder === site.folder))
    return res.status(409).json({ error: 'Folder already exists' });
  sites.push(site);
  writeSites(sites);
  // ensure folder & manifest entry exist
  const dir = path.join(GALLERY_DIR, site.folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const m = readManifests();
  if (!m[site.folder]) { m[site.folder] = []; writeManifests(m); }
  res.json({ ok: true });
});

app.put('/api/sites/:folder', auth, (req, res) => {
  let sites = readSites();
  const idx = sites.findIndex(s => s.folder === decodeURIComponent(req.params.folder));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  sites[idx] = { ...sites[idx], ...req.body };
  writeSites(sites);
  res.json({ ok: true });
});

app.delete('/api/sites/:folder', auth, (req, res) => {
  const folder = decodeURIComponent(req.params.folder);
  let sites = readSites();
  sites = sites.filter(s => s.folder !== folder);
  writeSites(sites);
  const m = readManifests();
  delete m[folder];
  writeManifests(m);
  res.json({ ok: true });
});

/* ─── API: manifests ──────────────────────────────────── */
app.get('/api/manifests', auth, (req, res) => res.json(readManifests()));

/* ─── API: photos ─────────────────────────────────────── */
app.get('/api/photos/:folder', auth, (req, res) => {
  const dir = path.join(GALLERY_DIR, decodeURIComponent(req.params.folder));
  if (!fs.existsSync(dir)) return res.json([]);
  const files = fs.readdirSync(dir)
    .filter(f => /\.(jpe?g|png|gif|webp)$/i.test(f));
  res.json(files);
});

// Upload
app.post('/api/upload/:folder', auth, (req, res) => {
  const folder = decodeURIComponent(req.params.folder);
  const dir    = path.join(GALLERY_DIR, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const storage = multer.diskStorage({
    destination: dir,
    filename: (_, file, cb) => cb(null, file.originalname),
  });
  multer({ storage }).array('photos')(req, res, err => {
    if (err) return res.status(500).json({ error: err.message });
    const uploaded = req.files.map(f => f.originalname);
    const m = readManifests();
    m[folder] = [...new Set([...(m[folder] || []), ...uploaded])];
    writeManifests(m);
    res.json({ ok: true, files: uploaded });
  });
});

// Delete single photo
app.delete('/api/photo/:folder/:filename', auth, (req, res) => {
  const folder   = decodeURIComponent(req.params.folder);
  const filename = decodeURIComponent(req.params.filename);
  const fp       = path.join(GALLERY_DIR, folder, filename);
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
  const m = readManifests();
  if (m[folder]) {
    m[folder] = m[folder].filter(f => f !== filename);
    writeManifests(m);
  }
  res.json({ ok: true });
});

// Reorder photos
app.put('/api/manifest/:folder', auth, (req, res) => {
  const folder = decodeURIComponent(req.params.folder);
  const m = readManifests();
  m[folder] = req.body.files;
  writeManifests(m);
  res.json({ ok: true });
});

/* ─── Start ───────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   Thulir Admin Server — Ready             ║');
  console.log(`║   http://localhost:${PORT}/admin.html        ║`);
  console.log('╚══════════════════════════════════════════╝\n');
});
