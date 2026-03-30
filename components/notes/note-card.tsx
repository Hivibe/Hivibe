// components/notes/note-card.tsx
"use client"

import { Star } from "lucide-react"
import type { Note } from "@/types"

const BRAND = "#63C1ED"

interface NoteCardProps {
  n: Note
  selNote: number
  setSelNote: (id: number) => void
  toggleNoteFav: (id: number) => void
}

export function NoteCard({ n, selNote, setSelNote, toggleNoteFav }: NoteCardProps) {
  return (
    <div
      onClick={() => setSelNote(n.id)}
      className="p-3.5 rounded-xl border cursor-pointer transition-all mb-2"
      style={selNote === n.id
        ? { borderColor: `${BRAND}44`, background: `${BRAND}08` }
        : { borderColor: "#27272a", background: "#18181b55" }}>
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-syne text-xs font-semibold text-zinc-100 leading-snug flex-1 mr-2">
          {n.title}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-space text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
            {n.grade}
          </span>
          <button
            onClick={e => { e.stopPropagation(); toggleNoteFav(n.id) }}
            className="h-5 w-5 flex items-center justify-center rounded transition-colors"
            style={{ color: n.favorited ? "#f59e0b" : "#52525b" }}>
            <Star className={`h-3 w-3 ${n.favorited ? "fill-amber-400" : ""}`} />
          </button>
        </div>
      </div>
      <p className="font-space text-[10px] text-zinc-500 mb-2">{n.date}</p>
      <div className="flex flex-wrap gap-1">
        {n.tags.map(t => (
          <span key={t} className="font-space text-[10px] px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400">
            #{t}
          </span>
        ))}
      </div>
    </div>
  )
}