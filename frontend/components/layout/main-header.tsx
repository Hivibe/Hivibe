// components/layout/main-header.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Play, Copy, Bookmark, Save,
  Share2, Upload, Monitor, HardDrive,
  Activity as ActivityIcon, GraduationCap, Book, Check, User,
} from "lucide-react"

const BRAND = "#63C1ED"

interface MainHeaderProps {
  activeNav: string
  language: string
  setLanguage: (v: string) => void
  aiCoaching: boolean
  setAiCoaching: (v: boolean) => void
  editorCode: string
  hasAnalyzed: boolean
  isAnalyzing?: boolean
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

const headerTitle: Record<string, string> = {
  diagnosis: "코드 분석",
  learning: "학습하기",
  notes: "나만의 노트",
  mypage: "마이페이지",
}

const headerIcon: Record<string, any> = {
  diagnosis: ActivityIcon,
  learning: GraduationCap,
  notes: Book,
  mypage: User,
}

export function MainHeader({
  activeNav, language, setLanguage,
  aiCoaching, setAiCoaching,
  editorCode, hasAnalyzed, isAnalyzing, selSession,
  codeCopied, uploadOpen, setUploadOpen,
  onRunAnalysis, onGoLearning,
  onCopyCode, onShare, onSaveDiag, onSaveNote, onFileUpload,
}: MainHeaderProps) {
  const IconComp = headerIcon[activeNav] ?? ActivityIcon

  return (
    <header className="bg-[#0a0a0a] border-b border-zinc-800/50 shrink-0">

      {/* Row 1 */}
      <div className="h-14 flex items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <IconComp className="h-4 w-4" style={{ color: BRAND }} />
          <span className="font-ko text-sm font-semibold text-zinc-100">
            {headerTitle[activeNav] ?? ""}
          </span>
        </div>

        {activeNav !== "notes" && activeNav !== "mypage" && (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2">
              <Switch
                checked={aiCoaching}
                onCheckedChange={setAiCoaching}
                className="data-[state=checked]:bg-[#63C1ED] scale-90" />
              <span className="font-space text-[10px] text-zinc-500 hidden xl:inline">Live AI Coaching</span>
            </div>

            <div className="h-4 w-px bg-zinc-800" />

            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-8 w-[120px] bg-zinc-900 border-zinc-800 text-xs text-zinc-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {[["java", "Java"], ["python", "Python"], ["javascript", "JavaScript"], ["typescript", "TypeScript"], ["cpp", "C++"], ["c", "C"]].map(([v, l]) => (
                  <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeNav === "diagnosis" && (
              <Button size="sm" disabled={!hasAnalyzed}
                onClick={onGoLearning}
                className={`h-8 text-xs px-4 font-medium text-white ${hasAnalyzed ? "bg-amber-400 hover:bg-amber-500" : "bg-amber-400/25 cursor-not-allowed"}`}>
                <GraduationCap className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                <span className="hidden lg:inline">Learning</span>
              </Button>
            )}
            {activeNav === "diagnosis" && (
              <Button size="sm" disabled={!editorCode.trim() || isAnalyzing}
                onClick={onRunAnalysis}
                className={`h-8 text-white text-xs px-4 font-medium ${editorCode.trim() && !isAnalyzing ? "bg-emerald-500 hover:bg-emerald-600" : "bg-emerald-500/25 cursor-not-allowed"}`}>
                <Play className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                <span className="hidden lg:inline">Run Analysis</span>
              </Button>
            )}

            {activeNav === "learning" && selSession && (
              <Button size="sm" className="h-8 text-white text-xs px-4 bg-emerald-500 hover:bg-emerald-600">
                <Check className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                <span className="hidden lg:inline">Submit</span>
              </Button>
            )}

            <Button size="sm"
              disabled={activeNav === "diagnosis" && !hasAnalyzed}
              className={`h-8 text-xs px-4 font-medium ${activeNav === "diagnosis" && !hasAnalyzed
                  ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                  : "text-white"
                }`}
              style={activeNav === "diagnosis" && !hasAnalyzed ? {} : { background: BRAND }}
              onClick={onSaveDiag}>
              <Save className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              <span className="hidden lg:inline">Save</span>
            </Button>
          </div>
        )}
      </div>

      {/* Row 2 — 파일명 입력란 제거, 탭에서 더블클릭으로 이름 변경하는 방식으로 통합 */}
      {(activeNav === "diagnosis" || (activeNav === "learning" && selSession)) && (
        <div className="h-9 flex items-center justify-between px-5 border-t border-zinc-800/40">
          <div className="flex items-center gap-2">
            {activeNav === "learning" && selSession && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onSaveNote}
                    className="h-5 w-5 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                    <Bookmark className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  노트에 저장
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button
                onClick={() => setUploadOpen(!uploadOpen)}
                className="h-7 px-2.5 flex items-center gap-1.5 rounded border border-zinc-800 font-space text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 text-[11px] transition-colors">
                <Upload className="h-3 w-3" />
                <span className="hidden lg:inline">Upload</span>
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
              <Share2 className="h-3 w-3" />
              <span className="hidden lg:inline">Share</span>
            </button>

            <button
              onClick={onCopyCode}
              className="h-7 px-2.5 flex items-center gap-1.5 rounded border font-space text-[11px] transition-colors hover:bg-zinc-800"
              style={codeCopied
                ? { color: BRAND, borderColor: `${BRAND}44` }
                : { color: "#71717a", borderColor: "#27272a" }}>
              {codeCopied
                ? <><Check className="h-3 w-3" /><span className="hidden lg:inline">Copied!</span></>
                : <><Copy className="h-3 w-3" /><span className="hidden lg:inline">Copy Code</span></>}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}