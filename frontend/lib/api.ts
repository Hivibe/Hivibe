// lib/api.ts
const BASE_URL = "http://localhost:8080"

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

export interface AiLearningResponse {
  optimizedCode: {
    lang: string
    content: string
    blank: string
    timeComplexity: string
  }
  concepts: Array<{
    type: "O" | "P"
    title: string
    description: string
    referenceUrl: string
  }>
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
export interface LearningSaveRequest {
  diagnosisId: number
  name: string
  tags: string
  optimizedCode: AiLearningResponse["optimizedCode"]
  concepts: Array<{
    type: string
    title: string
    description: string
    referenceUrl: string
    sortOrder: number
  }>
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