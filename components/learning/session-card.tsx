// components/learning/session-card.tsx
"use client"

import { Star } from "lucide-react"
import type { LearningSession } from "@/types"

const BRAND = "#63C1ED"

const langDot: Record<string, string> = {
  Java: "#63C1ED", Python: "#f59e0b", JavaScript: "#eab308",
  TypeScript: "#60a5fa", "C++": "#a78bfa", C: "#6ee7b7",
}

interface SCardProps {
  s: LearningSession
  onSelect: () => void
  onFav: () => void
  compact?: boolean
}

export function SessionCard({ s, onSelect, onFav, compact = false }: SCardProps) {
  return (
    <div onClick={onSelect}
      className={`group bg-zinc-900/60 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-all ${compact ? "p-4" : "p-5 mb-3"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-syne font-semibold text-zinc-100 truncate ${compact ? "text-sm" : "text-base"}`}>
            {s.title}
          </h3>
          <p className="font-space text-[10px] text-zinc-500 mt-0.5">
            {s.date} · <span style={{ color: langDot[s.language] ?? BRAND }}>● {s.language}</span>
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {s.tags.slice(0, compact ? 2 : 3).map(t => (
              <span key={t} className="font-space text-[10px] px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400">
                #{t}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="font-space text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
            {s.grade}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onFav() }}
            className="h-6 w-6 flex items-center justify-center rounded transition-colors hover:bg-zinc-800"
            style={{ color: s.favorited ? "#f59e0b" : "#52525b" }}>
            <Star className={`h-3.5 w-3.5 ${s.favorited ? "fill-amber-400" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  )
}