import { useMemo, useState } from 'react'
import { Crown, Loader2, Play, ThumbsDown, ThumbsUp, Video } from 'lucide-react'

/**
 * Normal-user Shops Directory:
 * soft bento video cards (1–3 min) + like/dislike ranking. No comment section.
 */
export default function ShopsDirectory({ shops = [], votes = {}, onVote, loading = false }) {
  const [sortBy, setSortBy] = useState('rank') // 'rank' | 'name'

  const ranked = useMemo(() => {
    const sorted = [...(shops || [])]
    if (sortBy === 'rank') {
      sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0))
    } else {
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'th'))
    }
    return sorted
  }, [shops, sortBy])

  return (
    <section className="animate-view mx-auto max-w-3xl px-4 pb-32 pt-5">
      {/* Banner */}
      <div className="mb-5 rounded-[28px] bg-gradient-to-br from-brown-700 to-brown-500 p-5 text-cream-50 shadow-bento">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <Video className="h-5 w-5 text-mustard-300" aria-hidden="true" /> ร้านเด็ดตลาดพลู
        </h2>
        <p className="mt-0.5 text-xs font-medium text-cream-50/80">ดูคลิปสั้นรู้จักร้านก่อนไปกิน แล้วโหวตได้เลย 👍 / 👎</p>
      </div>

      {/* Sort toggle */}
      <div className="mb-4 flex gap-2">
        {[
          { id: 'rank', label: 'จัดอันดับโหวต' },
          { id: 'name', label: 'เรียงตามชื่อ' },
        ].map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSortBy(opt.id)}
            className={`rounded-full px-4 py-2.5 text-xs font-bold transition active:scale-95 ${
              sortBy === opt.id
                ? 'bg-brown-700 text-cream-50 shadow-bento-sm'
                : 'bg-white text-brown-500 shadow-bento-sm hover:bg-sand-100'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-[28px] bg-white p-8 text-center shadow-bento">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-100 text-terracotta-500">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <h3 className="font-display text-base font-bold text-brown-900">กำลังโหลดข้อมูลร้านค้า...</h3>
        </div>
      ) : ranked.length === 0 ? (
        <div className="rounded-[28px] bg-white p-8 text-center shadow-bento">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-100 text-brown-500">
            <Video className="h-6 w-6" />
          </div>
          <h3 className="font-display text-base font-bold text-brown-900">ยังไม่พบข้อมูลร้านค้า</h3>
          <p className="mt-1 text-xs text-brown-400">
            กำลังรอข้อมูลร้านค้าจากฐานข้อมูล Supabase หรือสามารถเพิ่มร้านใหม่ผ่านหน้าผู้ดูแลระบบได้
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {ranked.map((shop, index) => (
            <VideoShopCard
              key={shop.id}
              shop={shop}
              rank={sortBy === 'rank' ? index + 1 : null}
              vote={votes[shop.id] ?? null}
              onVote={onVote}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function VideoShopCard({ shop, rank, vote, onVote }) {
  const total = shop.likes + shop.dislikes
  const score = total > 0 ? Math.round((shop.likes / total) * 100) : 100

  const cast = (kind) => onVote(shop.id, vote === kind ? null : kind)

  return (
    <article className="animate-pop overflow-hidden rounded-[28px] bg-white shadow-bento">
      {/* Video or Image Banner */}
      <div className="p-3">
        <div className="relative aspect-video overflow-hidden rounded-[20px] bg-brown-900">
          {shop.video ? (
            <video
              controls
              preload="metadata"
              playsInline
              poster={shop.image}
              className="h-full w-full object-cover"
            >
              <source src={shop.video} type="video/mp4" />
              เบราว์เซอร์ของคุณไม่รองรับวิดีโอ
            </video>
          ) : (
            <img
              src={shop.image}
              alt={shop.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          )}

          {rank !== null && (
            <span
              className={`absolute left-3 top-3 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold shadow-bento-sm ${
                rank === 1 ? 'bg-mustard-400 text-brown-900' : 'bg-brown-900/70 text-cream-50 backdrop-blur'
              }`}
            >
              {rank === 1 && <Crown className="h-3.5 w-3.5" aria-hidden="true" />}
              อันดับ {rank}
            </span>
          )}

          {shop.video && (
            <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-brown-900/70 px-2.5 py-1 text-[11px] font-bold text-cream-50 backdrop-blur">
              <Play className="h-3 w-3 fill-current" aria-hidden="true" />
              {shop.video_duration || 'คลิปสั้น'}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 px-4 pb-4 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-base font-bold leading-snug text-brown-900">{shop.name}</h3>
          <span className="rounded-full bg-sand-100 px-2.5 py-1 text-[10px] font-bold text-brown-500">
            {shop.category}
          </span>
        </div>

        <p className="text-sm font-semibold text-terracotta-500">🍽️ {shop.signature_menu}</p>
        <p className="line-clamp-2 text-xs font-medium leading-relaxed text-brown-500">{shop.story}</p>

        {/* Like / Dislike ranking */}
        <div className="mt-3">
          <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-sand-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-warm-400 to-terracotta-500 transition-all duration-500"
              style={{ width: `${score}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => cast('like')}
                aria-pressed={vote === 'like'}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 ${
                  vote === 'like'
                    ? 'bg-terracotta-500 text-white shadow-bento-sm'
                    : 'bg-sand-100 text-brown-700 hover:bg-sand-200'
                }`}
              >
                <ThumbsUp className={`h-4 w-4 ${vote === 'like' ? 'fill-current' : ''}`} aria-hidden="true" />
                {shop.likes.toLocaleString()}
              </button>

              <button
                type="button"
                onClick={() => cast('dislike')}
                aria-pressed={vote === 'dislike'}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 ${
                  vote === 'dislike'
                    ? 'bg-brown-700 text-cream-50 shadow-bento-sm'
                    : 'bg-sand-100 text-brown-700 hover:bg-sand-200'
                }`}
              >
                <ThumbsDown className={`h-4 w-4 ${vote === 'dislike' ? 'fill-current' : ''}`} aria-hidden="true" />
                {shop.dislikes.toLocaleString()}
              </button>
            </div>

            <span className="text-[11px] font-bold text-brown-500">{score}% ถูกใจ</span>
          </div>
        </div>
      </div>
    </article>
  )
}
