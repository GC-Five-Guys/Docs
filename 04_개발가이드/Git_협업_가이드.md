# 🌿 Git 협업 가이드

> **대상 독자**: 팀 전원 (Git 초중급자 기준)
> **목적**: 4명이 동시에 코드를 짜도 충돌·실수가 최소화되는 협업 룰
> **버전**: v1.0 (2026-05-19)

---

## 0. 한 줄 요약

```
main ← develop ← feature/내-작업
                 ↑
                 작업 → PR → 코드리뷰 → develop 머지
```

> **절대 main에 직접 push 하지 않는다. 절대 자기 PR을 자기가 머지하지 않는다.**

---

## 1. 처음 한 번만 (개인 PC 셋업)

### 1.1 Git 설치 확인

```bash
git --version
# git version 2.30.0 이상이면 OK
```

### 1.2 사용자 정보 등록

```bash
git config --global user.name "강두현"
git config --global user.email "kang@example.com"
```

> ⚠️ 학교 메일 또는 GitHub 가입 이메일과 일치시킬 것 (커밋 작성자 매칭)

### 1.3 줄바꿈 정책 (운영체제별 충돌 방지)

```bash
# macOS / Linux
git config --global core.autocrlf input

# Windows
git config --global core.autocrlf true
```

### 1.4 SSH 키 (선택, 추천)

매번 비밀번호 입력 안 하고 push/pull 하려면:

```bash
ssh-keygen -t ed25519 -C "kang@example.com"
cat ~/.ssh/id_ed25519.pub   # 출력된 키를 GitHub 계정 설정에 등록
```

---

## 2. 리포지토리 클론 & 초기 환경

```bash
# 1. 리포지토리 클론
git clone git@github.com:five-guys/tri-link.git
cd tri-link

# 2. develop 브랜치로 이동 (작업은 항상 여기서 분기)
git checkout develop
git pull
```

### 2.1 리포 구조

```
tri-link/                ← Git 리포 루트
├── Front/              ← Next.js
├── Backend/            ← Express
├── docs/               ← 본 문서들
├── .gitignore
└── README.md
```

### 2.2 `.gitignore` (이미 설정됨)

다음은 **절대** 커밋되지 않습니다:
- `node_modules/`
- `.env`, `.env.local`
- `.next/`, `dist/`, `build/`
- `*.log`
- `.DS_Store`

> 💡 `.env`를 실수로 커밋하면 비밀키 노출! 의심되면 즉시 PM에게 알릴 것.

---

## 3. 브랜치 전략 (GitHub Flow + develop 보호)

### 3.1 브랜치 구조

```
main      ← 운영 배포용 (보호 브랜치)
└── develop  ← 개발 통합 (보호 브랜치, PR로만 머지)
    ├── feature/login-form              (최윤석)
    ├── feature/note-editor             (김진서)
    ├── feature/auth-api                (김인현)
    ├── feature/link-parser             (김유신)
    ├── fix/sidebar-overflow            (최윤석)
    └── docs/update-readme              (강두현)
```

### 3.2 브랜치 명명 규칙

`{type}/{kebab-case-요약}`

| type | 용도 | 예시 |
|---|---|---|
| `feature/` | 새 기능 | `feature/3d-graph-canvas` |
| `fix/` | 버그 수정 | `fix/login-redirect-loop` |
| `refactor/` | 리팩토링 (동작 변화 X) | `refactor/extract-note-service` |
| `docs/` | 문서만 수정 | `docs/api-spec-v1` |
| `chore/` | 빌드/설정/패키지 | `chore/add-eslint-config` |
| `test/` | 테스트 추가 | `test/link-parser` |
| `style/` | 포맷팅·세미콜론 등 | `style/prettier-format` |

### 3.3 main / develop 보호 규칙 (PM이 GitHub 설정)

- ✅ Direct push 금지 (PR 필수)
- ✅ PR 머지 전 1명 이상 승인 필수
- ✅ PR이 develop 최신과 동기화되어야 머지 가능
- ✅ CI (lint + test) 통과 필수
- ✅ "Squash and merge" 만 허용 (커밋 히스토리 깔끔)

---

## 4. 일상 워크플로우 (작업 1건 기준)

### 4.1 작업 시작

