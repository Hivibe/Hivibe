"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const BRAND = "#63C1ED"

const TIER_COLORS: Record<string, string> = {
  BRONZE: "#CD7F32",
  SILVER: "#C0C0C0",
  GOLD: "#FFD700",
  PLATINUM: BRAND,
  DIAMOND: "#a78bfa",
}

export interface TierUp {
  key: string
  name: string
  label: string
  minCount: number
}

interface TierUpDialogProps {
  tier: TierUp | null
  onClose: () => void
}

export function TierUpDialog({ tier, onClose }: TierUpDialogProps) {
  if (!tier) return null

  const color = TIER_COLORS[tier.key] ?? BRAND

  return (
    <Dialog open={!!tier} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-sm text-center overflow-hidden"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">등급 상승</DialogTitle>

        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 0%, ${color}, transparent 60%)` }}
        />

        <div className="relative py-4 space-y-4">
          <p className="font-ko text-[10px] tracking-widest uppercase" style={{ color }}>
            // TIER UP
          </p>

          <div
            className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center text-4xl animate-in zoom-in-50 duration-500"
            style={{ background: `${color}15`, border: `1px solid ${color}44` }}
          >
            👑
          </div>

          <div>
            <p className="font-syne text-lg font-bold" style={{ color }}>{tier.name}</p>
            <p className="font-ko text-sm text-zinc-400 mt-1 leading-relaxed">
              축하해요! {tier.label} 등급으로 올라갔어요.
            </p>
          </div>

          <Button
            onClick={onClose}
            className="w-full h-10 font-ko font-semibold text-white text-sm"
            style={{ background: color }}
          >
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}