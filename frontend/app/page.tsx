// app/page.tsx (그냥 그대로 복사)

/**
 * app/page.tsx  — HiVibe 홈 랜딩 페이지
 *
 * 폰트:
 *   Syne (라틴 타이틀)    → font-syne
 *   Pretendard (한글 본문) → font-pretendard  (font-sans override)
 *   Space Mono (코드/배지) → font-ko
 *
 * layout.tsx에 아래 추가 필요:
 *   import localFont from "next/font/local"
 *   const pretendard = localFont({
 *     src: "../public/fonts/PretendardVariable.woff2",
 *     variable: "--font-pretendard",
 *   })
 *   또는 CDN:
 *   <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css" />
 *
 * globals.css에 추가:
 *   @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
 *   .font-syne  { font-family: 'Syne', sans-serif; }
 *   .font-ko { font-family: 'Space Mono', monospace; }
 *   body { font-family: 'Pretendard Variable', 'Pretendard', sans-serif; }
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  ArrowRight,
  Zap,
  BookOpen,
  BarChart3,
  Shield,
  ChevronRight,
  Star,
  Github,
  Twitter,
  Check,
  Code2,
  Brain,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";
import Prism from "prismjs";
import "prismjs/components/prism-java";

const BRAND = "#63C1ED";

/* ── mock 코드 (실제 Prism 하이라이팅용 단일 문자열) ── */
const ORIGINAL_CODE = `public int[] twoSum(int[] nums, int t) {
    for (int i = 0; i < n; i++) {
        for (int j = i+1; j < n; j++) {
            if (nums[i]+nums[j] == t)
                return new int[]{i, j};
        }
    }
    return new int[]{};
}`;

// 버그/비효율 구간으로 강조할 줄 번호 (0-indexed)
const ORIGINAL_HIGHLIGHT = [2, 3, 4, 5, 6];

const OPTIMIZED_CODE = `public int[] twoSum(int[] nums, int t) {
    Map<Integer,Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int c = t - nums[i];
        if (map.containsKey(c))
            return new int[]{map.get(c), i};
        map.put(nums[i], i);
    }
    return new int[]{};
}`;

// 개선된 구간으로 강조할 줄 번호 (0-indexed)
const OPTIMIZED_HIGHLIGHT = [1, 2, 3, 4, 5, 6];

/* ── 실제 문법 강조 + 줄별 하이라이트 배경을 같이 적용하는 미니 코드 블록 ── */
function MiniCodeBlock({
  code,
  highlightLines,
  accent,
}: {
  code: string;
  highlightLines: number[];
  accent: "rose" | "brand";
}) {
  const highlightSet = new Set(highlightLines);
  const bg = accent === "rose" ? "rgba(244,63,94,0.07)" : `${BRAND}08`;
  const borderColor = accent === "rose" ? "rgba(244,63,94,0.5)" : `${BRAND}66`;

  return (
    <Highlight prism={Prism as any} theme={themes.vsDark} code={code} language="java">
      {({ tokens, getLineProps, getTokenProps }) => (
        <>
          {tokens.map((line, i) => {
            const isHi = highlightSet.has(i);
            return (
              <div
                key={i}
                {...getLineProps({ line })}
                className="leading-5 whitespace-pre-wrap"
                style={
                  isHi
                    ? {
                      background: bg,
                      borderLeft: `2px solid ${borderColor}`,
                      paddingLeft: "6px",
                      marginLeft: "-6px",
                    }
                    : { paddingLeft: "6px" }
                }
              >
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            );
          })}
        </>
      )}
    </Highlight>
  );
}

const FEATURES = [
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Instant Diagnosis",
    en: "Instant Diagnosis",
    desc: "코드를 붙여넣는 순간, 복잡도·버그·스타일 문제까지 한눈에 진단해 드려요.",
    badge: "O(n²) → O(n)",
    badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  },
  {
    icon: <Brain className="h-5 w-5" />,
    title: "AI Learning",
    en: "AI Learning",
    desc: "단순 정답이 아니라, 왜 더 좋은지 개념부터 설명해 줘요.",
    badge: "Concept First",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: "My Archive",
    en: "My Archive",
    desc: "분석한 코드를 아카이브로 저장하고, 3일 후 복습 알림을 받아요.",
    badge: "Spaced Repetition",
    badgeColor: "border-zinc-700 text-zinc-400 bg-zinc-800/50",
  },
];