```bash
# 1. develop 최신화
git checkout develop
git pull

# 2. 작업 브랜치 생성
git checkout -b feature/note-editor

# 3. 작업 (코드 수정)
# ...
```

### 4.2 작업 중 커밋

```bash
# 변경사항 확인
git status
git diff

# 스테이지 → 커밋
git add Front/features/editor/NoteEditor.tsx
git commit -m "feat(editor): add autosave with 2s debounce"

# (선택) 여러 파일 한꺼번에
git add Front/features/editor/
git commit -m "feat(editor): integrate autocomplete dropdown"
```

> ⚠️ `git add .` 또는 `git add -A`는 **지양**. 의도하지 않은 파일이 섞일 수 있음. 파일을 명시적으로 추가.

### 4.3 작업 중간 develop 동기화 (1일 1회 권장)

다른 사람이 develop에 머지하면 우리도 따라가야 합니다.

```bash
git checkout develop
git pull
git checkout feature/note-editor
git rebase develop      # 또는 git merge develop
```

#### rebase vs merge

| | rebase | merge |
|---|---|---|
| 히스토리 | 일직선 (깔끔) | 분기·합류 (실제 흐름) |
| 충돌 해결 | 커밋마다 | 한 번에 |
| 추천 | 작업 브랜치 → develop 동기화 | develop → main 머지 (보존) |

→ **우리 룰**: 작업 중에는 `rebase`, develop→main 머지는 PR로 진행.

### 4.4 원격에 push

```bash
# 첫 push (upstream 설정)
git push -u origin feature/note-editor

# 이후
git push
```

### 4.5 Pull Request (PR) 생성

GitHub 웹사이트에서 [Compare & pull request] → 다음 양식 채우기.

```markdown
## 📝 변경 사항
- 노트 에디터 자동저장 기능 추가 (2초 debounce)
- 저장 상태 표시 UI 추가

## 🎯 관련 이슈
Closes #12

## ✅ 체크리스트
- [x] 로컬에서 `npm run dev` 동작 확인
- [x] `npm run lint` 통과
- [x] 새 함수에 대한 테스트 추가 (`tests/editor.test.ts`)
- [x] 문서 변경 필요 시 docs/ 함께 수정

## 📸 스크린샷 (UI 변경 시)
(스크린샷 또는 GIF)

## 🤔 리뷰어가 확인해야 할 부분
- `useDebounce` 훅 구현 방식이 적절한지
- 저장 실패 시 retry 로직 필요 여부
```

### 4.6 리뷰 → 수정 → 머지

1. **리뷰어 지정**: 같은 트랙(FE/BE) 멤버 1명 + PM
2. **리뷰 반영**: 코멘트에 대응하여 추가 커밋
3. **승인 ✅**: 리뷰어가 Approve
4. **CI 통과 ✅**: GitHub Actions 녹색
5. **Squash and merge**: 리뷰어 또는 PM이 머지 (작성자 자신 X)
6. **브랜치 삭제**: 머지 후 GitHub UI에서 [Delete branch]
7. **로컬 정리**:
   ```bash
   git checkout develop
   git pull
   git branch -d feature/note-editor
   ```

---

## 5. 커밋 메시지 컨벤션 (Conventional Commits)

### 5.1 형식

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### 5.2 type 종류

| type | 의미 |
|---|---|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `docs` | 문서만 수정 |
| `style` | 포맷 변경 (코드 동작 X) |
| `refactor` | 리팩토링 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드/패키지/설정 |
| `perf` | 성능 개선 |

### 5.3 scope (선택, 영역)

`auth`, `editor`, `graph`, `notes`, `folders`, `ui`, `db`, `api`, `infra` 등.

### 5.4 좋은 예 / 나쁜 예

✅ **좋은 예**:
```
feat(editor): add @ mention autocomplete dropdown
fix(graph): prevent crash when nodes array is empty
docs(api): update note PUT endpoint examples
refactor(auth): extract JWT logic into utils
chore: bump next from 14.2.0 to 14.2.3
```

❌ **나쁜 예**:
```
update                          ← 무엇을 업데이트?
fix bug                         ← 어떤 버그?
WIP                             ← 머지하지 말 것
asdf                            ← 의도 불명
"수정함"                        ← 한글이어도 OK인데 구체적이지 않음
```

### 5.5 한글 메시지도 OK

