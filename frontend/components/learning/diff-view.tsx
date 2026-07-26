"use client"

import { useState, useMemo, useEffect, useRef, Fragment } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TrendingUp, HelpCircle, Check, X, MessageSquare, ExternalLink, Loader2, RotateCcw, Eye, EyeOff, Sparkles, ChevronLeft, ChevronRight, Play, Pause, Pencil } from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area,
  Line, CartesianGrid,
  XAxis, YAxis, Tooltip as RechartsTooltip, Legend,
} from "recharts"
import type { LearningSession } from "@/types"
import { apiFetch, submitLearning, fetchHint, renameLearning, saveDraft, fetchDraft, type AiLearningResponse, type BlankResult, type SubmissionResponse } from "@/lib/api"
import { toast } from "sonner"

const BRAND = "#63C1ED"

export type Pace = "off" | "slow" | "medium" | "fast"

export const PACE_INTERVALS_MS: Record<"slow" | "medium" | "fast", number> = {
  fast: 20000,
  medium: 40000,
  slow: 70000,
}

const hintStorageKey = (lrnId: number) => `hivibe_hint_${lrnId}`

type PersistedHint = {
  levels: Record<number, number>
  contents: Record<number, Record<number, string>>
  elapsed: Record<number, number>
  viewLevel: Record<number, number>
}

const complexityComparisonData = [
  { name: "10", original: 100, optimized: 10 },
  { name: "50", original: 2500, optimized: 50 },
  { name: "100", original: 10000, optimized: 100 },
  { name: "200", original: 40000, optimized: 200 },
  { name: "500", original: 250000, optimized: 500 },
]

type LearningContent = {
  lrnId: number
  optimizedCode: AiLearningResponse["optimizedCode"]
  concepts: AiLearningResponse["concepts"]
  previousSubmission?: {
    correctCount: number
    totalBlanks: number
    grade: string | null
    overallComment: string | null
    results: BlankResult[]
  } | null
}

interface DiffViewProps {
  session: LearningSession
  analyzedCode: string
  learningContent: LearningContent | null
  onBack: () => void
  onGraded?: (lrnId: number, res: SubmissionResponse) => void
  pace: Pace
  onBadgesUnlocked?: (badges: any[]) => void
  onRename?: (lrnId: number, newName: string) => void
}

function highlightLine(text: string) {
  const keywords = ['public', 'class', 'return', 'for', 'if', 'else', 'new', 'private', 'static', 'void', 'final', 'def', 'import', 'from', 'function', 'const', 'let', 'var']
  const types = ['int', 'String', 'boolean', 'long', 'double', 'float', 'char']
  const typesExtra = ['Map', 'HashMap', 'List', 'ArrayList', 'Set', 'HashSet']
  const all = [...keywords, ...types, ...typesExtra]
  const regex = new RegExp(`\\b(${all.join('|')})\\b`, 'g')
  const parts = text.split(regex)
  return parts.map((p, i) => {
    if (keywords.includes(p)) return <span key={i} className="text-[#c678dd]">{p}</span>
    if (types.includes(p)) return <span key={i} className="text-[#56b6c2]">{p}</span>
    if (typesExtra.includes(p)) return <span key={i} className="text-[#e5c07b]">{p}</span>
    return <Fragment key={i}>{p}</Fragment>
  })
}

type Token = { type: "text" | "blank"; value: string; blankIdx?: number }
type ParsedLine = { lineNo: number; tokens: Token[]; hasBlank: boolean }

function parseBlankCode(blankCode: string): ParsedLine[] {
  const lines = blankCode.split("\n")
  return lines.map((line, lineIdx) => {
    const tokens: Token[] = []
    const regex = /\{\{BLANK_(\d+)\}\}/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    let hasBlank = false
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ type: "text", value: line.slice(lastIndex, match.index) })
      }
      tokens.push({ type: "blank", value: "", blankIdx: parseInt(match[1], 10) - 1 })
      hasBlank = true
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < line.length) {
      tokens.push({ type: "text", value: line.slice(lastIndex) })
    }
    if (tokens.length === 0) {
      tokens.push({ type: "text", value: "" })
    }
    return { lineNo: lineIdx + 1, tokens, hasBlank }
  })
}

