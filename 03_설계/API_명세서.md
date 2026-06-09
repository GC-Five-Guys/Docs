# 🔌 API 명세서 (REST) — v2

> **대상 독자**: 백엔드 개발자 (BE1, BE2) + 프론트엔드 (FE1, FE2)
> **선행 문서**: [`DB_설계서.md`](./DB_설계서.md)
> **버전**: v2.0 (2026-05-23)
> **Base URL**: `http://localhost:4000/api/v1` (개발) / `https://api.yggdrasil.app/api/v1` (운영)

---

## 0. 1분 요약 (학생용)

> API가 어떻게 생겼는지 핵심만:

- **총 21개 엔드포인트** (인증 4 + 사용자 2 + 폴더 4 + 노트 7 + 그래프 2 + 우측바 2)
- **모든 요청은 JWT 토큰** 필요 (회원가입·로그인·헬스체크 제외)
- **응답 형식 통일**: `{ success: true, data: {...} }` 또는 `{ success: false, error: {...} }`
- **검증**: 모든 입력 데이터는 Mongoose 스키마로 자동 검증
- **에러 처리**: 어떤 종류의 에러인지 `code` 필드로 알려줌

**🇺🇸 English**

> Core API summary:

- **21 endpoints total** (Auth 4 + Users 2 + Folders 4 + Notes 7 + Graph 2 + Right Panel 2)
- **All requests require a JWT token** (except signup, login, and health check)
- **Unified response format**: `{ success: true, data: {...} }` or `{ success: false, error: {...} }`
- **Validation**: all input data is validated automatically via Mongoose schema
- **Error handling**: error type is communicated via the `code` field

---

## 1. 공통 규칙

### 1.1 인증 (JWT)

- 방식: **JWT Bearer Token** (HTTP `Authorization` 헤더)
- 토큰 발급: `POST /auth/signup`, `POST /auth/login`
- 만료: 7일
- 헤더 예시:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**🇺🇸 English**

- Method: **JWT Bearer Token** (HTTP `Authorization` header)
- Token issued via: `POST /auth/signup`, `POST /auth/login`
- Expiry: 7 days
- Header example: see code block above

### 1.2 요청 / 응답 형식

- Content-Type: `application/json`
- 인코딩: UTF-8
- 날짜: **ISO 8601** UTC (`2026-05-23T10:00:00.000Z`)
- ID: MongoDB ObjectId 24자리 hex 문자열

**🇺🇸 English**

- Content-Type: `application/json`
- Encoding: UTF-8
- Dates: **ISO 8601** UTC (`2026-05-23T10:00:00.000Z`)
- IDs: MongoDB ObjectId — 24-character hex string

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

**🇺🇸 English**

**Success response**: `success: true` with a `data` object.

**Error response**: `success: false` with an `error` object containing `code`, `message`, and optional `details` array.

### 1.4 표준 HTTP 상태 코드

| 코드 | 의미 | 사용 시점 |
|---|---|---|
| `200 OK` | 조회/수정 성공 | GET, PUT, PATCH |
| `201 Created` | 생성 성공 | POST |
| `204 No Content` | 삭제 성공, 응답 본문 없음 | DELETE |
| `400 Bad Request` | 요청 형식 오류 / 검증 실패 | Mongoose 검증 실패 |
| `401 Unauthorized` | 인증 실패 / 토큰 없음 | JWT 없음·만료 |
| `403 Forbidden` | 권한 없음 (남의 노트 접근) | 자원 소유자 아님 |
| `404 Not Found` | 자원 없음 | 존재하지 않는 ID |
| `409 Conflict` | 중복 (이메일 등) | unique 위반 |
| `422 Unprocessable` | 비즈니스 룰 위반 | 폴더 순환 참조 |
| `500 Internal Server Error` | 서버 오류 | 예상치 못한 예외 |

**🇺🇸 English**

