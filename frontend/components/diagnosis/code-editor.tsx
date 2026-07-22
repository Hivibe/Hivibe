"use client"

import { useEffect, useRef, useState } from "react"
import { FileCode, Lightbulb } from "lucide-react"
import { Highlight, themes } from "prism-react-renderer"

import Prism from "prismjs"
import "prismjs/components/prism-java"
import "prismjs/components/prism-c"
import "prismjs/components/prism-cpp"
import "prismjs/components/prism-python"
import "prismjs/components/prism-typescript"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const BRAND = "#63C1ED"

const extMap: Record<string, string> = {
  java: "java", python: "py", javascript: "js",
  typescript: "ts", cpp: "cpp", c: "c",
}

const langMap: Record<string, any> = {
  java: "java", python: "python", javascript: "javascript",
  typescript: "typescript", cpp: "cpp", c: "c",
}

export const templates: Record<string, string> = {
  java:
    `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // 여기에 코드를 작성하세요
    }
}`,
  python:
    `import sys
input = sys.stdin.readline

def solution():
    # 여기에 코드를 작성하세요
    pass

solution()`,
  javascript:
    `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    // 여기에 코드를 작성하세요
});`,
  typescript:
    `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line: string) => {
    // 여기에 코드를 작성하세요
});`,
  cpp:
    `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // 여기에 코드를 작성하세요
    return 0;
}`,
  c:
    `#include <stdio.h>
#include <stdlib.h>

int main() {
    // 여기에 코드를 작성하세요
    return 0;
}`,
}


interface CodeEditorProps {
  language: string
  fileName: string
  setFileName: (v: string) => void
  editorCode: string
  setEditorCode: (v: string) => void
  hasAnalyzed: boolean
  aiCoaching: boolean
  onLanguageDetected?: (lang: string) => void   // ← 추가
  setLanguage: (v: string) => void
}

