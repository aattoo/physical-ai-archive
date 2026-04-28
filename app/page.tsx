import Link from 'next/link'
import { APRIL_ARTICLES } from '@/lib/articles-data'
import { Header } from '@/components/Header'

export default function Home() {
  const articleMap = new Map(APRIL_ARTICLES.map((a) => [a.date, a]))

  const days = Array.from({ length: 28 }, (_, i) => {
    const day = i + 1
    const date = `2026-04-${String(day).padStart(2, '0')}`
    return { day, date, article: articleMap.get(date) ?? null }
  })

  const recent = [...APRIL_ARTICLES].slice(-5).reverse()

  return (
    <>
    <Header />
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Physical AI Archive</h1>
        <p className="text-gray-500 mt-1">2026년 4월 — 매일 하나의 Physical AI 뉴스</p>
        <div className="flex gap-3 mt-3">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
            {APRIL_ARTICLES.length}개 기사 아카이빙됨
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            4월 1일 — 4월 28일
          </span>
        </div>
      </div>

      {/* 달력 그리드 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-8 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          April 2026
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 pb-1">
              {d}
            </div>
          ))}
          {/* April 1, 2026 is Wednesday → offset 2 */}
          {[0, 1].map((i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map(({ day, date, article }) => (
            article ? (
              <Link
                key={date}
                href={`/article/${date}`}
                className="aspect-square flex flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-400 shadow-sm transition-all cursor-pointer group"
              >
                <span className="text-base font-bold">{day}</span>
                <span className="text-[10px] text-blue-500 mt-0.5 truncate px-1 w-full text-center group-hover:text-blue-700">
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
          ))}
        </div>
      </div>

      {/* 최근 기사 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">최근 아카이빙</h2>
        <div className="space-y-3">
          {recent.map((a) => (
            <Link
              key={a.date}
              href={`/article/${a.date}`}
              className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{a.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{a.source}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0 bg-gray-100 px-2 py-0.5 rounded-full">
                  {a.date.slice(5)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
    </>
  )
}
