"use client";

import { CodeHighlight } from "@/components/shared/code-highlight"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiFetch } from "@/lib/api"
import { useState, useEffect } from "react";
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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

const getFileExtension = (lang: string): string => {
  const extMap: Record<string, string> = {
    "C": "c",
    "C++": "cpp",
    "Java": "java",
    "Python": "py",
    "TypeScript": "ts",
    "JavaScript": "js",
    "기타": "txt"
  };
  return extMap[lang] || "txt"; // 매칭 안 되면 기본값 .txt
}

interface NoteDetailProps {
  noteId: number | null;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

export function NoteDetail({ noteId, onDeleted, onUpdated }: NoteDetailProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);

  // 수정 모드
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [editTag, setEditTag] = useState("");
  const [editCode, setEditCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [shareOpen, setShareOpen] = useState(false)
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

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
    setEditCode(note.noteCn ?? "")   // 자유 노트일 때만 의미 있음
    setIsEditing(true)
  }

  const [deleteOpen, setDeleteOpen] = useState(false)


  const cancelEditing = () => {
    setIsEditing(false)
  }

  const saveEditing = async () => {
    if (!noteId) return
    if (!editName.trim()) {
      toast.error("제목을 입력해 주세요.")
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
          // 학습 노트는 코드가 AI 최적화 결과(optCdContent)라 수정 대상 아님 — 자유 노트일 때만 noteCn 전송
          ...(note?.noteType !== "LEARNING" ? { noteCn: editCode } : {}),
        }),
      })
      if (!res.ok) {
        toast.error("수정 실패했어요. 다시 시도해 주세요.")
        return
      }
      const updated = await res.json()
      setNote(updated)
      setIsEditing(false)
      toast.success("노트를 수정했어요!")  // ← 추가
      onUpdated?.()   // 목록(NotesList)에도 변경사항 반영되도록 알림
    } catch (e) {
      console.error("노트 수정 실패:", e)
      toast.error("서버와 연결할 수 없습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!noteId) return
    const res = await apiFetch(`/api/notes/${noteId}`, { method: "DELETE" })
    if (!res.ok) {
      toast.error("삭제 실패했어요. 다시 시도해 주세요.")
      return
    }
    toast.success("노트를 삭제했어요!")
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
  const detectedLang = code ? detectLanguage(code) : (note.lang ?? "Java")  // ← 추가

  return (
    <ScrollArea className="h-full">
      <div className="p-8 max-w-3xl mx-auto space-y-5">
        {/* 헤더 */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-ko text-xs tracking-widest mb-2 text-zinc-500">
              // {note.category} · {note.lang}
            </p>

            {isEditing ? (
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                autoFocus
                className="font-ko text-2xl font-bold bg-zinc-900 border-zinc-700 text-zinc-100 h-auto py-1.5"
              />
            ) : (
              <h1 className="font-ko text-3xl font-bold text-zinc-100 leading-tight">
                {note.noteName}
              </h1>
            )}

            <p className="font-ko text-xs text-zinc-500 mt-2">
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
                  className="h-9 text-white text-sm gap-1.5 font-ko px-4"
                  style={{ background: BRAND }}
                >
                  <Check className="h-3.5 w-3.5" />
                  {isSaving ? "저장 중..." : "저장"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelEditing}
                  disabled={isSaving}
                  className="h-9 border-zinc-700 bg-zinc-900 text-zinc-300 text-sm gap-1.5 font-ko px-4"
                >
                  <X className="h-3.5 w-3.5" />
                  취소
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={startEditing}
                  className="h-9 border-zinc-700 bg-zinc-900 text-zinc-300 text-sm gap-1.5 px-4"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 border-zinc-700 bg-zinc-900 text-zinc-300 text-sm gap-1.5 px-4"
                  onClick={() => setShareOpen(true)}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>
                <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 w-9 p-0 border-rose-900/50 bg-rose-500/10 text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#17171b] border-white/10">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-syne text-white">
                        노트를 삭제할까요?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-ko text-zinc-400 leading-relaxed">
                        <span className="text-zinc-200 font-bold">{note?.noteName}</span>
                        <br />
                        삭제된 노트는 되돌릴 수 없어요.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 font-ko text-xs">
                        취소
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-rose-500 hover:bg-rose-600 text-white font-ko text-xs"
                      >
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        {/* AI 요약 (Learning 노트만) */}
        {note.noteType === "LEARNING" && note.aiSummary && (
          <Card
            className="border-zinc-800"
            style={{ background: `${BRAND}08`, borderColor: `${BRAND}25` }}
          >
            <CardContent className="p-6">
              <p
                className="font-ko text-xs tracking-widest mb-3 flex items-center gap-2"
                style={{ color: BRAND }}
              >
                <Sparkles className="h-3.5 w-3.5" />
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
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <p
                className="font-ko text-xs tracking-widest mb-3"
                style={{ color: BRAND }}
              >
                // PERSONAL NOTES
              </p>
              {isEditing ? (
                <textarea
                  value={editMemo}
                  onChange={e => setEditMemo(e.target.value)}
                  placeholder="메모를 입력하세요"
                  className="font-ko w-full min-h-[100px] rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm p-3.5 resize-none outline-none"
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
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <p
                className="font-ko text-xs tracking-widest mb-3"
                style={{ color: BRAND }}
              >
                // TAGS
              </p>
              <Input
                value={editTag}
                onChange={e => setEditTag(e.target.value)}
                placeholder="#DP #Graph (공백으로 구분)"
                className="bg-zinc-950 border-zinc-800 text-zinc-200 text-sm font-ko"
              />
            </CardContent>
          </Card>
        )}

        {/* 코드 스냅샷 / 코드 수정 (자유 노트만) */}
        {isEditing && note.noteType !== "LEARNING" ? (
          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardHeader className="pb-0 pt-5 px-6">
              <CardTitle
                className="font-ko text-xs tracking-widest flex items-center gap-2"
                style={{ color: BRAND }}
              >
                <Code2 className="h-4 w-4" />
                Code Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <textarea
                value={editCode}
                onChange={e => setEditCode(e.target.value)}
                onPaste={e => {
                  // 1. 복붙한 텍스트 낚아채기
                  const pastedText = e.clipboardData.getData("text");

                  // 2. 어떤 언어인지 감지
                  const detected = detectLanguage(pastedText);

                  // 3. 기존 태그창(editTag)에 해당 언어가 없으면 뒤에 추가해 주기
                  setEditTag(prev => {
                    const hasTag = prev.toLowerCase().includes(`#${detected.toLowerCase()}`);
                    if (!hasTag) {
                      return prev ? `${prev} #${detected}` : `#${detected}`;
                    }
                    return prev;
                  });
                }}
                placeholder="코드를 입력하세요"
                className="font-code placeholder-ko w-full h-48 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm p-3.5 resize-none outline-none"
              />
            </CardContent>
          </Card>
        ) : code && (
          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardHeader className="pb-0 pt-5 px-6 flex flex-row items-center justify-between">
              <CardTitle
                className="font-ko text-xs tracking-widest flex items-center gap-2"
                style={{ color: BRAND }}
              >
                <Code2 className="h-4 w-4" />
                Code Snapshot
              </CardTitle>
              <span className="font-ko text-xs px-2.5 py-1 rounded border border-zinc-700 text-zinc-300">
                {detectedLang}
              </span>
            </CardHeader>
            <CardContent className="px-0 pb-0 pt-4">
              <div className="flex items-center border-t border-b border-zinc-800/80 bg-[#1a1a1a]">
                <div
                  className="flex items-center gap-2 px-4 py-2.5 border-r border-zinc-800 bg-[#141414]"
                  style={{ borderBottom: `2px solid ${BRAND}` }}
                >
                  <FileCode className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="font-code text-xs text-zinc-300">
                    {note.noteName?.toLowerCase().replace(/ /g, "_") || "untitled"}.
                    {getFileExtension(detectedLang)}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-3 px-4">
                  <span className="font-ko text-xs text-zinc-500">
                    {code.split("\n").length} lines
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(code)}
                    className="font-ko text-xs text-zinc-500 hover:text-zinc-200 transition-colors flex items-center gap-1"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    copy
                  </button>
                </div>
              </div>
              <div className="bg-[#141414] font-code text-sm overflow-x-auto">
                <div className="flex">
                  <div className="select-none shrink-0 border-r border-zinc-800/60 py-4">
                    <div className="px-4 text-right min-w-[48px]">
                      {code.split("\n").map((_: string, i: number) => (
                        <div
                          key={i}
                          className="leading-[1.625rem] text-zinc-600 text-xs"
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 px-4 py-4 overflow-x-auto">
                    <CodeHighlight code={code} language={detectedLang ?? undefined} />
                  </div>
                </div>
              </div>
              <div className="h-7 bg-[#1a1a1a] border-t border-zinc-800/60 flex items-center px-4 gap-4">
                <span className="font-ko text-xs text-zinc-500">
                  {detectedLang}
                </span>
                <span className="font-ko text-xs text-zinc-500">
                  UTF-8
                </span>

                {/* 여기에 저장 시간(년.월.일 시간) 추가 */}
                <span className="font-ko text-xs text-zinc-500">
                  {new Date(note.createdAt).toLocaleString("ko-KR", {
                    year: '2-digit', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>

                <span className="font-ko text-xs text-zinc-500 ml-auto">
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