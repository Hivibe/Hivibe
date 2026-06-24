// components/leetcode-ide.tsx
"use client";


import { apiFetch } from "@/lib/api"

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";

import { BadgeUnlockDialog, type UnlockedBadge } from "@/components/dialogs/badge-unlock-dialog"

// layout
import { Sidebar } from "@/components/layout/sidebar";
import { MainHeader } from "@/components/layout/main-header";

// diagnosis
import { DiagnosisPanel } from "@/components/diagnosis/diagnosis-panel";
import { CodeEditor } from "@/components/diagnosis/code-editor";

// learning
import { ArchiveView } from "@/components/learning/archive-view";
import { DiffView } from "@/components/learning/diff-view";

// notes
import { NotesList } from "@/components/notes/notes-list";
import { NoteDetail } from "@/components/notes/note-detail";

// mypage
import { MyPage } from "@/components/mypage/my-page";

// dialogs
import { SaveDiagnosisDialog } from "@/components/dialogs/save-diagnosis-dialog";
import { SaveNoteDialog } from "@/components/dialogs/save-note-dialog";

// types
import type { LearningSession, Note } from "@/types";

/* ── 목 데이터 ── */
const initSessions: LearningSession[] = [
  {
    id: 1,
    title: "Binary Search Implementation",
    date: "Oct 20, 2025",
    grade: "B+",
    tags: ["Binary Search", "Arrays", "O(log n)"],
    language: "Java",
    favorited: true,
  },
  {
    id: 2,
    title: "Graph DFS Optimization",
    date: "Oct 24, 2025",
    grade: "B+",
    tags: ["DFS", "Recursion", "Graph"],
    language: "Java",
    favorited: false,
  },
  {
    id: 3,
    title: "Dynamic Programming – Knapsack",
    date: "Oct 18, 2025",
    grade: "A",
    tags: ["DP", "Memoization", "Optimization"],
    language: "Python",
    favorited: false,
  },
  {
    id: 4,
    title: "Merge Sort Deep Dive",
    date: "Oct 12, 2025",
    grade: "A+",
    tags: ["Sorting", "Divide&Conquer"],
    language: "Java",
    favorited: false,
  },
  {
    id: 5,
    title: "Linked List Operations",
    date: "Oct 8,  2025",
    grade: "B+",
    tags: ["LinkedList", "Pointers"],
    language: "Java",
    favorited: false,
  },
];



