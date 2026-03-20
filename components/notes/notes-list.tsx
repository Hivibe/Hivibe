// components/notes/notes-list.tsx
"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search, Star } from "lucide-react"
import { NoteCard } from "@/components/notes/note-card"
import type { Note } from "@/types"

const BRAND = "#63C1ED"

interface NotesListProps {
  notes: Note[]
  selNote: number
  setSelNote: (id: number) => void
  toggleNoteFav: (id: number) => void
}

export function NotesList({ notes, selNote, setSelNote, toggleNoteFav }: NotesListProps) {
  const [search,     setSearch]     = useState("")
  const [langFilter, setLangFilter] = useState("All")

  const favNotes    = notes.filter(n => n.favorited)
  const recentNotes = notes.filter(n => !n.favorited)

  const filtered = (list: Note[]) =>
    list
      .filter(n => langFilter === "All" || n.language === langFilter)
      .filter(n =>
        search === "" ||
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )

  return (
    <div className="h-full flex flex-col p-5">
      <p className="font-space text-[10px] tracking-widest mb-1" style={{ color: BRAND }}>// NOTES</p>
      <h2 className="font-syne text-2xl font-bold text-zinc-100 mb-4">My Library</h2>

      {/* 검색 */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by keywords or tags..."
          className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-200 text-xs h-8 font-space" />
      </div>

      {/* 언어 필터 */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {["All", "Java", "Python"].map(l => (
          <button key={l} onClick={() => setLangFilter(l)}
            className="font-space text-[10px] px-2.5 py-1 rounded-full border transition-all"
            style={langFilter === l
              ? { background: `${BRAND}15`, color: BRAND, borderColor: `${BRAND}44` }
              : { color: "#71717a", borderColor: "#27272a" }}>
            {l}
          </button>
        ))}
      </div>

      <ScrollArea className="flex-1">
        <div className="pb-4">
          {/* 즐겨찾기 섹션 */}
          {filtered(favNotes).length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-2 px-0.5">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                <span className="font-space text-[9px] text-zinc-500 tracking-wider uppercase">즐겨찾기</span>
                <span className="font-space text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  {filtered(favNotes).length}
                </span>
              </div>
              {filtered(favNotes).map(n => (
                <NoteCard key={n.id} n={n}
                  selNote={selNote}
                  setSelNote={setSelNote}
                  toggleNoteFav={toggleNoteFav} />
              ))}
              <div className="h-px bg-zinc-800/60 my-3" />
            </>
          )}

          {/* 전체 목록 */}
          <div className="flex items-center gap-2 mb-2 px-0.5">
            <span className="font-space text-[9px] text-zinc-600 tracking-wider uppercase">전체</span>
            <span className="font-space text-[9px] px-1.5 py-0.5 rounded-full border border-zinc-800 text-zinc-600">
              {filtered(recentNotes).length}
            </span>
          </div>
          {filtered(recentNotes).map(n => (
            <NoteCard key={n.id} n={n}
              selNote={selNote}
              setSelNote={setSelNote}
              toggleNoteFav={toggleNoteFav} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}