# 📚 Yggdrasil 문서 패키지

> **가천대학교 웹프로그래밍 팀 프로젝트** · 팀명 **Five Guys**
> **프로젝트**: 한국 학생을 위한 일기 도구 (Yggdrasil)
> **발표**: 2026-06-02 (화)

**🇺🇸 English**

> **Gachon University Web Programming Team Project** · Team **Five Guys**
> **Project**: A journaling tool for Korean students (Yggdrasil)
> **Presentation**: 2026-06-02 (Tue)

---

## 1. 이 문서 패키지를 읽는 순서

처음 오신 분(교수님·신규 팀원·외부 검토자)은 다음 순서로 보시면 **5분 안에 전체 그림**이 잡힙니다.

```
1) 본 README                                "전체 그림"
   ↓
2) 프로젝트 기획서 (01_기획/)                  "무엇을 / 왜 만드는가?"
   ↓
3) WBS + 일정 (02_일정/)                      "누가 / 언제까지 / 무엇을?"
   ↓
4) 시스템 아키텍처 (03_설계/)                  "어떻게 작동하는가?"
   ↓
5) DB · API · UI · 컴포넌트 설계 (03_설계/)    역할별 깊이 있게
   ↓
6) 개발 가이드 (04_개발가이드/)                "어떻게 협업하는가?"
```

> **다이어그램 안내**: 위 흐름은 1) 본 README "전체 그림" → 2) 프로젝트 기획서 "무엇을/왜 만드는가" → 3) WBS+일정 "누가/언제까지/무엇을" → 4) 시스템 아키텍처 "어떻게 작동하는가" → 5) DB·API·UI·컴포넌트 설계 "역할별 깊이 있게" → 6) 개발 가이드 "어떻게 협업하는가" 순서입니다.

**🇺🇸 English**

### How to read this document package

If you are new here (professor, new team member, or external reviewer), reading in the following order gives you **the full picture in 5 minutes**.

> **Diagram note**: The flow above reads as 1) This README — "The big picture" → 2) Project Proposal (01_기획/) — "What / Why are we building?" → 3) WBS + Schedule (02_일정/) — "Who / By when / What?" → 4) System Architecture (03_설계/) — "How does it work?" → 5) DB · API · UI · Component design (03_설계/) — in depth by role → 6) Development Guide (04_개발가이드/) — "How do we collaborate?"

---

## 2. 한눈에 보기 (1분 요약)

### 우리가 만드는 것

> **한국 학생을 위한 일기 도구.**
> `#주제` `@인물` `&오브젝트` 3가지 태그를 일기에 자유롭게 적고, **자동 클러스터링되는 3D 그래프(three.js / react-force-graph-3d)**로 자기 자신을 패턴으로 본다.

### 4-pane 화면 미리보기

```
┌──┬──────────┬──────────────────────┬──────────────┐
│📁│ 일기     │ [노트1 ▼] [노트2 ×]   │ 🔍 검색      │
│🌐│ ├ 2026   │ # 오늘 일기            │ 🏷 자주 쓴   │
│  │          │ [@엄마] [#감정조절]   │   태그 9개   │
│  │ + 새파일 │ [&커피]                │ 📅 캘린더     │
└──┴──────────┴──────────────────────┴──────────────┘
   메뉴       파일목록바    Tiptap 멀티탭      우측바
```

> **다이어그램 안내**: 아래 라벨은 좌→우로 "메뉴(menu rail)", "파일목록바(file list pane)", "Tiptap 멀티탭(Tiptap multi-tab editor)", "우측바(right sidebar)"를 의미합니다. 우측바에는 검색(Search), 자주 쓴 태그(frequently used tags), 캘린더(Calendar)가 표시됩니다.

### 차별점 (vs 시중 도구)