| Code | Meaning | When used |
|---|---|---|
| `200 OK` | Read/update success | GET, PUT, PATCH |
| `201 Created` | Creation success | POST |
| `204 No Content` | Delete success, no response body | DELETE |
| `400 Bad Request` | Malformed request / validation failure | Mongoose validation failure |
| `401 Unauthorized` | Authentication failure / missing token | No or expired JWT |
| `403 Forbidden` | Access denied (another user's note) | Not the resource owner |
| `404 Not Found` | Resource not found | Non-existent ID |
| `409 Conflict` | Duplicate (email, etc.) | Unique constraint violation |
| `422 Unprocessable` | Business rule violation | Circular folder reference |
| `500 Internal Server Error` | Server error | Unexpected exception |

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

**🇺🇸 English**

| `code` | Meaning |
|---|---|
| `VALIDATION_ERROR` | Input validation failed |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Access denied |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Duplicate resource |
| `INVALID_TOKEN` | Token is invalid |
| `TOKEN_EXPIRED` | Token has expired |
| `INTERNAL_ERROR` | Internal server error |

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

**🇺🇸 English**

Query parameters:
- `page` (number, default 1)
- `limit` (number, default 20, max 100)
- `sort` (string, default `-updated_at`)

Response includes a `pagination` object with `page`, `limit`, `total`, and `total_pages`.

---

## 2. 엔드포인트 요약 (총 21개)

| Method | Path | 인증 | 설명 | 담당 | v2 |
|:---:|---|:---:|---|:---:|:---:|
| **Auth** | | | | | |
| POST | `/auth/signup` | ❌ | 회원가입 | BE1 | |
| POST | `/auth/login` | ❌ | 로그인 | BE1 | |
| POST | `/auth/logout` | ✅ | 로그아웃 | BE1 | |
| GET  | `/auth/me` | ✅ | 내 정보 | BE1 | |
| **Users** | | | | | |
| PATCH | `/users/me` | ✅ | 내 정보 수정 | BE1 | |
| DELETE | `/users/me` | ✅ | 회원 탈퇴 | BE1 | |
| **Folders** | | | | | |
| GET | `/folders` | ✅ | 폴더 트리 조회 | BE2 | |
| POST | `/folders` | ✅ | 폴더 생성 | BE2 | |
| PATCH | `/folders/:id` | ✅ | 폴더 수정 | BE2 | |
| DELETE | `/folders/:id` | ✅ | 폴더 삭제 (하드) | BE2 | 🆕 정책 |
| **Notes** | | | | | |
| GET | `/notes` | ✅ | 노트 목록 | BE2 | |
| GET | `/notes/:id` | ✅ | 노트 상세 | BE2 | |
| POST | `/notes` | ✅ | 노트 생성 | BE2 | |
| PUT | `/notes/:id` | ✅ | 노트 전체 수정 (자동저장) | BE2 | |
| PATCH | `/notes/:id` | ✅ | 노트 부분 수정 | BE2 | |
| DELETE | `/notes/:id` | ✅ | 노트 삭제 (**하드**) | BE2 | 🆕 정책 |
| GET | `/search` | ✅ | **통합 검색** (엔티티 + 노트) | BE1 | 🆕 |
| **Graph** (v2 재정의) | | | | | |
| GET | `/graph` | ✅ | 그래프 데이터 (파일 중심 + 토글) | BE1 | 🆕 |
| GET | `/graph/node/:label` | ✅ | 특정 노드 상세 | BE1 | |
| **Right Panel (v2 신규)** | | | | | |
| GET | `/stats/top-tokens` | ✅ | **자주 쓴 태그 Top 3 × 3타입** | BE1 | 🆕 |
| GET | `/calendar` | ✅ | **월간 캘린더 (작성일 마커)** | BE2 | 🆕 |
| **Misc** | | | | | |
| GET | `/health` | ❌ | 헬스 체크 | BE1 | |

**🇺🇸 English**

Endpoint summary — 21 total:

| Method | Path | Auth | Description | Owner | v2 |
|:---:|---|:---:|---|:---:|:---:|
| **Auth** | | | | | |
| POST | `/auth/signup` | ❌ | Register | BE1 | |
| POST | `/auth/login` | ❌ | Login | BE1 | |
| POST | `/auth/logout` | ✅ | Logout | BE1 | |
| GET  | `/auth/me` | ✅ | Get current user | BE1 | |
| **Users** | | | | | |
| PATCH | `/users/me` | ✅ | Update profile | BE1 | |
| DELETE | `/users/me` | ✅ | Delete account | BE1 | |
| **Folders** | | | | | |
| GET | `/folders` | ✅ | Get folder tree | BE2 | |
| POST | `/folders` | ✅ | Create folder | BE2 | |
| PATCH | `/folders/:id` | ✅ | Update folder | BE2 | |
| DELETE | `/folders/:id` | ✅ | Delete folder (hard) | BE2 | 🆕 policy |
| **Notes** | | | | | |
| GET | `/notes` | ✅ | List notes | BE2 | |
| GET | `/notes/:id` | ✅ | Get note detail | BE2 | |
| POST | `/notes` | ✅ | Create note | BE2 | |
| PUT | `/notes/:id` | ✅ | Full update (auto-save) | BE2 | |
| PATCH | `/notes/:id` | ✅ | Partial update | BE2 | |
| DELETE | `/notes/:id` | ✅ | Delete note (**hard**) | BE2 | 🆕 policy |
| GET | `/search` | ✅ | **Unified search** (entities + notes) | BE1 | 🆕 |
| **Graph** (v2 redefined) | | | | | |
| GET | `/graph` | ✅ | Graph data (file-centric + toggle) | BE1 | 🆕 |
| GET | `/graph/node/:label` | ✅ | Node detail | BE1 | |
| **Right Panel (v2 new)** | | | | | |
| GET | `/stats/top-tokens` | ✅ | **Top 3 tokens × 3 types** | BE1 | 🆕 |
| GET | `/calendar` | ✅ | **Monthly calendar (date markers)** | BE2 | 🆕 |
| **Misc** | | | | | |
| GET | `/health` | ❌ | Health check | BE1 | |

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
- `email`: RFC 5322
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
      "created_at": "2026-05-23T10:00:00.000Z"
    },
    "token": "eyJhbGc..."
  }
}
```

**에러**:
- `409 CONFLICT` — username/email 중복
- `400 VALIDATION_ERROR` — 형식 오류

**🇺🇸 English**

Register a new user account. Returns the user object and a JWT token on success.

Validation rules:
- `username`: 3–20 chars, alphanumeric + underscore only
- `email`: RFC 5322 format
- `password`: min 8 chars, must include uppercase, lowercase, digit, and special character
- `display_name`: 1–30 chars

Errors:
- `409 CONFLICT` — username or email already taken
- `400 VALIDATION_ERROR` — format violation

---

### 3.2 POST /auth/login

**Request**:
```json
{ "email": "kang@example.com", "password": "Secure!1234" }
```

**Response 200**:
```json
{ "success": true, "data": { "user": { ... }, "token": "eyJ..." } }
```

**에러**:
- `401 UNAUTHORIZED` — 이메일/비밀번호 불일치 (메시지는 모호하게: "이메일 또는 비밀번호가 올바르지 않습니다")

**🇺🇸 English**

Login with email and password. Returns user object and JWT token.

Error:
- `401 UNAUTHORIZED` — email/password mismatch (message is intentionally vague for security)

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

**🇺🇸 English**

Returns the currently authenticated user's profile. Requires a valid Bearer token.

---

## 4. 사용자 (Users)

### 4.1 PATCH /users/me

**Request**:
```json
{
  "display_name": "DH Kang",
  "password": "NewSecure!1234"
}
```

**Response 200**: 수정된 사용자 객체

**🇺🇸 English**

Update the current user's profile. Accepts `display_name` and/or `password`. Returns the updated user object.

### 4.2 DELETE /users/me — 회원 탈퇴

- 해당 사용자의 모든 폴더·노트·노드 삭제 (트랜잭션)

**Response 204**

**🇺🇸 English**

Permanently delete the authenticated user's account. All folders, notes, and nodes belonging to the user are deleted in a single transaction.

---

## 5. 폴더 (Folders)

### 5.1 GET /folders — 폴더 트리

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
          { "id": "664f2...", "name": "2026", "parent_id": "664f1...", "order": 0, "children": [...] }
        ]
      },
      { "id": "664f3...", "name": "회의", "parent_id": null, "order": 1, "children": [] }
    ]
  }
}
```

