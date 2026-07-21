// components/leetcode-ide.tsx
"use client";

import {
  apiFetch,
  saveDiagnosis,
  generateAiLearning,
  saveLearning,
  fetchLearnings,
  fetchLearningDetail,
  toggleBookmark as apiToggleBookmark,
  deleteLearning,
  fetchLatestSubmission,
  type SubmissionResponse,
  type AiLearningResponse,
} from "@/lib/api"

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
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
import type { LearningSession } from "@/types";

//toaster
import { toast } from "sonner"

import { DiffView, type Pace } from "@/components/learning/diff-view";


/* 점수 → 등급 (백엔드와 일치) */
function getGradeFromScore(score: number): string {
  if (score >= 90) return 'S'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  return 'F'
}

/* 학습 세션 콘텐츠 (DiffView가 쓰는 형태) */
type LearningContent = {
  lrnId: number
  optimizedCode: AiLearningResponse["optimizedCode"]
  concepts: AiLearningResponse["concepts"]
  previousSubmission?: SubmissionResponse | null
}

/* 언어 표기 통일 (java → Java) */
function displayLang(lang: string | null | undefined): string {
  if (!lang) return "Unknown"
  const l = lang.toLowerCase()
  if (l === "c++" || l === "cpp") return "C++"
  return lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase()
}