export function CodeEditor({
  language, fileName, setFileName, editorCode,
  setEditorCode, hasAnalyzed, aiCoaching, onLanguageDetected, setLanguage,
}: CodeEditorProps) {
  const ext = extMap[language] ?? "txt"
  const prismLang = langMap[language] ?? "javascript"
  const prevLang = useRef(language)
  const [langConfirmOpen, setLangConfirmOpen] = useState(false)
  const pendingLangRef = useRef<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 탭 이름 인라인 편집 — 타이핑할 때마다 전역 fileName에 직접 반영 (탭/모달 항상 동일한 값)
  const [editingName, setEditingName] = useState(false)
  const nameSnapshotRef = useRef(fileName)   // Esc 취소용 스냅샷
  const nameInputRef = useRef<HTMLInputElement>(null)

  const startEditingName = () => {
    nameSnapshotRef.current = fileName || "untitled"
    if (!fileName) setFileName("untitled")
    setEditingName(true)
  }

  const commitName = () => {
    if (!fileName.trim()) setFileName("untitled")
    setEditingName(false)
  }

  const cancelEditingName = () => {
    setFileName(nameSnapshotRef.current)
    setEditingName(false)
  }

  // 최초 마운트 시 템플릿 세팅
  useEffect(() => {
    if (!editorCode.trim()) {
      setEditorCode(templates[language] ?? "")
    }
  }, [language])

  useEffect(() => {
    if (prevLang.current !== language) {
      if (editorCode.trim() && editorCode.trim() !== (templates[prevLang.current] ?? "").trim()) {
        // 코드가 있으면 다이얼로그 띄우고 언어 일단 되돌리기
        pendingLangRef.current = language
        setLanguage(prevLang.current)   // 일단 이전 언어로 복구
        setLangConfirmOpen(true)
      } else {
        setEditorCode(templates[language] ?? "")
        prevLang.current = language
      }
    }
  }, [language])

  // Tab 키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newVal = editorCode.substring(0, start) + "  " + editorCode.substring(end)
      setEditorCode(newVal)
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2
      })
    }
  }

  const detectLanguage = (code: string): string | null => {
    if (/#include\s*</.test(code)) {
      if (/cout|cin|std::|vector<|nullptr/.test(code)) return "cpp"
      return "c"
    }
    if (/import\s+java\.|public\s+class|System\.out\.print/.test(code)) return "java"
    if (/def\s+\w+\(|import\s+\w+|print\(/.test(code)) return "python"
    if (/:\s*(string|number|boolean)/.test(code) && /const|let|=>/.test(code)) return "typescript"
    if (/const\s+\w+\s*=|let\s+\w+\s*=|require\(/.test(code)) return "javascript"
    return null
  }

  const lineCount = Math.max(20, editorCode.split("\n").length)

  return (
    <div className="h-full flex flex-col bg-[#141414]">

      {/* 탭바 */}
      <div className="flex items-center border-b border-zinc-800/80 bg-[#1a1a1a] shrink-0">
        <div
          className="flex items-center gap-2 px-4 py-2 border-r border-zinc-800 bg-[#141414] group"
          style={{ borderBottom: `2px solid ${BRAND}` }}
          onDoubleClick={() => !editingName && startEditingName()}
        >
          <FileCode className="h-3 w-3 text-zinc-400 shrink-0" />

          {editingName ? (
            <div className="flex items-center">
              <input
                ref={nameInputRef}
                autoFocus
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                onFocus={e => e.currentTarget.select()}
                onBlur={commitName}
                onKeyDown={e => {
                  if (e.key === "Enter") { e.preventDefault(); commitName() }
                  if (e.key === "Escape") { e.preventDefault(); cancelEditingName() }
                }}
                size={Math.max(4, fileName.length)}
                className="bg-transparent text-[13px] outline-none border-none font-code"
                style={{ color: "#FAFAFA" }}
              />
              {/* 확장자는 항상 고정 표시 — 언어 바뀌면 ext도 자동으로 따라감 */}
              <span className="font-code text-[13px] text-zinc-500 select-none">.{ext}</span>
            </div>
          ) : (
            <span
              className="font-code text-[13px] text-zinc-300 cursor-text select-none group-hover:text-zinc-100 transition-colors"
              title="더블클릭해서 이름 변경"
            >
              {fileName || "untitled"}.{ext}
            </span>
          )}

          {editorCode && <div className="h-1.5 w-1.5 rounded-full bg-amber-400 ml-1 shrink-0" />}
        </div>
      </div>

      {/* 에디터 본체 */}
      <div className="flex-1 overflow-auto relative">
        <div className="flex font-code text-[13px] min-h-full">

          {/* 줄번호 */}
          <div className="sticky left-0 bg-[#141414] select-none shrink-0 border-r border-zinc-800/60 pt-4 pb-4 z-10">
            <div className="px-4 text-right min-w-[48px]">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className="leading-[1.625rem] text-zinc-700 text-[12px]">{i + 1}</div>
              ))}
            </div>
          </div>

          {/* 하이라이트 + textarea 레이어 */}
          <div className="flex-1 relative">

            {/* 하이라이트 레이어 (뒤) */}
            <div className="absolute inset-0 px-4 pt-4 pb-4 pointer-events-none overflow-hidden">
              <Highlight
                prism={Prism as any}
                theme={themes.vsDark}
                code={editorCode || " "}
                language={prismLang}
              >
                {({ tokens, getLineProps, getTokenProps }) => (
                  <pre
                    className="font-code text-[13px] leading-[1.625rem] whitespace-pre"
                    style={{ background: "transparent", margin: 0, padding: 0 }}
                  >
                    {tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line })}>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
            </div>

            {/* textarea 레이어 (앞, 투명) */}
            <textarea
              ref={textareaRef}
              value={editorCode}
              onChange={e => {
                const newCode = e.target.value
                // 붙여넣기 감지 — 코드가 갑자기 많이 늘어났을 때
                if (newCode.length - editorCode.length > 10) {
                  const detected = detectLanguage(newCode)
                  if (detected && detected !== language) {
                    onLanguageDetected?.(detected)
                  }
                }
                setEditorCode(newCode)
              }}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              className="absolute inset-0 w-full h-full px-4 pt-4 pb-4 font-code text-[13px] leading-[1.625rem] resize-none outline-none border-none z-10"
              style={{
                caretColor: BRAND,
                tabSize: 2,
                color: "transparent",
                background: "transparent",
                WebkitTextFillColor: "transparent",
              }}
            />
          </div>
        </div>

        {/* AI 코칭 툴팁 */}
        {aiCoaching && editorCode.trim() && !hasAnalyzed && (
          <div className="absolute left-4 bottom-6 z-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-xl max-w-xs">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                <p className="font-ko text-[13px] text-zinc-300 leading-relaxed">
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

      <AlertDialog open={langConfirmOpen} onOpenChange={setLangConfirmOpen}>
        <AlertDialogContent className="bg-[#17171b] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-syne text-white">
              언어를 변경할까요?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-ko text-zinc-400 leading-relaxed">
              언어를 변경하면 현재 작성한 코드가 초기화돼요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 font-ko text-xs"
              onClick={() => {
                pendingLangRef.current = null
                setLangConfirmOpen(false)
              }}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              className="font-ko text-xs text-white"
              style={{ background: "#63C1ED" }}
              onClick={() => {
                if (pendingLangRef.current) {
                  setLanguage(pendingLangRef.current)
                  setEditorCode(templates[pendingLangRef.current] ?? "")
                  prevLang.current = pendingLangRef.current
                  pendingLangRef.current = null
                }
                setLangConfirmOpen(false)
              }}>
              변경
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}