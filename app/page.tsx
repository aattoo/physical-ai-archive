import Link from 'next/link'
import Image from 'next/image'
import { APRIL_ARTICLES } from '@/lib/articles-data'
import { Header } from '@/components/Header'

export default function Home() {
  const articleMap = new Map(APRIL_ARTICLES.map((a) => [a.date, a]))

  const days = Array.from({ length: 28 }, (_, i) => {
    const day = i + 1
    const date = `2026-04-${String(day).padStart(2, '0')}`
    return { day, date, article: articleMap.get(date) ?? null }
  })

  const featured = APRIL_ARTICLES[APRIL_ARTICLES.length - 1]
  const grid = [...APRIL_ARTICLES].slice(0, -1).reverse()

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-900 text-white px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            피지컬 AI 아카이브
          </h1>
          <p className="text-blue-200 text-lg mb-6">
            2026년 4월 피지컬 AI 뉴스 아카이브 — 네이버 뉴스 스크랩
          </p>
          <div className="flex gap-3 flex-wrap">
            <span className="bg-white/20 text-white text-sm px-4 py-1.5 rounded-full font-medium backdrop-blur-sm">
              {APRIL_ARTICLES.length}개 기사
            </span>
            <span className="bg-white/20 text-white text-sm px-4 py-1.5 rounded-full backdrop-blur-sm">
              4월 한달
            </span>
            <span className="bg-blue-500/40 text-white text-sm px-4 py-1.5 rounded-full backdrop-blur-sm">
              네이버 뉴스
            </span>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 py-10">

        {/* Featured Article */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-4">
            주요 기사
          </h2>
          <Link
            href={`/article/${featured.date}`}
            className="group block bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              <div className="relative w-full md:w-96 aspect-video md:aspect-auto md:h-56 shrink-0 overflow-hidden">
                <Image
                  src={featured.imageUrl}
                  alt={featured.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 384px"
                />
              </div>
              <div className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                    {featured.date.slice(5)}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {featured.source}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                  {featured.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                  {featured.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
                  읽기 →
                </span>
              </div>
            </div>
          </Link>
        </section>

        {/* Article Grid */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-4">
            전체 기사
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {grid.map((a) => (
              <Link
                key={a.date}
                href={`/article/${a.date}`}
                className="group block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all overflow-hidden"
              >
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={a.imageUrl}
                    alt={a.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {a.date.slice(5)}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs text-blue-600 font-medium mb-1">{a.source}</p>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {a.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Calendar Section */}
        <section>
          <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-4">
            달력 — 2026년 4월
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="grid grid-cols-7 gap-2">
              {['월', '화', '수', '목', '금', '토', '일'].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 pb-1">
                  {d}
                </div>
              ))}
              {[0, 1].map((i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map(({ day, date, article }) =>
                article ? (
                  <Link
                    key={date}
                    href={`/article/${date}`}
                    className="aspect-square flex flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-400 shadow-sm transition-all cursor-pointer group"
                  >
                    <span className="text-base font-bold">{day}</span>
                    <span className="text-[9px] text-blue-500 mt-0.5 truncate px-1 w-full text-center group-hover:text-blue-700">
                      {article.source.split(' ')[0]}
                    </span>
                  </Link>
                ) : (
                  <div
                    key={date}
                    className="aspect-square flex items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-300"
                  >
                    <span className="text-base font-bold">{day}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
