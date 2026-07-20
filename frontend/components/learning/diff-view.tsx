"use client"

import { useState, useMemo, useEffect, Fragment } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TrendingUp, HelpCircle, Check, X, MessageSquare, ExternalLink, Loader2, RotateCcw, Eye, EyeOff, Sparkles } from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area,
  Line, CartesianGrid,
  XAxis, YAxis, Tooltip as RechartsTooltip, Legend,
} from "recharts"
import type { LearningSession } from "@/types"
import { apiFetch, submitLearning, type AiLearningResponse, type BlankResult } from "@/lib/api"
import { toast } from "sonner"

const BRAND = "#63C1ED"

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
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
          title="코멘트 보기"
        >
          <MessageSquare className="h-3 w-3" />        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="max-w-sm bg-zinc-900 border-zinc-700 p-4 space-y-3">
        <p className={`font-ko font-bold text-xs ${headerColor}`}>{headerText}</p>

        {/* 완전정답(S) — 개념 설명 */}
        {isExactPass && result.conceptTitle && (
          <div>
            <p className="font-ko text-[12px] text-zinc-200 font-bold mb-1.5">{result.conceptTitle}</p>
            {result.conceptDesc && (
              <p className="font-ko text-[11px] text-zinc-400 leading-relaxed">{result.conceptDesc}</p>
            )}
          </div>
        )}

        {/* AI 채점(A/N) — 차이점 */}
        {result.diffNote && (
          <p className="font-ko text-[11px] text-zinc-300 leading-relaxed">{result.diffNote}</p>
        )}

        {result.recommend && (
          <div className="pt-2 border-t border-zinc-800">
            <p className="font-ko text-[10px] font-bold mb-1" style={{ color: BRAND }}>💬 추천</p>
            <p className="font-ko text-[11px] text-zinc-400 leading-relaxed">{result.recommend}</p>
          </div>
        )}

        {result.securityNote && (
          <div className="pt-2 border-t border-zinc-800">
            <p className="font-ko text-[10px] font-bold text-orange-400 mb-1">⚠️ 주의</p>
            <p className="font-ko text-[11px] text-zinc-400 leading-relaxed">{result.securityNote}</p>
          </div>
        )}

        {/* 오답 — 정답 보기/가리기 */}
        {isWrong && result.expAns && (
          <div className="pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setShowAnswer(p => !p)}
              className="font-space text-[10px] text-zinc-500 hover:text-zinc-300 underline transition-colors flex items-center gap-1"
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
                <code className="font-code text-[11px] text-emerald-300 block bg-zinc-950 rounded px-2 py-1.5 whitespace-pre-wrap break-all">
                  {result.expAns}
                </code>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function DiffView({ session, analyzedCode, learningContent, onBack }: DiffViewProps) {
  const [panelOpen, setPanelOpen] = useState(true)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [userName, setUserName] = useState<string>("사용자")

  // 채점 상태
  const [isGrading, setIsGrading] = useState(false)
  const [results, setResults] = useState<Record<number, BlankResult> | null>(null)

  const [summary, setSummary] = useState<{
    correctCount: number
    totalBlanks: number
    grade: string | null
    overallComment: string | null
  } | null>(null)

  const [gradeError, setGradeError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch("/api/mypage/me")
      .then(res => res.json())
      .then(data => {
        if (data?.userNm) setUserName(data.userNm)
      })
      .catch(e => console.error("유저 이름 불러오기 실패:", e))
  }, [])

  // 학습 세션이 바뀌면 상태 초기화 (이전 채점 있으면 복원)
  useEffect(() => {
    const prev = learningContent?.previousSubmission
    if (prev && prev.results.length > 0) {
      // 답 복원
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
    } else {
      setAnswers({})
      setResults(null)
      setSummary(null)
    }
    setGradeError(null)
  }, [learningContent?.lrnId])

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
  const isGraded = results !== null

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
          hintUsedLv: 0,                       // 계층적 힌트 붙이면 여기 연결
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

      // 추가 (07.20)

      // 채점 완료 후 일반 뱃지 체크 (ON_FIRE 등) — 백그라운드
      apiFetch("/api/badges/check", { method: "POST" }).catch(() => { })

      // PERFECT_ANSWER 뱃지 — 100% 정답 시
      if (res.allCorrect) {
        apiFetch("/api/badges/check/learning", {
          method: "POST",
          body: JSON.stringify({ isPerfect: true }),
        }).catch(() => { })
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
    // answers는 유지 — 틀린 것만 고치면 되게
  }

  /** 빈칸 input 스타일 (채점 상태에 따라) */
  const inputClass = (idx0: number) => {
    const base = "bg-zinc-900 rounded px-2 py-0.5 text-[12px] font-code w-32 focus:outline-none transition-colors"
    if (!isGraded) {
      return `${base} border border-emerald-500/50 focus:border-emerald-400 text-emerald-300`
    }
    const r = results![idx0]
    if (!r) return `${base} border border-zinc-700 text-zinc-400`

    // S: 완전정답 초록 / A: 애매정답 노랑 / N: 오답 빨강
    if (r.grdMethod === "S") return `${base} border-2 border-emerald-500 text-emerald-300 cursor-default`
    if (r.grdMethod === "A") return `${base} border-2 border-amber-500 text-amber-300 cursor-default`
    return `${base} border-2 border-rose-500 text-rose-300 cursor-default`
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className={`transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${panelOpen ? "w-[350px]" : "w-0"}`}>
        <div className="w-[350px] h-full overflow-auto bg-[#111114]">
          <div className="p-5 space-y-6">
            <button
              onClick={onBack}
              className="font-space text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2"
            >
              ← Back to Archive
            </button>

            <div>
              <p className="font-space text-[10px] tracking-widest mb-1.5" style={{ color: BRAND }}>// LEARNING</p>
              <h2 className="font-syne text-2xl font-bold text-white leading-tight">{session.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-space text-[11px] text-zinc-500">{session.date}</span>
                <span className="font-space text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">{session.grade}</span>
              </div>
            </div>

            <Card className="bg-[#17171b] border-white/5">
              <CardContent className="p-5">
                <p className="font-space text-[10px] tracking-widest mb-3 text-rose-400">// ORIGINAL CONCEPTS</p>
                <p className="font-ko text-xs text-zinc-400 mb-4 leading-relaxed">
                  {userName}님이 작성한 코드에는 아래 패턴이 들어가 있어요.
                </p>
                {originalConcepts.length === 0 ? (
                  <p className="font-ko text-xs text-zinc-600 italic">개념 정보가 없습니다.</p>
                ) : (
                  originalConcepts.map((c, i) => (
                    <div key={i} className="mb-4 last:mb-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                        <span className="font-ko text-[13px] text-zinc-200 font-bold">{c.title}</span>
                      </div>
                      <p className="font-ko text-xs text-zinc-500 leading-relaxed pl-3.5">{c.description}</p>
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
                <p className="font-space text-[10px] tracking-widest mb-3" style={{ color: BRAND }}>// OPTIMIZED CONCEPTS</p>
                <p className="font-ko text-xs text-zinc-400 mb-4 leading-relaxed">
                  아래 개념을 사용하면 코드를 최적화할 수 있어요.
                </p>
                {optimizedConcepts.length === 0 ? (
                  <p className="font-ko text-xs text-zinc-600 italic">개념 정보가 없습니다.</p>
                ) : (
                  optimizedConcepts.map((c, i) => (
                    <div key={i} className="mb-4 last:mb-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: BRAND }} />
                        <span className="font-ko text-[13px] text-zinc-200 font-bold">{c.title}</span>
                      </div>
                      <p className="font-ko text-xs text-zinc-500 leading-relaxed pl-3.5">{c.description}</p>
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

            <Card className="bg-[#17171b] border-white/5">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="font-syne text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" style={{ color: BRAND }} /> Performance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="h-48 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={complexityComparisonData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                      <defs>
                        <linearGradient id="bf" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={BRAND} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={BRAND} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.4} vertical={false} />
                      <XAxis dataKey="name" stroke="#52525b" tick={{ fill: "#52525b", fontSize: 10, fontFamily: 'Space Mono' }} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" tick={{ fill: "#52525b", fontSize: 10, fontFamily: 'Space Mono' }} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "11px" }}
                        labelStyle={{ color: "#a1a1aa", fontFamily: 'Space Mono', marginBottom: '4px' }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "11px", fontFamily: 'Space Mono', paddingTop: '10px' }}
                        iconType="circle"
                        formatter={v => <span className="text-zinc-400">{v === "original" ? "Original" : "Optimized"}</span>}
                      />
                      <Area type="monotone" dataKey="original" stroke="transparent" fill="url(#bf)" legendType="none" tooltipType="none" />
                      <Line type="monotone" dataKey="original" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={{ fill: "#17171b", stroke: "#f43f5e", strokeWidth: 2, r: 3 }} name="original" />
                      <Line type="monotone" dataKey="optimized" stroke={BRAND} strokeWidth={2.5} dot={{ fill: "#17171b", stroke: BRAND, strokeWidth: 2, r: 4 }} name="optimized" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="w-px bg-zinc-800 relative flex items-center justify-center shrink-0">
        <button
          onClick={() => setPanelOpen(p => !p)}
          className="absolute z-10 w-5 h-10 bg-[#17171b] hover:bg-[#27272a] border border-zinc-700 rounded-md flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          {panelOpen ? "‹" : "›"}
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0d0d]">
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col border-r border-zinc-800/50">
            <div className="px-5 py-3 border-b border-zinc-800/50 bg-[#0a0a0c]">
              <span className="font-space text-xs font-bold text-zinc-300">Original code</span>
            </div>
            <div className="flex-1 overflow-auto font-code text-[13px] leading-7 py-3">
              {originalLines.length === 0 || (originalLines.length === 1 && originalLines[0] === "") ? (
                <p className="px-5 text-zinc-600 text-xs italic">원본 코드가 없습니다.</p>
              ) : originalLines.map((line, idx) => (
                <div key={idx} className="flex px-2">
                  <div className="w-10 text-right pr-4 select-none text-zinc-600">{idx + 1}</div>
                  <div className="flex-1 whitespace-pre text-zinc-300">{highlightLine(line)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="px-5 py-3 border-b border-zinc-800/50 bg-[#0a0a0c] flex items-center justify-between">
              <span className="font-space text-xs font-bold" style={{ color: BRAND }}>
                Fill in the blanks ({filledCount}/{blankCount})
              </span>
              {isGraded && summary ? (
                <span className={`font-space text-[10px] px-2 py-0.5 rounded border ${summary.correctCount === summary.totalBlanks
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/40 text-rose-400"
                  }`}>
                  {summary.correctCount}/{summary.totalBlanks} 정답
                  {summary.grade && ` · ${summary.grade}`}
                </span>
              ) : blankCount > 0 && (
                <span className="font-space text-[10px] text-zinc-500">
                  마우스를 <HelpCircle className="h-3 w-3 inline mx-0.5" />에 올려 힌트 보기
                </span>
              )}
            </div>

            <div className="flex-1 overflow-auto font-code text-[13px] leading-7 py-3">
              {parsedLines.length === 0 || blankCode === "" ? (
                <p className="px-5 text-zinc-600 text-xs italic">빈칸 코드가 없습니다.</p>
              ) : parsedLines.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex px-2 ${line.hasBlank ? "bg-emerald-500/10 border-l-2 border-emerald-500/60" : "border-l-2 border-transparent"}`}
                >
                  <div className="w-10 text-right pr-4 select-none text-zinc-600">{line.lineNo}</div>
                  <div className="flex-1 whitespace-pre text-zinc-300 flex items-center flex-wrap">
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
                            readOnly={isGraded || isGrading}
                            placeholder={`#${idx0 + 1}`}
                            className={inputClass(idx0)}
                          />

                          {/* 채점 결과 아이콘 */}
                          {result && <ResultPopover result={result} />}

                          {/* 미채점 상태에서만 힌트 툴팁 */}
                          {!isGraded && (
                            concept ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="text-zinc-500 hover:text-amber-400 transition-colors" type="button">
                                    <HelpCircle className="h-3.5 w-3.5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs bg-zinc-900 border border-amber-500/30">
                                  <p className="font-ko font-bold text-xs text-amber-400 mb-1">💡 {concept.title}</p>
                                  <p className="font-ko text-[11px] text-zinc-300 leading-relaxed">{concept.description}</p>
                                  {concept.referenceUrl && (
                                    <a
                                      href={concept.referenceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-ko text-[11px] text-amber-400 hover:text-amber-300 underline mt-2 inline-flex items-center gap-1"
                                    >
                                      참고 링크 <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <button className="text-zinc-700 cursor-not-allowed" type="button" title="힌트 없음">
                                <HelpCircle className="h-3.5 w-3.5" />
                              </button>
                            )
                          )}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* AI 총평 */}
            {isGraded && summary?.overallComment && (
              <div className="border-t border-zinc-800/50 bg-[#0f0f12] px-5 py-4">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 shrink-0 mt-0.5" style={{ color: BRAND }} />
                  <div className="min-w-0">
                    <p className="font-space text-[10px] tracking-widest mb-1.5" style={{ color: BRAND }}>
                      // AI COMMENT
                    </p>
                    <p className="font-ko text-[12px] text-zinc-300 leading-relaxed">
                      {summary.overallComment}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {blankCount > 0 && (
              <div className="border-t border-zinc-800/50 bg-[#0a0a0c] px-5 py-3 flex items-center justify-between">
                <span className="font-space text-[11px] text-zinc-500">
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
                    className="h-8 px-4 rounded font-space text-xs font-bold flex items-center gap-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    다시 풀기
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!allFilled || isGrading}
                    className={`h-8 px-4 rounded font-space text-xs font-bold flex items-center gap-1.5 transition-colors ${allFilled && !isGrading
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
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