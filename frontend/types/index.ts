// types/index.ts

export interface LearningSession {
  id: number
  title: string
  date: string
  grade: string
  tags: string[]
  language: string
  favorited: boolean
}

export interface Note {
  id: number
  title: string
  grade: string
  gradeColor: string
  date: string
  tags: string[]
  language: string
  favorited: boolean
  category: string
  memo: string
  code: string
}