"use client";

import { CodeHighlight } from "@/components/shared/code-highlight"
import { apiFetch } from "@/lib/api"
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Edit2,
  Share2,
  Trash2,
  FileCode,
  Copy,
  Code2,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import type { Note } from "@/types";

const BRAND = "#63C1ED";

interface NoteDetailProps {
  noteId: number | null;
  onDeleted?: () => void;
}

export function NoteDetail({ noteId, onDeleted }: NoteDetailProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);

  // 수정 모드
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [editTag, setEditTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!noteId) return
    setLoading(true)
    setIsEditing(false)   // 노트 바뀌면 수정 모드 초기화
    apiFetch(`/api/notes/${noteId}`)
      .then(res => res.json())
      .then(data => setNote(data))
      .catch(e => console.error("노트 불러오기 실패:", e))
      .finally(() => setLoading(false))
  }, [noteId])

  const startEditing = () => {
    if (!note) return
    setEditName(note.noteName ?? "")
    setEditMemo(note.noteMemo ?? "")
    setEditTag(note.tag ?? "")
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const saveEditing = async () => {
    if (!noteId) return
    if (!editName.trim()) {
      alert("제목을 입력해 주세요.")
      return
    }
    setIsSaving(true)
    try {
      const res = await apiFetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        body: JSON.stringify({
          noteName: editName.trim(),
          noteMemo: editMemo,
          tag: editTag,
        }),
      })
      if (!res.ok) {
        alert("수정 실패했어요. 다시 시도해 주세요.")
        return
      }
      const updated = await res.json()
      setNote(updated)
      setIsEditing(false)
    } catch (e) {
      console.error("노트 수정 실패:", e)
      alert("서버와 연결할 수 없습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!noteId || !confirm("노트를 삭제할까요?")) return
    const res = await apiFetch(`/api/notes/${noteId}`, { method: "DELETE" })
    if (!res.ok) {
      alert("삭제 실패했어요. 다시 시도해 주세요.")
      return
    }
    setNote(null)
    onDeleted?.()
  }

  if (!noteId)
    return (
      <div className="h-full flex items-center justify-center">
        <p className="font-ko text-sm text-zinc-500">노트를 선택해주세요</p>
      </div>
    );

  if (loading)
    return (
      <div className="h-full flex items-center justify-center">
        <p className="font-ko text-sm text-zinc-500">불러오는 중...</p>
      </div>
    );

  if (!note)
    return (
      <div className="h-full flex items-center justify-center">
        <p className="font-ko text-sm text-zinc-500">노트를 찾을 수 없어요</p>
      </div>
    );

  const code = note.noteType === "LEARNING" ? note.optCdContent : note.noteCn;

  return (
    <ScrollArea className="h-full">
      <div className="p-8 max-w-3xl mx-auto space-y-5">
        {/* 헤더 */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-space text-[10px] tracking-widest mb-1.5 text-zinc-500">
              // {note.category} · {note.lang}
            </p>

            {isEditing ? (
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                autoFocus
                className="font-syne text-2xl font-bold bg-zinc-900 border-zinc-700 text-zinc-100 h-auto py-1.5"
              />
            ) : (
              <h1 className="font-syne text-3xl font-bold text-zinc-100 leading-tight">
                {note.noteName}
              </h1>
            )}

            <p className="font-ko text-xs text-zinc-500 mt-1.5">
              {new Date(note.createdAt).toLocaleDateString("ko-KR")}
            </p>
          </div>

          <div className="flex gap-2 shrink-0 mt-1">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={saveEditing}
                  disabled={isSaving}
                  className="h-8 text-white text-xs gap-1.5 font-ko"
                  style={{ background: BRAND }}
                >
                  <Check className="h-3 w-3" />
                  {isSaving ? "저장 중..." : "저장"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelEditing}
                  disabled={isSaving}
                  className="h-8 border-zinc-800 bg-zinc-900 text-zinc-400 text-xs gap-1.5 font-ko"
                >
                  <X className="h-3 w-3" />
                  취소
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={startEditing}
                  className="h-8 border-zinc-800 bg-zinc-900 text-zinc-400 text-xs gap-1.5"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-zinc-800 bg-zinc-900 text-zinc-400 text-xs gap-1.5"
                >
                  <Share2 className="h-3 w-3" />
                  Share
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  className="h-8 w-8 p-0 border-rose-900/50 bg-rose-500/10 text-rose-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* AI 요약 (Learning 노트만) */}
        {note.noteType === "LEARNING" && note.aiSummary && (
          <Card
            className="border-zinc-800"
            style={{ background: `${BRAND}06`, borderColor: `${BRAND}20` }}
          >
            <CardContent className="p-5">
              <p
                className="font-space text-[10px] tracking-widest mb-3 flex items-center gap-2"
                style={{ color: BRAND }}
              >
                <Sparkles className="h-3 w-3" />
                // AI SUMMARY
              </p>
              <p className="font-ko text-sm text-zinc-300 leading-relaxed">
                {note.aiSummary}
              </p>
            </CardContent>
          </Card>
        )}

        {/* 메모 */}
        {(note.noteMemo || isEditing) && (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-5">
              <p
                className="font-space text-[10px] tracking-widest mb-3"
                style={{ color: BRAND }}
              >
                // PERSONAL NOTES
              </p>
              {isEditing ? (
                <textarea
                  value={editMemo}
                  onChange={e => setEditMemo(e.target.value)}
                  placeholder="메모를 입력하세요"
                  className="font-ko w-full min-h-[100px] rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm p-3 resize-none outline-none"
                />
              ) : (
                <p className="font-ko text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                  {note.noteMemo}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* 태그 (수정 모드일 때만 노출) */}
        {isEditing && (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-5">
              <p
                className="font-space text-[10px] tracking-widest mb-3"
                style={{ color: BRAND }}
              >
                // TAGS
              </p>
              <Input
                value={editTag}
                onChange={e => setEditTag(e.target.value)}
                placeholder="#DP #Graph (공백으로 구분)"
                className="bg-zinc-950 border-zinc-800 text-zinc-200 text-sm font-space"
              />
            </CardContent>
          </Card>
        )}

        {/* 코드 스냅샷 */}
        {code && (
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <CardHeader className="pb-0 pt-4 px-5 flex flex-row items-center justify-between">
              <CardTitle
                className="font-space text-[10px] tracking-widest flex items-center gap-2"
                style={{ color: BRAND }}
              >
                <Code2 className="h-3.5 w-3.5" />
                Code Snapshot
              </CardTitle>
              <span className="font-space text-[10px] px-2 py-0.5 rounded border border-zinc-700 text-zinc-400">
                {note.lang}
              </span>
            </CardHeader>
            <CardContent className="px-0 pb-0 pt-3">
              <div className="flex items-center border-t border-b border-zinc-800/80 bg-[#1a1a1a]">
                <div
                  className="flex items-center gap-2 px-4 py-2 border-r border-zinc-800 bg-[#141414]"
                  style={{ borderBottom: `2px solid ${BRAND}` }}
                >
                  <FileCode className="h-3 w-3 text-zinc-500" />
                  <span className="font-code text-[11px] text-zinc-300">
                    {note.noteName?.toLowerCase().replace(/ /g, "_")}.
                    {note.lang === "Python" ? "py" : "java"}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-3 px-4">
                  <span className="font-space text-[10px] text-zinc-600">
                    {code.split("\n").length} lines
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(code)}
                    className="font-space text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    copy
                  </button>
                </div>
              </div>
              <div className="bg-[#141414] font-code text-[13px] overflow-x-auto">
                <div className="flex">
                  <div className="select-none shrink-0 border-r border-zinc-800/60 py-4">
                    <div className="px-4 text-right min-w-[48px]">
                      {code.split("\n").map((_: string, i: number) => (
                        <div
                          key={i}
                          className="leading-[1.625rem] text-zinc-700 text-[12px]"
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 px-4 py-4 overflow-x-auto">
                    <CodeHighlight code={code} language={note.lang ?? undefined} />
                  </div>
                </div>
              </div>
              <div className="h-6 bg-[#1a1a1a] border-t border-zinc-800/60 flex items-center px-4 gap-4">
                <span className="font-space text-[10px] text-zinc-600">
                  {note.lang}
                </span>
                <span className="font-space text-[10px] text-zinc-600">
                  UTF-8
                </span>
                <span className="font-space text-[10px] text-zinc-600 ml-auto">
                  {code.length} chars
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}