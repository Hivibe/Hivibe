"use client"

import { Highlight, themes } from "prism-react-renderer"
import Prism from "prismjs"

// 필요한 언어만 추가 (프로젝트에서 쓰는 언어에 맞춰 늘리세요)
import "prismjs/components/prism-java"
import "prismjs/components/prism-python"
import "prismjs/components/prism-c"
import "prismjs/components/prism-cpp"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-javascript"

// note.lang / 선택된 언어 문자열 -> Prism 언어 키 매핑
const langMap: Record<string, string> = {
    java: "java",
    python: "python",
    py: "python",
    c: "c",
    cpp: "cpp",
    "c++": "cpp",
    javascript: "javascript",
    js: "javascript",
    typescript: "typescript",
    ts: "typescript",
}

interface CodeHighlightProps {
    code: string
    language?: string
}

export function CodeHighlight({ code, language }: CodeHighlightProps) {
    const prismLang = langMap[language ?? ""] ?? "javascript"

    return (
        <Highlight
            prism={Prism as any}
            theme={themes.vsDark}
            code={code}
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
    )
}