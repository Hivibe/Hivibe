// components/layout/main-header.tsx
"use client"

import { Button } from "@/frontend/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/frontend/components/ui/select"
import { Switch } from "@/frontend/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/frontend/components/ui/tooltip"
import {
  Play, Copy, FileCode, Bookmark, Save,
  Share2, Upload, Monitor, HardDrive,
  Activity as ActivityIcon, GraduationCap, Book, Check,
} from "lucide-react"

const BRAND = "#63C1ED"

interface MainHeaderProps {
  activeNav: string
  language: string
  setLanguage: (v: string) => void
  aiCoaching: boolean
  setAiCoaching: (v: boolean) => void
  fileName: string
  setFileName: (v: string) => void
  editorCode: string
  hasAnalyzed: boolean
  selSession: number | null
  codeCopied: boolean
  uploadOpen: boolean
  setUploadOpen: (v: boolean) => void
  onRunAnalysis: () => void
  onGoLearning: () => void
  onCopyCode: () => void
  onShare: () => void
  onSaveDiag: () => void
  onSaveNote: () => void
  onFileUpload: () => void
}

const ext: Record<string, string> = {
  java: "java", python: "py", javascript: "js",
  typescript: "ts", cpp: "cpp", c: "c",
}

const headerTitle: Record<string, string> = {
  diagnosis: "코드 분석",
  learning:  "학습하기",
  notes:     "나만의 노트",
}

