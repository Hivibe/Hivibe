// components/notes/note-detail.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card"
import { Button } from "@/frontend/components/ui/button"
import { ScrollArea } from "@/frontend/components/ui/scroll-area"
import { Edit2, Share2, Trash2, FileCode, Copy, Code2 } from "lucide-react"
import type { Note } from "@/frontend/types"

const BRAND = "#63C1ED"

interface NoteDetailProps {
  note: Note
}

export function NoteDetail({ note: n }: NoteDetailProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-8 max-w-3xl mx-auto space-y-5">

        {/* 헤더 */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="font-space text-[10px] tracking-widest mb-1.5 text-zinc-500">
              // {n.category} · {n.language}
            </p>
            <h1 className="font-syne text-3xl font-bold text-zinc-100 leading-tight">{n.title}</h1>
            <p className="font-space text-xs text-zinc-500 mt-1.5">{n.date}</p>
          </div>
          <div className="flex gap-2 shrink-0 mt-1">
            <Button size="sm" variant="outline" className="h-8 border-zinc-800 bg-zinc-900 text-zinc-400 text-xs gap-1.5">
              <Edit2 className="h-3 w-3" />Edit Memo
            </Button>
            <Button size="sm" variant="outline" className="h-8 border-zinc-800 bg-zinc-900 text-zinc-400 text-xs gap-1.5">
              <Share2 className="h-3 w-3" />Share
            </Button>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-rose-900/50 bg-rose-500/10 text-rose-500">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Personal Notes */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-5">
            <p className="font-space text-[10px] tracking-widest mb-3" style={{ color: BRAND }}>// PERSONAL NOTES</p>
            <p className="font-ko text-[13px] text-zinc-300 leading-relaxed whitespace-pre-line">{n.memo}</p>
          </CardContent>
        </Card>

        {/* Code Snapshot */}
        <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
          <CardHeader className="pb-0 pt-4 px-5 flex flex-row items-center justify-between">
            <CardTitle className="font-space text-[10px] tracking-widest flex items-center gap-2" style={{ color: BRAND }}>
              <Code2 className="h-3.5 w-3.5" />Code Snapshot
            </CardTitle>
            <span className="font-space text-[10px] px-2 py-0.5 rounded border border-zinc-700 text-zinc-400">
              {n.language}
            </span>
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-3">
            {/* 탭바 */}
            <div className="flex items-center border-t border-b border-zinc-800/80 bg-[#1a1a1a]">
              <div className="flex items-center gap-2 px-4 py-2 border-r border-zinc-800 bg-[#141414]"
                style={{ borderBottom: `2px solid ${BRAND}` }}>
                <div className="flex gap-1 mr-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <FileCode className="h-3 w-3 text-zinc-500" />
                <span className="font-code text-[11px] text-zinc-300">
                  {n.title.toLowerCase().replace(/ /g, "_")}.{n.language === "Python" ? "py" : "java"}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-3 px-4">
                <span className="font-space text-[10px] text-zinc-600">{n.code.split("\n").length} lines</span>
                <button
                  onClick={() => navigator.clipboard.writeText(n.code)}
                  className="font-space text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors flex items-center gap-1">
                  <Copy className="h-3 w-3" />copy
                </button>
              </div>
            </div>

            {/* 코드 본체 */}
            <div className="bg-[#141414] font-code text-[13px] overflow-x-auto">
              <div className="flex">
                <div className="select-none shrink-0 border-r border-zinc-800/60 py-4">
                  <div className="px-4 text-right min-w-[48px]">
                    {n.code.split("\n").map((_: string, i: number) => (
                      <div key={i} className="leading-[1.625rem] text-zinc-700 text-[12px]">{i + 1}</div>
                    ))}
                  </div>
                </div>
                <pre className="flex-1 px-4 py-4 text-zinc-300 leading-[1.625rem] overflow-x-auto">
                  <code>{n.code}</code>
                </pre>
              </div>
            </div>

            {/* 하단 상태바 */}
            <div className="h-6 bg-[#1a1a1a] border-t border-zinc-800/60 flex items-center px-4 gap-4">
              <span className="font-space text-[10px] text-zinc-600">{n.language}</span>
              <span className="font-space text-[10px] text-zinc-600">UTF-8</span>
              <span className="font-space text-[10px] text-zinc-600 ml-auto">{n.code.length} chars</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}