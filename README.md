# HiVibe 🎯

> **Hi, your code. High, your vibe.**

코드를 작성하고 AI에게 분석을 받은 뒤,  
진단 결과를 기반으로 맞춤 학습과 기록, 성장 관리까지 이어지는  
**AI 기반 올인원 코딩 학습 플랫폼**입니다.

---

## 🔗 배포 URL

| 환경 | URL |
|---|---|
| Frontend | https://www.hivibe.cloud |
| Backend API | https://hivibe.cloud |

---

## 💡 서비스 소개

기존 코딩 학습 서비스는 문제 풀이와 정답 확인에 집중되어 있어  
문제 해결 이후 작성한 코드의 품질을 분석하거나 개선 방향을 학습하는 과정은 사용자의 몫으로 남는 경우가 많습니다.

HiVibe는 이러한 학습의 단절을 개선하기 위해

**코드 작성 → AI 진단 → 맞춤 학습 → 기록 → 성장 관리**

과정을 하나의 서비스 안에서 연결합니다.

---

## 🛠 기술 스택

### Frontend
- Next.js 16
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- prism-react-renderer

### Backend
- Java 21
- Spring Boot 3
- Spring Security
- JWT
- Spring Data JPA
- MySQL

### AI
- Gemini 3.8 Flash
- 숙명여자대학교 FactChat API Gateway
- AI 응답 검증 및 점수 보정 로직

### Infrastructure
- Vercel — Frontend
- AWS EC2 — Backend
- AWS RDS — MySQL
- Nginx
- Let's Encrypt / HTTPS
- Docker

### Collaboration
- Git
- GitHub

---

## ✨ 주요 기능

### 🔍 AI 코드 진단

- Java, Python, JavaScript, TypeScript, C, C++ 6개 언어 지원
- Gemini 기반 AI 코드 분석
- 정확성 / 효율성 / 가독성 / 스타일 4개 항목 평가
- 항목별 점수 및 종합 점수 제공
- S / A / B / C / F 등급 제공
- 시간복잡도 및 공간복잡도 분석
- 코드 문제점 및 개선 방향 제시
- 최적화 코드 자동 생성
- 이전 진단 기록 조회 및 삭제

AI 응답을 그대로 사용하지 않고 서버에서 응답 구조와 점수 범위를 검증하고,  
항목별 평가 결과를 기반으로 최종 점수를 재계산하여 분석 결과의 일관성을 높였습니다.

---

### 📚 맞춤형 코드 학습

- 코드 진단 결과 기반 AI 학습 세션 자동 생성
- 최적화 코드를 활용한 빈칸 채우기 학습
- 단계별 힌트 제공
- AI 기반 학습 결과 채점
- 관련 개념 설명 제공
- 학습 완료 결과 저장
- 학습 성과를 사용자 성장 시스템에 반영

단순히 분석 결과를 확인하는 데서 끝나지 않고  
사용자가 개선된 코드를 직접 다시 학습할 수 있도록 구성했습니다.

---

### 📝 노트

- 학습 완료 시 학습 노트 자동 생성
- 사용자가 직접 작성하는 개인 노트
- 학습 노트 / 개인 노트 유형별 구분
- 즐겨찾기 기능
- 태그 관리
- 프로그래밍 언어별 필터링
- 노트 유형별 필터링
- 코드 스냅샷 저장
- Syntax Highlighting 지원

진단과 학습 과정에서 얻은 내용을 별도의 도구 없이  
HiVibe 안에서 지속적으로 기록하고 복습할 수 있습니다.

---

### 🏆 뱃지 시스템

총 **13종의 뱃지**를 획득할 수 있습니다.

| 카테고리 | 뱃지 | 조건 |
|---|---|---|
| 진단 | 🔍 First Scan | 첫 진단 완료 |
| 진단 | ⚡ Speed Optimizer | 진단 점수 90점 이상 달성 |
| 진단 | 💯 Perfectionist | 진단 점수 100점 달성 |
| 진단 | 🏆 Grade S | S등급 달성 |
| 진단 | 🌐 Polyglot | 3개 이상 언어로 분석 |
| 진단 | 🔥 On Fire | 7일 연속 활동 |
| 진단 | 📅 Consistent | 30일 연속 활동 |
| 진단 | 🎖️ Code Veteran | 진단 50회 이상 |
| 노트 | 📚 Bookworm | 노트 10개 저장 |
| 노트 | 📖 Note Master | 노트 30개 저장 |
| 학습 | 🎓 First Learner | 첫 학습 완료 |
| 학습 | ✨ Perfect Answer | 빈칸 채우기 100% 정답 |
| 학습 | 💪 Study Hard | 학습 10회 완료 |

---

### 📈 사용자 성장 관리

#### 티어 시스템

사용자의 활동 횟수를 기반으로 다음과 같은 티어를 제공합니다.

**Bronze → Silver → Gold → Platinum → Diamond**

완료한 학습 성과도 함께 반영하여  
학습 성과가 우수한 경우 다음 티어 승급에 필요한 활동 기준이 일부 단축됩니다.

