"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Share2,
  Pencil,
  Trash2,
  Lightbulb,
  BookOpen,
  ArrowLeft,
  Sparkles,
} from "lucide-react"

interface NoteTag {
  label: string
  color: string
}

interface Note {
  id: number
  title: string
  grade: string
  gradeColor: string
  date: string
  tags: NoteTag[]
  aiSummary: string
  code: string
  memo: string
}

const notes: Note[] = [
  {
    id: 1,
    title: "Graph DFS Optimization",
    grade: "B+",
    gradeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    date: "Oct 24, 2025",
    tags: [
      { label: "DFS", color: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
      { label: "Recursion", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
      { label: "Graph", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
    aiSummary:
      'You improved the time complexity from O(V²) to O(V+E) by using an Adjacency List instead of a Matrix. The recursive DFS was also optimized by adding early termination when the target node is found.',
    code: `// Optimized DFS with Adjacency List
public void dfs(Map<Integer, List<Integer>> graph, int node, Set<Integer> visited) {
    if (visited.contains(node)) return;
    visited.add(node);
    System.out.println("Visiting: " + node);
    for (int neighbor : graph.getOrDefault(node, new ArrayList<>())) {
        dfs(graph, neighbor, visited);
    }
}`,
    memo: "Key insight: Adjacency list gives O(V+E) traversal vs O(V²) for matrix. Remember to always check visited set before recursing to avoid infinite loops in cyclic graphs.",
  },
  {
    id: 2,
    title: "Two Sum - HashMap Approach",
    grade: "A",
    gradeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    date: "Oct 22, 2025",
    tags: [
      { label: "HashMap", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
      { label: "Array", color: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
      { label: "O(n)", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
    aiSummary:
      "Replaced nested loop O(n²) with single-pass HashMap for O(n) time complexity. Space-time tradeoff: uses O(n) extra memory but dramatically faster for large inputs.",
    code: `// Single-pass HashMap solution
public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[] {map.get(complement), i};
        }
        map.put(nums[i], i);
    }
    return new int[] {};
}`,
    memo: "Classic space-time tradeoff pattern. HashMap stores value->index. Check complement exists before inserting to handle duplicates correctly.",
  },
  {
    id: 3,
    title: "Binary Search on Rotated Array",
    grade: "B",
    gradeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    date: "Oct 19, 2025",
    tags: [
      { label: "BinarySearch", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
      { label: "Array", color: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
      { label: "O(logN)", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
    aiSummary:
      "Modified standard binary search to handle rotated sorted arrays. Key insight: at least one half of the array is always sorted, which you can use to determine which half to search next.",
    code: `public int search(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[lo] <= nums[mid]) {
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}`,
    memo: "Always check which half is sorted first. The sorted half can be identified by comparing nums[lo] with nums[mid]. Be careful with edge cases when lo == mid.",
  },
  {
    id: 4,
    title: "Merge Intervals - Sorting Trick",
    grade: "A-",
    gradeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    date: "Oct 15, 2025",
    tags: [
      { label: "Sorting", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
      { label: "Intervals", color: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
      { label: "Greedy", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
    aiSummary:
      "Sort intervals by start time, then greedily merge overlapping ones in a single pass. O(n log n) due to sorting, with O(n) merge step.",
    code: `public int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    List<int[]> merged = new ArrayList<>();
    for (int[] interval : intervals) {
        if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < interval[0]) {
            merged.add(interval);
        } else {
            merged.get(merged.size() - 1)[1] = 
                Math.max(merged.get(merged.size() - 1)[1], interval[1]);
        }
    }
    return merged.toArray(new int[0][]);
}`,
    memo: "Sort first, then single pass merge. The key comparison: if current start > last merged end, it's a new interval. Otherwise extend the last merged interval's end.",
  },
  {
    id: 5,
    title: "LRU Cache Implementation",
    grade: "C+",
    gradeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    date: "Oct 10, 2025",
    tags: [
      { label: "Design", color: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
      { label: "LinkedList", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
      { label: "HashMap", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
    aiSummary:
      "Combined HashMap with Doubly-Linked List for O(1) get and put operations. HashMap provides O(1) lookup, while the linked list maintains access order for eviction.",
    code: `class LRUCache {
    private Map<Integer, Node> map = new HashMap<>();
    private Node head, tail;
    private int capacity;
    
    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        moveToHead(node);
        return node.value;
    }
}`,
    memo: "Need to review: doubly-linked list operations (addToHead, removeNode, moveToHead). The sentinel head/tail pattern simplifies edge cases.",
  },
]

const filterOptions = ["All", "Java", "Python", "Graph", "Array", "Design"]

export function MyLibrary() {
  const [selectedNote, setSelectedNote] = useState<Note>(notes[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All")

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((t) =>
        t.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    const matchesFilter =
      activeFilter === "All" ||
      note.tags.some(
        (t) => t.label.toLowerCase() === activeFilter.toLowerCase()
      )
    return matchesSearch && matchesFilter
  })

  return (
    <div className="h-screen w-full bg-zinc-950 flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs">Back to IDE</span>
          </a>
          <Separator orientation="vertical" className="h-4 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-semibold text-zinc-100">
              My Library
            </span>
          </div>
        </div>
        <Badge
          variant="outline"
          className="bg-zinc-900 border-zinc-700 text-zinc-400 text-xs"
        >
          {notes.length} notes saved
        </Badge>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* =================== LEFT SIDEBAR =================== */}
        <div className="w-[35%] min-w-[320px] max-w-[440px] flex flex-col border-r border-zinc-800">
          {/* Header + Search */}
          <div className="p-5 space-y-4">
            <h1 className="text-xl font-bold text-zinc-100 text-balance">
              My Library
            </h1>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search by keywords or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-200 text-sm placeholder:text-zinc-600 focus-visible:ring-violet-500/30"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeFilter === filter
                      ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                      : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <Separator className="bg-zinc-800" />

          {/* Note List */}
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {filteredNotes.map((note) => {
                const isActive = selectedNote.id === note.id
                return (
                  <button
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className={`w-full text-left rounded-lg p-4 transition-all ${
                      isActive
                        ? "bg-violet-500/10 border border-violet-500/30"
                        : "bg-zinc-900/50 border border-transparent hover:bg-zinc-900 hover:border-zinc-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`text-sm font-medium leading-tight ${
                          isActive ? "text-violet-200" : "text-zinc-200"
                        }`}
                      >
                        {note.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`${note.gradeColor} text-xs font-mono shrink-0`}
                      >
                        {note.grade}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1.5">{note.date}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {note.tags.map((tag) => (
                        <span
                          key={tag.label}
                          className="text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full"
                        >
                          #{tag.label}
                        </span>
                      ))}
                    </div>
                  </button>
                )
              })}

              {filteredNotes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="h-8 w-8 text-zinc-700 mb-3" />
                  <p className="text-sm text-zinc-500">No notes found</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Try a different search term or filter
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* =================== RIGHT PANEL =================== */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Detail Header */}
          <div className="flex items-start justify-between px-8 py-5 border-b border-zinc-800 bg-zinc-900/30">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-zinc-100 text-balance">
                {selectedNote.title}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">
                  {selectedNote.date}
                </span>
                <Badge
                  variant="outline"
                  className={`${selectedNote.gradeColor} text-xs font-mono`}
                >
                  Grade: {selectedNote.grade}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs gap-1.5"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-rose-400 hover:text-rose-300 hover:border-rose-500/30 text-xs gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>

          {/* Detail Content */}
          <ScrollArea className="flex-1">
            <div className="px-8 py-6 space-y-6">
              {/* AI Coach's Summary */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-violet-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">
                    {"AI Coach's Summary"}
                  </h3>
                </div>
                <Card className="bg-violet-500/5 border-violet-500/20">
                  <CardContent className="p-4">
                    <p className="text-sm text-violet-200/90 leading-relaxed">
                      {selectedNote.aiSummary}
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* Code Snapshot */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-500 font-mono">{"</>"}</span>
                  <h3 className="text-sm font-semibold text-zinc-200">
                    Code Snapshot
                  </h3>
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]"
                  >
                    Optimized
                  </Badge>
                </div>
                <div className="rounded-lg border border-zinc-800 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                    <span className="text-xs text-zinc-500 font-mono">
                      Solution.java
                    </span>
                    <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                      Copy
                    </button>
                  </div>
                  <div className="bg-[#1e1e1e] overflow-x-auto">
                    <div className="flex font-mono text-[13px]">
                      <div className="select-none border-r border-zinc-800">
                        <div className="px-3 py-4 text-zinc-600 text-right">
                          {selectedNote.code.split("\n").map((_, i) => (
                            <div key={i} className="leading-6">
                              {i + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 py-4 px-4">
                        <pre className="text-zinc-300 leading-6 whitespace-pre">
                          <code>
                            {selectedNote.code.split("\n").map((line, i) => (
                              <div key={i}>
                                {highlightJava(line)}
                              </div>
                            ))}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* My Memo */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Pencil className="h-4 w-4 text-zinc-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">
                    My Memo
                  </h3>
                </div>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-4">
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {selectedNote.memo}
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* Start Review Quiz CTA */}
              <div className="pt-2 pb-4">
                <Button className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm gap-2 relative overflow-hidden group">
                  <span className="absolute inset-0 bg-violet-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Sparkles className="h-4 w-4" />
                  Start Review Quiz
                  <span className="absolute inset-0 rounded-md ring-1 ring-violet-400/20 group-hover:ring-violet-400/40 transition-all" />
                </Button>
                <p className="text-center text-xs text-zinc-500 mt-2">
                  Spaced repetition review to strengthen your memory
                </p>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

function highlightJava(line: string): React.ReactNode {
  const keywords = [
    "public",
    "private",
    "class",
    "return",
    "new",
    "for",
    "if",
    "else",
    "while",
    "import",
    "void",
    "static",
  ]
  const types = [
    "int",
    "Map",
    "HashMap",
    "Set",
    "List",
    "ArrayList",
    "Node",
    "Integer",
    "String",
    "Arrays",
  ]

  const parts: React.ReactNode[] = []
  const tokens = line.split(/(\b\w+\b|[^\w]+)/g).filter(Boolean)

  tokens.forEach((token, idx) => {
    if (keywords.includes(token)) {
      parts.push(
        <span key={idx} className="text-purple-400">
          {token}
        </span>
      )
    } else if (types.includes(token)) {
      parts.push(
        <span key={idx} className="text-blue-400">
          {token}
        </span>
      )
    } else if (/^\d+$/.test(token)) {
      parts.push(
        <span key={idx} className="text-amber-400">
          {token}
        </span>
      )
    } else if (token.startsWith("//")) {
      parts.push(
        <span key={idx} className="text-zinc-500">
          {token}
        </span>
      )
    } else {
      parts.push(<span key={idx}>{token}</span>)
    }
  })

  if (line.trimStart().startsWith("//")) {
    return <span className="text-zinc-500">{line}</span>
  }

  return <>{parts}</>
}
