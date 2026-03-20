// components/dialogs/save-diagnosis-dialog.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Save, Check } from "lucide-react"

const BRAND = "#63C1ED"

interface SaveDiagnosisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
  setFileName: (name: string) => void
  language: string
}

export function SaveDiagnosisDialog({ open, onOpenChange, fileName, setFileName, language }: SaveDiagnosisDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-syne flex items-center gap-2" style={{ color: BRAND }}>
            <Save className="h-4 w-4" />진단 결과 저장
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="font-space text-xs text-zinc-500 leading-relaxed">현재 코드와 분석 결과를 저장합니다.</p>
          <div className="space-y-2">
            <label className="font-space text-[10px] text-zinc-500 uppercase tracking-wider">저장 이름</label>
            <Input
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              placeholder="파일명 입력..."
              className="bg-zinc-950 border-zinc-800 text-zinc-200 text-sm font-code" />
          </div>
          <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-3 space-y-1.5">
            {["코드 원본", "진단 결과 (점수, 복잡도)", `언어 설정 (${language})`].map(item => (
              <div key={item} className="flex items-center gap-2">
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="font-space text-[11px] text-zinc-400">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-400 font-space text-xs">취소</Button>
          </DialogClose>
          <Button size="sm" className="text-white text-xs font-space" style={{ background: BRAND }}
            onClick={() => onOpenChange(false)}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}