/** 빈칸별 채점 결과 팝오버 — 말풍선 아이콘 통일 */
function ResultPopover({ result }: { result: BlankResult }) {
  const [showAnswer, setShowAnswer] = useState(false)

  const isWrong = !result.correct
  const isAiPass = result.correct && result.grdMethod === "A"
  const isExactPass = result.correct && result.grdMethod === "S"

  // 완전정답(S)인데 개념 정보도 없으면 보여줄 게 없음
  if (isExactPass && !result.conceptTitle) return null

  const headerText = isWrong
    ? "다시 생각해 보세요"
    : isAiPass
      ? "정답이지만 참고하세요"
      : "이 개념을 사용했어요"

  const headerColor = isWrong
    ? "text-rose-400"
    : isAiPass
      ? "text-amber-400"
      : "text-emerald-400"

  return (
    <Popover onOpenChange={(open) => { if (!open) setShowAnswer(false) }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shadow-sm"
          title="코멘트 보기"
        >
          <MessageSquare className="h-3 w-3" />        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="max-w-sm bg-card border-border p-0 shadow-xl shadow-black/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border" style={{ borderLeft: `3px solid ${isWrong ? '#f43f5e' : isAiPass ? '#f59e0b' : '#10b981'}` }}>
          <p className={`font-syne font-bold text-sm ${headerColor}`}>{headerText}</p>
        </div>
        <div className="p-4 space-y-3">
          {/* 완전정답(S) — 개념 설명 */}
          {isExactPass && result.conceptTitle && (
            <div>
              <p className="font-ko text-[12px] text-foreground font-bold mb-1.5">{result.conceptTitle}</p>
              {result.conceptDesc && (
                <p className="font-ko text-[11px] text-muted-foreground leading-relaxed">{result.conceptDesc}</p>
              )}
            </div>
          )}

          {/* AI 채점(A/N) — 차이점 */}
          {result.diffNote && (
            <p className="font-ko text-[11px] text-foreground/80 leading-relaxed">{result.diffNote}</p>
          )}

          {result.recommend && (
            <div className="pt-2 border-t border-border">
              <p className="font-ko text-[10px] font-bold mb-1" style={{ color: BRAND }}>💬 추천</p>
              <p className="font-ko text-[11px] text-muted-foreground leading-relaxed">{result.recommend}</p>
            </div>
          )}

          {result.securityNote && (
            <div className="pt-2 border-t border-border">
              <p className="font-ko text-[10px] font-bold text-orange-400 mb-1">⚠️ 주의</p>
              <p className="font-ko text-[11px] text-muted-foreground leading-relaxed">{result.securityNote}</p>
            </div>
          )}

          {/* 오답 — 정답 보기/가리기 */}
          {isWrong && result.expAns && (
            <div className="pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowAnswer(p => !p)}
                className="font-ko text-[10px] text-muted-foreground hover:text-foreground/80 underline transition-colors flex items-center gap-1"
              >
                {showAnswer ? (
                  <><EyeOff className="h-3 w-3" /> 정답 가리기</>
                ) : (
                  <><Eye className="h-3 w-3" /> 정답 보기</>
                )}
              </button>

              {showAnswer && (
                <div className="mt-2">
                  <p className="font-ko text-[10px] font-bold text-emerald-400 mb-1">정답</p>
                  <code className="font-code text-[11px] text-emerald-300 block bg-background rounded px-2 py-1.5 whitespace-pre-wrap break-all">
                    {result.expAns}
                  </code>
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function DiffView({ session, analyzedCode, learningContent, onBack, onBadgesUnlocked, onGraded, pace, onRename }: DiffViewProps) {
  const [panelOpen, setPanelOpen] = useState(true)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [userName, setUserName] = useState<string>("사용자")

  // 제목 인라인 편집
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(session.title)
  const [savingTitle, setSavingTitle] = useState(false)

  // 채점 상태
  const [isGrading, setIsGrading] = useState(false)
  const [results, setResults] = useState<Record<number, BlankResult> | null>(null)
  const isGraded = results !== null

  // 힌트 상태: blankIdx0 → 열람한 최고 레벨(0~3) / 레벨별 캐시된 내용 / 로딩 여부
  const [hintLevels, setHintLevels] = useState<Record<number, number>>({})
  const [hintContents, setHintContents] = useState<Record<number, Record<number, string>>>({})
  const [hintLoading, setHintLoading] = useState<Record<number, boolean>>({})
  const [hintElapsed, setHintElapsed] = useState<Record<number, number>>({})  // 빈칸별 누적 경과(ms)
  const [runningBlank, setRunningBlank] = useState<number | null>(null)        // 지금 타이머 도는 빈칸
  const [, setNowTick] = useState(() => Date.now())                            // 리렌더 트리거용
  const [focusedBlank, setFocusedBlank] = useState<number | null>(null)
  const [hintViewLevel, setHintViewLevel] = useState<Record<number, number>>({})

  const [displayTitle, setDisplayTitle] = useState(session.title)


  const [summary, setSummary] = useState<{
    correctCount: number
    totalBlanks: number
    grade: string | null
    overallComment: string | null
  } | null>(null)

  const [gradeError, setGradeError] = useState<string | null>(null)

  // draft 자동저장
  const draftTimerRef = useRef<NodeJS.Timeout | null>(null)
  const draftLoadedRef = useRef(false)   // 복원 완료 전엔 저장 안 함 (빈 답안 덮어쓰기 방지)
  const [draftSaving, setDraftSaving] = useState(false)
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null)

  const handleTitleSave = async () => {
    const trimmed = titleDraft.trim()
    if (!trimmed) {
      setTitleDraft(displayTitle)   // 빈 값이면 원래대로
      setEditingTitle(false)
      return
    }
    if (trimmed === displayTitle) {
      setEditingTitle(false)
      return
    }
    if (!learningContent) return

    setSavingTitle(true)
    try {
      await renameLearning(learningContent.lrnId, trimmed)
      setDisplayTitle(trimmed)
      onRename?.(learningContent.lrnId, trimmed)
      setEditingTitle(false)
      toast.success("이름을 변경했어요")
    } catch (e: any) {
      console.error("이름 변경 실패:", e)
      toast.error("이름을 변경하지 못했어요", { description: e.message })
      setTitleDraft(session.title)   // 실패 시 원복
    } finally {
      setSavingTitle(false)
    }
  }

  useEffect(() => {
    setTitleDraft(session.title)
    setDisplayTitle(session.title)
    setEditingTitle(false)
  }, [session.title, learningContent?.lrnId])

  useEffect(() => {
    apiFetch("/api/mypage/me")
      .then(res => res.json())
      .then(data => {
        if (data?.userNm) setUserName(data.userNm)
      })
      .catch(e => console.error("유저 이름 불러오기 실패:", e))
  }, [])

  // 학습 세션이 바뀌면 상태 초기화 (이전 채점 있으면 복원)
  // 학습 세션이 바뀌면 상태 초기화 (이전 채점 있으면 복원, 없으면 draft 복원)
  useEffect(() => {
    const lrnId = learningContent?.lrnId
    draftLoadedRef.current = false
    setDraftSavedAt(null)

    const prev = learningContent?.previousSubmission
    if (prev && prev.results.length > 0) {
      // 채점 이력이 있으면 그걸 우선 복원 (draft보다 우선)
      const restoredAnswers: Record<number, string> = {}
      const restoredResults: Record<number, BlankResult> = {}
      for (const r of prev.results) {
        restoredAnswers[r.blankOrd - 1] = r.userAns
        restoredResults[r.blankOrd - 1] = r
      }
      setAnswers(restoredAnswers)
      setResults(restoredResults)
      setSummary({
        correctCount: prev.correctCount,
        totalBlanks: prev.totalBlanks,
        grade: prev.grade,
        overallComment: prev.overallComment,
      })
      draftLoadedRef.current = true
    } else {
      setAnswers({})
      setResults(null)
      setSummary(null)

      // 채점 이력 없을 때만 draft 복원
      if (lrnId) {
        fetchDraft(lrnId)
          .then(draft => {
            if (draft?.answers) {
              const restored: Record<number, string> = {}
              for (const [ord, val] of Object.entries(draft.answers)) {
                restored[parseInt(ord, 10) - 1] = val   // 1-based → 0-based
              }
              setAnswers(restored)
              if (Object.keys(restored).length > 0) {
                toast.info("입력하던 답안을 불러왔어요")
              }
            }
          })
          .catch(e => console.warn("draft 불러오기 실패:", e))
          .finally(() => { draftLoadedRef.current = true })
      } else {
        draftLoadedRef.current = true
      }
    }

    setGradeError(null)

    // 힌트 상태 복원 (새로고침 대비, sessionStorage)
    let restoredHint: PersistedHint | null = null
    if (lrnId) {
      try {
        const raw = sessionStorage.getItem(hintStorageKey(lrnId))
        if (raw) restoredHint = JSON.parse(raw)
      } catch (e) {
        console.warn("힌트 상태 복원 실패:", e)
      }
    }

    setHintLevels(restoredHint?.levels ?? {})
    setHintContents(restoredHint?.contents ?? {})
    setHintElapsed(restoredHint?.elapsed ?? {})
    setHintViewLevel(restoredHint?.viewLevel ?? {})
    setHintLoading({})
    setRunningBlank(null)
    setFocusedBlank(null)
  }, [learningContent?.lrnId])


  // 답안 변경 시 1.5초 디바운스로 서버 자동저장
  useEffect(() => {
    const lrnId = learningContent?.lrnId
    if (!lrnId) return
    if (!draftLoadedRef.current) return   // 복원 전엔 저장 안 함
    if (isGraded) return                  // 채점 완료 상태는 저장 안 함

    if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
    draftTimerRef.current = setTimeout(() => {
      // 0-based → 1-based(blankOrd)로 변환해서 전송
      const payload: Record<string, string> = {}
      for (const [idx0, val] of Object.entries(answers)) {
        if (val?.trim()) payload[String(parseInt(idx0, 10) + 1)] = val
      }
      setDraftSaving(true)
      saveDraft(lrnId, payload)
        .then(() => setDraftSavedAt(new Date()))
        .catch(e => console.warn("draft 저장 실패:", e))
        .finally(() => setDraftSaving(false))
    }, 1500)

    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
    }
  }, [answers, learningContent?.lrnId, isGraded])

  // 힌트 상태를 sessionStorage에 저장 (새로고침 시 복원용)
  useEffect(() => {
    const lrnId = learningContent?.lrnId
    if (!lrnId) return
    if (Object.keys(hintLevels).length === 0) return   // 아직 힌트 안 봤으면 저장 안 함

    try {
      const payload: PersistedHint = {
        levels: hintLevels,
        contents: hintContents,
        elapsed: hintElapsed,
        viewLevel: hintViewLevel,
      }
      sessionStorage.setItem(hintStorageKey(lrnId), JSON.stringify(payload))
    } catch (e) {
      console.warn("힌트 상태 저장 실패:", e)   // 용량 초과 등
    }
  }, [hintLevels, hintContents, hintElapsed, hintViewLevel, learningContent?.lrnId])

  const blankCode = learningContent?.optimizedCode.blank ?? ""
  const concepts = learningContent?.concepts ?? []

  const parsedLines = useMemo(() => parseBlankCode(blankCode), [blankCode])

  const blankCount = useMemo(() => {
    const set = new Set<number>()
    for (const line of parsedLines) {
      for (const t of line.tokens) {
        if (t.type === "blank" && t.blankIdx !== undefined) set.add(t.blankIdx)
      }
    }
    return set.size
  }, [parsedLines])

  const originalConcepts = concepts.filter(c => c.type === "O")
  const optimizedConcepts = concepts.filter(c => c.type === "P")
  const originalLines = useMemo(() => analyzedCode.split("\n"), [analyzedCode])

  const filledCount = Object.values(answers).filter(v => v?.trim().length > 0).length
  const allFilled = blankCount > 0 && filledCount === blankCount

  const handleRevealHint = async (idx0: number, nextLevel: number) => {
    if (!learningContent) return

    const cached = hintContents[idx0]?.[nextLevel]
    if (cached !== undefined) {
      setHintLevels(prev => ({ ...prev, [idx0]: nextLevel }))
      setHintViewLevel(prev => ({ ...prev, [idx0]: nextLevel }))
      setFocusedBlank(null)
      return
    }

    setHintLoading(prev => ({ ...prev, [idx0]: true }))
    try {
      const res = await fetchHint(learningContent.lrnId, idx0 + 1, nextLevel)
      console.log("🟢 힌트 응답:", res, "→ idx0:", idx0, "level:", nextLevel)   // ← 추가
      setHintContents(prev => ({
        ...prev,
        [idx0]: { ...(prev[idx0] ?? {}), [nextLevel]: res.content },
      }))
      setHintLevels(prev => {
        const next = { ...prev, [idx0]: nextLevel }
        console.log("🟢 레벨 갱신:", next)   // ← 추가
        return next
      })
    } catch (e: any) {
      console.error("힌트 조회 실패:", e)
      toast.error("힌트를 불러오지 못했어요", { description: e.message })
    } finally {
      setHintLoading(prev => ({ ...prev, [idx0]: false }))
    }
  }

  // 라이브 코칭 타이머 — runningBlank 하나만 경과시간 누적, 임계치 넘으면 다음 레벨
  useEffect(() => {
    if (pace === "off" || isGraded || runningBlank === null) return

    const intervalMs = PACE_INTERVALS_MS[pace]
    const timer = setInterval(() => {
      setNowTick(Date.now())
      setHintElapsed(prev => {
        const idx0 = runningBlank
        const next = (prev[idx0] ?? 0) + 250
        const currentLevel = hintLevels[idx0] ?? 0
        const nextLevel = currentLevel + 1
        if (nextLevel <= 3 && next >= nextLevel * intervalMs && !hintLoading[idx0]) {
          void handleRevealHint(idx0, nextLevel)
        }
        return { ...prev, [idx0]: next }
      })
    }, 250)

    return () => clearInterval(timer)
  }, [pace, isGraded, runningBlank, hintLevels, hintLoading])

  const handleBlankFocus = (idx0: number) => {
    setFocusedBlank(idx0)
    if (pace === "off" || isGraded) return
    // 새 빈칸으로 오면 그 빈칸을 재생 상태로 (이전 빈칸은 자동 일시정지, 경과시간은 보존됨)
    setHintElapsed(prev => (prev[idx0] === undefined ? { ...prev, [idx0]: 0 } : prev))
    setRunningBlank(idx0)
  }

  const togglePlay = (idx0: number) => {
    setRunningBlank(prev => (prev === idx0 ? null : idx0))
  }

  const handleSubmit = async () => {
    if (!learningContent) return
    if (!allFilled || isGrading) return

    setIsGrading(true)
    setGradeError(null)

    try {
      const res = await submitLearning(learningContent.lrnId, {
        answers: Object.entries(answers).map(([idx0, userAns]) => ({
          blankOrd: parseInt(idx0, 10) + 1,   // 0-based → 1-based
          userAns,
          hintUsedLv: hintLevels[parseInt(idx0, 10)] ?? 0,
        })),
      })

      const byIdx: Record<number, BlankResult> = {}
      for (const r of res.results) {
        byIdx[r.blankOrd - 1] = r
      }
      setResults(byIdx)
      setSummary({
        correctCount: res.correctCount,
        totalBlanks: res.totalBlanks,
        grade: res.grade,
        overallComment: res.overallComment,
      })
      onGraded?.(learningContent.lrnId, res)

      // 채점 완료 → 힌트 상태 정리
      try {
        sessionStorage.removeItem(hintStorageKey(learningContent.lrnId))
      } catch { }

      // 채점 완료 후 일반 뱃지 체크 (ON_FIRE 등) — 백그라운드
      try {
        const badgeRes = await apiFetch("/api/badges/check/learning", {
          method: "POST",
          body: JSON.stringify({ isPerfect: res.allCorrect }),
        })
        if (badgeRes.ok) {
          const allBadges = await badgeRes.json()
          const newBadges = allBadges.filter((b: any) => b.newlyAchieved)
          if (newBadges.length > 0) onBadgesUnlocked?.(newBadges)
        }
      } catch (badgeErr) {
        console.warn("뱃지 체크 실패", badgeErr)
      }

      if (res.allCorrect) {
        toast.success("✅ 모두 맞혔어요!", {
          description: res.grade ? `등급 ${res.grade}` : undefined,
        })
      } else {
        toast.info(`${res.correctCount}/${res.totalBlanks} 정답`, {
          description: "틀린 빈칸의 아이콘을 눌러 피드백을 확인해 보세요",
        })
      }
    } catch (e: any) {
      console.error("채점 실패:", e)
      setGradeError(e.message || "채점에 실패했어요.")
      toast.error("채점하지 못했어요", { description: e.message })
    } finally {
      setIsGrading(false)
    }
  }

  const handleRetry = () => {
    setResults(null)
    setSummary(null)
    setGradeError(null)
    // answers, 힌트 상태는 유지 — 틀린 것만 고치면 되게
  }

  /** 빈칸 input 스타일 (채점 상태에 따라) */
  const inputClass = (idx0: number) => {
    const base = "bg-card rounded px-2 py-0.5 text-[12px] font-code w-32 focus:outline-none transition-colors"
    if (!isGraded) {
      return `${base} border border-emerald-500/50 focus:border-emerald-400 text-emerald-300`
    }
    const r = results![idx0]
    if (!r) return `${base} border border-border text-muted-foreground`

    // S: 완전정답 초록 / A: 애매정답 노랑 / N: 오답 빨강
    if (r.grdMethod === "S") return `${base} border-2 border-emerald-500 text-emerald-300 cursor-default`
    if (r.grdMethod === "A") return `${base} border-2 border-amber-500 text-amber-300 cursor-default`
    return `${base} border-2 border-rose-500 text-rose-300 cursor-default`
  }


  /** 특정 빈칸의 라이브 코칭 힌트 (코드 줄 아래 인라인 표시용) */
  const renderHintBar = (idx0: number) => {
    if (isGraded || pace === "off" || focusedBlank !== idx0) return null

    const level = hintLevels[idx0] ?? 0
    const contents = hintContents[idx0] ?? {}
    const viewLevel = hintViewLevel[idx0] ?? level
    const elapsed = hintElapsed[idx0] ?? 0
    const isRunning = runningBlank === idx0
    let etaSec: number | null = null
    if (level < 3) {
      const nextThreshold = (level + 1) * PACE_INTERVALS_MS[pace]
      etaSec = Math.max(0, Math.ceil((nextThreshold - elapsed) / 1000))
    }

    const levelMeta: Record<number, { tag: string; label: string }> = {
      1: { tag: "Lv.1", label: "개념" },
      2: { tag: "Lv.2", label: "설명" },
      3: { tag: "Lv.3", label: "부분 정답" },
    }

    return (
      <div
        className="ml-12 my-2 mr-4 rounded-xl bg-card border border-border overflow-hidden"
        style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.45)" }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="font-ko text-[10px] font-bold tracking-widest" style={{ color: BRAND }}>
              LIVE COACHING
            </span>
            <span className="font-ko text-[10px] text-muted-foreground">·</span>
            <span className="font-ko text-[10px] text-muted-foreground">빈칸 #{idx0 + 1}</span>
          </div>
          <div className="flex items-center gap-2">
            {level < 3 && (
              <button
                type="button"
                onClick={() => togglePlay(idx0)}
                className="flex items-center gap-1 text-muted-foreground hover:text-white transition-colors"
                title={isRunning ? "일시정지" : "재생"}
              >
                {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                <span className="font-ko text-[10px]">
                  {etaSec !== null && <span className="text-foreground/80 font-bold">{etaSec}s</span>}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* 본문 */}
        <div className="px-4 py-3.5 min-h-[52px] flex items-center">
          {level === 0 ? (
            <p className="font-ko text-[11px] text-muted-foreground">잠시 후 첫 힌트가 나와요...</p>
          ) : (
            <div className="w-full">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="font-ko text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: `${BRAND}1a`, color: BRAND }}
                >
                  {levelMeta[viewLevel]?.tag}
                </span>
                <span className="font-ko text-[10px] text-muted-foreground">{levelMeta[viewLevel]?.label}</span>
              </div>
              {viewLevel === 3 ? (
                <code className="font-code text-[12px] text-amber-300 block bg-background/60 rounded px-2.5 py-1.5 break-all">
                  {contents[3]}
                </code>
              ) : (
                <p className="font-ko text-[12px] text-foreground leading-relaxed">
                  {contents[viewLevel]}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 캐러셀 (레벨 2개 이상일 때만) */}
        {level >= 1 && (
          <div className="flex items-center justify-center gap-4 px-4 py-2 border-t border-white/5 bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setHintViewLevel(prev => ({ ...prev, [idx0]: Math.max(1, viewLevel - 1) }))}
              disabled={viewLevel <= 1}
              className="text-muted-foreground hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* 점 인디케이터 */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map(lv => (
                <span
                  key={lv}
                  className="h-1.5 rounded-full transition-all duration-200"
                  style={{
                    width: lv === viewLevel ? 14 : 6,
                    background: lv === viewLevel ? BRAND : lv <= level ? "var(--muted-foreground)" : "var(--border)",
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setHintViewLevel(prev => ({ ...prev, [idx0]: Math.min(level, viewLevel + 1) }))}
              disabled={viewLevel >= level}
              className="text-muted-foreground hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className={`transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${panelOpen ? "w-[350px]" : "w-0"}`}>
        <div className="w-[350px] h-full overflow-auto bg-card">
          <div className="p-5 space-y-6">
            <button
              onClick={onBack}
              className="font-ko text-[11px] text-muted-foreground hover:text-foreground/80 transition-colors flex items-center gap-2"
            >
              ← Back to Archive
            </button>

            <div>
              <p className="font-ko text-[10px] tracking-widest mb-1.5" style={{ color: BRAND }}>// LEARNING</p>
              {editingTitle ? (
                <input
                  autoFocus
                  value={titleDraft}
                  onChange={e => setTitleDraft(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={e => {
                    if (e.key === "Enter") { e.preventDefault(); handleTitleSave() }
                    if (e.key === "Escape") { e.preventDefault(); setTitleDraft(displayTitle); setEditingTitle(false) }
                  }}
                  disabled={savingTitle}
                  className="font-syne text-2xl font-bold text-foreground leading-tight bg-transparent border-b border-white/20 focus:border-[#63C1ED] outline-none w-full"
                />
              ) : (
                <h2
                  className="font-syne text-2xl font-bold text-foreground leading-tight group flex items-center gap-2 cursor-text"
                  onClick={() => setEditingTitle(true)}
                  title="클릭해서 이름 변경"
                >
                  {displayTitle}
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground group-hover:text-muted-foreground transition-colors shrink-0" />
                </h2>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="font-ko text-[11px] text-muted-foreground">{session.date}</span>
                <span className="font-ko text-[10px] px-2 py-0.5 rounded bg-white/5 border border-border text-foreground/80">{session.grade}</span>
              </div>
            </div>

            <Card className="bg-card border-white/5">
              <CardContent className="p-5">
                <p className="font-ko text-[10px] tracking-widest mb-3 text-rose-400">// ORIGINAL CONCEPTS</p>
                <p className="font-ko text-xs text-muted-foreground mb-4 leading-relaxed">
                  {userName}님이 작성한 코드에는 아래 패턴이 들어가 있어요.
                </p>
                {originalConcepts.length === 0 ? (
                  <p className="font-ko text-xs text-muted-foreground italic">개념 정보가 없습니다.</p>
                ) : (
                  originalConcepts.map((c, i) => (
                    <div key={i} className="mb-4 last:mb-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                        <span className="font-ko text-[13px] text-foreground font-bold">{c.title}</span>
                      </div>
                      <p className="font-ko text-xs text-muted-foreground leading-relaxed pl-3.5">{c.description}</p>
                      {c.referenceUrl && (
                        <a
                          href={c.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-ko text-[11px] text-rose-400/80 hover:text-rose-300 underline pl-3.5 mt-1.5 inline-flex items-center gap-1"
                        >
                          참고 링크 <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-white/5" style={{ background: `${BRAND}08`, borderColor: `${BRAND}20` }}>
              <CardContent className="p-5">
                <p className="font-ko text-[10px] tracking-widest mb-3" style={{ color: BRAND }}>// OPTIMIZED CONCEPTS</p>
                <p className="font-ko text-xs text-muted-foreground mb-4 leading-relaxed">
                  아래 개념을 사용하면 코드를 최적화할 수 있어요.
                </p>
                {optimizedConcepts.length === 0 ? (
                  <p className="font-ko text-xs text-muted-foreground italic">개념 정보가 없습니다.</p>
                ) : (
                  optimizedConcepts.map((c, i) => (
                    <div key={i} className="mb-4 last:mb-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: BRAND }} />
                        <span className="font-ko text-[13px] text-foreground font-bold">{c.title}</span>
                      </div>
                      <p className="font-ko text-xs text-muted-foreground leading-relaxed pl-3.5">{c.description}</p>
                      {c.referenceUrl && (
                        <a
                          href={c.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-ko text-[11px] hover:underline pl-3.5 mt-1.5 inline-flex items-center gap-1"
                          style={{ color: BRAND }}
                        >
                          참고 링크 <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-white/5">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="font-syne text-sm font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" style={{ color: BRAND }} /> Performance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="h-48 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={complexityComparisonData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="originalGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="optimizedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={BRAND} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={BRAND} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} vertical={false} />
                      <XAxis dataKey="name" stroke="var(--muted-foreground)"
                        tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: 'Space Mono' }}
                        tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--muted-foreground)"
                        tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: 'Space Mono' }}
                        tickLine={false} axisLine={false} width={45} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px" }}
                        labelStyle={{ color: "var(--muted-foreground)", fontFamily: 'Space Mono', marginBottom: '4px' }} />
                      <Legend
                        wrapperStyle={{ fontSize: "11px", fontFamily: 'Space Mono', paddingTop: '10px' }}
                        iconType="circle"
                        formatter={v => <span style={{ color: "var(--muted-foreground)" }}>{v === "original" ? "Original" : "Optimized"}</span>}
                      />
                      // original
                      <Area type="monotone" dataKey="original" stroke="#f43f5e" strokeWidth={2}
                        fill="url(#originalGrad)"
                        dot={{ fill: "var(--card)", stroke: "#f43f5e", strokeWidth: 2, r: 3 }} name="original" />

// optimized
                      <Area type="monotone" dataKey="optimized" stroke={BRAND} strokeWidth={2.5}
                        fill="url(#optimizedGrad)"
                        dot={{ fill: "var(--card)", stroke: BRAND, strokeWidth: 2, r: 4 }} name="optimized" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="w-px bg-muted relative flex items-center justify-center shrink-0">
        <button
          onClick={() => setPanelOpen(p => !p)}
          className="absolute z-10 w-5 h-10 bg-card hover:bg-accent border border-border rounded-md flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
        >
          {panelOpen ? "‹" : "›"}
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col border-r border-border/50">
            <div className="px-5 py-3 border-b border-border/50 bg-background">
              <span className="font-ko text-xs font-bold text-foreground/80">Original code</span>
            </div>
            <div className="flex-1 overflow-auto font-code text-[13px] leading-7 py-3">
              {originalLines.length === 0 || (originalLines.length === 1 && originalLines[0] === "") ? (
                <p className="px-5 text-muted-foreground text-xs italic">원본 코드가 없습니다.</p>
              ) : originalLines.map((line, idx) => (
                <div key={idx} className="flex px-2">
                  <div className="w-10 text-right pr-4 select-none text-muted-foreground">{idx + 1}</div>
                  <div className="flex-1 whitespace-pre text-foreground/80">{highlightLine(line)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="px-5 py-3 border-b border-border/50 bg-background flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-ko text-xs font-bold" style={{ color: BRAND }}>
                  Fill in the blanks ({filledCount}/{blankCount})
                </span>
                {!isGraded && (draftSaving || draftSavedAt) && (
                  <span className="flex items-center gap-1 font-ko text-[10px] text-muted-foreground">
                    {draftSaving ? (
                      <>
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Check className="h-2.5 w-2.5 text-emerald-500/70" />
                        {draftSavedAt!.toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })} 저장됨
                      </>
                    )}
                  </span>
                )}
              </div>
              {isGraded && summary ? (
                <span className={`font-ko text-[10px] px-2 py-0.5 rounded border ${summary.correctCount === summary.totalBlanks
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/40 text-rose-400"
                  }`}>
                  {summary.correctCount}/{summary.totalBlanks} 정답
                  {summary.grade && ` · ${summary.grade}`}
                </span>
              ) : blankCount > 0 && pace !== "off" && (
                <span className="flex items-center gap-1.5 font-ko text-[10px] font-bold tracking-wide" style={{ color: BRAND }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: BRAND, boxShadow: `0 0 6px ${BRAND}` }} />
                  LIVE COACHING ON
                </span>
              )}
            </div>

            <div className="flex-1 overflow-auto font-code text-[13px] leading-7 py-3">
              {parsedLines.length === 0 || blankCode === "" ? (
                <p className="px-5 text-muted-foreground text-xs italic">빈칸 코드가 없습니다.</p>
              ) : parsedLines.map((line, idx) => {
                // 이 줄에 포커스된 빈칸이 있는지
                const focusedInLine =
                  focusedBlank !== null &&
                  line.tokens.some(t => t.type === "blank" && t.blankIdx === focusedBlank)

                return (
                  <Fragment key={idx}>
                    <div
                      className={`flex px-2 ${line.hasBlank ? "bg-emerald-500/10 border-l-2 border-emerald-500/60" : "border-l-2 border-transparent"}`}
                    >
                      <div className="w-10 text-right pr-4 select-none text-muted-foreground">{line.lineNo}</div>
                      <div className="flex-1 whitespace-pre text-foreground/80 flex items-center flex-wrap">
                        {line.tokens.map((t, ti) => {
                          if (t.type === "text") {
                            return <span key={ti}>{highlightLine(t.value)}</span>
                          }
                          const idx0 = t.blankIdx!
                          const concept = concepts[idx0]
                          const result = isGraded ? results![idx0] : null

                          return (
                            <span key={ti} className="inline-flex items-center gap-1 mx-0.5 align-middle">
                              <input
                                type="text"
                                value={answers[idx0] ?? ""}
                                onChange={(e) => setAnswers(prev => ({ ...prev, [idx0]: e.target.value }))}
                                onFocus={() => handleBlankFocus(idx0)}
                                readOnly={isGraded || isGrading}
                                placeholder={`#${idx0 + 1}`}
                                className={inputClass(idx0)}
                              />
                              {result && <ResultPopover result={result} />}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                    {focusedInLine && renderHintBar(focusedBlank!)}
                  </Fragment>
                )
              })}
            </div>

            {/* AI 총평 */}
            {isGraded && summary?.overallComment && (
              <div className="border-t border-border/50 bg-background px-5 py-4">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 shrink-0 mt-0.5" style={{ color: BRAND }} />
                  <div className="min-w-0">
                    <p className="font-ko text-[10px] tracking-widest mb-1.5" style={{ color: BRAND }}>
                      // AI COMMENT
                    </p>
                    <p className="font-ko text-[12px] text-foreground/80 leading-relaxed">
                      {summary.overallComment}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {blankCount > 0 && (
              <div className="border-t border-border/50 bg-background px-5 py-3 flex items-center justify-between">
                <span className="font-ko text-[11px] text-muted-foreground">
                  {gradeError ? (
                    <span className="text-rose-400">{gradeError}</span>
                  ) : isGrading ? (
                    "채점 중이에요..."
                  ) : isGraded && summary ? (
                    summary.correctCount === summary.totalBlanks
                      ? "모두 맞혔어요! 🎉"
                      : `${summary.totalBlanks - summary.correctCount}개 틀렸어요`
                  ) : allFilled ? (
                    "모든 빈칸을 채웠어요"
                  ) : (
                    `${blankCount - filledCount}개 남음`
                  )}
                </span>

                {isGraded ? (
                  <button
                    onClick={handleRetry}
                    className="h-8 px-4 rounded font-ko text-xs font-bold flex items-center gap-1.5 bg-muted hover:bg-accent text-foreground transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    다시 풀기
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!allFilled || isGrading}
                    className={`h-8 px-4 rounded font-ko text-xs font-bold flex items-center gap-1.5 transition-colors ${allFilled && !isGrading
                      ? "bg-emerald-500 hover:bg-emerald-600 text-foreground"
                      : "bg-emerald-500/20 text-emerald-500/40 cursor-not-allowed"
                      }`}
                  >
                    {isGrading ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" /> 채점 중...</>
                    ) : (
                      <><Check className="h-3.5 w-3.5" /> Submit</>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}