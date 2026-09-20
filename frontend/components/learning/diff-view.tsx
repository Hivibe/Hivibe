"use client"

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  Fragment,
  type PointerEvent as ReactPointerEvent,
} from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  TrendingUp,
  Check,
  MessageSquare,
  ExternalLink,
  Loader2,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Pencil,
  Lock,
  GripVertical,
  X,
} from "lucide-react"

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts"

import type { LearningSession } from "@/types"

import {
  apiFetch,
  submitLearning,
  fetchHint,
  renameLearning,
  saveDraft,
  fetchDraft,
  analyzeComplexity,
  type PerformanceComparison,
  type AiLearningResponse,
  type BlankResult,
  type SubmissionResponse,
} from "@/lib/api"

import { toast } from "sonner"

const BRAND = "#63C1ED"

/* =========================================================
   LIVE COACHING
========================================================= */

export type Pace =
  | "off"
  | "easy"
  | "medium"
  | "hard"

export const PACE_INTERVALS_MS: Record<
  Exclude<Pace, "off">,
  number
> = {
  easy: 20000,
  medium: 40000,
  hard: 70000,
}

const hintStorageKey = (lrnId: number) =>
  `hivibe_hint_${lrnId}`

/* =========================================================
   PERFORMANCE COMPARISON
========================================================= */

const PERFORMANCE_INPUT_SIZES = [
  10,
  25,
  50,
  100,
]

function normalizeComplexity(
  value?: string | null
) {
  if (!value) return ""

  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
}

function complexityValue(
  complexity: string | null | undefined,
  n: number
) {
  const normalized =
    normalizeComplexity(complexity)

  switch (normalized) {
    case "o(1)":
      return 1

    case "o(logn)":
      return Math.max(
        1,
        Math.log2(n)
      )

    case "o(n)":
      return n

    case "o(nlogn)":
      return (
        n *
        Math.log2(n)
      )

    case "o(n^2)":
      return n ** 2

    case "o(n^3)":
      return n ** 3

    case "o(2^n)":
      return Math.min(
        2 ** n,
        1_000_000
      )

    case "o(n!)": {
      let result = 1

      for (
        let i = 2;
        i <= Math.min(n, 10);
        i++
      ) {
        result *= i
      }

      return Math.min(
        result,
        1_000_000
      )
    }

    default:
      return 1
  }
}



/* =========================================================
   TYPES
========================================================= */

type PersistedHint = {
  levels: Record<number, number>
  contents: Record<
    number,
    Record<number, string>
  >
  elapsed: Record<number, number>
  viewLevel: Record<number, number>
}

type LearningContent = {
  lrnId: number

  originalComplexity?: string

  optimizedCode:
  AiLearningResponse["optimizedCode"]

  concepts: (
    AiLearningResponse["concepts"][number] & {
      id?: number
    }
  )[]

  previousSubmission?: {
    correctCount: number
    totalBlanks: number
    grade: string | null
    overallComment: string | null
    results: BlankResult[]
  } | null

  unlockedConceptIds?: number[]
}

interface DiffViewProps {
  session: LearningSession
  analyzedCode: string
  learningContent:
  LearningContent | null

  onBack: () => void

  onGraded?: (
    lrnId: number,
    res: SubmissionResponse
  ) => void

  pace: Pace

  onBadgesUnlocked?: (
    badges: any[]
  ) => void

  onRename?: (
    lrnId: number,
    newName: string
  ) => void
}

/* =========================================================
   CODE HIGHLIGHT
========================================================= */

function highlightLine(
  text: string
) {
  const keywords = [
    "public",
    "class",
    "return",
    "for",
    "if",
    "else",
    "new",
    "private",
    "static",
    "void",
    "final",
    "def",
    "import",
    "from",
    "function",
    "const",
    "let",
    "var",
  ]

  const types = [
    "int",
    "String",
    "boolean",
    "long",
    "double",
    "float",
    "char",
  ]

  const typesExtra = [
    "Map",
    "HashMap",
    "List",
    "ArrayList",
    "Set",
    "HashSet",
  ]

  const all = [
    ...keywords,
    ...types,
    ...typesExtra,
  ]

  const regex =
    new RegExp(
      `\\b(${all.join("|")})\\b`,
      "g"
    )

  const parts =
    text.split(regex)

  return parts.map(
    (part, index) => {
      if (
        keywords.includes(part)
      ) {
        return (
          <span
            key={index}
            className="text-[#c678dd]"
          >
            {part}
          </span>
        )
      }

      if (
        types.includes(part)
      ) {
        return (
          <span
            key={index}
            className="text-[#56b6c2]"
          >
            {part}
          </span>
        )
      }

      if (
        typesExtra.includes(part)
      ) {
        return (
          <span
            key={index}
            className="text-[#e5c07b]"
          >
            {part}
          </span>
        )
      }

      return (
        <Fragment key={index}>
          {part}
        </Fragment>
      )
    }
  )
}

/* =========================================================
   BLANK CODE PARSER
========================================================= */

type Token = {
  type: "text" | "blank"
  value: string
  blankIdx?: number
}

type ParsedLine = {
  lineNo: number
  tokens: Token[]
  hasBlank: boolean
}

function parseBlankCode(
  blankCode: string
): ParsedLine[] {
  const lines =
    blankCode.split("\n")

  return lines.map(
    (line, lineIdx) => {
      const tokens: Token[] = []

      const regex =
        /\{\{BLANK_(\d+)\}\}/g

      let lastIndex = 0

      let match:
        RegExpExecArray | null

      let hasBlank = false

      while (
        (
          match =
          regex.exec(line)
        ) !== null
      ) {
        if (
          match.index >
          lastIndex
        ) {
          tokens.push({
            type: "text",
            value:
              line.slice(
                lastIndex,
                match.index
              ),
          })
        }

        tokens.push({
          type: "blank",
          value: "",
          blankIdx:
            parseInt(
              match[1],
              10
            ) - 1,
        })

        hasBlank = true

        lastIndex =
          match.index +
          match[0].length
      }

      if (
        lastIndex <
        line.length
      ) {
        tokens.push({
          type: "text",
          value:
            line.slice(
              lastIndex
            ),
        })
      }

      if (
        tokens.length === 0
      ) {
        tokens.push({
          type: "text",
          value: "",
        })
      }

      return {
        lineNo:
          lineIdx + 1,
        tokens,
        hasBlank,
      }
    }
  )
}

/* =========================================================
   RESULT POPOVER
========================================================= */

