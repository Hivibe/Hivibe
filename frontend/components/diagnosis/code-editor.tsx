// components/diagnosis/code-editor.tsx
"use client"

import { useEffect, useRef } from "react"
import { FileCode, Lightbulb } from "lucide-react"
import { Highlight, themes } from "prism-react-renderer"

import Prism from "prismjs"
import "prismjs/components/prism-java"
import "prismjs/components/prism-c"
import "prismjs/components/prism-cpp"
import "prismjs/components/prism-python"
import "prismjs/components/prism-typescript"

const BRAND = "#63C1ED"

const extMap: Record<string, string> = {
  java: "java", python: "py", javascript: "js",
  typescript: "ts", cpp: "cpp", c: "c",
}

const langMap: Record<string, any> = {
  java: "java", python: "python", javascript: "javascript",
  typescript: "typescript", cpp: "cpp", c: "c",
}

const templates: Record<string, string> = {
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
  const prismLang = langMap[language] ?? "javascript"
  const prevLang = useRef(language)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

   // 최초 마운트 시 템플릿 세팅
    useEffect(() => {
      if (!editorCode.trim()) {
        setEditorCode(templates[language] ?? "")
      }
    }, [language])

    // 언어 변경 시
    useEffect(() => {
    if (prevLang.current !== language) {
      if (editorCode.trim()) {
        const confirmed = window.confirm(
          "언어를 변경하면 현재 코드가 초기화돼요. 변경할까요?"
        )
        if (confirmed) {
          setEditorCode(templates[language] ?? "")
        }
      } else {
        setEditorCode(templates[language] ?? "")
      }
      prevLang.current = language
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

  const lineCount = Math.max(20, editorCode.split("\n").length)

  return (
    <div className="h-full flex flex-col bg-[#141414]">

      {/* 탭바 */}
      <div className="flex items-center border-b border-zinc-800/80 bg-[#1a1a1a] shrink-0">
        <div className="flex items-center gap-2 px-4 py-2 border-r border-zinc-800 bg-[#141414]"
          style={{ borderBottom: `2px solid ${BRAND}` }}>
          <FileCode className="h-3 w-3 text-zinc-400" />
          <span className="font-code text-[13px] text-zinc-300">{fileName || "untitled"}.{ext}</span>
          {editorCode && <div className="h-1.5 w-1.5 rounded-full bg-amber-400 ml-1" />}
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
              onChange={e => setEditorCode(e.target.value)}
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
    </div>
  )
}