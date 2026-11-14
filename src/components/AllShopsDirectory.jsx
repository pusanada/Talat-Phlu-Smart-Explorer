import { useMemo, useState } from 'react'
import { ExternalLink, Loader2, MapPin, Search, Store } from 'lucide-react'

/**
 * All Shops Directory (ร้านค้าทั้งหมดในย่านตลาดพลู):
 * Displays all verified shops from the Google Maps sheet in a clean single-column layout.
 * Rule: Uses real Google Maps photo if available; if not, DOES NOT use fake stock replacement photos.
 */
export default function AllShopsDirectory({ shops = [], loading = false }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด')

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set()
    shops.forEach((s) => {
      if (s.category) set.add(s.category)
    })
    return ['ทั้งหมด', ...Array.from(set)]
  }, [shops])

  // Filter shops
  const filtered = useMemo(() => {
    return shops.filter((s) => {
      const matchCat = selectedCategory === 'ทั้งหมด' || s.category === selectedCategory
      const matchSearch =
        !searchQuery.trim() ||
        (s.name || '').toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (s.signature_menu || '').toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (s.category || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
      return matchCat && matchSearch
    })
  }, [shops, selectedCategory, searchQuery])

  return (
    <section className="animate-view mx-auto max-w-3xl px-4 pb-32 pt-5">
      {/* Top Banner */}
      <div className="mb-5 rounded-[28px] bg-gradient-to-br from-terracotta-600 to-brown-700 p-5 text-cream-50 shadow-bento">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <Store className="h-5 w-5 text-mustard-300" aria-hidden="true" /> ร้านค้าทั้งหมดในย่านตลาดพลู
        </h2>
        <p className="mt-0.5 text-xs font-medium text-cream-50/80">
          พิกัดร้านอาหาร คาเฟ่ และร้านเด็ดรอบสถานีรถไฟตลาดพลู (แตะเพื่อเปิดนำทางบน Google Maps)
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-3 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brown-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาชื่อร้าน, เมนูเด่น, หรือประเภท..."
          className="w-full rounded-2xl bg-white pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-brown-900 shadow-bento-sm border border-sand-200 outline-none focus:border-terracotta-400 transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-brown-400 hover:text-brown-700"
          >
            ✕ ล้าง
          </button>
        )}
      </div>

      {/* Category Pills */}
      {categories.length > 2 && (
        <div className="no-scrollbar -mx-4 mb-5 flex gap-1.5 overflow-x-auto px-4 pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-brown-800 text-cream-50 shadow-bento-sm'
                  : 'bg-white text-brown-600 shadow-bento-sm hover:bg-sand-100 border border-sand-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="rounded-[28px] bg-white p-8 text-center shadow-bento">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-100 text-terracotta-500">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <h3 className="font-display text-base font-bold text-brown-900">กำลังโหลดข้อมูลร้านค้า...</h3>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[28px] bg-white p-8 text-center shadow-bento">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-100 text-brown-400">
            <Store className="h-6 w-6" />
          </div>
          <h3 className="font-display text-base font-bold text-brown-900">ไม่พบร้านค้าที่ตรงกับเงื่อนไข</h3>
          <p className="mt-1 text-xs text-brown-400">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น</p>
        </div>
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between text-xs font-bold text-brown-500 px-1">
            <span>แสดงผล {filtered.length} ร้าน</span>
            <span>📍 ปักหมุดบนแผนที่</span>
          </div>

          {/* Single Column Compact Horizontal Cards */}
          <div className="space-y-3">
            {filtered.map((shop) => (
              <ShopMapCard key={shop.id} shop={shop} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

/**
 * Compact Horizontal Shop Card
 * Displays real Google Maps image if available; does NOT use fake stock replacement images.
 */
function ShopMapCard({ shop }) {
  const hasRealImage = Boolean(shop.image && !shop.image.includes('unsplash.com'))

  return (
    <article className="group flex items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-bento-sm border border-sand-100 transition hover:shadow-bento hover:border-sand-200">
      {/* Thumbnail or Map Pin Badge (No fake replacement image) */}
      {hasRealImage ? (
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-sand-100">
          <img
            src={shop.image}
            alt={shop.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-sand-100 to-warm-100 border border-sand-200 text-brown-700 shadow-sm">
          <MapPin className="h-5 w-5 text-terracotta-500 mb-0.5" />
          <span className="text-[9px] font-bold tracking-tight text-brown-500">Google Map</span>
        </div>
      )}

      {/* Center Details */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <h4 className="truncate font-display text-sm font-bold text-brown-900 group-hover:text-terracotta-600 transition-colors">
            {shop.name}
          </h4>
          <span className="rounded-full bg-sand-100 px-2 py-0.5 text-[10px] font-bold text-brown-600">
            {shop.category}
          </span>
        </div>

        {shop.signature_menu && (
          <p className="line-clamp-1 text-xs font-semibold text-terracotta-500">
            🍽️ {shop.signature_menu}
          </p>
        )}

        {shop.story && (
          <p className="line-clamp-1 text-[11px] text-brown-400 leading-snug">
            {shop.story}
          </p>
        )}
      </div>

      {/* Right Google Maps Navigation Button */}
      {shop.map_link && (
        <a
          href={shop.map_link}
          target="_blank"
          rel="noopener noreferrer"
          title="เปิดนำทางบน Google Maps"
          className="shrink-0 flex items-center gap-1 rounded-full bg-sand-100 px-3 py-2 text-xs font-bold text-brown-700 transition hover:bg-terracotta-500 hover:text-white active:scale-95 shadow-sm"
        >
          <MapPin className="h-3.5 w-3.5 text-terracotta-500 group-hover:text-white" />
          <span className="hidden sm:inline">Google Maps</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>
      )}
    </article>
  )
}
