# 🔌 API 명세서 (REST)

> **대상 독자**: 백엔드 개발자 (BE1, BE2) + 프론트엔드 (FE1, FE2)
> **선행 문서**: [`DB_설계서.md`](./DB_설계서.md)
> **버전**: v1 (2026-05-19)
> **Base URL**: `http://localhost:4000/api/v1` (개발) / `https://api.tri-link.app/api/v1` (운영)

---

## 1. 공통 규칙

### 1.1 인증

- 방식: **JWT Bearer Token** (HTTP `Authorization` 헤더)
- 토큰 발급: `POST /auth/login`, `POST /auth/signup`
- 만료: 7일
- 헤더 예시:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1.2 요청 / 응답 형식

- Content-Type: `application/json`
- 인코딩: UTF-8
- 날짜: **ISO 8601** UTC (`2026-05-19T10:00:00.000Z`)
- ID: MongoDB ObjectId 24자리 hex 문자열

### 1.3 표준 응답 포맷

**성공 응답**:
```json
{
  "success": true,
  "data": { ... }
}
```

**에러 응답**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "이메일 형식이 올바르지 않습니다.",
    "details": [
      { "field": "email", "rule": "format" }
    ]
  }
}
```

### 1.4 표준 HTTP 상태 코드

| 코드 | 의미 | 사용 시점 |
|---|---|---|
| `200 OK` | 조회/수정 성공 | GET, PUT, PATCH |
| `201 Created` | 생성 성공 | POST |
| `204 No Content` | 삭제 성공, 응답 본문 없음 | DELETE |
| `400 Bad Request` | 요청 형식 오류 / 검증 실패 | zod 검증 실패 |
| `401 Unauthorized` | 인증 실패 / 토큰 없음 | JWT 없음·만료 |
| `403 Forbidden` | 권한 없음 (남의 노트 접근) | 자원 소유자 아님 |
| `404 Not Found` | 자원 없음 | 존재하지 않는 ID |
| `409 Conflict` | 중복 (이메일 등) | unique 위반 |
| `422 Unprocessable` | 비즈니스 룰 위반 | 폴더 순환 참조 등 |
| `500 Internal Server Error` | 서버 오류 | 예상치 못한 예외 |

### 1.5 에러 코드 카탈로그

| `code` | 의미 |
|---|---|
| `VALIDATION_ERROR` | 입력 검증 실패 |
| `UNAUTHORIZED` | 인증 필요 |
| `FORBIDDEN` | 권한 없음 |
| `NOT_FOUND` | 자원 없음 |
| `CONFLICT` | 중복 |
| `INVALID_TOKEN` | 토큰 무효 |
| `TOKEN_EXPIRED` | 토큰 만료 |
| `INTERNAL_ERROR` | 서버 내부 오류 |

### 1.6 페이지네이션 (목록 API 공통)

쿼리 파라미터:
- `page` (number, 기본 1)
- `limit` (number, 기본 20, 최대 100)
- `sort` (string, 기본 `-updated_at`)

응답:
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 47,
      "total_pages": 3
    }
  }
}
```

---

## 2. 엔드포인트 요약

| Method | Path | 인증 | 설명 | 담당 |
|:---:|---|:---:|---|:---:|
| **Auth** | | | | |
| POST | `/auth/signup` | ❌ | 회원가입 | BE1 |
| POST | `/auth/login` | ❌ | 로그인 | BE1 |
| POST | `/auth/logout` | ✅ | 로그아웃 (선택) | BE1 |
| GET  | `/auth/me` | ✅ | 내 정보 | BE1 |
| **Users** | | | | |
| PATCH | `/users/me` | ✅ | 내 정보 수정 | BE1 |
| DELETE | `/users/me` | ✅ | 회원 탈퇴 | BE1 |
| **Folders** | | | | |
| GET | `/folders` | ✅ | 폴더 트리 조회 | BE2 |
| POST | `/folders` | ✅ | 폴더 생성 | BE2 |
| PATCH | `/folders/:id` | ✅ | 폴더 수정 | BE2 |
| DELETE | `/folders/:id` | ✅ | 폴더 삭제 | BE2 |
| **Notes** | | | | |
| GET | `/notes` | ✅ | 노트 목록 | BE2 |
| GET | `/notes/:id` | ✅ | 노트 상세 | BE2 |
| POST | `/notes` | ✅ | 노트 생성 | BE2 |
| PUT | `/notes/:id` | ✅ | 노트 전체 수정 (자동저장) | BE2 |
| PATCH | `/notes/:id` | ✅ | 노트 부분 수정 (제목/폴더 등) | BE2 |
| DELETE | `/notes/:id` | ✅ | 노트 삭제 | BE2 |
| GET | `/notes/search` | ✅ | 노트 검색 | BE2 |
| **Graph** | | | | |
| GET | `/graph` | ✅ | 그래프 데이터 (type별) | BE1 |
| GET | `/graph/node/:label` | ✅ | 특정 노드 상세 (관련 노트 목록) | BE1 |
| **Misc** | | | | |
| GET | `/health` | ❌ | 헬스 체크 | BE1 |