```
feat(graph): 3D 노드 클릭 시 카메라 포커스 이동 추가
fix(auth): 비밀번호 변경 후 토큰 무효화 처리
```

> 💡 **한 가지만 일관성**: 팀에서 영문 또는 한글 택1. 본 프로젝트는 **자유** (작성자 편의).

---

## 6. 충돌(Conflict) 해결법

### 6.1 충돌 발생 시점

`git rebase develop` 또는 PR 머지 시 다음 메시지:

```
CONFLICT (content): Merge conflict in Front/features/editor/NoteEditor.tsx
```

### 6.2 해결 절차

```bash
# 1. 어느 파일이 충돌했는지 확인
git status

# 2. 충돌 파일 열기 → 다음 마커 찾기
# <<<<<<< HEAD
# 우리 브랜치 코드
# =======
# develop 브랜치 코드
# >>>>>>> develop

# 3. 둘 다 검토해서 올바른 코드만 남기고 마커 삭제

# 4. 스테이지
git add Front/features/editor/NoteEditor.tsx

# 5. 계속
git rebase --continue   # rebase 중이면
git commit              # merge 중이면
```

### 6.3 충돌이 무서울 때

**중단**:
```bash
git rebase --abort   # 또는
git merge --abort
```

→ 변경사항 보존, 원래 상태로 복귀. 슬랙/디스코드에 도움 요청.

### 6.4 충돌 예방

1. 매일 1회 `develop` 동기화 (`git pull` + `rebase`)
2. 같은 파일을 동시에 만지지 말 것 → 작업 분담 명확히
3. 리뷰가 24시간 넘어가지 않게

---

## 7. 자주 쓰는 명령어 치트시트

```bash
# 상태 확인
git status                          # 현재 변경/스테이지 상태
git log --oneline -10               # 최근 10개 커밋
git log --oneline --graph --all     # 모든 브랜치 시각화

# 변경 확인
git diff                            # 스테이지 안 한 변경
git diff --staged                   # 스테이지된 변경
git diff develop                    # develop과의 차이

# 브랜치
git branch                          # 로컬 브랜치 목록
git branch -a                       # 원격 포함
git checkout <branch>               # 이동
git checkout -b <branch>            # 생성 + 이동
git branch -d <branch>              # 삭제 (안전)
git branch -D <branch>              # 강제 삭제

# 동기화
git pull                            # 원격 → 로컬
git push                            # 로컬 → 원격
git fetch                           # 원격 정보만 가져옴 (병합 X)

# 되돌리기
git restore <file>                  # 작업 변경 취소 (스테이지 X)
git restore --staged <file>         # 스테이지 취소
git commit --amend                  # 마지막 커밋 메시지 수정 (push 전!)
git reset --soft HEAD~1             # 마지막 커밋 취소 (변경은 유지)
git reset --hard HEAD~1             # 마지막 커밋 완전 삭제 (❌ 위험)

# stash (임시 저장)
git stash                           # 현재 변경 임시 저장
git stash pop                       # 꺼내기
git stash list                      # 목록
```

---

## 8. 위험한 명령어 (사용 시 사전 알림)

다음은 **다른 사람의 작업을 날릴 수 있으므로** 사용 전 디스코드 공지 필수:

| 명령 | 위험 |
|---|---|
| `git push --force` (또는 `-f`) | 원격 히스토리 덮어쓰기 — 절대 main/develop에 X |
| `git push --force-with-lease` | 그나마 안전한 force push (변경 감지) |
| `git reset --hard <원격-커밋>` | 다른 사람의 push를 로컬에서 못 받게 됨 |
| `git rebase main` (main이 다른 사람도 사용 중) | 공유 브랜치는 rebase 금지 |
| `git clean -fd` | 추적 안 된 파일 다 삭제 |

> 🛡️ **원칙**: 본인이 단독 사용 중인 `feature/*` 브랜치 외에는 force/reset 금지.

---

## 9. GitHub Actions (CI) 자동 검증

PR을 올리면 다음이 자동으로 실행됩니다. **모두 녹색이어야 머지 가능**.

| Check | 내용 |
|---|---|
| `lint-fe` | `cd Front && npm run lint` |
| `lint-be` | `cd Backend && npm run lint` |
| `typecheck-fe` | `cd Front && npm run typecheck` |
| `typecheck-be` | `cd Backend && npm run typecheck` |
| `test-be` | `cd Backend && npm test` (Jest) |

