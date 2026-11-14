import { useMemo, useState } from 'react'
import { Crown, Loader2, MapPin, Play, ThumbsDown, ThumbsUp, Video } from 'lucide-react'

/**
 * เรื่องเล่าตลาดพลู (Stories Directory):
 * Dedicated specifically for shops that have video clips uploaded (e.g. ร้านน้ำแข็งใส นิอ่าง).
 * Shows interactive video bento cards + like/dislike community voting.
 */
export default function ShopsDirectory({ shops = [], votes = {}, onVote, loading = false, onNavigateAllShops }) {
  const [sortBy, setSortBy] = useState('rank') // 'rank' | 'name'

  // Only shops that have video clips
  const videoShops = useMemo(() => {
    const list = (shops || []).filter((s) => Boolean(s.video))
    if (sortBy === 'rank') {
      list.sort((a, b) => (b.likes || 0) - (a.likes || 0))
    } else {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'th'))
    }
    return list
  }, [shops, sortBy])

  return (
    <section className="animate-view mx-auto max-w-3xl px-4 pb-32 pt-5">
      {/* Top Banner: เรื่องเล่าตลาดพลู */}
      <div className="mb-5 rounded-[28px] bg-gradient-to-br from-brown-700 via-brown-600 to-terracotta-600 p-5 text-cream-50 shadow-bento">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <Video className="h-5 w-5 text-mustard-300" aria-hidden="true" /> เรื่องเล่าตลาดพลู
          </h2>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur">
            {videoShops.length} คลิปเรื่องเล่า
          </span>
        </div>
        <p className="mt-1 text-xs font-medium text-cream-50/85">
          ชมคลิปสั้นเรื่องราวและสัมภาษณ์ร้านเด็ดคู่ตลาดพลู สัมผัสความผูกพันของชุมชน และร่วมโหวต 👍 / 👎
        </p>
      </div>

      {/* Sort Toggle */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { id: 'rank', label: 'จัดอันดับโหวต' },
            { id: 'name', label: 'เรียงตามชื่อ' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSortBy(opt.id)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 ${
                sortBy === opt.id
                  ? 'bg-brown-700 text-cream-50 shadow-bento-sm'
                  : 'bg-white text-brown-500 shadow-bento-sm hover:bg-sand-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {onNavigateAllShops && (
          <button
            type="button"
            onClick={onNavigateAllShops}
            className="text-xs font-bold text-terracotta-600 hover:underline flex items-center gap-1"
          >
            <span>ดูร้านทั้งหมด</span> ›
          </button>
        )}
      </div>

      {loading ? (
        <div className="rounded-[28px] bg-white p-8 text-center shadow-bento">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-100 text-terracotta-500">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <h3 className="font-display text-base font-bold text-brown-900">กำลังโหลดคลิปเรื่องเล่า...</h3>
        </div>
      ) : videoShops.length === 0 ? (
        <div className="rounded-[28px] bg-white p-8 text-center shadow-bento">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-100 text-brown-400">
            <Video className="h-6 w-6" />
          </div>
          <h3 className="font-display text-base font-bold text-brown-900">ยังไม่มีคลิปเรื่องเล่าร้านค้าในขณะนี้</h3>
          <p className="mt-1 text-xs text-brown-400">
            ผู้ดูแลระบบสามารถอัปโหลดวิดีโอเรื่องเล่าร้านเด็ดได้ผ่านแดชบอร์ด
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {videoShops.map((shop, index) => (
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

/**
 * Bento Card with Video Player, detailed story, and community voting
 */
function VideoShopCard({ shop, rank, vote, onVote }) {
  const total = (shop.likes || 0) + (shop.dislikes || 0)
  const score = total > 0 ? Math.round(((shop.likes || 0) / total) * 100) : 0

  const cast = (kind) => onVote(shop.id, vote === kind ? null : kind)

  return (
    <article className="animate-pop overflow-hidden rounded-[28px] bg-white shadow-bento border border-sand-100">
      {/* Video Banner */}
      <div className="p-3">
        <div className="relative aspect-video overflow-hidden rounded-[20px] bg-brown-900">
          <video
            controls
            preload="metadata"
            playsInline
            poster={shop.image || undefined}
            className="h-full w-full object-cover"
          >
            <source src={shop.video} type="video/mp4" />
            เบราว์เซอร์ของคุณไม่รองรับวิดีโอ
          </video>

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

          {shop.video_duration && (
            <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-brown-900/70 px-2.5 py-1 text-[11px] font-bold text-cream-50 backdrop-blur">
              <Play className="h-3 w-3 fill-current" aria-hidden="true" />
              {shop.video_duration}
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
        <p className="line-clamp-3 text-xs font-medium leading-relaxed text-brown-600">{shop.story}</p>

        {shop.map_link && (
          <div className="pt-1">
            <a
              href={shop.map_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-terracotta-600 hover:underline"
            >
              <MapPin className="h-3.5 w-3.5" /> ดูตำแหน่งบน Google Maps
            </a>
          </div>
        )}

        {/* Like / Dislike voting bar */}
        <div className="mt-3 pt-2 border-t border-sand-100">
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
                {shop.likes?.toLocaleString?.() || 0}
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
                {shop.dislikes?.toLocaleString?.() || 0}
              </button>
            </div>

            <span className="text-[11px] font-bold text-brown-500">{score}% ถูกใจ</span>
          </div>
        </div>
      </div>
    </article>
  )
}
