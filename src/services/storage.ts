import type { GameProgress, Language } from '../types/game';
import { getLevel, getRank } from '../data/gameData';

const KEY = 'virasat-sih-progress-v1';

function makeGuestId() {
  const existing = localStorage.getItem('virasat-guest-id');
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem('virasat-guest-id', id);
  return id;
}

export function defaultProgress(): GameProgress {
  return {
    guestId: makeGuestId(),
    xp: 0,
    level: 1,
    rank: 'Explorer',
    discoveredArtifacts: [],
    completedObjectives: [],
    completedMissions: [],
    unlockedLocations: ['hampi'],
    language: 'en',
    soundEnabled: true,
    graphics: 'high',
  };
}

export function loadProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as Partial<GameProgress>;
    const merged = { ...defaultProgress(), ...parsed } as GameProgress;
    merged.level = getLevel(merged.xp);
    merged.rank = getRank(merged.xp);
    return merged;
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress: GameProgress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Best-effort offline persistence.
  }
}

export function updateLanguage(progress: GameProgress, language: Language) {
  return { ...progress, language };
}
