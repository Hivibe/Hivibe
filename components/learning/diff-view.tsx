// components/learning/diff-view.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area,
  LineChart, Line, CartesianGrid,
  XAxis, YAxis, Tooltip as RechartsTooltip, Legend,
} from "recharts"
import type { LearningSession } from "@/types"

const BRAND = "#63C1ED"

const complexityComparisonData = [
  { name: "10",  original: 100,    optimized: 10  },
  { name: "50",  original: 2500,   optimized: 50  },
  { name: "100", original: 10000,  optimized: 100 },
  { name: "200", original: 40000,  optimized: 200 },
  { name: "500", original: 250000, optimized: 500 },
]

interface DiffViewProps {
  session: LearningSession
  analyzedCode: string
  onBack: () => void
}

export function DiffView({ session, analyzedCode, onBack }: DiffViewProps) {
  return (
    <div className="flex h-full overflow-hidden">
      {/* 좌측 패널 */}
      <div className="w-[38%] min-w-[280px] overflow-auto bg-zinc-950">
        <div className="p-4 space-y-4">
          <button onClick={onBack}
            className="font-space text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
            ← Archive로 돌아가기
          </button>

          <div>
            <p className="font-space text-[10px] tracking-widest mb-1" style={{ color: BRAND }}>// LEARNING</p>
            <h2 className="font-syne text-lg font-bold text-zinc-100">{session.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-space text-[10px] text-zinc-500">{session.date}</span>
              <span className="font-space text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">{session.grade}</span>
            </div>
          </div>

          {/* Original 개념 카드 */}
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardContent className="p-4">
              <p className="font-space text-[10px] tracking-widest mb-3 text-rose-400">// ORIGINAL CODE에서 사용된 개념</p>
              <p className="font-space text-[10px] text-zinc-500 mb-3 leading-relaxed">사용자가 작성한 코드에는 아래 패턴이 들어가 있어요.</p>
              {["이중 반복문", "input()의 사용", "버블 정렬"].map((c, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-1 w-1 rounded-full bg-rose-400 shrink-0" />
                    <span className="font-space text-xs text-zinc-200 font-bold">{c}</span>
                  </div>
                  <p className="font-space text-[10px] text-zinc-500 leading-relaxed pl-3">
                    중첩 반복문은 한쪽이 반복될 때 상대쪽도 반복되어 성능이 저하돼요.
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Optimized 개념 카드 */}
          <Card className="border-zinc-800" style={{ background: `${BRAND}06`, borderColor: `${BRAND}20` }}>
            <CardContent className="p-4">
              <p className="font-space text-[10px] tracking-widest mb-3" style={{ color: BRAND }}>// OPTIMIZED CODE에 적용할 개념</p>
              <p className="font-space text-[10px] text-zinc-500 mb-3 leading-relaxed">아래 개념을 사용하면 코드를 최적화할 수 있어요.</p>
              {["HashMap", "input()의 사용", "버블 정렬"].map((c, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-1 w-1 rounded-full shrink-0" style={{ background: BRAND }} />
                    <span className="font-space text-xs text-zinc-200 font-bold">{c}</span>
                  </div>
                  <p className="font-space text-[10px] text-zinc-500 leading-relaxed pl-3">
                    HashMap을 사용하면 O(1) 시간에 값을 조회할 수 있어요.
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 퍼포먼스 그래프 */}
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="font-syne text-xs font-semibold text-zinc-100 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5" style={{ color: BRAND }} />Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={complexityComparisonData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="bf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={BRAND} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={BRAND} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.4} />
                    <XAxis dataKey="name" stroke="#52525b" tick={{ fill: "#52525b", fontSize: 10 }} />
                    <YAxis stroke="#52525b" tick={{ fill: "#52525b", fontSize: 10 }} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "6px", fontSize: "11px" }}
                      labelStyle={{ color: "#a1a1aa" }}
                      formatter={(v: number, n: string) => [v.toLocaleString(), n === "original" ? "Original O(n²)" : "Optimized O(n)"]} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} iconType="line"
                      formatter={v => v === "original" ? "Original O(n²)" : "Optimized O(n)"} />
                    <Area type="monotone" dataKey="original" stroke="transparent" fill="url(#bf)" legendType="none" tooltipType="none" />
                    <Line type="monotone" dataKey="original"  stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#f43f5e", r: 2 }} name="original" />
                    <Line type="monotone" dataKey="optimized" stroke={BRAND}    strokeWidth={2.5} dot={{ fill: BRAND, r: 3 }} name="optimized" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 우측 코드 diff */}
      <div className="flex-1 flex overflow-hidden">
        {/* Original */}
        <div className="flex-1 flex flex-col border-r border-zinc-800">
          <div className="px-4 py-2 bg-zinc-900/30 border-b border-zinc-800">
            <span className="font-space text-[10px] text-zinc-500 tracking-widest uppercase">Original code</span>
          </div>
          <div className="flex-1 overflow-auto bg-[#141414] font-code text-[12px]">
            <div className="flex">
              <div className="px-3 py-4 text-zinc-700 text-right select-none border-r border-zinc-800 min-w-[36px]">
                {[1,2,3,4,5,6,7,8,9,10,11].map(n => <div key={n} className="leading-6">{n}</div>)}
              </div>
              <pre className="flex-1 py-4 text-zinc-300 leading-6"><code>
                {analyzedCode ? (
                  <div className="px-4 whitespace-pre-wrap">{analyzedCode}</div>
                ) : (
                  <>
                    <div className="px-4"><span className="text-purple-400">public</span> <span className="text-blue-400">class</span> <span className="text-emerald-400">Solution</span> {"{"}</div>
                    <div className="px-4 bg-rose-900/15 border-l-2 border-rose-500">{"    "}<span className="text-purple-400">for</span>{" (int i=0;i<n;i++) {"}</div>
                    <div className="px-4 bg-rose-900/15 border-l-2 border-rose-500">{"        "}<span className="text-purple-400">for</span>{" (int j=i+1;j<n;j++) {"}</div>
                    <div className="px-4 bg-rose-900/15 border-l-2 border-rose-500">{"            if(nums[i]+nums[j]==t)"}</div>
                    <div className="px-4 bg-rose-900/15 border-l-2 border-rose-500">{"                return new int[]{i,j};"}</div>
                    <div className="px-4 bg-rose-900/15 border-l-2 border-rose-500">{"        }}"}</div>
                    <div className="px-4 bg-rose-900/15 border-l-2 border-rose-500">{"    }}"}</div>
                    <div className="px-4">{"    return new int[]{};"}</div>
                    <div className="px-4">{"}"}</div>
                  </>
                )}
              </code></pre>
            </div>
          </div>
        </div>

        {/* Optimized */}
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-2 bg-zinc-900/30 border-b border-zinc-800">
            <span className="font-space text-[10px] tracking-widest uppercase" style={{ color: BRAND }}>Optimized code</span>
          </div>
          <div className="flex-1 overflow-auto bg-[#141414] font-code text-[12px]">
            <div className="flex">
              <div className="px-3 py-4 text-zinc-700 text-right select-none border-r border-zinc-800 min-w-[36px]">
                {[1,2,3,4,5,6,7,8,9,10,11,12,13].map(n => <div key={n} className="leading-6">{n}</div>)}
              </div>
              <pre className="flex-1 py-4 text-zinc-100 leading-6"><code>
                <div className="px-4"><span className="text-purple-400">public</span> <span className="text-blue-400">class</span> <span className="text-emerald-400">Solution</span> {"{"}</div>
                <div className="px-4">{"  "}<span className="text-purple-400">public</span> int[] twoSum(int[] nums, int t) {"{"}</div>
                <div className="px-4" style={{ background: `${BRAND}0a`, borderLeft: `2px solid ${BRAND}` }}>{"    Map<Integer,Integer> map=new HashMap<>();"}</div>
                <div className="px-4" style={{ background: `${BRAND}0a`, borderLeft: `2px solid ${BRAND}` }}>{"    "}<span className="text-purple-400">for</span>(int i=0;i{"<"}nums.length;i++) {"{"}</div>
                <div className="px-4" style={{ background: `${BRAND}0a`, borderLeft: `2px solid ${BRAND}` }}>{"        int c=t-nums[i];"}</div>
                <div className="px-4" style={{ background: `${BRAND}0a`, borderLeft: `2px solid ${BRAND}` }}>{"        "}<span className="text-purple-400">if</span>(map.containsKey(c))</div>
                <div className="px-4" style={{ background: `${BRAND}0a`, borderLeft: `2px solid ${BRAND}` }}>{"            return new int[]{map.get(c),i};"}</div>
                <div className="px-4" style={{ background: `${BRAND}0a`, borderLeft: `2px solid ${BRAND}` }}>{"        map.put(nums[i],i);"}</div>
                <div className="px-4" style={{ background: `${BRAND}0a`, borderLeft: `2px solid ${BRAND}` }}>{"    }"}</div>
                <div className="px-4">{"    return new int[]{};"}</div>
                <div className="px-4">{"  }"}</div>
                <div className="px-4">{"}"}</div>
              </code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}