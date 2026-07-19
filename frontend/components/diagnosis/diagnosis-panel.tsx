"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, Activity as ActivityIcon } from "lucide-react"
import {
  ResponsiveContainer, LineChart, Line,
  CartesianGrid, XAxis, YAxis,
  Tooltip as RechartsTooltip,
} from "recharts"

const BRAND = "#63C1ED"

const getComplexityData = (complexity: string) => {
  const ns = [10, 50, 100, 200, 500]
  if (complexity.includes("O(1)"))
    return ns.map(n => ({ n, time: 1 }))
  if (complexity.includes("O(log n)"))
    return ns.map(n => ({ n, time: Math.round(Math.log2(n) * 10) }))
  if (complexity.includes("O(n log n)"))
    return ns.map(n => ({ n, time: Math.round(n * Math.log2(n)) }))
  if (complexity.includes("O(n²)") || complexity.includes("O(n^2)"))
    return ns.map(n => ({ n, time: n * n }))
  if (complexity.includes("O(n³)") || complexity.includes("O(n^3)"))
    return ns.map(n => ({ n, time: n * n * n }))
  return ns.map(n => ({ n, time: n * 10 }))
}

interface DiagnosisPanelProps {
  hasAnalyzed: boolean
  isAnalyzing?: boolean
  aiResult?: any
}

export function DiagnosisPanel({ hasAnalyzed, isAnalyzing, aiResult }: DiagnosisPanelProps) {

  const data = aiResult || {
    summary: "결과를 불러오지 못했습니다.",
    totalScore: 0, accuracy: 0, efficiency: 0, readability: 0, style: 0,
    accuracyReason: "-", efficiencyReason: "-", readabilityReason: "-", styleReason: "-",
    complexity: "-",
  }

  const getGrade = (score: number) => {
    if (score >= 90) return 'S'
    if (score >= 80) return 'A'
    if (score >= 70) return 'B'
    if (score >= 60) return 'C'
    return 'F'
  }

  return (
    <div className="p-5 space-y-4">
      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center h-[56vh] gap-5 text-center px-6">
          <div className="flex items-center gap-2">
            {[0, 1, 2].map(i => (
              <span key={i}
                className="w-2.5 h-2.5 rounded-full animate-bounce"
                style={{ background: BRAND, animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
          <div>
            <p className="font-ko text-sm font-semibold text-zinc-300">AI가 코드를 분석 중입니다...</p>
            <p className="font-ko text-[13px] text-zinc-500 mt-1.5 leading-relaxed">잠시만 기다려 주세요!</p>
          </div>
        </div>
      ) : !hasAnalyzed ? (
        <div className="flex flex-col items-center justify-center h-[56vh] gap-4 text-center px-6">
          <div className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center"
            style={{ background: `${BRAND}08` }}>
            <ActivityIcon className="h-6 w-6" style={{ color: `${BRAND}55` }} />
          </div>
          <div>
            <p className="font-ko text-sm font-semibold text-zinc-300">코드를 입력하고 분석을 시작하세요</p>
            <p className="font-ko text-[13px] text-zinc-500 mt-1.5 leading-relaxed">
              오른쪽 에디터에 코드를 붙여넣고<br />Run Analysis를 눌러 주세요
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* AI Analysis Result */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="font-syne text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: BRAND }} />AI Analysis Result
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="font-ko text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {data.summary}
              </div>
            </CardContent>
          </Card>

          {/* Code Quality Score */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="font-syne text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />Code Quality Score
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 shrink-0">
                  <svg className="w-28 h-28 -rotate-90">
                    <circle cx="56" cy="56" r="46" stroke="#27272a" strokeWidth="9" fill="none" />
                    <circle cx="56" cy="56" r="46" stroke="#f59e0b" strokeWidth="9" fill="none"
                      strokeDasharray={`${(data.totalScore / 100) * 289} 289`}
                      style={{ filter: "drop-shadow(0 0 6px #f59e0b88)", transition: "stroke-dasharray 1s ease-out" }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-syne text-3xl font-bold text-amber-400">{getGrade(data.totalScore)}</span>
                    <span className="font-space text-xs text-zinc-400 mt-0.5">{data.totalScore}/100</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3.5">
                  {[
                    { l: "Accuracy", v: data.accuracy, c: "bg-amber-500" },
                    { l: "Efficiency", v: data.efficiency, c: "bg-rose-500" },
                    { l: "Readability", v: data.readability, c: "bg-amber-500" },
                    { l: "Style", v: data.style, c: "bg-rose-500" },
                  ].map(s => (
                    <div key={s.l}>
                      <div className="flex justify-between mb-1.5">
                        <span className="font-space text-xs text-zinc-400">{s.l}</span>
                        <span className="font-space text-xs text-zinc-300">{s.v}/100</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${s.c} rounded-full transition-all duration-1000`} style={{ width: `${s.v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="font-syne text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-zinc-400" />Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-5">
              {[
                { label: "Accuracy", score: data.accuracy, reason: data.accuracyReason },
                { label: "Efficiency", score: data.efficiency, reason: data.efficiencyReason },
                { label: "Readability", score: data.readability, reason: data.readabilityReason },
                { label: "Style", score: data.style, reason: data.styleReason },
              ].map(item => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-syne text-sm font-bold text-zinc-100">{item.label}</span>
                    <span className="font-space text-xs text-zinc-500">{item.score}/100</span>
                  </div>
                  <p className="font-ko text-sm text-zinc-400 leading-relaxed">{item.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Current Complexity */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2 pt-5 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="font-syne text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-rose-400" />Current Complexity
                </CardTitle>
                <span className="font-space text-xs px-2.5 py-1 rounded border bg-rose-500/15 text-rose-400 border-rose-500/25">
                  {data.complexity}
                </span>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getComplexityData(data.complexity)} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.4} />
                    <XAxis dataKey="n" stroke="#52525b" tick={{ fill: "#71717a", fontSize: 11 }}
                      label={{ value: "Input (N)", position: "insideBottom", offset: -4, fill: "#71717a", fontSize: 11 }} />
                    <YAxis stroke="#52525b" tick={{ fill: "#71717a", fontSize: 11 }} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "12px" }}
                      labelStyle={{ color: "#d4d4d8" }} />
                    <Line type="monotone" dataKey="time" stroke="#f43f5e" strokeWidth={2.5}
                      dot={{ fill: "#f43f5e", r: 3 }} name="Time"
                      style={{ filter: "drop-shadow(0 0 5px rgba(244,63,94,0.5))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}