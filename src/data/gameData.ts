import type {
  ArtifactDefinition,
  LocationDefinition,
  MissionDefinition,
} from '../types/game';

export const locations: LocationDefinition[] = [
  {
    id: 'hampi',
    name: 'Hampi',
    region: 'Karnataka',
    status: 'playable',
    description:
      'Enter the first full Virasat world. Explore the Hampi-inspired zone, discover the Stone Chariot, solve the architectural reconstruction puzzle and collect your first heritage artifact.',
  },
  {
    id: 'konark',
    name: 'Konark',
    region: 'Odisha',
    status: 'mini',
    description:
      'Play the Sun Wheel geometry challenge and learn how repetition, alignment and observation can turn architecture into gameplay.',
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    region: 'Rajasthan',
    status: 'mini',
    description:
      'Play Pattern Weaver, a craft-inspired symmetry challenge connecting traditional textile design with interactive learning.',
  },
  {
    id: 'ellora',
    name: 'Ellora',
    region: 'Maharashtra',
    status: 'playable',
    description:
      'Enter the Ellora architectural world and explore the supplied 3D cave model in third-person mode. Inspect the monument and add it to your Heritage Passport.',
  },
  {
    id: 'ayodhya',
    name: 'Ram Temple',
    region: 'Uttar Pradesh',
    status: 'playable',
    description:
      'Enter the Ram Temple architectural world using the supplied 3D model. Explore the monument, inspect it and collect it as a heritage discovery.',
  },
];

export const artifacts: ArtifactDefinition[] = [
  {
    id: 'stone-chariot',
    name: 'Stone Chariot of Hampi',
    region: 'Karnataka',
    category: 'Architecture',
    period: 'Historic Vijayanagara landscape',
    description:
      'A landmark monument in the Hampi landscape, represented here as the central discovery of the first playable mission.',
    model: '/models/stone-chariot/model.glb',
    format: 'glb',
    scale: 1,
  },

  {
    id: 'ram-temple',
    name: 'Ram Temple Model',
    region: 'Uttar Pradesh',
    category: 'Architecture',
    period: 'Modern temple architecture',
    description:
      'A supplied 3D temple model used as an architectural exploration world and heritage discovery.',
    model: '/models/ram-temple/model.glb',
    format: 'glb',
    scale: 1,
  },

  {
    id: 'ellora-caves',
    name: 'Ellora Caves Model',
    region: 'Maharashtra',
    category: 'Architecture',
    period: 'Ancient rock-cut cave tradition',
    description:
      'A supplied Ellora model used for an interactive cave-architecture experience and 3D museum inspection.',
    model: '/models/ellora-caves/ellora.fbx',
    format: 'fbx',
    scale: 1,
  },

  {
    id: 'horse-chariot',
    name: 'Ancient Horse Chariot',
    region: 'India',
    category: 'Engineering',
    period: 'Historical reconstruction-inspired model',
    description:
      'A supplied 3D chariot asset used as an interactive museum and future reconstruction experience.',
    model: '/models/horse-chariot/HorseChariotMain.fbx',
    format: 'fbx',
    scale: 1,
  },

  {
    id: 'water-system',
    name: 'Traditional Water System',
    region: 'India',
    category: 'Engineering',
    period: 'Historical water-management traditions',
    description:
      'A game mechanic inspired by traditional water collection, movement and storage systems across India.',
  },

  {
    id: 'temple-pillar',
    name: 'Temple Pillar',
    region: 'Karnataka',
    category: 'Architecture',
    period: 'Hampi architectural context',
    description:
      'A stylized environmental discovery used to introduce architectural observation.',
  },

  {
    id: 'weave-pattern',
    name: 'Textile Pattern',
    region: 'Rajasthan',
    category: 'Craft',
    period: 'Traditional craft inspiration',
    description:
      'A pattern-making collectible representing the role of geometry and repetition in textile traditions.',
  },

  {
    id: 'sun-wheel',
    name: 'Konark Sun Wheel',
    region: 'Odisha',
    category: 'Architecture',
    period: 'Konark architectural context',
    description:
      'A stylized interactive wheel challenge inspired by the architecture of the Sun Temple at Konark.',
  },

  {
    id: 'folk-instrument',
    name: 'Folk Instrument',
    region: 'India',
    category: 'Music',
    period: 'Living cultural tradition',
    description:
      'A placeholder collectible representing the broader living-culture expansion of Virasat.',
  },

  {
    id: 'festival-story',
    name: 'Festival Story',
    region: 'India',
    category: 'Tradition',
    period: 'Living cultural tradition',
    description:
      'A collectible that demonstrates how future festival-based worlds can be connected to gameplay.',
  },
];

export const missions: MissionDefinition[] = [
  {
    id: 'lost-blueprint',
    title: 'The Lost Blueprint',
    description:
      'Recover fragments of an architectural puzzle hidden around the Hampi adventure zone.',
    xp: 300,

    objectives: [
      {
        id: 'discover-pillar',
        text: 'Discover the temple pillar clue',
      },
      {
        id: 'discover-fragment',
        text: 'Find the architectural fragment',
      },
      {
        id: 'visit-courtyard',
        text: 'Reach the Stone Chariot courtyard',
      },
      {
        id: 'solve-reconstruction',
        text: 'Complete the reconstruction puzzle',
      },
      {
        id: 'restore-blueprint',
        text: 'Restore the lost blueprint',
      },
    ],
  },
];

export const guideLines = {
  welcome:
    'Welcome to Hampi. Explore the ruins, discover clues, and restore the lost architectural blueprint.',

  pillar:
    'Look closely at the architectural elements around you. The game uses observation as the first step to learning.',

  chariot:
    'You found the Stone Chariot landmark. Inspect it, add it to your passport, and continue the expedition.',

  puzzle:
    'The reconstruction challenge is inspired by the idea of understanding architecture through its components and sequence.',
};

export const ranks = [
  {
    min: 0,
    name: 'Explorer',
  },
  {
    min: 200,
    name: 'Culture Seeker',
  },
  {
    min: 500,
    name: 'Heritage Scholar',
  },
  {
    min: 900,
    name: 'Civilization Keeper',
  },
];

export function getRank(xp: number) {
  return (
    [...ranks]
      .reverse()
      .find((rank) => xp >= rank.min)?.name ?? 'Explorer'
  );
}

export function getLevel(xp: number) {
  return Math.max(1, Math.floor(xp / 250) + 1);
}