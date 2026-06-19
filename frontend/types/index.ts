// types/index.ts

export interface LearningSession {
  id: number;
  title: string;
  date: string;
  grade: string;
  tags: string[];
  language: string;
  favorited: boolean;
}

export interface Note {
  noteId: number;
  noteName: string;
  noteMemo: string | null;
  noteCn: string | null;
  bkmkYn: string; // "Y" | "N"
  tag: string | null; // "#DP #Graph" 형태
  category: string | null;
  lang: string | null;
  createdAt: string;
  noteType: "LEARNING" | "MANUAL";
  optCdId: number | null;
  optCdContent: string | null;
  aiSummary: string | null;
}
