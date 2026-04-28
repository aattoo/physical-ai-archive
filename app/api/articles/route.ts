import { NextRequest, NextResponse } from 'next/server'
import { APRIL_ARTICLES } from '@/lib/articles-data'

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')
  if (date) {
    const article = APRIL_ARTICLES.find((a) => a.date === date)
    return NextResponse.json(article ?? null)
  }
  return NextResponse.json(APRIL_ARTICLES)
}
