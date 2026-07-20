// components/dialogs/load-diagnosis-dialog.tsx
"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileCode, Monitor, Trash2 } from "lucide-react"
import { toast } from "sonner"

const BRAND = "#63C1ED"

interface DiagnosisListItem {
    dgnsId: number
    name: string
    lang: string
    date: string
}

interface DiagnosisDetail {
    name: string
    lang: string
    content: string         // 원본 코드
    totalScore: number
    accuracy: number
    accuracyReason: string
    efficiency: number
    efficiencyReason: string
    readability: number
    readabilityReason: string
    style: number
    styleReason: string
    complexity: string
    summary: string
}

interface LoadDiagnosisDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (content: string, lang: string, name: string, aiResult?: any) => void
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
            .then(data => {
                if (Array.isArray(data)) {
                    setItems(data)
                } else if (data && Array.isArray(data.data)) {
                    setItems(data.data)
                } else if (data && Array.isArray(data.content)) {
                    setItems(data.content)
                } else if (data && Array.isArray(data.result)) {
                    setItems(data.result)
                } else {
                    console.error("백엔드 응답에서 배열을 찾을 수 없습니다:", data)
                    setItems([])
                }
            })
            .catch(e => console.error("이전 분석 목록 불러오기 실패:", e))
            .finally(() => setLoading(false))
    }, [open])

    const handlePick = async (id: number) => {
        setLoadingId(id)
        try {
            const res = await apiFetch(`/api/v1/diagnoses/${id}`)
            if (!res.ok) {
                toast.error("불러오기 실패했어요. 다시 시도해 주세요.")
                return
            }
            const data: DiagnosisDetail = await res.json()

            // 코드 + 진단 결과 함께 전달
            const aiResult = {
                totalScore: data.totalScore,
                accuracy: data.accuracy,
                accuracyReason: data.accuracyReason,
                efficiency: data.efficiency,
                efficiencyReason: data.efficiencyReason,
                readability: data.readability,
                readabilityReason: data.readabilityReason,
                style: data.style,
                styleReason: data.styleReason,
                complexity: data.complexity,
                summary: data.summary
            }

            onSelect(data.content, data.lang, data.name, aiResult)
            onOpenChange(false)
            toast.success("진단 결과를 불러왔어요!")
        } catch (e) {
            console.error("진단 결과 불러오기 실패:", e)
            toast.error("서버와 연결할 수 없습니다.")
        } finally {
            setLoadingId(null)
        }
    }

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation()
        if (!window.confirm("이 진단 기록을 삭제하시겠습니까?")) return

        try {
            const res = await apiFetch(`/api/v1/diagnoses/${id}`, { method: "DELETE" })
            if (res.ok) {
                setItems(prev => prev.filter(item => item.dgnsId !== id))
                toast.success("삭제되었습니다!")
            } else {
                toast.error("삭제에 실패했습니다.")
            }
        } catch (error) {
            console.error("삭제 중 오류 발생:", error)
            toast.error("서버와 연결할 수 없습니다.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="sr-only">이전 분석에서 불러오기</DialogTitle>
                    <div className="font-ko flex items-center gap-2 text-lg font-semibold" style={{ color: BRAND }}>
                        <Monitor className="h-4 w-4" />이전 분석에서 불러오기
                    </div>
                </DialogHeader>
                <ScrollArea className="max-h-[400px]">
                    {loading ? (
                        <p className="font-ko text-sm text-zinc-500 text-center py-8">불러오는 중...</p>
                    ) : items.length === 0 ? (
                        <p className="font-ko text-sm text-zinc-500 text-center py-8">저장된 진단 결과가 없어요.</p>
                    ) : (
                        <div className="space-y-2 py-2">
                            {items.map(item => (
                                <div key={item.dgnsId}
                                    className="w-full flex items-center justify-between p-2 pl-3 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors group">
                                    <div
                                        className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer"
                                        onClick={() => { if (loadingId === null) handlePick(item.dgnsId) }}>
                                        <FileCode className="h-4 w-4 text-zinc-500 shrink-0" />
                                        <div className="flex-1 min-w-0 py-1">
                                            <p className="font-ko text-sm font-medium text-zinc-200 truncate">{item.name}</p>
                                            <p className="font-ko text-xs text-zinc-500">
                                                {item.lang} · {new Date(item.date).toLocaleDateString("ko-KR")}
                                            </p>
                                        </div>
                                        {loadingId === item.dgnsId && (
                                            <span className="font-ko text-xs text-zinc-500 shrink-0 mr-2">불러오는 중...</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(e, item.dgnsId)}
                                        disabled={loadingId !== null}
                                        className="p-2 text-zinc-600 hover:text-red-400 hover:bg-zinc-700/50 rounded-md transition-colors shrink-0"
                                        aria-label="삭제하기">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}