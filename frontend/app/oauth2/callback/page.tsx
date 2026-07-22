"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OAuth2CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");

        if (accessToken && refreshToken) {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            router.replace("/main")
        } else {
            router.push("/login");
        }
    }, []);

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <p className="text-zinc-400 font-ko">로그인 처리 중...</p>
        </div>
    );
}

export default function OAuth2CallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <p className="text-zinc-400 font-ko">로그인 처리 중...</p>
            </div>
        }>
            <OAuth2CallbackContent />
        </Suspense>
    );
}