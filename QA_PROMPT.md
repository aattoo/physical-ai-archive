# Physical AI Archive — UX QA 테스트 (10 케이스)

## 목표
https://physical-ai-archive.vercel.app 의 전체 UX 흐름을 자동화 테스트하라.
에러를 발견하면 코드를 수정하고 재배포하라.

테스트 브라우저: GStack Browser (이미 연결됨)
B="$HOME/.claude/skills/gstack/browse/dist/browse"

---

## 테스트 케이스 10개

### TC-01: 홈페이지 로딩
- URL: https://physical-ai-archive.vercel.app
- 기대: HTTP 200, "Physical AI Archive" 헤딩 존재, "Google로 로그인" 버튼 존재
- 검증: `$B goto`, `$B snapshot`

### TC-02: 달력 렌더링
- 기대: April 2026 달력 그리드 존재, 28개 날짜가 파란색 링크로 표시
- 검증: snapshot에서 "April 2026" 헤딩과 28개 링크 확인

### TC-03: 기사 상세 페이지 (4월 1일)
- URL: https://physical-ai-archive.vercel.app/article/2026-04-01
- 기대: 기사 제목, 설명, "원문 읽기" 버튼, 날짜 배지 존재
- 검증: `$B goto`, snapshot 확인

### TC-04: 기사 prev/next 네비게이션
- 2026-04-15 페이지에서 "←" 이전 버튼과 "→" 다음 버튼 모두 존재 확인
- 이전 버튼 클릭 → 2026-04-14 페이지로 이동 확인

### TC-05: 존재하지 않는 날짜 처리
- URL: https://physical-ai-archive.vercel.app/article/2026-04-99
- 기대: 404 페이지 또는 not found 처리 (에러 페이지가 아닌 graceful handling)

### TC-06: 헤더 로그인 버튼 상태 (비로그인)
- 기대: "Google로 로그인" 버튼 표시, 아바타 없음
- 검증: snapshot에서 button 텍스트 확인

### TC-07: Google 로그인 플로우
- "Google로 로그인" 클릭 → Google OAuth 페이지로 이동 확인
- (실제 로그인 없이 redirect 확인만)
- 기대: accounts.google.com 으로 리다이렉트

### TC-08: 로그인 후 상태 (쿠키/세션)
- 이미 로그인된 브라우저 세션으로 홈 접속
- 기대: 아바타 이미지, 이름, "로그아웃" 버튼 표시

### TC-09: 외부 링크 (원문 읽기)
- 기사 상세 페이지에서 "원문 읽기" 버튼 확인
- 기대: target="_blank" rel="noopener noreferrer" 속성 확인

### TC-10: 모바일 반응형 (뷰포트 375px)
- 뷰포트를 375x812로 변경 후 홈페이지 확인
- 기대: 달력 그리드 정상 표시, 헤더 로그인 버튼 표시, 오버플로우 없음

---

## 실행 방법

각 테스트를 순서대로 실행하라. 결과를 PASS/FAIL로 기록하라.
FAIL이 있으면 코드를 수정하고 `bun run build`로 검증 후 `vercel --prod --yes`로 재배포하라.

### 환경 설정
```bash
B="$HOME/.claude/skills/gstack/browse/dist/browse"
export PATH="/opt/homebrew/bin:/opt/homebrew/opt/libpq/bin:$PATH"
BASE_URL="https://physical-ai-archive.vercel.app"
```

---

## 완료 조건

- 10개 테스트 케이스 모두 실행
- PASS/FAIL 결과 기록
- FAIL 항목 수정 완료
- 수정사항이 있으면 재배포 완료

모든 조건 충족 시: <promise>QA COMPLETE</promise>
