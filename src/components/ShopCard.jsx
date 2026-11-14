import { BookOpen, MapPin, UtensilsCrossed } from 'lucide-react'

/**
 * Swipeable soft card — used in the Quiz result carousel
 * (the Shops Directory uses the video feed card instead).
 */
export default function ShopCard({ shop, accent = '#c2543a' }) {
  // If map_link is an example or empty, dynamically route to real Google Maps search
  const mapUrl =
    shop.map_link && !shop.map_link.includes('example')
      ? shop.map_link
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.name || ''} ตลาดพลู`)}`

  return (
    <article className="w-72 shrink-0 snap-start overflow-hidden rounded-[28px] bg-white shadow-bento transition-transform duration-200 active:scale-[0.98] sm:w-80">
      <div className="relative h-36 sm:h-40 overflow-hidden bg-gradient-to-br from-sand-100 via-warm-50 to-sand-200 flex items-center justify-center">
        {shop.image && !shop.image.includes('unsplash.com') ? (
          <img src={shop.image} alt={shop.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-3">
            <MapPin className="h-7 w-7 text-terracotta-500 mb-1" />
            <span className="text-xs font-bold text-brown-800">พิกัดร้านบน Google Maps</span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-brown-800 backdrop-blur shadow-sm">
          {shop.category}
        </span>
      </div>

      <div className="space-y-2.5 p-4">
        <h3 className="font-display text-base font-bold leading-snug text-brown-900">{shop.name}</h3>

        <p className="flex items-start gap-1.5 text-sm font-semibold" style={{ color: accent }}>
          <UtensilsCrossed className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{shop.signature_menu}</span>
        </p>

        <p className="flex items-start gap-1.5 text-xs font-medium leading-relaxed text-brown-500">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="line-clamp-2">{shop.story}</span>
        </p>

        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-[40px] bg-terracotta-500 py-3 font-display text-sm font-bold text-white shadow-bento-sm transition hover:bg-terracotta-600 active:scale-[0.97]"
        >
          <MapPin className="h-4 w-4" aria-hidden="true" />
          ไปดูแผนที่ (Google Maps)
        </a>
      </div>
    </article>
  )
}
