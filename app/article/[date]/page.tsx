import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getArticleByDate, APRIL_ARTICLES } from '@/lib/articles-data'
import { Header } from '@/components/Header'

export function generateStaticParams() {
  return APRIL_ARTICLES.map((a) => ({ date: a.date }))
}

export default function ArticlePage({ params }: { params: { date: string } }) {
  const article = getArticleByDate(params.date)
  if (!article) notFound()

  const idx = APRIL_ARTICLES.findIndex((a) => a.date === params.date)
  const prev = idx > 0 ? APRIL_ARTICLES[idx - 1] : null
  const next = idx < APRIL_ARTICLES.length - 1 ? APRIL_ARTICLES[idx + 1] : null

  return (
    <>
    <Header />
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-flex items-center gap-1">
        ← 달력으로 돌아가기
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
            {article.date}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {article.source}
          </span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-4 leading-snug">
          {article.title}
        </h1>

        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          {article.description}
        </p>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          원문 읽기
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <div className="mt-6 flex items-center justify-between">
        {prev ? (
          <Link
            href={`/article/${prev.date}`}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-xl px-4 py-2 hover:border-gray-300 transition-all"
          >
            <span>←</span>
            <div className="text-left">
              <p className="text-xs text-gray-400">{prev.date.slice(5)}</p>
              <p className="line-clamp-1 max-w-[160px]">{prev.title}</p>
            </div>
          </Link>
        ) : <div />}

        {next ? (
          <Link
            href={`/article/${next.date}`}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-xl px-4 py-2 hover:border-gray-300 transition-all"
          >
            <div className="text-right">
              <p className="text-xs text-gray-400">{next.date.slice(5)}</p>
              <p className="line-clamp-1 max-w-[160px]">{next.title}</p>
            </div>
            <span>→</span>
          </Link>
        ) : <div />}
      </div>
    </main>
    </>
  )
}
