"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Edit2,
  Share2,
  Trash2,
  FileCode,
  Copy,
  Code2,
  Sparkles,
} from "lucide-react";
import type { Note } from "@/types";

const BRAND = "#63C1ED";

interface NoteDetailProps {
  noteId: number | null;
}

export function NoteDetail({ noteId }: NoteDetailProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1번 안전장치: noteId가 없으면 아예 요청을 안 보냄!
    if (!noteId) return;

    setLoading(true);
    fetch(`http://localhost:8080/api/notes/${noteId}`)
      .then((res) => {
        // 2번 안전장치: 백엔드 응답이 정상(200 OK)이 아니면 JSON을 까보지 않고 바로 에러로 던짐
        if (!res.ok) {
          throw new Error("서버에서 에러가 났어요!");
        }
        return res.json();
      })
      .then((data) => setNote(data))
      .catch((e) => console.error("노트 불러오기 실패:", e))
      .finally(() => setLoading(false));
  }, [noteId]);

  const handleDelete = async () => {
    if (!noteId || !confirm("노트를 삭제할까요?")) return;
    await fetch(`http://localhost:8080/api/notes/${noteId}`, {
      method: "DELETE",
    });
    setNote(null);
  };

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
          <div>
            <p className="font-space text-[10px] tracking-widest mb-1.5 text-zinc-500">
              // {note.category} · {note.lang}
            </p>
            <h1 className="font-syne text-3xl font-bold text-zinc-100 leading-tight">
              {note.noteName}
            </h1>
            <p className="font-ko text-xs text-zinc-500 mt-1.5">
              {new Date(note.createdAt).toLocaleDateString("ko-KR")}
            </p>
          </div>
          <div className="flex gap-2 shrink-0 mt-1">
            <Button
              size="sm"
              variant="outline"
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
        {note.noteMemo && (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-5">
              <p
                className="font-space text-[10px] tracking-widest mb-3"
                style={{ color: BRAND }}
              >
                // PERSONAL NOTES
              </p>
              <p className="font-ko text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {note.noteMemo}
              </p>
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
                  <pre className="flex-1 px-4 py-4 text-zinc-300 leading-[1.625rem] overflow-x-auto">
                    <code>{code}</code>
                  </pre>
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
