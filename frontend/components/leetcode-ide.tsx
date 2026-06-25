// components/leetcode-ide.tsx
"use client";

import {
  apiFetch,
  saveDiagnosis,
  generateAiLearning,
  saveLearning,
  type AiLearningResponse,
} from "@/lib/api"

import { useRouter } from "next/navigation";
import { useState, useRef, useMemo } from "react";
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
import { LoadDiagnosisDialog } from "@/components/dialogs/load-diagnosis-dialog"

// types
import type { LearningSession, Note } from "@/types";


/* ── 목 데이터 ── */
const initSessions: LearningSession[] = [
  { id: 1, title: "Binary Search Implementation", date: "Oct 20, 2025", grade: "B+", tags: ["Binary Search", "Arrays", "O(log n)"], language: "Java", favorited: true },
  { id: 2, title: "Graph DFS Optimization", date: "Oct 24, 2025", grade: "B+", tags: ["DFS", "Recursion", "Graph"], language: "Java", favorited: false },
  { id: 3, title: "Dynamic Programming – Knapsack", date: "Oct 18, 2025", grade: "A", tags: ["DP", "Memoization", "Optimization"], language: "Python", favorited: false },
  { id: 4, title: "Merge Sort Deep Dive", date: "Oct 12, 2025", grade: "A+", tags: ["Sorting", "Divide&Conquer"], language: "Java", favorited: false },
  { id: 5, title: "Linked List Operations", date: "Oct 8,  2025", grade: "B+", tags: ["LinkedList", "Pointers"], language: "Java", favorited: false },
];

/* 점수 → 등급 (백엔드와 일치) */
function getGradeFromScore(score: number): string {
  if (score >= 90) return 'S'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  return 'F'
}

