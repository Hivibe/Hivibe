"use client"

import { useState, useMemo, Fragment } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TrendingUp, HelpCircle, Check } from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area,
  Line, CartesianGrid,
  XAxis, YAxis, Tooltip as RechartsTooltip, Legend,
} from "recharts"
import type { LearningSession } from "@/types"
import type { AiLearningResponse } from "@/lib/api"

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

export function DiffView({ session, analyzedCode, learningContent, onBack }: DiffViewProps) {
  const [panelOpen, setPanelOpen] = useState(true)
  const [answers, setAnswers] = useState<Record<number, string>>({})

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

  const handleSubmit = () => {
    console.log("[Submit] answers:", answers)
    alert(`제출된 답:\n${JSON.stringify(answers, null, 2)}\n\n(채점 API 연동은 다음 단계)`)
  }

  const filledCount = Object.values(answers).filter(v => v?.trim().length > 0).length
  const allFilled = blankCount > 0 && filledCount === blankCount

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
                  사용자가 작성한 코드에는 아래 패턴이 들어가 있어요.
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
              {originalLines.length === 0 ? (
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
              {blankCount > 0 && (
                <span className="font-space text-[10px] text-zinc-500">
                  마우스를 <HelpCircle className="h-3 w-3 inline mx-0.5" />에 올려 힌트 보기
                </span>
              )}
            </div>
            <div className="flex-1 overflow-auto font-code text-[13px] leading-7 py-3">
              {parsedLines.length === 0 ? (
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
                      return (
                        <span key={ti} className="inline-flex items-center gap-1 mx-0.5 align-middle">
                          <input
                            type="text"
                            value={answers[idx0] ?? ""}
                            onChange={(e) => setAnswers(prev => ({ ...prev, [idx0]: e.target.value }))}
                            placeholder={`#${idx0 + 1}`}
                            className="bg-zinc-900 border border-emerald-500/50 focus:border-emerald-400 focus:outline-none rounded px-2 py-0.5 text-[12px] font-code text-emerald-300 w-32"
                          />
                          {concept ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-zinc-500 hover:text-amber-400 transition-colors" type="button">
                                  <HelpCircle className="h-3.5 w-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs bg-zinc-900 border border-amber-500/30">
                                <p className="font-ko font-bold text-xs text-amber-400 mb-1">💡 {concept.title}</p>
                                <p className="font-ko text-[11px] text-zinc-300 leading-relaxed">{concept.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <button className="text-zinc-700 cursor-not-allowed" type="button" title="힌트 없음">
                              <HelpCircle className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {blankCount > 0 && (
              <div className="border-t border-zinc-800/50 bg-[#0a0a0c] px-5 py-3 flex items-center justify-between">
                <span className="font-space text-[11px] text-zinc-500">
                  {allFilled ? "모든 빈칸을 채웠어요" : `${blankCount - filledCount}개 남음`}
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!allFilled}
                  className={`h-8 px-4 rounded font-space text-xs font-bold flex items-center gap-1.5 transition-colors ${allFilled ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-emerald-500/20 text-emerald-500/40 cursor-not-allowed"}`}
                >
                  <Check className="h-3.5 w-3.5" />
                  Submit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}