**🇺🇸 English**

Returns the full folder tree for the authenticated user. Each folder node includes `id`, `name`, `parent_id`, `order`, and a `children` array (recursive).

### 5.2 POST /folders

```json
{ "name": "신규 폴더", "parent_id": "664f1...", "order": 0 }
```

**🇺🇸 English**

Create a new folder. `parent_id` is optional (omit for root-level folder). `order` controls sibling ordering.

### 5.3 PATCH /folders/:id

```json
{ "name": "이름변경", "parent_id": "664f9...", "order": 2 }
```

- **검증**: `parent_id`를 자기 자신 또는 자손으로 지정 시 `422` (순환 참조)

**🇺🇸 English**

Update a folder's name, parent, or order. Setting `parent_id` to the folder itself or one of its descendants returns `422` (circular reference).

### 5.4 DELETE /folders/:id (하드 삭제 ⚠️)

- **정책 변경 (v2)**: 폴더 안 노트도 함께 영구 삭제 (확인 모달은 프론트에서 처리)
- 또는 쿼리 옵션: `?strategy=move_to_root` → 노트는 루트로 이동

**Response 204**

**🇺🇸 English**

Hard-delete a folder. **Policy change in v2**: all notes inside the folder are also permanently deleted. Alternatively, pass `?strategy=move_to_root` to move contained notes to the root level instead of deleting them. The frontend must show a confirmation modal before calling this endpoint.

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
        "title": "2026-05-23 일기",
        "folder_id": "664f2...",
        "is_public": false,
        "preview": "오늘 @엄마 와 통화함...",
        "node_count": 3,
        "created_at": "...",
        "updated_at": "..."
      }
    ],
    "pagination": { ... }
  }
}
```

**🇺🇸 English**

List notes for the authenticated user, with optional filtering and pagination.

| Field | Type | Default | Description |
|---|---|---|---|
| `folder_id` | string \| null | (all) | Filter by folder |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `sort` | string | `-updated_at` | Sort field, e.g. `-created_at`, `title` |

### 6.2 GET /notes/:id — 상세

**Response 200**: 노트 전체 (`content`, `nodes`, `relationships` 포함)

**에러**:
- `404 NOT_FOUND` — 노트 없음
- `403 FORBIDDEN` — 남의 비공개 노트

**🇺🇸 English**

Get a note's full detail including `content`, `nodes`, and `relationships`.

Errors:
- `404 NOT_FOUND` — note does not exist
- `403 FORBIDDEN` — note is private and belongs to another user

### 6.3 POST /notes — 생성

```json
{ "title": "새 노트", "content": "", "folder_id": "664f2..." }
```

- 서버: 빈 `nodes/relationships` 배열로 초기화

**🇺🇸 English**

Create a new note. The server initializes empty `nodes` and `relationships` arrays automatically.

### 6.4 PUT /notes/:id — 전체 수정 (자동저장 핵심)

> 💡 Tiptap 에디터가 실시간 자동저장으로 호출. 모든 탭이 각자 호출.

**Request**:
```json
{
  "title": "2026-05-23 일기",
  "content": "오늘 @엄마 와 #감정조절 실패. &커피 너무 많이 마심."
}
```

**처리 흐름**:
1. JWT 검증 → 소유자 확인
2. `content`를 **Tag Parser** 통과 → 토큰 추출
3. `documents` 업데이트 + `nodes` 컬렉션 동기화 (트랜잭션)
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
      "objects": ["커피"]
    }
  }
}
```

