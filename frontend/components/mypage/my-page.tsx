// components/mypage/my-page.tsx
"use client"

import { useState, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Camera, ChevronRight, Check, Eye, EyeOff, ArrowLeft, Shield, Star, Zap, Award } from "lucide-react"

const BRAND = "#63C1ED"

const TIER_CONFIG = {
  Bronze:   { color: "#cd7f32", bg: "#cd7f3215", border: "#cd7f3230", glow: "#cd7f3240", next: "Silver",   xp: 300,  maxXp: 500  },
  Silver:   { color: "#a8a9ad", bg: "#a8a9ad15", border: "#a8a9ad30", glow: "#a8a9ad40", next: "Gold",     xp: 688,  maxXp: 800  },
  Gold:     { color: "#ffd700", bg: "#ffd70015", border: "#ffd70030", glow: "#ffd70040", next: "Platinum", xp: 420,  maxXp: 1000 },
  Platinum: { color: "#63C1ED", bg: "#63C1ED15", border: "#63C1ED30", glow: "#63C1ED40", next: null,       xp: 9999, maxXp: 9999 },
} as const

type Tier = keyof typeof TIER_CONFIG
type Page = "main" | "profile-edit" | "password"

const TIER_ICONS: Record<Tier, React.ReactNode> = {
  Bronze:   <Shield className="h-5 w-5" />,
  Silver:   <Star   className="h-5 w-5" />,
  Gold:     <Award  className="h-5 w-5" />,
  Platinum: <Zap    className="h-5 w-5" />,
}

const mockUser = {
  name:     "성하",
  email:    "sungha@hivibe.dev",
  tier:     "Silver" as Tier,
  avatar:   null as string | null,
  joinDate: "2025년 3월",
}

