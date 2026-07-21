// app/login/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Github, Eye, EyeOff, ArrowLeft } from "lucide-react";

const BRAND = "#63C1ED";

export default function LoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      const res = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lgnId: email, lgnPwsd: password }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg);
        return;
      }

      const data = await res.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      router.push("/main");
    } catch (e) {
      setError("서버 연결에 실패했습니다.");
    }
  };

  return (
    <div className="font-ko min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* NAV */}
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
        <div className="w-20" />
      </nav>

      {/* MAIN */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          {/* 헤딩 */}
          <div className="text-center mb-8">
            <p
              className="font-space text-[10px] tracking-widest mb-3"
              style={{ color: BRAND }}
            >
              // WELCOME BACK
            </p>
            <h1 className="font-syne text-3xl font-bold text-zinc-100 mb-2">
              로그인
            </h1>
            <p className="font-ko text-sm text-zinc-400">
              HiVibe에 다시 오신 걸 환영해요
            </p>
          </div>

          {/* 카드 */}
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-8 space-y-4">
            {/* 소셜 로그인 */}
            <Button
              variant="outline"
              className="w-full h-11 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-3 font-ko text-sm"
              onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 shrink-0"
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
              Google로 계속하기
            </Button>

            <Button
              variant="outline"
              className="w-full h-11 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-3 font-ko text-sm"
              onClick={() => window.location.href = "http://localhost:8080/oauth2/authorization/github"}
            >
              <Github className="w-4 h-4 shrink-0" />
              GitHub로 계속하기
            </Button>

            {/* 구분선 */}
            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-zinc-800" />
              <span className="font-space flex-shrink-0 mx-4 text-zinc-600 text-[10px] tracking-wider">
                OR
              </span>
              <div className="flex-grow border-t border-zinc-800" />
            </div>

            {/* 이메일/비밀번호 */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="font-space text-[10px] text-zinc-500 uppercase tracking-wider">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-zinc-900/50 border-zinc-800 font-ko text-sm focus-visible:ring-1"
                  style={{ ["--ring" as string]: BRAND }}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-space text-[10px] text-zinc-500 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    href="#"
                    className="font-space text-[10px] hover:underline"
                    style={{ color: BRAND }}
                  >
                    비밀번호 찾기
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-zinc-900/50 border-zinc-800 font-ko text-sm pr-10 focus-visible:ring-1"
                    style={{ ["--ring" as string]: BRAND }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>


              <Button
                className="w-full h-11 font-ko font-semibold text-white text-sm mt-2"
                style={{ background: BRAND }}
                onClick={handleLogin}
              >
                로그인
              </Button>

              {error && (
                <p className="font-ko text-xs text-rose-400 text-center mt-2">{error}</p>
              )}
            </div>
          </div>

          {/* 회원가입 링크 */}
          <p className="text-center font-ko text-sm text-zinc-500 mt-6">
            계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="font-semibold hover:underline"
              style={{ color: BRAND }}
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
