// app/signup/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Github, Eye, EyeOff, ArrowLeft, Check } from "lucide-react";

const BRAND = "#63C1ED";
const LANGUAGES = ["Java", "Python", "JS", "TS", "C++", "C"]; // 배지 간격을 위해 짧게 수정

export default function SignupPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [selLangs, setSelLangs] = useState<string[]>([]);
  const [emailDuplicate, setEmailDuplicate] = useState<boolean | null>(null); // 여기로
  const [checkingEmail, setCheckingEmail] = useState(false); // 여기로

  const toggleLang = (lang: string) =>
    setSelLangs((p) =>
      p.includes(lang) ? p.filter((l) => l !== lang) : [...p, lang],
    );

  const pwMatch = password && password2 && password === password2;

  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");
    if (!pwMatch) { setError("비밀번호가 일치하지 않습니다."); return; }
    if (emailDuplicate === null) { setError("이메일 중복확인을 해주세요."); return; }
    if (emailDuplicate === true) { setError("이미 사용 중인 이메일입니다."); return; }

    try {
      const res = await fetch("http://localhost:8080/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lgnId: email,       // 이메일을 아이디로 사용
          lgnPwsd: password,
          userNm: name,
          userEmail: email,
          mktgAgreeYn: false,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg);
        return;
      }

      router.push("/login");
    } catch (e) {
      setError("서버 연결에 실패했습니다.");
    }
  };

  const checkEmail = async () => {
    if (!email) return;
    setCheckingEmail(true);

    try {
      const res = await fetch(
        `http://localhost:8080/api/users/check-email?userEmail=${email}`
      );
      const isDuplicate = await res.json();
      setEmailDuplicate(isDuplicate);
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setCheckingEmail(false);
    }
  };

  return (
    <div className="font-ko min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* NAV - 로그인이랑 높이/스타일 통일 */}
      <nav className="h-14 flex items-center px-6 border-b border-zinc-800/50">
        <Link
          href="/"
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-space text-xs">홈으로</span>
        </Link>
        <span
          className="font-syne text-lg font-bold mx-auto"
          style={{ color: BRAND }}
        >
          HiVibe
        </span>
        <div className="w-20" /> {/* 좌우 밸런스용 */}
      </nav>

      {/* MAIN */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[400px]">
          {" "}
          {/* 로그인과 동일하게 400px 고정 */}
          {/* 헤딩 */}
          <div className="text-center mb-8">
            <p
              className="font-space text-[10px] tracking-widest mb-3"
              style={{ color: BRAND }}
            >
              // GET STARTED
            </p>
            <h1 className="font-syne text-3xl font-bold text-zinc-100 mb-2">
              회원가입
            </h1>
            <p className="font-ko text-sm text-zinc-400">
              HiVibe와 함께 코딩 실력을 레벨업해 보세요
            </p>
          </div>
          {/* 카드 - 로그인이랑 똑같은 bg-[#111111] 적용 */}
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-8 space-y-4">
            {/* 소셜 로그인 - 높이 h-11로 통일 */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-11 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-2 font-ko text-xs"
                onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5 shrink-0"
                  aria-hidden="true"
                >
                  <path
                    fill="#EA4335"
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                  />
                  <path
                    fill="#FFC107"
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                  />
                  <path
                    fill="#1976D2"
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24 12.0004 24Z"
                  />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                className="h-11 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-2 font-ko text-xs"
                onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/github`}
              >
                <Github className="w-3.5 h-3.5 shrink-0" />
                GitHub
              </Button>
            </div>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-zinc-800" />
              <span className="font-space flex-shrink-0 mx-4 text-zinc-600 text-[10px] tracking-wider">
                OR
              </span>
              <div className="flex-grow border-t border-zinc-800" />
            </div>

            {/* 입력 폼 - 라벨 스타일 및 h-11 통일 */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="font-space text-[10px] text-zinc-500 uppercase tracking-wider">
                  Name
                </label>
                <Input
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 bg-zinc-900/50 border-zinc-800 font-ko text-sm focus-visible:ring-1"
                  style={{ ["--ring" as string]: BRAND }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-space text-[10px] text-zinc-500 uppercase tracking-wider">
                  Email
                </label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailDuplicate(null);
                    }}
                    className="h-11 bg-zinc-900/50 border-zinc-800 font-ko text-sm focus-visible:ring-1"
                    style={{ ["--ring" as string]: BRAND }}
                  />
                  <Button
                    type="button"
                    onClick={checkEmail}
                    disabled={!email || checkingEmail}
                    className="h-11 px-3 text-xs font-ko shrink-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                  >
                    {checkingEmail ? "확인중" : "중복확인"}
                  </Button>
                </div>
                {emailDuplicate === true && (
                  <p className="font-space text-[9px] text-rose-400">
                    이미 사용 중인 이메일입니다
                  </p>
                )}
                {emailDuplicate === false && (
                  <p className="font-space text-[9px] text-emerald-400">
                    사용 가능한 이메일입니다
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-space text-[10px] text-zinc-500 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="8자 이상"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-zinc-900/50 border-zinc-800 font-ko text-sm focus-visible:ring-1 pr-10"
                    style={{ ["--ring" as string]: BRAND }}
                  />
                  <button
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-space text-[10px] text-zinc-500 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showPw2 ? "text" : "password"}
                    placeholder="비밀번호 재입력"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    className={`h-11 bg-zinc-900/50 border-zinc-800 font-ko text-sm focus-visible:ring-1 pr-10 ${password2
                      ? pwMatch
                        ? "border-emerald-500/50"
                        : "border-rose-500/50"
                      : ""
                      }`}
                    style={{ ["--ring" as string]: BRAND }}
                  />
                  <button
                    onClick={() => setShowPw2(!showPw2)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPw2 ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {password2 && (
                  <p
                    className={`font-space text-[9px] mt-1 ${pwMatch ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {pwMatch
                      ? "비밀번호가 일치합니다"
                      : "비밀번호가 일치하지 않습니다"}
                  </p>
                )}
              </div>

              {/* 주 사용 언어 - 높이 줄이기 위해 간격 조절 */}
              <div className="space-y-2">
                <label className="font-space text-[10px] text-zinc-500 uppercase tracking-wider">
                  Langs
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => toggleLang(lang)}
                      className="font-space text-[9px] px-2.5 py-1 rounded-full border transition-all"
                      style={
                        selLangs.includes(lang)
                          ? {
                            background: `${BRAND}15`,
                            color: BRAND,
                            borderColor: `${BRAND}40`,
                          }
                          : { color: "#555", borderColor: "#222" }
                      }
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full h-11 font-ko font-semibold text-white text-sm mt-2"
                style={{ background: BRAND }}
                onClick={handleSignup}
                disabled={
                  emailDuplicate === null ||
                  emailDuplicate === true ||
                  !password ||
                  !pwMatch
                }
              >
                회원가입
              </Button>

              {error && (
                <p className="font-ko text-xs text-rose-400 text-center mt-2">{error}</p>
              )}
            </div>
          </div>
          {/* 푸터 링크 */}
          <p className="text-center font-ko text-sm text-zinc-500 mt-6">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-semibold hover:underline"
              style={{ color: BRAND }}
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