**총 18개 엔드포인트** (Must Have 기준)

---

## 3. 인증 (Auth)

### 3.1 POST /auth/signup — 회원가입

**Request**:
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "username": "ocean1229",
  "email": "kang@example.com",
  "password": "Secure!1234",
  "display_name": "강두현"
}
```

**검증**:
- `username`: 3-20자, `^[a-zA-Z0-9_]+$`
- `email`: RFC 5322 형식
- `password`: 8자 이상, 대소문자·숫자·특수문자 각 1자 이상
- `display_name`: 1-30자

**Response 201**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "664a...",
      "username": "ocean1229",
      "email": "kang@example.com",
      "display_name": "강두현",
      "created_at": "2026-05-19T10:00:00.000Z"
    },
    "token": "eyJhbGc..."
  }
}
```

**에러**:
- `409 CONFLICT` — username/email 중복
- `400 VALIDATION_ERROR` — 형식 오류

---

### 3.2 POST /auth/login

**Request**:
```json
{
  "email": "kang@example.com",
  "password": "Secure!1234"
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJ..."
  }
}
```

**에러**:
- `401 UNAUTHORIZED` — 이메일/비밀번호 불일치 (메시지는 모호하게: "이메일 또는 비밀번호가 올바르지 않습니다")

---

### 3.3 GET /auth/me

**Headers**: `Authorization: Bearer <token>`

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "664a...",
    "username": "ocean1229",
    "email": "kang@example.com",
    "display_name": "강두현",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

---

## 4. 사용자 (Users)

### 4.1 PATCH /users/me — 프로필 수정

**Request**:
```json
{
  "display_name": "DH Kang",
  "password": "NewSecure!1234"   // 선택, 변경 시에만
}
```

**Response 200**: 수정된 사용자 객체

---

### 4.2 DELETE /users/me — 회원 탈퇴

- 해당 사용자의 모든 폴더·노트·노드 삭제 (트랜잭션)

**Response 204**

---

## 5. 폴더 (Folders)

### 5.1 GET /folders — 폴더 트리 조회

**Response 200**:
```json
{
  "success": true,
  "data": {
    "tree": [
      {
        "id": "664f1...",
        "name": "일기",
        "parent_id": null,
        "order": 0,
        "children": [
          { "id": "664f2...", "name": "2026", "parent_id": "664f1...", "order": 0, "children": [] }
        ]
      },
      { "id": "664f3...", "name": "프로젝트", "parent_id": null, "order": 1, "children": [] }
    ]
  }
}
```

> 서버에서 평면 리스트를 트리로 조립해서 반환.

---

### 5.2 POST /folders

**Request**:
```json
{
  "name": "신규 폴더",
  "parent_id": "664f1...",   // null이면 루트
  "order": 0
}
```

**Response 201**: 생성된 폴더

---

### 5.3 PATCH /folders/:id

**Request**:
```json
{
  "name": "이름변경",        // 선택
  "parent_id": "664f9...",   // 선택 (이동)
  "order": 2                 // 선택
}
```

**검증**:
- `parent_id`를 자기 자신 또는 자손으로 지정 시 `422` (순환 참조)

---

### 5.4 DELETE /folders/:id

- 폴더 안 노트는 어떻게 할지 정책 선택:
  - **옵션 A (권장)**: 노트는 루트로 이동
  - **옵션 B**: 폴더와 함께 삭제 (확인 다이얼로그)
- 쿼리 파라미터로 정책 선택: `?strategy=move_to_root` (기본) / `?strategy=delete_all`

**Response 204**

---

## 6. 노트 (Notes) — 핵심

### 6.1 GET /notes — 목록

**Query Params**:
| 이름 | 타입 | 기본 | 설명 |
|---|---|---|---|
| `folder_id` | string \| null | (전체) | 특정 폴더 |
| `page` | number | 1 | |
| `limit` | number | 20 | |
| `sort` | string | `-updated_at` | `-created_at`, `title` 등 |

