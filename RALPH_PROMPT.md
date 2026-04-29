# Physical AI Archive — 날짜 정확성 & 기사 다양성 수정

## 목표
현재 모든 기사가 실제 게재일(2026-04-28)과 다른 날짜(04-01~04-28)로 임의 배정되어 있다.
이를 수정하여: 각 기사의 date 필드 = 실제 네이버 뉴스 게재 날짜

작업 디렉토리: /Users/a4121/Desktop/physical-ai-archive

---

## 문제 정의

1. **날짜 불일치**: articles-data.ts의 date 필드가 실제 기사 게재일과 다름
2. **다양성 부족**: 비슷한 주제의 기사가 동일 날짜 또는 3일 이내에 몰려 있음

---

## STEP 1 — 네이버 뉴스에서 날짜별 기사 스크랩

아래 GStack 브라우저 명령으로 4월 전체 기간의 기사를 날짜별로 수집:

```bash
B="$HOME/.claude/skills/gstack/browse/dist/browse"

# 1월~4월 기간별 검색 (nso=so:r,p:from20260401to20260415)
$B goto "https://search.naver.com/search.naver?where=news&query=%ED%94%BC%EC%A7%80%EC%BB%AC+AI&sort=1&nso=so%3Ar%2Cp%3Afrom20260401to20260415" 2>&1
```

수집 목표:
- 4월 1일~28일 사이에 실제 게재된 기사들
- 각 기사의 실제 날짜를 data-date-time 속성에서 추출
- 동일 날짜 기사가 3일 이내에 겹치지 않도록 다양한 날짜 분포

---

## STEP 2 — 날짜별 기사 수집 전략

각 주차별로 검색하여 기사를 수집:
- 1주차: 4/1~4/7 검색
- 2주차: 4/8~4/14 검색  
- 3주차: 4/15~4/21 검색
- 4주차: 4/22~4/28 검색

각 기사에서 추출:
- title: og:title
- imageUrl: og:image (imgnews.pstatic.net URL)
- description: meta description
- date: data-date-time 속성 (YYYY-MM-DD 형식으로 변환)
- source: 언론사명
- url: 원문 URL

---

## STEP 3 — articles-data.ts 업데이트

- 실제 게재 날짜 기준으로 정렬
- 3일 이내 비슷한 주제 기사 중복 제거
- 최소 10개 이상의 기사, 다양한 날짜 분포
- 모든 기사에 실제 imgnews.pstatic.net 이미지 URL 사용

---

## STEP 4 — 빌드 및 배포

```bash
/Users/a4121/.bun/bin/bun run build 2>&1
export PATH="/opt/homebrew/bin:$PATH"
vercel --prod --yes 2>&1
```

---

## STEP 5 — 날짜 일치 검증

```bash
B="$HOME/.claude/skills/gstack/browse/dist/browse"
# 무작위 기사 상세 페이지 방문하여 날짜 확인
$B goto https://physical-ai-archive.vercel.app/article/[실제날짜]
$B screenshot /tmp/date_verify.png
```

스크린샷에서 확인:
- 앱에 표시된 날짜와 원문 기사의 게재일이 일치하는가
- 기사 이미지가 실제로 로딩되는가
- 다양한 날짜에 기사가 분포하는가

---

## 완료 조건 (모두 충족 시 DATE FIXED 출력)

- [ ] 각 기사의 date 필드 = 실제 네이버 뉴스 게재 날짜
- [ ] 3일 이내에 같은 주제 기사 중복 없음 (다양성 확보)
- [ ] 최소 10개 기사, 날짜 범위 April 2026
- [ ] 모든 이미지가 imgnews.pstatic.net 실제 URL
- [ ] bun run build 성공
- [ ] vercel 배포 완료
- [ ] 날짜 검증: 앱 날짜 = 실제 게재일

모든 조건 충족 시: <promise>DATE FIXED</promise>
