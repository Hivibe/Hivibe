// components/mypage/my-page.tsx
"use client";

import { useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Settings,
  Star,
  Flame,
  FolderOpen,
  BookOpen,
  Edit2,
  Check,
  X,
  Bell,
  Shield,
  Smartphone,
  Camera,
} from "lucide-react";

const BRAND = "#63C1ED";

const TIERS = [
  { name: "Bronze", color: "#CD7F32" },
  { name: "Silver", color: "#C0C0C0" },
  { name: "Gold", color: "#FFD700" },
  { name: "Platinum", color: BRAND },
  { name: "Diamond", color: "#a78bfa" },
];

const BADGES = [
  {
    key: "first_scan",
    icon: "🔍",
    name: "First Scan",
    desc: "첫 코드 분석 완료",
    achieved: true,
    date: "Oct 1, 2025",
  },
  {
    key: "speed_optimizer",
    icon: "⚡",
    name: "Speed Optimizer",
    desc: "처음으로 A+ 달성",
    achieved: true,
    date: "Oct 8, 2025",
  },
  {
    key: "on_fire",
    icon: "🔥",
    name: "On Fire",
    desc: "7일 연속 분석",
    achieved: true,
    date: "Oct 15, 2025",
  },
  {
    key: "bookworm",
    icon: "📚",
    name: "Bookworm",
    desc: "노트 10개 저장",
    achieved: true,
    date: "Oct 20, 2025",
  },
  {
    key: "perfectionist",
    icon: "💯",
    name: "Perfectionist",
    desc: "100점 달성",
    achieved: false,
    date: "",
  },
  {
    key: "concept_master",
    icon: "🧠",
    name: "Concept Master",
    desc: "CS 개념 20개 학습",
    achieved: false,
    date: "",
  },
  {
    key: "polyglot",
    icon: "🌐",
    name: "Polyglot",
    desc: "3개 이상 언어로 분석",
    achieved: false,
    date: "",
  },
  {
    key: "diamond_coder",
    icon: "💎",
    name: "Diamond Coder",
    desc: "Diamond 티어 달성",
    achieved: false,
    date: "",
  },
];

const RECENT = [
  {
    grade: "A+",
    title: "Binary Search Implementation",
    language: "Java",
    langColor: BRAND,
    date: "Oct 20",
  },
  {
    grade: "B+",
    title: "Graph DFS Optimization",
    language: "Python",
    langColor: "#f59e0b",
    date: "Oct 24",
  },
  {
    grade: "A",
    title: "Dynamic Programming – Knapsack",
    language: "Python",
    langColor: "#f59e0b",
    date: "Oct 18",
  },
];

