export enum GameType {
  PATTERNS = 'PATTERNS',
  LOGIC = 'LOGIC',
  SHADOWS = 'SHADOWS',
  COUNTING = 'COUNTING',
  MEMORY = 'MEMORY'
}

export interface GameStats {
  totalPlayed: number;
  correctAnswers: number;
  highestLevel: number;
  categoryStats: Record<GameType, { played: number; correct: number }>;
}

export interface GameLevel {
  id: string;
  type: GameType;
  title: string;
  description: string;
  difficulty: number;
}
