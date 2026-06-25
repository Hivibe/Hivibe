// components/dialogs/load-diagnosis-dialog.tsx
"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileCode, Monitor } from "lucide-react"

const BRAND = "#63C1ED"

interface DiagnosisListItem {
    dgnsId: number
    name: string
    lang: string
    date: string
}

interface LoadDiagnosisDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (content: string, lang: string, name: string) => void
}

export function LoadDiagnosisDialog({ open, onOpenChange, onSelect }: LoadDiagnosisDialogProps) {
    const [items, setItems] = useState<DiagnosisListItem[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingId, setLoadingId] = useState<number | null>(null)

    useEffect(() => {
        if (!open) return
        setLoading(true)
        apiFetch("/api/v1/diagnoses")
            .then(res => res.json())
            .then(data => setItems(data))
            .catch(e => console.error("이전 분석 목록 불러오기 실패:", e))
            .finally(() => setLoading(false))
    }, [open])

    const handlePick = async (id: number) => {
        setLoadingId(id)
        try {
            const res = await apiFetch(`/api/v1/diagnoses/${id}`)
            if (!res.ok) {
                alert("불러오기 실패했어요. 다시 시도해 주세요.")
                return
            }
            const data = await res.json()
            onSelect(data.content, data.lang, data.name)
            onOpenChange(false)
        } catch (e) {
            console.error("진단 결과 불러오기 실패:", e)
            alert("서버와 연결할 수 없습니다.")
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-ko flex items-center gap-2" style={{ color: BRAND }}>
                        <Monitor className="h-4 w-4" />이전 분석에서 불러오기
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[400px]">
                    {loading ? (
                        <p className="font-ko text-sm text-zinc-500 text-center py-8">불러오는 중...</p>
                    ) : items.length === 0 ? (
                        <p className="font-ko text-sm text-zinc-500 text-center py-8">저장된 진단 결과가 없어요.</p>
                    ) : (
                        <div className="space-y-2 py-2">
                            {items.map(item => (
                                <button
                                    key={item.dgnsId}
                                    onClick={() => handlePick(item.dgnsId)}
                                    disabled={loadingId !== null}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors text-left disabled:opacity-50"
                                >
                                    <FileCode className="h-4 w-4 text-zinc-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-ko text-sm font-medium text-zinc-200 truncate">{item.name}</p>
                                        <p className="font-space text-xs text-zinc-500">
                                            {item.lang} · {new Date(item.date).toLocaleDateString("ko-KR")}
                                        </p>
                                    </div>
                                    {loadingId === item.dgnsId && (
                                        <span className="font-space text-xs text-zinc-500 shrink-0">불러오는 중...</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}