export function MyPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("박성하");
  const [tempName, setTempName] = useState("");

  // 상태 추가
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfileImg(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const [phone, setPhone] = useState("");
  const [editingPhone, setEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [showVerify, setShowVerify] = useState(false);

  const [marketingEmail, setMarketingEmail] = useState(false);
  const [marketingSms, setMarketingSms] = useState(false);
  const [reviewAlarm, setReviewAlarm] = useState(true);
  const [analysisAlarm, setAnalysisAlarm] = useState(true);

  const currentTierIdx = 3;
  const nextTierProgress = 42;

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* 탭 */}
      <div className="border-b border-zinc-800 px-6 flex items-center gap-1 shrink-0 bg-[#0a0a0a]">
        {[
          { id: "profile", label: "프로필", icon: User },
          { id: "settings", label: "설정", icon: Settings },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className="flex items-center gap-1.5 px-4 py-3 font-space text-[11px] tracking-wider border-b-2 transition-all"
            style={
              activeTab === id
                ? { borderColor: BRAND, color: BRAND }
                : { borderColor: "transparent", color: "#52525b" }
            }
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 max-w-3xl mx-auto space-y-5">
          {/* ── 프로필 탭 ── */}
          {activeTab === "profile" && (
            <>
              {/* 프로필 카드 */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex items-center gap-5">
                <div
                  className="relative w-14 h-14 shrink-0 group cursor-pointer"
                  onClick={() => imgRef.current?.click()}
                >
                  {profileImg ? (
                    <img
                      src={profileImg}
                      alt="프로필"
                      className="w-14 h-14 rounded-full object-cover border-2"
                      style={{ borderColor: `${BRAND}44` }}
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center font-syne text-xl font-bold"
                      style={{
                        background: `${BRAND}20`,
                        border: `2px solid ${BRAND}44`,
                        color: BRAND,
                      }}
                    >
                      {name[0]}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                  <input
                    ref={imgRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImgChange}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="h-8 bg-zinc-950 border-zinc-700 text-zinc-200 text-sm font-syne w-40"
                      />
                      <button
                        onClick={() => {
                          setName(tempName);
                          setEditingName(false);
                        }}
                        className="h-7 w-7 flex items-center justify-center rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingName(false)}
                        className="h-7 w-7 flex items-center justify-center rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-syne text-lg font-bold text-zinc-100">
                        {name}
                      </span>
                      <button
                        onClick={() => {
                          setTempName(name);
                          setEditingName(true);
                        }}
                        className="h-6 w-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <p className="font-ko text-xs text-zinc-400 mt-0.5">
                    sungha@hivibe.dev
                  </p>
                  <div className="flex gap-1.5 mt-2">
                    {["Java", "Python", "C++"].map((l) => (
                      <span
                        key={l}
                        className="font-space text-[9px] px-2 py-0.5 rounded-full border"
                        style={{
                          background: `${BRAND}10`,
                          color: BRAND,
                          borderColor: `${BRAND}30`,
                        }}
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="font-space text-[9px] text-zinc-600 tracking-widest uppercase">
                    // TIER
                  </span>
                  <span
                    className="font-syne text-2xl font-bold"
                    style={{ color: BRAND }}
                  >
                    Platinum
                  </span>
                  <div className="w-36">
                    <div className="flex justify-between mb-1">
                      <span className="font-ko text-xs text-zinc-500">
                        Diamond까지
                      </span>
                      <span
                        className="font-ko text-xs"
                        style={{ color: BRAND }}
                      >
                        {nextTierProgress} / 100회
                      </span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${nextTierProgress}%`,
                          background: BRAND,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    icon: (
                      <FolderOpen
                        className="h-4 w-4"
                        style={{ color: BRAND }}
                      />
                    ),
                    val: "42",
                    label: "TOTAL SESSIONS",
                  },
                  {
                    icon: <Star className="h-4 w-4 text-amber-400" />,
                    val: "A",
                    label: "AVG. GRADE",
                  },
                  {
                    icon: <Flame className="h-4 w-4 text-orange-400" />,
                    val: "7일",
                    label: "DAY STREAK",
                  },
                  {
                    icon: <BookOpen className="h-4 w-4 text-violet-400" />,
                    val: "18",
                    label: "SAVED NOTES",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4"
                  >
                    <div className="mb-2">{s.icon}</div>
                    <p className="font-syne text-xl font-bold text-zinc-100">
                      {s.val}
                    </p>
                    <p className="font-ko text-xs text-zinc-400 mt-0.5">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* 티어 트랙 */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
                <p
                  className="font-space text-[9px] tracking-widest mb-1"
                  style={{ color: BRAND }}
                >
                  // TIER TRACK
                </p>
                <p className="font-syne text-sm font-bold text-zinc-100 mb-5">
                  성장 현황
                </p>
                <div className="relative flex items-start justify-between">
                  <div className="absolute top-4 left-4 right-4 h-px bg-zinc-800 z-0" />
                  {TIERS.map((tier, i) => {
                    const done = i < currentTierIdx;
                    const current = i === currentTierIdx;
                    const locked = i > currentTierIdx;
                    return (
                      <div
                        key={tier.name}
                        className="flex flex-col items-center gap-2 z-10 flex-1"
                      >
                        <div
                          className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs bg-zinc-950"
                          style={
                            current
                              ? {
                                  borderColor: tier.color,
                                  color: tier.color,
                                  boxShadow: `0 0 0 4px ${tier.color}15`,
                                }
                              : done
                                ? {
                                    borderColor: `${tier.color}66`,
                                    color: tier.color,
                                  }
                                : { borderColor: "#27272a", color: "#3f3f46" }
                          }
                        >
                          {done ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : locked ? (
                            "🔒"
                          ) : (
                            "👑"
                          )}
                        </div>
                        <span
                          className="font-ko text-xs"
                          style={{
                            color: current
                              ? tier.color
                              : done
                                ? "#71717a"
                                : "#3f3f46",
                          }}
                        >
                          {tier.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 뱃지 */}
              <div>
                <p
                  className="font-space text-[9px] tracking-widest mb-1"
                  style={{ color: BRAND }}
                >
                  // BADGES
                </p>
                <p className="font-syne text-lg font-bold text-zinc-100 mb-3">
                  획득한 뱃지
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {BADGES.map((b) => (
                    <div
                      key={b.key}
                      className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex flex-col items-center gap-2 text-center"
                      style={{ opacity: b.achieved ? 1 : 0.35 }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{
                          background: b.achieved ? `${BRAND}15` : "#27272a",
                        }}
                      >
                        {b.icon}
                      </div>
                      <p className="font-syne text-xs font-bold text-zinc-100 leading-tight">
                        {b.name}
                      </p>
                      <p className="font-ko text-xs text-zinc-400 leading-relaxed">
                        {b.desc}
                      </p>
                      <p
                        className="font-ko text-xs"
                        style={{ color: b.achieved ? BRAND : "#3f3f46" }}
                      >
                        {b.achieved ? b.date : "미획득"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 최근 분석 */}
              <div>
                <p
                  className="font-space text-[9px] tracking-widest mb-1"
                  style={{ color: BRAND }}
                >
                  // RECENT
                </p>
                <p className="font-syne text-lg font-bold text-zinc-100 mb-3">
                  최근 분석
                </p>
                <div className="space-y-2">
                  {RECENT.map((r, i) => (
                    <div
                      key={i}
                      className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-4"
                    >
                      <span
                        className="font-syne text-base font-bold w-8 shrink-0"
                        style={{
                          color: r.grade.startsWith("A") ? BRAND : "#f59e0b",
                        }}
                      >
                        {r.grade}
                      </span>
                      <span className="font-ko text-sm text-zinc-300 flex-1 truncate">
                        {r.title}
                      </span>
                      <span className="font-ko text-xs text-zinc-400 flex items-center gap-1.5 shrink-0">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: r.langColor }}
                        />
                        {r.language} · {r.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── 설정 탭 ── */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              {/* 계정 정보 */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-4 w-4" style={{ color: BRAND }} />
                  <p className="font-syne text-sm font-bold text-zinc-100">
                    계정 정보
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-ko text-xs text-zinc-400 uppercase tracking-wider">
                      이름
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={name}
                        readOnly
                        className="h-9 bg-zinc-950 border-zinc-800 text-zinc-300 text-sm font-ko"
                      />
                      <button
                        onClick={() => {
                          setActiveTab("profile");
                          setTempName(name);
                          setEditingName(true);
                        }}
                        className="h-9 px-3 rounded-lg border border-zinc-800 font-ko text-xs text-zinc-400 hover:bg-zinc-800 transition-colors shrink-0"
                      >
                        수정
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-ko text-xs text-zinc-400 uppercase tracking-wider">
                      이메일
                    </label>
                    <Input
                      value="sungha@hivibe.dev"
                      readOnly
                      className="h-9 bg-zinc-950 border-zinc-800 text-zinc-500 text-sm font-ko"
                    />
                  </div>
                </div>
              </div>

              {/* 휴대폰 번호 */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Smartphone className="h-4 w-4" style={{ color: BRAND }} />
                  <p className="font-syne text-sm font-bold text-zinc-100">
                    휴대폰 번호
                  </p>
                  {phoneVerified && (
                    <span className="font-ko text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 ml-auto">
                      인증 완료
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {!editingPhone ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={phone || ""}
                        readOnly
                        placeholder="휴대폰 번호를 등록해주세요"
                        className="h-9 bg-zinc-950 border-zinc-800 text-zinc-300 text-sm font-ko placeholder:text-zinc-700"
                      />
                      <button
                        onClick={() => {
                          setTempPhone(phone);
                          setEditingPhone(true);
                        }}
                        className="h-9 px-3 rounded-lg border border-zinc-800 font-ko text-xs text-zinc-400 hover:bg-zinc-800 transition-colors shrink-0"
                      >
                        {phone ? "변경" : "등록"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={tempPhone}
                          onChange={(e) => setTempPhone(e.target.value)}
                          placeholder="010-0000-0000"
                          className="h-9 bg-zinc-950 border-zinc-800 text-zinc-200 text-sm font-ko placeholder:text-zinc-700"
                        />
                        <button
                          onClick={() => setShowVerify(true)}
                          className="h-9 px-3 rounded-lg font-ko text-xs text-white shrink-0 transition-colors"
                          style={{ background: BRAND }}
                        >
                          인증번호 발송
                        </button>
                        <button
                          onClick={() => {
                            setEditingPhone(false);
                            setShowVerify(false);
                          }}
                          className="h-9 w-9 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 hover:bg-zinc-800 transition-colors shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {showVerify && (
                        <div className="flex items-center gap-2">
                          <Input
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value)}
                            placeholder="인증번호 6자리"
                            maxLength={6}
                            className="h-9 bg-zinc-950 border-zinc-800 text-zinc-200 text-sm font-ko placeholder:text-zinc-700"
                          />
                          <button
                            onClick={() => {
                              setPhone(tempPhone);
                              setPhoneVerified(true);
                              setEditingPhone(false);
                              setShowVerify(false);
                              setVerifyCode("");
                            }}
                            className="h-9 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-ko text-xs text-white shrink-0 transition-colors"
                          >
                            확인
                          </button>
                        </div>
                      )}
                      <p className="font-ko text-xs text-zinc-400 leading-relaxed">
                        문자로 인증번호가 발송돼요. 인증 후 저장됩니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 알림 설정 */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="h-4 w-4" style={{ color: BRAND }} />
                  <p className="font-syne text-sm font-bold text-zinc-100">
                    알림 설정
                  </p>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      label: "복습 알림",
                      desc: "저장한 노트의 복습 시기가 되면 알림을 보내드려요.",
                      value: reviewAlarm,
                      onChange: setReviewAlarm,
                    },
                    {
                      label: "분석 완료 알림",
                      desc: "AI 분석이 완료되면 알림을 보내드려요.",
                      value: analysisAlarm,
                      onChange: setAnalysisAlarm,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start justify-between gap-4"
                    >
                      <div>
                        <p className="font-ko text-sm text-zinc-200">
                          {item.label}
                        </p>
                        <p className="font-ko text-xs text-zinc-400 mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                      <Switch
                        checked={item.value}
                        onCheckedChange={item.onChange}
                        className="data-[state=checked]:bg-[#63C1ED] shrink-0 mt-0.5"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 마케팅 수신 동의 */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4" style={{ color: BRAND }} />
                  <p className="font-syne text-sm font-bold text-zinc-100">
                    마케팅 수신 동의
                  </p>
                </div>
                <p className="font-ko text-xs text-zinc-400 mb-4 leading-relaxed">
                  동의 시 HiVibe의 새로운 기능, 이벤트, 혜택 정보를 받아볼 수
                  있어요. 언제든지 철회 가능해요.
                </p>
                <div className="space-y-4">
                  {[
                    {
                      label: "이메일 마케팅 수신 동의",
                      desc: "이벤트, 프로모션, 신규 기능 안내 이메일을 받아요.",
                      value: marketingEmail,
                      onChange: setMarketingEmail,
                      disabled: false,
                    },
                    {
                      label: "SMS 마케팅 수신 동의",
                      desc: "이벤트, 프로모션 문자를 받아요. 휴대폰 번호 등록 필요.",
                      value: marketingSms,
                      onChange: setMarketingSms,
                      disabled: !phoneVerified,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start justify-between gap-4"
                      style={{ opacity: item.disabled ? 0.4 : 1 }}
                    >
                      <div>
                        <p className="font-ko text-sm text-zinc-200">
                          {item.label}
                        </p>
                        <p className="font-ko text-xs text-zinc-400 mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                        {item.disabled && (
                          <p className="font-ko text-xs text-zinc-500 mt-0.5">
                            휴대폰 번호를 먼저 등록해주세요.
                          </p>
                        )}
                      </div>
                      <Switch
                        checked={item.value}
                        onCheckedChange={
                          item.disabled ? undefined : item.onChange
                        }
                        disabled={item.disabled}
                        className="data-[state=checked]:bg-[#63C1ED] shrink-0 mt-0.5"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 저장 버튼 */}
              <Button
                className="w-full h-10 font-ko font-semibold text-white text-sm"
                style={{ background: BRAND }}
              >
                설정 저장
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
