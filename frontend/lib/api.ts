// lib/api.ts
const BASE_URL = "http://localhost:8080"

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
  const isFormData = options.body instanceof FormData

  const headers: HeadersInit = {
    ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    window.location.href = "/login"
    throw new Error("인증이 만료되었어요. 다시 로그인해 주세요.")
  }

  return res
}