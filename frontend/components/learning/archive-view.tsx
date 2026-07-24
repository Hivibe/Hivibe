"use client"

import { useState } from "react"
import { Star, Flame, FolderOpen, Search } from "lucide-react"
import { SessionCard } from "@/components/learning/session-card"
import type { LearningSession } from "@/types"

const GRADE_POINTS: Record<string, number> = { S: 4, A: 3, B: 2, C: 1, F: 0 }
const POINT_GRADES = ["F", "C", "B", "A", "S"]

function computeAvgGrade(sessions: LearningSession[]): string {
  const graded = sessions.filter(s => s.grade && s.grade !== "-" && s.grade in GRADE_POINTS)
  if (graded.length === 0) return "-"
  const avg = graded.reduce((sum, s) => sum + GRADE_POINTS[s.grade], 0) / graded.length
  const idx = Math.max(0, Math.min(POINT_GRADES.length - 1, Math.round(avg)))
  return POINT_GRADES[idx]
}

function computeDayStreak(sessions: LearningSession[]): number {
  const days = new Set(
    sessions
      .filter(s => s.createdAtIso)
      .map(s => new Date(s.createdAtIso).toDateString())
  )
  if (days.size === 0) return 0

  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  // 오늘 학습이 없으면 어제부터 이어지는 스트릭을 인정
  if (!days.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(cursor.toDateString())) return 0
  }

  while (days.has(cursor.toDateString())) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

interface ArchiveViewProps {
  sessions: LearningSession[]
  onSelectSession: (id: number) => void
  onToggleFav: (id: number) => void
  onDeleteSession: (id: number) => void
}

export function ArchiveView({ sessions, onSelectSession, onToggleFav, onDeleteSession }: ArchiveViewProps) {
  const [langFilter, setLangFilter] = useState("All")
  const [favOnly,    setFavOnly]    = useState(false)
  const [search,     setSearch]     = useState("")

  const favSessions    = sessions.filter(s => s.favorited)
  const recentSessions = sessions.filter(s => !s.favorited)

  const totalSessions = sessions.length
  const avgGrade = computeAvgGrade(sessions)
  const dayStreak = computeDayStreak(sessions)

  const filtered = (list: LearningSession[]) =>
    list
      .filter(s => langFilter === "All" || s.language === langFilter)
      .filter(s =>
        search === "" ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )

  return (
    <div className="flex-1 overflow-auto bg-[#111114]"> {/* --surface-1 */}
      <div className="max-w-6xl mx-auto px-10 py-12">
        
        {/* 헤더 타이틀 영역 */}
        <div className="mb-10">
          <p className="font-ko text-[11px] tracking-[0.2em] uppercase mb-3 text-[#63C1ED]">
            // Archive
          </p>
          <h1 className="font-syne text-5xl font-bold text-white tracking-tight">
            Learning Archive
          </h1>
        </div>

        {/* 검색바 */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by keywords or tags..."
            className="w-full bg-[#17171b] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 font-ko text-sm text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-[#63C1ED]/50 focus:ring-1 focus:ring-[#63C1ED]/20 transition-all" 
          />
        </div>

        {/* 필터 칩 */}
        <div className="flex items-center gap-2 mb-10 flex-wrap">
          {["All", "Java", "Python", "C++"].map(l => (
            <button key={l} onClick={() => setLangFilter(l)}
              className={`font-ko text-[11px] px-4 py-1.5 rounded-full border transition-all ${
                langFilter === l
                  ? "bg-[#63C1ED]/10 text-[#63C1ED] border-[#63C1ED]/30"
                  : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600"
              }`}>
              {l}
            </button>
          ))}
          <div className="w-px h-4 bg-zinc-800 mx-2"></div> {/* 구분선 */}
          <button onClick={() => setFavOnly(!favOnly)}
            className={`font-ko text-[11px] px-4 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
              favOnly
                ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600"
            }`}>
            <Star className={`h-3 w-3 ${favOnly ? "fill-amber-500" : ""}`} />
            Starred
          </button>
        </div>

        {/* 대시보드 통계 */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {[
            { icon: <FolderOpen className="h-4 w-4 text-[#63C1ED]" />, val: String(totalSessions), label: "Total Sessions" },
            { icon: <Star className="h-4 w-4 text-amber-400" />, val: avgGrade, label: "Avg. Grade" },
            { icon: <Flame className="h-4 w-4 text-rose-500" />, val: String(dayStreak), label: "Day Streak" },
            { icon: <Star className="h-4 w-4 text-amber-400 fill-amber-400" />, val: String(favSessions.length), label: "Starred" },
          ].map((s, i) => (
            <div key={i} className="bg-[#17171b] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
              <div className="mb-3">{s.icon}</div>
              <p className="font-syne text-3xl font-bold text-white mb-1">{s.val}</p>
              <p className="font-ko text-[11px] text-zinc-500 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 🌟 Starred (즐겨찾기) 세션 목록 */}
        {!favOnly && filtered(favSessions).length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="font-syne text-sm font-bold text-white tracking-wide uppercase">Starred</span>
              <span className="font-ko text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                {filtered(favSessions).length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filtered(favSessions).map(s => (
                <SessionCard key={s.id} s={s} compact
                  onSelect={() => onSelectSession(s.id)}
                  onFav={() => onToggleFav(s.id)}
                  onDelete={() => onDeleteSession(s.id)} />
              ))}
            </div>
          </div>
        )}

        {/* 🕒 Recent (최근) 세션 목록 */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-syne text-sm font-bold text-zinc-400 tracking-wide uppercase">
              {favOnly ? "Starred Sessions" : "Recent Sessions"}
            </span>
            <span className="font-ko text-[10px] px-2 py-0.5 rounded-full border border-zinc-800 text-zinc-500">
              {favOnly ? filtered(favSessions).length : filtered(recentSessions).length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {filtered(favOnly ? favSessions : recentSessions).map(s => (
              <SessionCard key={s.id} s={s} compact
                onSelect={() => onSelectSession(s.id)}
                onFav={() => onToggleFav(s.id)}
                onDelete={() => onDeleteSession(s.id)} />
            ))}
          </div>
        </div>
        
      </div>
    </div>
  )
}