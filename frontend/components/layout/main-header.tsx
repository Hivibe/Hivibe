// components/layout/main-header.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Pace } from "@/components/learning/diff-view"

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
  onLoadPrevious: () => void
  isStartingLearning?: boolean
  pace: Pace
  setPace: (p: Pace) => void
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

const PACE_OPTIONS: { key: Pace; label: string; dot: number }[] = [
  { key: "off", label: "Off", dot: 9 },
  { key: "slow", label: "천천히", dot: 9 },
  { key: "medium", label: "중간", dot: 9 },
  { key: "fast", label: "빠르게", dot: 9 },
]

function PaceRadio({ pace, setPace }: { pace: Pace; setPace: (p: Pace) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-space text-[10px] font-bold tracking-wide hidden xl:inline" style={{ color: BRAND }}>
        LIVE COACHING
      </span>
      <div className="flex items-center">
        {PACE_OPTIONS.map((opt, i) => {
          const active = pace === opt.key
          return (
            <div key={opt.key} className="flex items-center">
              {/* 원들 사이 연결선 (첫 번째 제외) */}
              {i > 0 && <span className="w-4 h-px bg-zinc-700" />}
              <button
                type="button"
                onClick={() => setPace(opt.key)}
                className="flex flex-col items-center gap-1 group px-0.5"
                title={opt.label}
              >
                <span
                  className="rounded-full border-2 flex items-center justify-center transition-all duration-150"
                  style={{
                    width: opt.dot,
                    height: opt.dot,
                    borderColor: active ? BRAND : "#52525b",
                    background: active ? BRAND : "transparent",
                    boxShadow: active ? `0 0 6px ${BRAND}` : "none",
                  }}
                />
                <span
                  className="font-space text-[9px] transition-colors leading-none"
                  style={{ color: active ? BRAND : "#71717a" }}
                >
                  {opt.label}
                </span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function MainHeader({
  activeNav, language, setLanguage,
  pace, setPace,
  editorCode, hasAnalyzed, isAnalyzing, selSession,
  codeCopied, uploadOpen, setUploadOpen,
  onRunAnalysis, onGoLearning,

  onCopyCode, onShare, onSaveDiag, onSaveNote, onFileUpload, onLoadPrevious,
  isStartingLearning,
}: MainHeaderProps) {
  const IconComp = headerIcon[activeNav] ?? ActivityIcon

  return (
    <header className="bg-[#0a0a0a] border-b border-zinc-800/50 shrink-0">

      {/* Row 1 */}
      <div className="h-14 flex items-center justify-between px-5">
        <div className="flex items-center gap-2 shrink-0">
          <IconComp className="h-4 w-4 shrink-0" style={{ color: BRAND }} />
          <span className="font-ko text-sm font-semibold text-zinc-100 whitespace-nowrap">
            {headerTitle[activeNav] ?? ""}
          </span>
        </div>
        {activeNav !== "notes" && activeNav !== "mypage" && (
          <div className="flex items-center gap-2.5">
            {activeNav === "learning" && selSession && (
              <>
                <PaceRadio pace={pace} setPace={setPace} />
                <div className="h-4 w-px bg-zinc-800" />
              </>
            )}

            {activeNav === "diagnosis" && (
              <Button size="sm" disabled={!editorCode.trim() || isAnalyzing}
                onClick={onRunAnalysis}
                className={`h-8 text-white text-xs px-4 font-medium ${editorCode.trim() && !isAnalyzing ? "bg-emerald-500 hover:bg-emerald-600" : "bg-emerald-500/25 cursor-not-allowed"}`}>
                <Play className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                <span className="hidden lg:inline">Run Analysis</span>
              </Button>
            )}

            {activeNav === "diagnosis" && (
              <Button size="sm" disabled={!hasAnalyzed || isStartingLearning}
                onClick={onGoLearning}
                className={`h-8 text-xs px-4 font-medium text-white ${hasAnalyzed && !isStartingLearning
                    ? "bg-amber-400 hover:bg-amber-500"
                    : "bg-amber-400/25 cursor-not-allowed"
                  }`}>
                <GraduationCap className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                <span className="hidden lg:inline">
                  {isStartingLearning ? "Loading..." : "Learning"}
                </span>
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
                className="h-7 px-2.5 flex items-center gap-1.5 rounded border border-zinc-800 font-ko text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 text-[11px] transition-colors">
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
                        <p className="font-ko text-xs text-zinc-200 font-bold">내 컴퓨터에서 코드 불러오기</p>
                        <p className="font-ko text-[12px] text-zinc-500 mt-0.5">모든 코드 파일 지원</p>
                      </div>
                    </button>
                    <div className="h-px bg-zinc-800" />
                    <button
                      onClick={() => { setUploadOpen(false); onLoadPrevious() }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left">
                      <Monitor className="h-4 w-4 text-zinc-400 shrink-0" />
                      <div>
                        <p className="font-ko text-xs text-zinc-200 font-bold">이전 분석에서</p>
                        <p className="font-ko text-[12px] text-zinc-500 mt-0.5">저장된 코드 불러오기</p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onShare}
              className="h-7 px-2.5 flex items-center gap-1.5 rounded border border-zinc-800 font-ko text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 text-[11px] transition-colors">
              <Share2 className="h-3 w-3" />
              <span className="hidden lg:inline">Share</span>
            </button>

            <button
              onClick={onCopyCode}
              className="h-7 px-2.5 flex items-center gap-1.5 rounded border font-ko text-[11px] transition-colors hover:bg-zinc-800"
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