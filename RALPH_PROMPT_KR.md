# Physical AI Archive — 한국어 뉴스 스크랩 & 이미지 검증

## 목표
네이버 뉴스에서 스크랩한 피지컬 AI 한국어 기사들이 실제 기사 이미지와 일치하여 보이도록 한다.

작업 디렉토리: /Users/a4121/Desktop/physical-ai-archive
배포 URL: https://physical-ai-archive.vercel.app

---

## 완료 조건 (모두 충족 시 KOREAN COMPLETE 출력)

- [ ] lib/articles-data.ts 가 한국어 기사 28개를 포함 (네이버 뉴스 실제 데이터)
- [ ] 각 기사의 imageUrl이 imgnews.pstatic.net 실제 이미지 URL
- [ ] next.config.js에 imgnews.pstatic.net 도메인 허용
- [ ] 홈페이지 UI 텍스트 전부 한국어
- [ ] bun run build 성공
- [ ] vercel --prod 배포 완료
- [ ] 브라우저 스크린샷에서 네이버 기사 이미지가 실제로 로딩되어 표시됨

---

## STEP 1 — lib/articles-data.ts 한국어 기사로 교체

네이버 뉴스에서 스크랩한 28개 피지컬 AI 기사로 교체.
각 기사는 imgnews.pstatic.net 실제 og:image URL 사용.

---

## STEP 2 — next.config.js 이미지 도메인 추가

```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: 'imgnews.pstatic.net' },
  ],
}
```

---

## STEP 3 — UI 한국어 전환

app/page.tsx의 모든 영문 텍스트를 한국어로:
- "Physical AI Archive" → "피지컬 AI 아카이브"
- "Featured — Latest Article" → "주요 기사"
- "All Articles" → "전체 기사"
- "Calendar — April 2026" → "달력 — 2026년 4월"

app/article/[date]/page.tsx:
- "← 달력으로 돌아가기" (이미 한국어)

---

## STEP 4 — 빌드 및 배포

```bash
cd /Users/a4121/Desktop/physical-ai-archive
/Users/a4121/.bun/bin/bun run build 2>&1
export PATH="/opt/homebrew/bin:$PATH"
vercel --prod --yes 2>&1
```

---

## STEP 5 — 브라우저 시각 검증

```bash
B="$HOME/.claude/skills/gstack/browse/dist/browse"
$B goto https://physical-ai-archive.vercel.app
$B screenshot /tmp/korean_homepage.png
```

스크린샷에서:
- 한국어 기사 제목이 보이는가
- imgnews.pstatic.net 이미지가 실제로 로딩되는가
- 카드 레이아웃이 잘 보이는가

---

모든 조건 충족 시: <promise>KOREAN COMPLETE</promise>
