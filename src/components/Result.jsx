import { useRef, useState } from 'react'
import { Award, Check, Download, Loader2, MapPin, RotateCcw, Share2, Trophy } from 'lucide-react'
import { toBlob, toPng } from 'html-to-image'
import ShopCard from './ShopCard'
import Mascot from './Mascot'
import { PERSONAS, computeTally, computePersona, getRecommendedShops } from '../constants/personas'

// Radar axes: Exactly matching PERSONAS keys and names
const AXES = [
  { key: 'sweet', label: PERSONAS.sweet.name, emoji: PERSONAS.sweet.emoji },
  { key: 'street', label: PERSONAS.street.name, emoji: PERSONAS.street.emoji },
  { key: 'chill', label: PERSONAS.chill.name, emoji: PERSONAS.chill.emoji },
  { key: 'healthy', label: PERSONAS.healthy.name, emoji: PERSONAS.healthy.emoji },
]

export default function Result({ answers, shops = [], onRestart, questions }) {
  const tally = computeTally(answers, questions)
  const persona = PERSONAS[computePersona(answers, questions)] || PERSONAS.street
  const recommended = getRecommendedShops(shops, persona.key)

  // Card ref for Image Export
  const cardRef = useRef(null)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState('')

  // Normalize tallies to 0–100% (max per key = 5 questions × 3 pts = 15 pts)
  const stats = AXES.map((ax) => {
    const raw = tally[ax.key] || 0
    const pct = Math.min(100, Math.round((raw / 15) * 100))
    return {
      ...ax,
      rawScore: raw,
      value: pct,
      isWinner: ax.key === persona.key,
    }
  })

  // Sort stats descending for the strength list so the winning persona is #1
  const sortedStats = [...stats].sort((a, b) => b.value - a.value)

  const handleExportImage = async () => {
    if (!cardRef.current || exporting) return
    setExporting(true)
    setToast('กำลังสร้างรูปภาพผลลัพธ์...')

    try {
      // 1. Generate High-Res PNG Data URL
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: persona.bg,
      })

      let shared = false

      // 2. Try Native Web Share with file on supported devices (Mobile Chrome / Safari)
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.share) {
        try {
          const blob = await toBlob(cardRef.current, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: persona.bg,
          })
          if (blob) {
            const file = new File([blob], `talat-phlu-${persona.key}.png`, { type: 'image/png' })
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: `ฉันคือ "${persona.name}" แห่งตลาดพลู!`,
                text: `ค้นพบสไตล์สายกินตลาดพลูของคุณได้ที่ ตลาดพลู สมาร์ทโซน 🍧 #ตลาดพลู #TalatPhlu`,
              })
              shared = true
            }
          }
        } catch (shareErr) {
          console.info('Native share bypassed or cancelled:', shareErr)
        }
      }

      // 3. Fallback to direct PNG download
      if (!shared) {
        const link = document.createElement('a')
        link.download = `talat-phlu-${persona.key}.png`
        link.href = dataUrl
        link.click()
      }

      setToast('📸 บันทึกรูปภาพผลลัพธ์เรียบร้อยแล้ว!')
      setTimeout(() => setToast(''), 3500)
    } catch (err) {
      console.error('Failed to export image:', err)
      setToast('⚠️ ไม่สามารถส่งออกภาพได้ กรุณาลองใหม่อีกครั้ง')
      setTimeout(() => setToast(''), 3500)
    } finally {
      setExporting(false)
    }
  }

  return (
    <section
      className="animate-view min-h-dvh px-4 pb-32 pt-6 transition-colors duration-700 relative"
      style={{ backgroundColor: persona.bg }}
    >
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-brown-900/90 backdrop-blur px-5 py-2.5 text-xs sm:text-sm font-bold text-cream-50 shadow-bento-lg animate-pop">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        {/* ── EXPORTABLE CONTAINER (Captured for Image Export) ── */}
        <div ref={cardRef} className="rounded-[40px] p-2 sm:p-4 space-y-4" style={{ backgroundColor: persona.bg }}>
          {/* Watermark branding header for shared image */}
          <div className="flex items-center justify-between px-3 pt-2 text-[11px] font-bold text-brown-600/80">
            <span className="flex items-center gap-1.5">
              <span>🍧</span> ตลาดพลู สมาร์ทโซน
            </span>
            <span className="font-mono uppercase tracking-wider text-[10px]">Talat Phlu Smart Explorer</span>
          </div>

          {/* Persona header — soft stat-card banner */}
          <div className="mx-auto max-w-md rounded-[40px] bg-white p-2 shadow-bento-lg">
            <div
              className="rounded-[32px] px-4 py-5 text-center"
              style={{ backgroundColor: persona.bgDeep }}
            >
              <p className="font-display text-[11px] font-extrabold uppercase tracking-[0.3em]" style={{ color: persona.ink }}>
                ★ You Are ★
              </p>
              <h2 className="mt-1.5 font-display text-4xl font-extrabold leading-tight text-brown-900">
                {persona.name}
              </h2>
              <p className="mt-1 font-display text-xs font-semibold text-brown-700">
                {persona.emoji} อาหารคือชีวิต จิตวิญญาณคนตลาดพลู
              </p>
            </div>
          </div>

          {/* Gamified Trophy Case & Explorer Badges */}
          <div className="rounded-[28px] bg-white p-5 shadow-bento border border-sand-100">
            <div className="flex items-center justify-between border-b border-sand-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-warm-100 text-warm-600">
                  <Trophy className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="font-display text-sm font-bold text-brown-900">Trophy Case — เหรียญรางวัลที่ปลดล็อก</h4>
                  <p className="text-[11px] text-brown-400">ตอบครบ 5 ข้อ ปลดล็อกความสำเร็จนักชิม</p>
                </div>
              </div>
              <span className="rounded-full bg-sand-100 px-3 py-1 font-display text-xs font-extrabold text-brown-700">
                +500 EXP ⭐
              </span>
            </div>

            {/* Badges Grid */}
            <div className="mt-4 grid grid-cols-4 gap-2.5 sm:gap-3">
              <div className="flex flex-col items-center rounded-2xl bg-sand-50 p-3 text-center border border-sand-100 transition hover:scale-105">
                <span className="text-2xl mb-1">🎖️</span>
                <span className="text-[11px] font-bold text-brown-800 line-clamp-1">Rookie</span>
                <span className="text-[9px] text-brown-400">ตอบข้อแรก</span>
              </div>

              <div className="flex flex-col items-center rounded-2xl bg-sand-50 p-3 text-center border border-sand-100 transition hover:scale-105">
                <span className="text-2xl mb-1">🔥</span>
                <span className="text-[11px] font-bold text-brown-800 line-clamp-1">5-Combo</span>
                <span className="text-[9px] text-brown-400">สตรีคครบ 5</span>
              </div>

              <div className="flex flex-col items-center rounded-2xl bg-sand-50 p-3 text-center border border-sand-100 transition hover:scale-105">
                <span className="text-2xl mb-1">{persona.emoji}</span>
                <span className="text-[11px] font-bold text-brown-800 line-clamp-1">{persona.name}</span>
                <span className="text-[9px] text-brown-400">ตราประจำสาย</span>
              </div>

              <div className="flex flex-col items-center rounded-2xl bg-sand-50 p-3 text-center border border-sand-100 transition hover:scale-105">
                <span className="text-2xl mb-1">👑</span>
                <span className="text-[11px] font-bold text-brown-800 line-clamp-1">Lv.2 Hunter</span>
                <span className="text-[9px] text-brown-400">ปลดล็อกสำเร็จ</span>
              </div>
            </div>

            {/* Level Progress */}
            <div className="mt-4 pt-3 border-t border-sand-100 flex items-center justify-between text-xs font-bold text-brown-600">
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-warm-500" /> ระดับ: นักล่าของอร่อยตลาดพลู (Lv. 2)
              </span>
              <span className="text-[11px] text-brown-400">500 / 1,000 EXP</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-sand-100 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-warm-400 to-terracotta-500 w-1/2" />
            </div>
          </div>

          {/* Visual card + Radar chart */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] bg-white p-5 shadow-bento flex flex-col items-center justify-center">
              <Mascot mood="happy" speech={`ยินดีด้วยนะ! นายคือ "${persona.name}" ตัวจริงเสียงจริง!`} />
              <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-widest text-brown-400">
                {persona.name} สไตล์นักชิมตลาดพลู
              </p>
            </div>

            <div className="rounded-[28px] bg-white p-5 shadow-bento flex flex-col justify-center">
              <p className="mb-1 text-center font-display text-sm font-bold text-brown-900">📊 สเตตัสสายกิน 4 ด้าน</p>
              <Radar stats={stats} fill={persona.bgDeep} />
            </div>
          </div>

          {/* Strengths / stats bars (Sorted by score, strictly matching persona names) */}
          <div className="rounded-[28px] bg-white p-5 shadow-bento">
            <div className="mb-3.5 flex items-center justify-between">
              <p className="font-display text-sm font-bold text-brown-900">💪 จุดเด่นประจำสายของคุณ</p>
              <span className="text-[11px] font-medium text-brown-400">สัดส่วนคะแนนที่ตรงกับตัวตน</span>
            </div>
            <div className="space-y-3">
              {sortedStats.map((s) => (
                <div key={s.key} className="flex items-center gap-2.5 sm:gap-3">
                  <span className="w-24 sm:w-28 shrink-0 flex items-center gap-1.5 text-xs font-bold text-brown-800">
                    <span>{s.emoji}</span>
                    <span>{s.label}</span>
                    {s.isWinner && (
                      <span className="rounded bg-warm-100 px-1 py-0.5 text-[9px] font-extrabold text-terracotta-600">
                        ★ สายคุณ
                      </span>
                    )}
                  </span>
                  <div className="h-4 flex-1 overflow-hidden rounded-full bg-sand-100">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        s.isWinner
                          ? 'bg-gradient-to-r from-warm-400 to-terracotta-500 shadow-sm'
                          : 'bg-sand-300'
                      }`}
                      style={{ width: `${Math.max(s.value, 6)}%` }}
                    />
                  </div>
                  <span className={`w-12 shrink-0 text-right font-mono text-xs font-bold ${s.isWinner ? 'text-terracotta-600 font-extrabold text-sm' : 'text-brown-700'}`}>
                    {s.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tagline */}
          <div className="rounded-[28px] bg-white p-5 shadow-bento">
            <p className="flex items-start gap-2 text-sm font-semibold leading-relaxed text-brown-700">
              <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-warm-500" aria-hidden="true" />
              {persona.tagline}
            </p>
          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="mt-5 space-y-3">
          {/* Export / Share as Image Button */}
          <button
            type="button"
            onClick={handleExportImage}
            disabled={exporting}
            className="flex w-full items-center justify-center gap-2 rounded-[40px] bg-brown-700 py-4 font-display text-base font-bold text-cream-50 shadow-bento-lg transition hover:bg-brown-900 active:scale-[0.98] disabled:opacity-60"
          >
            {exporting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                กำลังสร้างรูปภาพ...
              </>
            ) : (
              <>
                <Share2 className="h-5 w-5" aria-hidden="true" />
                <Download className="h-4 w-4" />
                แชร์ / บันทึกผลลัพธ์เป็นภาพ
              </>
            )}
          </button>

          {/* Restart Quiz Button */}
          <button
            type="button"
            onClick={onRestart}
            className="flex w-full items-center justify-center gap-2 rounded-[40px] border border-sand-300 bg-white py-3.5 font-display text-sm font-bold text-brown-700 shadow-bento-sm transition hover:bg-sand-100 active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> ทำควิซใหม่อีกครั้ง
          </button>
        </div>

        {/* ── Recommended shops — swipeable carousel ── */}
        <div className="mt-8">
          <div className="mb-1 flex items-end justify-between">
            <h3 className="font-display text-xl font-bold text-brown-900">🍜 ร้านแนะนำสำหรับ{persona.name}</h3>
            <span className="text-xs font-bold text-brown-500">ปัดดูเพิ่ม ›</span>
          </div>
          <p className="mb-3 text-xs font-medium text-brown-500">คัดมาเฉพาะร้านที่เข้ากับสไตล์การกินของคุณ</p>

          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
            {recommended.map((shop) => (
              <ShopCard key={shop.id} shop={shop} accent={persona.ink} />
            ))}
          </div>
        </div>

        {/* ── Illustrated Map Section (data_pic overview map) ── */}
        <div className="mt-8">
          <div className="mb-1 flex items-end justify-between">
            <h3 className="font-display text-xl font-bold text-brown-900">🗺️ แผนที่ภาพรวมย่านตลาดพลู</h3>
            <span className="text-xs font-bold text-terracotta-600">ลายแทงของกิน</span>
          </div>
          <p className="mb-3 text-xs font-medium text-brown-500">
            แผนที่ท่องเที่ยวและจุดปักหมุดร้านเด็ดรอบสถานีรถไฟตลาดพลู
          </p>

          <div className="overflow-hidden rounded-[28px] bg-white p-3 shadow-bento border border-sand-100">
            {/* Clickable Map Picture -> Directly opens Google Maps */}
            <a
              href="https://www.google.com/maps/search/?api=1&query=%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%9E%E0%B8%A5%E0%B8%B9"
              target="_blank"
              rel="noopener noreferrer"
              title="คลิกที่ภาพเพื่อเปิดแผนที่ตลาดพลูบน Google Maps"
              className="group relative block overflow-hidden rounded-[20px] bg-sand-100 cursor-pointer"
            >
              <img
                src="/images/talat-phlu-map.jpg"
                alt="แผนที่ภาพรวมย่านตลาดพลู (คลิกเพื่อเปิด Google Maps)"
                loading="lazy"
                className="w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              />

              {/* Hover / Tap Overlay Prompt */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center pointer-events-none">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-brown-900 shadow-bento-sm backdrop-blur flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-terracotta-500" /> แตะเพื่อเปิด Google Maps
                </span>
              </div>
            </a>

            <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 px-2 pb-1">
              <p className="text-xs font-semibold text-brown-600">
                📍 ย่านตลาดพลู กรุงเทพมหานคร
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%9E%E0%B8%A5%E0%B8%B9"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-terracotta-500 px-4 py-2 text-xs font-bold text-white shadow-bento-sm hover:bg-terracotta-600 transition"
              >
                <MapPin className="h-3.5 w-3.5" />
                เปิดนำทาง Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Dependency-free SVG radar chart with clear axis labels */
function Radar({ stats, fill }) {
  const size = 260
  const c = size / 2
  const R = 68
  const n = stats.length
  const INK = '#c9b39d'

  const pt = (i, r) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return [c + r * Math.cos(a), c + r * Math.sin(a)]
  }
  const poly = (radiusFn) => stats.map((s, i) => pt(i, radiusFn(s)).join(',')).join(' ')

  const rings = [0.25, 0.5, 0.75, 1]
  const dataPoints = stats.map((s, i) => pt(i, Math.max((R * s.value) / 100, 6)).join(',')).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto block w-full max-w-[260px]" role="img" aria-label="radar chart">
      {/* Background Rings */}
      {rings.map((f) => (
        <polygon
          key={f}
          points={poly(() => R * f)}
          fill="none"
          stroke={INK}
          strokeWidth="1"
          strokeDasharray="2 3"
        />
      ))}

      {/* Axis Lines and Labels */}
      {stats.map((s, i) => {
        const [x, y] = pt(i, R)
        const [lx, ly] = pt(i, R + 22)
        return (
          <g key={s.key}>
            <line x1={c} y1={c} x2={x} y2={y} stroke={INK} strokeWidth="1" strokeDasharray="2 3" />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="central"
              className={`text-[10px] font-display font-bold ${
                s.isWinner ? 'fill-terracotta-600 font-extrabold' : 'fill-brown-600'
              }`}
            >
              {s.emoji} {s.label}
            </text>
          </g>
        )
      })}

      {/* Area Polygon */}
      <polygon points={dataPoints} fill={fill} fillOpacity="0.5" stroke="#78350f" strokeWidth="2.5" />

      {/* Data Points */}
      {stats.map((s, i) => {
        const [x, y] = pt(i, Math.max((R * s.value) / 100, 6))
        return (
          <circle
            key={s.key}
            cx={x}
            cy={y}
            r={s.isWinner ? 5.5 : 4}
            fill={s.isWinner ? '#c2410c' : '#78350f'}
          />
        )
      })}
    </svg>
  )
}