| 기능 | Notion | Obsidian | Diarium | **Yggdrasil** |
|---|:---:|:---:|:---:|:---:|
| 의미별 태그 (`#@&`) | ❌ | ❌ | ❌ | ✅ |
| 자동 그래프 클러스터링 | ❌ | △ (수동 링크) | ❌ | ✅ |
| 일기 특화 우측바 (캘린더+태그) | ❌ | ❌ | ✅ | ✅ |
| 한국어 친화 | △ | △ | ❌ | ✅ |
| 무료 | 부분 | 무료 | 유료 | **무료** |

### 팀 (5명, 별명 Five Guys)

| 코드 | 이름 | 역할 |
|---|---|---|
| **PM** | 강두현 | **전체 총괄 관리 PM** |
| **FE팀** | 김진서 + 최윤석 | **프론트엔드 전체** (둘이 자율 분담) |
| **BE** | 김인현 | **백엔드 전체 + API 전체** |
| **인프라** | 김유신 | **인프라 설계** → 이후 **프론트엔드 지원** |

### 기술 스택

| 영역 | 선택 |
|---|---|
| Frontend | **React 19 + Vite 8 + TypeScript 6** (클라이언트 사이드 SPA) |
| 상태/스타일 | **React hooks/Context + CSS** |
| 에디터 | **Tiptap 3 (@tiptap/react)** — 표 GUI + #@& 배지 |
| 3D 그래프 | **react-force-graph-3d (three.js)** |
| 아이콘/태그 | **lucide-react (아이콘) + tippy.js (태그 자동완성)** |
| Backend | **Node.js + Express 5 + TypeScript** |
| DB | **Mongoose 9 / MongoDB** |
| 보안/공통 | **JWT (jsonwebtoken) + bcrypt + cors + helmet + dotenv + winston** |
| Hosting | Vercel (FE) + Railway (BE) + MongoDB Atlas (DB) |

### 일정 (약 2주)

```
W1 (5/20~5/25) 🟢 개발 — 인프라 셋업 + 백엔드/프론트엔드 + MVP 통합
W2 (5/26~6/1)  🟡 점검 — 외부 테스트 + 버그 픽스 + 발표 자료
6/2 (화)       🎯 발표
```

> **다이어그램 안내**: W1 (5/20~5/25) 🟢 Development — infra setup + backend/frontend + MVP integration; W2 (5/26~6/1) 🟡 Review — external testing + bug fixes + presentation materials; 6/2 (Tue) 🎯 Presentation.

**🇺🇸 English**

### 2. At a glance (1-minute summary)

#### What we are building

> **A journaling tool for Korean students.**
> Freely write three kinds of tags — `#topic` `@person` `&object` — in your journal, and see yourself as patterns through an **auto-clustering 3D graph (three.js / react-force-graph-3d)**.

#### 4-pane screen preview

(See the ASCII diagram above. Labels left→right: "menu rail", "file list pane", "Tiptap multi-tab editor", "right sidebar" — the right sidebar shows Search, frequently used tags, and a Calendar.)

#### Differentiators (vs. existing tools)

| Feature | Notion | Obsidian | Diarium | **Yggdrasil** |
|---|:---:|:---:|:---:|:---:|
| Semantic tags (`#@&`) | ❌ | ❌ | ❌ | ✅ |
| Automatic graph clustering | ❌ | △ (manual links) | ❌ | ✅ |
| Journal-focused right sidebar (calendar + tags) | ❌ | ❌ | ✅ | ✅ |
| Korean-language friendly | △ | △ | ❌ | ✅ |
| Free | Partial | Free | Paid | **Free** |

#### Team (5 members, nicknamed Five Guys)

| Code | Name | Role |
|---|---|---|
| **PM** | 강두현 (Doohyun Kang) | **Overall project management (PM)** |
| **FE team** | 김진서 (Jinseo Kim) + 최윤석 (Yunseok Choi) | **Entire frontend** (self-divided between the two) |
| **BE** | 김인현 (Inhyeon Kim) | **Entire backend + entire API** |
| **Infra** | 김유신 (Yushin Kim) | **Infrastructure design** → later **frontend support** |

