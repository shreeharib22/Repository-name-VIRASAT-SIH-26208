export type Language = 'en' | 'hi' | 'kn';
export type AppScreen = 'home' | 'map' | 'game' | 'museum' | 'passport' | 'about'  | 'library';
export type GameMode = 'desktop' | 'ar' | 'vr';

export type ArtifactCategory =
  | 'Architecture'
  | 'Craft'
  | 'Engineering'
  | 'Art'
  | 'Music'
  | 'Tradition';


export interface ArtifactDefinition {
  id: string;
  name: string;
  region: string;
  category: ArtifactCategory;
  period: string;
  description: string;
  model?: string;
  format?: 'glb' | 'fbx';
  scale?: number;
}

export interface Objective {
  id: string;
  text: string;
}

export interface MissionDefinition {
  id: string;
  title: string;
  description: string;
  objectives: Objective[];
  xp: number;
}

export interface GameProgress {
  guestId: string;
  xp: number;
  level: number;
  rank: string;
  discoveredArtifacts: string[];
  completedObjectives: string[];
  completedMissions: string[];
  unlockedLocations: string[];
  language: Language;
  soundEnabled: boolean;
  graphics: 'low' | 'medium' | 'high';
}

export interface LocationDefinition {
  id: string;
  name: string;
  region: string;
  status: 'playable' | 'mini' | 'future';
  description: string;
}

export interface ToastMessage {
  title: string;
  body?: string;
  xp?: number;
}
