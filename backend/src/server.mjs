import { getSupabaseProgress, saveSupabaseProgress } from './lib/repository.mjs';
import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.resolve(__dirname, '../data/demo-db.json');
const PORT = Number(process.env.PORT || 4000);
const MODE = process.env.DATABASE_MODE || 'local';

const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

async function readDb() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    const initial = { players: {}, leaderboard: [
      { rank: 1, name: 'Aarav', xp: 1280, artifacts: 8 },
      { rank: 2, name: 'Meera', xp: 1040, artifacts: 7 },
      { rank: 3, name: 'Kabir', xp: 880, artifacts: 5 },
      { rank: 4, name: 'Demo Explorer', xp: 420, artifacts: 3 },
    ]};
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

async function writeDb(db) {
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2));
}

app.get('/api/health', (_req, res) => res.json({ ok: true, mode: MODE }));

app.get('/api/locations', (_req, res) => res.json([
  { id: 'hampi', name: 'Hampi', status: 'playable' },
  { id: 'konark', name: 'Konark', status: 'mini' },
  { id: 'rajasthan', name: 'Rajasthan', status: 'mini' },
  { id: 'ellora', name: 'Ellora', status: 'future' },
  { id: 'ayodhya', name: 'Ram Temple', status: 'future' },
]));

app.get('/api/artifacts', (_req, res) => res.json({ source: 'local-seed', artifacts: 'see-frontend-gameData' }));

app.get('/api/player/progress/:guestId', async (req, res) => {
  try {
    const cloud = await getSupabaseProgress(req.params.guestId);
    if (cloud) return res.json(cloud);
  } catch (error) {
    console.error('Supabase read failed:', error.message);
  }
  const db = await readDb();
  const data = db.players[req.params.guestId];
  if (!data) return res.status(404).json({ error: 'not_found' });
  res.json(data);
});

app.post('/api/player/progress', async (req, res) => {
  const body = req.body || {};
  if (typeof body.guestId !== 'string' || body.guestId.length < 8) {
    return res.status(400).json({ error: 'invalid_guest_id' });
  }
  if (typeof body.xp !== 'number') return res.status(400).json({ error: 'invalid_xp' });
  const db = await readDb();
  db.players[body.guestId] = {
    guestId: body.guestId,
    xp: body.xp,
    level: body.level || 1,
    rank: body.rank || 'Explorer',
    discoveredArtifacts: Array.isArray(body.discoveredArtifacts) ? body.discoveredArtifacts : [],
    completedObjectives: Array.isArray(body.completedObjectives) ? body.completedObjectives : [],
    completedMissions: Array.isArray(body.completedMissions) ? body.completedMissions : [],
    unlockedLocations: Array.isArray(body.unlockedLocations) ? body.unlockedLocations : ['hampi'],
    language: body.language || 'en',
    soundEnabled: body.soundEnabled !== false,
    graphics: body.graphics || 'high',
    updatedAt: new Date().toISOString(),
  };
  const existingIndex = db.leaderboard.findIndex((x) => x.name === body.guestId);
  const row = { rank: 0, name: body.guestId, xp: body.xp, artifacts: db.players[body.guestId].discoveredArtifacts.length };
  if (existingIndex >= 0) db.leaderboard[existingIndex] = { ...db.leaderboard[existingIndex], ...row };
  else db.leaderboard.push(row);
  db.leaderboard.sort((a, b) => b.xp - a.xp);
  db.leaderboard = db.leaderboard.slice(0, 25).map((x, i) => ({ ...x, rank: i + 1 }));
  await writeDb(db);
  try {
    await saveSupabaseProgress(body.guestId, db.players[body.guestId]);
  } catch (error) {
    console.error('Supabase write failed:', error.message);
  }
  res.json({ ok: true, database: MODE });
});

app.get('/api/leaderboard', async (_req, res) => {
  const db = await readDb();
  res.json(db.leaderboard);
});

app.get('/api/status', (_req, res) => res.json({ project: 'VIRASAT', problemStatement: '26208', backend: 'online', mode: MODE }));

app.use((_err, _req, res, _next) => res.status(500).json({ error: 'server_error' }));

app.listen(PORT, () => console.log(`VIRASAT backend listening on http://localhost:${PORT}`));
