"use client"

import { useState } from "react"
import { Star, FolderOpen, Search } from "lucide-react"
import { SessionCard } from "@/components/learning/session-card"
import type { LearningSession } from "@/types"

const GRADE_POINTS: Record<string, number> = { S: 4, A: 3, B: 2, C: 1, F: 0 }
const POINT_GRADES = ["F", "C", "B", "A", "S"]

function computeAvgGrade(sessions: LearningSession[]): string {
  const graded = sessions.filter(
    s => s.grade && s.grade !== "-" && s.grade in GRADE_POINTS
  )

  if (graded.length === 0) return "-"

  const avg =
    graded.reduce((sum, s) => sum + GRADE_POINTS[s.grade], 0) /
    graded.length

  const idx = Math.max(
    0,
    Math.min(POINT_GRADES.length - 1, Math.round(avg))
  )

  return POINT_GRADES[idx]
}

interface ArchiveViewProps {
  sessions: LearningSession[]
  onSelectSession: (id: number) => void
  onToggleFav: (id: number) => void
  onDeleteSession: (id: number) => void
}

export function ArchiveView({
  sessions,
  onSelectSession,
  onToggleFav,
  onDeleteSession,
}: ArchiveViewProps) {
  const [langFilter, setLangFilter] = useState("All")
  const [favOnly, setFavOnly] = useState(false)
  const [search, setSearch] = useState("")

  const favSessions = sessions.filter(s => s.favorited)
  const recentSessions = sessions.filter(s => !s.favorited)

  const totalSessions = sessions.length
  const avgGrade = computeAvgGrade(sessions)

  const filtered = (list: LearningSession[]) =>
    list
      .filter(s => langFilter === "All" || s.language === langFilter)
      .filter(
        s =>
          search === "" ||
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.tags.some(t =>
            t.toLowerCase().includes(search.toLowerCase())
          )
      )

  const languageFilters = [
    { value: "All", label: "전체" },
    { value: "Java", label: "Java" },
    { value: "Python", label: "Python" },
    { value: "C++", label: "C++" },
  ]

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="max-w-6xl mx-auto px-10 py-12">

        {/* 헤더 타이틀 영역 */}
        <div className="mb-10">
          <h1 className="font-syne text-5xl font-bold text-foreground tracking-tight">
            Learning Archive
          </h1>
        </div>

        {/* 검색바 */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="키워드 또는 태그로 검색"
            className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3.5 font-ko text-sm text-foreground/80 placeholder:text-muted-foreground outline-none focus:border-[#63C1ED]/50 focus:ring-1 focus:ring-[#63C1ED]/20 transition-all"
          />
        </div>

        {/* 필터 칩 */}
        <div className="flex items-center gap-2 mb-10 flex-wrap">
          {languageFilters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setLangFilter(value)}
              className={`font-ko text-[11px] px-4 py-1.5 rounded-full border transition-all ${langFilter === value
                ? "bg-[#63C1ED]/10 text-[#63C1ED] border-[#63C1ED]/30"
                : "bg-transparent text-muted-foreground border-border hover:border-border"
                }`}
            >
              {label}
            </button>
          ))}

          <div className="w-px h-4 bg-muted mx-2" />

          <button
            onClick={() => setFavOnly(!favOnly)}
            className={`font-ko text-[11px] px-4 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${favOnly
              ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
              : "bg-transparent text-muted-foreground border-border hover:border-border"
              }`}
          >
            <Star
              className={`h-3 w-3 ${favOnly ? "fill-amber-500" : ""
                }`}
            />
            즐겨찾기
          </button>
        </div>

        {/* 대시보드 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            {
              icon: (
                <FolderOpen className="h-4 w-4 text-[#63C1ED]" />
              ),
              val: String(totalSessions),
              label: "전체 학습",
            },
            {
              icon: (
                <Star className="h-4 w-4 text-amber-400" />
              ),
              val: avgGrade,
              label: "평균 등급",
            },
            {
              icon: (
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              ),
              val: String(favSessions.length),
              label: "즐겨찾기",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-card border border-zinc-300 dark:border-border rounded-2xl p-5 hover:border-border transition-colors"
            >
              <div className="mb-3">{s.icon}</div>

              <p className="font-syne text-3xl font-bold text-foreground mb-1">
                {s.val}
              </p>

              <p className="font-ko text-[11px] text-muted-foreground tracking-wider">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* 즐겨찾기 학습 목록 */}
        {!favOnly && filtered(favSessions).length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />

              <span className="font-ko text-sm font-bold text-foreground tracking-wide">
                즐겨찾기
              </span>

              <span className="font-ko text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                {filtered(favSessions).length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {filtered(favSessions).map(s => (
                <SessionCard
                  key={s.id}
                  s={s}
                  compact
                  onSelect={() => onSelectSession(s.id)}
                  onFav={() => onToggleFav(s.id)}
                  onDelete={() => onDeleteSession(s.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 최근 학습 목록 */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-ko text-sm font-bold text-muted-foreground tracking-wide">
              {favOnly ? "즐겨찾기 학습" : "최근 학습"}
            </span>

            <span className="font-ko text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
              {favOnly
                ? filtered(favSessions).length
                : filtered(recentSessions).length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filtered(
              favOnly ? favSessions : recentSessions
            ).map(s => (
              <SessionCard
                key={s.id}
                s={s}
                compact
                onSelect={() => onSelectSession(s.id)}
                onFav={() => onToggleFav(s.id)}
                onDelete={() => onDeleteSession(s.id)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}