빨간 표시가 뜨면:
1. GitHub PR 화면 → [Details] 클릭 → 로그 확인
2. 로컬에서 동일 명령 실행 → 재현 → 수정
3. 추가 커밋 push → CI 재실행

---

## 10. 시나리오별 FAQ

### Q1. 잘못된 브랜치에서 작업했어요

```bash
# 변경사항 stash → 올바른 브랜치로 이동 → pop
git stash
git checkout -b feature/correct-branch
git stash pop
```

### Q2. 비밀번호/`.env`를 실수로 커밋했어요

🚨 **즉시 PM에게 알리기**. 단순 커밋 제거로는 부족 (히스토리에 남음).

대응:
1. 비밀번호·API 키 즉시 무효화 (새로 발급)
2. PM이 `git filter-repo` 로 히스토리 정리 (또는 BFG)
3. 모든 멤버가 리포 다시 클론

### Q3. PR이 develop과 충돌나요

```bash
git checkout feature/my-branch
git fetch
git rebase origin/develop
# 충돌 해결 → git rebase --continue
git push --force-with-lease   # 본인 브랜치만! develop X
```

### Q4. main에 직접 push 해버렸어요 (사고)

PM에게 즉시 알림. 브랜치 보호로 보통 막히지만 만약 통과되면:
- 다른 사람이 pull 받기 전이면 `git revert <커밋>` + push
- 이미 받았으면 새 PR로 revert 커밋 머지

### Q5. 마지막 커밋 메시지를 잘못 썼어요

push 전:
```bash
git commit --amend -m "feat(editor): correct message"
```

push 후 (다른 사람이 안 받았다면):
```bash
git commit --amend -m "..."
git push --force-with-lease
```

### Q6. 다른 사람 브랜치를 받아서 보고 싶어요

```bash
git fetch
git checkout origin/feature/note-editor   # detached HEAD
# 또는
git checkout -b note-editor-review origin/feature/note-editor
```

---

## 11. PR 리뷰 가이드 (리뷰어용)

### 11.1 리뷰어가 봐야 할 것

| 우선 | 항목 |
|---|---|
| 🔴 | 기능이 PR 설명대로 동작하는가? (로컬 체크아웃 후 실행) |
| 🔴 | 보안 이슈 (env 노출, SQL 인젝션, XSS 등) |
| 🔴 | 명세서와 일치하는가? (API 명세, DB 스키마) |
| 🟡 | 컨벤션 준수 (이름·구조·타입) |
| 🟡 | 테스트 누락 없는가? |
| 🟡 | 에러 처리 빠진 부분 없는가? |
| 🟢 | 가독성 / 주석 / 변수명 |

### 11.2 리뷰 코멘트 톤

✅ **건설적**:
- "이 부분은 zod 스키마로 분리하면 재사용 가능할 것 같아요."
- "여기서 try-catch가 빠진 것 같은데 의도하신 건가요?"
- "👍 좋은 접근! 다른 데도 적용해보면 좋을 듯."

❌ **지양**:
- "이거 왜 이렇게 했어요"
- "다시 짜세요"
- (코멘트 없이 Reject)

### 11.3 리뷰 응답 시간

- 24시간 내 첫 반응 (Approve 또는 Comment)
- 이틀 이상 응답 못 할 상황이면 디스코드 사전 공지

---

## 12. 자가 점검 (PR 올리기 전)

- [ ] `develop` 최신과 동기화했는가? (`git pull` + `rebase`)
- [ ] 로컬에서 `npm run lint` 통과?
- [ ] 로컬에서 `npm run test` 통과? (해당 트랙)
- [ ] 변경된 코드를 실제로 실행해 봤는가? (UI는 브라우저, API는 Postman)
- [ ] 커밋 메시지가 컨벤션 따르는가?
- [ ] PR 설명에 [변경사항/이슈/체크리스트] 채웠는가?
- [ ] 스크린샷 첨부 (UI 변경 시)?
- [ ] 비밀번호·env 안 들어갔는가?

---

> 📌 **다음**: [코딩 컨벤션](./코딩_컨벤션.md) — 코드 스타일 룰