#### Tech stack

| Area | Choice |
|---|---|
| Frontend | **React 19 + Vite 8 + TypeScript 6** (client-side SPA) |
| State/Style | **React hooks/Context + CSS** |
| Editor | **Tiptap 3 (@tiptap/react)** — table GUI + #@& badges |
| 3D graph | **react-force-graph-3d (three.js)** |
| Icons/Tags | **lucide-react (icons) + tippy.js (tag autocomplete)** |
| Backend | **Node.js + Express 5 + TypeScript** |
| DB | **Mongoose 9 / MongoDB** |
| Security/Common | **JWT (jsonwebtoken) + bcrypt + cors + helmet + dotenv + winston** |
| Hosting | Vercel (FE) + Railway (BE) + MongoDB Atlas (DB) |

#### Schedule (about 2 weeks)

(See the schedule block above: W1 development, W2 review, 6/2 presentation.)

---

## 3. 폴더 구조 (이 docs/ 패키지)

```
docs/
├── README.md                              ← 지금 보고 계신 파일
│
├── 01_기획/
│   └── 프로젝트_기획서.md
│
├── 02_일정/
│   ├── WBS_및_역할분담.md
│   └── 개발_일정표.md
│
├── 03_설계/
│   ├── 시스템_아키텍처.md
│   ├── DB_설계서.md
│   ├── API_명세서.md
│   ├── 화면_설계서.md
│   └── 컴포넌트_설계서.md
│
├── 04_개발가이드/
│   ├── Git_협업_가이드.md
│   └── 코딩_컨벤션.md
│
└── 99_기존자료/                            (기존 산출물 보존)
    ├── prd.md
    ├── 정보구조도.png
    ├── 정보구조도_문서용.md
    ├── backend_mongodb.js
    ├── crud_queries.pdf
    └── Five Guys.xlsx
```

> **다이어그램 안내**: 한글 폴더/파일명 번역 — 01_기획 = Planning (프로젝트_기획서 = Project Proposal); 02_일정 = Schedule (WBS_및_역할분담 = WBS & Role Assignment, 개발_일정표 = Development Schedule); 03_설계 = Design (시스템_아키텍처 = System Architecture, DB_설계서 = DB Design, API_명세서 = API Specification, 화면_설계서 = Screen Design, 컴포넌트_설계서 = Component Design); 04_개발가이드 = Development Guide (Git_협업_가이드 = Git Collaboration Guide, 코딩_컨벤션 = Coding Conventions); 99_기존자료 = Legacy materials (preserved). "지금 보고 계신 파일" = the file you are reading now.

**🇺🇸 English**

### 3. Folder structure (this docs/ package)

See the tree above. Folder name translations are provided in the diagram note directly under the tree.

---

## 4. 문서 인덱스 (전체 10개)

### 🔵 기획 (1)
- [📘 프로젝트 기획서](./01_기획/프로젝트_기획서.md) — 한국 학생용 일기 도구 포지셔닝, 페르소나, 차별점

### 🟢 일정 (2)
- [📋 WBS & 역할분담표](./02_일정/WBS_및_역할분담.md) — 작업 분해 + RACI + 5개 워크 패키지
- [📅 개발 일정표](./02_일정/개발_일정표.md) — 2주 간트차트 + 마일스톤 3개 + 주차별 상세

### 🟣 설계 (5)
- [🏗️ 시스템 아키텍처](./03_설계/시스템_아키텍처.md) — 전체 아키텍처 + 기술 스택 선정 이유
- [💾 DB 설계서](./03_설계/DB_설계서.md) — MongoDB 4개 컬렉션 스키마 + ERD + 인덱스
- [🔌 API 명세서](./03_설계/API_명세서.md) — REST 21개 엔드포인트 + 공통 규칙
- [🎨 화면 설계서](./03_설계/화면_설계서.md) — 9개 페이지 와이어프레임 + 4-pane + 우측바
- [🧩 컴포넌트 설계서](./03_설계/컴포넌트_설계서.md) — React 컴포넌트 트리 + Tiptap + 멀티탭