#### 연속 학습 기록

- 진단 및 학습 활동 기록 관리
- 일별 활동 여부 저장
- 현재 연속 학습일 계산
- 동일 날짜 중복 활동 처리

이를 통해 사용자가 지속적으로 학습할 수 있도록 동기를 제공합니다.

---

### 👤 마이페이지

- 프로필 사진 및 이름 수정
- 현재 티어 및 다음 티어 진행도 확인
- 총 활동 횟수 확인
- 총 진단 수 및 평균 등급 확인
- 연속 학습일 확인
- 획득한 뱃지 목록 확인
- 최근 학습 기록 확인
- 학습 성과 기반 티어 승급 보너스 확인
- 성과 카드 이미지 생성
- 성과 카드 공유 및 이미지 복사
- 휴대폰 번호 등록
- 알림 설정
- 마케팅 수신 동의

---

### 🔐 인증

- 이메일 / 비밀번호 회원가입 및 로그인
- Google OAuth2 소셜 로그인
- GitHub OAuth2 소셜 로그인
- JWT 기반 인증 및 인가
- Access Token / Refresh Token 관리

---

## 🤖 AI 연동 구조

HiVibe는 Gemini API를 직접 호출하지 않고  
**숙명여자대학교 FactChat API Gateway**를 통해 AI 모델을 사용합니다.

```text
HiVibe Backend
      │
      ▼
FactChat API Gateway
      │
      ▼
Gemini 3.8 Flash
```

AI API Key와 Gateway URL, 모델 정보는 서버 환경변수를 통해 관리합니다.

```yaml
factchat:
  api-key: ${FACTCHAT_API_KEY}
  base-url: ${OPENAI_BASE_URL:https://factchat-cloud.mindlogic.ai/v1/gateway}
  model: ${FACTCHAT_MODEL:gemini-3.8-flash}
```

---

## 🔄 서비스 흐름

```text
코드 입력
   ↓
AI 코드 진단
   ↓
분석 결과 및 개선 코드 제공
   ↓
맞춤형 학습 생성
   ↓
빈칸 채우기 및 AI 채점
   ↓
학습 결과 및 노트 저장
   ↓
티어 · 뱃지 · 연속 학습일 반영
```

HiVibe는 코드 분석을 일회성 피드백으로 끝내지 않고

**Diagnosis → Learning → Record → Growth**

로 이어지는 반복 학습 구조를 제공합니다.

---

## 🏗 배포 구조

```text
User
 │
 ▼
www.hivibe.cloud
 │
 ▼
Next.js Frontend
(Vercel)
 │
 │ HTTPS API Request
 ▼
hivibe.cloud
 │
 ▼
Nginx
 │
 ▼
Spring Boot Backend
(AWS EC2)
 │
 ├──────────────► FactChat API Gateway
 │                    │
 │                    ▼
 │              Gemini 3.8 Flash
 │
 ▼
AWS RDS
(MySQL)
```

---

## 📁 프로젝트 구조

```text
Hivibe/
├── frontend/                      # Next.js Frontend
│   ├── app/                       # 페이지 라우팅
│   ├── components/                # UI 컴포넌트
│   │   ├── mypage/                # 마이페이지
│   │   └── notes/                 # 노트
│   └── lib/                       # API 및 공통 유틸리티
│
└── server/                        # Spring Boot Backend
    └── src/main/java/com/hivibe/server/
        ├── activity/              # 사용자 활동 및 연속 학습 기록
        ├── ai/                    # AI 코드 진단
        ├── badge/                 # 뱃지 시스템
        ├── dgns/                  # 코드 진단
        ├── lrn/                   # 맞춤 학습
        ├── mypage/                # 마이페이지
        ├── note/                  # 노트
        ├── sign/                  # 회원가입 / 로그인
        └── config/                # Security / JWT / OAuth2 설정
```

---

## 👥 팀원 및 역할

| 이름 | 역할 |
|---|---|
| 박성하 | Backend / Frontend — AI 코드 진단, 노트, 뱃지, 마이페이지, 배포 |
| 안지우 | Backend / Frontend — 맞춤 학습/퀴즈, 티어 시스템, 로그인 및 인증 |

---

## 🎯 HiVibe가 해결하고자 하는 문제

기존 코딩 학습은 주로 다음과 같은 흐름으로 끝나는 경우가 많습니다.

```text
문제 풀이 → 정답 확인 → 종료
```

HiVibe는 문제 풀이 이후의 과정까지 연결합니다.

```text
코드 작성
   ↓
코드 진단
   ↓
개선 방향 확인
   ↓
맞춤 학습
   ↓
학습 기록
   ↓
지속적인 성장 관리
```

사용자가 자신의 코드에서 부족한 부분을 파악하고,  
개선된 코드를 직접 학습하며 그 과정을 지속적으로 기록할 수 있도록 하는 것이 HiVibe의 목표입니다.

---

## 📌 핵심 키워드

`AI Code Review` `Personalized Learning` `Coding Test`  
`Spring Boot` `Next.js` `Gemini` `FactChat` `Growth Tracking`
