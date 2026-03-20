// components/learning/archive-view.tsx
"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Star, Flame, FolderOpen, Search } from "lucide-react"
import { SessionCard } from "@/components/learning/session-card"
import type { LearningSession } from "@/types"

const BRAND = "#63C1ED"

interface ArchiveViewProps {
  sessions: LearningSession[]
  onSelectSession: (id: number) => void
  onToggleFav: (id: number) => void
}

export function ArchiveView({ sessions, onSelectSession, onToggleFav }: ArchiveViewProps) {
  const [langFilter, setLangFilter] = useState("All")
  const [favOnly,    setFavOnly]    = useState(false)
  const [search,     setSearch]     = useState("")

  const favSessions    = sessions.filter(s => s.favorited)
  const recentSessions = sessions.filter(s => !s.favorited)

  const filtered = (list: LearningSession[]) =>
    list
      .filter(s => langFilter === "All" || s.language === langFilter)
      .filter(s =>
        search === "" ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )

  return (
    <div className="flex-1 overflow-auto bg-zinc-950">
      <div className="px-8 py-8">
        <p className="font-space text-[10px] tracking-widest mb-2" style={{ color: BRAND }}>// ARCHIVE</p>
        <h1 className="font-syne text-4xl font-bold text-zinc-100 mb-8">Learning Archive</h1>

        {/* 검색 */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by keywords or tags..."
            className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 font-space text-xs text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-zinc-600 transition-colors" />
        </div>

        {/* 필터 */}
        <div className="flex items-center gap-2 mb-7 flex-wrap">
          {["All", "Java", "Python", "C++"].map(l => (
            <button key={l} onClick={() => setLangFilter(l)}
              className="font-space text-[10px] px-3 py-1 rounded-full border transition-all"
              style={langFilter === l
                ? { background: `${BRAND}15`, color: BRAND, borderColor: `${BRAND}44` }
                : { color: "#71717a", borderColor: "#27272a" }}>
              {l}
            </button>
          ))}
          <button onClick={() => setFavOnly(!favOnly)}
            className="font-space text-[10px] px-3 py-1 rounded-full border transition-all flex items-center gap-1"
            style={favOnly
              ? { background: "#f59e0b22", color: "#f59e0b", borderColor: "#f59e0b44" }
              : { color: "#71717a", borderColor: "#27272a" }}>
            <Star className="h-2.5 w-2.5" />즐겨찾기
          </button>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { icon: <FolderOpen className="h-4 w-4" style={{ color: BRAND }} />, val: "12",  label: "Total Sessions" },
            { icon: <Star className="h-4 w-4 text-amber-400" />,                  val: "B+", label: "Avg. Grade" },
            { icon: <Flame className="h-4 w-4 text-orange-400" />,                val: "7",  label: "Day Streak" },
            { icon: <Star className="h-4 w-4 text-amber-400 fill-amber-400" />,   val: String(favSessions.length), label: "즐겨찾기" },
          ].map((s, i) => (
            <div key={i} className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
              <div className="mb-2">{s.icon}</div>
              <p className="font-syne text-xl font-bold text-zinc-100">{s.val}</p>
              <p className="font-space text-[10px] text-zinc-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 즐겨찾기 섹션 */}
        {!favOnly && filtered(favSessions).length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span className="font-space text-[10px] text-zinc-400 tracking-wider uppercase">즐겨찾기</span>
              <span className="font-space text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                {filtered(favSessions).length}
              </span>
            </div>
            {filtered(favSessions).map(s => (
              <SessionCard key={s.id} s={s}
                onSelect={() => onSelectSession(s.id)}
                onFav={() => onToggleFav(s.id)} />
            ))}
          </div>
        )}

        {/* Recent / 즐겨찾기 필터 목록 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-space text-[10px] text-zinc-500 tracking-widest uppercase">
              {favOnly ? "즐겨찾기" : "Recent Sessions"}
            </span>
            <span className="font-space text-[10px] px-1.5 py-0.5 rounded-full border border-zinc-800 text-zinc-500">
              {favOnly ? filtered(favSessions).length : filtered(recentSessions).length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filtered(favOnly ? favSessions : recentSessions).map(s => (
              <SessionCard key={s.id} s={s} compact
                onSelect={() => onSelectSession(s.id)}
                onFav={() => onToggleFav(s.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}