/* 학습 세션 콘텐츠 (AI 학습 + 저장 결과 합친 형태) */
type CurrentLearning = {
  lrnId: number
  optimizedCode: AiLearningResponse["optimizedCode"]
  concepts: AiLearningResponse["concepts"]
}

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // 진단 저장 추적 (중복 저장 방지) — dgnsId 기준
  const [savedDgnsId, setSavedDgnsId] = useState<number | null>(null);

  // 학습 세션
  const [isStartingLearning, setIsStartingLearning] = useState(false);
  const [currentLearning, setCurrentLearning] = useState<CurrentLearning | null>(null);

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
  const [noteTitle, setNoteTitle] = useState("Nested Loop vs HashMap Performance");
  const [noteTags, setNoteTags] = useState(["Java", "Optimization", "DataStructure"]);
  const [tagInput, setTagInput] = useState("");
  const [noteMemo, setNoteMemo] = useState("");
  const [loadDiagOpen, setLoadDiagOpen] = useState(false)

  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0)

  const [unlockedBadges, setUnlockedBadges] = useState<UnlockedBadge[]>([])

  /* ── 핸들러 ── */

  // 진단 실행 (AI 분석만 — DB 저장 X)
  const handleRunAnalysis = async () => {
    if (!editorCode.trim()) {
      alert("코드를 입력해 주세요...");
      return;
    }

    setIsAnalyzing(true);
    setAiResult(null);
    setHasAnalyzed(false);
    setDiagPanelOpen(true);
    setSavedDgnsId(null);            // 새 분석 시작 → 이전 저장 상태 리셋
    setCurrentLearning(null);

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
      setAiResult("서버와 연결할 수 없습니다. 8080 포트가 켜져 있는지 확인해 주세요.");
      setHasAnalyzed(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // aiResult → DiagnosisSaveRequest 변환
  const buildSaveRequest = () => {
    if (!aiResult || typeof aiResult !== "object") {
      throw new Error("진단 결과가 없습니다.");
    }
    const score = aiResult.totalScore ?? 0;
    return {
      name: fileName || `진단 ${new Date().toLocaleString("ko-KR")}`,
      lang: language,
      content: editorCode,
      isStable: "Y",
      grade: getGradeFromScore(score),
      score,
      summary: aiResult.summary ?? "",
      accuracy: aiResult.accuracy ?? 0,
      accuracyReason: aiResult.accuracyReason ?? "",
      efficiency: aiResult.efficiency ?? 0,
      efficiencyReason: aiResult.efficiencyReason ?? "",
      readability: aiResult.readability ?? 0,
      readabilityReason: aiResult.readabilityReason ?? "",
      style: aiResult.style ?? 0,
      styleReason: aiResult.styleReason ?? "",
      timeComplexity: aiResult.complexity ?? "",
      optimizedCode: aiResult.optimizedCode ?? "",
    };
  };

  // Learning 클릭 → 자동 진단 저장 → AI 학습 생성 → 학습 저장 → 학습 화면
  const handleGoLearning = async () => {
    if (!hasAnalyzed || !aiResult) {
      alert("먼저 코드 분석을 완료해 주세요.");
      return;
    }
    if (isAnalyzing || isStartingLearning) return;

    setIsStartingLearning(true);
    setAnalyzedCode(editorCode);

    try {
      // 1. 아직 저장 안 됐으면 진단 자동 저장
      let dgnsId = savedDgnsId;
      if (!dgnsId) {
        const saveRes = await saveDiagnosis(buildSaveRequest());
        dgnsId = saveRes.dgnsId;
        setSavedDgnsId(dgnsId);
      }

      // 2. AI 학습 생성 (서버에서 OptCd 가져다 빈칸 + 개념 만듦)
      const aiLearn = await generateAiLearning({ diagnosisId: dgnsId });

      // 3. 학습 세션 저장
      const lrnRes = await saveLearning({
        diagnosisId: dgnsId,
        name: fileName || `학습 ${new Date().toLocaleString("ko-KR")}`,
        tags: "",
        optimizedCode: aiLearn.optimizedCode,
        concepts: aiLearn.concepts.map((c, i) => ({
          type: c.type,
          title: c.title,
          description: c.description,
          referenceUrl: c.referenceUrl,
          sortOrder: i + 1,
        })),
      });

      // 4. 학습 콘텐츠 상태에 저장 (DiffView에서 사용)
      setCurrentLearning({
        lrnId: lrnRes.id,
        optimizedCode: aiLearn.optimizedCode,
        concepts: aiLearn.concepts,
      });

      // 5. 학습 화면으로 전환
      setActiveNav("learning");
      setSelSession(lrnRes.id);
    } catch (error: any) {
      console.error("학습 시작 실패:", error);
      alert(error.message || "학습 세션 시작에 실패했어요.");
    } finally {
      setIsStartingLearning(false);
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
    setSelSession(null);
    setCurrentLearning(null);
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

  const handleLoadDiagnosis = (content: string, lang: string, name: string) => {
    setEditorCode(content)
    setLanguage(lang)
    setFileName(name)
  }
  const toggleFav = (id: number) =>
    setSessions((p) =>
      p.map((s) => (s.id === id ? { ...s, favorited: !s.favorited } : s)),
    );

  const toggleNoteFav = (id: number) =>
    setNotes((p) =>
      p.map((n) => (n.id === id ? { ...n, favorited: !n.favorited } : n)),
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

  const currentSession = useMemo<LearningSession | null>(() => {
    if (!selSession) return null

    // 1) 방금 만든 학습 세션이면 그걸로 표시
    if (currentLearning && currentLearning.lrnId === selSession) {
      return {
        id: currentLearning.lrnId,
        title: fileName || "학습 세션",
        date: new Date().toLocaleDateString("ko-KR"),
        grade: aiResult?.grade || getGradeFromScore(aiResult?.totalScore ?? 0),
        tags: [],
        language: language.charAt(0).toUpperCase() + language.slice(1),
        favorited: false,
      }
    }

    // 2) 아카이브에서 클릭한 경우 (목 데이터)
    return sessions.find((s) => s.id === selSession) ?? null
  }, [selSession, currentLearning, sessions, fileName, language, aiResult])

  return (
    <TooltipProvider>
      <style>{`
        .font-syne  { font-family: 'Syne', sans-serif; }
        .font-space { font-family: 'Space Mono', monospace; }
        .font-code  { font-family: 'D2Coding', monospace; }
      `}</style>

      <div className="h-screen w-full bg-zinc-950 flex overflow-hidden">
        <Sidebar
          activeNav={activeNav}
          sidebarExp={sidebarExp}
          setSidebarExp={setSidebarExp}
          onNavClick={handleNavClick}
          refreshKey={sidebarRefreshKey}
        />

        <div className="flex-1 flex flex-col min-w-0">
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
            onRunAnalysis={handleRunAnalysis}
            onGoLearning={handleGoLearning}
            isAnalyzing={isAnalyzing}
            isStartingLearning={isStartingLearning}
            onCopyCode={handleCopyCode}
            onShare={handleShare}
            onSaveDiag={() => setSaveDiagOpen(true)}
            onSaveNote={() => setSaveNoteOpen(true)}
            onFileUpload={() => fileRef.current?.click()}
            onLoadPrevious={() => setLoadDiagOpen(true)}
          />

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
              <div className={`transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${diagPanelOpen ? "w-[420px]" : "w-0"}`}>
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
              <div className="w-4 relative flex items-center justify-center shrink-0">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-zinc-800/50" />
                <button
                  onClick={() => setDiagPanelOpen((p) => !p)}
                  className="relative z-10 w-4 h-8 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-sm flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors"
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
                  learningContent={currentLearning}
                  onBack={() => {
                    setSelSession(null);
                    setCurrentLearning(null);
                  }}
                />
              )}
            </>
          )}

          {/* ── NOTES ── */}
          {activeNav === "notes" && (
            <div className="flex-1 flex overflow-hidden">
              <div className={`transition-all duration-300 ease-in-out overflow-hidden shrink-0 bg-[#0a0a0a] ${notesPanelOpen ? "w-[420px]" : "w-0"}`}>
                <div className="w-[420px] h-full">
                  <NotesList
                    selNote={selNote}
                    setSelNote={setSelNote}
                    refreshKey={notesRefreshKey}
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
                  onDeleted={() => setNotesRefreshKey(k => k + 1)}
                />
              </div>
            </div>
          )}

          {activeNav === "mypage" && (
            <div className="flex-1 overflow-hidden">
              <MyPage onProfileUpdated={() => setSidebarRefreshKey(k => k + 1)} />
            </div>
          )}
        </div>

        <SaveDiagnosisDialog
          open={saveDiagOpen}
          onOpenChange={setSaveDiagOpen}
          fileName={fileName}
          setFileName={setFileName}
          language={language}
          editorCode={editorCode}
          aiResult={aiResult}
          onBadgesUnlocked={setUnlockedBadges}
        />

        <LoadDiagnosisDialog
          open={loadDiagOpen}
          onOpenChange={setLoadDiagOpen}
          onSelect={handleLoadDiagnosis}
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