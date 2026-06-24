// app/main/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LeetCodeIDE } from "@/components/leetcode-ide"

export default function IDEPage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      router.replace("/login")
      return
    }
    setChecked(true)
  }, [router])

  // 토큰 확인 끝나기 전엔 아무것도 렌더링 안 함 — 보호된 화면이 잠깐이라도 보이는 것 방지
  if (!checked) return null

  return <LeetCodeIDE />
}