"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertCircle,
  Play,
  Copy,
  TrendingUp,
  Sparkles,
  FileCode,
  Bookmark,
  ChevronDown,
  Lightbulb,
  X,
  Timer,
  PanelLeft,
  Home,
  Activity as ActivityIcon,
  RefreshCw,
  Book,
  Settings,
  ChevronRight,
  // 추가된 노트용 아이콘들
  Search,
  Edit2,
  Share2,
  Trash2,
  BookOpen,
  Code2
} from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Line,
  LineChart,
  Area,
  AreaChart,
} from "recharts"

/* ===================== DATA ===================== */

const currentComplexityData = [
  { n: 10, time: 100 },
  { n: 50, time: 2500 },
  { n: 100, time: 10000 },
  { n: 200, time: 40000 },
  { n: 500, time: 250000 },
]

const complexityComparisonData = [
  { name: "10", original: 100, optimized: 10 },
  { name: "50", original: 2500, optimized: 50 },
  { name: "100", original: 10000, optimized: 100 },
  { name: "200", original: 40000, optimized: 200 },
  { name: "500", original: 250000, optimized: 500 },
]

const improvements = [
  {
    id: 1,
    title: "Loop Optimization",
    badge: "O(n\u00B2) \u2192 O(n)",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    explanation:
      "Replace the nested loop approach with a HashMap-based solution. By storing each number and its index in a map, we can check if the complement (target - current number) exists in O(1) time, reducing overall complexity from O(n\u00B2) to O(n).",
    metrics: "Memory usage increased by ~O(n), but time saved is significant for large inputs.",
  },
  {
    id: 2,
    title: "Single Pass Implementation",
    badge: "2 passes \u2192 1 pass",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    explanation:
      "Instead of populating the HashMap first and then searching, we can check for complements while building the map. This eliminates one full iteration through the array.",
    metrics: "Processing time reduced by ~40% on average datasets.",
  },
  {
    id: 3,
    title: "Early Return Pattern",
    badge: "Best Practice",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    explanation:
      "The optimized solution returns immediately when a match is found, avoiding unnecessary iterations. This is especially beneficial when the solution is found early in the array.",
    metrics: "Memory usage reduced by ~20% on early matches.",
  },
]

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "diagnosis", label: "Diagnosis", icon: ActivityIcon },
  { id: "refactoring", label: "Refactoring", icon: RefreshCw },
  { id: "notes", label: "My Notes", icon: Book },
]

// 노트 뷰용 가짜 데이터
const mockNotes = [
  { id: 1, title: "Graph DFS Optimization", date: "Oct 24, 2025", grade: "B+", tags: ["DFS", "Recursion", "Graph"], language: "Python" },
  { id: 2, title: "Binary Search Implementation", date: "Oct 20, 2025", grade: "A", tags: ["Binary Search", "Arrays", "O(log n)"], language: "Java" },
  { id: 3, title: "Hash Map Collision Resolution", date: "Oct 18, 2025", grade: "A-", tags: ["Hash Table", "Collision", "Chaining"], language: "Java" },
  { id: 4, title: "Dynamic Programming: Fibonacci", date: "Oct 15, 2025", grade: "B", tags: ["DP", "Memoization", "Math"], language: "Python" },
]

/* ===================== COMPONENT ===================== */

