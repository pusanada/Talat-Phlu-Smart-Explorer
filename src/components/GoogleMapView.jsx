import { useState } from 'react'
import { ExternalLink, MapPin, Navigation } from 'lucide-react'

const mapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim()

// Valid Google Cloud API Key usually starts with 'AIza'
const hasGoogleCloudApiKey = Boolean(
  mapsApiKey &&
  mapsApiKey.startsWith('AIza') &&
  !mapsApiKey.includes('your-google-maps') &&
  !mapsApiKey.includes('placeholder')
)

export default function GoogleMapView({ selectedShop = null, shops = [] }) {
  const [activeShop, setActiveShop] = useState(selectedShop)

  // Target query for Google Maps
  const query = activeShop
    ? `${activeShop.name} ตลาดพลู`
    : 'ตลาดพลู กรุงเทพมหานคร'

  // If valid Google Cloud API key is provided, use Google Maps Embed API v1;
  // otherwise, use direct Google Maps embed URL which works immediately
  const embedUrl = hasGoogleCloudApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${encodeURIComponent(query)}&zoom=16`
    : `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=16&ie=UTF8&iwloc=&output=embed`

  const externalMapUrl = activeShop?.map_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

  return (
    <div className="overflow-hidden rounded-[28px] bg-white shadow-bento-lg">
      {/* Header bar with quick shop chips */}
      <div className="border-b border-sand-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-terracotta-100 text-terracotta-600">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-brown-900">
                {activeShop ? activeShop.name : 'แผนที่ภาพรวมย่านตลาดพลู'}
              </h4>
              <p className="text-[11px] text-brown-400">
                {activeShop ? activeShop.category : 'คลิกเลือกปักหมุดร้านค้าที่สนใจ'}
              </p>
            </div>
          </div>

          <a
            href={externalMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-full bg-sand-100 px-3 py-1.5 text-xs font-bold text-brown-700 transition hover:bg-sand-200 active:scale-95"
          >
            <Navigation className="h-3.5 w-3.5 text-terracotta-600" />
            เปิดนำทาง
            <ExternalLink className="h-3 w-3 text-brown-400" />
          </a>
        </div>

        {/* Quick select shop chips */}
        {shops.length > 0 && (
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveShop(null)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition active:scale-95 ${
                activeShop === null
                  ? 'bg-brown-800 text-cream-50'
                  : 'bg-sand-100 text-brown-600 hover:bg-sand-200'
              }`}
            >
              📍 ทั้งหมด
            </button>
            {shops.slice(0, 7).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveShop(s)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition active:scale-95 ${
                  activeShop?.id === s.id
                    ? 'bg-terracotta-500 text-white shadow-bento-sm'
                    : 'bg-sand-100 text-brown-600 hover:bg-sand-200'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map iframe */}
      <div className="relative aspect-[16/10] w-full bg-sand-100">
        <iframe
          title="Google Maps ตลาดพลู"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
        />
      </div>
    </div>
  )
}
