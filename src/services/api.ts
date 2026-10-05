import type { GameProgress } from '../types/game';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiHealth() {
  return request<{ ok: boolean; mode: string }>('/health');
}

export async function syncProgress(progress: GameProgress) {
  return request('/player/progress', {
    method: 'POST',
    body: JSON.stringify(progress),
  });
}

export async function getProgress(guestId: string) {
  return request<GameProgress>(`/player/progress/${guestId}`);
}

export async function getLeaderboard() {
  return request<Array<{ rank: number; name: string; xp: number; artifacts: number }>>('/leaderboard');
}