export function LeetCodeIDE() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // URL 초기값
  const initialNav = searchParams.get("nav") || "diagnosis";
  const initialLrn = searchParams.get("lrn");

  // global
  const [language, setLanguage] = useState("java");
  const [activeNav, setActiveNav] = useState(initialNav);
  const [sidebarExp, setSidebarExp] = useState(true);
  const [aiCoaching, setAiCoaching] = useState(true);

  // diagnosis
  const [editorCode, setEditorCode] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // AI
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const [savedDgnsId, setSavedDgnsId] = useState<number | null>(null);

  // 학습 세션 캐시
  const [isStartingLearning, setIsStartingLearning] = useState(false);
  const [learnings, setLearnings] = useState<Map<number, LearningContent>>(new Map());
  const [analyzedCodeMap, setAnalyzedCodeMap] = useState<Map<number, string>>(new Map());

  // 아카이브
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [selSession, setSelSession] = useState<number | null>(
    initialLrn ? Number(initialLrn) : null
  );
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // files
  const [fileName, setFileName] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // notes
  const [selNote, setSelNote] = useState(1);
  const [notesRefreshKey, setNotesRefreshKey] = useState(0);

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

  const [pace, setPace] = useState<Pace>("off");

  const [unlockedBadges, setUnlockedBadges] = useState<UnlockedBadge[]>([]);

  /* URL 쿼리 동기화
   * - push: 히스토리 쌓음 (뒤로가기로 돌아올 수 있게)
   * - replace: 현재 항목 덮어씀 (뒤로가기 대상 아님)
   */
  const syncUrl = useCallback((nav: string, lrn: number | null, mode: "push" | "replace" = "push") => {
    const params = new URLSearchParams();
    if (nav && nav !== "diagnosis") params.set("nav", nav);
    if (lrn != null) params.set("lrn", String(lrn));
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    if (mode === "push") {
      router.push(url, { scroll: false });
    } else {
      router.replace(url, { scroll: false });
    }
  }, [router, pathname]);

  /* 아카이브 목록 로드 */
  const loadSessions = useCallback(async () => {
    try {
      const items = await fetchLearnings();
      setSessions(items.map(it => ({
        id: it.lrnId,
        title: it.lrnName || "제목 없음",
        date: new Date(it.createdAt).toLocaleDateString("ko-KR"),
        grade: it.grade ?? "-",
        tags: it.tag ? it.tag.split(",").map(t => t.trim()).filter(Boolean) : [],
        language: displayLang(it.lang),
        favorited: it.bookmarked,
      })));
    } catch (e) {
      console.error("아카이브 목록 로드 실패:", e);
    }
  }, []);

  /* 학습 상세 + 마지막 채점 로드 */
  const loadLearningDetail = useCallback(async (lrnId: number) => {
    if (learnings.has(lrnId)) return;

    setIsLoadingDetail(true);
    setDetailError(null);
    try {
      const [detail, latestSubm] = await Promise.all([
        fetchLearningDetail(lrnId),
        fetchLatestSubmission(lrnId).catch(() => null),
      ]);

      setLearnings(prev => new Map(prev).set(lrnId, {
        lrnId: detail.lrnId,
        optimizedCode: detail.optimizedCode,
        concepts: detail.concepts.map(c => ({
          type: c.type,
          title: c.title,
          description: c.description,
          referenceUrl: c.referenceUrl,
        })),
        previousSubmission: latestSubm,
      }));
      setAnalyzedCodeMap(prev => new Map(prev).set(lrnId, detail.originalCode));
    } catch (e: any) {
      console.error("학습 상세 조회 실패:", e);
      setDetailError(e.message || "학습 정보를 불러오지 못했어요.");
    } finally {
      setIsLoadingDetail(false);
    }
  }, [learnings]);

  /* 마운트 시 아카이브 목록 */
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  /* URL ↔ state 동기화 (마운트 + 뒤로가기/앞으로가기 모두 커버) */
  useEffect(() => {
    const nav = searchParams.get("nav") || "diagnosis";
    const lrn = searchParams.get("lrn");
    setActiveNav(nav);
    setSelSession(lrn ? Number(lrn) : null);
    if (lrn && nav === "learning") {
      const lrnId = Number(lrn);
      if (!Number.isNaN(lrnId)) void loadLearningDetail(lrnId);
    }
  }, [searchParams, loadLearningDetail]);

  // ↑ 기존 "마운트 시 URL에 lrn 있으면 복원" useEffect는 삭제

  /* 마운트 시 URL에 lrn 있으면 복원 */
  useEffect(() => {
    if (initialLrn && initialNav === "learning") {
      const lrnId = Number(initialLrn);
      if (!Number.isNaN(lrnId)) {
        void loadLearningDetail(lrnId);
      }
    }
  }, []);

  /* ── 핸들러 ── */

  const handleRunAnalysis = async () => {
    if (!editorCode.trim()) {
      toast.warning("코드를 입력해 주세요");
      return;
    }

    setIsAnalyzing(true);
    setAiResult(null);
    setHasAnalyzed(false);
    setDiagPanelOpen(true);
    setSavedDgnsId(null);

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

  const handleGoLearning = async () => {
    if (!hasAnalyzed || !aiResult) {
      toast.warning("먼저 코드 분석을 완료해 주세요");
      return;
    }
    if (isAnalyzing || isStartingLearning) return;

    setIsStartingLearning(true);

    try {
      // 1. 진단 자동 저장
      let dgnsId = savedDgnsId;
      if (!dgnsId) {
        const saveRes = await saveDiagnosis(buildSaveRequest());
        dgnsId = saveRes.dgnsId;
        setSavedDgnsId(dgnsId);
      }

      // 2. AI 학습 생성
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
        blanks: aiLearn.blanks,
      });

      const lrnId = lrnRes.id;

      // 4. 캐시
      setLearnings(prev => new Map(prev).set(lrnId, {
        lrnId,
        optimizedCode: aiLearn.optimizedCode,
        concepts: aiLearn.concepts,
      }));
      setAnalyzedCodeMap(prev => new Map(prev).set(lrnId, editorCode));

      // 5. 아카이브 목록 갱신
      await loadSessions();

      // 6. 학습 화면으로
      setActiveNav("learning");
      setSelSession(lrnId);
      syncUrl("learning", lrnId);      // ← URL 갱신
    } catch (error: any) {
      console.error("학습 시작 실패:", error);
      toast.error("학습 세션을 시작하지 못했어요", {
        description: error.message,
      });
    } finally {
      setIsStartingLearning(false);
    }
  };

  /* 아카이브에서 학습 클릭 → 캐시에 없으면 서버에서 조회 */
  const handleSelectSession = async (lrnId: number) => {
    setSelSession(lrnId);
    syncUrl("learning", lrnId);      // ← URL 갱신
    await loadLearningDetail(lrnId);
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
    syncUrl(id, null);               // ← URL 갱신
    if (id === "learning") loadSessions();
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

  /* 즐겨찾기 — 낙관적 업데이트 후 실패 시 롤백 */
  const toggleFav = async (id: number) => {
    setSessions(p => p.map(s => (s.id === id ? { ...s, favorited: !s.favorited } : s)));
    try {
      await apiToggleBookmark(id);
    } catch (e) {
      console.error("즐겨찾기 실패:", e);
      setSessions(p => p.map(s => (s.id === id ? { ...s, favorited: !s.favorited } : s)));
      toast.error("즐겨찾기를 변경하지 못했어요");
    }
  };

  /* 학습 삭제 */
  const handleDeleteSession = async (id: number) => {
    const target = sessions.find(s => s.id === id);

    try {
      await deleteLearning(id);

      // 캐시 정리
      setLearnings(prev => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      setAnalyzedCodeMap(prev => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });

      if (selSession === id) {
        setSelSession(null);
        syncUrl("learning", null, "replace");
      }

      await loadSessions();

      toast.success("✅ 학습을 삭제했어요", {
        description: target?.title,
      });
    } catch (e: any) {
      console.error("학습 삭제 실패:", e);
      toast.error("삭제하지 못했어요", {
        description: e.message || "잠시 후 다시 시도해 주세요.",
      });
    }
  };
  const handleLoadDiagnosis = (content: string, lang: string, name: string, aiResult?: any) => {
    setEditorCode(content)
    setLanguage(lang)
    setFileName(name)
    if (aiResult) {
      setAiResult(aiResult)
      setHasAnalyzed(true)
    }
    setLoadDiagOpen(false)
  }

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
    if (!selSession) return null;

    const currentLearning = learnings.get(selSession);

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

    // 2) 아카이브에서 클릭한 경우
    return sessions.find((s) => s.id === selSession) ?? null

  }, [selSession, learnings, sessions, fileName, language, aiResult])

  const currentLearningContent = useMemo<LearningContent | null>(() => {
    if (!selSession) return null;
    return learnings.get(selSession) ?? null;
  }, [selSession, learnings]);

  const currentAnalyzedCode = useMemo<string>(() => {
    if (!selSession) return "";
    return analyzedCodeMap.get(selSession) ?? "";
  }, [selSession, analyzedCodeMap]);

  /* 채점 완료 → 아카이브 목록의 grade와 캐시된 previousSubmission 동시 갱신 */
  const handleLearningGraded = useCallback((lrnId: number, res: SubmissionResponse) => {
    setSessions(prev => prev.map(s =>
      s.id === lrnId ? { ...s, grade: res.grade ?? s.grade } : s
    ));
    setLearnings(prev => {
      const existing = prev.get(lrnId);
      if (!existing) return prev;
      const next = new Map(prev);
      next.set(lrnId, { ...existing, previousSubmission: res });
      return next;
    });
  }, []);

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
            pace={pace}
            setPace={setPace}
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
                  onSelectSession={handleSelectSession}
                  onToggleFav={toggleFav}
                  onDeleteSession={handleDeleteSession}
                />
              )}

              {selSession && isLoadingDetail && (
                <div className="flex-1 flex items-center justify-center bg-[#0d0d0d]">
                  <p className="font-space text-sm text-zinc-500">학습 정보를 불러오는 중...</p>
                </div>
              )}

              {selSession && !isLoadingDetail && detailError && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#0d0d0d]">
                  <p className="font-ko text-sm text-rose-400">{detailError}</p>
                  <button
                    onClick={() => {
                      setSelSession(null);
                      syncUrl("learning", null);
                    }}
                    className="font-space text-xs text-zinc-500 hover:text-zinc-300 underline"
                  >
                    ← 아카이브로 돌아가기
                  </button>
                </div>
              )}

              {selSession && !isLoadingDetail && !detailError && currentSession && (
                <DiffView
                  session={currentSession}
                  analyzedCode={currentAnalyzedCode}
                  learningContent={currentLearningContent}
                  onBack={() => {
                    setSelSession(null);
                    syncUrl("learning", null, "replace");
                  }}
                  onGraded={handleLearningGraded}
                  pace={pace}
                  
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