**Response 200**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "664n1...",
        "title": "2026-05-19 일기",
        "folder_id": "664f2...",
        "is_public": false,
        "preview": "오늘 @엄마 와 통화함...",   // content 앞 100자
        "node_count": 3,
        "created_at": "...",
        "updated_at": "..."
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 47, "total_pages": 3 }
  }
}
```

> ⚠️ 목록 API는 `content`, `nodes`, `relationships` 등 무거운 필드를 **제외**해서 응답.

---

### 6.2 GET /notes/:id — 상세

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "664n1...",
    "user_id": "664u...",
    "folder_id": "664f2...",
    "title": "2026-05-19 일기",
    "content": "오늘 @엄마 와 통화함. 또 #감정조절 실패. &Child 모드로 반응함.",
    "is_public": false,
    "nodes": [ ... ],
    "relationships": [ ... ],
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**에러**:
- `404 NOT_FOUND` — 노트 없음
- `403 FORBIDDEN` — 남의 비공개 노트

---

### 6.3 POST /notes — 생성

**Request**:
```json
{
  "title": "새 노트",
  "content": "",
  "folder_id": "664f2..."
}
```

- 서버: 빈 `nodes/relationships` 배열로 초기화
- `is_public`: 기본 false

**Response 201**: 생성된 노트 전체

---

### 6.4 PUT /notes/:id — 전체 수정 (자동저장)

> 💡 에디터에서 2초 debounce로 호출하는 핵심 엔드포인트.

**Request**:
```json
{
  "title": "2026-05-19 일기",
  "content": "오늘 @엄마 와 통화함..."
}
```

**처리 흐름**:
1. JWT 검증 → 소유자 확인
2. `content`를 **LinkParser** 통과 → nodes/relationships 추출
3. `documents` 도큐먼트 업데이트 + `nodes` 컬렉션 동기화 (트랜잭션)
4. 응답: 갱신된 노트 + 파싱 결과

**Response 200**:
```json
{
  "success": true,
  "data": {
    "note": { ... },
    "parsed": {
      "mentions": ["엄마"],
      "tags": ["감정조절"],
      "pac": [{ "role": "Child", "context": "엄마와 통화" }]
    }
  }
}
```

---

### 6.5 PATCH /notes/:id — 부분 수정

자동저장 외 메타 변경용 (제목만, 폴더 이동, 공개 토글).

**Request**:
```json
{
  "title": "제목만 변경",
  "folder_id": "664f9...",
  "is_public": true
}
```

`content` 변경은 PUT으로만.

---

### 6.6 DELETE /notes/:id

- `documents` + `nodes` 컬렉션 동시 삭제 (트랜잭션)

**Response 204**

---

### 6.7 GET /notes/search?q=키워드

**Query Params**:
- `q` (required) — 키워드
- `scope` (optional) — `title` | `content` | `all` (기본 `all`)
- `link_type` (optional) — `mention` | `tag` | `pac` (특정 링크 포함 노트만)

**Response 200**: 노트 목록 (`6.1`과 동일 스키마, 페이지네이션 포함)

---

## 7. 그래프 (Graph) — 가장 중요

### 7.1 GET /graph — 그래프 데이터

**Query Params**:
| 이름 | 타입 | 필수 | 값 |
|---|---|:---:|---|
| `type` | string | ✅ | `mention` \| `tag` \| `pac` \| `all` |
| `folder_id` | string | ❌ | 특정 폴더 내 노트만 |
| `limit` | number | ❌ | 노드 수 제한 (기본 200) |

**Response 200**:
```json
{
  "success": true,
  "data": {
    "type": "mention",
    "nodes": [
      {
        "id": "엄마",
        "label": "엄마",
        "link_type": "mention",
        "size": 7,           // 등장 빈도 (시각화 가중치)
        "color": "#3B82F6",  // 타입별 색
        "doc_count": 5,      // 관련 노트 수
        "position": { "x": 0, "y": 1, "z": 0 }
      },
      {
        "id": "동료B",
        "label": "동료B",
        "link_type": "mention",
        "size": 3,
        "color": "#3B82F6",
        "doc_count": 2,
        "position": { "x": 3, "y": 1, "z": 0 }
      }
    ],
    "links": [
      {
        "source": "엄마",
        "target": "Child",
        "type": "co_occurrence",
        "weight": 3   // 함께 등장한 횟수
      }
    ],
    "meta": {
      "total_nodes": 2,
      "total_links": 1,
      "generated_at": "2026-05-19T10:00:00.000Z"
    }
  }
}
```

**색상 규칙** (서버 응답에 포함):
| 링크 타입 | 색상 (Tailwind) |
|---|---|
| `mention` (@) | `#3B82F6` (blue-500) |
| `tag` (#) | `#10B981` (emerald-500) |
| `pac` (&) | `#EF4444` (red-500) |
| `pac` + `Parent` | `#3B82F6` |
| `pac` + `Adult`  | `#10B981` |
| `pac` + `Child`  | `#EF4444` |

---

### 7.2 GET /graph/node/:label — 특정 노드 상세

> 노드 클릭 시 모달에서 표시할 데이터.

**Response 200**:
```json
{
  "success": true,
  "data": {
    "label": "엄마",
    "link_type": "mention",
    "doc_count": 5,
    "first_seen": "2026-05-01T...",
    "last_seen": "2026-05-19T...",
    "related_notes": [
      { "id": "664n1...", "title": "2026-05-19 일기", "snippet": "...오늘 @엄마 와 통화..." },
      { "id": "664n2...", "title": "2026-05-15 회상", "snippet": "...@엄마 가 했던 말..." }
    ],
    "co_occurring_nodes": [
      { "label": "Child", "type": "pac", "count": 3 },
      { "label": "감정조절", "type": "tag", "count": 2 }
    ]
  }
}
```

---

## 8. 기타

### 8.1 GET /health

**Response 200**:
```json
{
  "success": true,
  "data": { "status": "ok", "uptime": 12345, "db": "connected" }
}
```

---

## 9. 링크 파서 (LinkParser) 명세

> ⚠️ API가 아니라 서버 내부 모듈. BE2가 구현.

**입력**: Markdown 문자열
**출력**:
```typescript
type ParseResult = {
  mentions: string[];                                      // @로 시작
  tags: string[];                                          // #로 시작
  pac: { role: 'Parent' | 'Adult' | 'Child'; context: string }[];  // &로 시작
  relationships: { source: string; target: string; type: string }[];  // 같은 줄에 함께 등장한 것들
};
```

**파싱 규칙** (정규표현식):
- `@`: `/(?<=^|\s)@([가-힣A-Za-z0-9_]+)/g`
- `#`: `/(?<=^|\s)#([가-힣A-Za-z0-9_]+)/g`
- `&`: `/(?<=^|\s)&(Parent|Adult|Child)/g`

**관계 추출 규칙**:
- 같은 문장(`. ! ?` 기준) 안에 함께 등장한 토큰들 → `co_occurrence` 관계
- `@엄마 ... &Child` → `{ source: '엄마', target: 'Child', type: 'co_occurrence' }`

**테스트 케이스** (Jest):
```typescript
expect(parse("@엄마 #감정 &Child")).toEqual({
  mentions: ['엄마'],
  tags: ['감정'],
  pac: [{ role: 'Child', context: '@엄마 #감정 &Child' }],
  relationships: [
    { source: '엄마', target: 'Child', type: 'co_occurrence' },
    { source: '감정', target: 'Child', type: 'co_occurrence' },
    { source: '엄마', target: '감정', type: 'co_occurrence' },
  ]
});
```

---

## 10. 예시: 프론트엔드 호출 코드

```typescript
// Front/lib/api/notes.ts
import { axiosClient } from './client';

export const notesApi = {
  list: (params?: { folder_id?: string; page?: number }) =>
    axiosClient.get('/notes', { params }),

  get: (id: string) =>
    axiosClient.get(`/notes/${id}`),

  create: (data: { title: string; content: string; folder_id?: string }) =>
    axiosClient.post('/notes', data),

  update: (id: string, data: { title: string; content: string }) =>
    axiosClient.put(`/notes/${id}`, data),

  remove: (id: string) =>
    axiosClient.delete(`/notes/${id}`),
};
```

---

## 11. OpenAPI / Postman

- **OpenAPI 3.0 명세** (`Backend/openapi.yaml`): BE1이 v1 마무리 시점에 자동 생성 (zod → OpenAPI 변환)
- **Postman Collection** (`docs/postman/Tri-Link.json`): BE1이 수동 작성, 팀원 import해서 테스트

---

## 12. 변경 이력 (Changelog)

| 버전 | 날짜 | 변경 | 작성자 |
|---|---|---|---|
| v1.0 | 2026-05-19 | 초안 작성 (18개 엔드포인트) | PM |

> 변경 시 PR 단위로 본 문서 함께 수정 → 리뷰어가 명세-구현 일치 여부 확인.

---

> 📌 **다음**: [화면 설계서](./화면_설계서.md) — 이 API를 어떻게 화면에 그릴지
