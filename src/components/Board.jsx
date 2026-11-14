import { useState } from 'react'
import { Heart, Loader2, MessageSquarePlus, Send, Sparkles } from 'lucide-react'

export default function Board({ posts = [], onAddPost, onLikePost, shops = [], loading = false }) {
  const [author, setAuthor] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [liked, setLiked] = useState(() => {
    try {
      const raw = localStorage.getItem('tp_liked_posts')
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  const shopName = (id) => shops.find((s) => s.id === id)?.name ?? null

  const submit = (e) => {
    e.preventDefault()
    if (!message.trim()) {
      setError('กรุณาพิมพ์รีวิวหรือคำแนะนำก่อนโพสต์')
      return
    }
    onAddPost({
      author: author.trim() || 'บุคคลนิรนาม',
      message: message.trim(),
    })
    setAuthor('')
    setMessage('')
    setError('')
  }

  const toggleLike = (id) => {
    const isCurrentlyLiked = !!liked[id]
    const nextLiked = !isCurrentlyLiked

    const updatedMap = { ...liked, [id]: nextLiked }
    setLiked(updatedMap)
    try {
      localStorage.setItem('tp_liked_posts', JSON.stringify(updatedMap))
    } catch {}

    const targetPost = posts.find((p) => p.id === id)
    const baseLikes = targetPost?.likes || 0
    const nextLikes = nextLiked ? baseLikes + 1 : Math.max(0, baseLikes - 1)

    if (onLikePost) {
      onLikePost(id, nextLikes)
    }
  }

  return (
    <section className="animate-view mx-auto max-w-3xl px-4 pb-32 pt-5">
      {/* Banner */}
      <div className="mb-5 rounded-[28px] bg-gradient-to-br from-warm-500 to-mustard-400 p-5 text-brown-900 shadow-bento">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <MessageSquarePlus className="h-5 w-5" aria-hidden="true" /> กระดานชุมชนตลาดพลู
        </h2>
        <p className="mt-0.5 text-xs font-medium text-brown-700/80">
          แชร์รีวิว ร้านเด็ด หรือเกร็ดความรู้เกี่ยวกับย่านตลาดพลู
        </p>
      </div>

      {/* Compose — bento card */}
      <form
        onSubmit={submit}
        className="mb-6 space-y-3 rounded-[28px] bg-white p-5 shadow-bento"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand-100 text-lg">
            ✍️
          </span>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="ชื่อเล่น (ไม่ใส่ได้ = บุคคลนิรนาม)"
            maxLength={30}
            className="w-full rounded-xl border border-sand-200 bg-sand-100 px-4 py-2.5 text-sm font-semibold text-brown-900 outline-none transition placeholder:font-normal placeholder:text-brown-300 focus:border-warm-400 focus:ring-2 focus:ring-warm-400/30"
          />
        </div>
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            if (error) setError('')
          }}
          placeholder="เล่าเรื่องร้านอร่อยที่เจอในตลาดพลู..."
          rows={3}
          maxLength={280}
          className="w-full resize-none rounded-2xl border border-sand-200 bg-sand-100 px-4 py-3 text-sm leading-relaxed text-brown-900 outline-none transition placeholder:text-brown-300 focus:border-warm-400 focus:ring-2 focus:ring-warm-400/30"
        />
        {error && <p className="text-xs font-bold text-terracotta-600">⚠️ {error}</p>}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-brown-300">{message.length}/280</span>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-[40px] bg-terracotta-500 px-6 py-3 text-sm font-bold text-white shadow-bento-sm transition hover:bg-terracotta-600 active:scale-95"
          >
            <Send className="h-4 w-4" aria-hidden="true" /> โพสต์
          </button>
        </div>
      </form>

      {/* Feed */}
      {loading ? (
        <div className="rounded-[28px] bg-white p-8 text-center shadow-bento">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-100 text-terracotta-500">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <h3 className="font-display text-base font-bold text-brown-900">กำลังโหลดโพสต์...</h3>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-[28px] bg-white p-8 text-center shadow-bento">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-100 text-brown-500">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="font-display text-base font-bold text-brown-900">ยังไม่มีโพสต์ในกระดาน</h3>
          <p className="mt-1 text-xs text-brown-400">
            ร่วมแชร์ความอร่อยหรือเกร็ดความรู้เป็นคนแรกของย่านตลาดพลูได้เลย!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="animate-pop rounded-[28px] bg-white p-5 shadow-bento-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand-100 text-xl">
                  {post.avatar || '💬'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-brown-900">{post.author}</p>
                  <p className="text-[11px] font-medium text-brown-300">{post.time || 'เมื่อสักครู่'} ที่แล้ว</p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-brown-700">{post.message}</p>

              {shopName(post.shop_id || post.shop) && (
                <span className="mt-3 inline-block rounded-full bg-terracotta-100 px-3 py-1.5 text-[11px] font-bold text-terracotta-600">
                  📍 {shopName(post.shop_id || post.shop)}
                </span>
              )}

              <div className="mt-3.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 ${
                    liked[post.id]
                      ? 'bg-terracotta-500 text-white shadow-bento-sm'
                      : 'bg-sand-100 text-brown-500 hover:bg-sand-200'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${liked[post.id] ? 'fill-current' : ''}`} aria-hidden="true" />
                  {((post.likes || 0) + (liked[post.id] ? 1 : 0)).toLocaleString()}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
