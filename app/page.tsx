"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ArrowRight, Github, Twitter, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  // 진단 화면으로 이동하는 함수
  const handleStartAnalyzing = () => {
    router.push("/main") 
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 dark selection:bg-violet-500/30">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/50 transition-all duration-300">
        <div className="w-full px-8 md:px-16 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
            <span className="text-zinc-100">HiVibe</span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/features" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Feature</Link>
            
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DialogTrigger asChild>
                <button className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Log In</button>
              </DialogTrigger>
              <DialogContent className="bg-[#121212] border-zinc-800 text-zinc-100 sm:max-w-[400px] p-8 rounded-2xl shadow-2xl shadow-black">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold text-center">Welcome Back</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full h-11 bg-zinc-900 border-zinc-800">Continue with Google</Button>
                  <Button variant="outline" className="w-full h-11 bg-zinc-900 border-zinc-800 flex items-center gap-3">
                    <Github className="w-4 h-4" /> Continue with GitHub
                  </Button>
                  <Button className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-medium mt-2">Sign in</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white px-5 rounded-md font-medium" onClick={handleStartAnalyzing}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 mt-10">
          <h1 className="text-[4.5rem] leading-[1.1] font-extrabold tracking-tight text-zinc-100">Understand Your Code,<br />Don't Just Run It.</h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">AI-powered analysis for junior developers. Visualize complexity, catch hidden bugs, and build your own CS knowledge base instantly.</p>
          <div className="flex items-center justify-center gap-4 pt-6">
            <Button size="lg" className="h-12 px-6 bg-violet-600 hover:bg-violet-700 text-white text-base rounded-full flex items-center gap-2 group transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)] hover:-translate-y-0.5" onClick={handleStartAnalyzing}>
              Start Analyzing Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-6 text-base border-zinc-800 hover:bg-zinc-900 bg-transparent rounded-full" onClick={() => router.push('/features')}>
              See How It Works
            </Button>
          </div>
        </div>
      </main>

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
