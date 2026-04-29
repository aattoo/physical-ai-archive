import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-flex items-center gap-1">
          ← 달력으로 돌아가기
        </Link>

        {/* Hero Image */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mt-4 mb-6 shadow-md">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="text-xs bg-white/90 text-blue-700 px-3 py-1 rounded-full font-semibold backdrop-blur-sm">
              {article.date}
            </span>
            <span className="text-xs bg-white/80 text-gray-700 px-3 py-1 rounded-full backdrop-blur-sm">
              {article.source}
            </span>
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-snug">
            {article.title}
          </h1>

          <p className="text-gray-700 text-base leading-relaxed mb-8">
            {article.description}
          </p>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            원문 읽기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Prev / Next Navigation */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {prev ? (
            <Link
              href={`/article/${prev.date}`}
              className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={prev.imageUrl}
                  alt={prev.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 340px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-400 mb-1">← {prev.date.slice(5)}</p>
                <p className="text-xs font-medium text-gray-700 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {prev.title}
                </p>
              </div>
            </Link>
          ) : <div />}

          {next ? (
            <Link
              href={`/article/${next.date}`}
              className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={next.imageUrl}
                  alt={next.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 340px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-400 mb-1 text-right">{next.date.slice(5)} →</p>
                <p className="text-xs font-medium text-gray-700 line-clamp-2 group-hover:text-blue-600 transition-colors text-right">
                  {next.title}
                </p>
              </div>
            </Link>
          ) : <div />}
        </div>
      </main>
    </>
  )
}
