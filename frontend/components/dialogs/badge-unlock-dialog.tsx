// components/dialogs/badge-unlock-dialog.tsx
"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const BRAND = "#63C1ED"

export interface UnlockedBadge {
    key: string
    icon: string
    name: string
    desc: string
}

interface BadgeUnlockDialogProps {
    badges: UnlockedBadge[]      // 한 번에 여러 개 땄으면 큐로 순서대로 보여줌
    onClose: () => void
}

export function BadgeUnlockDialog({ badges, onClose }: BadgeUnlockDialogProps) {
    const [index, setIndex] = useState(0)

    // badges가 바뀌면(새로 뱃지 딴 시점) 처음부터 다시 보여줌
    useEffect(() => {
        setIndex(0)
    }, [badges])

    if (badges.length === 0) return null

    const current = badges[index]
    const isLast = index === badges.length - 1

    const handleNext = () => {
        if (isLast) {
            onClose()
        } else {
            setIndex(i => i + 1)
        }
    }

    return (
        <Dialog open={badges.length > 0} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent
                className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-sm text-center overflow-hidden"
                showCloseButton={false}
            >
                {/* 배경 글로우 */}
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${BRAND}, transparent 60%)` }}
                />

                <div className="relative py-4 space-y-4">
                    <p className="font-space text-[10px] tracking-widest uppercase" style={{ color: BRAND }}>
            // BADGE UNLOCKED
                    </p>

                    <div
                        className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center text-4xl animate-in zoom-in-50 duration-500"
                        style={{ background: `${BRAND}15`, border: `1px solid ${BRAND}44` }}
                    >
                        {current.icon}
                    </div>

                    <div>
                        <p className="font-syne text-lg font-bold text-zinc-100">{current.name}</p>
                        <p className="font-ko text-sm text-zinc-400 mt-1 leading-relaxed">{current.desc}</p>
                    </div>

                    {badges.length > 1 && (
                        <p className="font-space text-[11px] text-zinc-500">
                            {index + 1} / {badges.length}
                        </p>
                    )}

                    <Button
                        onClick={handleNext}
                        className="w-full h-10 font-ko font-semibold text-white text-sm"
                        style={{ background: BRAND }}
                    >
                        {isLast ? "확인" : "다음"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}