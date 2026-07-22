// components/notes/notes-list.tsx
"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search, Star, X } from "lucide-react"
import { NoteCard } from "@/components/notes/note-card"
import { apiFetch } from "@/lib/api"
import type { Note } from "@/types"

const BRAND = "#63C1ED"

interface NotesListProps {
  selNote: number | null
  setSelNote: (id: number) => void
  refreshKey: number   // 추가
}

export function NotesList({ selNote, setSelNote, refreshKey }: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [search, setSearch] = useState("")
  const [langFilter, setLangFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [newNoteOpen, setNewNoteOpen] = useState(false)

  const fetchNotes = async () => {
    try {
      const res = await apiFetch(`/api/notes`)
      const data = await res.json()
      setNotes(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("노트 불러오기 실패:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [refreshKey])

  const toggleNoteFav = async (noteId: number) => {
    // 1. 클릭 즉시 화면 먼저 바꿈 (서버 응답 기다리지 않음)
    setNotes(p => p.map(n =>
      n.noteId === noteId ? { ...n, bkmkYn: n.bkmkYn === "Y" ? "N" : "Y" } : n
    ))

    try {
      const res = await apiFetch(`/api/notes/${noteId}/bookmark`, {
        method: "PATCH",
      })
      const updated = await res.json()
      // 2. 서버 응답으로 최종 확정 (실제 값으로 동기화)
      setNotes(p => p.map(n => n.noteId === noteId ? updated : n))
    } catch (e) {
      console.error("즐겨찾기 토글 실패:", e)
      // 3. 실패하면 원래대로 되돌림
      setNotes(p => p.map(n =>
        n.noteId === noteId ? { ...n, bkmkYn: n.bkmkYn === "Y" ? "N" : "Y" } : n
      ))
    }
  }

  const favNotes = notes.filter(n => n.bkmkYn === "Y")
  const recentNotes = notes.filter(n => n.bkmkYn === "N")

  const filtered = (list: Note[]) =>
    list
      .filter(n => langFilter === "All" || n.lang === langFilter)
      .filter(n =>
        search === "" ||
        n.noteName?.toLowerCase().includes(search.toLowerCase()) ||
        n.tag?.toLowerCase().includes(search.toLowerCase())
      )

  return (
    <div className="h-full flex flex-col p-5 overflow-hidden">

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-1">
        <p className="font-ko text-[10px] tracking-widest" style={{ color: BRAND }}>// NOTES</p>
        <Button size="sm"
          onClick={() => setNewNoteOpen(true)}
          className="h-7 px-3 text-white font-ko text-xs"
          style={{ background: BRAND }}>
          + New
        </Button>
      </div>
      <h2 className="font-syne text-2xl font-bold text-zinc-100 mb-4">My Library</h2>

      {/* 검색 */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by keywords or tags..."
          className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-200 text-sm h-9 font-ko" />
      </div>

      {/* 언어 필터 */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {["All", "Java", "Python", "JavaScript", "C++"].map(l => (
          <button key={l} onClick={() => setLangFilter(l)}
            className="font-ko text-[10px] px-2.5 py-1 rounded-full border transition-all"
            style={langFilter === l
              ? { background: `${BRAND}15`, color: BRAND, borderColor: `${BRAND}44` }
              : { color: "#a1a1aa", borderColor: "#3f3f46" }}>
            {l}
          </button>
        ))}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="font-ko text-sm text-zinc-500">불러오는 중...</p>
          </div>
        ) : (
          <div className="pb-4">

            {/* 즐겨찾기 */}
            {filtered(favNotes).length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-2 px-0.5">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <span className="font-ko text-[11px] text-zinc-400">즐겨찾기</span>
                  <span className="font-ko text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    {filtered(favNotes).length}
                  </span>
                </div>
                {filtered(favNotes).map(n => (
                  <NoteCard key={n.noteId} n={n}
                    selNote={selNote}
                    setSelNote={setSelNote}
                    toggleNoteFav={toggleNoteFav} />
                ))}
                <div className="h-px bg-zinc-800/60 my-3" />
              </>
            )}

            {/* 전체 목록 */}
            {filtered(recentNotes).length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-2 px-0.5">
                  <span className="font-ko text-[11px] text-zinc-500">전체</span>
                  <span className="font-ko text-[9px] px-1.5 py-0.5 rounded-full border border-zinc-800 text-zinc-600">
                    {filtered(recentNotes).length}
                  </span>
                </div>
                {filtered(recentNotes).map(n => (
                  <NoteCard key={n.noteId} n={n}
                    selNote={selNote}
                    setSelNote={setSelNote}
                    toggleNoteFav={toggleNoteFav} />
                ))}
              </>
            )}

            {/* 빈 상태 */}
            {notes.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <p className="font-ko text-base font-bold text-zinc-400">노트가 없어요</p>
                <p className="font-ko text-sm text-zinc-500">New 버튼으로 첫 노트를 만들어보세요</p>
                <Button size="sm" onClick={() => setNewNoteOpen(true)}
                  className="h-8 px-4 text-white font-ko text-xs mt-1"
                  style={{ background: BRAND }}>
                  + New 노트 만들기
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* 새 노트 다이얼로그 */}
      <Dialog open={newNoteOpen} onOpenChange={setNewNoteOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-ko" style={{ color: BRAND }}>새 노트 만들기</DialogTitle>
          </DialogHeader>
          <NewNoteForm
            onSave={async (dto) => {
              try {
                await apiFetch("/api/notes", {
                  method: "POST",
                  body: JSON.stringify(dto),
                })

                setNewNoteOpen(false)
                fetchNotes()

                // 뱃지 체크는 백그라운드로 — UI를 막지 않음
                apiFetch("/api/badges/check", { method: "POST" }).catch(() => { })
              } catch (e) {
                console.error("노트 저장 실패:", e)
              }
            }}
            onCancel={() => setNewNoteOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ── 새 노트 폼 ── */

const detectLanguage = (code: string): string => {
  if (/#include\s*</.test(code)) {
    if (/cout|cin|std::|vector</.test(code)) return "C++"
    return "C"
  }
  if (/import\s+java\.|public\s+class|System\.out\.print/.test(code)) return "Java"
  if (/def\s+\w+\(|import\s+\w+|print\(/.test(code)) return "Python"
  if (/:\s*(string|number|boolean)/.test(code) && /const|let|=>/.test(code)) return "TypeScript"
  if (/const\s+\w+\s*=|let\s+\w+\s*=|require\(/.test(code)) return "JavaScript"
  return "기타"
}

function NewNoteForm({ onSave, onCancel }: {
  onSave: (dto: any) => void
  onCancel: () => void
}) {
  const [noteName, setNoteName] = useState("")
  const [noteMemo, setNoteMemo] = useState("")
  const [noteCn, setNoteCn] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [lang, setLang] = useState("Java")

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, "")   // 앞에 # 붙여 쳐도 중복 안 되게 제거
    if (t && !tags.includes(t)) {
      setTags(p => [...p, t])
    }
    setTagInput("")
  }

  const removeTag = (tag: string) => {
    setTags(p => p.filter(t => t !== tag))
  }

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <label className="font-ko text-[12px] text-zinc-500 uppercase tracking-wider">제목</label>
        <Input value={noteName} onChange={e => setNoteName(e.target.value)}
          placeholder="노트 제목을 입력하세요"
          className="h-9 bg-zinc-950 border-zinc-800 text-zinc-200 text-sm font-ko" />
      </div>

      <div className="space-y-1.5">
        <label className="font-ko text-[12px] text-zinc-500 uppercase tracking-wider">언어</label>
        <div className="flex gap-2 flex-wrap">
          {["Java", "Python", "JavaScript", "TypeScript", "C++", "C", "기타"].map(l => (
            <button key={l} onClick={() => setLang(l)}
              className="font-ko text-[10px] px-3 py-1 rounded-full border transition-all"
              style={lang === l
                ? { background: `#63C1ED15`, color: "#63C1ED", borderColor: `#63C1ED44` }
                : { color: "#a1a1aa", borderColor: "#3f3f46" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="font-ko text-[12px] text-zinc-500 uppercase tracking-wider">코드 (선택)</label>
        <textarea
          value={noteCn}
          onChange={e => setNoteCn(e.target.value)}
          onPaste={e => {
            const pastedText = e.clipboardData.getData("text");
            const detected = detectLanguage(pastedText);
            setLang(detected);
          }}
          placeholder="코드를 입력하세요"
          className="font-code placeholder-ko w-full h-28 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm p-3 resize-none outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="font-ko text-[12px] text-zinc-500 uppercase tracking-wider">메모 (선택)</label>
        <textarea value={noteMemo} onChange={e => setNoteMemo(e.target.value)}
          placeholder="메모를 입력하세요"
          className="font-ko w-full h-20 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm p-3 resize-none outline-none" />
      </div>

      <div className="space-y-1.5">
        <label className="font-ko text-[12px] text-zinc-500 uppercase tracking-wider">태그 (선택)</label>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map(tag => (
              <span key={tag} className="font-ko text-[10px] px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400 flex items-center gap-1">
                #{tag}
                <button onClick={() => removeTag(tag)}>
                  <X className="h-2.5 w-2.5 ml-0.5 hover:text-zinc-100" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag() } }}
            placeholder="태그 입력 후 Enter..."
            className="h-9 bg-zinc-950 border-zinc-800 text-zinc-200 text-sm font-ko" />
          <Button size="sm" variant="outline" className="border-zinc-800 text-zinc-400 font-ko text-xs shrink-0" onClick={addTag}>
            추가
          </Button>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" size="sm"
          className="border-zinc-800 text-zinc-400 font-ko text-xs"
          onClick={onCancel}>
          취소
        </Button>
        <Button size="sm"
          className="text-white font-ko text-xs"
          style={{ background: "#63C1ED" }}
          onClick={() => onSave({ noteName, noteMemo, noteCn, tag: tags.join(" "), lang, category: "자유 노트" })}>
          저장
        </Button>
      </DialogFooter>
    </div>
  )
}