function ResultPopover({
  result,
}: {
  result: BlankResult
}) {
  const [
    showAnswer,
    setShowAnswer,
  ] = useState(false)

  const isWrong =
    !result.correct

  const isAiPass =
    result.correct &&
    result.grdMethod === "A"

  const isExactPass =
    result.correct &&
    result.grdMethod === "S"

  /*
   * 완전 정답이고
   * 개념 정보도 없다면
   * 표시할 내용 없음
   */
  if (
    isExactPass &&
    !result.conceptTitle
  ) {
    return null
  }

  const headerText =
    isWrong
      ? "다시 생각해 보세요"
      : isAiPass
        ? "정답이지만 참고하세요"
        : "이 개념을 사용했어요"

  const headerColor =
    isWrong
      ? "text-rose-400"
      : isAiPass
        ? "text-amber-400"
        : "text-emerald-400"

  return (
    <Popover
      onOpenChange={open => {
        if (!open) {
          setShowAnswer(false)
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shadow-sm"
          title="코멘트 보기"
        >
          <MessageSquare className="h-3 w-3" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        className="max-w-sm bg-card border-border p-0 shadow-xl shadow-black/10 rounded-xl overflow-hidden"
      >
        <div
          className="px-4 py-3 border-b border-border"
          style={{
            borderLeft:
              `3px solid ${isWrong
                ? "#f43f5e"
                : isAiPass
                  ? "#f59e0b"
                  : "#10b981"
              }`,
          }}
        >
          <p
            className={`font-syne font-bold text-sm ${headerColor}`}
          >
            {headerText}
          </p>
        </div>

        <div className="p-4 space-y-3">
          {isExactPass &&
            result.conceptTitle && (
              <div>
                <p className="font-ko text-[12px] text-foreground font-bold mb-1.5">
                  {
                    result.conceptTitle
                  }
                </p>

                {result.conceptDesc && (
                  <p className="font-ko text-[11px] text-muted-foreground leading-relaxed">
                    {
                      result.conceptDesc
                    }
                  </p>
                )}
              </div>
            )}

          {result.diffNote && (
            <p className="font-ko text-[11px] text-foreground/80 leading-relaxed">
              {result.diffNote}
            </p>
          )}

          {result.recommend && (
            <div className="pt-2 border-t border-border">
              <p
                className="font-ko text-[10px] font-bold mb-1"
                style={{
                  color: BRAND,
                }}
              >
                💬 추천
              </p>

              <p className="font-ko text-[11px] text-muted-foreground leading-relaxed">
                {
                  result.recommend
                }
              </p>
            </div>
          )}

          {result.securityNote && (
            <div className="pt-2 border-t border-border">
              <p className="font-ko text-[10px] font-bold text-orange-400 mb-1">
                ⚠️ 주의
              </p>

              <p className="font-ko text-[11px] text-muted-foreground leading-relaxed">
                {
                  result.securityNote
                }
              </p>
            </div>
          )}

          {isWrong &&
            result.expAns && (
              <div className="pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() =>
                    setShowAnswer(
                      previous =>
                        !previous
                    )
                  }
                  className="font-ko text-[10px] text-muted-foreground hover:text-foreground/80 underline transition-colors flex items-center gap-1"
                >
                  {showAnswer ? (
                    <>
                      <EyeOff className="h-3 w-3" />
                      정답 가리기
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" />
                      정답 보기
                    </>
                  )}
                </button>

                {showAnswer && (
                  <div className="mt-2">
                    <p className="font-ko text-[10px] font-bold text-emerald-400 mb-1">
                      정답
                    </p>

                    <code className="font-code text-[11px] text-emerald-300 block bg-background rounded px-2 py-1.5 whitespace-pre-wrap break-all">
                      {
                        result.expAns
                      }
                    </code>
                  </div>
                )}
              </div>
            )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* =========================================================
   DIFF VIEW
========================================================= */

export function DiffView({
  session,
  analyzedCode,
  learningContent,
  onBack,
  onBadgesUnlocked,
  onGraded,
  pace,
  onRename,
}: DiffViewProps) {
  /* -------------------------------------------------------
     BASIC STATE
  ------------------------------------------------------- */

  const [
    panelOpen,
    setPanelOpen,
  ] = useState(true)

  const [
    answers,
    setAnswers,
  ] = useState<
    Record<number, string>
  >({})

  const [
    userName,
    setUserName,
  ] =
    useState<string>(
      "사용자"
    )

  /* -------------------------------------------------------
     TITLE
  ------------------------------------------------------- */

  const [
    editingTitle,
    setEditingTitle,
  ] = useState(false)

  const [
    titleDraft,
    setTitleDraft,
  ] =
    useState(
      session.title
    )

  const [
    savingTitle,
    setSavingTitle,
  ] = useState(false)

  const [
    displayTitle,
    setDisplayTitle,
  ] =
    useState(
      session.title
    )

  /* -------------------------------------------------------
     GRADING
  ------------------------------------------------------- */

  const [
    isGrading,
    setIsGrading,
  ] = useState(false)

  const [
    results,
    setResults,
  ] = useState<
    Record<
      number,
      BlankResult
    > | null
  >(null)

  const isGraded =
    results !== null

  const [
    summary,
    setSummary,
  ] = useState<{
    correctCount: number
    totalBlanks: number
    grade: string | null
    overallComment:
    string | null
  } | null>(null)

  const [
    gradeError,
    setGradeError,
  ] = useState<
    string | null
  >(null)

  const [
    localUnlockedConceptIds,
    setLocalUnlockedConceptIds,
  ] = useState<number[]>([])

  /* -------------------------------------------------------
   PERFORMANCE
------------------------------------------------------- */

  const [
    basePerformance,
    setBasePerformance,
  ] = useState<{
    originalComplexity: string
    optimizedComplexity: string
  } | null>(null)

  const [
    performanceComparison,
    setPerformanceComparison,
  ] = useState<PerformanceComparison | null>(null)

  const [
    isAnalyzingPerformance,
    setIsAnalyzingPerformance,
  ] = useState(false)

  const [
    isAnalyzingBasePerformance,
    setIsAnalyzingBasePerformance,
  ] = useState(false)

  const [
    performanceError,
    setPerformanceError,
  ] = useState<string | null>(null)

  /*
   * Original:
   * 진단 단계에서 분석한 시간복잡도 사용
   *
   * AI Optimized:
   * 학습 최초 1회 분석 후 localStorage에 저장
   *
   * My Submission:
   * 기존 제출 결과 복원
   */
  useEffect(() => {
    const currentLrnId =
      learningContent?.lrnId

    const originalComplexity =
      learningContent?.originalComplexity

    const optimizedCode =
      learningContent?.optimizedCode?.content

    if (
      !currentLrnId ||
      !originalComplexity ||
      !optimizedCode
    ) {
      return
    }

    const baseKey =
      `performance-base-${currentLrnId}`

    const submissionKey =
      `performance-${currentLrnId}`

    /*
     * 다른 학습에서 보던 값이
     * 잠깐 보이는 것 방지
     */
    setBasePerformance(null)
    setPerformanceComparison(null)
    setPerformanceError(null)

    let savedOptimizedComplexity:
      string | null = null

    try {
      /*
       * 1. 이전에 분석한 AI Optimized 복잡도 복원
       *
       * Original은 localStorage 값을 사용하지 않고
       * 현재 진단 데이터로 항상 덮어쓴다.
       */
      const savedBase =
        localStorage.getItem(baseKey)

      if (savedBase) {
        const parsed = JSON.parse(
          savedBase
        ) as {
          originalComplexity?: string
          optimizedComplexity?: string
        }

        if (
          parsed.optimizedComplexity
        ) {
          savedOptimizedComplexity =
            parsed.optimizedComplexity

          const base = {
            originalComplexity,
            optimizedComplexity:
              parsed.optimizedComplexity,
          }

          setBasePerformance(base)

          /*
           * 과거 캐시에 저장된 Original 값이 있더라도
           * 현재 진단값으로 갱신
           */
          localStorage.setItem(
            baseKey,
            JSON.stringify(base)
          )
        }
      }

      /*
       * 2. 마지막 My Submission 복원
       */
      const savedSubmission =
        localStorage.getItem(
          submissionKey
        )

      if (savedSubmission) {
        const parsed:
          PerformanceComparison =
          JSON.parse(savedSubmission)

        setPerformanceComparison({
          originalComplexity,

          optimizedComplexity:
            savedOptimizedComplexity ??
            parsed.optimizedComplexity,

          submittedComplexity:
            parsed.submittedComplexity,
        })
      }
    } catch {
      localStorage.removeItem(
        baseKey
      )

      localStorage.removeItem(
        submissionKey
      )

      setBasePerformance(null)
      setPerformanceComparison(null)
    }

    /*
     * 이미 AI Optimized Complexity를
     * 분석한 기록이 있으면 재분석하지 않음
     */
    if (
      savedOptimizedComplexity
    ) {
      setIsAnalyzingBasePerformance(
        false
      )

      return
    }

    /*
     * AI Optimized Complexity 최초 1회 분석
     *
     * 현재 analyzeComplexity API가
     * originalCode + optimizedCode를 함께 받기 때문에
     * 요청에는 Original도 전달하지만,
     *
     * result.originalComplexity는 사용하지 않는다.
     *
     * 화면의 Original은 무조건
     * 진단에서 넘어온 originalComplexity 사용.
     */
    setIsAnalyzingBasePerformance(
      true
    )

    void analyzeComplexity({
      originalCode:
        analyzedCode,

      optimizedCode,

      language:
        learningContent
          .optimizedCode
          .lang ?? "unknown",

      answers: [],
    })
      .then(result => {
        const base = {
          /*
           * 중요:
           * AI가 다시 분석한 Original이 아니라
           * 진단에서 받은 값 사용
           */
          originalComplexity,

          /*
           * Optimized만 이번 분석 결과 사용
           */
          optimizedComplexity:
            result.optimizedComplexity,
        }

        setBasePerformance(base)

        localStorage.setItem(
          baseKey,
          JSON.stringify(base)
        )

        /*
         * 이미 제출 기록을 복원한 상태라면
         * Optimized 기준값도 새 값으로 맞춰준다.
         */
        setPerformanceComparison(
          previous => {
            if (!previous) {
              return null
            }

            const next = {
              ...previous,

              originalComplexity,

              optimizedComplexity:
                result.optimizedComplexity,
            }

            localStorage.setItem(
              submissionKey,
              JSON.stringify(next)
            )

            return next
          }
        )
      })
      .catch(
        (error: unknown) => {
          console.error(
            "Optimized performance analysis failed:",
            error
          )

          setPerformanceError(
            error instanceof Error
              ? error.message
              : "AI 최적화 코드의 시간복잡도 분석에 실패했습니다."
          )
        }
      )
      .finally(() => {
        setIsAnalyzingBasePerformance(
          false
        )
      })
  }, [
    learningContent?.lrnId,
    learningContent?.originalComplexity,
    learningContent?.optimizedCode?.content,
    learningContent?.optimizedCode?.lang,
    analyzedCode,
  ])

  const complexityComparisonData =
    useMemo(() => {
      if (!basePerformance) {
        return []
      }

      return PERFORMANCE_INPUT_SIZES.map(
        n => ({
          name: String(n),

          original:
            complexityValue(
              basePerformance
                .originalComplexity,
              n
            ),

          optimized:
            complexityValue(
              basePerformance
                .optimizedComplexity,
              n
            ),

          ...(performanceComparison
            ?.submittedComplexity
            ? {
              submitted:
                complexityValue(
                  performanceComparison
                    .submittedComplexity,
                  n
                ),
            }
            : {}),
        })
      )
    }, [
      basePerformance,
      performanceComparison
        ?.submittedComplexity,
    ])

  /* -------------------------------------------------------
     LIVE COACHING
  ------------------------------------------------------- */
  const [
    hintLevels,
    setHintLevels,
  ] = useState<
    Record<number, number>
  >({})

  const [
    hintContents,
    setHintContents,
  ] = useState<
    Record<
      number,
      Record<number, string>
    >
  >({})

  const [
    hintLoading,
    setHintLoading,
  ] = useState<
    Record<number, boolean>
  >({})

  const [
    hintElapsed,
    setHintElapsed,
  ] = useState<
    Record<number, number>
  >({})

  const [
    runningBlank,
    setRunningBlank,
  ] = useState<
    number | null
  >(null)

  const [
    ,
    setNowTick,
  ] = useState(
    () =>
      Date.now()
  )

  const [
    focusedBlank,
    setFocusedBlank,
  ] = useState<
    number | null
  >(null)

  const [
    hintViewLevel,
    setHintViewLevel,
  ] = useState<
    Record<number, number>
  >({})

  const hintBoxRef =
    useRef<HTMLDivElement | null>(null)

  const hintDragOffsetRef =
    useRef({
      x: 0,
      y: 0,
    })

  const [
    hintPosition,
    setHintPosition,
  ] = useState<{
    x: number
    y: number
  } | null>(null)

  const [
    isDraggingHint,
    setIsDraggingHint,
  ] = useState(false)

  /* -------------------------------------------------------
     DRAFT
  ------------------------------------------------------- */

  const draftTimerRef =
    useRef<
      NodeJS.Timeout | null
    >(null)

  const draftLoadedRef =
    useRef(false)

  const [
    draftSaving,
    setDraftSaving,
  ] = useState(false)

  const [
    draftSavedAt,
    setDraftSavedAt,
  ] = useState<
    Date | null
  >(null)

  /* -------------------------------------------------------
     DERIVED DATA
  ------------------------------------------------------- */

  const blankCode =
    learningContent
      ?.optimizedCode
      .blank ?? ""

  const concepts =
    learningContent
      ?.concepts ?? []

  const parsedLines =
    useMemo(
      () =>
        parseBlankCode(
          blankCode
        ),
      [blankCode]
    )

  const blankCount =
    useMemo(() => {
      const set =
        new Set<number>()

      for (
        const line of
        parsedLines
      ) {
        for (
          const token of
          line.tokens
        ) {
          if (
            token.type ===
            "blank" &&
            token.blankIdx !==
            undefined
          ) {
            set.add(
              token.blankIdx
            )
          }
        }
      }

      return set.size
    }, [parsedLines])

  const originalConcepts =
    concepts.filter(
      concept =>
        concept.type === "O"
    )

  const optimizedConcepts =
    concepts.filter(
      concept =>
        concept.type === "P"
    )

  const originalLines =
    useMemo(
      () =>
        analyzedCode.split(
          "\n"
        ),
      [analyzedCode]
    )

  const unlockedConceptIds =
    useMemo(
      () =>
        new Set(
          localUnlockedConceptIds
        ),
      [localUnlockedConceptIds]
    )

  const filledCount =
    Object.values(
      answers
    ).filter(
      value =>
        value?.trim()
          .length > 0
    ).length

  const allFilled =
    blankCount > 0 &&
    filledCount ===
    blankCount

  const hasAnyAnswer =
    filledCount > 0

  /* =========================================================
     TITLE
  ========================================================= */

  const handleTitleSave =
    async () => {
      const trimmed =
        titleDraft.trim()

      if (!trimmed) {
        setTitleDraft(
          displayTitle
        )

        setEditingTitle(
          false
        )

        return
      }

      if (
        trimmed ===
        displayTitle
      ) {
        setEditingTitle(
          false
        )

        return
      }

      if (!learningContent) {
        return
      }

      setSavingTitle(true)

      try {
        await renameLearning(
          learningContent.lrnId,
          trimmed
        )

        setDisplayTitle(
          trimmed
        )

        onRename?.(
          learningContent.lrnId,
          trimmed
        )

        setEditingTitle(
          false
        )

        toast.success(
          "이름을 변경했어요"
        )
      } catch (error: any) {
        console.error(
          "이름 변경 실패:",
          error
        )

        toast.error(
          "이름을 변경하지 못했어요",
          {
            description:
              error.message,
          }
        )

        setTitleDraft(
          session.title
        )
      } finally {
        setSavingTitle(
          false
        )
      }
    }

  /* =========================================================
     EFFECT - TITLE
  ========================================================= */

  useEffect(() => {
    setTitleDraft(
      session.title
    )

    setDisplayTitle(
      session.title
    )

    setEditingTitle(
      false
    )
  }, [
    session.title,
    learningContent?.lrnId,
  ])

  /* =========================================================
     EFFECT - USER
  ========================================================= */

  useEffect(() => {
    apiFetch(
      "/api/mypage/me"
    )
      .then(
        response =>
          response.json()
      )
      .then(data => {
        if (
          data?.userNm
        ) {
          setUserName(
            data.userNm
          )
        }
      })
      .catch(error =>
        console.error(
          "유저 이름 불러오기 실패:",
          error
        )
      )
  }, [])

  /* =========================================================
     EFFECT - SESSION RESTORE
  ========================================================= */

  useEffect(() => {
    const lrnId =
      learningContent?.lrnId

    setLocalUnlockedConceptIds(
      learningContent?.unlockedConceptIds ??
      []
    )

    draftLoadedRef.current =
      false

    setDraftSavedAt(null)

    const previous =
      learningContent
        ?.previousSubmission

    if (
      previous &&
      previous.results.length >
      0
    ) {
      const restoredAnswers:
        Record<
          number,
          string
        > = {}

      const restoredResults:
        Record<
          number,
          BlankResult
        > = {}

      for (
        const result of
        previous.results
      ) {
        restoredAnswers[
          result.blankOrd - 1
        ] =
          result.userAns

        restoredResults[
          result.blankOrd - 1
        ] =
          result
      }

      setAnswers(
        restoredAnswers
      )

      setResults(
        restoredResults
      )

      setSummary({
        correctCount:
          previous.correctCount,

        totalBlanks:
          previous.totalBlanks,

        grade:
          previous.grade,

        overallComment:
          previous.overallComment,
      })

      draftLoadedRef.current =
        true
    } else {
      setAnswers({})
      setResults(null)
      setSummary(null)

      if (lrnId) {
        fetchDraft(lrnId)
          .then(draft => {
            if (
              draft?.answers
            ) {
              const restored:
                Record<
                  number,
                  string
                > = {}

              for (
                const [
                  ord,
                  value,
                ] of
                Object.entries(
                  draft.answers
                )
              ) {
                restored[
                  parseInt(
                    ord,
                    10
                  ) - 1
                ] =
                  value
              }

              setAnswers(
                restored
              )

              if (
                Object.keys(
                  restored
                ).length > 0
              ) {
                toast.info(
                  "입력하던 답안을 불러왔어요"
                )
              }
            }
          })
          .catch(error =>
            console.warn(
              "draft 불러오기 실패:",
              error
            )
          )
          .finally(() => {
            draftLoadedRef.current =
              true
          })
      } else {
        draftLoadedRef.current =
          true
      }
    }

    setGradeError(null)

    setPerformanceError(
      null
    )

    setIsAnalyzingPerformance(
      false
    )

    /*
     * 힌트 상태 복원
     */
    let restoredHint:
      PersistedHint | null =
      null

    if (lrnId) {
      try {
        const raw =
          sessionStorage.getItem(
            hintStorageKey(
              lrnId
            )
          )

        if (raw) {
          restoredHint =
            JSON.parse(raw)
        }
      } catch (error) {
        console.warn(
          "힌트 상태 복원 실패:",
          error
        )
      }
    }

    setHintLevels(
      restoredHint
        ?.levels ?? {}
    )

    setHintContents(
      restoredHint
        ?.contents ?? {}
    )

    setHintElapsed(
      restoredHint
        ?.elapsed ?? {}
    )

    setHintViewLevel(
      restoredHint
        ?.viewLevel ?? {}
    )

    setHintLoading({})
    setRunningBlank(null)
    setFocusedBlank(null)

    setHintPosition(null)
    setIsDraggingHint(false)
  }, [
    learningContent?.lrnId,
  ])

  /* =========================================================
     EFFECT - DRAFT SAVE
  ========================================================= */

  useEffect(() => {
    const lrnId =
      learningContent?.lrnId

    if (!lrnId) return

    if (
      !draftLoadedRef.current
    ) {
      return
    }

    if (isGraded) {
      return
    }

    if (
      draftTimerRef.current
    ) {
      clearTimeout(
        draftTimerRef.current
      )
    }

    draftTimerRef.current =
      setTimeout(() => {
        const payload:
          Record<
            string,
            string
          > = {}

        for (
          const [
            idx0,
            value,
          ] of
          Object.entries(
            answers
          )
        ) {
          if (
            value?.trim()
          ) {
            payload[
              String(
                parseInt(
                  idx0,
                  10
                ) + 1
              )
            ] =
              value
          }
        }

        setDraftSaving(
          true
        )

        saveDraft(
          lrnId,
          payload
        )
          .then(() =>
            setDraftSavedAt(
              new Date()
            )
          )
          .catch(error =>
            console.warn(
              "draft 저장 실패:",
              error
            )
          )
          .finally(() =>
            setDraftSaving(
              false
            )
          )
      }, 1500)

    return () => {
      if (
        draftTimerRef.current
      ) {
        clearTimeout(
          draftTimerRef.current
        )
      }
    }
  }, [
    answers,
    learningContent?.lrnId,
    isGraded,
  ])

  /* =========================================================
     EFFECT - HINT STORAGE
  ========================================================= */

  useEffect(() => {
    const lrnId =
      learningContent?.lrnId

    if (!lrnId) return

    if (
      Object.keys(
        hintLevels
      ).length === 0
    ) {
      return
    }

    try {
      const payload:
        PersistedHint = {
        levels:
          hintLevels,

        contents:
          hintContents,

        elapsed:
          hintElapsed,

        viewLevel:
          hintViewLevel,
      }

      sessionStorage.setItem(
        hintStorageKey(
          lrnId
        ),
        JSON.stringify(
          payload
        )
      )
    } catch (error) {
      console.warn(
        "힌트 상태 저장 실패:",
        error
      )
    }
  }, [
    hintLevels,
    hintContents,
    hintElapsed,
    hintViewLevel,
    learningContent?.lrnId,
  ])

  /* =========================================================
     HINT
  ========================================================= */

  const handleRevealHint =
    async (
      idx0: number,
      nextLevel: number
    ) => {
      if (
        !learningContent
      ) {
        return
      }

      const cached =
        hintContents[idx0]
        ?.[nextLevel]

      if (cached !== undefined) {
        setHintLevels(previous => ({
          ...previous,
          [idx0]: nextLevel,
        }))

        setHintViewLevel(previous => ({
          ...previous,
          [idx0]: nextLevel,
        }))

        return
      }

      setHintLoading(
        previous => ({
          ...previous,
          [idx0]: true,
        })
      )

      try {
        const response =
          await fetchHint(
            learningContent.lrnId,
            idx0 + 1,
            nextLevel
          )

        setHintContents(
          previous => ({
            ...previous,

            [idx0]: {
              ...(
                previous[
                idx0
                ] ?? {}
              ),

              [nextLevel]:
                response.content,
            },
          })
        )

        setHintLevels(
          previous => ({
            ...previous,
            [idx0]:
              nextLevel,
          })
        )

        setHintViewLevel(
          previous => ({
            ...previous,
            [idx0]:
              nextLevel,
          })
        )
      } catch (error: any) {
        console.error(
          "힌트 조회 실패:",
          error
        )

        toast.error(
          "힌트를 불러오지 못했어요",
          {
            description:
              error.message,
          }
        )
      } finally {
        setHintLoading(
          previous => ({
            ...previous,
            [idx0]: false,
          })
        )
      }
    }

  /* =========================================================
     LIVE COACHING TIMER
  ========================================================= */

  useEffect(() => {
    if (
      pace === "off" ||
      isGraded ||
      runningBlank === null
    ) {
      return
    }

    const intervalMs =
      PACE_INTERVALS_MS[
      pace
      ]

    const timer =
      setInterval(() => {
        setNowTick(
          Date.now()
        )

        setHintElapsed(
          previous => {
            const idx0 =
              runningBlank

            const next =
              (
                previous[
                idx0
                ] ?? 0
              ) + 250

            const currentLevel =
              hintLevels[
              idx0
              ] ?? 0

            const nextLevel =
              currentLevel + 1

            if (
              nextLevel <= 3 &&
              next >=
              nextLevel *
              intervalMs &&
              !hintLoading[
              idx0
              ]
            ) {
              void handleRevealHint(
                idx0,
                nextLevel
              )
            }

            return {
              ...previous,
              [idx0]:
                next,
            }
          }
        )
      }, 250)

    return () =>
      clearInterval(
        timer
      )
  }, [
    pace,
    isGraded,
    runningBlank,
    hintLevels,
    hintLoading,
  ])

  const handleBlankFocus =
    (idx0: number) => {
      setFocusedBlank(
        idx0
      )

      if (
        pace === "off" ||
        isGraded
      ) {
        return
      }

      setHintElapsed(
        previous =>
          previous[idx0] ===
            undefined
            ? {
              ...previous,
              [idx0]: 0,
            }
            : previous
      )

      setRunningBlank(
        idx0
      )
    }

  const togglePlay =
    (idx0: number) => {
      setRunningBlank(
        previous =>
          previous ===
            idx0
            ? null
            : idx0
      )
    }

  const clampHintPosition = (
    x: number,
    y: number
  ) => {
    if (
      typeof window ===
      "undefined"
    ) {
      return { x, y }
    }

    const box =
      hintBoxRef.current

    const width =
      box?.offsetWidth ?? 400

    const height =
      box?.offsetHeight ?? 200

    const padding = 12

    return {
      x: Math.min(
        Math.max(
          padding,
          x
        ),
        Math.max(
          padding,
          window.innerWidth -
          width -
          padding
        )
      ),

      y: Math.min(
        Math.max(
          padding,
          y
        ),
        Math.max(
          padding,
          window.innerHeight -
          height -
          padding
        )
      ),
    }
  }

  const handleHintDragStart = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    /*
     * 버튼을 클릭했을 때는
     * 드래그를 시작하지 않음
     */
    const target =
      event.target as HTMLElement

    if (
      target.closest(
        "button"
      )
    ) {
      return
    }

    const box =
      hintBoxRef.current

    if (!box) return

    const rect =
      box.getBoundingClientRect()

    hintDragOffsetRef.current =
    {
      x:
        event.clientX -
        rect.left,

      y:
        event.clientY -
        rect.top,
    }

    setIsDraggingHint(true)

    event.currentTarget.setPointerCapture(
      event.pointerId
    )
  }

  const handleHintDragMove = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (
      !isDraggingHint
    ) {
      return
    }

    const next =
      clampHintPosition(
        event.clientX -
        hintDragOffsetRef
          .current.x,

        event.clientY -
        hintDragOffsetRef
          .current.y
      )

    setHintPosition(
      next
    )
  }

  const handleHintDragEnd = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (
      !isDraggingHint
    ) {
      return
    }

    setIsDraggingHint(
      false
    )

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      )
    } catch {
      // 이미 capture가 풀렸다면 무시
    }
  }

  useEffect(() => {
    if (
      focusedBlank === null ||
      typeof window === "undefined"
    ) {
      return
    }

    const frame =
      requestAnimationFrame(() => {
        const blankElement =
          document.querySelector<HTMLTextAreaElement>(
            `textarea[data-blank-input="${focusedBlank}"]`
          )

        if (!blankElement) {
          return
        }

        const rect =
          blankElement.getBoundingClientRect()

        const hintWidth = 400
        const gap = 10
        const padding = 12

        /*
         * 빈칸 가운데 기준으로 힌트 박스 배치
         */
        const rawX =
          rect.left +
          rect.width / 2 -
          hintWidth / 2

        /*
         * 좌우만 화면 안으로 보정
         */
        const x = Math.min(
          Math.max(
            padding,
            rawX
          ),
          window.innerWidth -
          hintWidth -
          padding
        )

        /*
         * 무조건 빈칸 아래
         */
        const y =
          rect.bottom + gap

        setHintPosition({
          x,
          y,
        })
      })

    return () => {
      cancelAnimationFrame(
        frame
      )
    }
  }, [focusedBlank])


  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async () => {
    if (!learningContent) return
    if (!hasAnyAnswer || isGrading) return

    setIsGrading(true)
    setGradeError(null)

    const submissionAnswers = Array.from(
      { length: blankCount },
      (_, idx0) => ({
        blankOrd: idx0 + 1,
        userAns: answers[idx0] ?? "",
        hintUsedLv: hintLevels[idx0] ?? 0,
      })
    )

    try {
      /* 1. 기존 채점 */
      const response = await submitLearning(
        learningContent.lrnId,
        {
          answers: submissionAnswers,
        }
      )

      const byIdx: Record<number, BlankResult> = {}

      for (const result of response.results) {
        byIdx[result.blankOrd - 1] = result
      }

      setResults(byIdx)

      setSummary({
        correctCount: response.correctCount,
        totalBlanks: response.totalBlanks,
        grade: response.grade,
        overallComment: response.overallComment,
      })

      console.log(
        "newlyUnlockedConceptIds",
        response.newlyUnlockedConceptIds
      )

      console.log(
        "optimized concepts",
        optimizedConcepts.map(c => ({
          id: c.id,
          title: c.title,
        }))
      )

      setLocalUnlockedConceptIds(
        previous =>
          Array.from(
            new Set([
              ...previous,
              ...(response.newlyUnlockedConceptIds ?? []),
            ])
          )
      )

      onGraded?.(
        learningContent.lrnId,
        response
      )

      /* 2. 모든 빈칸을 작성했을 때만 성능 분석 */
      if (allFilled) {
        setPerformanceError(null)
        setIsAnalyzingPerformance(true)

        void analyzeComplexity({
          originalCode: analyzedCode,

          optimizedCode:
            learningContent.optimizedCode.content,

          language:
            learningContent.optimizedCode.lang ?? "unknown",

          answers: submissionAnswers.map(answer => ({
            blankOrd: answer.blankOrd,
            userAns: answer.userAns,
          })),
        })
          .then(result => {
            const currentLrnId =
              learningContent.lrnId

            const fixedBase =
              basePerformance ?? {
                /*
                 * Original은 반드시 진단값
                 */
                originalComplexity:
                  learningContent
                    .originalComplexity ??
                  "O(?)",

                /*
                 * Optimized는 분석 결과 사용
                 *
                 * 정상적인 경우에는 최초 진입 분석으로
                 * basePerformance가 이미 존재함
                 */
                optimizedComplexity:
                  result.optimizedComplexity,
              }

            /*
             * Original / Optimized는 고정.
             * Submitted만 이번 분석 결과로 변경.
             */
            const nextPerformance:
              PerformanceComparison = {
              originalComplexity:
                fixedBase.originalComplexity,

              optimizedComplexity:
                fixedBase.optimizedComplexity,

              submittedComplexity:
                result.submittedComplexity,
            }

            setPerformanceComparison(
              nextPerformance
            )

            localStorage.setItem(
              `performance-${currentLrnId}`,
              JSON.stringify(
                nextPerformance
              )
            )
          })
          .catch((error: unknown) => {
            console.error(
              "Performance analysis failed:",
              error
            )

            setPerformanceError(
              error instanceof Error
                ? error.message
                : "성능 분석에 실패했습니다."
            )
          })
          .finally(() => {
            setIsAnalyzingPerformance(false)
          })
      } else {
        setPerformanceError(null)
        setIsAnalyzingPerformance(false)
      }

      /* 3. 채점 완료 후 힌트 상태 정리 */
      try {
        sessionStorage.removeItem(
          hintStorageKey(learningContent.lrnId)
        )
      } catch {
        // 저장소 오류가 나도 학습 진행에는 영향 없음
      }

      /* 4. 뱃지 체크 */
      try {
        const badgeResponse = await apiFetch(
          "/api/badges/check/learning",
          {
            method: "POST",
            body: JSON.stringify({
              isPerfect: response.allCorrect,
            }),
          }
        )

        if (badgeResponse.ok) {
          const allBadges = await badgeResponse.json()

          const newBadges = allBadges.filter(
            (badge: any) => badge.newlyAchieved
          )

          if (newBadges.length > 0) {
            onBadgesUnlocked?.(newBadges)
          }
        }
      } catch (badgeError) {
        console.warn(
          "뱃지 체크 실패",
          badgeError
        )
      }

      /* 5. 결과 알림 */
      if (response.allCorrect) {
        toast.success("✅ 모두 맞혔어요!", {
          description: response.grade
            ? `등급 ${response.grade}`
            : undefined,
        })
      } else {
        toast.info(
          `${response.correctCount}/${response.totalBlanks} 정답`,
          {
            description:
              "틀린 빈칸의 아이콘을 눌러 피드백을 확인해 보세요",
          }
        )
      }
    } catch (error: unknown) {
      console.error(
        "채점 실패:",
        error
      )

      const message =
        error instanceof Error
          ? error.message
          : "채점에 실패했어요."

      setGradeError(message)

      toast.error(
        "채점하지 못했어요",
        {
          description: message,
        }
      )
    } finally {
      setIsGrading(false)
    }
  }
  /* =========================================================
     RETRY
  ========================================================= */

  const handleRetry = () => {
    setResults(null)
    setSummary(null)
    setGradeError(null)

    setPerformanceError(
      null
    )

    setIsAnalyzingPerformance(
      false
    )

    /*
     * answers와 hint는 유지
     * → 틀린 문제만 수정 가능
     */
  }

  const resizeBlankInput = (
    element: HTMLTextAreaElement
  ) => {
    /*
     * 실제 콘텐츠 폭을 다시 계산하기 위해
     * 최소 크기로 잠시 초기화
     */
    element.style.width = "6em"
    element.style.height = "auto"

    /*
     * 빈칸이 코드 패널 전체를 밀지 않도록
     * 최대 너비를 320px로 제한
     */
    const nextWidth = Math.min(
      Math.max(
        element.scrollWidth + 6,
        96
      ),
      320
    )

    element.style.width =
      `${nextWidth}px`

    /*
     * 여러 줄 입력은 기존처럼
     * 높이를 자동으로 확장
     */
    element.style.height =
      `${element.scrollHeight}px`
  }

  useEffect(() => {
    const frame =
      requestAnimationFrame(() => {
        const elements =
          document.querySelectorAll<HTMLTextAreaElement>(
            "[data-blank-input]"
          )

        elements.forEach(
          element => {
            resizeBlankInput(
              element
            )
          }
        )
      })

    return () => {
      cancelAnimationFrame(
        frame
      )
    }
  }, [answers])

  /* =========================================================
     INPUT STYLE
  ========================================================= */

  const inputClass = (
    idx0: number
  ) => {
    const base =
      "bg-card rounded px-2 py-0.5 text-[12px] font-code focus:outline-none transition-colors resize-none overflow-x-auto overflow-y-hidden align-middle whitespace-pre"

    if (!isGraded) {
      return `${base} border border-emerald-500/50 focus:border-emerald-400 text-emerald-300`
    }

    const result =
      results?.[idx0]

    if (!result) {
      return `${base} border border-border text-muted-foreground`
    }

    /*
     * 나중에 풀기
     */
    if (
      !result.userAns?.trim()
    ) {
      return `${base} border-2 border-amber-500/50 text-muted-foreground cursor-default`
    }

    /*
     * 완전 정답
     */
    if (
      result.grdMethod ===
      "S"
    ) {
      return `${base} border-2 border-emerald-500 text-emerald-300 cursor-default`
    }

    /*
     * AI 정답
     */
    if (
      result.grdMethod ===
      "A"
    ) {
      return `${base} border-2 border-amber-500 text-amber-300 cursor-default`
    }

    /*
     * 오답
     */
    return `${base} border-2 border-rose-500 text-rose-300 cursor-default`
  }

  /* =========================================================
     LIVE COACHING BAR
  ========================================================= */

  const renderHintBar = (
    idx0: number
  ) => {
    if (
      isGraded ||
      pace === "off" ||
      focusedBlank !==
      idx0 ||
      !hintPosition
    ) {
      return null
    }

    const level =
      hintLevels[idx0] ??
      0

    const contents =
      hintContents[idx0] ??
      {}

    const viewLevel =
      hintViewLevel[
      idx0
      ] ?? level

    const elapsed =
      hintElapsed[idx0] ??
      0

    const isRunning =
      runningBlank ===
      idx0

    let etaSec:
      number | null =
      null

    if (level < 3) {
      const nextThreshold =
        (level + 1) *
        PACE_INTERVALS_MS[
        pace
        ]

      etaSec =
        Math.max(
          0,
          Math.ceil(
            (
              nextThreshold -
              elapsed
            ) / 1000
          )
        )
    }

    const levelMeta:
      Record<
        number,
        {
          tag: string
          label: string
        }
      > = {
      1: {
        tag: "Lv.1",
        label: "개념",
      },

      2: {
        tag: "Lv.2",
        label: "설명",
      },

      3: {
        tag: "Lv.3",
        label: "부분 정답",
      },
    }

    return (
      <div
        ref={
          hintBoxRef
        }
        className={`fixed z-[100] w-[400px] max-w-[calc(100vw-24px)] rounded-xl bg-card border border-border overflow-hidden ${isDraggingHint
          ? "select-none"
          : ""
          }`}
        style={{
          left:
            hintPosition.x,

          top:
            hintPosition.y,

          boxShadow:
            "0 16px 45px rgba(0,0,0,0.5)",
        }}
      >
        {/* =====================================================
          DRAG HEADER
      ===================================================== */}

        <div
          onPointerDown={
            handleHintDragStart
          }
          onPointerMove={
            handleHintDragMove
          }
          onPointerUp={
            handleHintDragEnd
          }
          onPointerCancel={
            handleHintDragEnd
          }
          className={`flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.03] touch-none ${isDraggingHint
            ? "cursor-grabbing"
            : "cursor-grab"
            }`}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />

            <span
              className="font-ko text-[10px] font-bold tracking-widest"
              style={{
                color: BRAND,
              }}
            >
              LIVE COACHING
            </span>

            <span className="font-ko text-[10px] text-muted-foreground">
              ·
            </span>

            <span className="font-ko text-[10px] text-muted-foreground">
              빈칸 #{idx0 + 1}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {level < 3 && (
              <button
                type="button"
                onClick={() =>
                  togglePlay(
                    idx0
                  )
                }
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                title={
                  isRunning
                    ? "일시정지"
                    : "재생"
                }
              >
                {isRunning ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}

                {etaSec !==
                  null && (
                    <span className="font-ko text-[10px] text-foreground/80 font-bold">
                      {etaSec}s
                    </span>
                  )}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setFocusedBlank(
                  null
                )

                setRunningBlank(
                  null
                )
              }}
              className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              title="힌트 닫기"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* =====================================================
          BODY
      ===================================================== */}

        <div className="px-4 py-3.5 min-h-[72px]">
          {level === 0 ? (
            <div className="flex items-center gap-2">
              <Loader2
                className="h-3.5 w-3.5 animate-spin shrink-0"
                style={{
                  color: BRAND,
                }}
              />

              <p className="font-ko text-[11px] text-muted-foreground">
                잠시 후 첫 힌트가 나와요...
              </p>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="font-ko text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{
                    background:
                      `${BRAND}1a`,

                    color:
                      BRAND,
                  }}
                >
                  {
                    levelMeta[
                      viewLevel
                    ]?.tag
                  }
                </span>

                <span className="font-ko text-[10px] text-muted-foreground">
                  {
                    levelMeta[
                      viewLevel
                    ]?.label
                  }
                </span>
              </div>

              {viewLevel ===
                3 ? (
                <code className="font-code text-[12px] text-amber-300 block bg-background/60 rounded px-2.5 py-2 whitespace-pre-wrap break-words">
                  {
                    contents[
                    3
                    ]
                  }
                </code>
              ) : (
                <p className="font-ko text-[12px] text-foreground leading-relaxed whitespace-pre-wrap">
                  {
                    contents[
                    viewLevel
                    ]
                  }
                </p>
              )}
            </div>
          )}
        </div>

        {/* =====================================================
          LEVEL CAROUSEL
      ===================================================== */}

        {level >= 1 && (
          <div className="flex items-center justify-center gap-4 px-4 py-2 border-t border-white/5 bg-white/[0.02]">
            <button
              type="button"
              onClick={() =>
                setHintViewLevel(
                  previous => ({
                    ...previous,

                    [idx0]:
                      Math.max(
                        1,
                        viewLevel - 1
                      ),
                  })
                )
              }
              disabled={
                viewLevel <= 1
              }
              className="text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map(
                levelNumber => (
                  <span
                    key={
                      levelNumber
                    }
                    className="h-1.5 rounded-full transition-all duration-200"
                    style={{
                      width:
                        levelNumber ===
                          viewLevel
                          ? 14
                          : 6,

                      background:
                        levelNumber ===
                          viewLevel
                          ? BRAND
                          : levelNumber <=
                            level
                            ? "var(--muted-foreground)"
                            : "var(--border)",
                    }}
                  />
                )
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setHintViewLevel(
                  previous => ({
                    ...previous,

                    [idx0]:
                      Math.min(
                        level,
                        viewLevel + 1
                      ),
                  })
                )
              }
              disabled={
                viewLevel >= level
              }
              className="text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    )
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex h-full overflow-hidden">
      {/* =====================================================
          LEFT PANEL
      ===================================================== */}

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${panelOpen
          ? "w-[clamp(280px,22vw,350px)]"
          : "w-0"
          }`}
      >
        <div className="w-[clamp(280px,22vw,350px)] h-full overflow-auto bg-card">
          <div className="p-5 space-y-6">
            {/* Back */}
            <button
              onClick={
                onBack
              }
              className="font-ko text-[11px] text-muted-foreground hover:text-foreground/80 transition-colors flex items-center gap-2"
            >
              ← Back to
              Archive
            </button>

            {/* Learning Header */}
            <div>
              <p
                className="font-ko text-[10px] tracking-widest mb-1.5"
                style={{
                  color: BRAND,
                }}
              >
                // LEARNING
              </p>

              {editingTitle ? (
                <input
                  autoFocus
                  value={
                    titleDraft
                  }
                  onChange={
                    event =>
                      setTitleDraft(
                        event
                          .target
                          .value
                      )
                  }
                  onBlur={
                    handleTitleSave
                  }
                  onKeyDown={
                    event => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        event.preventDefault()
                        void handleTitleSave()
                      }

                      if (
                        event.key ===
                        "Escape"
                      ) {
                        event.preventDefault()

                        setTitleDraft(
                          displayTitle
                        )

                        setEditingTitle(
                          false
                        )
                      }
                    }
                  }
                  disabled={
                    savingTitle
                  }
                  className="font-syne text-2xl font-bold text-foreground leading-tight bg-transparent border-b border-white/20 focus:border-[#63C1ED] outline-none w-full"
                />
              ) : (
                <h2
                  className="font-syne text-2xl font-bold text-foreground leading-tight group flex items-center gap-2 cursor-text"
                  onClick={() =>
                    setEditingTitle(
                      true
                    )
                  }
                  title="클릭해서 이름 변경"
                >
                  {
                    displayTitle
                  }

                  <Pencil className="h-3.5 w-3.5 text-muted-foreground group-hover:text-muted-foreground transition-colors shrink-0" />
                </h2>
              )}

              <div className="flex items-center gap-2 mt-2">
                <span className="font-ko text-[11px] text-muted-foreground">
                  {
                    session.date
                  }
                </span>

                <span className="font-ko text-[10px] px-2 py-0.5 rounded bg-white/5 border border-border text-foreground/80">
                  {
                    session.grade
                  }
                </span>
              </div>
            </div>

            {/* =================================================
                1. PERFORMANCE COMPARISON
            ================================================= */}

            <Card className="bg-card border-white/5">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="font-syne text-sm font-bold text-foreground flex items-center gap-2">
                  <TrendingUp
                    className="h-4 w-4"
                    style={{
                      color: BRAND,
                    }}
                  />

                  Performance Comparison
                </CardTitle>
              </CardHeader>

              <CardContent className="px-5 pb-5">
                {/* 제출 전 안내 */}
                {!allFilled &&
                  !performanceComparison &&
                  !isAnalyzingPerformance && (
                    <div className="py-2 mb-2">
                      <p className="font-ko text-[10px] text-muted-foreground leading-relaxed">
                        모든 빈칸을 완성하고 제출하면 내 코드의
                        시간복잡도도 함께 비교할 수 있어요.
                      </p>
                    </div>
                  )}

                {/* 제출 코드 분석 중 */}
                {isAnalyzingPerformance && (
                  <div className="mb-4 rounded-md border border-border bg-muted/30 px-3 py-2 flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin shrink-0" />

                    <p className="font-ko text-[11px] text-muted-foreground">
                      제출한 코드의 시간복잡도를 분석하고 있어요...
                    </p>
                  </div>
                )}

                {/* 항상 표시되는 3개 카드 */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {/* ORIGINAL */}
                  <div className="rounded-md border border-border p-2">
                    <p className="font-ko text-[9px] text-muted-foreground mb-1">
                      ORIGINAL
                    </p>

                    <p className="font-code text-[12px] font-bold">
                      {basePerformance?.originalComplexity ??
                        learningContent?.originalComplexity ??
                        "-"}
                    </p>
                  </div>

                  {/* AI OPTIMIZED */}
                  <div className="rounded-md border border-border p-2">
                    <p className="font-ko text-[9px] text-muted-foreground mb-1">
                      AI OPTIMIZED
                    </p>

                    <p className="font-code text-[12px] font-bold">
                      {basePerformance?.optimizedComplexity ??
                        (isAnalyzingBasePerformance ? "..." : "-")}
                    </p>
                  </div>

                  {/* MY SUBMISSION */}
                  <div
                    className="rounded-md border p-2"
                    style={{
                      borderColor: `${BRAND}50`,
                      background: `${BRAND}08`,
                    }}
                  >
                    <p className="font-ko text-[9px] text-muted-foreground mb-1">
                      MY SUBMISSION
                    </p>

                    <p
                      className="font-code text-[12px] font-bold"
                      style={{
                        color: performanceComparison
                          ? BRAND
                          : "var(--muted-foreground)",
                      }}
                    >
                      {performanceComparison?.submittedComplexity ?? "-"}
                    </p>
                  </div>
                </div>

                {performanceError && (
                  <p className="font-ko text-[10px] text-rose-400 mb-3">
                    {performanceError}
                  </p>
                )}

                {/* 그래프 */}
                <div className="h-48 mt-2">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <ComposedChart
                      data={complexityComparisonData}
                      margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 5,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="originalGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#f43f5e"
                            stopOpacity={0.15}
                          />

                          <stop
                            offset="95%"
                            stopColor="#f43f5e"
                            stopOpacity={0.02}
                          />
                        </linearGradient>

                        <linearGradient
                          id="optimizedGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={BRAND}
                            stopOpacity={0.15}
                          />

                          <stop
                            offset="95%"
                            stopColor={BRAND}
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        opacity={0.4}
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        stroke="var(--muted-foreground)"
                        tick={{
                          fill: "var(--muted-foreground)",
                          fontSize: 10,
                          fontFamily: "Space Mono",
                        }}
                        tickLine={false}
                        axisLine={false}
                      />

                      <YAxis
                        stroke="var(--muted-foreground)"
                        tick={{
                          fill: "var(--muted-foreground)",
                          fontSize: 10,
                          fontFamily: "Space Mono",
                        }}
                        tickLine={false}
                        axisLine={false}
                        width={45}
                      />

                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          fontSize: "11px",
                        }}
                        labelStyle={{
                          color: "var(--muted-foreground)",
                          fontFamily: "Space Mono",
                          marginBottom: "4px",
                        }}
                      />

                      <Legend
                        wrapperStyle={{
                          fontSize: "11px",
                          fontFamily: "Space Mono",
                          paddingTop: "10px",
                        }}
                        iconType="circle"
                        formatter={value => {
                          const labels: Record<string, string> = {
                            original: "Original",
                            optimized: "AI Optimized",
                            submitted: "My Submission",
                          }

                          return (
                            <span
                              style={{
                                color: "var(--muted-foreground)",
                              }}
                            >
                              {labels[value] ?? value}
                            </span>
                          )
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="original"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        fill="url(#originalGrad)"
                        dot={{
                          fill: "var(--card)",
                          stroke: "#f43f5e",
                          strokeWidth: 2,
                          r: 3,
                        }}
                        name="original"
                      />

                      <Area
                        type="monotone"
                        dataKey="optimized"
                        stroke={BRAND}
                        strokeWidth={2.5}
                        fill="url(#optimizedGrad)"
                        dot={{
                          fill: "var(--card)",
                          stroke: BRAND,
                          strokeWidth: 2,
                          r: 4,
                        }}
                        name="optimized"
                      />

                      {performanceComparison?.submittedComplexity && (
                        <Line
                          type="monotone"
                          dataKey="submitted"
                          stroke="#a78bfa"
                          strokeWidth={3}
                          dot={{
                            fill: "var(--card)",
                            stroke: "#a78bfa",
                            strokeWidth: 2,
                            r: 4,
                          }}
                          activeDot={{
                            r: 5,
                          }}
                          name="submitted"
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* =================================================
                2. OPTIMIZED CONCEPTS
            ================================================= */}

            <Card
              className="border-white/5"
              style={{
                background:
                  `${BRAND}08`,

                borderColor:
                  `${BRAND}20`,
              }}
            >
              <CardContent className="p-5">
                <p
                  className="font-ko text-[10px] tracking-widest mb-3"
                  style={{
                    color:
                      BRAND,
                  }}
                >
                  // OPTIMIZED
                  CONCEPTS
                </p>

                <p className="font-ko text-xs text-muted-foreground mb-4 leading-relaxed">
                  아래 개념을
                  사용하면 코드를
                  최적화할 수
                  있어요.
                </p>

                {optimizedConcepts.length ===
                  0 ? (
                  <p className="font-ko text-xs text-muted-foreground italic">
                    개념 정보가
                    없습니다.
                  </p>
                ) : (
                  optimizedConcepts.map(
                    (
                      concept,
                      index
                    ) => {
                      const isUnlocked =
                        concept.id !=
                        null &&
                        unlockedConceptIds.has(
                          concept.id
                        )

                      if (
                        isUnlocked
                      ) {
                        return (
                          <div
                            key={
                              concept.id ??
                              index
                            }
                            className="mb-4 last:mb-0"
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <div
                                className="h-1.5 w-1.5 rounded-full shrink-0"
                                style={{
                                  background:
                                    BRAND,
                                }}
                              />

                              <span className="font-ko text-[13px] text-foreground font-bold">
                                {
                                  concept.title
                                }
                              </span>
                            </div>

                            <p className="font-ko text-xs text-muted-foreground leading-relaxed pl-3.5">
                              {
                                concept.description
                              }
                            </p>

                            {concept.referenceUrl && (
                              <a
                                href={
                                  concept.referenceUrl
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-ko text-[11px] hover:underline pl-3.5 mt-1.5 inline-flex items-center gap-1"
                                style={{
                                  color:
                                    BRAND,
                                }}
                              >
                                참고 링크

                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            )}
                          </div>
                        )
                      }

                      return (
                        <div
                          key={
                            concept.id ??
                            index
                          }
                          className="mb-4 last:mb-0"
                        >
                          <div className="relative rounded-lg overflow-hidden bg-background/40 border border-border/50">
                            <div className="p-3 blur-[6px] select-none pointer-events-none opacity-70">
                              <div className="flex items-center gap-2 mb-1.5">
                                <div
                                  className="h-1.5 w-1.5 rounded-full shrink-0"
                                  style={{
                                    background:
                                      BRAND,
                                  }}
                                />

                                <span className="font-ko text-[13px] text-foreground font-bold">
                                  {
                                    concept.title
                                  }
                                </span>
                              </div>

                              <p className="font-ko text-xs text-muted-foreground leading-relaxed">
                                {
                                  concept.description
                                }
                              </p>
                            </div>

                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-background/60 backdrop-blur-[2px]">
                              <div className="h-8 w-8 rounded-full bg-card border border-border/70 flex items-center justify-center shadow-sm">
                                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>

                              <p className="font-ko text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
                                연결된
                                빈칸을
                                정답으로
                                채우면
                                <br />
                                개념이
                                공개돼요
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  )
                )}
              </CardContent>
            </Card>

            {/* =================================================
                3. ORIGINAL CONCEPTS
                → 항상 공개
            ================================================= */}

            <Card className="bg-card border-white/5">
              <CardContent className="p-5">
                <p className="font-ko text-[10px] tracking-widest mb-3 text-rose-400">
                  // ORIGINAL
                  CONCEPTS
                </p>

                <p className="font-ko text-xs text-muted-foreground mb-4 leading-relaxed">
                  {userName}님이
                  작성한 코드에는
                  아래 패턴이
                  들어가 있어요.
                </p>

                {originalConcepts.length ===
                  0 ? (
                  <p className="font-ko text-xs text-muted-foreground italic">
                    개념 정보가
                    없습니다.
                  </p>
                ) : (
                  originalConcepts.map(
                    (
                      concept,
                      index
                    ) => (
                      <div
                        key={
                          concept.id ??
                          index
                        }
                        className="mb-4 last:mb-0"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />

                          <span className="font-ko text-[13px] text-foreground font-bold">
                            {
                              concept.title
                            }
                          </span>
                        </div>

                        <p className="font-ko text-xs text-muted-foreground leading-relaxed pl-3.5">
                          {
                            concept.description
                          }
                        </p>

                        {concept.referenceUrl && (
                          <a
                            href={
                              concept.referenceUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-ko text-[11px] text-rose-400/80 hover:text-rose-300 underline pl-3.5 mt-1.5 inline-flex items-center gap-1"
                          >
                            참고 링크

                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    )
                  )
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* =====================================================
          PANEL TOGGLE
      ===================================================== */}

      <div className="w-px bg-muted relative flex items-center justify-center shrink-0">
        <button
          onClick={() =>
            setPanelOpen(
              previous =>
                !previous
            )
          }
          className="absolute z-10 w-5 h-10 bg-card hover:bg-accent border border-border rounded-md flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
        >
          {panelOpen
            ? "‹"
            : "›"}
        </button>
      </div>

      {/* =====================================================
          CODE AREA
      ===================================================== */}

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-background">
        <div className="flex-1 min-w-0 flex overflow-hidden">
          {/* =================================================
              ORIGINAL CODE
          ================================================= */}

          <div className="basis-1/2 flex-1 min-w-0 flex flex-col border-r border-border/50">
            <div className="px-5 py-3 border-b border-border/50 bg-background">
              <span className="font-ko text-xs font-bold text-foreground/80">
                Original code
              </span>
            </div>

            <div className="flex-1 min-w-0 overflow-auto font-code text-[13px] leading-7 py-3">
              {originalLines.length ===
                0 ||
                (
                  originalLines.length ===
                  1 &&
                  originalLines[0] ===
                  ""
                ) ? (
                <p className="px-5 text-muted-foreground text-xs italic">
                  원본 코드가
                  없습니다.
                </p>
              ) : (
                originalLines.map(
                  (
                    line,
                    index
                  ) => (
                    <div
                      key={index}
                      className="flex px-2 w-max min-w-full"
                    >
                      <div className="w-10 text-right pr-4 select-none text-muted-foreground">
                        {
                          index +
                          1
                        }
                      </div>

                      <div className="flex-1 whitespace-pre text-foreground/80">
                        {
                          highlightLine(
                            line
                          )
                        }
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>

          {/* =================================================
              FILL IN THE BLANKS
          ================================================= */}

          <div className="basis-1/2 flex-1 min-w-0 flex flex-col">
            <div className="px-5 py-3 border-b border-border/50 bg-background flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="font-ko text-xs font-bold"
                  style={{
                    color:
                      BRAND,
                  }}
                >
                  Fill in the
                  blanks (
                  {
                    filledCount
                  }
                  /
                  {
                    blankCount
                  }
                  )
                </span>

                {!isGraded &&
                  (
                    draftSaving ||
                    draftSavedAt
                  ) && (
                    <span className="flex items-center gap-1 font-ko text-[10px] text-muted-foreground">
                      {draftSaving ? (
                        <>
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                          저장
                          중...
                        </>
                      ) : (
                        <>
                          <Check className="h-2.5 w-2.5 text-emerald-500/70" />

                          {draftSavedAt!.toLocaleTimeString(
                            "ko-KR",
                            {
                              hour:
                                "2-digit",
                              minute:
                                "2-digit",
                              second:
                                "2-digit",
                            }
                          )}{" "}
                          저장됨
                        </>
                      )}
                    </span>
                  )}
              </div>

              {isGraded &&
                summary ? (
                <span
                  className={`font-ko text-[10px] px-2 py-0.5 rounded border ${summary.correctCount ===
                    summary.totalBlanks
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/40 text-rose-400"
                    }`}
                >
                  {
                    summary.correctCount
                  }
                  /
                  {
                    summary.totalBlanks
                  }{" "}
                  정답

                  {summary.grade &&
                    ` · ${summary.grade}`}
                </span>
              ) : (
                blankCount >
                0 &&
                pace !==
                "off" && (
                  <span
                    className="flex items-center gap-1.5 font-ko text-[10px] font-bold tracking-wide"
                    style={{
                      color:
                        BRAND,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background:
                          BRAND,

                        boxShadow:
                          `0 0 6px ${BRAND}`,
                      }}
                    />

                    LIVE COACHING
                    ON
                  </span>
                )
              )}
            </div>

            {/* CODE */}
            <div className="flex-1 min-w-0 overflow-auto font-code text-[13px] leading-7 py-3">
              {parsedLines.length ===
                0 ||
                blankCode === "" ? (
                <p className="px-5 text-muted-foreground text-xs italic">
                  빈칸 코드가
                  없습니다.
                </p>
              ) : (
                parsedLines.map(
                  (
                    line,
                    index
                  ) => {
                    return (
                      <Fragment
                        key={
                          index
                        }
                      >
                        <div
                          className={`flex px-2 w-max min-w-full ${line.hasBlank
                            ? "bg-emerald-500/10 border-l-2 border-emerald-500/60"
                            : "border-l-2 border-transparent"
                            }`}
                        >
                          <div className="w-10 text-right pr-4 select-none text-muted-foreground">
                            {
                              line.lineNo
                            }
                          </div>

                          <div className="flex-1 whitespace-pre text-foreground/80 flex items-center flex-nowrap min-w-max">                            {line.tokens.map(
                            (
                              token,
                              tokenIndex
                            ) => {
                              if (
                                token.type ===
                                "text"
                              ) {
                                return (
                                  <span
                                    key={
                                      tokenIndex
                                    }
                                  >
                                    {
                                      highlightLine(
                                        token.value
                                      )
                                    }
                                  </span>
                                )
                              }

                              const idx0 =
                                token.blankIdx!

                              const result =
                                isGraded
                                  ? results?.[
                                  idx0
                                  ] ??
                                  null
                                  : null

                              return (
                                <span
                                  key={
                                    tokenIndex
                                  }
                                  className="inline-flex items-center gap-1 mx-0.5 align-middle"
                                >
                                  <textarea
                                    data-blank-input={idx0}
                                    rows={1}
                                    wrap="off"

                                    value={
                                      answers[idx0] ?? ""
                                    }

                                    onChange={event => {
                                      const value =
                                        event.target.value

                                      setAnswers(previous => ({
                                        ...previous,
                                        [idx0]: value,
                                      }))

                                      resizeBlankInput(
                                        event.currentTarget
                                      )
                                    }}

                                    onFocus={() =>
                                      handleBlankFocus(idx0)
                                    }

                                    readOnly={
                                      isGraded ||
                                      isGrading
                                    }

                                    placeholder={`#${idx0 + 1}`}

                                    className={
                                      inputClass(idx0)
                                    }

                                    style={{
                                      width: "6em",
                                      minWidth: "6em",
                                      maxWidth: "320px",
                                    }}
                                  />

                                  {result &&
                                    result.userAns?.trim() && (
                                      <ResultPopover
                                        result={
                                          result
                                        }
                                      />
                                    )}
                                </span>
                              )
                            }
                          )}
                          </div>
                        </div>
                      </Fragment>
                    )
                  }
                )
              )}
            </div>

            {/* =================================================
                AI COMMENT
            ================================================= */}

            {isGraded &&
              summary?.overallComment && (
                <div className="border-t border-border/50 bg-background px-5 py-4">
                  <div className="flex items-start gap-2.5">
                    <Sparkles
                      className="h-4 w-4 shrink-0 mt-0.5"
                      style={{
                        color:
                          BRAND,
                      }}
                    />

                    <div className="min-w-0">
                      <p
                        className="font-ko text-[10px] tracking-widest mb-1.5"
                        style={{
                          color:
                            BRAND,
                        }}
                      >
                        // AI
                        COMMENT
                      </p>

                      <p className="font-ko text-[12px] text-foreground/80 leading-relaxed">
                        {
                          summary.overallComment
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* =================================================
                SUBMIT FOOTER
            ================================================= */}

            {blankCount > 0 && (
              <div className="border-t border-border/50 bg-background px-5 py-3 flex items-center justify-between">
                <span className="font-ko text-[11px] text-muted-foreground">
                  {gradeError ? (
                    <span className="text-rose-400">
                      {
                        gradeError
                      }
                    </span>
                  ) : isGrading ? (
                    "채점 중이에요..."
                  ) : isGraded &&
                    summary ? (
                    summary.correctCount ===
                      summary.totalBlanks ? (
                      "모두 맞혔어요! 🎉"
                    ) : (
                      `${summary.totalBlanks - summary.correctCount}개 틀렸어요`
                    )
                  ) : allFilled ? (
                    "모든 빈칸을 채웠어요"
                  ) : hasAnyAnswer ? (
                    `${blankCount - filledCount}개는 나중에 풀 수 있어요`
                  ) : (
                    "하나 이상의 빈칸을 풀어보세요"
                  )}
                </span>

                {isGraded ? (
                  <button
                    onClick={
                      handleRetry
                    }
                    className="h-8 px-4 rounded font-ko text-xs font-bold flex items-center gap-1.5 bg-muted hover:bg-accent text-foreground transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />

                    {summary?.correctCount ===
                      summary?.totalBlanks
                      ? "다시 풀기"
                      : "남은 문제 풀기"}
                  </button>
                ) : (
                  <button
                    onClick={
                      handleSubmit
                    }
                    disabled={
                      !hasAnyAnswer ||
                      isGrading
                    }
                    className={`h-8 px-4 rounded font-ko text-xs font-bold flex items-center gap-1.5 transition-colors ${hasAnyAnswer &&
                      !isGrading
                      ? "bg-emerald-500 hover:bg-emerald-600 text-foreground"
                      : "bg-emerald-500/20 text-emerald-500/40 cursor-not-allowed"
                      }`}
                  >
                    {isGrading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        채점 중...
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Submit
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {
        focusedBlank !== null &&
        renderHintBar(
          focusedBlank
        )
      }
    </div >
  )
}