### 🟡 개발 가이드 (2)
- [🌿 Git 협업 가이드](./04_개발가이드/Git_협업_가이드.md) — 브랜치 전략 + Conventional Commits + PR 룰
- [🎨 코딩 컨벤션](./04_개발가이드/코딩_컨벤션.md) — TS/React/Node 컨벤션 + ESLint/Prettier

**🇺🇸 English**

### 4. Document index (10 documents total)

#### 🔵 Planning (1)
- [📘 Project Proposal](./01_기획/프로젝트_기획서.md) — journaling tool for Korean students: positioning, personas, differentiators

#### 🟢 Schedule (2)
- [📋 WBS & Role Assignment](./02_일정/WBS_및_역할분담.md) — work breakdown + RACI + 5 work packages
- [📅 Development Schedule](./02_일정/개발_일정표.md) — 2-week Gantt chart + 3 milestones + weekly details

#### 🟣 Design (5)
- [🏗️ System Architecture](./03_설계/시스템_아키텍처.md) — overall architecture + rationale for tech stack choices
- [💾 DB Design](./03_설계/DB_설계서.md) — MongoDB 4-collection schema + ERD + indexes
- [🔌 API Specification](./03_설계/API_명세서.md) — 21 REST endpoints + common rules
- [🎨 Screen Design](./03_설계/화면_설계서.md) — 9-page wireframes + 4-pane + right sidebar
- [🧩 Component Design](./03_설계/컴포넌트_설계서.md) — React component tree + Tiptap + multi-tab

#### 🟡 Development Guide (2)
- [🌿 Git Collaboration Guide](./04_개발가이드/Git_협업_가이드.md) — branch strategy + Conventional Commits + PR rules
- [🎨 Coding Conventions](./04_개발가이드/코딩_컨벤션.md) — TS/React/Node conventions + ESLint/Prettier

---

## 5. 역할별 필독 문서

### 👨‍💼 PM — 강두현
- 전 문서 (소유자)

### 🎨 FE팀 — 김진서 (FE1) + 최윤석 (FE2)
1. [기획서](./01_기획/프로젝트_기획서.md) 1회독
2. [시스템 아키텍처](./03_설계/시스템_아키텍처.md) 정독 (2.1 Tiptap, 3.1 4-pane)
3. [화면 설계서](./03_설계/화면_설계서.md) **정독** (전 페이지)
4. [컴포넌트 설계서](./03_설계/컴포넌트_설계서.md) **정독** (전체)
5. [API 명세서](./03_설계/API_명세서.md) — 호출하는 API 부분
6. [Git 가이드](./04_개발가이드/Git_협업_가이드.md), [코딩 컨벤션](./04_개발가이드/코딩_컨벤션.md)

### ⚙️ BE — 김인현
1. [기획서](./01_기획/프로젝트_기획서.md) 1회독
2. [시스템 아키텍처](./03_설계/시스템_아키텍처.md) **정독**
3. [DB 설계서](./03_설계/DB_설계서.md) **정독**
4. [API 명세서](./03_설계/API_명세서.md) **정독** (소유자)
5. [Git 가이드](./04_개발가이드/Git_협업_가이드.md), [코딩 컨벤션](./04_개발가이드/코딩_컨벤션.md)

### ☁️ 인프라 — 김유신
1. [기획서](./01_기획/프로젝트_기획서.md) 1회독
2. [시스템 아키텍처](./03_설계/시스템_아키텍처.md) **정독** (7 환경 분리, 8 보안)
3. [WBS](./02_일정/WBS_및_역할분담.md) **§WP4 인프라 정독**
4. [Git 가이드](./04_개발가이드/Git_협업_가이드.md)

