// components/notes/notes-list.tsx
"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, Star } from "lucide-react";
import { NoteCard } from "@/components/notes/note-card";
import type { Note } from "@/types";

const BRAND = "#63C1ED";

interface NotesListProps {
  selNote: number | null;
  setSelNote: (id: number) => void;
}

export function NotesList({ selNote, setSelNote }: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [newNoteOpen, setNewNoteOpen] = useState(false);

  const fetchNotes = async (type?: string) => {
    try {
      const query = type && type !== "ALL" ? `?type=${type}` : "";
      const res = await fetch(`http://localhost:8080/api/notes${query}`);
      const data = await res.json();
      setNotes(data);
    } catch (e) {
      console.error("노트 불러오기 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes(typeFilter);
  }, [typeFilter]);

  const toggleNoteFav = async (noteId: number) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/notes/${noteId}/bookmark`,
        {
          method: "PATCH",
        },
      );
      const updated = await res.json();
      setNotes((p) => p.map((n) => (n.noteId === noteId ? updated : n)));
    } catch (e) {
      console.error("즐겨찾기 토글 실패:", e);
    }
  };

  const favNotes = notes.filter((n) => n.bkmkYn === "Y");
  const recentNotes = notes.filter((n) => n.bkmkYn === "N");

  const filtered = (list: Note[]) =>
    list
      .filter((n) => langFilter === "All" || n.lang === langFilter)
      .filter(
        (n) =>
          search === "" ||
          n.noteName?.toLowerCase().includes(search.toLowerCase()) ||
          n.tag?.toLowerCase().includes(search.toLowerCase()),
      );

  return (
    <div className="h-full flex flex-col p-5 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-1">
        <p
          className="font-space text-[10px] tracking-widest"
          style={{ color: BRAND }}
        >
          // NOTES
        </p>
        <Button
          size="sm"
          onClick={() => setNewNoteOpen(true)}
          className="h-7 px-3 text-white font-ko text-xs"
          style={{ background: BRAND }}
        >
          + New
        </Button>
      </div>
      <h2 className="font-syne text-2xl font-bold text-zinc-100 mb-4">
        My Library
      </h2>

      {/* 검색 */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by keywords or tags..."
          className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-200 text-xs h-8 font-space"
        />
      </div>

      {/* 타입 필터 */}
      <div className="flex gap-1.5 mb-2 flex-wrap">
        {[
          { id: "ALL", label: "전체" },
          { id: "LEARNING", label: "학습 노트" },
          { id: "MANUAL", label: "자유 노트" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setTypeFilter(f.id)}
            className="font-ko text-[11px] px-2.5 py-1 rounded-full border transition-all"
            style={
              typeFilter === f.id
                ? {
                    background: `${BRAND}15`,
                    color: BRAND,
                    borderColor: `${BRAND}44`,
                  }
                : { color: "#71717a", borderColor: "#27272a" }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 언어 필터 */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {["All", "Java", "Python", "JavaScript", "C++"].map((l) => (
          <button
            key={l}
            onClick={() => setLangFilter(l)}
            className="font-space text-[10px] px-2.5 py-1 rounded-full border transition-all"
            style={
              langFilter === l
                ? {
                    background: `${BRAND}15`,
                    color: BRAND,
                    borderColor: `${BRAND}44`,
                  }
                : { color: "#71717a", borderColor: "#27272a" }
            }
          >
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
                  <span className="font-ko text-[11px] text-zinc-400">
                    즐겨찾기
                  </span>
                  <span className="font-space text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    {filtered(favNotes).length}
                  </span>
                </div>
                {filtered(favNotes).map((n) => (
                  <NoteCard
                    key={n.noteId}
                    n={n}
                    selNote={selNote}
                    setSelNote={setSelNote}
                    toggleNoteFav={toggleNoteFav}
                  />
                ))}
                <div className="h-px bg-zinc-800/60 my-3" />
              </>
            )}

            {/* 전체 목록 */}
            {filtered(recentNotes).length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-2 px-0.5">
                  <span className="font-ko text-[11px] text-zinc-500">
                    전체
                  </span>
                  <span className="font-space text-[9px] px-1.5 py-0.5 rounded-full border border-zinc-800 text-zinc-600">
                    {filtered(recentNotes).length}
                  </span>
                </div>
                {filtered(recentNotes).map((n) => (
                  <NoteCard
                    key={n.noteId}
                    n={n}
                    selNote={selNote}
                    setSelNote={setSelNote}
                    toggleNoteFav={toggleNoteFav}
                  />
                ))}
              </>
            )}

            {/* 빈 상태 */}
            {notes.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <p className="font-syne text-base font-bold text-zinc-400">
                  노트가 없어요
                </p>
                <p className="font-ko text-sm text-zinc-500">
                  New 버튼으로 첫 노트를 만들어 보세요
                </p>
                <Button
                  size="sm"
                  onClick={() => setNewNoteOpen(true)}
                  className="h-8 px-4 text-white font-ko text-xs mt-1"
                  style={{ background: BRAND }}
                >
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
            <DialogTitle className="font-syne" style={{ color: BRAND }}>
              새 노트 만들기
            </DialogTitle>
          </DialogHeader>
          <NewNoteForm
            onSave={async (dto) => {
              try {
                await fetch("http://localhost:8080/api/notes", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(dto),
                });
                setNewNoteOpen(false);
                fetchNotes(typeFilter);
              } catch (e) {
                console.error("노트 저장 실패:", e);
              }
            }}
            onCancel={() => setNewNoteOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── 새 노트 폼 ── */
function NewNoteForm({
  onSave,
  onCancel,
}: {
  onSave: (dto: any) => void;
  onCancel: () => void;
}) {
  const [noteName, setNoteName] = useState("");
  const [noteMemo, setNoteMemo] = useState("");
  const [noteCn, setNoteCn] = useState("");
  const [tag, setTag] = useState("");
  const [lang, setLang] = useState("Java");

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <label className="font-space text-[10px] text-zinc-500 uppercase tracking-wider">
          제목
        </label>
        <Input
          value={noteName}
          onChange={(e) => setNoteName(e.target.value)}
          placeholder="노트 제목을 입력하세요"
          className="h-9 bg-zinc-950 border-zinc-800 text-zinc-200 text-sm font-ko"
        />
      </div>

      <div className="space-y-1.5">
        <label className="font-space text-[10px] text-zinc-500 uppercase tracking-wider">
          언어
        </label>
        <div className="flex gap-2 flex-wrap">
          {["Java", "Python", "JavaScript", "TypeScript", "C++", "C"].map(
            (l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="font-space text-[10px] px-3 py-1 rounded-full border transition-all"
                style={
                  lang === l
                    ? {
                        background: `#63C1ED15`,
                        color: "#63C1ED",
                        borderColor: `#63C1ED44`,
                      }
                    : { color: "#71717a", borderColor: "#27272a" }
                }
              >
                {l}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="font-space text-[10px] text-zinc-500 uppercase tracking-wider">
          코드 (선택)
        </label>
        <textarea
          value={noteCn}
          onChange={(e) => setNoteCn(e.target.value)}
          placeholder="코드를 입력하세요"
          className="font-code w-full h-28 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs p-3 resize-none outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="font-space text-[10px] text-zinc-500 uppercase tracking-wider">
          메모 (선택)
        </label>
        <textarea
          value={noteMemo}
          onChange={(e) => setNoteMemo(e.target.value)}
          placeholder="메모를 입력하세요"
          className="font-ko w-full h-20 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm p-3 resize-none outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="font-space text-[10px] text-zinc-500 uppercase tracking-wider">
          태그 (선택)
        </label>
        <Input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="#DP #Graph (공백으로 구분)"
          className="h-9 bg-zinc-950 border-zinc-800 text-zinc-200 text-sm font-space"
        />
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          size="sm"
          className="border-zinc-800 text-zinc-400 font-ko text-xs"
          onClick={onCancel}
        >
          취소
        </Button>
        <Button
          size="sm"
          className="text-white font-ko text-xs"
          style={{ background: "#63C1ED" }}
          onClick={() =>
            onSave({
              noteName,
              noteMemo,
              noteCn,
              tag,
              lang,
              category: "자유 노트",
            })
          }
        >
          저장
        </Button>
      </DialogFooter>
    </div>
  );
}
