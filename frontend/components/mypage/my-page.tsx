// components/mypage/my-page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { apiFetch } from "@/lib/api"
import {
  User, Settings, Star, Flame, FolderOpen, BookOpen,
  Edit2, Check, X, Bell, Shield, Smartphone, Camera,
} from "lucide-react"
import type { Note } from "@/types"

const BRAND = "#63C1ED"

interface Profile {
  id: number
  lgnId: string
  userNm: string
  userEmail: string
  userPhone: string | null
  userPhoto: string | null
  userGrd: string
  mktgAgreeYn: string
  reviewAlarmYn: string
  diagnosisCount: number
}

interface Badge {
  key: string
  icon: string
  name: string
  desc: string
  achieved: boolean
  achievedAt: string | null
}

const TIERS = [
  { name: "Bronze", color: "#CD7F32" },
  { name: "Silver", color: "#C0C0C0" },
  { name: "Gold", color: "#FFD700" },
  { name: "Platinum", color: BRAND },
  { name: "Diamond", color: "#a78bfa" },
]

export function MyPage({ onProfileUpdated }: { onProfileUpdated?: () => void }) {
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile")

  const [profile, setProfile] = useState<Profile | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState("")

  const imgRef = useRef<HTMLInputElement>(null)
  const [uploadingImg, setUploadingImg] = useState(false)

  const [editingPhone, setEditingPhone] = useState(false)
  const [tempPhone, setTempPhone] = useState("")
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [verifyCode, setVerifyCode] = useState("")
  const [showVerify, setShowVerify] = useState(false)

  const [marketingEmail, setMarketingEmail] = useState(false)
  const [marketingSms, setMarketingSms] = useState(false)
  const [reviewAlarm, setReviewAlarm] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)

  /* ── 데이터 불러오기 ── */
  const fetchProfile = async () => {
    try {
      const res = await apiFetch("/api/mypage/me")
      const data: Profile = await res.json()
      setProfile(data)
      setMarketingEmail(data.mktgAgreeYn === "Y")
      setReviewAlarm(data.reviewAlarmYn === "Y")
      setPhoneVerified(!!data.userPhone)
    } catch (e) {
      console.error("프로필 불러오기 실패:", e)
    }
  }

  const fetchBadges = async () => {
    try {
      const res = await apiFetch("/api/badges")
      setBadges(await res.json())
    } catch (e) {
      console.error("뱃지 불러오기 실패:", e)
    }
  }

  const fetchNotes = async () => {
    try {
      const res = await apiFetch("/api/notes")
      setNotes(await res.json())
    } catch (e) {
      console.error("노트 불러오기 실패:", e)
    }
  }

  useEffect(() => {
    Promise.all([fetchProfile(), fetchBadges(), fetchNotes()])
      .finally(() => setLoading(false))
  }, [])

  /* ── 이름 수정 ── */
  const saveName = async () => {
    if (!tempName.trim()) return
    try {
      const res = await apiFetch("/api/mypage/me", {
        method: "PATCH",
        body: JSON.stringify({ userNm: tempName }),
      })
      const updated = await res.json()
      setProfile(updated)
      setEditingName(false)
      onProfileUpdated?.()   // 사이드바 닉네임도 같이 갱신되도록 알림
    } catch (e) {
      console.error("이름 수정 실패:", e)
    }
  }

  /* ── 프로필 사진 업로드 ── */
  const handleImgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImg(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      const res = await apiFetch("/api/mypage/me/profile-image", {
        method: "POST",
        body: formData,
      })
      const imageUrl = (await res.text()).replace(/"/g, "")
      setProfile(p => p ? { ...p, userPhoto: imageUrl } : p)
      onProfileUpdated?.()   // 사이드바 아바타도 같이 갱신되도록 알림
    } catch (e) {
      console.error("프로필 사진 업로드 실패:", e)
    } finally {
      setUploadingImg(false)
      e.target.value = ""
    }
  }

  /* ── 휴대폰 입력 자동 포맷팅 ── */
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nums = e.target.value.replace(/\D/g, "").slice(0, 11)
    const formatted = nums.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")
    setTempPhone(formatted)
  }

  // 인증번호 확인 (SMS 발송은 추후 연동 — 현재는 프론트 단 임시 확인 후 번호만 저장)
  const confirmPhone = async () => {
    try {
      const res = await apiFetch("/api/mypage/me/phone", {
        method: "PATCH",
        body: JSON.stringify({ userPhone: tempPhone.replace(/-/g, "") }),
      })
      if (res.ok) {
        setProfile(p => p ? { ...p, userPhone: tempPhone.replace(/-/g, "") } : p)
        setPhoneVerified(true)
        setEditingPhone(false)
        setShowVerify(false)
        setVerifyCode("")
      }
    } catch (e) {
      console.error("휴대폰 번호 저장 실패:", e)
    }
  }

  /* ── 설정 저장 ── */
  const saveSettings = async () => {
    setSavingSettings(true)
    try {
      // ⚠️ DB에 마케팅 동의 컬럼이 MKTG_AGREE_YN 하나뿐이라, 이메일 동의 값만 실제로 저장돼요.
      // SMS 동의는 별도 컬럼이 추가되기 전까지는 프론트에서만 토글 상태가 유지돼요.
      await apiFetch("/api/mypage/me/settings", {
        method: "PATCH",
        body: JSON.stringify({
          mktgAgreeYn: marketingEmail ? "Y" : "N",
          reviewAlarmYn: reviewAlarm ? "Y" : "N",
        }),
      })
      alert("설정이 저장되었어요!")
    } catch (e) {
      console.error("설정 저장 실패:", e)
    } finally {
      setSavingSettings(false)
    }
  }

  const formatPhone = (p: string) =>
    p.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="font-ko text-sm text-zinc-500">불러오는 중...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="font-ko text-sm text-zinc-500">프로필을 불러올 수 없어요</p>
      </div>
    )
  }

  const achievedBadges = badges.filter(b => b.achieved)

  // 사용 언어 — 실제 노트에서 사용된 언어 distinct (상위 3개)
  const usedLangs = Array.from(new Set(notes.map(n => n.lang).filter(Boolean))).slice(0, 3) as string[]

  // 최근 분석 — Learning 타입 노트 최신 3개 (점수는 노트에 없어서 표시 안 함)
  const recentLearningNotes = notes
    .filter(n => n.noteType === "LEARNING")
    .slice(0, 3)

  // 티어 — userGrd 값으로 매칭 안 되면 0번(Bronze)으로 기본 표시
  const currentTierIdx = Math.max(0, TIERS.findIndex(t => t.name.toUpperCase() === profile.userGrd?.toUpperCase()))

  return (
    <div className="h-full flex flex-col bg-zinc-950 overflow-hidden">

      {/* 탭 */}
      <div className="border-b border-zinc-800 px-6 flex items-center gap-1 shrink-0 bg-[#0a0a0a]">
        {[
          { id: "profile", label: "프로필", icon: User },
          { id: "settings", label: "설정", icon: Settings },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className="flex items-center gap-1.5 px-4 py-3 font-ko text-[13px] tracking-wider border-b-2 transition-all"
            style={activeTab === id
              ? { borderColor: BRAND, color: BRAND }
              : { borderColor: "transparent", color: "#71717a" }}>
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-6 max-w-3xl mx-auto space-y-5">

          {/* ── 프로필 탭 ── */}
          {activeTab === "profile" && (
            <>
              {/* 프로필 카드 */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-5">
                <div className="relative w-16 h-16 shrink-0 group cursor-pointer"
                  onClick={() => imgRef.current?.click()}>
                  {profile.userPhoto ? (
                    <img src={`http://localhost:8080${profile.userPhoto}`} alt="프로필"
                      className="w-16 h-16 rounded-full object-cover border-2"
                      style={{ borderColor: `${BRAND}44` }} />
                  ) : (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center font-ko text-2xl font-bold"
                      style={{ background: `${BRAND}20`, border: `2px solid ${BRAND}44`, color: BRAND }}>
                      {profile.userNm?.[0] ?? "?"}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploadingImg ? (
                      <span className="font-space text-[9px] text-white">...</span>
                    ) : (
                      <Camera className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImgChange} />
                </div>

                <div className="flex-1 min-w-0">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <Input value={tempName} onChange={e => setTempName(e.target.value)}
                        className="h-9 bg-zinc-950 border-zinc-700 text-zinc-200 text-base font-ko w-44" />
                      <button onClick={saveName}
                        className="h-8 w-8 flex items-center justify-center rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditingName(false)}
                        className="h-8 w-8 flex items-center justify-center rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-ko text-xl font-bold text-zinc-100">{profile.userNm}</span>
                      <button onClick={() => { setTempName(profile.userNm); setEditingName(true) }}
                        className="h-7 w-7 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="font-ko text-sm text-zinc-400 mt-1">{profile.userEmail}</p>
                  {usedLangs.length > 0 && (
                    <div className="flex gap-1.5 mt-2.5">
                      {usedLangs.map(l => (
                        <span key={l} className="font-space text-[10px] px-2.5 py-1 rounded-full border"
                          style={{ background: `${BRAND}10`, color: BRAND, borderColor: `${BRAND}30` }}>
                          {l}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="font-space text-[10px] text-zinc-500 tracking-widest uppercase">// TIER</span>
                  <span className="font-syne text-2xl font-bold" style={{ color: BRAND }}>
                    {profile.userGrd || "BASIC"}
                  </span>
                </div>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="mb-2.5"><FolderOpen className="h-4 w-4" style={{ color: BRAND }} /></div>
                  <p className="font-syne text-2xl font-bold text-zinc-100">{profile.diagnosisCount}</p>
                  <p className="font-ko text-xs text-zinc-400 mt-1">총 진단 수</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="mb-2.5"><Star className="h-4 w-4 text-amber-400" /></div>
                  <p className="font-syne text-2xl font-bold text-zinc-500">—</p>
                  <p className="font-ko text-xs text-zinc-400 mt-1">평균 등급<br /><span className="text-zinc-600">(연동 예정)</span></p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="mb-2.5"><Flame className="h-4 w-4 text-orange-400" /></div>
                  <p className="font-syne text-2xl font-bold text-zinc-500">—</p>
                  <p className="font-ko text-xs text-zinc-400 mt-1">연속 일수<br /><span className="text-zinc-600">(연동 예정)</span></p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="mb-2.5"><BookOpen className="h-4 w-4 text-violet-400" /></div>
                  <p className="font-syne text-2xl font-bold text-zinc-100">{notes.length}</p>
                  <p className="font-ko text-xs text-zinc-400 mt-1">저장된 노트</p>
                </div>
              </div>

              {/* 티어 트랙 */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <p className="font-space text-[10px] tracking-widest mb-1.5" style={{ color: BRAND }}>// TIER TRACK</p>
                <p className="font-ko text-base font-bold text-zinc-100 mb-6">성장 현황</p>
                <div className="relative flex items-start justify-between">
                  <div className="absolute top-4 left-4 right-4 h-px bg-zinc-800 z-0" />
                  {TIERS.map((tier, i) => {
                    const done = i < currentTierIdx
                    const current = i === currentTierIdx
                    const locked = i > currentTierIdx
                    return (
                      <div key={tier.name} className="flex flex-col items-center gap-2 z-10 flex-1">
                        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs bg-zinc-950"
                          style={current
                            ? { borderColor: tier.color, color: tier.color, boxShadow: `0 0 0 4px ${tier.color}15` }
                            : done
                              ? { borderColor: `${tier.color}66`, color: tier.color }
                              : { borderColor: "#27272a", color: "#3f3f46" }}>
                          {done ? <Check className="h-3.5 w-3.5" /> : locked ? "🔒" : "👑"}
                        </div>
                        <span className="font-ko text-xs"
                          style={{ color: current ? tier.color : done ? "#a1a1aa" : "#52525b" }}>
                          {tier.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <p className="font-ko text-xs text-zinc-500 mt-5">티어 산정 기준은 추후 연동될 예정이에요.</p>
              </div>

              {/* 뱃지 */}
              <div>
                <p className="font-space text-[10px] tracking-widest mb-1.5" style={{ color: BRAND }}>// BADGES</p>
                <p className="font-ko text-lg font-bold text-zinc-100 mb-3">획득한 뱃지 ({achievedBadges.length} / {badges.length})</p>
                <div className="grid grid-cols-4 gap-3">
                  {badges.map(b => (
                    <div key={b.key}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center gap-2 text-center"
                      style={{ opacity: b.achieved ? 1 : 0.4 }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                        style={{ background: b.achieved ? `${BRAND}15` : "#27272a" }}>
                        {b.icon}
                      </div>
                      <p className="font-syne text-xs font-bold text-zinc-100 leading-tight">{b.name}</p>
                      <p className="font-ko text-xs text-zinc-400 leading-relaxed">{b.desc}</p>
                      <p className="font-ko text-xs" style={{ color: b.achieved ? BRAND : "#52525b" }}>
                        {b.achieved && b.achievedAt
                          ? new Date(b.achievedAt).toLocaleDateString("ko-KR")
                          : "미획득"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 최근 분석 (Learning 노트 기준) */}
              <div>
                <p className="font-space text-[10px] tracking-widest mb-1.5" style={{ color: BRAND }}>// RECENT</p>
                <p className="font-ko text-lg font-bold text-zinc-100 mb-3">최근 학습 노트</p>
                {recentLearningNotes.length > 0 ? (
                  <div className="space-y-2">
                    {recentLearningNotes.map(n => (
                      <div key={n.noteId} className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center gap-4">
                        <BookOpen className="h-4 w-4 text-violet-400 shrink-0" />
                        <span className="font-ko text-sm text-zinc-300 flex-1 truncate">{n.noteName}</span>
                        <span className="font-ko text-xs text-zinc-400 flex items-center gap-1.5 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: BRAND }} />
                          {n.lang} · {new Date(n.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-ko text-sm text-zinc-500">아직 학습 노트가 없어요.</p>
                )}
              </div>
            </>
          )}

          {/* ── 설정 탭 ── */}
          {activeTab === "settings" && (
            <div className="space-y-4">

              {/* 계정 정보 */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <User className="h-4 w-4" style={{ color: BRAND }} />
                  <p className="font-ko text-base font-bold text-zinc-100">계정 정보</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-ko text-xs text-zinc-500 uppercase tracking-wider">이름</label>
                    <div className="flex items-center gap-2">
                      <Input value={profile.userNm} readOnly
                        className="h-10 bg-zinc-950 border-zinc-800 text-zinc-300 text-sm font-ko" />
                      <button onClick={() => { setActiveTab("profile"); setTempName(profile.userNm); setEditingName(true) }}
                        className="h-10 px-4 rounded-lg border border-zinc-700 font-ko text-sm text-zinc-300 hover:bg-zinc-800 transition-colors shrink-0">
                        수정
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-ko text-xs text-zinc-500 uppercase tracking-wider">이메일</label>
                    <Input value={profile.userEmail} readOnly
                      className="h-10 bg-zinc-950 border-zinc-800 text-zinc-500 text-sm font-ko" />
                  </div>
                </div>
              </div>

              {/* 휴대폰 번호 */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Smartphone className="h-4 w-4" style={{ color: BRAND }} />
                  <p className="font-ko text-base font-bold text-zinc-100">휴대폰 번호</p>
                  {phoneVerified && (
                    <span className="font-ko text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 ml-auto">
                      인증 완료
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {!editingPhone ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={profile.userPhone ? formatPhone(profile.userPhone) : ""}
                        readOnly placeholder="휴대폰 번호를 등록해주세요"
                        className="h-10 bg-zinc-950 border-zinc-800 text-zinc-300 text-sm font-ko placeholder:text-zinc-600" />
                      <button onClick={() => {
                        setTempPhone(profile.userPhone ? formatPhone(profile.userPhone) : "")
                        setEditingPhone(true)
                      }}
                        className="h-10 px-4 rounded-lg border border-zinc-700 font-ko text-sm text-zinc-300 hover:bg-zinc-800 transition-colors shrink-0">
                        {profile.userPhone ? "변경" : "등록"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input value={tempPhone} onChange={handlePhoneInput}
                          placeholder="010-0000-0000"
                          className="h-10 bg-zinc-950 border-zinc-800 text-zinc-200 text-sm font-ko placeholder:text-zinc-600" />
                        <button onClick={() => setShowVerify(true)}
                          className="h-10 px-4 rounded-lg font-ko text-sm text-white shrink-0 transition-colors"
                          style={{ background: BRAND }}>
                          인증번호 발송
                        </button>
                        <button onClick={() => { setEditingPhone(false); setShowVerify(false) }}
                          className="h-10 w-10 flex items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors shrink-0">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {showVerify && (
                        <div className="flex items-center gap-2">
                          <Input value={verifyCode} onChange={e => setVerifyCode(e.target.value)}
                            placeholder="인증번호 6자리" maxLength={6}
                            className="h-10 bg-zinc-950 border-zinc-800 text-zinc-200 text-sm font-space placeholder:text-zinc-600" />
                          <button onClick={confirmPhone}
                            className="h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-ko text-sm text-white shrink-0 transition-colors">
                            확인
                          </button>
                        </div>
                      )}
                      <p className="font-ko text-xs text-zinc-400 leading-relaxed">
                        SMS 인증 발송은 추후 연동될 예정이에요. 지금은 인증번호 입력 없이 확인을 눌러도 번호가 저장돼요.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 알림 설정 */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Bell className="h-4 w-4" style={{ color: BRAND }} />
                  <p className="font-ko text-base font-bold text-zinc-100">알림 설정</p>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-ko text-sm text-zinc-200">복습 알림</p>
                    <p className="font-ko text-xs text-zinc-400 mt-1 leading-relaxed">
                      저장한 노트의 복습 시기가 되면 알림을 보내드려요.
                    </p>
                  </div>
                  <Switch checked={reviewAlarm} onCheckedChange={setReviewAlarm}
                    className="data-[state=checked]:bg-[#63C1ED] shrink-0 mt-0.5" />
                </div>
              </div>

              {/* 마케팅 수신 동의 */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1.5">
                  <Shield className="h-4 w-4" style={{ color: BRAND }} />
                  <p className="font-ko text-base font-bold text-zinc-100">마케팅 수신 동의</p>
                </div>
                <p className="font-ko text-xs text-zinc-400 mb-5 leading-relaxed">
                  동의 시 HiVibe의 새로운 기능, 이벤트, 혜택 정보를 받아볼 수 있어요. 언제든지 철회 가능해요.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-ko text-sm text-zinc-200">이메일 마케팅 수신 동의</p>
                      <p className="font-ko text-xs text-zinc-400 mt-1 leading-relaxed">
                        이벤트, 프로모션, 신규 기능 안내 이메일을 받아요.
                      </p>
                    </div>
                    <Switch checked={marketingEmail} onCheckedChange={setMarketingEmail}
                      className="data-[state=checked]:bg-[#63C1ED] shrink-0 mt-0.5" />
                  </div>

                  <div className="flex items-start justify-between gap-4" style={{ opacity: phoneVerified ? 1 : 0.4 }}>
                    <div>
                      <p className="font-ko text-sm text-zinc-200">SMS 마케팅 수신 동의</p>
                      <p className="font-ko text-xs text-zinc-400 mt-1 leading-relaxed">
                        이벤트, 프로모션 문자를 받아요. 휴대폰 번호 등록 필요.
                      </p>
                      {!phoneVerified && (
                        <p className="font-ko text-xs text-zinc-500 mt-1">휴대폰 번호를 먼저 등록해주세요.</p>
                      )}
                    </div>
                    <Switch checked={marketingSms}
                      onCheckedChange={phoneVerified ? setMarketingSms : undefined}
                      disabled={!phoneVerified}
                      className="data-[state=checked]:bg-[#63C1ED] shrink-0 mt-0.5" />
                  </div>
                </div>
              </div>

              {/* 저장 버튼 */}
              <Button onClick={saveSettings} disabled={savingSettings}
                className="w-full h-11 font-ko font-semibold text-white text-sm"
                style={{ background: BRAND }}>
                {savingSettings ? "저장 중..." : "설정 저장"}
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}