**🇺🇸 English**

Full replacement update — the core auto-save endpoint. Called by the Tiptap editor on every save cycle; each open tab calls it independently.

Processing flow:
1. Verify JWT and confirm ownership
2. Run `content` through the **Tag Parser** to extract tokens
3. Update `documents` and sync the `nodes` collection (in a transaction)
4. Respond with the updated note and parsed token results

### 6.5 PATCH /notes/:id — 부분 수정

자동저장 외 메타 변경용 (제목, 폴더 이동, 공개 토글).

```json
{ "title": "제목만 변경", "folder_id": "664f9...", "is_public": true }
```

**🇺🇸 English**

Partial update for metadata changes outside the auto-save flow: rename, move to another folder, or toggle public visibility.

### 6.6 DELETE /notes/:id (하드 삭제 ⚠️)

- **정책 변경 (v2)**: 영구 삭제 — 복구 불가
- `documents` + `nodes` 동시 삭제 (트랜잭션)
- 프론트엔드는 반드시 **확인 모달** 표시 후 호출

**Response 204**

**🇺🇸 English**

Hard-delete a note — **permanent, unrecoverable**. Both the `documents` record and its associated `nodes` are deleted in a single transaction. The frontend must display a confirmation modal before calling this endpoint.

---

## 7. 통합 검색 (Search) — 🆕 v2