**🇺🇸 English**

### 5. Required reading by role

#### 👨‍💼 PM — 강두현 (Doohyun Kang)
- All documents (owner)

#### 🎨 FE team — 김진서 (Jinseo Kim, FE1) + 최윤석 (Yunseok Choi, FE2)
1. [Proposal](./01_기획/프로젝트_기획서.md) — read once
2. [System Architecture](./03_설계/시스템_아키텍처.md) — read carefully (2.1 Tiptap, 3.1 4-pane)
3. [Screen Design](./03_설계/화면_설계서.md) — **read carefully** (all pages)
4. [Component Design](./03_설계/컴포넌트_설계서.md) — **read carefully** (entire)
5. [API Specification](./03_설계/API_명세서.md) — the API portions you call
6. [Git Guide](./04_개발가이드/Git_협업_가이드.md), [Coding Conventions](./04_개발가이드/코딩_컨벤션.md)

#### ⚙️ BE — 김인현 (Inhyeon Kim)
1. [Proposal](./01_기획/프로젝트_기획서.md) — read once
2. [System Architecture](./03_설계/시스템_아키텍처.md) — **read carefully**
3. [DB Design](./03_설계/DB_설계서.md) — **read carefully**
4. [API Specification](./03_설계/API_명세서.md) — **read carefully** (owner)
5. [Git Guide](./04_개발가이드/Git_협업_가이드.md), [Coding Conventions](./04_개발가이드/코딩_컨벤션.md)

#### ☁️ Infra — 김유신 (Yushin Kim)
1. [Proposal](./01_기획/프로젝트_기획서.md) — read once
2. [System Architecture](./03_설계/시스템_아키텍처.md) — **read carefully** (7 environment separation, 8 security)
3. [WBS](./02_일정/WBS_및_역할분담.md) — **read §WP4 Infra carefully**
4. [Git Guide](./04_개발가이드/Git_협업_가이드.md)

---

## 6. 교수님께 드리는 짧은 가이드

본 프로젝트가 웹프로그래밍 수업의 학습 목표를 어떻게 달성하는지 한 페이지에 정리합니다.

| 학습 항목 | 본 프로젝트 적용 사례 | 관련 문서 |
|---|---|---|
| **HTML / CSS** | 4-pane 반응형 + 디자인 시스템 + 다크/라이트 테마 | [화면 설계서 §7](./03_설계/화면_설계서.md) |
| **JavaScript / TypeScript** | TypeScript 100% — 타입 안정성 | [코딩 컨벤션 §2](./04_개발가이드/코딩_컨벤션.md) |
| **프레임워크** | React 19 + Vite (클라이언트 사이드 SPA) + Tiptap (ProseMirror) WYSIWYG | [시스템 아키텍처 §2.1](./03_설계/시스템_아키텍처.md) |
| **백엔드 서버** | Node.js + Express, REST 21개 엔드포인트 | [API 명세서](./03_설계/API_명세서.md) |
| **데이터베이스** | MongoDB (NoSQL), 4개 컬렉션, 임베드+참조 + 트랜잭션 | [DB 설계서](./03_설계/DB_설계서.md) |
| **CRUD 구현** | Notes, Folders, Users 전체 CRUD + 통합 검색 | [API §3-7](./03_설계/API_명세서.md) |
| **외부 라이브러리 활용** | `@tiptap/react`, `react-force-graph-3d`, `three.js`, `lucide-react`, `tippy.js`, `bcrypt`, `jsonwebtoken`, `winston` 등 | [시스템 아키텍처 §9](./03_설계/시스템_아키텍처.md) |
| **시각화** | 3D Force-directed 그래프 (three.js / react-force-graph-3d) + 자동 클러스터링 | [컴포넌트 설계서 §5.2](./03_설계/컴포넌트_설계서.md) |
| **협업 (Git)** | feature 브랜치 + Conventional Commits + PR 리뷰 + CI | [Git 가이드](./04_개발가이드/Git_협업_가이드.md) |
| **프로젝트 관리** | WBS + RACI + 2주 간트 | [WBS](./02_일정/WBS_및_역할분담.md) |
| **인프라 / 배포** | Vercel + Railway + MongoDB Atlas + GitHub Actions CI | [WBS §WP4](./02_일정/WBS_및_역할분담.md) |
| **문서화** | 본 10개 문서 패키지 (기획·설계·가이드) | 본 README |

