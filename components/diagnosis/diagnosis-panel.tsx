// components/diagnosis/diagnosis-panel.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, Timer, Activity as ActivityIcon } from "lucide-react"
import {
  ResponsiveContainer, LineChart, Line,
  CartesianGrid, XAxis, YAxis,
  Tooltip as RechartsTooltip,
} from "recharts"

const BRAND = "#63C1ED"

const currentComplexityData = [
  { n: 10,  time: 100    },
  { n: 50,  time: 2500   },
  { n: 100, time: 10000  },
  { n: 200, time: 40000  },
  { n: 500, time: 250000 },
]

interface DiagnosisPanelProps {
  hasAnalyzed: boolean
}

export function DiagnosisPanel({ hasAnalyzed }: DiagnosisPanelProps) {
  return (
    <div className="p-4 space-y-3">
      {!hasAnalyzed ? (
        <div className="flex flex-col items-center justify-center h-[56vh] gap-4 text-center px-6">
          <div className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center"
            style={{ background: `${BRAND}08` }}>
            <ActivityIcon className="h-6 w-6" style={{ color: `${BRAND}55` }} />
          </div>
          <div>
            <p className="font-syne text-sm font-semibold text-zinc-400">코드를 입력하고 분석을 시작하세요</p>
            <p className="font-space text-[11px] text-zinc-600 mt-1.5 leading-relaxed">
              오른쪽 에디터에 코드를 붙여넣고<br />Run Analysis를 눌러주세요
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Score */}
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="font-syne text-xs font-semibold text-zinc-100 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />Code Quality Score
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-center gap-5">
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-24 h-24 -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#27272a" strokeWidth="8" fill="none" />
                    <circle cx="48" cy="48" r="40" stroke="#f59e0b" strokeWidth="8" fill="none"
                      strokeDasharray={`${(52 / 100) * 251.3} 251.3`}
                      style={{ filter: "drop-shadow(0 0 6px #f59e0b88)" }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-syne text-2xl font-bold text-amber-400">C</span>
                    <span className="font-space text-[10px] text-zinc-500">52/100</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2.5">
                  {[
                    { l: "Accuracy",    v: 72, c: "bg-amber-500" },
                    { l: "Efficiency",  v: 28, c: "bg-rose-500"  },
                    { l: "Readability", v: 65, c: "bg-amber-500" },
                    { l: "Style",       v: 44, c: "bg-rose-500"  },
                  ].map(s => (
                    <div key={s.l}>
                      <div className="flex justify-between mb-1">
                        <span className="font-space text-[10px] text-zinc-500">{s.l}</span>
                        <span className="font-space text-[10px] text-zinc-400">{s.v}/100</span>
                      </div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${s.c} rounded-full`} style={{ width: `${s.v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeout Risk */}
          <div className="rounded-xl bg-rose-500/8 border border-rose-900/50 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Timer className="h-3.5 w-3.5 text-rose-500" />
              <span className="font-syne text-xs font-bold text-rose-500">Timeout Risk</span>
            </div>
            <p className="font-space text-[10px] text-rose-300/70 leading-relaxed">
              A nested loop causes O(n²) execution. Will exceed time limit on inputs N &gt; 10,000.
            </p>
          </div>

          {/* Complexity Chart */}
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="font-syne text-xs font-semibold text-zinc-100 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-rose-400" />Current Complexity
                </CardTitle>
                <span className="font-space text-xs px-2 py-0.5 rounded border bg-rose-500/15 text-rose-400 border-rose-500/25">
                  O(n²)
                </span>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentComplexityData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.4} />
                    <XAxis dataKey="n" stroke="#52525b" tick={{ fill: "#52525b", fontSize: 10 }}
                      label={{ value: "Input (N)", position: "insideBottom", offset: -4, fill: "#52525b", fontSize: 10 }} />
                    <YAxis stroke="#52525b" tick={{ fill: "#52525b", fontSize: 10 }} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "6px", fontSize: "11px" }}
                      labelStyle={{ color: "#a1a1aa" }} />
                    <Line type="monotone" dataKey="time" stroke="#f43f5e" strokeWidth={2.5}
                      dot={{ fill: "#f43f5e", r: 3 }} name="O(n²)"
                      style={{ filter: "drop-shadow(0 0 5px rgba(244,63,94,0.5))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 bg-rose-500/8 border border-rose-500/15 rounded-lg p-3">
                <p className="font-space text-[10px] text-rose-200/60 leading-relaxed">
                  Quadratic time complexity detected. Performance will degrade significantly with large inputs.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}