### 7.1 GET /search?q=키워드

> 우측바 검색창에서 호출.

**Query Params**:
| 이름 | 타입 | 필수 | 설명 |
|---|---|:---:|---|
| `q` | string | ✅ | 검색어 |
| `entity_limit` | number | ❌ | 엔티티 결과 최대 (기본 10) |
| `note_limit` | number | ❌ | 노트 결과 최대 (기본 10) |

**Response 200**:
```json
{
  "success": true,
  "data": {
    "query": "엄마",
    "entities": [
      {
        "label": "엄마",
        "token_type": "mention",
        "color": "#3B82F6",
        "doc_count": 5,
        "last_seen": "2026-05-23T..."
      }
    ],
    "notes": [
      {
        "id": "664n1...",
        "title": "2026-05-23 일기",
        "preview": "...오늘 @엄마 와 통화...",
        "snippet_match": "엄마",
        "updated_at": "..."
      }
    ]
  }
}
```

**🇺🇸 English**

Unified search called from the right-panel search bar. Returns matching entities and notes for the given keyword.

| Field | Type | Required | Description |
|---|---|:---:|---|
| `q` | string | ✅ | Search keyword |
| `entity_limit` | number | ❌ | Max entity results (default 10) |
| `note_limit` | number | ❌ | Max note results (default 10) |

Response contains two arrays: `entities` (matched graph nodes) and `notes` (matched documents with preview snippets).

---

## 8. 그래프 (Graph) — 🔄 v2 재정의 (Option A: 파일 중심)

### 8.1 GET /graph — 그래프 데이터

**Query Params**:
| 이름 | 타입 | 필수 | 값 |
|---|---|:---:|---|
| `types` | string (CSV) | ❌ | 토글로 켜진 타입. `mention,tag,object` (없으면 파일만) |

