// components/leetcode-ide.tsx
"use client"

import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { ScrollArea } from "@/frontend/components/ui/scroll-area"
import { TooltipProvider } from "@/frontend/components/ui/tooltip"

// layout
import { Sidebar }    from "@/frontend/components/layout/sidebar"
import { MainHeader } from "@/frontend/components/layout/main-header"

// diagnosis
import { DiagnosisPanel } from "@/frontend/components/diagnosis/diagnosis-panel"
import { CodeEditor }     from "@/frontend/components/diagnosis/code-editor"

// learning
import { ArchiveView } from "@/frontend/components/learning/archive-view"
import { DiffView }    from "@/frontend/components/learning/diff-view"

// notes
import { NotesList }  from "@/frontend/components/notes/notes-list"
import { NoteDetail } from "@/frontend/components/notes/note-detail"

// mypage
import { MyPage } from "@/frontend/components/mypage/my-page"

// dialogs
import { SaveDiagnosisDialog } from "@/frontend/components/dialogs/save-diagnosis-dialog"
import { SaveNoteDialog }      from "@/frontend/components/dialogs/save-note-dialog"

// types
import type { LearningSession, Note } from "@/frontend/types"

/* ── 목 데이터 ── */
const initSessions: LearningSession[] = [
  { id: 1, title: "Binary Search Implementation",  date: "Oct 20, 2025", grade: "B+", tags: ["Binary Search","Arrays","O(log n)"], language: "Java",   favorited: true  },
  { id: 2, title: "Graph DFS Optimization",         date: "Oct 24, 2025", grade: "B+", tags: ["DFS","Recursion","Graph"],          language: "Java",   favorited: false },
  { id: 3, title: "Dynamic Programming – Knapsack", date: "Oct 18, 2025", grade: "A",  tags: ["DP","Memoization","Optimization"],  language: "Python", favorited: false },
  { id: 4, title: "Merge Sort Deep Dive",           date: "Oct 12, 2025", grade: "A+", tags: ["Sorting","Divide&Conquer"],         language: "Java",   favorited: false },
  { id: 5, title: "Linked List Operations",         date: "Oct 8,  2025", grade: "B+", tags: ["LinkedList","Pointers"],            language: "Java",   favorited: false },
]

