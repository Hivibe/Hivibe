// components/layout/sidebar.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { apiFetch } from "@/lib/api"
import {
  PanelLeft, Home, Activity as ActivityIcon,
  GraduationCap, Book, Settings,
} from "lucide-react"

const BRAND = "#63C1ED"

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "diagnosis", label: "Diagnosis", icon: ActivityIcon },
  { id: "learning", label: "Learning", icon: GraduationCap },
  { id: "notes", label: "My Notes", icon: Book },
]

interface SidebarProps {
  activeNav: string
  sidebarExp: boolean
  setSidebarExp: (v: boolean) => void
  onNavClick: (id: string) => void
  refreshKey?: number
}

interface SidebarUser {
  userNm: string
  userEmail: string
  userPhoto: string | null
}

export function Sidebar({ activeNav, sidebarExp, setSidebarExp, onNavClick, refreshKey }: SidebarProps) {
  const [user, setUser] = useState<SidebarUser | null>(null)

  useEffect(() => {
    apiFetch("/api/mypage/me")
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(e => console.error("사이드바 유저 정보 불러오기 실패:", e))
  }, [refreshKey])

  const initial = user?.userNm?.[0] ?? "?"

  return (
    <div className={`h-full flex flex-col bg-background border-r border-border transition-all duration-300 shrink-0 ${sidebarExp ? "w-52" : "w-14"}`}>

      {/* 로고 + 토글 */}
      <div className={`flex items-center h-14 px-4 ${sidebarExp ? "justify-between" : "justify-center"}`}>
        {sidebarExp && (
          <span className="font-syne text-lg font-bold" style={{ color: BRAND }}>
            Hi<span style={{ color: BRAND }}>V</span>ibe
          </span>
        )}
        <button
          onClick={() => setSidebarExp(!sidebarExp)}
          className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <PanelLeft className="h-4 w-4" />
        </button>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = id === activeNav
          return (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onNavClick(id)}
                  className={`w-full flex items-center gap-3 rounded-lg transition-all ${sidebarExp ? "px-3 py-2.5" : "justify-center py-2.5"}`}
                  style={active ? { background: "rgba(217,217,217,0.07)", color: "#D9D9D9" } : { color: "#71717a" }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#d4d4d8" }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#71717a" }}>
                  <Icon className="h-4 w-4 shrink-0" />
                  {sidebarExp && <span className="text-sm font-medium truncate">{label}</span>}
                  {active && sidebarExp && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#D9D9D9]" />}
                </button>
              </TooltipTrigger>
              {!sidebarExp && (
                <TooltipContent side="right" className="bg-popover border-border text-popover-foreground overflow-hidden">
                  {label}
                </TooltipContent>
              )}
            </Tooltip>
          )
        })}
      </nav>

      {/* 유저 정보 */}
      <div className="border-t border-border p-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onNavClick("mypage")}
              className={`w-full flex items-center rounded-lg transition-colors hover:bg-accent ${sidebarExp ? "gap-3 px-2 py-2" : "justify-center py-1"}`}>
              <Avatar className="h-7 w-7 shrink-0">
                {user?.userPhoto && (
                  <AvatarImage src={`http://localhost:8080${user.userPhoto}`} alt={user.userNm} />
                )}
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">{initial}</AvatarFallback>
              </Avatar>
              {sidebarExp && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-medium text-foreground truncate">{user?.userNm ?? "..."}</p>
                  <p className="font-ko text-[10px] text-muted-foreground truncate">{user?.userEmail ?? ""}</p>
                </div>
              )}
              {sidebarExp && (
                <Settings className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
            </button>
          </TooltipTrigger>
          {!sidebarExp && (
            <TooltipContent side="right" className="bg-popover border-border text-popover-foreground overflow-hidden">
              마이페이지
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </div>
  )
}