**🇺🇸 English**

### 6. A short guide for the professor

This page summarizes how this project achieves the learning objectives of the Web Programming course.

| Learning item | How this project applies it | Related document |
|---|---|---|
| **HTML / CSS** | Responsive 4-pane + design system + dark/light theme | [Screen Design §7](./03_설계/화면_설계서.md) |
| **JavaScript / TypeScript** | 100% TypeScript — type safety | [Coding Conventions §2](./04_개발가이드/코딩_컨벤션.md) |
| **Framework** | React 19 + Vite (client-side SPA) + Tiptap (ProseMirror) WYSIWYG | [System Architecture §2.1](./03_설계/시스템_아키텍처.md) |
| **Backend server** | Node.js + Express, 21 REST endpoints | [API Specification](./03_설계/API_명세서.md) |
| **Database** | MongoDB (NoSQL), 4 collections, embed + reference + transactions | [DB Design](./03_설계/DB_설계서.md) |
| **CRUD implementation** | Full CRUD for Notes, Folders, Users + integrated search | [API §3-7](./03_설계/API_명세서.md) |
| **Use of external libraries** | `@tiptap/react`, `react-force-graph-3d`, `three.js`, `lucide-react`, `tippy.js`, `bcrypt`, `jsonwebtoken`, `winston`, etc. | [System Architecture §9](./03_설계/시스템_아키텍처.md) |
| **Visualization** | 3D force-directed graph (three.js / react-force-graph-3d) + auto-clustering | [Component Design §5.2](./03_설계/컴포넌트_설계서.md) |
| **Collaboration (Git)** | feature branches + Conventional Commits + PR review + CI | [Git Guide](./04_개발가이드/Git_협업_가이드.md) |
| **Project management** | WBS + RACI + 2-week Gantt | [WBS](./02_일정/WBS_및_역할분담.md) |
| **Infrastructure / Deployment** | Vercel + Railway + MongoDB Atlas + GitHub Actions CI | [WBS §WP4](./02_일정/WBS_및_역할분담.md) |
| **Documentation** | This 10-document package (planning · design · guides) | This README |

---

## 7. 자주 묻는 질문 (FAQ)

### Q. 왜 Notion/Obsidian 안 쓰고 직접 만드나요?

**A.** Notion은 일기에 너무 무겁고, Obsidian은 한국 학생에게 너무 어렵습니다. 우리는 **한국 학생이 부담 없이 시작하고 시간이 지나면 자기 자신을 패턴으로 볼 수 있는** 일기 도구를 만듭니다.

### Q. 차별점이 정말 있나요?

**A.** **3가지 의미별 태그(`#@&`) + 자동 클러스터링 그래프 + 한국어 일기 워크플로우**의 조합은 시중에 없습니다. 학기 프로젝트의 학습 목표는 "차별성"보다 "**라이브러리를 조합해 가치를 만드는 능력**"입니다.

### Q. 가장 어려운 부분은?

**A.** **Tiptap (ProseMirror) 학습 + 3D 그래프 자동 클러스터링 + 멀티탭 + 우측바** 4가지가 무겁습니다. FE팀(2명)이 분담하고, W1부터 사전 학습/PoC를 진행합니다.

**🇺🇸 English**

### 7. Frequently Asked Questions (FAQ)

#### Q. Why build it yourself instead of using Notion/Obsidian?