/* ── COMPONENT ── */
export function LeetCodeIDE() {
  const router = useRouter();

  // global
  const [language, setLanguage] = useState("java");
  const [activeNav, setActiveNav] = useState("diagnosis");
  const [sidebarExp, setSidebarExp] = useState(true);
  const [aiCoaching, setAiCoaching] = useState(true);

  // diagnosis
  const [editorCode, setEditorCode] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [analyzedCode, setAnalyzedCode] = useState("");

  // AI
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 분석 중 로딩 상태
  const [aiResult, setAiResult] = useState<any>(null);

  // files
  const [fileName, setFileName] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // learning
  const [sessions, setSessions] = useState<LearningSession[]>(initSessions);
  const [selSession, setSelSession] = useState<number | null>(null);

  // notes
  const [selNote, setSelNote] = useState(1);
  const [notesRefreshKey, setNotesRefreshKey] = useState(0)

  // panel collapse
  const [diagPanelOpen, setDiagPanelOpen] = useState(true);
  const [notesPanelOpen, setNotesPanelOpen] = useState(true);

  // dialogs
  const [saveDiagOpen, setSaveDiagOpen] = useState(false);
  const [saveNoteOpen, setSaveNoteOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState(
    "Nested Loop vs HashMap Performance",
  );
  const [noteTags, setNoteTags] = useState([
    "Java",
    "Optimization",
    "DataStructure",
  ]);
  const [tagInput, setTagInput] = useState("");
  const [noteMemo, setNoteMemo] = useState("");

  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0)

  const [unlockedBadges, setUnlockedBadges] = useState<UnlockedBadge[]>([])

  /* ── 핸들러 ── */
  const handleRunAnalysis = async () => {
    if (!editorCode.trim()) {
      alert("코드를 입력해 주세요...");
      return;
    }

    setIsAnalyzing(true);
    setAiResult(null);
    setHasAnalyzed(false);
    setDiagPanelOpen(true);

    try {
      const response = await apiFetch("/api/ai/ask", {
        method: "POST",
        body: JSON.stringify({
          prompt: `다음 코드를 분석하고, 문제점과 개선 방안을 상세히 진단해 줘:\n\n${editorCode}`,
        }),
      });

      const data = await response.json();
      setAiResult(data);
      setHasAnalyzed(true);
    } catch (error) {
      console.error("백엔드 통신 실패:", error);
      setAiResult(
        "서버와 연결할 수 없습니다. 8080 포트가 켜져 있는지 확인해 주세요.",
      );
      setHasAnalyzed(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editorCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "HiVibe", url: window.location.href });
      } catch { }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleNavClick = (id: string) => {
    if (id === "home") {
      router.push("/");
      return;
    }
    setActiveNav(id);
    if (id !== "learning") setSelSession(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name.replace(/\.[^/.]+$/, ""));
    const r = new FileReader();
    r.onload = (ev) => setEditorCode((ev.target?.result as string) ?? "");
    r.readAsText(f);
    e.target.value = "";
  };

  const toggleFav = (id: number) =>
    setSessions((p) =>
      p.map((s) => (s.id === id ? { ...s, favorited: !s.favorited } : s)),
    );

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !noteTags.includes(t)) {
      setNoteTags((p) => [...p, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) =>
    setNoteTags((p) => p.filter((t) => t !== tag));

  const currentSession = sessions.find((s) => s.id === selSession) ?? null;

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
          refreshKey={sidebarRefreshKey}
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
            editorCode={editorCode}
            hasAnalyzed={hasAnalyzed}
            selSession={selSession}
            codeCopied={codeCopied}
            uploadOpen={uploadOpen}
            setUploadOpen={setUploadOpen}
            // 수정
            onRunAnalysis={handleRunAnalysis}
            onGoLearning={() => {
              setAnalyzedCode(editorCode);
              setActiveNav("learning");
            }}
            isAnalyzing={isAnalyzing} // 추가
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
                className={`transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${diagPanelOpen ? "w-[420px]" : "w-0"
                  }`}
              >
                <div className="w-[420px] h-full">
                  <ScrollArea className="h-full bg-zinc-950">
                    <DiagnosisPanel
                      hasAnalyzed={hasAnalyzed}
                      isAnalyzing={isAnalyzing}
                      aiResult={aiResult}
                    />
                  </ScrollArea>
                </div>
              </div>
              <div className="w-px bg-zinc-800/50 relative flex items-center justify-center shrink-0">
                <button
                  onClick={() => setDiagPanelOpen((p) => !p)}
                  className="absolute z-10 w-4 h-8 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-sm flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {diagPanelOpen ? "‹" : "›"}
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <CodeEditor
                  language={language}
                  fileName={fileName}
                  setFileName={setFileName}
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
                className={`transition-all duration-300 ease-in-out overflow-hidden shrink-0 bg-[#0a0a0a] ${notesPanelOpen ? "w-[420px]" : "w-0"
                  }`}
              >
                <div className="w-[420px] h-full">
                  <NotesList
                    selNote={selNote}
                    setSelNote={setSelNote}
                    refreshKey={notesRefreshKey}   // 추가
                  />
                </div>
              </div>
              <div className="w-px bg-zinc-800/50 relative flex items-center justify-center shrink-0">
                <button
                  onClick={() => setNotesPanelOpen((p) => !p)}
                  className="absolute z-10 w-4 h-8 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-sm flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {notesPanelOpen ? "‹" : "›"}
                </button>
              </div>
              <div className="flex-1 min-w-0 bg-zinc-950">
                <NoteDetail
                  noteId={selNote}
                  onDeleted={() => setNotesRefreshKey(k => k + 1)}   // 추가
                />
              </div>
            </div>
          )}

          {/* ── MYPAGE ── */}
          {activeNav === "mypage" && (
            <div className="flex-1 overflow-hidden">
              <MyPage onProfileUpdated={() => setSidebarRefreshKey(k => k + 1)} />
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
          editorCode={editorCode} // 추가
          aiResult={aiResult}
          onBadgesUnlocked={setUnlockedBadges}
        />

        <BadgeUnlockDialog
          badges={unlockedBadges}
          onClose={() => setUnlockedBadges([])}
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
  );
}