const mockNotes: Note[] = [
  {
    id: 1, title: "Graph DFS Optimization", date: "Oct 24, 2025", grade: "B+",
    gradeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    tags: ["DFS","Recursion","Graph"], language: "Python", favorited: false, category: "Graph",
    memo: "Applied memoization to avoid redundant traversals in dense graphs.\n\nKey insight: storing visited nodes in a shared set across recursive calls eliminates duplicate work.",
    code: `def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    for next_node in graph[start]:
        if next_node not in visited:
            dfs(graph, next_node, visited)
    return visited`,
  },
  {
    id: 2, title: "Binary Search Implementation", date: "Oct 20, 2025", grade: "A",
    gradeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    tags: ["Binary Search","Arrays","O(log n)"], language: "Java", favorited: true, category: "Arrays",
    memo: "Classic divide-and-conquer approach. Key is maintaining correct lo/hi boundaries.",
    code: `public int search(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
  },
]

/* ── COMPONENT ── */
export function LeetCodeIDE() {
  const router = useRouter()

  // global
  const [language,   setLanguage]   = useState("java")
  const [activeNav,  setActiveNav]  = useState("diagnosis")
  const [sidebarExp, setSidebarExp] = useState(true)
  const [aiCoaching, setAiCoaching] = useState(true)

  // diagnosis
  const [editorCode,   setEditorCode]   = useState("")
  const [hasAnalyzed,  setHasAnalyzed]  = useState(false)
  const [analyzedCode, setAnalyzedCode] = useState("")

  // files
  const [fileName,   setFileName]   = useState("")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // learning
  const [sessions,   setSessions]   = useState<LearningSession[]>(initSessions)
  const [selSession, setSelSession] = useState<number | null>(null)

  // notes
  const [notes,   setNotes]   = useState<Note[]>(mockNotes)
  const [selNote, setSelNote] = useState(1)

  // panel collapse
  const [diagPanelOpen,  setDiagPanelOpen]  = useState(true)
  const [notesPanelOpen, setNotesPanelOpen] = useState(true)

  // dialogs
  const [saveDiagOpen, setSaveDiagOpen] = useState(false)
  const [saveNoteOpen, setSaveNoteOpen] = useState(false)
  const [noteTitle,    setNoteTitle]    = useState("Nested Loop vs HashMap Performance")
  const [noteTags,     setNoteTags]     = useState(["Java", "Optimization", "DataStructure"])
  const [tagInput,     setTagInput]     = useState("")
  const [noteMemo,     setNoteMemo]     = useState("")

  /* ── 핸들러 ── */
  const handleCopyCode = () => {
    navigator.clipboard.writeText(editorCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "HiVibe", url: window.location.href }) } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleNavClick = (id: string) => {
    if (id === "home") { router.push("/"); return }
    setActiveNav(id)
    if (id !== "learning") setSelSession(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    setFileName(f.name.replace(/\.[^/.]+$/, ""))
    const r = new FileReader()
    r.onload = ev => setEditorCode(ev.target?.result as string ?? "")
    r.readAsText(f); e.target.value = ""
  }

  const toggleFav = (id: number) =>
    setSessions(p => p.map(s => s.id === id ? { ...s, favorited: !s.favorited } : s))

  const toggleNoteFav = (id: number) =>
    setNotes(p => p.map(n => n.id === id ? { ...n, favorited: !n.favorited } : n))

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !noteTags.includes(t)) { setNoteTags(p => [...p, t]); setTagInput("") }
  }

  const removeTag = (tag: string) => setNoteTags(p => p.filter(t => t !== tag))

  const currentSession = sessions.find(s => s.id === selSession) ?? null

  /* ── RENDER ── */
  return (
    <TooltipProvider>
      <style>{`
        .font-syne  { font-family: 'Syne', sans-serif; }
        .font-space { font-family: 'Space Mono', monospace; }
        .font-code  { font-family: 'D2Coding', monospace; }
      `}</style>

      <div className="h-screen w-full bg-zinc-950 flex overflow-hidden">

        {/* 사이드바 */}
        <Sidebar
          activeNav={activeNav}
          sidebarExp={sidebarExp}
          setSidebarExp={setSidebarExp}
          onNavClick={handleNavClick}
        />

        {/* 메인 */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* 헤더 */}
          <MainHeader
            activeNav={activeNav}
            language={language}
            setLanguage={setLanguage}
            aiCoaching={aiCoaching}
            setAiCoaching={setAiCoaching}
            fileName={fileName}
            setFileName={setFileName}
            editorCode={editorCode}
            hasAnalyzed={hasAnalyzed}
            selSession={selSession}
            codeCopied={codeCopied}
            uploadOpen={uploadOpen}
            setUploadOpen={setUploadOpen}
            onRunAnalysis={() => { if (editorCode.trim()) setHasAnalyzed(true) }}
            onGoLearning={() => { setAnalyzedCode(editorCode); setActiveNav("learning") }}
            onCopyCode={handleCopyCode}
            onShare={handleShare}
            onSaveDiag={() => setSaveDiagOpen(true)}
            onSaveNote={() => setSaveNoteOpen(true)}
            onFileUpload={() => fileRef.current?.click()}
          />

          {/* hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept=".java,.py,.js,.ts,.cpp,.c,.cs,.go,.rs,.kt"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* ── DIAGNOSIS ── */}
          {activeNav === "diagnosis" && (
            <div className="flex-1 flex overflow-hidden">
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${
                  diagPanelOpen ? "w-[420px]" : "w-0"
                }`}
              >
                <div className="w-[420px] h-full">
                  <ScrollArea className="h-full bg-zinc-950">
                    <DiagnosisPanel hasAnalyzed={hasAnalyzed} />
                  </ScrollArea>
                </div>
              </div>
              <div className="w-px bg-zinc-800/50 relative flex items-center justify-center shrink-0">
                <button
                  onClick={() => setDiagPanelOpen(p => !p)}
                  className="absolute z-10 w-4 h-8 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-sm flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {diagPanelOpen ? "‹" : "›"}
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <CodeEditor
                  language={language}
                  fileName={fileName}
                  editorCode={editorCode}
                  setEditorCode={setEditorCode}
                  hasAnalyzed={hasAnalyzed}
                  aiCoaching={aiCoaching}
                />
              </div>
            </div>
          )}

          {/* ── LEARNING ── */}
          {activeNav === "learning" && (
            <>
              {!selSession && (
                <ArchiveView
                  sessions={sessions}
                  onSelectSession={setSelSession}
                  onToggleFav={toggleFav}
                />
              )}
              {selSession && currentSession && (
                <DiffView
                  session={currentSession}
                  analyzedCode={analyzedCode}
                  onBack={() => setSelSession(null)}
                />
              )}
            </>
          )}

          {/* ── NOTES ── */}
          {activeNav === "notes" && (
            <div className="flex-1 flex overflow-hidden">
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden shrink-0 bg-[#0a0a0a] ${
                  notesPanelOpen ? "w-[420px]" : "w-0"
                }`}
              >
                <div className="w-[420px] h-full">
                  <NotesList
                    notes={notes}
                    selNote={selNote}
                    setSelNote={setSelNote}
                    toggleNoteFav={toggleNoteFav}
                  />
                </div>
              </div>
              <div className="w-px bg-zinc-800/50 relative flex items-center justify-center shrink-0">
                <button
                  onClick={() => setNotesPanelOpen(p => !p)}
                  className="absolute z-10 w-4 h-8 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-sm flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {notesPanelOpen ? "‹" : "›"}
                </button>
              </div>
              <div className="flex-1 min-w-0 bg-zinc-950">
                <NoteDetail note={notes.find(n => n.id === selNote) ?? notes[0]} />
              </div>
            </div>
          )}

          {/* ── MYPAGE ── */}
          {activeNav === "mypage" && (
            <div className="flex-1 overflow-hidden">
              <MyPage />
            </div>
          )}

        </div>

        {/* ── 다이얼로그 ── */}
        <SaveDiagnosisDialog
          open={saveDiagOpen}
          onOpenChange={setSaveDiagOpen}
          fileName={fileName}
          setFileName={setFileName}
          language={language}
        />

        <SaveNoteDialog
          open={saveNoteOpen}
          onOpenChange={setSaveNoteOpen}
          noteTitle={noteTitle}
          setNoteTitle={setNoteTitle}
          noteTags={noteTags}
          tagInput={tagInput}
          setTagInput={setTagInput}
          noteMemo={noteMemo}
          setNoteMemo={setNoteMemo}
          addTag={addTag}
          removeTag={removeTag}
        />
      </div>
    </TooltipProvider>
  )
}