export function LeetCodeIDE() {
  const router = useRouter()
  const [language, setLanguage] = useState("java")
  const [activeNav, setActiveNav] = useState("diagnosis")
  const [aiCoaching, setAiCoaching] = useState(true)
  const [openCards, setOpenCards] = useState<number[]>([1])
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [noteTitle, setNoteTitle] = useState("Nested Loop vs HashMap Performance")
  const [noteTags, setNoteTags] = useState(["Java", "Optimization", "DataStructure"])
  const [tagInput, setTagInput] = useState("")
  const [noteMemo, setNoteMemo] = useState("")
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  
  // 선택된 노트 상태
  const [selectedNoteId, setSelectedNoteId] = useState(1)

  const code = `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[] {i, j};
                }
            }
        }
        return new int[] {};
    }
}`

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
  }

  const toggleCard = (id: number) => {
    setOpenCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !noteTags.includes(trimmed)) {
      setNoteTags((prev) => [...prev, trimmed])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setNoteTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleNavClick = (id: string) => {
    if (id === "home") {
      router.push("/") // 홈 화면 경로로 이동
      return
    }
    setActiveNav(id)
  }

  const showDiffView = activeNav === "refactoring"

  // ✨ 현재 선택된 탭에 따라 헤더 타이틀 변경 ✨
  const headerTitle =
    activeNav === "diagnosis" ? "코드 분석" :
    activeNav === "refactoring" ? "리팩토링" :
    "나만의 노트"

  return (
    <TooltipProvider>
      {/* 1. 전체 틀: 가로로 분할 (사이드바 | 메인화면) */}
      <div className="h-screen w-full bg-zinc-950 flex overflow-hidden">

        {/* =================== COLUMN 1: FULL-HEIGHT SIDEBAR =================== */}
        <div
          className={`h-full flex flex-col border-r border-zinc-800 bg-[#0a0a0a] transition-all duration-300 ease-in-out shrink-0 ${
            sidebarExpanded ? "w-56" : "w-16"
          }`}
        >
          {/* 사이드바 상단 (펼침: 로고+버튼, 접힘: 버튼만) */}
          <div className={`flex items-center h-14 px-4 border-b border-zinc-800 ${sidebarExpanded ? "justify-between" : "justify-center"}`}>
            {sidebarExpanded && (
              <span className="text-xl font-bold text-zinc-100 tracking-tight">
                HiVibe
              </span>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 shrink-0"
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              {!sidebarExpanded && (
                <TooltipContent side="right" className="bg-zinc-800 border-zinc-700 text-zinc-200">
                  Expand sidebar
                </TooltipContent>
              )}
            </Tooltip>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 py-3 px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = item.id === activeNav
              const Icon = item.icon
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 rounded-md transition-colors ${
                        sidebarExpanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
                      } ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {sidebarExpanded && (
                        <span className="text-sm truncate">{item.label}</span>
                      )}
                      {isActive && sidebarExpanded && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  </TooltipTrigger>
                  {!sidebarExpanded && (
                    <TooltipContent side="right" className="bg-zinc-800 border-zinc-700 text-zinc-200">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-zinc-800 p-3">
            <div className={`flex items-center ${sidebarExpanded ? "gap-3" : "justify-center"}`}>
              <Avatar className="h-8 w-8 shrink-0 bg-zinc-800">
                <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs font-medium">
                  SH
                </AvatarFallback>
              </Avatar>
              {sidebarExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{"박성하"}</p>
                  <p className="text-[11px] text-zinc-500 truncate">sungha@hivibe.dev</p>
                </div>
              )}
              {sidebarExpanded && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 shrink-0"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-zinc-800 border-zinc-700 text-zinc-200">
                    Settings
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        {/* =================== COLUMN 2: MAIN WORKSPACE =================== */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* 메인 화면 상단 헤더 (타이틀 & 아이콘 동적 변경) */}
          <header className="h-14 border-b border-zinc-800 bg-[#0a0a0a] flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-6 h-6">
                {/* 아이콘을 모두 보라색(violet-400)으로 통일! */}
                {activeNav === "diagnosis" && <ActivityIcon className="h-5 w-5 text-violet-400" />}
                {activeNav === "refactoring" && <RefreshCw className="h-5 w-5 text-violet-400" />}
                {activeNav === "notes" && <Book className="h-5 w-5 text-violet-400" />}
              </div>
              <span className="text-sm font-semibold text-zinc-100">{headerTitle}</span>
            </div>

            {/* 노트 화면이 아닐 때만 우측 버튼들(언어선택, 실행 등) 보이기 */}
            {activeNav !== "notes" && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={aiCoaching} onCheckedChange={setAiCoaching} className="data-[state=checked]:bg-emerald-600" />
                  <span className="text-xs text-zinc-400">Live AI Coaching</span>
                </div>
                <div className="h-4 w-px bg-zinc-800" />
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-8 w-[100px] bg-zinc-900 border-zinc-800 text-xs text-zinc-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="java" className="text-xs">Java</SelectItem>
                    <SelectItem value="python" className="text-xs">Python</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-4 font-medium">
                  <Play className="h-3.5 w-3.5 mr-1.5" />
                  Run Analysis
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm" variant="outline"
                      className="h-8 px-3 border-zinc-800 bg-transparent hover:bg-zinc-800 text-zinc-300 text-xs"
                      onClick={handleCopyCode}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy Code
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-900 border-zinc-700 text-zinc-200" side="bottom">
                    Copy Code
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </header>

          {/* =================== BODY 분기 처리 =================== */}
          
          {activeNav === "notes" ? (
            /* =================== ✨ 노트 탭 화면 (보라색 테마) ✨ =================== */
            <ResizablePanelGroup direction="horizontal" className="flex-1">
              
              {/* 왼쪽: 노트 리스트 패널 */}
              <ResizablePanel defaultSize={35} minSize={25} maxSize={50} className="bg-[#0a0a0a]">
                <div className="h-full flex flex-col p-6">
                  <h2 className="text-2xl font-bold text-zinc-100 mb-4">My Library</h2>
                  <div className="relative mb-5">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input placeholder="Search by keywords or tags..." className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-200 focus-visible:ring-violet-500/30" />
                  </div>
                  <div className="flex gap-2 mb-6">
                    <Badge className="bg-violet-600 hover:bg-violet-700 text-white border-transparent">All</Badge>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-400 bg-transparent hover:bg-zinc-800 cursor-pointer">Java</Badge>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-400 bg-transparent hover:bg-zinc-800 cursor-pointer">Python</Badge>
                  </div>
                  <ScrollArea className="flex-1 -mx-2 px-2">
                    <div className="space-y-3 pb-4">
                      {mockNotes.map((note) => (
                        <div
                          key={note.id}
                          onClick={() => setSelectedNoteId(note.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedNoteId === note.id
                              ? "border-violet-500 bg-violet-500/5"
                              : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-semibold text-zinc-100">{note.title}</h3>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">{note.grade}</span>
                          </div>
                          <p className="text-[11px] text-zinc-500 mb-4">{note.date}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {note.tags.map((tag) => (
                              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400 bg-zinc-950">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-zinc-800 hover:bg-zinc-700 transition-colors" />

              {/* 오른쪽: 노트 상세 정보 패널 */}
              <ResizablePanel defaultSize={65} className="bg-zinc-950">
                {(() => {
                  const note = mockNotes.find(n => n.id === selectedNoteId) || mockNotes[0];
                  return (
                    <ScrollArea className="h-full">
                      <div className="p-8 max-w-4xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <h1 className="text-2xl font-bold text-zinc-100">{note.title}</h1>
                            <p className="text-sm text-zinc-500 mt-2">{note.date}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-8 border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-xs">
                              <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit Memo
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-xs">
                              <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-rose-900 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 hover:text-rose-400">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Personal Notes */}
                        <Card className="bg-zinc-900/50 border-zinc-800">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-violet-400 flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              Personal Notes
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-zinc-300 leading-relaxed">
                              Applied memoization to avoid redundant traversals in dense graphs. Time complexity reduced from O(V+E) per query to O(V+E) amortized.
                            </p>
                          </CardContent>
                        </Card>

                        {/* Code Snapshot */}
                        <Card className="bg-zinc-900/50 border-zinc-800">
                          <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium text-zinc-100 flex items-center gap-2">
                              <Code2 className="h-4 w-4 text-zinc-400" />
                              Code Snapshot
                            </CardTitle>
                            <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300 text-xs">
                              {note.language}
                            </Badge>
                          </CardHeader>
                          <CardContent>
                            <div className="rounded-md overflow-hidden bg-[#1e1e1e] border border-zinc-800">
                              <div className="flex font-mono text-[13px] leading-relaxed">
                                <div className="bg-[#1e1e1e] border-r border-zinc-800 select-none px-3 py-4 text-zinc-600 text-right">
                                  {Array.from({ length: 10 }, (_, i) => (<div key={i} className="leading-6">{i + 1}</div>))}
                                </div>
                                <div className="flex-1 py-4 px-4 overflow-x-auto">
                                  <pre className="text-zinc-300">
                                    <code>
                                      <span className="text-purple-400">def</span> <span className="text-blue-400">dfs</span>(graph, start, visited=<span className="text-purple-400">None</span>):{"\n"}
                                      {"    "}<span className="text-purple-400">if</span> visited <span className="text-purple-400">is None</span>:{"\n"}
                                      {"        "}visited = <span className="text-blue-400">set</span>(){"\n"}
                                      {"    "}visited.<span className="text-yellow-400">add</span>(start){"\n\n"}
                                      {"    "}<span className="text-purple-400">for</span> next_node <span className="text-purple-400">in</span> graph[start]:{"\n"}
                                      {"        "}<span className="text-purple-400">if</span> next_node <span className="text-purple-400">not in</span> visited:{"\n"}
                                      {"            "}<span className="text-yellow-400">dfs</span>(graph, next_node, visited){"\n\n"}
                                      {"    "}<span className="text-purple-400">return</span> visited
                                    </code>
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  );
                })()}
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            /* =================== 기존 진단 / 리팩토링 화면 =================== */
            <ResizablePanelGroup direction="horizontal" className="flex-1">

              {/* Middle Panel (Diagnosis / Refactoring) */}
              <ResizablePanel defaultSize={40} minSize={25} maxSize={55}>
                <ScrollArea className="h-full bg-zinc-950">
                  <div className="p-4 space-y-4">

                    {/* ========== DIAGNOSIS VIEW ========== */}
                    {activeNav === "diagnosis" && (
                      <>
                        {/* Card 1: Code Quality Score */}
                        <Card className="bg-zinc-900 border-zinc-800">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-zinc-100 flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-amber-400" />
                              Code Quality Score
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-6">
                              <div className="relative w-28 h-28 flex-shrink-0">
                                <svg className="w-28 h-28 transform -rotate-90" style={{ filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))" }}>
                                  <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="none" className="text-zinc-800" />
                                  <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="none" strokeDasharray={`${(52 / 100) * 301.6} 301.6`} className="text-amber-400" style={{ filter: "drop-shadow(0 0 6px rgba(251, 191, 36, 0.6))" }} />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-3xl font-bold text-amber-400">C</span>
                                  <span className="text-xs text-zinc-400">52/100</span>
                                </div>
                              </div>
                              <div className="flex-1 space-y-3">
                                {[
                                  { label: "Accuracy", value: 72, color: "bg-amber-500" },
                                  { label: "Efficiency", value: 28, color: "bg-rose-500" },
                                  { label: "Readability", value: 65, color: "bg-amber-500" },
                                  { label: "Style", value: 44, color: "bg-rose-500" },
                                ].map((stat) => (
                                  <div key={stat.label} className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-zinc-400">{stat.label}</span>
                                      <span className="text-xs font-medium text-zinc-300">{stat.value}/100</span>
                                    </div>
                                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                      <div className={`h-full ${stat.color} rounded-full transition-all`} style={{ width: `${stat.value}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Card 2: Error Alert (찌그러짐 수정 완료) */}
                        <div className="w-full rounded-lg bg-rose-500/10 border border-rose-900 p-4 flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4 text-rose-500 shrink-0" />
                            <span className="text-sm font-bold text-rose-500">Timeout Risk</span>
                          </div>
                          <p className="text-xs text-rose-300/80 leading-relaxed">
                            A nested loop causes O(n{"²"}) execution. Will exceed time limit on inputs N {">"} 10,000.
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-rose-500 border-rose-500 hover:bg-rose-500/20 hover:text-rose-400 w-fit h-8 px-4 text-xs"
                            onClick={() => setActiveNav("refactoring")}
                          >
                            Fix It
                          </Button>
                        </div>

                        {/* Card 3: Current Time Complexity */}
                        <Card className="bg-zinc-900 border-zinc-800">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-medium text-zinc-100 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-rose-400" />
                                Current Complexity Risk
                              </CardTitle>
                              <Badge variant="outline" className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-lg font-mono px-3 py-1">
                                {"O(n\u00B2)"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="h-48 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={currentComplexityData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                                  <XAxis dataKey="n" stroke="#71717a" tick={{ fill: "#71717a", fontSize: 11 }} label={{ value: "Input Size (N)", position: "insideBottom", offset: -5, fill: "#71717a", fontSize: 11 }} />
                                  <YAxis stroke="#71717a" tick={{ fill: "#71717a", fontSize: 11 }} label={{ value: "Execution Time", angle: -90, position: "insideLeft", fill: "#71717a", fontSize: 11 }} />
                                  <RechartsTooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "6px", fontSize: "11px" }} labelStyle={{ color: "#a1a1aa" }} />
                                  <Line type="monotone" dataKey="time" stroke="#f43f5e" strokeWidth={3} dot={{ fill: "#f43f5e", r: 4 }} name="Current O(n²)" style={{ filter: "drop-shadow(0 0 6px rgba(244, 63, 94, 0.6))" }} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-md p-3">
                              <p className="text-xs text-rose-200 leading-relaxed">
                                Quadratic time complexity detected. Performance will degrade significantly with large inputs.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}

                    {/* ========== REFACTORING VIEW ========== */}
                    {activeNav === "refactoring" && (
                      <>
                        <Card className="bg-emerald-500/5 border-emerald-500/20">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Lightbulb className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-emerald-300">Key Insight</p>
                                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                                  Using HashMap reduces time complexity from O(n{"²"}) to O(n) by trading space for speed. Each lookup becomes O(1) instead of O(n).
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-zinc-100 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-emerald-400" />
                              Performance Comparison
                            </CardTitle>
                            <CardDescription className="text-xs text-zinc-400">Time saved with optimized algorithm</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-56 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={complexityComparisonData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                  <defs>
                                    <linearGradient id="timeSavedFill" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                                  <XAxis dataKey="name" stroke="#71717a" tick={{ fill: "#71717a", fontSize: 11 }} label={{ value: "Input Size (N)", position: "insideBottom", offset: -5, fill: "#71717a", fontSize: 11 }} />
                                  <YAxis stroke="#71717a" tick={{ fill: "#71717a", fontSize: 11 }} label={{ value: "Execution Time", angle: -90, position: "insideLeft", fill: "#71717a", fontSize: 11 }} />
                                  <RechartsTooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "6px", fontSize: "11px" }} labelStyle={{ color: "#a1a1aa" }} formatter={(value: number, name: string) => [value.toLocaleString(), name === "original" ? "Original O(n\u00B2)" : "Optimized O(n)"]} />
                                  <Legend wrapperStyle={{ fontSize: "11px" }} iconType="line" formatter={(value) => (value === "original" ? "Original O(n\u00B2)" : "Optimized O(n)")} />
                                  <Area type="monotone" dataKey="original" stroke="transparent" fill="url(#timeSavedFill)" name="timeSaved" legendType="none" tooltipType="none" />
                                  <Line type="monotone" dataKey="original" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#f43f5e", r: 3 }} name="original" style={{ filter: "drop-shadow(0 0 4px rgba(244, 63, 94, 0.5))" }} />
                                  <Line type="monotone" dataKey="optimized" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 4 }} name="optimized" style={{ filter: "drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))" }} />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="space-y-3">
                          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider px-1">Applied Optimizations</h3>
                          {improvements.map((improvement) => (
                            <Card key={improvement.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer" onClick={() => toggleCard(improvement.id)}>
                              <CardContent className="p-4 space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-medium text-zinc-100 flex items-center gap-2">
                                    {improvement.title}
                                    <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${openCards.includes(improvement.id) ? "rotate-180" : ""}`} />
                                  </span>
                                  <Badge variant="outline" className={`${improvement.badgeColor} text-xs font-mono shrink-0`}>{improvement.badge}</Badge>
                                </div>
                                {openCards.includes(improvement.id) && (
                                  <div className="space-y-3">
                                    <div className="text-xs text-zinc-300 leading-relaxed">{improvement.explanation}</div>
                                    <div className="bg-zinc-950 rounded-md border border-zinc-800 p-3">
                                      <div className="text-[11px] text-zinc-500 font-medium mb-1">Impact Metrics</div>
                                      <div className="text-xs text-emerald-400">{improvement.metrics}</div>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-zinc-800 hover:bg-zinc-700 transition-colors" />

              {/* Right Panel (Code Editor) */}
              <ResizablePanel defaultSize={60} minSize={35}>
                {showDiffView ? (
                  /* ========== DIFF VIEW MODE ========== */
                  <div className="h-full flex flex-col bg-zinc-950">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/30">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-300">Solution.java</span>
                        <Badge variant="outline" className="bg-zinc-900 border-zinc-700 text-xs text-zinc-400">Diff View</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3">Apply Fix</Button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400" onClick={() => setSaveDialogOpen(true)}>
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-zinc-900 border-zinc-700 text-zinc-200" side="bottom">Save to Notes</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <div className="flex-1 flex overflow-hidden">
                      {/* Original Code (Left) */}
                      <div className="flex-1 flex flex-col border-r border-zinc-800">
                        <div className="px-4 py-2 bg-zinc-900/30 border-b border-zinc-800">
                          <span className="text-xs font-medium text-zinc-500">Original Code</span>
                        </div>
                        <div className="flex-1 overflow-auto bg-[#1e1e1e]">
                          <div className="flex font-mono text-[13px]">
                            <div className="bg-[#1e1e1e] border-r border-zinc-800 select-none">
                              <div className="px-3 py-4 text-zinc-600 text-right">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => (<div key={num} className="leading-6">{num}</div>))}
                              </div>
                            </div>
                            <div className="flex-1 py-4">
                              <pre className="text-zinc-300 leading-6">
                                <code>
                                  <div className="px-4"><span className="text-purple-400">public</span> <span className="text-blue-400">class</span> <span className="text-emerald-400">Solution</span> {"{"}</div>
                                  <div className="px-4">{"    "}<span className="text-purple-400">public</span> <span className="text-blue-400">int</span>{"[] "}<span className="text-yellow-400">twoSum</span>{"("}<span className="text-blue-400">int</span>{"[] nums, "}<span className="text-blue-400">int</span>{" target) {"}</div>
                                  <div className="px-4 bg-rose-900/20 border-l-2 border-rose-500">{"        "}<span className="text-purple-400">for</span>{" ("}<span className="text-blue-400">int</span>{" i = "}<span className="text-amber-400">0</span>{"; i < nums.length; i"}<span className="text-pink-400">++</span>{") {"}</div>
                                  <div className="px-4 bg-rose-900/20 border-l-2 border-rose-500">{"            "}<span className="text-purple-400">for</span>{" ("}<span className="text-blue-400">int</span>{" j = i + "}<span className="text-amber-400">1</span>{"; j < nums.length; j"}<span className="text-pink-400">++</span>{") {"}</div>
                                  <div className="px-4 bg-rose-900/20 border-l-2 border-rose-500">{"                "}<span className="text-purple-400">if</span>{" (nums[i] + nums[j] "}<span className="text-pink-400">==</span>{" target) {"}</div>
                                  <div className="px-4 bg-rose-900/20 border-l-2 border-rose-500">{"                    "}<span className="text-purple-400">return</span> <span className="text-purple-400">new</span> <span className="text-blue-400">int</span>{"[] {i, j};"}</div>
                                  <div className="px-4 bg-rose-900/20 border-l-2 border-rose-500">{"                }"}</div>
                                  <div className="px-4 bg-rose-900/20 border-l-2 border-rose-500">{"            }"}</div>
                                  <div className="px-4 bg-rose-900/20 border-l-2 border-rose-500">{"        }"}</div>
                                  <div className="px-4">{"        "}<span className="text-purple-400">return</span> <span className="text-purple-400">new</span> <span className="text-blue-400">int</span>{"[] {};"}</div>
                                  <div className="px-4">{"    }"}</div>
                                  <div className="px-4">{"}"}</div>
                                </code>
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Optimized Code (Right) */}
                      <div className="flex-1 flex flex-col">
                        <div className="px-4 py-2 bg-zinc-900/30 border-b border-zinc-800">
                          <span className="text-xs font-medium text-emerald-400">Optimized Code</span>
                        </div>
                        <div className="flex-1 overflow-auto bg-[#1e1e1e]">
                          <div className="flex font-mono text-[13px]">
                            <div className="bg-[#1e1e1e] border-r border-zinc-800 select-none">
                              <div className="px-3 py-4 text-zinc-600 text-right">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((num) => (<div key={num} className="leading-6">{num}</div>))}
                              </div>
                            </div>
                            <div className="flex-1 py-4">
                              <pre className="text-zinc-100 leading-6">
                                <code>
                                  <div className="px-4"><span className="text-purple-400">public</span> <span className="text-blue-400">class</span> <span className="text-emerald-400">Solution</span> {"{"}</div>
                                  <div className="px-4">{"    "}<span className="text-purple-400">public</span> <span className="text-blue-400">int</span>{"[] "}<span className="text-yellow-400">twoSum</span>{"("}<span className="text-blue-400">int</span>{"[] nums, "}<span className="text-blue-400">int</span>{" target) {"}</div>
                                  <div className="px-4 bg-emerald-900/20 border-l-2 border-emerald-500">{"        "}<span className="text-purple-400">Map</span>{"<"}<span className="text-blue-400">Integer</span>{", "}<span className="text-blue-400">Integer</span>{">"} map = <span className="text-purple-400">new</span> <span className="text-blue-400">HashMap</span>{"<>();"}</div>
                                  <div className="px-4 bg-emerald-900/20 border-l-2 border-emerald-500">{"        "}<span className="text-purple-400">for</span>{" ("}<span className="text-blue-400">int</span>{" i = "}<span className="text-amber-400">0</span>{"; i < nums.length; i"}<span className="text-pink-400">++</span>{") {"}</div>
                                  <div className="px-4 bg-emerald-900/20 border-l-2 border-emerald-500">{"            "}<span className="text-blue-400">int</span>{" complement = target - nums[i];"}</div>
                                  <div className="px-4 bg-emerald-900/20 border-l-2 border-emerald-500">{"            "}<span className="text-purple-400">if</span>{" (map."}<span className="text-yellow-400">containsKey</span>{"(complement)) {"}</div>
                                  <div className="px-4 bg-emerald-900/20 border-l-2 border-emerald-500">{"                "}<span className="text-purple-400">return</span> <span className="text-purple-400">new</span> <span className="text-blue-400">int</span>{"[] {map."}<span className="text-yellow-400">get</span>{"(complement), i};"}</div>
                                  <div className="px-4 bg-emerald-900/20 border-l-2 border-emerald-500">{"            }"}</div>
                                  <div className="px-4 bg-emerald-900/20 border-l-2 border-emerald-500">{"            map."}<span className="text-yellow-400">put</span>{"(nums[i], i);"}</div>
                                  <div className="px-4 bg-emerald-900/20 border-l-2 border-emerald-500">{"        }"}</div>
                                  <div className="px-4">{"        "}<span className="text-purple-400">return</span> <span className="text-purple-400">new</span> <span className="text-blue-400">int</span>{"[] {};"}</div>
                                  <div className="px-4">{"    }"}</div>
                                  <div className="px-4">{"}"}</div>
                                </code>
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ========== NORMAL EDITOR MODE ========== */
                  <div className="h-full overflow-auto bg-[#1e1e1e] relative">
                    <div className="flex font-mono text-[13px] leading-relaxed">
                      <div className="sticky left-0 bg-[#1e1e1e] border-r border-zinc-800 select-none">
                        <div className="px-4 py-4 text-zinc-600 text-right">
                          {Array.from({ length: 16 }, (_, i) => (<div key={i} className="leading-6">{i + 1}</div>))}
                        </div>
                      </div>
                      <div className="flex-1 px-4 py-4 relative">
                        <pre className="text-zinc-300 leading-6">
                          <code>
                            <span className="text-purple-400">import</span> <span className="text-blue-400">java.util.HashMap</span>;{"\n"}
                            <span className="text-purple-400">import</span> <span className="text-blue-400">java.util.Map</span>;{"\n\n"}
                            <span className="text-purple-400">public</span> <span className="text-blue-400">class</span> <span className="text-emerald-400">Solution</span> {"{"}{"\n"}
                            {"    "}<span className="text-purple-400">public</span> <span className="text-blue-400">int</span>{"[] "}<span className="text-yellow-400">twoSum</span>{"("}<span className="text-blue-400">int</span>{"[] nums, "}<span className="text-blue-400">int</span>{" target) {"}{"\n\n"}
                            {"        "}<span className="text-zinc-500">{"// Initialize data structure for O(1) lookups"}</span>{"\n"}
                            {"        "}<span className="text-purple-400">Map</span>{"<"}<span className="text-blue-400">Integer</span>{", "}<span className="text-blue-400">Integer</span>{">"} map = <span className="text-purple-400">new</span> <span className="text-amber-300 bg-amber-400/10 px-1 rounded border border-amber-500/30 border-dashed">{"________"}</span>{"<>"};{"\n\n"}
                            {"        "}<span className="text-purple-400">for</span>{" ("}<span className="text-blue-400">int</span>{" i = "}<span className="text-amber-400">0</span>{"; i < nums.length; i++) {"}{"\n"}
                            {"            "}<span className="text-blue-400">int</span>{" complement = target - nums[i];"}{"\n"}
                            {"            "}<span className="text-purple-400">if</span>{" (map."}<span className="text-yellow-400">containsKey</span>{"(complement)) {"}{"\n"}
                            {"                "}<span className="text-purple-400">return</span> <span className="text-purple-400">new</span> <span className="text-blue-400">int</span>{"[] {map.get(complement), i};"}{"\n"}
                            {"            }"}{"\n"}
                            {"            map.put(nums[i], i);"}{"\n"}
                            {"        }"}{"\n"}
                            {"        "}<span className="text-purple-400">return</span> <span className="text-purple-400">new</span> <span className="text-blue-400">int</span>{"[] {};"}{"\n"}
                            {"    }"}{"\n"}
                            {"}"}
                          </code>
                        </pre>

                        {/* Floating Hint Tooltip */}
                        {aiCoaching && (
                          <div className="absolute left-12 top-[192px] z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl shadow-black/30 max-w-xs">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-xs text-zinc-300 leading-relaxed">
                                    <span className="font-medium text-amber-300">Hint:</span> In Java, use <span className="font-mono text-emerald-400 bg-emerald-400/10 px-1 rounded">HashMap</span> to store key-value pairs for O(1) lookup.
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center gap-1">
                                <div className="h-1 w-1 rounded-full bg-amber-400/60" />
                                <div className="h-1 w-1 rounded-full bg-amber-400/40" />
                                <div className="h-1 w-1 rounded-full bg-amber-400/20" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </ResizablePanel>
            </ResizablePanelGroup>
          )}

        </div>

        {/* =================== SAVE TO NOTE DIALOG =================== */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-zinc-100 flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-emerald-400" />
                Save to My Notes
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400">Title</label>
                <Input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} className="bg-zinc-950 border-zinc-800 text-zinc-200 text-sm focus-visible:ring-emerald-500/30" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {noteTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300 text-xs gap-1 pl-2 pr-1">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-zinc-100 rounded-full">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTag()} placeholder="Type a tag and press Enter..." className="bg-zinc-950 border-zinc-800 text-zinc-200 text-sm focus-visible:ring-emerald-500/30" />
                  <Button size="sm" variant="outline" className="h-9 border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs shrink-0" onClick={addTag}>Add</Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400">Memo</label>
                <textarea value={noteMemo} onChange={(e) => setNoteMemo(e.target.value)} placeholder="Add your personal notes here..." className="min-h-[100px] w-full rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm p-3 resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/30" />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800">Cancel</Button>
              </DialogClose>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setSaveDialogOpen(false)}>Save & Set 3-Day Review</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </TooltipProvider>
  )
}
