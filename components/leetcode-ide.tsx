"use client"

import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Play, Copy, TrendingUp, Sparkles, FileCode, Bookmark, Lightbulb,
  X, Timer, PanelLeft, Home, Activity as ActivityIcon, Book, Settings, Search,
  Edit2, Share2, Trash2, Code2, GraduationCap, Upload, Save,
  Monitor, HardDrive, Check, Star, Flame, FolderOpen,
} from "lucide-react"
import {
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, Line, LineChart, Area, AreaChart,
} from "recharts"

const BRAND = "#63C1ED"

/* ── DATA ── */
const currentComplexityData = [
  { n: 10, time: 100 }, { n: 50, time: 2500 }, { n: 100, time: 10000 },
  { n: 200, time: 40000 }, { n: 500, time: 250000 },
]
const complexityComparisonData = [
  { name: "10", original: 100, optimized: 10 }, { name: "50", original: 2500, optimized: 50 },
  { name: "100", original: 10000, optimized: 100 }, { name: "200", original: 40000, optimized: 200 },
  { name: "500", original: 250000, optimized: 500 },
]

const navItems = [
  { id: "home",      label: "Home",      icon: Home },
  { id: "diagnosis", label: "Diagnosis", icon: ActivityIcon },
  { id: "learning",  label: "Learning",  icon: GraduationCap },
  { id: "notes",     label: "My Notes",  icon: Book },
]

interface LearningSession {
  id: number; title: string; date: string; grade: string
  tags: string[]; language: string; favorited: boolean
}

const initSessions: LearningSession[] = [
  { id: 1, title: "Binary Search Implementation",  date: "Oct 20, 2025", grade: "B+", tags: ["Binary Search","Arrays","O(log n)"], language: "Java",   favorited: true  },
  { id: 2, title: "Graph DFS Optimization",         date: "Oct 24, 2025", grade: "B+", tags: ["DFS","Recursion","Graph"],          language: "Java",   favorited: false },
  { id: 3, title: "Dynamic Programming – Knapsack", date: "Oct 18, 2025", grade: "A",  tags: ["DP","Memoization","Optimization"],  language: "Python", favorited: false },
  { id: 4, title: "Merge Sort Deep Dive",           date: "Oct 12, 2025", grade: "A+", tags: ["Sorting","Divide&Conquer"],         language: "Java",   favorited: false },
  { id: 5, title: "Linked List Operations",         date: "Oct 8,  2025", grade: "B+", tags: ["LinkedList","Pointers"],            language: "Java",   favorited: false },
]

