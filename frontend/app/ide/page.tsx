import { Suspense } from "react"
import { LeetCodeIDE } from "@/components/leetcode-ide"

export default function IDEPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-zinc-950" />}>
      <LeetCodeIDE />
    </Suspense>
  )
}