const STEPS = [
  {
    num: "01",
    title: "코드 붙여넣기",
    desc: "어떤 언어든 OK. Java, Python, C++, JavaScript 모두 지원해요.",
  },
  {
    num: "02",
    title: "AI 진단 받기",
    desc: "복잡도, 버그, 스타일까지 점수로 확인해요. 어디서 막히는지 바로 보여요.",
  },
  {
    num: "03",
    title: "개념 학습하기",
    desc: "최적화 코드와 원본을 비교하며, 어떤 개념을 적용해야 하는지 배워요.",
  },
  {
    num: "04",
    title: "아카이브에 저장",
    desc: "학습한 내용을 저장하고, 스페이스드 리피티션으로 복습해요.",
  },
];

export default function HomePage() {
  const [visible, setVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (token) setIsLoggedIn(true)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);


  return (
    <>
      <style>{`
        .font-syne  { font-family: 'Syne', sans-serif; }
        .font-ko { font-family: 'Space Mono', monospace; }
        .font-ko    { font-family: 'Pretendard Variable', 'Pretendard', -apple-system, sans-serif; }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 #63C1ED33; }
          50%       { box-shadow: 0 0 0 12px transparent; }
        }
        @keyframes scan {
          0%   { top: 0; }
          100% { top: 100%; }
        }
        .anim-0 { animation: fade-up .6s ease both .1s; }
        .anim-1 { animation: fade-up .6s ease both .25s; }
        .anim-2 { animation: fade-up .6s ease both .4s; }
        .anim-3 { animation: fade-up .6s ease both .55s; }
        .anim-4 { animation: fade-up .6s ease both .7s; }
        .glow-btn { animation: pulse-glow 2.5s infinite; }

        .grid-bg {
          background-image:
            linear-gradient(rgba(99,193,237,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,193,237,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 256px;
          pointer-events: none;
        }
        .scan-line {
          position: absolute; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #63C1ED55, transparent);
          animation: scan 3s linear infinite;
        }
      `}</style>

      <div className="font-ko min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden">
        {/* ── NAV ── */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <span
              className="font-syne text-lg font-bold"
              style={{ color: BRAND }}
            >
              HiVibe
            </span>
            <div className="flex items-center gap-6">
              <Link
                href="#features"
                className="font-ko text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Feature
              </Link>
              <Link
                href="#how"
                className="font-ko text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                How it works
              </Link>
              <Link href={isLoggedIn ? "/main" : "/login"} className="font-ko text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                {isLoggedIn ? "Dashboard" : "Log in"}
              </Link>
              <Link href={isLoggedIn ? "/main" : "/login"} className="font-ko text-sm px-4 py-1.5 rounded-full text-white font-semibold transition-all hover:opacity-90" style={{ background: BRAND }}>
                {isLoggedIn ? "Run Analysis" : "Get Started"}
              </Link>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center justify-center pt-14 overflow-hidden grid-bg">
          {/* noise overlay */}
          <div className="absolute inset-0 noise" />

          {/* radial glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-[600px] h-[600px] rounded-full opacity-10"
              style={{
                background: `radial-gradient(circle, ${BRAND} 0%, transparent 70%)`,
              }}
            />
          </div>

          <div className="relative max-w-6xl mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-16">
            {/* Left: copy */}
            <div className="flex-1 text-center lg:text-left max-w-xl">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6 ${visible ? "anim-0" : "opacity-0"}`}
                style={{ borderColor: `${BRAND}44`, background: `${BRAND}10` }}
              >
                <Sparkles className="h-3 w-3" style={{ color: BRAND }} />
                <span
                  className="font-ko text-[11px] tracking-wider"
                  style={{ color: BRAND }}
                >
                  AI-POWERED CODE MENTOR
                </span>
              </div>

              <h1
                className={`font-syne text-5xl lg:text-6xl font-bold leading-tight mb-6 ${visible ? "anim-1" : "opacity-0"}`}
              >
                Understand
                <br />
                <span
                  style={{
                    background: `linear-gradient(135deg, #fff 0%, ${BRAND} 60%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Your Code,
                </span>
                <br />
                Don't Just Run It.
              </h1>

              <p
                className={`font-ko text-base text-zinc-400 leading-relaxed mb-8 ${visible ? "anim-2" : "opacity-0"}`}
              >
                주니어 개발자를 위한 AI 코드 분석 도우미
                <br />
                복잡도를 시각화하고, 숨겨진 버그를 찾아내어
                <br />
                나만의 CS 지식 베이스를 쌓아 보세요
              </p>

              <div
                className={`flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start ${visible ? "anim-3" : "opacity-0"}`}
              >
                <Link
                  href={isLoggedIn ? "/main" : "/login"}
                  className="glow-btn flex items-center gap-2 px-6 py-3 rounded-full text-white font-ko font-semibold text-sm transition-all hover:scale-105"
                  style={{ background: BRAND }}
                >
                  {isLoggedIn ? "분석 시작하기" : "지금 분석 시작하기"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#how"
                  className="flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-800 text-zinc-300 font-ko text-sm hover:bg-zinc-900 transition-all"
                >
                  <Play className="h-3.5 w-3.5" />
                  어떻게 동작하나요?
                </Link>
              </div>

              {/* social proof */}
              <div
                className={`flex items-center gap-4 mt-8 justify-center lg:justify-start ${visible ? "anim-4" : "opacity-0"}`}
              >
                <div className="flex -space-x-2">
                  {["SH", "JH", "KM", "YR", "BJ"].map((n, i) => (
                    <div
                      key={i}
                      className="h-7 w-7 rounded-full border-2 border-zinc-950 flex items-center justify-center text-[9px] font-bold text-zinc-300"
                      style={{
                        background:
                          [
                            "#63C1ED",
                            "#f59e0b",
                            "#a78bfa",
                            "#6ee7b7",
                            "#f43f5e",
                          ][i] + "44",
                      }}
                    >
                      {n}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="font-ko text-[10px] text-zinc-500 mt-0.5">
                    2,400+ 개발자가 사용 중
                  </p>
                </div>
              </div>
            </div>

            {/* Right: code preview */}
            <div
              className={`flex-1 max-w-lg w-full ${visible ? "anim-2" : "opacity-0"}`}
            >
              <div className="relative">
                {/* before / after card */}
                <div className="rounded-2xl border border-zinc-800 bg-[#0d0d0d] overflow-hidden shadow-2xl shadow-black/60">
                  {/* window chrome */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="font-ko text-[10px] text-zinc-600">
                      Solution.java
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-ko text-[9px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/20">
                        O(n²)
                      </span>
                      <ArrowRight className="h-3 w-3 text-zinc-600" />
                      <span
                        className="font-ko text-[9px] px-1.5 py-0.5 rounded border"
                        style={{
                          background: `${BRAND}15`,
                          color: BRAND,
                          borderColor: `${BRAND}30`,
                        }}
                      >
                        O(n)
                      </span>
                    </div>
                  </div>

                  {/* split code view */}
                  <div className="flex text-[11px] font-code">
                    {/* original */}
                    <div className="flex-1 border-r border-zinc-800">
                      <div className="px-3 py-1.5 border-b border-zinc-800/50">
                        <span className="text-[9px] text-zinc-600 tracking-widest uppercase">
                          Original
                        </span>
                      </div>
                      <div className="p-3 space-y-0.5">
                        <MiniCodeBlock
                          code={ORIGINAL_CODE}
                          highlightLines={ORIGINAL_HIGHLIGHT}
                          accent="rose"
                        />
                      </div>
                    </div>

                    {/* optimized */}
                    <div className="flex-1">
                      <div className="px-3 py-1.5 border-b border-zinc-800/50">
                        <span
                          className="text-[9px] tracking-widest uppercase"
                          style={{ color: BRAND }}
                        >
                          Optimized
                        </span>
                      </div>
                      <div className="p-3 space-y-0.5">
                        <MiniCodeBlock
                          code={OPTIMIZED_CODE}
                          highlightLines={OPTIMIZED_HIGHLIGHT}
                          accent="brand"
                        />
                      </div>
                    </div>
                  </div>

                  {/* scan line */}
                  <div className="relative h-0 overflow-visible">
                    <div className="scan-line" />
                  </div>

                  {/* bottom bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-800 bg-zinc-900/30">
                    <div className="flex items-center gap-3">
                      <span className="font-ko text-[10px] text-zinc-500">
                        Score
                      </span>
                      <span className="font-ko text-[10px] font-bold text-amber-400">
                        C → A+
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                      <span className="font-ko text-[10px] text-emerald-400">
                        99.6% faster
                      </span>
                    </div>
                  </div>
                </div>

                {/* floating badge */}
                <div className="absolute -top-4 -right-4 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center"
                      style={{ background: `${BRAND}20` }}
                    >
                      <Zap className="h-3.5 w-3.5" style={{ color: BRAND }} />
                    </div>
                    <div>
                      <p className="font-ko text-xs font-bold text-zinc-100">
                        분석 완료
                      </p>
                      <p className="font-ko text-[9px] text-zinc-500">
                        3가지 최적화 발견
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-28 border-t border-zinc-800/50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <p
                className="font-ko text-[10px] tracking-widest mb-3"
                style={{ color: BRAND }}
              >
                // FEATURE
              </p>
              <h2 className="font-syne text-4xl font-bold text-zinc-100 mb-4">
                Your Personal Code Mentor
              </h2>
              <p className="font-ko text-base text-zinc-400">
                AI-powered insights로 개발 실력 Level Up!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="group relative bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all cursor-pointer overflow-hidden"
                >
                  {/* hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${BRAND}06 0%, transparent 60%)`,
                    }}
                  />

                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${BRAND}15`, color: BRAND }}
                  >
                    {f.icon}
                  </div>

                  <h3 className="font-syne text-lg font-bold text-zinc-100 mb-1">
                    {f.title}
                  </h3>
                  <p className="font-ko text-sm text-zinc-500 leading-relaxed mb-4">
                    {f.desc}
                  </p>

                  <span
                    className={`font-ko text-[10px] px-2 py-1 rounded-full border ${f.badgeColor}`}
                  >
                    {f.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="py-28 border-t border-zinc-800/50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <p
                className="font-ko text-[10px] tracking-widest mb-3"
                style={{ color: BRAND }}
              >
                // HOW IT WORKS
              </p>
              <h2 className="font-syne text-4xl font-bold text-zinc-100 mb-4">
                4단계로 실력 완성
              </h2>
              <p className="font-ko text-base text-zinc-400">
                복잡한 설정 없이, 코드 한 줄부터 시작하세요
              </p>
            </div>

            <div className="relative max-w-lg mx-auto">
              {/* vertical line - 원 중앙 기준 */}
              <div className="absolute left-7 top-0 bottom-0 w-px bg-zinc-800" />

              <div className="space-y-12">
                {STEPS.map((step, i) => (
                  <div key={i} className="flex gap-8 items-start">
                    <div
                      className="relative z-10 w-14 h-14 rounded-full border-2 flex items-center justify-center shrink-0 bg-zinc-950"
                      style={{ borderColor: `${BRAND}66` }}
                    >
                      <span
                        className="font-ko text-xs font-bold"
                        style={{ color: BRAND }}
                      >
                        {step.num}
                      </span>
                    </div>
                    <div className="pt-3.5">
                      <h3 className="font-syne text-xl font-bold text-zinc-100 mb-1.5">
                        {step.title}
                      </h3>
                      <p className="font-ko text-sm text-zinc-400 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-28 border-t border-zinc-800/50">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <div className="relative rounded-3xl border border-zinc-800 p-12 bg-zinc-900/40 overflow-hidden">
              {/* glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-72 h-72 rounded-full opacity-15"
                  style={{
                    background: `radial-gradient(circle, ${BRAND} 0%, transparent 70%)`,
                  }}
                />
              </div>

              <p
                className="font-ko text-[10px] tracking-widest mb-4"
                style={{ color: BRAND }}
              >
                // GET STARTED
              </p>
              <h2 className="font-syne text-4xl font-bold text-zinc-100 mb-4">
                코드를 이해하는
                <br />
                개발자가 되도록
              </h2>
              <p className="font-ko text-sm text-zinc-400 mb-8 leading-relaxed">
                지금 바로 코드를 넣고 AI 진단을 받아 보세요.
                <br />
              </p>
              <Link
                href={isLoggedIn ? "/main" : "/login"}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-ko font-semibold text-white text-sm transition-all hover:scale-105 hover:opacity-95"
                style={{ background: BRAND }}
              >
                {isLoggedIn ? "분석 시작하기" : "무료로 시작하기"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-zinc-800/50 py-8">
          <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
            <span
              className="font-syne text-base font-bold"
              style={{ color: BRAND }}
            >
              HiVibe
            </span>
            <p className="font-ko text-[10px] text-zinc-600">
              © 2025 HiVibe. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}