/* ────────────────────────────────────────────
   메인 설정 페이지
──────────────────────────────────────────── */
function MainPage({
  user, onNavigate,
}: {
  user: typeof mockUser
  onNavigate: (p: Page) => void
}) {
  const tier   = TIER_CONFIG[user.tier]
  const xpPct  = Math.min((tier.xp / tier.maxXp) * 100, 100)
  const xpLeft = tier.maxXp - tier.xp

  return (
    <ScrollArea className="h-full">
      <div className="h-full px-10 py-10">
        <p className="font-space text-[10px] tracking-widest mb-1" style={{ color: BRAND }}>// SETTINGS</p>
        <h1 className="font-syne text-3xl font-bold text-zinc-100 mb-10">설정</h1>

        {/* ── 프로필 섹션 ── */}
        <div className="mb-8">
          <p className="font-space text-[10px] tracking-widest text-zinc-600 mb-4 uppercase">프로필</p>
          <div
            className="flex items-center gap-5 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 cursor-pointer hover:bg-zinc-900/70 transition-colors group"
            onClick={() => onNavigate("profile-edit")}
          >
            {/* 아바타 */}
            <div className="relative shrink-0">
              <div
                className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center overflow-hidden"
                style={{ borderColor: `${BRAND}44`, background: `${BRAND}10` }}
              >
                {user.avatar
                  ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="font-syne text-2xl font-bold" style={{ color: BRAND }}>{user.name.charAt(0)}</span>
                }
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center border border-zinc-700 bg-zinc-800"
                style={{ color: BRAND }}
              >
                <Camera className="h-3 w-3" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-syne text-base font-bold text-zinc-100">{user.name}</p>
              <p className="font-space text-xs text-zinc-500 mt-0.5">{user.email}</p>
              <p className="font-ko text-[11px] text-zinc-600 mt-1">{user.joinDate}부터 함께하고 있어요</p>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
          </div>
        </div>

        {/* ── 티어 섹션 ── */}
        <div className="mb-8">
          <p className="font-space text-[10px] tracking-widest text-zinc-600 mb-4 uppercase">티어</p>
          <div
            className="p-5 rounded-2xl border overflow-hidden"
            style={{ borderColor: tier.border, background: `linear-gradient(135deg, ${tier.bg} 0%, transparent 60%)` }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: tier.bg, border: `1px solid ${tier.border}`, color: tier.color, boxShadow: `0 0 16px ${tier.glow}` }}
                >
                  {TIER_ICONS[user.tier]}
                </div>
                <div>
                  <p className="font-space text-[10px] tracking-widest text-zinc-500 mb-0.5">CURRENT TIER</p>
                  <p className="font-syne text-xl font-bold" style={{ color: tier.color }}>{user.tier}</p>
                </div>
              </div>
              {tier.next && (
                <div className="text-right">
                  <p className="font-space text-[10px] text-zinc-500 mb-0.5">{tier.next} 승급까지</p>
                  <p className="font-syne text-lg font-bold text-zinc-300">−{xpLeft.toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-space text-[11px] text-zinc-400">
                  {user.tier} <span className="font-bold" style={{ color: tier.color }}>{tier.xp.toLocaleString()}</span>
                </span>
                {tier.next && (
                  <span className="font-space text-[10px] text-zinc-600">{tier.next} {tier.maxXp.toLocaleString()}</span>
                )}
              </div>
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${xpPct}%`,
                    background: `linear-gradient(90deg, ${tier.color}88, ${tier.color})`,
                    boxShadow: `0 0 8px ${tier.glow}`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 보안 설정 섹션 ── */}
        <div className="mb-8">
          <p className="font-space text-[10px] tracking-widest text-zinc-600 mb-4 uppercase">보안 설정</p>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
            <button
              onClick={() => onNavigate("password")}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/40 transition-colors group"
            >
              <div>
                <p className="font-ko text-[13px] text-zinc-200 text-left">비밀번호</p>
                <p className="font-space text-[10px] text-zinc-600 text-left mt-0.5">••••••••</p>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* ── 회원탈퇴 ── */}
        <div>
          <p className="font-space text-[10px] tracking-widest text-zinc-600 mb-4 uppercase">계정</p>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-rose-500/5 transition-colors group">
              <p className="font-ko text-[13px] text-rose-500">회원탈퇴</p>
              <ChevronRight className="h-4 w-4 text-rose-800 group-hover:text-rose-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

/* ────────────────────────────────────────────
   프로필 수정 페이지
──────────────────────────────────────────── */
function ProfileEditPage({
  user, onBack, onSave,
}: {
  user: typeof mockUser
  onBack: () => void
  onSave: (name: string, avatar: string | null) => void
}) {
  const [nameEdit, setNameEdit] = useState(user.name)
  const [avatar,   setAvatar]   = useState(user.avatar)
  const [saved,    setSaved]    = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    setAvatar(URL.createObjectURL(f))
    e.target.value = ""
  }

  const handleSave = () => {
    if (!nameEdit.trim()) return
    onSave(nameEdit.trim(), avatar)
    setSaved(true)
    setTimeout(() => { setSaved(false); onBack() }, 1000)
  }

  return (
    <ScrollArea className="h-full">
      <div className="h-full px-10 py-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-space text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />설정으로 돌아가기
        </button>

        <p className="font-space text-[10px] tracking-widest mb-1" style={{ color: BRAND }}>// PROFILE EDIT</p>
        <h1 className="font-syne text-3xl font-bold text-zinc-100 mb-10">프로필 수정</h1>

        {/* 아바타 */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-3xl border-2 flex items-center justify-center overflow-hidden cursor-pointer"
              style={{ borderColor: `${BRAND}44`, background: `${BRAND}10` }}
              onClick={() => fileRef.current?.click()}
            >
              {avatar
                ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                : <span className="font-syne text-4xl font-bold" style={{ color: BRAND }}>{nameEdit.charAt(0) || "?"}</span>
              }
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
              style={{ color: BRAND }}
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>
          <p className="font-ko text-[11px] text-zinc-600 mt-4">사진을 클릭해서 변경하세요</p>
        </div>

        {/* 닉네임 */}
        <div className="space-y-2 mb-6">
          <label className="font-ko text-[11px] text-zinc-400">닉네임</label>
          <input
            value={nameEdit}
            onChange={e => setNameEdit(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 font-ko text-[14px] text-zinc-200 outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        {/* 이메일 (읽기 전용) */}
        <div className="space-y-2 mb-10">
          <label className="font-ko text-[11px] text-zinc-400">이메일</label>
          <div className="w-full bg-zinc-900/30 border border-zinc-800/50 rounded-xl px-4 py-3 font-space text-[12px] text-zinc-600">
            {user.email}
          </div>
          <p className="font-ko text-[11px] text-zinc-600">이메일은 변경할 수 없어요.</p>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-xl text-[14px] font-ko font-medium flex items-center justify-center gap-2 transition-all"
          style={saved
            ? { background: "#22c55e22", color: "#22c55e", border: "1px solid #22c55e44" }
            : { background: `${BRAND}20`, color: BRAND, border: `1px solid ${BRAND}44` }}
        >
          {saved ? <><Check className="h-4 w-4" />저장됨</> : "저장하기"}
        </button>
      </div>
    </ScrollArea>
  )
}

/* ────────────────────────────────────────────
   비밀번호 변경 페이지
──────────────────────────────────────────── */
function PasswordPage({ onBack }: { onBack: () => void }) {
  const [pwForm,  setPwForm]  = useState({ current: "", next: "", confirm: "" })
  const [showPw,  setShowPw]  = useState({ current: false, next: false, confirm: false })
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState("")

  const handleSave = () => {
    setPwError("")
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwError("모든 항목을 입력해주세요."); return
    }
    if (pwForm.next.length < 8) {
      setPwError("비밀번호는 8자 이상이어야 해요."); return
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError("새 비밀번호가 일치하지 않아요."); return
    }
    setPwSaved(true)
    setTimeout(() => { setPwSaved(false); onBack() }, 1200)
  }

  return (
    <ScrollArea className="h-full">
      <div className="h-full px-10 py-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-space text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />설정으로 돌아가기
        </button>

        <p className="font-space text-[10px] tracking-widest mb-1" style={{ color: BRAND }}>// SECURITY</p>
        <h1 className="font-syne text-3xl font-bold text-zinc-100 mb-10">비밀번호 변경</h1>

        <div className="space-y-5 max-w-md">
          {(["current", "next", "confirm"] as const).map((k) => {
            const labels = { current: "현재 비밀번호", next: "새 비밀번호", confirm: "새 비밀번호 확인" }
            const hints  = { current: "", next: "8자 이상 입력해주세요", confirm: "" }
            return (
              <div key={k} className="space-y-2">
                <label className="font-ko text-[11px] text-zinc-400">{labels[k]}</label>
                <div className="relative">
                  <input
                    type={showPw[k] ? "text" : "password"}
                    value={pwForm[k]}
                    onChange={e => setPwForm(p => ({ ...p, [k]: e.target.value }))}
                    placeholder={hints[k]}
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 pr-12 font-space text-[13px] text-zinc-200 outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-700"
                  />
                  <button
                    onClick={() => setShowPw(p => ({ ...p, [k]: !p[k] }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    {showPw[k] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )
          })}

          {pwError && (
            <p className="font-ko text-[12px] text-rose-400">{pwError}</p>
          )}

          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-xl text-[14px] font-ko font-medium flex items-center justify-center gap-2 transition-all mt-4"
            style={pwSaved
              ? { background: "#22c55e22", color: "#22c55e", border: "1px solid #22c55e44" }
              : { background: `${BRAND}20`, color: BRAND, border: `1px solid ${BRAND}44` }}
          >
            {pwSaved ? <><Check className="h-4 w-4" />변경 완료</> : "비밀번호 변경"}
          </button>
        </div>
      </div>
    </ScrollArea>
  )
}

/* ────────────────────────────────────────────
   루트 컴포넌트
──────────────────────────────────────────── */
export function MyPage() {
  const [page, setPage] = useState<Page>("main")
  const [user, setUser] = useState(mockUser)

  const handleSaveProfile = (name: string, avatar: string | null) => {
    setUser(p => ({ ...p, name, avatar }))
  }

  return (
    <div className="h-full bg-zinc-950">
      {page === "main" && (
        <MainPage user={user} onNavigate={setPage} />
      )}
      {page === "profile-edit" && (
        <ProfileEditPage user={user} onBack={() => setPage("main")} onSave={handleSaveProfile} />
      )}
      {page === "password" && (
        <PasswordPage onBack={() => setPage("main")} />
      )}
    </div>
  )
}