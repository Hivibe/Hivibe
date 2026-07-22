"use client"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Save, Check } from "lucide-react"
import { useState } from "react"

const BRAND = "#63C1ED"

interface SaveDiagnosisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
  setFileName: (name: string) => void
  language: string
  editorCode: string
  aiResult: any
  onBadgesUnlocked?: (badges: { key: string; icon: string; name: string; desc: string }[]) => void
  onSaved?: () => void
}

export function SaveDiagnosisDialog({
  open, onOpenChange, fileName, setFileName, language, editorCode, aiResult, onBadgesUnlocked, onSaved
}: SaveDiagnosisDialogProps) {

  const [isSaving, setIsSaving] = useState(false)

  const getGrade = (score: number) => {
    if (score >= 90) return "S"
    if (score >= 80) return "A"
    if (score >= 70) return "B"
    if (score >= 60) return "C"
    return "F"
  }

  const handleSave = async () => {
    if (!fileName.trim()) {
      alert("저장 이름을 입력해 주세요.")
      return
    }

    setIsSaving(true)
    try {
      const response = await apiFetch("/api/v1/diagnoses", {
        method: "POST",
        body: JSON.stringify({
          name: fileName,
          lang: language,
          content: editorCode,
          isStable: "Y",
          grade: getGrade(aiResult?.totalScore ?? 0),
          score: aiResult?.totalScore ?? 0,
          summary: aiResult?.summary ?? "",
          accuracy: aiResult?.accuracy ?? 0,
          accuracyReason: aiResult?.accuracyReason ?? "",
          efficiency: aiResult?.efficiency ?? 0,
          efficiencyReason: aiResult?.efficiencyReason ?? "",
          readability: aiResult?.readability ?? 0,
          readabilityReason: aiResult?.readabilityReason ?? "",
          style: aiResult?.style ?? 0,
          styleReason: aiResult?.styleReason ?? "",
          timeComplexity: aiResult?.complexity ?? "",
          optimizedCode: aiResult?.optimizedCode ?? "",
        }),
      })

      if (response.ok) {
        // 뱃지 체크 — 새로 딴 뱃지(isNew=true)만 골라서 부모에 전달
        let newlyUnlocked: any[] = []
        try {
          const badgeRes = await apiFetch("/api/badges/check", { method: "POST" })
          if (badgeRes.ok) {
            const allBadges = await badgeRes.json()
            newlyUnlocked = allBadges.filter((b: any) => b.newlyAchieved)
          }
        } catch (badgeErr) {
          console.error("뱃지 체크 실패:", badgeErr)
          // 뱃지 체크가 실패해도 진단 저장 자체는 이미 성공했으니 무시하고 진행
        }

        onOpenChange(false)

        if (newlyUnlocked.length > 0 && onBadgesUnlocked) {
          onBadgesUnlocked(newlyUnlocked)   // 뱃지 팝업이 우선
        } else {
          onSaved?.()                        // 성공 모달
        }
      } else {
        alert("저장 실패. 다시 시도해 주세요.")
      }
    } catch (error) {
      console.error("저장 실패:", error)
      alert("서버와 연결할 수 없습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-ko flex items-center gap-2" style={{ color: BRAND }}>
            <Save className="h-4 w-4" />진단 결과 저장
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="font-ko text-[13px] text-zinc-400 leading-relaxed">현재 코드와 분석 결과를 저장합니다.</p>
          <div className="space-y-2">
            <label className="font-ko text-[11px] text-zinc-400 uppercase tracking-wider">저장 이름</label>
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
                <span className="font-ko text-[13px] text-zinc-400">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-400 font-ko text-xs">취소</Button>
          </DialogClose>
          <Button
            size="sm"
            className="text-white text-xs font-ko"
            style={{ background: BRAND }}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}