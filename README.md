# HiVibe 🎯

> AI 기반 코드 분석 및 학습 플랫폼

코드를 작성하고 AI에게 분석을 받은 뒤, 최적화된 코드로 학습까지 이어지는 올인원 코딩 성장 플랫폼입니다.

---

## 🔗 배포 URL

| 환경 | URL |
|---|---|
| 프론트엔드 | https://hivibe-production-a5f6.up.railway.app |
| 백엔드 | https://hivibe-production.up.railway.app |

---

## 🛠 기술 스택

### Frontend
- Next.js 16 / React / TypeScript
- Tailwind CSS / shadcn/ui
- prism-react-renderer (코드 하이라이팅)

### Backend
- Spring Boot 3 / Java 21
- Spring Security / JWT
- JPA / MySQL
- Google Gemini API

### Infrastructure
- AWS RDS (MySQL)
- Railway (배포)
- Docker

---

## ✨ 주요 기능

### 🔍 코드 진단
- Java, Python, JavaScript, TypeScript, C, C++ 6개 언어 지원
- Google Gemini AI 기반 코드 분석
- 정확성 / 효율성 / 가독성 / 스타일 4개 항목 점수 및 등급(S/A/B/C/F) 제공
- 시간복잡도 분석 및 개선 방안 제시
- 최적화 코드 자동 생성
- 이전 진단 기록 불러오기 및 삭제

### 📚 코드 학습
- 진단 결과 기반 AI 학습 세션 자동 생성
- 최적화 코드의 핵심 부분을 빈칸으로 제공하는 빈칸 채우기 방식
- 힌트 시스템 및 AI 채점 기능
- 학습 개념 설명 제공

### 📝 노트
- 학습 완료 후 노트 자동 저장 (학습 노트)
- 직접 작성하는 자유 노트
- 즐겨찾기 / 태그 / 언어별 필터링
- 코드 스냅샷 저장 및 syntax highlighting

### 🏆 뱃지 시스템
총 13종의 뱃지 획득 가능

| 카테고리 | 뱃지 | 조건 |
|---|---|---|
| 진단 | 🔍 First Scan | 첫 진단 완료 |
| 진단 | ⚡ Speed Optimizer | 90점 이상 달성 |
| 진단 | 💯 Perfectionist | 100점 달성 |
| 진단 | 🏆 Grade S | S등급 달성 |
| 진단 | 🌐 Polyglot | 3개 이상 언어로 분석 |
| 진단 | 🔥 On Fire | 7일 연속 분석 |
| 진단 | 📅 Consistent | 30일 연속 분석 |
| 진단 | 🎖️ Code Veteran | 진단 50회 이상 |
| 노트 | 📚 Bookworm | 노트 10개 저장 |
| 노트 | 📖 Note Master | 노트 30개 저장 |
| 학습 | 🎓 First Learner | 첫 학습 완료 |
| 학습 | ✨ Perfect Answer | 빈칸 채우기 100% 정답 |
| 학습 | 💪 Study Hard | 학습 10회 완료 |

### 👤 마이페이지
- 프로필 사진 / 이름 수정
- 티어 시스템 (Bronze → Silver → Gold → Platinum → Diamond)
- 진단 통계 (총 진단 수, 평균 등급)
- 획득한 뱃지 목록
- 최근 학습 노트 히스토리
- 휴대폰 번호 등록
- 알림 설정 / 마케팅 수신 동의

### 🔐 인증
- 이메일 / 비밀번호 로그인 및 회원가입
- Google / GitHub 소셜 로그인 (OAuth2)
- JWT 기반 인증

---

## 📁 프로젝트 구조

```
Hivibe/
├── frontend/          # Next.js 프론트엔드
│   ├── app/           # 페이지 라우팅
│   ├── components/    # UI 컴포넌트
│   └── lib/           # API 유틸리티
└── server/            # Spring Boot 백엔드
    └── src/main/java/com/hivibe/server/
        ├── ai/        # Gemini AI 연동
        ├── badge/     # 뱃지 시스템
        ├── dgns/      # 진단 기능
        ├── mypage/    # 마이페이지
        ├── note/      # 노트 기능
        ├── sign/      # 회원가입/로그인
        └── config/    # 보안/JWT 설정
```

---

## 👥 팀원 및 역할

| 이름 | 역할 |
|---|---|
| 박성하 | 백엔드/프론트엔드 (진단, 노트, 뱃지, 마이페이지, 배포) |
| 안지우 | 백엔드/프론트엔드 (학습, 티어, 로그인, 인증) |
