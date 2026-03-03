import { FileCode, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface DiffLine {
  lineNumber: number
  content: string
  type?: "added" | "removed" | "normal"
}

interface CodeDiffViewerProps {
  fileName: string
  originalCode: DiffLine[]
  refactoredCode: DiffLine[]
  addedLines: number
  removedLines: number
  explanation: string
}

export function CodeDiffViewer({
  fileName,
  originalCode,
  refactoredCode,
  addedLines,
  removedLines,
  explanation,
}: CodeDiffViewerProps) {
  return (
    <div className="w-full bg-zinc-950 rounded-md border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-mono text-zinc-100">{fileName}</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-zinc-900 border-zinc-700 text-xs font-mono">
            <Plus className="h-3 w-3 mr-1 text-green-500" />
            <span className="text-green-500">{addedLines}</span>
            <Minus className="h-3 w-3 ml-2 mr-1 text-red-500" />
            <span className="text-red-500">{removedLines}</span>
          </Badge>
          <Button size="sm" className="h-7 text-xs">
            Apply Fix
          </Button>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="grid grid-cols-2 divide-x divide-zinc-800">
        {/* Original Code (Left) */}
        <div className="bg-zinc-900">
          <div className="px-4 py-2 text-xs font-semibold text-zinc-400 border-b border-zinc-800 bg-zinc-900/80">
            Original
          </div>
          <div className="font-mono text-sm">
            {originalCode.map((line) => (
              <div
                key={`original-${line.lineNumber}`}
                className={`flex ${line.type === "removed" ? "bg-red-500/10" : ""}`}
              >
                <div className="px-4 py-1 text-zinc-500 select-none w-12 flex-shrink-0 text-right">
                  {line.lineNumber}
                </div>
                <div className="px-4 py-1 flex-1 overflow-x-auto">
                  <code className="text-zinc-300" dangerouslySetInnerHTML={{ __html: line.content }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Refactored Code (Right) */}
        <div className="bg-zinc-900">
          <div className="px-4 py-2 text-xs font-semibold text-zinc-400 border-b border-zinc-800 bg-zinc-900/80">
            Refactored
          </div>
          <div className="font-mono text-sm">
            {refactoredCode.map((line) => (
              <div
                key={`refactored-${line.lineNumber}`}
                className={`flex ${line.type === "added" ? "bg-green-500/10" : ""}`}
              >
                <div className="px-4 py-1 text-zinc-500 select-none w-12 flex-shrink-0 text-right">
                  {line.lineNumber}
                </div>
                <div className="px-4 py-1 flex-1 overflow-x-auto">
                  <code className="text-zinc-300" dangerouslySetInnerHTML={{ __html: line.content }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/50">
        <div className="flex items-start gap-2">
          <span className="text-xs font-semibold text-zinc-400">Key Changes:</span>
          <span className="text-xs text-zinc-300">{explanation}</span>
        </div>
      </div>
    </div>
  )
}

// Helper function to create syntax-highlighted code
export function highlightSyntax(code: string): string {
  // Simulate basic syntax highlighting with colored spans
  return code
    .replace(/\b(class|public|int|void|return|if|else|for|while)\b/g, '<span class="text-pink-400">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="text-blue-400">$1</span>')
    .replace(/(".*?")/g, '<span class="text-yellow-400">$1</span>')
    .replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span class="text-cyan-400">$1</span>')
    .replace(/\/\/(.*)/g, '<span class="text-zinc-500">// $1</span>')
}