const mockNotes = [
  {
    id: 1, title: "Graph DFS Optimization", date: "Oct 24, 2025", grade: "B+",
    tags: ["DFS","Recursion","Graph"], language: "Python", favorited: false, category: "Graph",
    memo: "Applied memoization to avoid redundant traversals in dense graphs. Time complexity reduced from O(V+E) per query to O(V+E) amortized.\n\nKey insight: storing visited nodes in a shared set across recursive calls eliminates duplicate work when the same subgraph is reached from multiple entry points.",
    code: `def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    for next_node in graph[start]:
        if next_node not in visited:
            dfs(graph, next_node, visited)
    return visited

# Optimized with memoization
def dfs_optimized(graph, start, memo=None):
    if memo is None:
        memo = {}
    if start in memo:
        return memo[start]
    visited = {start}
    for next_node in graph[start]:
        visited.update(dfs_optimized(graph, next_node, memo))
    memo[start] = visited
    return visited`,
  },
  {
    id: 2, title: "Binary Search Implementation", date: "Oct 20, 2025", grade: "A",
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
  {
    id: 3, title: "Hash Map Collision Resolution", date: "Oct 18, 2025", grade: "A-",
    tags: ["Hash Table","Collision","Chaining"], language: "Java", favorited: false, category: "Hash Table",
    memo: "Separate chaining with linked lists. Load factor threshold at 0.75.",
    code: `// Chaining-based hash map
public class HashMap<K,V> {
    private LinkedList<Entry>[] table;
    // ...implementation
}`,
  },
  {
    id: 4, title: "Dynamic Programming: Fibonacci", date: "Oct 15, 2025", grade: "B",
    tags: ["DP","Memoization"], language: "Python", favorited: false, category: "DP",
    memo: "Bottom-up DP avoids recursion stack overflow. Space optimized to O(1).",
    code: `def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
  },
]

const langDot: Record<string, string> = {
  Java: "#63C1ED", Python: "#f59e0b", JavaScript: "#eab308",
  TypeScript: "#60a5fa", "C++": "#a78bfa", C: "#6ee7b7",
}
const extMap: Record<string, string> = {
  java: "java", python: "py", javascript: "js", typescript: "ts", cpp: "cpp", c: "c",
}

/* ── COMPONENT ── */
export function LeetCodeIDE() {
  const router = useRouter()

  // global
  const [language,     setLanguage]     = useState("java")
  const [activeNav,    setActiveNav]    = useState("diagnosis")
  const [sidebarExp,   setSidebarExp]   = useState(true)
  const [aiCoaching,   setAiCoaching]   = useState(true)

  // diagnosis
  const [editorCode,   setEditorCode]   = useState("")
  const [hasAnalyzed,  setHasAnalyzed]  = useState(false)
  const [analyzedCode, setAnalyzedCode] = useState("")

  // files
  const [fileName,     setFileName]     = useState("")
  const [uploadOpen,   setUploadOpen]   = useState(false)
  const [codeCopied,   setCodeCopied]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // learning
  const [sessions,     setSessions]     = useState<LearningSession[]>(initSessions)
  const [selSession,   setSelSession]   = useState<number | null>(null)
  const [langFilter,   setLangFilter]   = useState("All")
  const [favOnly,      setFavOnly]      = useState(false)

  // notes
  const [selNote,      setSelNote]      = useState(1)
  const [notes,        setNotes]        = useState(mockNotes)

  const toggleNoteFav = (id: number) =>
    setNotes(p => p.map(n => n.id === id ? { ...n, favorited: !n.favorited } : n))

  // dialogs
  const [saveNoteOpen, setSaveNoteOpen] = useState(false)
  const [saveDiagOpen, setSaveDiagOpen] = useState(false)
  const [noteTitle,    setNoteTitle]    = useState("Nested Loop vs HashMap Performance")
  const [noteTags,     setNoteTags]     = useState(["Java", "Optimization", "DataStructure"])
  const [tagInput,     setTagInput]     = useState("")
  const [noteMemo,     setNoteMemo]     = useState("")

  /* handlers */
  const handleCopyCode = () => {
    navigator.clipboard.writeText(editorCode)
    setCodeCopied(true); setTimeout(() => setCodeCopied(false), 2000)
  }
  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "HiVibe", url: window.location.href }) } catch {}
    } else { navigator.clipboard.writeText(window.location.href) }
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
    r.onload = (ev) => setEditorCode(ev.target?.result as string ?? "")
    r.readAsText(f); e.target.value = ""
  }
  const toggleFav = (id: number) =>
    setSessions(p => p.map(s => s.id === id ? { ...s, favorited: !s.favorited } : s))
  const addTag = () => {
    const t = tagInput.trim()
    if (t && !noteTags.includes(t)) { setNoteTags(p => [...p, t]); setTagInput("") }
  }
  const removeTag = (tag: string) => setNoteTags(p => p.filter(t => t !== tag))

  const ext             = extMap[language] ?? "txt"
  const headerTitle     = { diagnosis: "코드 분석", learning: "학습하기", notes: "나만의 노트" }[activeNav] ?? ""
  const favSessions     = sessions.filter(s => s.favorited)
  const favNotes        = notes.filter(n => n.favorited)
  const recentNotes     = notes.filter(n => !n.favorited)
  const recentSessions  = sessions.filter(s => !s.favorited)
  const currentSession  = selSession ? sessions.find(s => s.id === selSession) : null

  /* ── RENDER ── */
  return (
    <TooltipProvider>
      <style>{`
        .font-syne  { font-family:'Syne',sans-serif; }
        .font-space { font-family:'Space Mono',monospace; }
        .font-code  { font-family:'D2Coding',monospace; }
      `}</style>

      <div className="h-screen w-full bg-zinc-950 flex overflow-hidden">

        {/* ═══ SIDEBAR ═══ */}
        <div className={`h-full flex flex-col bg-[#0d0d0d] border-r border-zinc-800/50 transition-all duration-300 shrink-0 ${sidebarExp ? "w-52" : "w-14"}`}>
          <div className={`flex items-center h-14 px-4 ${sidebarExp ? "justify-between" : "justify-center"}`}>
            {sidebarExp && <span className="font-syne text-lg font-bold" style={{ color: BRAND }}>HiVibe</span>}
            <button onClick={() => setSidebarExp(!sidebarExp)}
              className="h-7 w-7 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 py-3 px-2 space-y-0.5">
            {navItems.map(({ id, label, icon: Icon }) => {
              const active = id === activeNav
              return (
                <Tooltip key={id}>
                  <TooltipTrigger asChild>
                    <button onClick={() => handleNavClick(id)}
                      className={`w-full flex items-center gap-3 rounded-lg transition-all ${sidebarExp ? "px-3 py-2.5" : "justify-center py-2.5"}`}
                      style={active ? { background: "rgba(217,217,217,0.07)", color: "#D9D9D9" } : { color: "#71717a" }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#d4d4d8" }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#71717a" }}>
                      <Icon className="h-4 w-4 shrink-0" />
                      {sidebarExp && <span className="text-sm font-medium truncate">{label}</span>}
                      {active && sidebarExp && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#D9D9D9]" />}
                    </button>
                  </TooltipTrigger>
                  {!sidebarExp && <TooltipContent side="right" className="bg-zinc-800 border-zinc-700 text-zinc-200">{label}</TooltipContent>}
                </Tooltip>
              )
            })}
          </nav>

          <div className="border-t border-zinc-800/50 p-3">
            <div className={`flex items-center ${sidebarExp ? "gap-3" : "justify-center"}`}>
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs">SH</AvatarFallback>
              </Avatar>
              {sidebarExp && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-200 truncate">박성하</p>
                  <p className="font-space text-[10px] text-zinc-500 truncate">sungha@hivibe.dev</p>
                </div>
              )}
              {sidebarExp && (
                <button className="h-6 w-6 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                  <Settings className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ═══ MAIN ═══ */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* HEADER */}
          <header className="bg-[#0a0a0a] border-b border-zinc-800/50 shrink-0">
            <div className="h-14 flex items-center justify-between px-5">
              <div className="flex items-center gap-2">
                {activeNav === "diagnosis" && <ActivityIcon className="h-4 w-4" style={{ color: BRAND }} />}
                {activeNav === "learning"  && <GraduationCap className="h-4 w-4" style={{ color: BRAND }} />}
                {activeNav === "notes"     && <Book className="h-4 w-4" style={{ color: BRAND }} />}
                <span className="font-syne text-sm font-semibold text-zinc-100">{headerTitle}</span>
              </div>

              {activeNav !== "notes" && (
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-2">
                    <Switch checked={aiCoaching} onCheckedChange={setAiCoaching} className="data-[state=checked]:bg-[#63C1ED] scale-90" />
                    <span className="font-space text-[10px] text-zinc-500">Live AI Coaching</span>
                  </div>
                  <div className="h-4 w-px bg-zinc-800" />
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-8 w-[120px] bg-zinc-900 border-zinc-800 text-xs text-zinc-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {[["java","Java"],["python","Python"],["javascript","JavaScript"],["typescript","TypeScript"],["cpp","C++"],["c","C"]].map(([v,l]) => (
                        <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {activeNav === "diagnosis" && (
                    <Button size="sm" disabled={!hasAnalyzed}
                      onClick={() => { setAnalyzedCode(editorCode); setActiveNav("learning") }}
                      className={`h-8 text-xs px-4 font-medium text-white ${hasAnalyzed ? "bg-amber-400 hover:bg-amber-500" : "bg-amber-400/25 cursor-not-allowed"}`}>
                      <GraduationCap className="h-3.5 w-3.5 mr-1.5" />Learning
                    </Button>
                  )}
                  {activeNav === "diagnosis" && (
                    <Button size="sm" disabled={!editorCode.trim()}
                      onClick={() => { if (editorCode.trim()) setHasAnalyzed(true) }}
                      className={`h-8 text-white text-xs px-4 font-medium ${editorCode.trim() ? "bg-emerald-500 hover:bg-emerald-600" : "bg-emerald-500/25 cursor-not-allowed"}`}>
                      <Play className="h-3.5 w-3.5 mr-1.5" />Run Analysis
                    </Button>
                  )}
                  {activeNav === "learning" && selSession && (
                    <Button size="sm" className="h-8 text-white text-xs px-4 bg-emerald-500 hover:bg-emerald-600">
                      <Check className="h-3.5 w-3.5 mr-1.5" />Submit
                    </Button>
                  )}
                  <Button size="sm" className="h-8 text-white text-xs px-4 font-medium" style={{ background: BRAND }}
                    onClick={() => setSaveDiagOpen(true)}>
                    <Save className="h-3.5 w-3.5 mr-1.5" />Save
                  </Button>
                </div>
              )}
            </div>

            {(activeNav === "diagnosis" || (activeNav === "learning" && selSession)) && (
              <div className="h-9 flex items-center justify-between px-5 border-t border-zinc-800/40">
                <div className="flex items-center gap-2">
                  <FileCode className="h-3.5 w-3.5 text-zinc-600" />
                  <input value={fileName} onChange={e => setFileName(e.target.value)} placeholder="Name your file..."
                    className="bg-transparent text-xs outline-none border-none w-44 font-code placeholder:text-zinc-700"
                    style={{ color: "#FAFAFA" }} />
                  <span className="font-code text-xs text-zinc-700">.{ext}</span>
                  {activeNav === "learning" && selSession && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => setSaveNoteOpen(true)}
                          className="h-5 w-5 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors ml-1">
                          <Bookmark className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-900 border-zinc-700 text-zinc-200 text-xs font-space" side="bottom">노트에 저장</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <button onClick={() => setUploadOpen(v => !v)}
                      className="h-7 px-2.5 flex items-center gap-1.5 rounded border border-zinc-800 font-space text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 text-[11px] transition-colors">
                      <Upload className="h-3 w-3" />Upload
                    </button>
                    {uploadOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setUploadOpen(false)} />
                        <div className="absolute right-0 top-8 z-20 w-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden">
                          <button onClick={() => { setUploadOpen(false); fileRef.current?.click() }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left">
                            <HardDrive className="h-4 w-4 text-zinc-400 shrink-0" />
                            <div>
                              <p className="font-space text-xs text-zinc-200 font-bold">내 컴퓨터에서 코드 불러오기</p>
                              <p className="font-space text-[10px] text-zinc-500 mt-0.5">모든 코드 파일 지원</p>
                            </div>
                          </button>
                          <div className="h-px bg-zinc-800" />
                          <button onClick={() => setUploadOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left">
                            <Monitor className="h-4 w-4 text-zinc-400 shrink-0" />
                            <div>
                              <p className="font-space text-xs text-zinc-200 font-bold">이전 분석에서</p>
                              <p className="font-space text-[10px] text-zinc-500 mt-0.5">저장된 코드 불러오기</p>
                            </div>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept=".java,.py,.js,.ts,.cpp,.c,.cs,.go,.rs,.kt" className="hidden" onChange={handleFileChange} />
                  <button onClick={handleShare}
                    className="h-7 px-2.5 flex items-center gap-1.5 rounded border border-zinc-800 font-space text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 text-[11px] transition-colors">
                    <Share2 className="h-3 w-3" />Share
                  </button>
                  <button onClick={handleCopyCode}
                    className="h-7 px-2.5 flex items-center gap-1.5 rounded border font-space text-[11px] transition-colors hover:bg-zinc-800"
                    style={codeCopied ? { color: BRAND, borderColor: `${BRAND}44` } : { color: "#71717a", borderColor: "#27272a" }}>
                    {codeCopied ? <><Check className="h-3 w-3" />Copied!</> : <><Copy className="h-3 w-3" />Copy Code</>}
                  </button>
                </div>
              </div>
            )}
          </header>

          {/* ═══ BODY ═══ */}

          {/* ── NOTES ── */}
          {activeNav === "notes" && (
            <ResizablePanelGroup direction="horizontal" className="flex-1">
              <ResizablePanel defaultSize={35} minSize={25} maxSize={50} className="bg-[#0a0a0a]">
                <div className="h-full flex flex-col p-5">
                  <p className="font-space text-[10px] tracking-widest mb-1" style={{ color: BRAND }}>// NOTES</p>
                  <h2 className="font-syne text-2xl font-bold text-zinc-100 mb-4">My Library</h2>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                    <Input placeholder="Search by keywords or tags..."
                      className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-200 text-xs h-8 font-space" />
                  </div>
                  <div className="flex gap-1.5 mb-4 flex-wrap">
                    {["All","Java","Python"].map(l => (
                      <button key={l} className="font-space text-[10px] px-2.5 py-1 rounded-full border transition-all"
                        style={l === "All"
                          ? { background: `${BRAND}15`, color: BRAND, borderColor: `${BRAND}44` }
                          : { color: "#71717a", borderColor: "#27272a" }}>
                        {l}
                      </button>
                    ))}
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="pb-4">
                      {/* 즐겨찾기 섹션 */}
                      {favNotes.length > 0 && (
                        <>
                          <div className="flex items-center gap-2 mb-2 px-0.5">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            <span className="font-space text-[9px] text-zinc-500 tracking-wider uppercase">즐겨찾기</span>
                            <span className="font-space text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">{favNotes.length}</span>
                          </div>
                          {favNotes.map(n => <NoteCard key={n.id} n={n} selNote={selNote} setSelNote={setSelNote} toggleNoteFav={toggleNoteFav} />)}
                          <div className="h-px bg-zinc-800/60 my-3" />
                        </>
                      )}
                      {/* 전체 목록 */}
                      <div className="flex items-center gap-2 mb-2 px-0.5">
                        <span className="font-space text-[9px] text-zinc-600 tracking-wider uppercase">전체</span>
                        <span className="font-space text-[9px] px-1.5 py-0.5 rounded-full border border-zinc-800 text-zinc-600">{recentNotes.length}</span>
                      </div>
                      {recentNotes.map(n => <NoteCard key={n.id} n={n} selNote={selNote} setSelNote={setSelNote} toggleNoteFav={toggleNoteFav} />)}
                    </div>
                  </ScrollArea>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-zinc-800/50" />

              <ResizablePanel defaultSize={65} className="bg-zinc-950">
                {(() => {
                  const n = notes.find(n => n.id === selNote) ?? notes[0]
                  return (
                    <ScrollArea className="h-full">
                      <div className="p-8 max-w-3xl mx-auto space-y-5">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <p className="font-space text-[10px] tracking-widest mb-1.5 text-zinc-500">// {n.category} · {n.language}</p>
                            <h1 className="font-syne text-3xl font-bold text-zinc-100 leading-tight">{n.title}</h1>
                            <p className="font-space text-xs text-zinc-500 mt-1.5">{n.date}</p>
                          </div>
                          <div className="flex gap-2 shrink-0 mt-1">
                            <Button size="sm" variant="outline" className="h-8 border-zinc-800 bg-zinc-900 text-zinc-400 text-xs gap-1.5">
                              <Edit2 className="h-3 w-3" />Edit Memo
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 border-zinc-800 bg-zinc-900 text-zinc-400 text-xs gap-1.5">
                              <Share2 className="h-3 w-3" />Share
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-rose-900/50 bg-rose-500/10 text-rose-500">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Personal Notes */}
                        <Card className="bg-zinc-900/50 border-zinc-800">
                          <CardContent className="p-5">
                            <p className="font-space text-[10px] tracking-widest mb-3" style={{ color: BRAND }}>// PERSONAL NOTES</p>
                            <p className="font-space text-xs text-zinc-300 leading-relaxed whitespace-pre-line">{n.memo}</p>
                          </CardContent>
                        </Card>

                        {/* Code Snapshot */}
                        <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
                          <CardHeader className="pb-0 pt-4 px-5 flex flex-row items-center justify-between">
                            <CardTitle className="font-space text-[10px] tracking-widest flex items-center gap-2" style={{ color: BRAND }}>
                              <Code2 className="h-3.5 w-3.5" />Code Snapshot
                            </CardTitle>
                            <span className="font-space text-[10px] px-2 py-0.5 rounded border border-zinc-700 text-zinc-400">{n.language}</span>
                          </CardHeader>
                          <CardContent className="px-0 pb-0 pt-3">
                            {/* 탭바 */}
                            <div className="flex items-center border-t border-b border-zinc-800/80 bg-[#1a1a1a]">
                              <div className="flex items-center gap-2 px-4 py-2 border-r border-zinc-800 bg-[#141414]"
                                style={{ borderBottom: `2px solid ${BRAND}` }}>
                                <div className="flex gap-1 mr-1">
                                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                                </div>
                                <FileCode className="h-3 w-3 text-zinc-500" />
                                <span className="font-code text-[11px] text-zinc-300">
                                  {n.title.toLowerCase().replace(/ /g, "_")}.{n.language === "Python" ? "py" : "java"}
                                </span>
                              </div>
                              <div className="ml-auto flex items-center gap-3 px-4">
                                <span className="font-space text-[10px] text-zinc-600">{n.code.split("\n").length} lines</span>
                                <button onClick={() => navigator.clipboard.writeText(n.code)}
                                  className="font-space text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors flex items-center gap-1">
                                  <Copy className="h-3 w-3" />copy
                                </button>
                              </div>
                            </div>
                            {/* 코드 본체 */}
                            <div className="bg-[#141414] font-code text-[13px] overflow-x-auto">
                              <div className="flex">
                                <div className="select-none shrink-0 border-r border-zinc-800/60 py-4">
                                  <div className="px-4 text-right min-w-[48px]">
                                    {n.code.split("\n").map((_: string, i: number) => (
                                      <div key={i} className="leading-[1.625rem] text-zinc-700 text-[12px]">{i + 1}</div>
                                    ))}
                                  </div>
                                </div>
                                <pre className="flex-1 px-4 py-4 text-zinc-300 leading-[1.625rem] overflow-x-auto">
                                  <code>{n.code}</code>
                                </pre>
                              </div>
                            </div>
                            {/* 하단 상태바 */}
                            <div className="h-6 bg-[#1a1a1a] border-t border-zinc-800/60 flex items-center px-4 gap-4">
                              <span className="font-space text-[10px] text-zinc-600">{n.language}</span>
                              <span className="font-space text-[10px] text-zinc-600">UTF-8</span>
                              <span className="font-space text-[10px] text-zinc-600 ml-auto">{n.code.length} chars</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  )
                })()}
              </ResizablePanel>
            </ResizablePanelGroup>
          )}

          {/* ── LEARNING ── */}
          {activeNav === "learning" && (
            <>
              {!selSession && (
                <div className="flex-1 overflow-auto bg-zinc-950">
                  <div className="px-8 py-8">
                    <p className="font-space text-[10px] tracking-widest mb-2" style={{ color: BRAND }}>// ARCHIVE</p>
                    <h1 className="font-syne text-4xl font-bold text-zinc-100 mb-8">Learning Archive</h1>

                    <div className="relative mb-5">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                      <input placeholder="Search by keywords or tags..."
                        className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 font-space text-xs text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-zinc-600 transition-colors" />
                    </div>

                    <div className="flex items-center gap-2 mb-7 flex-wrap">
                      {["All","Java","Python","C++"].map(l => (
                        <button key={l} onClick={() => setLangFilter(l)}
                          className="font-space text-[10px] px-3 py-1 rounded-full border transition-all"
                          style={langFilter === l
                            ? { background: `${BRAND}15`, color: BRAND, borderColor: `${BRAND}44` }
                            : { color: "#71717a", borderColor: "#27272a" }}>
                          {l}
                        </button>
                      ))}
                      <button onClick={() => setFavOnly(!favOnly)}
                        className="font-space text-[10px] px-3 py-1 rounded-full border transition-all flex items-center gap-1"
                        style={favOnly
                          ? { background: "#f59e0b22", color: "#f59e0b", borderColor: "#f59e0b44" }
                          : { color: "#71717a", borderColor: "#27272a" }}>
                        <Star className="h-2.5 w-2.5" />즐겨찾기
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-8">
                      {[
                        { icon: <FolderOpen className="h-4 w-4" style={{ color: BRAND }} />, val: "12",  label: "Total Sessions" },
                        { icon: <Star className="h-4 w-4 text-amber-400" />,                  val: "B+", label: "Avg. Grade" },
                        { icon: <Flame className="h-4 w-4 text-orange-400" />,                val: "7",  label: "Day Streak" },
                        { icon: <Star className="h-4 w-4 text-amber-400 fill-amber-400" />,   val: String(favSessions.length), label: "즐겨찾기" },
                      ].map((s, i) => (
                        <div key={i} className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
                          <div className="mb-2">{s.icon}</div>
                          <p className="font-syne text-xl font-bold text-zinc-100">{s.val}</p>
                          <p className="font-space text-[10px] text-zinc-500 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* 즐겨찾기 */}
                    {!favOnly && favSessions.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-space text-[10px] text-zinc-400 tracking-wider uppercase">즐겨찾기</span>
                          <span className="font-space text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">{favSessions.length}</span>
                        </div>
                        {favSessions.map(s => (
                          <SCard key={s.id} s={s} onSelect={() => setSelSession(s.id)} onFav={() => toggleFav(s.id)} />
                        ))}
                      </div>
                    )}

                    {/* Recent / 즐겨찾기 필터 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-space text-[10px] text-zinc-500 tracking-widest uppercase">
                          {favOnly ? "즐겨찾기" : "Recent Sessions"}
                        </span>
                        <span className="font-space text-[10px] px-1.5 py-0.5 rounded-full border border-zinc-800 text-zinc-500">
                          {favOnly ? favSessions.length : recentSessions.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {(favOnly ? favSessions : recentSessions)
                          .filter(s => langFilter === "All" || s.language === langFilter)
                          .map(s => (
                            <SCard key={s.id} s={s} onSelect={() => setSelSession(s.id)} onFav={() => toggleFav(s.id)} compact />
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selSession && (
                <ResizablePanelGroup direction="horizontal" className="flex-1">
                  <ResizablePanel defaultSize={38} minSize={25} maxSize={50}>
                    <ScrollArea className="h-full bg-zinc-950">
                      <div className="p-4 space-y-4">
                        <button onClick={() => setSelSession(null)}
                          className="font-space text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
                          ← Archive로 돌아가기
                        </button>
                        {currentSession && (
                          <div>
                            <p className="font-space text-[10px] tracking-widest mb-1" style={{ color: BRAND }}>// LEARNING</p>
                            <h2 className="font-syne text-lg font-bold text-zinc-100">{currentSession.title}</h2>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-space text-[10px] text-zinc-500">{currentSession.date}</span>
                              <span className="font-space text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">{currentSession.grade}</span>
                            </div>
                          </div>
                        )}

                        <Card className="bg-zinc-900/60 border-zinc-800">
                          <CardContent className="p-4">
                            <p className="font-space text-[10px] tracking-widest mb-3 text-rose-400">// ORIGINAL CODE에서 사용된 개념</p>
                            <p className="font-space text-[10px] text-zinc-500 mb-3 leading-relaxed">사용자가 작성한 코드에는 아래 패턴이 들어가 있어요.</p>
                            {["이중 반복문","input()의 사용","버블 정렬"].map((c, i) => (
                              <div key={i} className="mb-3 last:mb-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="h-1 w-1 rounded-full bg-rose-400 shrink-0" />
                                  <span className="font-space text-xs text-zinc-200 font-bold">{c}</span>
                                </div>
                                <p className="font-space text-[10px] text-zinc-500 leading-relaxed pl-3">중첩 반복문은 한쪽이 반복될 때 상대쪽도 반복되어 성능이 저하돼요.</p>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        <Card className="border-zinc-800" style={{ background: `${BRAND}06`, borderColor: `${BRAND}20` }}>
                          <CardContent className="p-4">
                            <p className="font-space text-[10px] tracking-widest mb-3" style={{ color: BRAND }}>// OPTIMIZED CODE에 적용할 개념</p>
                            <p className="font-space text-[10px] text-zinc-500 mb-3 leading-relaxed">아래 개념을 사용하면 코드를 최적화할 수 있어요.</p>
                            {["HashMap","input()의 사용","버블 정렬"].map((c, i) => (
                              <div key={i} className="mb-3 last:mb-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="h-1 w-1 rounded-full shrink-0" style={{ background: BRAND }} />
                                  <span className="font-space text-xs text-zinc-200 font-bold">{c}</span>
                                </div>
                                <p className="font-space text-[10px] text-zinc-500 leading-relaxed pl-3">HashMap을 사용하면 O(1) 시간에 값을 조회할 수 있어요.</p>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/60 border-zinc-800">
                          <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="font-syne text-xs font-semibold text-zinc-100 flex items-center gap-2">
                              <TrendingUp className="h-3.5 w-3.5" style={{ color: BRAND }} />Performance Comparison
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-4 pb-4">
                            <div className="h-44">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={complexityComparisonData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                  <defs>
                                    <linearGradient id="bf" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%"  stopColor={BRAND} stopOpacity={0.15} />
                                      <stop offset="95%" stopColor={BRAND} stopOpacity={0.02} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.4} />
                                  <XAxis dataKey="name" stroke="#52525b" tick={{ fill: "#52525b", fontSize: 10 }} />
                                  <YAxis stroke="#52525b" tick={{ fill: "#52525b", fontSize: 10 }} />
                                  <RechartsTooltip
                                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "6px", fontSize: "11px" }}
                                    labelStyle={{ color: "#a1a1aa" }}
                                    formatter={(v: number, n: string) => [v.toLocaleString(), n === "original" ? "Original O(n²)" : "Optimized O(n)"]} />
                                  <Legend wrapperStyle={{ fontSize: "10px" }} iconType="line" formatter={v => v === "original" ? "Original O(n²)" : "Optimized O(n)"} />
                                  <Area type="monotone" dataKey="original" stroke="transparent" fill="url(#bf)" legendType="none" tooltipType="none" />
                                  <Line type="monotone" dataKey="original"  stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#f43f5e", r: 2 }} name="original" />
                                  <Line type="monotone" dataKey="optimized" stroke={BRAND}    strokeWidth={2.5} dot={{ fill: BRAND, r: 3 }} name="optimized" />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </ResizablePanel>

                  <ResizableHandle withHandle className="bg-zinc-800/50" />

                  <ResizablePanel defaultSize={62} minSize={35}>
                    <div className="h-full flex overflow-hidden">
                      <div className="flex-1 flex flex-col border-r border-zinc-800">
                        <div className="px-4 py-2 bg-zinc-900/30 border-b border-zinc-800">
                          <span className="font-space text-[10px] text-zinc-500 tracking-widest uppercase">Original code</span>
                        </div>
                        <div className="flex-1 overflow-auto bg-[#141414] font-code text-[12px]">
                          <div className="flex">
                            <div className="px-3 py-4 text-zinc-700 text-right select-none border-r border-zinc-800 min-w-[36px]">
                              {[1,2,3,4,5,6,7,8,9,10,11].map(n => <div key={n} className="leading-6">{n}</div>)}
                            </div>
                            <pre className="flex-1 py-4 text-zinc-300 leading-6"><code>
                              {analyzedCode ? (
                                <div className="px-4 whitespace-pre-wrap">{analyzedCode}</div>
                              ) : (
                                <>
                                  <div className="px-4"><span className="text-purple-400">public</span> <span className="text-blue-400">class</span> <span className="text-emerald-400">Solution</span> {"{"}</div>
                                  <div className="px-4 bg-rose-900/15 border-l-2 border-rose-500">{"    "}<span className="text-purple-400">for</span>{" (int i=0;i<n;i++)"} {"{"}</div>
                                  <div className="px-4 bg-rose-900/15 border-l-2 border-rose-500">{"        "}<span className="text-purple-400">for</span>{" (int j=i+1;j<n;j++)"} {"{"}</div>
                                  <div className="px-4 bg-rose-900/15 border-l-2 border-rose-500">{"            if(nums[i]+nums[j]==t)"}</div>
                                  <div className="px-4 bg-rose-900/15 border-l-2 border-rose-500">{"                return new int[]{i,j};"}</div>
                                  <div className="px-4 bg-rose-900/15 border-l-2 border-rose-500">{"        }}"}</div>
                                  <div className="px-4 bg-rose-900/15 border-l-2 border-rose-500">{"    }}"}</div>
                                  <div className="px-4">{"    return new int[]{};"}</div>
                                  <div className="px-4">{"}"}</div>
                                </>
                              )}
                            </code></pre>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="px-4 py-2 bg-zinc-900/30 border-b border-zinc-800">
                          <span className="font-space text-[10px] tracking-widest uppercase" style={{ color: BRAND }}>Optimized code</span>
                        </div>
                        <div className="flex-1 overflow-auto bg-[#141414] font-code text-[12px]">
                          <div className="flex">
                            <div className="px-3 py-4 text-zinc-700 text-right select-none border-r border-zinc-800 min-w-[36px]">
                              {[1,2,3,4,5,6,7,8,9,10,11,12,13].map(n => <div key={n} className="leading-6">{n}</div>)}
                            </div>
                            <pre className="flex-1 py-4 text-zinc-100 leading-6"><code>
                              <div className="px-4"><span className="text-purple-400">public</span> <span className="text-blue-400">class</span> <span className="text-emerald-400">Solution</span> {"{"}</div>
                              <div className="px-4">{"  "}<span className="text-purple-400">public</span> int[] twoSum(int[] nums, int t) {"{"}</div>
                              <div className="px-4" style={{ background: `${BRAND}0a`, borderLeft: `2px solid ${BRAND}` }}>{"    Map<Integer,Integer> map=new HashMap<>();"}</div>
                              <div className="px-4" style={{ background: `${BRAND}0a`, borderLeft: `2px solid ${BRAND}` }}>{"    "}<span className="text-purple-400">for</span>(int i=0;i{"<"}nums.length;i++) {"{"}</div>
                              <div className="px-4" style={{ background: `${BRAND}0a`, borderLeft: `2px solid ${BRAND}` }}>{"        int c=t-nums[i];"}</div>
                              <div className="px-4" style={{ background: `${BRAND}0a`, borderLeft: `2px solid ${BRAND}` }}>{"        "}<span className="text-purple-400">if</span>(map.containsKey(c))</div>
                              <div className="px-4" style={{ background: `${BRAND}0a`, borderLeft: `2px solid ${BRAND}` }}>{"            return new int[]{map.get(c),i};"}</div>
                              <div className="px-4" style={{ background: `${BRAND}0a`, borderLeft: `2px solid ${BRAND}` }}>{"        map.put(nums[i],i);"}</div>
                              <div className="px-4" style={{ background: `${BRAND}0a`, borderLeft: `2px solid ${BRAND}` }}>{"    }"}</div>
                              <div className="px-4">{"    return new int[]{};"}</div>
                              <div className="px-4">{"  }"}</div>
                              <div className="px-4">{"}"}</div>
                            </code></pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              )}
            </>
          )}

          {/* ── DIAGNOSIS ── */}
          {activeNav === "diagnosis" && (
            <ResizablePanelGroup direction="horizontal" className="flex-1">
              <ResizablePanel defaultSize={40} minSize={25} maxSize={55}>
                <ScrollArea className="h-full bg-zinc-950">
                  <div className="p-4 space-y-3">
                    {!hasAnalyzed ? (
                      <div className="flex flex-col items-center justify-center h-[56vh] gap-4 text-center px-6">
                        <div className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center" style={{ background: `${BRAND}08` }}>
                          <ActivityIcon className="h-6 w-6" style={{ color: `${BRAND}55` }} />
                        </div>
                        <div>
                          <p className="font-syne text-sm font-semibold text-zinc-400">코드를 입력하고 분석을 시작하세요</p>
                          <p className="font-space text-[11px] text-zinc-600 mt-1.5 leading-relaxed">오른쪽 에디터에 코드를 붙여넣고<br />Run Analysis를 눌러주세요</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Card className="bg-zinc-900/60 border-zinc-800">
                          <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="font-syne text-xs font-semibold text-zinc-100 flex items-center gap-2">
                              <Sparkles className="h-3.5 w-3.5 text-amber-400" />Code Quality Score
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-4 pb-4">
                            <div className="flex items-center gap-5">
                              <div className="relative w-24 h-24 shrink-0">
                                <svg className="w-24 h-24 -rotate-90">
                                  <circle cx="48" cy="48" r="40" stroke="#27272a" strokeWidth="8" fill="none" />
                                  <circle cx="48" cy="48" r="40" stroke="#f59e0b" strokeWidth="8" fill="none"
                                    strokeDasharray={`${(52/100)*251.3} 251.3`} style={{ filter: "drop-shadow(0 0 6px #f59e0b88)" }} />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="font-syne text-2xl font-bold text-amber-400">C</span>
                                  <span className="font-space text-[10px] text-zinc-500">52/100</span>
                                </div>
                              </div>
                              <div className="flex-1 space-y-2.5">
                                {[
                                  { l: "Accuracy",    v: 72, c: "bg-amber-500" },
                                  { l: "Efficiency",  v: 28, c: "bg-rose-500" },
                                  { l: "Readability", v: 65, c: "bg-amber-500" },
                                  { l: "Style",       v: 44, c: "bg-rose-500" },
                                ].map(s => (
                                  <div key={s.l}>
                                    <div className="flex justify-between mb-1">
                                      <span className="font-space text-[10px] text-zinc-500">{s.l}</span>
                                      <span className="font-space text-[10px] text-zinc-400">{s.v}/100</span>
                                    </div>
                                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                      <div className={`h-full ${s.c} rounded-full`} style={{ width: `${s.v}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="rounded-xl bg-rose-500/8 border border-rose-900/50 p-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Timer className="h-3.5 w-3.5 text-rose-500" />
                            <span className="font-syne text-xs font-bold text-rose-500">Timeout Risk</span>
                          </div>
                          <p className="font-space text-[10px] text-rose-300/70 leading-relaxed">
                            A nested loop causes O(n²) execution. Will exceed time limit on inputs N &gt; 10,000.
                          </p>
                        </div>

                        <Card className="bg-zinc-900/60 border-zinc-800">
                          <CardHeader className="pb-2 pt-4 px-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="font-syne text-xs font-semibold text-zinc-100 flex items-center gap-2">
                                <TrendingUp className="h-3.5 w-3.5 text-rose-400" />Current Complexity
                              </CardTitle>
                              <span className="font-space text-xs px-2 py-0.5 rounded border bg-rose-500/15 text-rose-400 border-rose-500/25">O(n²)</span>
                            </div>
                          </CardHeader>
                          <CardContent className="px-4 pb-4">
                            <div className="h-44">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={currentComplexityData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.4} />
                                  <XAxis dataKey="n" stroke="#52525b" tick={{ fill: "#52525b", fontSize: 10 }} label={{ value: "Input (N)", position: "insideBottom", offset: -4, fill: "#52525b", fontSize: 10 }} />
                                  <YAxis stroke="#52525b" tick={{ fill: "#52525b", fontSize: 10 }} />
                                  <RechartsTooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "6px", fontSize: "11px" }} labelStyle={{ color: "#a1a1aa" }} />
                                  <Line type="monotone" dataKey="time" stroke="#f43f5e" strokeWidth={2.5} dot={{ fill: "#f43f5e", r: 3 }} name="O(n²)" style={{ filter: "drop-shadow(0 0 5px rgba(244,63,94,0.5))" }} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="mt-3 bg-rose-500/8 border border-rose-500/15 rounded-lg p-3">
                              <p className="font-space text-[10px] text-rose-200/60 leading-relaxed">Quadratic time complexity detected. Performance will degrade significantly with large inputs.</p>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-zinc-800/50" />

              {/* ── 코드 에디터 ── */}
              <ResizablePanel defaultSize={60} minSize={35}>
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
                          style={{ caretColor: BRAND, tabSize: 2 }}
                        />
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
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>

        {/* ═══ DIALOGS ═══ */}
        <Dialog open={saveDiagOpen} onOpenChange={setSaveDiagOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-syne flex items-center gap-2" style={{ color: BRAND }}>
                <Save className="h-4 w-4" />진단 결과 저장
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="font-space text-xs text-zinc-500 leading-relaxed">현재 코드와 분석 결과를 저장합니다.</p>
              <div className="space-y-2">
                <label className="font-space text-[10px] text-zinc-500 uppercase tracking-wider">저장 이름</label>
                <Input value={fileName} onChange={e => setFileName(e.target.value)} placeholder="파일명 입력..."
                  className="bg-zinc-950 border-zinc-800 text-zinc-200 text-sm font-code" />
              </div>
              <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-3 space-y-1.5">
                {["코드 원본", "진단 결과 (점수, 복잡도)", `언어 설정 (${language})`].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="font-space text-[11px] text-zinc-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" size="sm" className="border-zinc-800 text-zinc-400 font-space text-xs">취소</Button></DialogClose>
              <Button size="sm" className="text-white text-xs font-space" style={{ background: BRAND }} onClick={() => setSaveDiagOpen(false)}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={saveNoteOpen} onOpenChange={setSaveNoteOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-syne flex items-center gap-2 text-emerald-400">
                <Bookmark className="h-4 w-4" />노트에 저장
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="font-space text-[10px] text-zinc-500 uppercase tracking-wider">Title</label>
                <Input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} className="bg-zinc-950 border-zinc-800 text-zinc-200 text-sm font-space" />
              </div>
              <div className="space-y-2">
                <label className="font-space text-[10px] text-zinc-500 uppercase tracking-wider">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {noteTags.map(tag => (
                    <span key={tag} className="font-space text-[10px] px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400 flex items-center gap-1">
                      #{tag}<button onClick={() => removeTag(tag)}><X className="h-2.5 w-2.5 ml-0.5 hover:text-zinc-100" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag()}
                    placeholder="태그 입력 후 Enter..." className="bg-zinc-950 border-zinc-800 text-zinc-200 text-sm font-space" />
                  <Button size="sm" variant="outline" className="border-zinc-800 text-zinc-400 text-xs" onClick={addTag}>Add</Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-space text-[10px] text-zinc-500 uppercase tracking-wider">Memo</label>
                <textarea value={noteMemo} onChange={e => setNoteMemo(e.target.value)} placeholder="나만의 메모..."
                  className="font-space min-h-[80px] w-full rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-[11px] p-3 resize-none outline-none" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" size="sm" className="border-zinc-800 text-zinc-400 font-space text-xs">취소</Button></DialogClose>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-space" onClick={() => setSaveNoteOpen(false)}>저장 & 3일 후 복습 알림</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

/* ═══ SESSION CARD ═══ */
function SCard({ s, onSelect, onFav, compact = false }: {
  s: LearningSession; onSelect: () => void; onFav: () => void; compact?: boolean
}) {
  return (
    <div onClick={onSelect}
      className={`group bg-zinc-900/60 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-all ${compact ? "p-4" : "p-5 mb-3"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-syne font-semibold text-zinc-100 truncate ${compact ? "text-sm" : "text-base"}`}>{s.title}</h3>
          <p className="font-space text-[10px] text-zinc-500 mt-0.5">
            {s.date} · <span style={{ color: langDot[s.language] ?? BRAND }}>● {s.language}</span>
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {s.tags.slice(0, compact ? 2 : 3).map(t => (
              <span key={t} className="font-space text-[10px] px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400">#{t}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="font-space text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">{s.grade}</span>
          <button onClick={e => { e.stopPropagation(); onFav() }}
            className="h-6 w-6 flex items-center justify-center rounded transition-colors hover:bg-zinc-800"
            style={{ color: s.favorited ? "#f59e0b" : "#52525b" }}>
            <Star className={`h-3.5 w-3.5 ${s.favorited ? "fill-amber-400" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══ NOTE CARD ═══ */
function NoteCard({ n, selNote, setSelNote, toggleNoteFav }: {
  n: any; selNote: number; setSelNote: (id: number) => void; toggleNoteFav: (id: number) => void
}) {
  return (
    <div onClick={() => setSelNote(n.id)}
      className="p-3.5 rounded-xl border cursor-pointer transition-all mb-2"
      style={selNote === n.id
        ? { borderColor: `${BRAND}44`, background: `${BRAND}08` }
        : { borderColor: "#27272a", background: "#18181b55" }}>
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-syne text-xs font-semibold text-zinc-100 leading-snug flex-1 mr-2">{n.title}</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-space text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">{n.grade}</span>
          <button onClick={e => { e.stopPropagation(); toggleNoteFav(n.id) }}
            className="h-5 w-5 flex items-center justify-center rounded transition-colors"
            style={{ color: n.favorited ? "#f59e0b" : "#52525b" }}>
            <Star className={`h-3 w-3 ${n.favorited ? "fill-amber-400" : ""}`} />
          </button>
        </div>
      </div>
      <p className="font-space text-[10px] text-zinc-600 mb-2">{n.date}</p>
      <div className="flex flex-wrap gap-1">
        {n.tags.map((t: string) => (
          <span key={t} className="font-space text-[10px] px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400">#{t}</span>
        ))}
      </div>
    </div>
  )
}