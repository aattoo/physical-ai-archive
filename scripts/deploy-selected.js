#!/usr/bin/env node
/**
 * "OK [번호]" 댓글이 달리면 해당 기사를 articles-data.ts에 추가하고 Vercel에 배포
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

async function fetchIssueBody(repo, issueNumber, token) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${repo}/issues/${issueNumber}`,
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'physical-ai-archive-bot',
        'Accept': 'application/vnd.github.v3+json'
      }
    }, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => resolve(JSON.parse(data)))
    })
    req.on('error', reject)
    req.end()
  })
}

async function closeIssue(repo, issueNumber, token) {
  const body = JSON.stringify({ state: 'closed', labels: ['deployed'] })
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${repo}/issues/${issueNumber}`,
      method: 'PATCH',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'physical-ai-archive-bot',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => resolve(JSON.parse(data)))
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function parseArticlesFromIssue(body) {
  const articles = []
  // Parse each article from the issue body
  const sections = body.split('---').filter(s => s.trim())

  for (const section of sections) {
    const titleMatch = section.match(/### \d+\. (.+)/)
    const sourceMatch = section.match(/\*\*출처\*\*: (.+)/)
    const dateMatch = section.match(/\*\*날짜\*\*: (.+)/)
    const urlMatch = section.match(/\*\*URL\*\*: (https:\/\/n\.news\.naver\.com[^\s]+)/)
    const imgMatch = section.match(/\*\*이미지\*\*: (https:\/\/imgnews[^\s]+)/)
    const descMatch = section.match(/> (.+)\.\.\./)

    if (titleMatch && urlMatch && imgMatch) {
      articles.push({
        title: titleMatch[1].trim(),
        source: sourceMatch ? sourceMatch[1].trim() : '',
        date: dateMatch ? dateMatch[1].trim() : new Date().toISOString().slice(0, 10),
        url: urlMatch[1].trim(),
        imageUrl: imgMatch[1].trim(),
        description: descMatch ? descMatch[1].trim() : ''
      })
    }
  }
  return articles
}

function updateArticlesData(selectedArticle) {
  const filePath = path.join(process.cwd(), 'lib', 'articles-data.ts')
  let content = fs.readFileSync(filePath, 'utf-8')

  // Find insertion point (before the last article)
  const lastArticleIdx = content.lastIndexOf("  {\n    date:")

  const newArticle = `  {
    date: '${selectedArticle.date}',
    title: '${selectedArticle.title.replace(/'/g, "\\'")}',
    source: '${selectedArticle.source}',
    url: '${selectedArticle.url}',
    description: '${selectedArticle.description.replace(/'/g, "\\'")}',
    imageUrl: '${selectedArticle.imageUrl}',
  },\n`

  // Insert before the last article (so new one becomes the featured article)
  if (lastArticleIdx !== -1) {
    content = content.slice(0, lastArticleIdx) + newArticle + content.slice(lastArticleIdx)
  }

  fs.writeFileSync(filePath, content)
  console.log(`✅ articles-data.ts 업데이트: ${selectedArticle.date} | ${selectedArticle.title.slice(0, 40)}`)
}

async function main() {
  const repo = process.env.GITHUB_REPOSITORY || 'aattoo/physical-ai-archive'
  const token = process.env.GITHUB_TOKEN
  const issueNumber = process.env.ISSUE_NUMBER
  const commentBody = process.env.COMMENT_BODY || 'OK'

  console.log(`이슈 #${issueNumber} 처리 중...`)
  console.log(`댓글: ${commentBody}`)

  // Parse which article number was selected
  const numMatch = commentBody.match(/OK\s*(\d+)/i)
  const selectedNum = numMatch ? parseInt(numMatch[1]) - 1 : 0

  // Get issue body
  const issue = await fetchIssueBody(repo, issueNumber, token)
  const articles = parseArticlesFromIssue(issue.body)

  console.log(`이슈에서 ${articles.length}개 기사 파싱`)

  if (articles.length === 0) {
    console.error('기사 파싱 실패')
    process.exit(1)
  }

  const selected = articles[Math.min(selectedNum, articles.length - 1)]
  console.log(`선택된 기사: ${selected.title.slice(0, 50)}`)

  // Update articles-data.ts
  updateArticlesData(selected)

  // Close issue with deployed label
  await closeIssue(repo, issueNumber, token)
  console.log(`✅ 이슈 #${issueNumber} 닫힘`)
}

main().catch(e => { console.error(e); process.exit(1) })
