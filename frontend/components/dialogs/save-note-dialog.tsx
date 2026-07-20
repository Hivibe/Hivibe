"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Bookmark, X } from "lucide-react"

interface SaveNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  noteTitle: string
  setNoteTitle: (v: string) => void
  noteTags: string[]
  tagInput: string
  setTagInput: (v: string) => void
  noteMemo: string
  setNoteMemo: (v: string) => void
  addTag: () => void
  removeTag: (tag: string) => void
}

export function SaveNoteDialog({
  open, onOpenChange,
  noteTitle, setNoteTitle,
  noteTags, tagInput, setTagInput,
  noteMemo, setNoteMemo,
  addTag, removeTag,
}: SaveNoteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-ko flex items-center gap-2 text-emerald-400">
            <Bookmark className="h-4 w-4" />노트에 저장
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="font-ko text-[10px] text-zinc-500 uppercase tracking-wider">Title</label>
            <Input
              value={noteTitle}
              onChange={e => setNoteTitle(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-zinc-200 text-sm font-ko" />
          </div>
          <div className="space-y-2">
            <label className="font-ko text-[10px] text-zinc-500 uppercase tracking-wider">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {noteTags.map(tag => (
                <span key={tag} className="font-ko text-[10px] px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400 flex items-center gap-1">
                  #{tag}
                  <button onClick={() => removeTag(tag)}>
                    <X className="h-2.5 w-2.5 ml-0.5 hover:text-zinc-100" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTag()}
                placeholder="태그 입력 후 Enter..."
                className="bg-zinc-950 border-zinc-800 text-zinc-200 text-sm font-ko" />
              <Button size="sm" variant="outline" className="border-zinc-800 text-zinc-400 text-xs" onClick={addTag}>
                Add
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-ko text-[10px] text-zinc-500 uppercase tracking-wider">Memo</label>
            <textarea
              value={noteMemo}
              onChange={e => setNoteMemo(e.target.value)}
              placeholder="나만의 메모..."
              className="font-ko min-h-[80px] w-full rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 text-[13px] p-3 resize-none outline-none" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-400 font-ko text-xs">취소</Button>
          </DialogClose>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-ko"
            onClick={() => onOpenChange(false)}>
            저장 & 3일 후 복습 알림
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}