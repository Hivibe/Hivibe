// components/diagnosis/code-editor.tsx
"use client"

import { FileCode, Lightbulb } from "lucide-react"

const BRAND = "#63C1ED"

const extMap: Record<string, string> = {
  java: "java", python: "py", javascript: "js",
  typescript: "ts", cpp: "cpp", c: "c",
}

interface CodeEditorProps {
  language: string
  fileName: string
  editorCode: string
  setEditorCode: (v: string) => void
  hasAnalyzed: boolean
  aiCoaching: boolean
}

export function CodeEditor({
  language, fileName, editorCode,
  setEditorCode, hasAnalyzed, aiCoaching,
}: CodeEditorProps) {
  const ext = extMap[language] ?? "txt"

  return (
    <div className="h-full flex flex-col bg-[#141414]">
      {/* 탭바 */}
      <div className="flex items-center border-b border-zinc-800/80 bg-[#1a1a1a] shrink-0">
        <div className="flex items-center gap-2 px-4 py-2 border-r border-zinc-800 bg-[#141414]"
          style={{ borderBottom: `2px solid ${BRAND}` }}>
          <FileCode className="h-3 w-3 text-zinc-400" />
          <span className="font-code text-[11px] text-zinc-300">{fileName || "untitled"}.{ext}</span>
          {editorCode && <div className="h-1.5 w-1.5 rounded-full bg-amber-400 ml-1" />}
        </div>
      </div>

      {/* 에디터 본체 */}
      <div className="flex-1 overflow-auto relative">
        <div className="flex font-code text-[13px] min-h-full">
          {/* 줄번호 */}
          <div className="sticky left-0 bg-[#141414] select-none shrink-0 border-r border-zinc-800/60 pt-4 pb-4">
            <div className="px-4 text-right min-w-[48px]">
              {Array.from({ length: Math.max(20, editorCode.split("\n").length) }, (_, i) => (
                <div key={i} className="leading-[1.625rem] text-zinc-700 text-[12px]">{i + 1}</div>
              ))}
            </div>
          </div>
          {/* textarea */}
          <div className="flex-1 relative">
            <textarea
              value={editorCode}
              onChange={e => setEditorCode(e.target.value)}
              placeholder="// 여기에 코드를 붙여넣으세요..."
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              className="absolute inset-0 w-full h-full px-4 pt-4 pb-4 bg-transparent text-zinc-200 font-code text-[13px] leading-[1.625rem] resize-none outline-none border-none placeholder:text-zinc-700 z-10"
              style={{ caretColor: BRAND, tabSize: 2 }} />
          </div>
        </div>

        {/* AI 코칭 툴팁 */}
        {aiCoaching && editorCode.trim() && !hasAnalyzed && (
          <div className="absolute left-4 bottom-6 z-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-xl max-w-xs">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                <p className="font-space text-[11px] text-zinc-300 leading-relaxed">
                  <span className="text-amber-300">Tip:</span> 코드 작성 완료 후 Run Analysis를 눌러보세요!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 상태바 */}
      <div className="h-6 bg-[#1a1a1a] border-t border-zinc-800/60 flex items-center px-4 gap-4 shrink-0">
        <span className="font-space text-[10px] text-zinc-600">{editorCode.split("\n").length} lines</span>
        <span className="font-space text-[10px] text-zinc-600">{editorCode.length} chars</span>
        <span className="font-space text-[10px] text-zinc-600 ml-auto">{language.toUpperCase()}</span>
      </div>
    </div>
  )
}