**A.** Notion is too heavy for journaling, and Obsidian is too difficult for Korean students. We are building a journaling tool that **lets Korean students start without pressure and, over time, see themselves as patterns**.

#### Q. Is there really a differentiator?

**A.** The combination of **three semantic tags (`#@&`) + an auto-clustering graph + a Korean journaling workflow** does not exist on the market. The learning objective of a semester project is less about "differentiation" and more about "**the ability to combine libraries to create value**".

#### Q. What is the hardest part?

**A.** Four things are demanding: **learning Tiptap (ProseMirror) + 3D graph auto-clustering + multi-tab + right sidebar**. The FE team (2 members) divides the work and begins pre-study/PoC from W1.

---

## 8. 마일스톤 (계획)

| 마일스톤 | 목표 일자 | 검증 기준 |
|---|---|---|
| **M1 — 셋업 + 핵심 도메인** | 2026-05-22 (목) | 인프라 셋업 + 인증 + 노트/폴더 CRUD + 4-pane |
| **M2 — MVP 통합** | 2026-05-25 (일) | Tiptap + 3D 그래프 + 우측바 + FE-BE 통합 |
| **M3 — 시연 + 발표** | 2026-06-02 (화) | 외부 테스트 + 시연 영상 + 발표 |

**🇺🇸 English**

### 8. Milestones (plan)

| Milestone | Target date | Acceptance criteria |
|---|---|---|
| **M1 — Setup + core domain** | 2026-05-22 (Thu) | Infra setup + authentication + Notes/Folders CRUD + 4-pane |
| **M2 — MVP integration** | 2026-05-25 (Sun) | Tiptap + 3D graph + right sidebar + FE-BE integration |
| **M3 — Demo + presentation** | 2026-06-02 (Tue) | External testing + demo video + presentation |

---

## 9. 연락 / 협업 채널

| 채널 | 용도 |
|---|---|
| **GitHub Issues** | 버그·기능 추적, 라벨링 |
| **GitHub Projects** | 칸반 (Backlog → Done) |
| **Discord** | 실시간 소통, 데일리 스탠드업, 회의 |
| **카카오톡** | 긴급 알림 |
| **이 docs/ 폴더** | 모든 명세·결정사항 (Source of Truth) |

> **저장소**: GitHub 조직 **GC-Five-Guys** — 3개 저장소: **FiveGuys-Frontend** (React + Vite), **FiveGuys-Backend** (Express + MongoDB), **Docs** (본 패키지). 브랜치 흐름: feature/* → dev → main, 모든 PR에서 CI 실행.

**🇺🇸 English**

### 9. Contact / Collaboration channels

| Channel | Purpose |
|---|---|
| **GitHub Issues** | Bug/feature tracking, labeling |
| **GitHub Projects** | Kanban (Backlog → Done) |
| **Discord** | Real-time communication, daily standup, meetings |
| **KakaoTalk** | Urgent notifications |
| **This docs/ folder** | All specs and decisions (Source of Truth) |

> **Repositories**: GitHub organization **GC-Five-Guys** — 3 repositories: **FiveGuys-Frontend** (React + Vite), **FiveGuys-Backend** (Express + MongoDB), **Docs** (this package). Branch flow: feature/* → dev → main, with CI running on every PR.

---

## 10. 라이선스

본 프로젝트는 **학기 과제** 목적. 외부 공개 시 라이선스 별도 명시 예정.

**🇺🇸 English**

### 10. License

This project is for **semester coursework** purposes. A license will be specified separately if it is published externally.

---

> 📌 **시작 지점**: [📘 프로젝트 기획서](./01_기획/프로젝트_기획서.md)
> 또는 본인 역할에 해당하는 §5 "역할별 필독 문서" 섹션부터 시작하세요.

> 📌 **Starting point**: [📘 Project Proposal](./01_기획/프로젝트_기획서.md)
> Or start from the §5 "Required reading by role" section that matches your role.
