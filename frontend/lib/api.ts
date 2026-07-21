// lib/api.ts
const BASE_URL = typeof window === 'undefined'
  ? 'http://backend:8080'
  : ''

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
  const isFormData = options.body instanceof FormData

  const headers: HeadersInit = {
    ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    window.location.href = "/login"
    throw new Error("인증이 만료되었어요. 다시 로그인해 주세요.")
  }

  return res
}

/* ───────── 진단 저장 ───────── */
export interface DiagnosisSaveRequest {
  name: string
  lang: string
  content: string
  isStable: string
  grade: string
  score: number
  summary: string
  accuracy: number
  accuracyReason: string
  efficiency: number
  efficiencyReason: string
  readability: number
  readabilityReason: string
  style: number
  styleReason: string
  timeComplexity: string
  optimizedCode: string
}

export interface DiagnosisSaveResponse {
  anlsId: number
  ornCdId: number
  optCdId: number
  dgnsId: number
}

export async function saveDiagnosis(body: DiagnosisSaveRequest): Promise<DiagnosisSaveResponse> {
  const res = await apiFetch("/api/v1/diagnoses", {
    method: "POST",
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`진단 저장 실패: ${txt}`)
  }
  return res.json()
}

/* ───────── AI 학습 생성 (DB 저장 X, diagnosisId만 받음) ───────── */
export interface AiLearningRequest {
  diagnosisId: number
}

export type AiLearningResponse = {
  optimizedCode: {
    lang: string
    content: string
    blank: string
    timeComplexity: string
  }
  concepts: {
    type: string
    title: string
    description: string
    referenceUrl: string
  }[]
  blanks: {
    order: number
    answer: string
    conceptIndex: number | null
  }[]
}

export async function generateAiLearning(req: AiLearningRequest): Promise<AiLearningResponse> {
  const res = await apiFetch("/api/v1/ai/learning", {
    method: "POST",
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`AI 학습 생성 실패: ${await res.text()}`)
  return res.json()
}

/* ───────── 학습 세션 저장 ───────── */
export type LearningSaveRequest = {
  diagnosisId: number
  name: string
  tags: string
  optimizedCode: {
    lang: string
    content: string
    blank: string
    timeComplexity: string
  }
  concepts: {
    type: string
    title: string
    description: string
    referenceUrl: string
    sortOrder: number
  }[]
  blanks: {
    order: number
    answer: string
    conceptIndex: number | null
  }[]
}

export async function saveLearning(
  req: LearningSaveRequest
): Promise<{ message: string; id: number }> {
  const res = await apiFetch("/api/v1/learnings", {
    method: "POST",
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`학습 저장 실패: ${await res.text()}`)
  return res.json()
}

export type SubmissionRequest = {
  answers: {
    blankOrd: number
    userAns: string
    hintUsedLv: number
  }[]
}

export type BlankResult = {
  blankId: number
  blankOrd: number
  userAns: string
  correct: boolean
  grdMethod: "S" | "A" | "N"
  expAns: string | null
  diffNote: string | null
  recommend: string | null
  securityNote: string | null
  conceptTitle: string | null
  conceptDesc: string | null
}

export type SubmissionResponse = {
  lrnId: number
  attemptNo: number
  totalBlanks: number
  correctCount: number
  progRt: number
  stat: string
  allCorrect: boolean
  grade: string | null
  nextReviewAt: string | null
  overallComment: string | null
  results: BlankResult[]
}

export async function submitLearning(
  lrnId: number,
  body: SubmissionRequest
): Promise<SubmissionResponse> {
  const res = await apiFetch(`/api/v1/learnings/${lrnId}/submissions`, {
    method: "POST",
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "채점에 실패했어요." }))
    throw new Error(err.message || "채점에 실패했어요.")
  }

  return res.json()
}

export type LearningListItem = {
  lrnId: number
  lrnName: string
  createdAt: string
  grade: string | null
  lang: string
  tag: string | null
  bookmarked: boolean
  stat: string
  progRt: number
}

export type LearningDetail = {
  lrnId: number
  lrnName: string
  createdAt: string
  grade: string | null
  stat: string
  progRt: number
  lastAttemptNo: number
  bookmarked: boolean
  tag: string | null
  overallComment: string | null
  originalCode: string
  optimizedCode: {
    lang: string
    content: string
    blank: string
    timeComplexity: string
  }
  concepts: {
    type: string
    title: string
    description: string
    referenceUrl: string
    sortOrder: number
  }[]
}

export async function fetchLearnings(): Promise<LearningListItem[]> {
  const res = await apiFetch("/api/v1/learnings")
  if (!res.ok) throw new Error("아카이브 목록을 불러오지 못했어요.")
  return res.json()
}

export async function fetchLearningDetail(lrnId: number): Promise<LearningDetail> {
  const res = await apiFetch(`/api/v1/learnings/${lrnId}`)
  if (!res.ok) throw new Error("학습 정보를 불러오지 못했어요.")
  return res.json()
}

export async function toggleBookmark(lrnId: number): Promise<boolean> {
  const res = await apiFetch(`/api/v1/learnings/${lrnId}/bookmark`, { method: "PATCH" })
  if (!res.ok) throw new Error("즐겨찾기 변경에 실패했어요.")
  const data = await res.json()
  return data.bookmarked
}

export async function deleteLearning(lrnId: number): Promise<void> {
  const res = await apiFetch(`/api/v1/learnings/${lrnId}`, { method: "DELETE" })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "삭제에 실패했어요." }))
    throw new Error(err.message || "삭제에 실패했어요.")
  }
}

export async function fetchLatestSubmission(lrnId: number): Promise<SubmissionResponse | null> {
  const res = await apiFetch(`/api/v1/learnings/${lrnId}/submissions/latest`)
  if (res.status === 204) return null   // 아직 안 푼 학습
  if (!res.ok) throw new Error("이전 채점 결과를 불러오지 못했어요.")
  return res.json()
}