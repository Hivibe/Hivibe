// 파일 경로: app/features/page.tsx (특징 설명 화면)
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Bug, Rocket, Brain, Github, Twitter, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function FeaturesPage() {
  const router = useRouter()
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  // 진단 화면으로 이동하는 함수
  const handleStartAnalyzing = () => {
    router.push("/main") 
  }


  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 dark selection:bg-violet-500/30">
      
      {/* Navigation Bar (Feature 메뉴에 보라색 하이라이트) */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/50 transition-all duration-300">
        <div className="w-full px-8 md:px-16 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
            <span className="text-zinc-100">HiVibe</span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/features" className="text-sm font-medium text-violet-400 transition-colors">
              Feature
            </Link>
            
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DialogTrigger asChild>
                <button className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">
                  Log In
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#121212] border-zinc-800 text-zinc-100 sm:max-w-[400px] p-8 rounded-2xl shadow-2xl shadow-black">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold text-center">Welcome Back</DialogTitle>
                  <p className="text-sm text-zinc-400 text-center mt-2">Sign in to continue to Vibe Coding</p>
                </DialogHeader>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full h-11 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-3">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true"><path fill="currentColor" d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"></path><path fill="#FFC107" d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"></path><path fill="#1976D2" d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"></path><path fill="#4CAF50" d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24 12.0004 24Z"></path></svg>
                    Continue with Google
                  </Button>
                  <Button variant="outline" className="w-full h-11 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-3">
                    <Github className="w-4 h-4" />
                    Continue with GitHub
                  </Button>
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-zinc-800"></div>
                    <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs">Or continue with email</span>
                    <div className="flex-grow border-t border-zinc-800"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-300">Email</label>
                      <Input type="email" placeholder="you@example.com" className="h-11 bg-zinc-900/50 border-zinc-800 focus-visible:ring-violet-500/50" />
                    </div>
                    <div className="space-y-2 relative">
                      <label className="text-xs font-semibold text-zinc-300">Password</label>
                      <div className="relative">
                        <Input type="password" placeholder="••••••••••••" className="h-11 bg-zinc-900/50 border-zinc-800 focus-visible:ring-violet-500/50 pr-10" />
                        <Eye className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-zinc-300" />
                      </div>
                    </div>
                    <Button className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-medium mt-2">Sign in</Button>
                  </div>
                  <p className="text-center text-xs text-zinc-400 pt-4">
                    Don't have an account? <Link href="#" className="text-violet-400 hover:text-violet-300 hover:underline">Sign up</Link>
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            <Link href="/ide">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white px-5 rounded-md font-medium">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Features Content (애니메이션 박스들) */}
      <main className="flex-1 pt-32 px-4 pb-24 relative">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100">Your Personal Code Mentor</h1>
            <p className="text-zinc-400 text-lg">
              Level up your development skills with AI-powered insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="group relative bg-[#121212] border border-zinc-800/80 rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.2)] hover:border-violet-500/50 cursor-default overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 group-hover:bg-violet-600/10 group-hover:border-violet-500/30 transition-colors duration-500">
                  <Bug className="w-6 h-6 text-zinc-400 group-hover:text-violet-400 transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-3 group-hover:text-violet-100 transition-colors">Instant Diagnosis</h3>
                <p className="text-zinc-400 leading-relaxed text-sm group-hover:text-zinc-300 transition-colors">
                  Get line-by-line explanations and visualize Big-O complexity charts. Find bugs before deploying.
                </p>
              </div>
            </div>

            <div className="group relative bg-[#121212] border border-zinc-800/80 rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.2)] hover:border-violet-500/50 cursor-default overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 group-hover:bg-violet-600/10 group-hover:border-violet-500/30 transition-colors duration-500">
                  <Rocket className="w-6 h-6 text-zinc-400 group-hover:text-violet-400 transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-3 group-hover:text-violet-100 transition-colors">Smart Refactoring</h3>
                <p className="text-zinc-400 leading-relaxed text-sm group-hover:text-zinc-300 transition-colors">
                  Compare original vs. optimized code with a built-in Diff View. Learn the 'why' behind the changes.
                </p>
              </div>
            </div>

            <div className="group relative bg-[#121212] border border-zinc-800/80 rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.2)] hover:border-violet-500/50 cursor-default overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 group-hover:bg-violet-600/10 group-hover:border-violet-500/30 transition-colors duration-500">
                  <Brain className="w-6 h-6 text-zinc-400 group-hover:text-violet-400 transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-3 group-hover:text-violet-100 transition-colors">Build Your Archive</h3>
                <p className="text-zinc-400 leading-relaxed text-sm group-hover:text-zinc-300 transition-colors">
                  Save your analysis results. AI automatically maps CS concepts to your code for future review.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-800/50 bg-[#0a0a0a]">
        <div className="w-full px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">© 2025 HiVibe. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors"><Github className="w-5 h-5" /></Link>
            <Link href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors"><Twitter className="w-5 h-5" /></Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
