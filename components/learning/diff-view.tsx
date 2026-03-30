// components/learning/diff-view.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area,
  LineChart, Line, CartesianGrid,
  XAxis, YAxis, Tooltip as RechartsTooltip, Legend,
} from "recharts"
import type { LearningSession } from "@/types"

// 🚨 모나코 에디터 import 삭제함!

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
  const [panelOpen, setPanelOpen] = useState(true)

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── 좌측 패널 (기존 코드 그대로 유지) ── */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${
          panelOpen ? "w-[350px]" : "w-0"
        }`}
      >
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

            {/* Original 개념 카드 */}
            <Card className="bg-[#17171b] border-white/5">
              <CardContent className="p-5">
                <p className="font-space text-[10px] tracking-widest mb-3 text-rose-400">// ORIGINAL CONCEPTS</p>
                <p className="font-ko text-xs text-zinc-400 mb-4 leading-relaxed">
                  사용자가 작성한 코드에는 아래 패턴이 들어가 있어요.
                </p>
                {["이중 반복문", "input()의 사용", "버블 정렬"].map((c, i) => (
                  <div key={i} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                      <span className="font-ko text-[13px] text-zinc-200 font-bold">{c}</span>
                    </div>
                    <p className="font-ko text-xs text-zinc-500 leading-relaxed pl-3.5">
                      중첩 반복문은 한쪽이 반복될 때 상대쪽도 반복되어 성능이 저하돼요.
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Optimized 개념 카드 */}
            <Card className="border-white/5" style={{ background: `${BRAND}08`, borderColor: `${BRAND}20` }}>
              <CardContent className="p-5">
                <p className="font-space text-[10px] tracking-widest mb-3" style={{ color: BRAND }}>// OPTIMIZED CONCEPTS</p>
                <p className="font-ko text-xs text-zinc-400 mb-4 leading-relaxed">
                  아래 개념을 사용하면 코드를 최적화할 수 있어요.
                </p>
                {["HashMap", "input()의 사용", "버블 정렬"].map((c, i) => (
                  <div key={i} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: BRAND }} />
                      <span className="font-ko text-[13px] text-zinc-200 font-bold">{c}</span>
                    </div>
                    <p className="font-ko text-xs text-zinc-500 leading-relaxed pl-3.5">
                      HashMap을 사용하면 O(1) 시간에 값을 조회할 수 있어요.
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 퍼포먼스 그래프 */}
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
                          <stop offset="5%"  stopColor={BRAND} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={BRAND} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.4} vertical={false} />
                      <XAxis dataKey="name" stroke="#52525b" tick={{ fill: "#52525b", fontSize: 10, fontFamily: 'Space Mono' }} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" tick={{ fill: "#52525b", fontSize: 10, fontFamily: 'Space Mono' }} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "11px", fontFamily: 'Pretendard' }}
                        labelStyle={{ color: "#a1a1aa", fontFamily: 'Space Mono', marginBottom: '4px' }}
                        formatter={(v: number, n: string) => [v.toLocaleString(), n === "original" ? "Original O(n²)" : "Optimized O(n)"]}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "11px", fontFamily: 'Space Mono', paddingTop: '10px' }}
                        iconType="circle"
                        formatter={v => <span className="text-zinc-400">{v === "original" ? "Original" : "Optimized"}</span>}
                      />
                      <Area type="monotone" dataKey="original" stroke="transparent" fill="url(#bf)" legendType="none" tooltipType="none" />
                      <Line type="monotone" dataKey="original"  stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={{ fill: "#17171b", stroke: "#f43f5e", strokeWidth: 2, r: 3 }} name="original" />
                      <Line type="monotone" dataKey="optimized" stroke={BRAND}    strokeWidth={2.5} dot={{ fill: "#17171b", stroke: BRAND, strokeWidth: 2, r: 4 }} name="optimized" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 토글 버튼 구분선 */}
      <div className="w-px bg-zinc-800 relative flex items-center justify-center shrink-0">
        <button
          onClick={() => setPanelOpen(p => !p)}
          className="absolute z-10 w-5 h-10 bg-[#17171b] hover:bg-[#27272a] border border-zinc-700 rounded-md flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          {panelOpen ? "‹" : "›"}
        </button>
      </div>

      {/* ── 우측 코드 diff (완벽한 시안 맞춤형 커스텀 뷰) ── */}
      <div className="flex-1 flex overflow-hidden bg-[#0d0d0d]">
        
        {/* 🔴 Original Code (Left) */}
        <div className="flex-1 flex flex-col border-r border-zinc-800/50">
          <div className="px-5 py-3 border-b border-zinc-800/50 bg-[#0a0a0c]">
            <span className="font-space text-xs font-bold text-zinc-300">Original code</span>
          </div>
          <div className="flex-1 overflow-auto font-code text-[13px] leading-7 py-3">
            {[
              { n: 1,  text: "public class Solution {", diff: false },
              { n: 2,  text: "    public int[] twoSum(int[] nums, int target) {", diff: false },
              { n: 3,  text: "        for (int i = 0; i < nums.length; i++) {", diff: true },
              { n: 4,  text: "            for (int j = i + 1; j < nums.length; j++) {", diff: true },
              { n: 5,  text: "                if (nums[i] + nums[j] == target) {", diff: true },
              { n: 6,  text: "                    return new int[] { i, j };", diff: true },
              { n: 7,  text: "                }", diff: true },
              { n: 8,  text: "            }", diff: true },
              { n: 9,  text: "        }", diff: true },
              { n: 10, text: "        return new int[] { };", diff: false },
              { n: 11, text: "    }", diff: false },
              { n: 12, text: "}", diff: false },
              { n: 13, text: "", diff: false },
            ].map((line, idx) => (
              <div key={idx} className={`flex px-2 ${line.diff ? "bg-rose-500/15 border-l-2 border-rose-500" : "border-l-2 border-transparent"}`}>
                <div className="w-10 text-right pr-4 select-none text-zinc-600">{line.n}</div>
                <div className="flex-1 whitespace-pre text-zinc-300">
                  {line.text.replace(/public|class|int|return|for|if|new/g, match => `__${match}__`)
                            .split('__').map((part, i) => 
                    ['public','class','return','for','if','new'].includes(part) ? <span key={i} className="text-[#c678dd]">{part}</span> :
                    part === 'int' ? <span key={i} className="text-[#56b6c2]">{part}</span> : part
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🟢 Optimized Code (Right) */}
        <div className="flex-1 flex flex-col">
          <div className="px-5 py-3 border-b border-zinc-800/50 bg-[#0a0a0c]">
            <span className="font-space text-xs font-bold text-emerald-400">Optimized code</span>
          </div>
          <div className="flex-1 overflow-auto font-code text-[13px] leading-7 py-3">
            {[
              { n: 1,  text: "public class Solution {", diff: false },
              { n: 2,  text: "    public int[] twoSum(int[] nums, int target) {", diff: false },
              { n: 3,  text: "        Map<Integer, Integer> map = new HashMap<>();", diff: true },
              { n: 4,  text: "        for (int i = 0; i < nums.length; i++) {", diff: true },
              { n: 5,  text: "            int complement = target - nums[i];", diff: true },
              { n: 6,  text: "            if (map.containsKey(complement)) {", diff: true },
              { n: 7,  text: "                return new int[] { map.get(complement), i };", diff: true },
              { n: 8,  text: "            }", diff: true },
              { n: 9,  text: "            map.put(nums[i], i);", diff: true },
              { n: 10, text: "        }", diff: true },
              { n: 11, text: "        return new int[] { };", diff: false },
              { n: 12, text: "    }", diff: false },
              { n: 13, text: "}", diff: false },
              { n: 14, text: "", diff: false },
            ].map((line, idx) => (
              <div key={idx} className={`flex px-2 ${line.diff ? "bg-emerald-500/15 border-l-2 border-emerald-500" : "border-l-2 border-transparent"}`}>
                <div className="w-10 text-right pr-4 select-none text-zinc-600">{line.n}</div>
                <div className="flex-1 whitespace-pre text-zinc-300">
                   {line.text.replace(/public|class|int|return|for|if|new|Map|HashMap/g, match => `__${match}__`)
                            .split('__').map((part, i) => 
                    ['public','class','return','for','if','new'].includes(part) ? <span key={i} className="text-[#c678dd]">{part}</span> :
                    ['int'].includes(part) ? <span key={i} className="text-[#56b6c2]">{part}</span> : 
                    ['Map','HashMap'].includes(part) ? <span key={i} className="text-[#e5c07b]">{part}</span> : part
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}