#!/usr/bin/env node
/**
 * 매일 오전 9시: 네이버 뉴스에서 피지컬 AI 기사 후보 10개 스크랩
 * GitHub Issues로 게시
 */

const https = require('https')
const { execSync } = require('child_process')

const TODAY = new Date().toISOString().slice(0, 10).replace(/-/g, '')
const SEARCH_URL = `https://search.naver.com/search.naver?where=news&query=%ED%94%BC%EC%A7%80%EC%BB%AC+AI&sort=1&nso=so%3Ar%2Cp%3Afrom${TODAY}to${TODAY}`

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      }
    }
    const req = https.get(url, options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    })
    req.on('error', reject)
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')) })
  })
}

async function getArticleDetails(url) {
  try {
    const html = await fetchPage(url)
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/)
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/)
    const imgMatch = html.match(/<meta property="og:image" content="([^"]+)"/)
    const dateMatch = html.match(/data-date-time="([^"]+)"/)
    const pressMatch = html.match(/class="media_end_linked_more_point[^"]*">([^<]+)</)

    return {
      title: titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>') : '',
      description: descMatch ? descMatch[1].replace(/&amp;/g, '&') : '',
      imageUrl: imgMatch ? imgMatch[1] : '',
      date: dateMatch ? dateMatch[1].slice(0, 10) : new Date().toISOString().slice(0, 10),
      source: pressMatch ? pressMatch[1].trim() : '',
      url: url.split('?')[0]
    }
  } catch (e) {
    return null
  }
}

async function main() {
  console.log(`오늘 날짜: ${TODAY}`)
  console.log(`검색 URL: ${SEARCH_URL}`)

  let html
  try {
    html = await fetchPage(SEARCH_URL)
  } catch (e) {
    console.error('검색 페이지 로드 실패:', e.message)
    process.exit(1)
  }

  // Extract article URLs from search results
  const urlPattern = /href="(https:\/\/n\.news\.naver\.com\/mnews\/article\/[^"]+)"/g
  const urls = []
  const seen = new Set()
  let match
  while ((match = urlPattern.exec(html)) !== null) {
    const url = match[1].split('?')[0]
    if (!seen.has(url)) {
      seen.add(url)
      urls.push(url)
    }
    if (urls.length >= 15) break
  }

  if (urls.length === 0) {
    console.log('오늘 기사 없음. 최근 3일로 확장 검색...')
    const d3 = new Date()
    d3.setDate(d3.getDate() - 3)
    const from3 = d3.toISOString().slice(0, 10).replace(/-/g, '')
    const expandedUrl = `https://search.naver.com/search.naver?where=news&query=%ED%94%BC%EC%A7%80%EC%BB%AC+AI&sort=1&nso=so%3Ar%2Cp%3Afrom${from3}to${TODAY}`
    try {
      html = await fetchPage(expandedUrl)
      let m2
      while ((m2 = urlPattern.exec(html)) !== null) {
        const url = m2[1].split('?')[0]
        if (!seen.has(url)) { seen.add(url); urls.push(url) }
        if (urls.length >= 15) break
      }
    } catch(e) {}
  }

  console.log(`발견된 URL: ${urls.length}개`)

  const articles = []
  for (const url of urls.slice(0, 15)) {
    const article = await getArticleDetails(url)
    if (article && article.title && article.imageUrl && article.imageUrl.includes('imgnews.pstatic.net')) {
      articles.push(article)
      console.log(`✓ ${article.date} | ${article.source} | ${article.title.slice(0, 40)}`)
    }
    if (articles.length >= 10) break
    await new Promise(r => setTimeout(r, 500))
  }

  if (articles.length === 0) {
    console.log('유효한 기사 없음 - 이슈 생성 건너뜀')
    return
  }

  // Create GitHub issue with all candidates
  const repo = process.env.GITHUB_REPOSITORY || 'aattoo/physical-ai-archive'
  const token = process.env.GITHUB_TOKEN

  const todayFormatted = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  let body = `## ${todayFormatted} 피지컬 AI 뉴스 후보\n\n`
  body += `아래 기사 중 하나를 선택해 \`OK\` 댓글을 달아주세요. 자동으로 사이트에 배포됩니다.\n\n---\n\n`

  articles.forEach((a, i) => {
    body += `### ${i + 1}. ${a.title}\n\n`
    body += `- **출처**: ${a.source}\n`
    body += `- **날짜**: ${a.date}\n`
    body += `- **URL**: ${a.url}\n`
    body += `- **이미지**: ${a.imageUrl}\n\n`
    body += `> ${a.description.slice(0, 150)}...\n\n`
    body += `---\n\n`
  })

  body += `\n\n**사용법**: 원하는 기사 번호를 댓글로 \`OK 3\` (3번 선택) 또는 그냥 \`OK\` (1번 선택)`

  // Also store as JSON for the deploy action
  const candidatesJson = JSON.stringify(articles, null, 2)

  const issueData = JSON.stringify({
    title: `[${todayFormatted}] 피지컬 AI 뉴스 후보 ${articles.length}개`,
    body,
    labels: ['candidate']
  })

  // Create issue via GitHub API
  const apiReq = https.request({
    hostname: 'api.github.com',
    path: `/repos/${repo}/issues`,
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'User-Agent': 'physical-ai-archive-bot',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(issueData)
    }
  }, (res) => {
    let data = ''
    res.on('data', chunk => data += chunk)
    res.on('end', () => {
      const result = JSON.parse(data)
      if (result.number) {
        console.log(`✅ 이슈 #${result.number} 생성 완료`)
        console.log(`🔗 ${result.html_url}`)
        // Output for next step
        console.log(`ISSUE_NUMBER=${result.number}`)
        console.log(`CANDIDATES_JSON=${candidatesJson}`)
      } else {
        console.error('이슈 생성 실패:', JSON.stringify(result))
        process.exit(1)
      }
    })
  })

  apiReq.on('error', (e) => { console.error(e); process.exit(1) })
  apiReq.write(issueData)
  apiReq.end()
}

main().catch(e => { console.error(e); process.exit(1) })
