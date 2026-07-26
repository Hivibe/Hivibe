"use client"

import { useEffect } from "react"

const BRAND = "#63C1ED"

interface SuccessDialogProps {
  open: boolean
  onClose: () => void
  title?: string
  message?: string
  /** 확인 버튼 문구 (기본: 확인) */
  confirmText?: string
  /** 자동으로 닫히는 시간(ms). 지정하면 그 시간 뒤 자동 onClose. 미지정 시 수동 확인만 */
  autoCloseMs?: number
  actionText?: string
  onAction?: () => void
}

export function SuccessDialog({
  open,
  onClose,
  title = "저장되었습니다",
  message,
  confirmText = "확인",
  autoCloseMs,
  actionText,
  onAction,
}: SuccessDialogProps) {
  // ESC / Enter 로 닫기
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  // 자동 닫기 (옵션)
  useEffect(() => {
    if (!open || !autoCloseMs) return
    const t = setTimeout(onClose, autoCloseMs)
    return () => clearTimeout(t)
  }, [open, autoCloseMs, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[sd-fade_150ms_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-[320px] bg-[#17171b] border border-white/10 rounded-2xl shadow-2xl px-8 py-9 flex flex-col items-center text-center animate-[sd-pop_220ms_cubic-bezier(0.34,1.56,0.64,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 체크 아이콘 (원 + 링 펄스 + 그려지는 체크) */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* 확산되는 링 */}
          <span
            className="absolute inline-block rounded-full animate-[sd-ring_600ms_ease-out_forwards]"
            style={{ width: 64, height: 64, border: `2px solid ${BRAND}` }}
          />
          {/* 채워진 원 */}
          <span
            className="relative inline-flex items-center justify-center rounded-full animate-[sd-scale_300ms_ease-out]"
            style={{ width: 64, height: 64, background: BRAND, boxShadow: `0 0 24px ${BRAND}66` }}
          >
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <path
                d="M8 17.5L14.5 24L26 11"
                stroke="white"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                className="animate-[sd-check_400ms_260ms_ease-out_forwards]"
                style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
              />
            </svg>
          </span>
        </div>

        <h2 className="font-syne text-lg font-bold text-white mb-1.5">{title}</h2>
        {message && (
          <p className="font-ko text-[13px] text-zinc-400 leading-relaxed mb-1">{message}</p>
        )}

        <button
          onClick={onClose}
          autoFocus
          className="mt-5 w-full h-10 rounded-lg font-ko text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: BRAND }}
        >
          {confirmText}
        </button>

        {actionText && onAction && (
          <button
            onClick={onAction}
            className="mt-3 font-ko text-xs text-zinc-500 hover:text-zinc-300 underline transition-colors"
          >
            {actionText}
          </button>
        )}
      </div>

      <style jsx global>{`
        @keyframes sd-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sd-pop {
          0% { opacity: 0; transform: scale(0.9) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes sd-scale {
          0% { transform: scale(0); }
          70% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes sd-ring {
          0% { opacity: 0.7; transform: scale(0.6); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        @keyframes sd-check {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}