**Response 200** (예시: `?types=mention,tag`):
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "doc:664n1",
        "kind": "file",
        "label": "2026-05-23 일기",
        "size": 12,
        "color": "#94A3B8",
        "folder_id": "664f2..."
      },
      {
        "id": "doc:664n2",
        "kind": "file",
        "label": "2026-05-22 일기",
        "size": 8,
        "color": "#94A3B8",
        "folder_id": "664f2..."
      },
      {
        "id": "mention:엄마",
        "kind": "mention",
        "label": "엄마",
        "size": 5,
        "color": "#3B82F6"
      },
      {
        "id": "tag:감정조절",
        "kind": "tag",
        "label": "감정조절",
        "size": 4,
        "color": "#10B981"
      }
    ],
    "links": [
      {
        "source": "doc:664n1",
        "target": "doc:664n2",
        "type": "shared_tokens",
        "weight": 2,
        "shared_labels": ["엄마", "감정조절"]
      },
      {
        "source": "doc:664n1",
        "target": "mention:엄마",
        "type": "contains",
        "weight": 1
      }
    ],
    "meta": {
      "total_nodes": 4,
      "total_links": 2,
      "generated_at": "2026-05-23T10:00:00.000Z"
    }
  }
}
```

**규칙**:
- **파일 노드** (`kind: file`): 항상 표시
- **엔티티 노드** (`kind: mention|tag|object`): `types` 쿼리에 포함된 것만 표시
- **엣지 타입**:
  - `shared_tokens` — 두 파일이 공통 토큰을 가짐 (weight = 공통 개수)
  - `contains` — 파일이 엔티티를 포함
- **노드 크기**: 파일은 본문 길이 기준, 엔티티는 등장 빈도

**색상 매핑** (서버 응답에 포함):
| Kind | 색상 |
|---|---|
| `file` | `#94A3B8` (slate-400) — 폴더별로 변형 가능 |
| `mention` (@) | `#3B82F6` (blue-500) |
| `tag` (#) | `#10B981` (emerald-500) |
| `object` (&) | `#EF4444` (red-500) |

**🇺🇸 English**

Returns graph data for visualisation. File nodes are always included; entity nodes are included only when their type is listed in the `types` query parameter.

| Field | Type | Required | Description |
|---|---|:---:|---|
| `types` | string (CSV) | ❌ | Entity types to include: `mention,tag,object`. Omit for file-only graph. |

Node rendering rules:
- **File node** (`kind: file`): always shown
- **Entity node** (`kind: mention|tag|object`): shown only if its type is in `types`
- **Edge types**: `shared_tokens` (two files share common tokens, weight = count), `contains` (file references an entity)
- **Node size**: files sized by content length; entities sized by occurrence frequency

Color mapping (included in server response):

| Kind | Color |
|---|---|
| `file` | `#94A3B8` (slate-400) — may vary by folder |
| `mention` (@) | `#3B82F6` (blue-500) |
| `tag` (#) | `#10B981` (emerald-500) |
| `object` (&) | `#EF4444` (red-500) |

### 8.2 GET /graph/node/:label — 특정 노드 상세

**Response 200**:
```json
{
  "success": true,
  "data": {
    "label": "엄마",
    "token_type": "mention",
    "doc_count": 5,
    "first_seen": "2026-05-01T...",
    "last_seen": "2026-05-23T...",
    "related_notes": [
      { "id": "664n1...", "title": "2026-05-23 일기", "snippet": "...오늘 @엄마..." }
    ],
    "co_occurring_nodes": [
      { "label": "감정조절", "type": "tag", "count": 3 },
      { "label": "커피", "type": "object", "count": 2 }
    ]
  }
}
```

**🇺🇸 English**

Get detailed information for a specific graph node identified by its label. Returns token type, appearance statistics, related notes, and co-occurring nodes.

---

## 9. 우측바 전용 API — 🆕 v2

### 9.1 GET /stats/top-tokens — 자주 쓴 태그 Top 3 × 3타입

> 우측바 "자주 쓴 태그" 위젯이 호출.

**Response 200**:
```json
{
  "success": true,
  "data": {
    "mention": [
      { "label": "엄마", "count": 12 },
      { "label": "동기A", "count": 7 },
      { "label": "교수님", "count": 4 }
    ],
    "tag": [
      { "label": "감정조절", "count": 15 },
      { "label": "공부", "count": 10 },
      { "label": "회사", "count": 6 }
    ],
    "object": [
      { "label": "커피", "count": 9 },
      { "label": "독서", "count": 5 },
      { "label": "에너지드링크", "count": 4 }
    ]
  }
}
```

> 기간: **전체** (학기 데이터 양이 적어 30일/전체 차이 없음)

**🇺🇸 English**

Returns the top 3 most-used tokens per type (mention, tag, object), used by the "Frequently Used Tags" widget in the right panel. Covers all-time data (no date filter — dataset is small enough that 30-day vs. all-time makes no practical difference).

### 9.2 GET /calendar?year=2026&month=5 — 월간 캘린더

> 우측바 캘린더 위젯이 호출. 매월 1회.

**Query Params**:
| 이름 | 타입 | 필수 |
|---|---|:---:|
| `year` | number | ✅ |
| `month` | number (1-12) | ✅ |

**Response 200**:
```json
{
  "success": true,
  "data": {
    "year": 2026,
    "month": 5,
    "days": [
      { "date": "2026-05-19", "note_count": 1 },
      { "date": "2026-05-22", "note_count": 1 },
      { "date": "2026-05-23", "note_count": 2 }
    ]
  }
}
```

> 사용자가 날짜 클릭 시 별도 API 호출:
> `GET /notes?date=2026-05-23` (확장 옵션) 또는 `GET /search?q=...&date=...`

**🇺🇸 English**

Returns a list of dates in the given month that have at least one note, along with the note count per date. Called once per month by the right-panel calendar widget.

| Field | Type | Required | Description |
|---|---|:---:|---|
| `year` | number | ✅ | Calendar year |
| `month` | number (1-12) | ✅ | Calendar month |

Only days with at least one note are included in the `days` array. When the user clicks a date, a separate call is made: `GET /notes?date=2026-05-23` or `GET /search?q=...&date=...`.

---

## 10. 기타

### 10.1 GET /health

**Response 200**:
```json
{
  "success": true,
  "data": { "status": "ok", "uptime": 12345, "db": "connected" }
}
```

**🇺🇸 English**

Health check endpoint (no auth required). Returns server uptime and database connection status.

---

## 11. 태그 파서 (Tag Parser) 내부 명세

> ⚠️ API가 아니라 서버 내부 모듈. BE2가 구현.

**입력**: 본문 문자열 (Tiptap이 직렬화한 마크다운)
**출력**:
```typescript
type ParseResult = {
  mentions: string[];     // @로 시작
  tags: string[];         // #로 시작
  objects: string[];      // &로 시작
  relationships: { source: string; target: string; type: 'co_occurrence' }[];
};
```

**파싱 규칙** (정규표현식, **공백 다음에만 트리거**):
- `@`: `/(?<=^|\s)@([가-힣A-Za-z0-9_]+)/g`
- `#`: `/(?<=^|\s)#([가-힣A-Za-z0-9_]+)/g`
- `&`: `/(?<=^|\s)&([가-힣A-Za-z0-9_]+)/g`

**관계 추출 규칙**:
- 같은 문장(`. ! ?` 기준) 안에 함께 등장한 토큰들 → `co_occurrence` 관계

**테스트 케이스 (Jest 필수)**:
```typescript
expect(parse("@엄마 와 #감정조절 &커피")).toEqual({
  mentions: ['엄마'],
  tags: ['감정조절'],
  objects: ['커피'],
  relationships: [
    { source: '엄마', target: '감정조절', type: 'co_occurrence' },
    { source: '엄마', target: '커피', type: 'co_occurrence' },
    { source: '감정조절', target: '커피', type: 'co_occurrence' },
  ]
});

// 이메일 false-positive 방지
expect(parse("work@epqpf.com 에 보냈음")).toEqual({
  mentions: [],   // 공백 다음이 아니므로 X
  ...
});
```

**🇺🇸 English**

Internal server module (not an API endpoint). Implemented by BE2.

**Input**: note body string (Markdown serialized by Tiptap)
**Output**: `ParseResult` type — see TypeScript definition above.

Parsing rules (regex, **triggers only after whitespace**):
- `@` for mentions, `#` for tags, `&` for objects — each uses a lookbehind for start-of-string or whitespace.

Relationship extraction: tokens that appear together within the same sentence (delimited by `. ! ?`) generate a `co_occurrence` relationship.

Test cases (Jest required): see TypeScript block above. Includes a false-positive guard for email addresses (e.g. `work@epqpf.com` must not produce a mention).

---

## 12. 예시: 프론트엔드 호출 코드

```typescript
// Front/lib/api/notes.ts
import { axiosClient } from './client';

export const notesApi = {
  list: (params?: { folder_id?: string; page?: number }) =>
    axiosClient.get('/notes', { params }),

  get: (id: string) => axiosClient.get(`/notes/${id}`),

  create: (data: { title: string; content: string; folder_id?: string }) =>
    axiosClient.post('/notes', data),

  update: (id: string, data: { title?: string; content?: string }) =>
    axiosClient.put(`/notes/${id}`, data),

  remove: (id: string) => axiosClient.delete(`/notes/${id}`),
};

// Front/lib/api/graph.ts
export const graphApi = {
  get: (types?: ('mention' | 'tag' | 'object')[]) =>
    axiosClient.get('/graph', { params: { types: types?.join(',') } }),
  getNode: (label: string) =>
    axiosClient.get(`/graph/node/${encodeURIComponent(label)}`),
};

// Front/lib/api/stats.ts (v2 신규)
export const statsApi = {
  topTokens: () => axiosClient.get('/stats/top-tokens'),
  calendar: (year: number, month: number) =>
    axiosClient.get('/calendar', { params: { year, month } }),
};

// Front/lib/api/search.ts (v2 신규)
export const searchApi = {
  query: (q: string) => axiosClient.get('/search', { params: { q } }),
};
```

**🇺🇸 English**

Sample frontend API client code using `axiosClient`. Built with React 19 + Vite. Code blocks above show the full implementation — field names and endpoints are identical to the spec above.

---

## 13. OpenAPI / Postman

- **OpenAPI 3.0 명세** (`Backend/openapi.yaml`): BE1이 v2 마무리 시점에 생성
- **Postman Collection** (`docs/postman/Yggdrasil-v2.json`): BE1이 작성, 팀원 import

**🇺🇸 English**

- **OpenAPI 3.0 spec** (`Backend/openapi.yaml`): generated by BE1 at v2 completion
- **Postman Collection** (`docs/postman/Yggdrasil-v2.json`): authored by BE1, imported by all teammates

---

> 📌 **다음**: [화면 설계서](./화면_설계서.md) — 이 API를 어떻게 4-pane UI로 그릴지
