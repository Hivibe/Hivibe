"use client"

import { Star, Trash2 } from "lucide-react"
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
import type { LearningSession } from "@/types"

const langColor: Record<string, string> = {
  Java: "text-[#63C1ED]",
  Python: "text-amber-500",
  JavaScript: "text-yellow-400",
  TypeScript: "text-blue-400",
  "C++": "text-purple-400",
  C: "text-emerald-400",
}

interface SCardProps {
  s: LearningSession
  compact?: boolean
  onSelect: () => void
  onFav: () => void
  onDelete: () => void
}

export function SessionCard({ s, onSelect, onFav, compact, onDelete }: SCardProps) {
  return (
    <div onClick={onSelect}
      className={`group bg-[#17171b] border border-white/5 rounded-2xl cursor-pointer hover:border-[#63C1ED]/30 hover:bg-[#1e1e23] transition-all duration-200 ${compact ? "p-5" : "p-6 mb-4"}`}>

      <div className="flex items-start justify-between gap-4">
        {/* 왼쪽 텍스트 정보 */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-syne font-bold text-white truncate group-hover:text-[#63C1ED] transition-colors ${compact ? "text-lg" : "text-xl"}`}>
            {s.title}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 font-space text-[11px] text-zinc-500">
            <span>{s.date}</span>
            <span>·</span>
            <span className={`flex items-center gap-1 ${langColor[s.language] || "text-[#63C1ED]"}`}>
              <span className="text-[8px]">●</span> {s.language}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {s.tags.slice(0, compact ? 3 : 4).map(t => (
              <span key={t} className="font-space text-[10px] px-2.5 py-1 rounded-md border border-white/5 bg-white/5 text-zinc-400">
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* 오른쪽 뱃지 및 액션 버튼 */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <span className="font-syne font-bold text-[11px] px-2.5 py-1 rounded-md bg-white/5 text-zinc-300 border border-white/5">
            {s.grade}
          </span>

          <div className="flex items-center gap-1">
            {/* 삭제 — hover 시에만 노출 */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  onClick={e => e.stopPropagation()}
                  className="h-7 w-7 flex items-center justify-center rounded-md text-zinc-600 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                  title="삭제">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </AlertDialogTrigger>

              <AlertDialogContent
                onClick={e => e.stopPropagation()}
                className="bg-[#17171b] border-white/10"
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-syne text-white">
                    학습을 삭제할까요?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-ko text-zinc-400 leading-relaxed">
                    <span className="text-zinc-200 font-bold">{s.title}</span>
                    <br />
                    학습 기록과 제출 이력이 모두 사라져요. 되돌릴 수 없어요.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 font-space text-xs">
                    취소
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-space text-xs"
                  >
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* 즐겨찾기 */}
            <button
              onClick={e => { e.stopPropagation(); onFav() }}
              className="h-7 w-7 flex items-center justify-center rounded-md transition-colors hover:bg-white/10"
              style={{ color: s.favorited ? "#f59e0b" : "#52525b" }}>
              <Star className={`h-4 w-4 ${s.favorited ? "fill-amber-500" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}