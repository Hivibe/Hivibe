"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Zap, Brain, BookOpen, Github, Twitter, Eye,
  ArrowRight, TrendingUp, Shield,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const BRAND = "#63C1ED"

const FEATURES = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Diagnosis",
    desc: "코드를 넣는 순간, 복잡도·버그·스타일 문제까지 한눈에 진단해 드려요. Big-O 차트로 시각화까지.",
    badge: "O(n²) → O(n)",
    badgeStyle: { background:"#f43f5e15", color:"#f87171", borderColor:"#f43f5e30" },
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI Learning",
    desc: "단순 정답이 아니라, 왜 더 좋은지 개념부터 설명해 줘요. Diff View로 원본과 최적화 코드를 나란히 비교해요.",
    badge: "Concept First",
    badgeStyle: { background:"#f59e0b15", color:"#fbbf24", borderColor:"#f59e0b30" },
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Build Your Archive",
    desc: "분석 결과를 아카이브로 저장하고, AI가 CS 개념을 자동으로 매핑해 줘요. 3일 후 복습 알림도 받을 수 있어요.",
    badge: "Spaced Repetition",
    badgeStyle: { background:"#63C1ED15", color:"#63C1ED", borderColor:"#63C1ED30" },
  },
]

export default function FeaturesPage() {
  const router = useRouter()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [showPw, setShowPw] = useState(false)

  return (
    <div className="font-ko min-h-screen flex flex-col bg-zinc-950 text-zinc-100">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-syne text-lg font-bold" style={{ color: BRAND }}>
            HiVibe
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/features" className="font-ko text-sm font-semibold" style={{ color: BRAND }}>
              Feature
            </Link>
            <Link href="/" className="font-ko text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
              Home
            </Link>

            {/* Login Dialog */}
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DialogTrigger asChild>
                <button className="font-ko text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                  Log In
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#111111] border-zinc-800 text-zinc-100 sm:max-w-[400px] p-8 rounded-2xl shadow-2xl shadow-black">
                <DialogHeader className="mb-5">
                  <DialogTitle className="font-syne text-2xl font-bold text-center">Welcome Back</DialogTitle>
                  <p className="font-ko text-sm text-zinc-400 text-center mt-1">HiVibe에 다시 오신 걸 환영해요</p>
                </DialogHeader>
                <div className="space-y-3">
                  {/* Google */}
                  <Button variant="outline" className="w-full h-10 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-3 font-ko text-sm">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                      <path fill="#EA4335" d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"/>
                      <path fill="#FFC107" d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"/>
                      <path fill="#1976D2" d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"/>
                      <path fill="#4CAF50" d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24 12.0004 24Z"/>
                    </svg>
                    Continue with Google
                  </Button>
                  <Button variant="outline" className="w-full h-10 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-3 font-ko text-sm">
                    <Github className="w-4 h-4" />
                    Continue with GitHub
                  </Button>

                  <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-zinc-800" />
                    <span className="font-ko flex-shrink-0 mx-4 text-zinc-600 text-[10px] tracking-wider">OR CONTINUE WITH EMAIL</span>
                    <div className="flex-grow border-t border-zinc-800" />
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="font-ko text-[10px] text-zinc-500 uppercase tracking-wider">Email</label>
                      <Input type="email" placeholder="you@example.com"
                        className="h-10 bg-zinc-900/50 border-zinc-800 font-ko text-sm"
                        style={{ ["--ring" as string]: BRAND }} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-ko text-[10px] text-zinc-500 uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <Input type={showPw ? "text" : "password"} placeholder="••••••••••••"
                          className="h-10 bg-zinc-900/50 border-zinc-800 font-ko text-sm pr-10"
                          style={{ ["--ring" as string]: BRAND }} />
                        <Eye className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-zinc-300"
                          onClick={() => setShowPw(!showPw)} />
                      </div>
                    </div>
                    <Button className="w-full h-10 font-ko font-semibold text-white text-sm mt-1"
                      style={{ background: BRAND }}>
                      로그인
                    </Button>
                  </div>

                  <p className="text-center font-ko text-xs text-zinc-500 pt-2">
                    계정이 없으신가요?{" "}
                    <Link href="#" className="hover:underline" style={{ color: BRAND }}>Sign up</Link>
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            <Link href="/main">
              <button className="font-ko text-sm px-4 py-1.5 rounded-full text-white font-semibold transition-all hover:opacity-90"
                style={{ background: BRAND }}>
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="flex-1 pt-28 px-6 pb-24">
        <div className="max-w-5xl mx-auto">

          {/* Heading */}
          <div className="text-center mb-16">
            <p className="font-ko text-[10px] tracking-widest mb-3" style={{ color: BRAND }}>// FEATURE</p>
            <h1 className="font-syne text-4xl md:text-5xl font-bold text-zinc-100 mb-4">
              Your Personal Code Mentor
            </h1>
            <p className="font-ko text-base text-zinc-400">
              AI-powered insights로 개발 실력을 레벨업하세요.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-5 mb-20">
            {FEATURES.map((f, i) => (
              <div key={i}
                className="group relative bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all cursor-default overflow-hidden hover:-translate-y-1 duration-300">
                {/* hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background:`radial-gradient(circle at 50% 0%, ${BRAND}06 0%, transparent 60%)` }} />

                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{ background:`${BRAND}15`, color:BRAND }}>
                  {f.icon}
                </div>

                <h3 className="font-syne text-lg font-bold text-zinc-100 mb-2">{f.title}</h3>
                <p className="font-ko text-sm text-zinc-400 leading-relaxed mb-4">{f.desc}</p>

                <span className="font-ko text-[10px] px-2 py-1 rounded-full border" style={f.badgeStyle}>
                  {f.badge}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="font-ko text-sm text-zinc-400 mb-6">지금 바로 시작해 보세요.</p>
            <button onClick={() => router.push("/main")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-ko font-semibold text-white text-sm transition-all hover:scale-105 hover:opacity-95"
              style={{ background: BRAND }}>
              지금 분석 시작하기
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800/50 py-7 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="font-syne text-base font-bold" style={{ color: BRAND }}>HiVibe</span>
          <p className="font-ko text-[10px] text-zinc-600">© 2025 HiVibe. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors"><Github className="w-4 h-4" /></Link>
            <Link href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors"><Twitter className="w-4 h-4" /></Link>
          </div>
        </div>
      </footer>
    </div>
  )
}