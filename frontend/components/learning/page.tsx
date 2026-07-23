"use client"

import { useEffect, useState } from "react"
import { SessionResponse } from "@/lib/api"

export default function LearningPage({ params }: { params: { lrnId: string } }) {
  const [session, setSession] = useState<SessionResponse | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem("currentLrnSession")
    if (stored) {
      const data: SessionResponse = JSON.parse(stored)
      if (String(data.lrnId) === params.lrnId) {
        setSession(data)
      }
    }
    // sessionStorage에 없으면 API로 다시 조회 (조회 API는 다음 단계)
  }, [params.lrnId])

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-zinc-400">학습 세션을 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">학습 세션 #{session.lrnId}</h1>
      
      {/* 임시 표시 - 다음 단계에서 빈칸 채우기 UI로 발전시킬 거 */}
      <div className="space-y-4">
        <section>
          <h2 className="font-semibold mb-2">템플릿 코드 ({session.lang})</h2>
          <pre className="bg-zinc-900 p-4 rounded text-sm overflow-x-auto">
            {session.templateCode}
          </pre>
        </section>
        
        <section>
          <h2 className="font-semibold mb-2">빈칸 {session.blanks.length}개</h2>
          {session.blanks.map(b => (
            <div key={b.blankId} className="bg-zinc-900 p-3 rounded mb-2">
              <p className="text-sm">{b.blankKey} (순서 {b.blankOrd})</p>
              {b.concTitle && (
                <p className="text-xs text-zinc-400 mt-1">개념: {b.concTitle}</p>
              )}
              <p className="text-xs text-zinc-500 mt-1">
                힌트: {[b.hasHintLv1, b.hasHintLv2, b.hasHintLv3].filter(Boolean).length}단계
              </p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="font-semibold mb-2">학습 개념</h2>
          {session.concepts.map(c => (
            <div key={c.concId} className="bg-zinc-900 p-3 rounded mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800">
                  {c.cdType === "O" ? "원본" : "최적화"}
                </span>
                <p className="font-semibold text-sm">{c.concTitle}</p>
              </div>
              <p className="text-xs text-zinc-400 mt-1.5">{c.concDesc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}