export function MainHeader({
  activeNav, language, setLanguage,
  aiCoaching, setAiCoaching,
  fileName, setFileName,
  editorCode, hasAnalyzed, selSession,
  codeCopied, uploadOpen, setUploadOpen,
  onRunAnalysis, onGoLearning,
  onCopyCode, onShare, onSaveDiag, onSaveNote, onFileUpload,
}: MainHeaderProps) {
  const fileExt = ext[language] ?? "txt"

  return (
    <header className="bg-[#0a0a0a] border-b border-zinc-800/50 shrink-0">

      {/* Row 1 — 타이틀 + 버튼들 */}
      <div className="h-14 flex items-center justify-between px-5">
        <div className="flex items-center gap-2">
          {activeNav === "diagnosis" && <ActivityIcon className="h-4 w-4" style={{ color: BRAND }} />}
          {activeNav === "learning"  && <GraduationCap className="h-4 w-4" style={{ color: BRAND }} />}
          {activeNav === "notes"     && <Book className="h-4 w-4" style={{ color: BRAND }} />}
          <span className="font-syne text-sm font-semibold text-zinc-100">
            {headerTitle[activeNav] ?? ""}
          </span>
        </div>

        {activeNav !== "notes" && (
          <div className="flex items-center gap-2.5">
            {/* AI Coaching 토글 */}
            <div className="flex items-center gap-2">
              <Switch
                checked={aiCoaching}
                onCheckedChange={setAiCoaching}
                className="data-[state=checked]:bg-[#63C1ED] scale-90" />
              <span className="font-space text-[10px] text-zinc-500">Live AI Coaching</span>
            </div>

            <div className="h-4 w-px bg-zinc-800" />

            {/* 언어 선택 */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-8 w-[120px] bg-zinc-900 border-zinc-800 text-xs text-zinc-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {[["java","Java"],["python","Python"],["javascript","JavaScript"],["typescript","TypeScript"],["cpp","C++"],["c","C"]].map(([v, l]) => (
                  <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Diagnosis 버튼들 */}
            {activeNav === "diagnosis" && (
              <Button size="sm" disabled={!hasAnalyzed}
                onClick={onGoLearning}
                className={`h-8 text-xs px-4 font-medium text-white ${hasAnalyzed ? "bg-amber-400 hover:bg-amber-500" : "bg-amber-400/25 cursor-not-allowed"}`}>
                <GraduationCap className="h-3.5 w-3.5 mr-1.5" />Learning
              </Button>
            )}
            {activeNav === "diagnosis" && (
              <Button size="sm" disabled={!editorCode.trim()}
                onClick={onRunAnalysis}
                className={`h-8 text-white text-xs px-4 font-medium ${editorCode.trim() ? "bg-emerald-500 hover:bg-emerald-600" : "bg-emerald-500/25 cursor-not-allowed"}`}>
                <Play className="h-3.5 w-3.5 mr-1.5" />Run Analysis
              </Button>
            )}

            {/* Learning Submit */}
            {activeNav === "learning" && selSession && (
              <Button size="sm" className="h-8 text-white text-xs px-4 bg-emerald-500 hover:bg-emerald-600">
                <Check className="h-3.5 w-3.5 mr-1.5" />Submit
              </Button>
            )}

            {/* Save */}
            <Button size="sm" className="h-8 text-white text-xs px-4 font-medium"
              style={{ background: BRAND }}
              onClick={onSaveDiag}>
              <Save className="h-3.5 w-3.5 mr-1.5" />Save
            </Button>
          </div>
        )}
      </div>

      {/* Row 2 — 파일명 + Upload/Share/Copy */}
      {(activeNav === "diagnosis" || (activeNav === "learning" && selSession)) && (
        <div className="h-9 flex items-center justify-between px-5 border-t border-zinc-800/40">
          <div className="flex items-center gap-2">
            <FileCode className="h-3.5 w-3.5 text-zinc-600" />
            <input
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              placeholder="Name your file..."
              className="bg-transparent text-xs outline-none border-none w-44 font-code placeholder:text-zinc-700"
              style={{ color: "#FAFAFA" }} />
            <span className="font-code text-xs text-zinc-700">.{fileExt}</span>

            {/* Learning 북마크 */}
            {activeNav === "learning" && selSession && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onSaveNote}
                    className="h-5 w-5 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors ml-1">
                    <Bookmark className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-900 border-zinc-700 text-zinc-200 text-xs font-space" side="bottom">
                  노트에 저장
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Upload 드롭다운 */}
            <div className="relative">
              <button
                onClick={() => setUploadOpen(!uploadOpen)}
                className="h-7 px-2.5 flex items-center gap-1.5 rounded border border-zinc-800 font-space text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 text-[11px] transition-colors">
                <Upload className="h-3 w-3" />Upload
              </button>
              {uploadOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUploadOpen(false)} />
                  <div className="absolute right-0 top-8 z-20 w-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden">
                    <button
                      onClick={() => { setUploadOpen(false); onFileUpload() }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left">
                      <HardDrive className="h-4 w-4 text-zinc-400 shrink-0" />
                      <div>
                        <p className="font-space text-xs text-zinc-200 font-bold">내 컴퓨터에서 코드 불러오기</p>
                        <p className="font-space text-[10px] text-zinc-500 mt-0.5">모든 코드 파일 지원</p>
                      </div>
                    </button>
                    <div className="h-px bg-zinc-800" />
                    <button
                      onClick={() => setUploadOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left">
                      <Monitor className="h-4 w-4 text-zinc-400 shrink-0" />
                      <div>
                        <p className="font-space text-xs text-zinc-200 font-bold">이전 분석에서</p>
                        <p className="font-space text-[10px] text-zinc-500 mt-0.5">저장된 코드 불러오기</p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onShare}
              className="h-7 px-2.5 flex items-center gap-1.5 rounded border border-zinc-800 font-space text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 text-[11px] transition-colors">
              <Share2 className="h-3 w-3" />Share
            </button>

            <button
              onClick={onCopyCode}
              className="h-7 px-2.5 flex items-center gap-1.5 rounded border font-space text-[11px] transition-colors hover:bg-zinc-800"
              style={codeCopied
                ? { color: BRAND, borderColor: `${BRAND}44` }
                : { color: "#71717a", borderColor: "#27272a" }}>
              {codeCopied
                ? <><Check className="h-3 w-3" />Copied!</>
                : <><Copy className="h-3 w-3" />Copy Code</>}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}