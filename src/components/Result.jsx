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

const PERSONA_TAGS = {
  sweet: ['#สายหวานตัวจริง', '#ของหวานระดับตำนาน', '#ไอติมไข่แข็งตลาดพลู'],
  street: ['#สายสตรีทฟู้ด', '#กินดะรอบสถานี', '#ตำนานหมี่กรอบร้อยปี'],
  chill: ['#สายชิลริมคลอง', '#สเปเชียลตี้คอฟฟี่', '#คาเฟ่ฮอปปิ้ง'],
  healthy: ['#สายเฮลตี้รักสุขภาพ', '#ของอร่อยคัดพิเศษ', '#เน้นคุณภาพ'],
}

export default function Result({ answers, shops = [], onRestart, questions }) {
  const tally = computeTally(answers, questions)
  const persona = PERSONAS[computePersona(answers, questions)] || PERSONAS.street
  const recommended = getRecommendedShops(shops, persona.key)
  const tags = PERSONA_TAGS[persona.key] || PERSONA_TAGS.sweet

  // Card ref for live view & dedicated compact export ref
  const cardRef = useRef(null)
  const exportCardRef = useRef(null)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState('')
  const [characterImgError, setCharacterImgError] = useState(false)
  const [previewModalUrl, setPreviewModalUrl] = useState(null)

  const characterSrc = !characterImgError && (persona.characterImage || (persona.key === 'sweet' ? '/images/character-sweet.png' : null))

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

  // ── Calculate the 4 Gamified Badges ──
  const winnerScore = tally[persona.key] || 0

  // 1. ความผูกพันกับตลาดพลู (Rookie เริ่มรักตลาดพลู -> Master แฟนพันธุ์แท้ตลาดพลู ตามคะแนน)
  let affiliationBadge
  if (winnerScore >= 12) {
    affiliationBadge = { icon: '🏆', title: 'Master', subtitle: 'แฟนพันธุ์แท้ตลาดพลู' }
  } else if (winnerScore >= 9) {
    affiliationBadge = { icon: '🥇', title: 'Expert', subtitle: 'เซียนตลาดพลู' }
  } else if (winnerScore >= 6) {
    affiliationBadge = { icon: '🧭', title: 'Explorer', subtitle: 'นักสำรวจตลาดพลู' }
  } else {
    affiliationBadge = { icon: '🔰', title: 'Rookie', subtitle: 'เริ่มรักตลาดพลู' }
  }

  // 2. ตราประจำสาย (เปลี่ยนตามสายที่ได้)
  const personaBadge = {
    icon: persona.emoji,
    title: persona.name,
    subtitle: 'ตราประจำสาย',
  }

  // 3. นักล่าของกิน Lv. ต่างๆ ตามคะแนน (มี 1-5)
  let hunterLevel = 1
  if (winnerScore >= 13) hunterLevel = 5
  else if (winnerScore >= 10) hunterLevel = 4
  else if (winnerScore >= 7) hunterLevel = 3
  else if (winnerScore >= 4) hunterLevel = 2
  else hunterLevel = 1

  const hunterIcons = {
    5: '👑',
    4: '💎',
    3: '🔥',
    2: '🏹',
    1: '🌱',
  }
  const hunterBadge = {
    icon: hunterIcons[hunterLevel],
    title: `Lv.${hunterLevel} Hunter`,
    subtitle: `นักล่าของกิน Lv.${hunterLevel}`,
  }

  const expPoints = hunterLevel * 200
  const expPercent = hunterLevel * 20

  // 4. บัดเจต (เช่น เน้นคุม, เน้นคุณภาพ) ตามคำถาม / คำตอบ
  let budgetBadge
  if (tally.street > (tally.healthy || 0) && tally.street >= (tally.sweet || 0) && tally.street >= (tally.chill || 0)) {
    budgetBadge = { icon: '🪙', title: 'เน้นคุมงบ', subtitle: 'อร่อยสบายกระเป๋า' }
  } else if (tally.healthy > (tally.street || 0) && tally.healthy >= (tally.sweet || 0) && tally.healthy >= (tally.chill || 0)) {
    budgetBadge = { icon: '✨', title: 'เน้นคุณภาพ', subtitle: 'คัดสรรเกรดพรีเมียม' }
  } else if (tally.chill > (tally.street || 0) && tally.chill >= (tally.healthy || 0) && tally.chill >= (tally.sweet || 0)) {
    budgetBadge = { icon: '☕', title: 'เน้นบรรยากาศ', subtitle: 'ความชิลนำราคา' }
  } else {
    budgetBadge = { icon: '🎯', title: 'เน้นคุ้มค่า', subtitle: 'อิ่มอร่อยจัดเต็ม' }
  }

  const badges = [affiliationBadge, personaBadge, hunterBadge, budgetBadge]

  const handleExportImage = async () => {
    const targetNode = exportCardRef.current || cardRef.current
    if (!targetNode || exporting) return
    setExporting(true)
    setToast('กำลังสร้างรูปภาพ IG Story...')

    try {
      // 1. Wait for document fonts to finish loading
      if (typeof document !== 'undefined' && document.fonts) {
        await document.fonts.ready
      }
      await new Promise((resolve) => setTimeout(resolve, 250))

      const exportOptions = {
        cacheBust: true,
        pixelRatio: 2,
        width: 540,
        height: 960,
        backgroundColor: persona.bg,
      }

      // 2. Generate High-Res PNG Data URL
      const dataUrl = await toPng(targetNode, exportOptions)
      setPreviewModalUrl(dataUrl)

      let shared = false

      // 3. Try Native Web Share with file on supported devices (Mobile Chrome / Safari)
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.share) {
        try {
          const blob = await toBlob(targetNode, exportOptions)
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

      // 4. Fallback to direct PNG download
      if (!shared) {
        const link = document.createElement('a')
        link.download = `talat-phlu-${persona.key}.png`
        link.href = dataUrl
        link.click()
      }

      setToast('📸 บันทึกรูปภาพ IG Story เรียบร้อยแล้ว!')
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
        <div
          ref={cardRef}
          className="mx-auto w-full max-w-xl rounded-[36px] p-4 sm:p-6 pb-8 space-y-5"
          style={{ backgroundColor: persona.bg }}
        >
          {/* Watermark branding header for shared image */}
          <div className="flex items-center justify-between px-2 pt-1 text-[11px] font-bold text-brown-600/80">
            <span className="flex items-center gap-1.5">
              <span>🍧</span> ตลาดพลู สมาร์ทโซน
            </span>
            <span className="font-mono uppercase tracking-wider text-[10px]">Talat Phlu Smart Explorer</span>
          </div>

          {/* ── HERO SECTION: 3D-STYLE FLOATING CHARACTER (NO BOXES) ── */}
          <div className="pt-2 pb-4 text-center relative">
            {/* Ambient Aura Background */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 sm:h-88 sm:w-88 rounded-full blur-3xl opacity-40 pointer-events-none"
              style={{ backgroundColor: persona.bgDeep }}
            />

            {/* Badge: YOU ARE */}
            <div
              className="relative inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-[11px] font-black uppercase tracking-[0.25em] shadow-sm border border-black/5"
              style={{ backgroundColor: persona.bgDeep, color: persona.ink }}
            >
              <span>★</span>
              <span>YOU ARE</span>
              <span>★</span>
            </div>

            {/* Floating Character Image — Large & Prominent Hero Element */}
            <div className="relative my-3 flex items-center justify-center min-h-[260px] sm:min-h-[340px]">
              {characterSrc ? (
                <img
                  src={characterSrc}
                  alt={persona.name}
                  onError={() => setCharacterImgError(true)}
                  className="h-64 sm:h-80 md:h-92 w-auto max-w-full object-contain mx-auto select-none drop-shadow-[0_20px_35px_rgba(0,0,0,0.18)] transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="py-6 scale-125 sm:scale-150">
                  <Mascot mood="happy" speech={`ยินดีด้วยนะ! นายคือ "${persona.name}" ตัวจริงเสียงจริง!`} />
                </div>
              )}
            </div>

            {/* Persona Title in Massive Bold Playful Font */}
            <h1 className="font-display text-3xl sm:text-5xl font-black text-brown-900 tracking-normal text-center drop-shadow-sm">
              {persona.name} {persona.emoji}
            </h1>

            {/* Brief Engaging Description in Soft Pill Badge */}
            <div className="mt-3 inline-block max-w-md mx-auto px-2">
              <div className="rounded-full bg-white/95 backdrop-blur px-5 py-2 shadow-bento-sm border border-white/70">
                <p className="text-xs sm:text-sm font-bold text-brown-700 leading-relaxed text-center">
                  {persona.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* ── STATS SECTION (BENTO-BOX STYLE CARDS) ── */}
          <div className="space-y-4">
            {/* Radar Chart Card */}
            <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-bento border border-sand-100 flex flex-col items-center justify-center">
              <h3 className="mb-2 text-center font-display text-base font-bold text-brown-900">
                📊 สเตตัสสายกิน 4 ด้าน
              </h3>
              <Radar stats={stats} fill={persona.bgDeep} />
            </div>

            {/* Progress Bars Card */}
            <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-bento border border-sand-100 flex flex-col justify-center">
              <div className="mb-3.5 flex items-center justify-between">
                <h3 className="font-display text-sm sm:text-base font-bold text-brown-900">
                  💪 จุดเด่นประจำสายของคุณ
                </h3>
                <span className="text-[11px] font-semibold text-brown-400 shrink-0">สัดส่วนคะแนน</span>
              </div>
              <div className="space-y-3">
                {sortedStats.map((s) => (
                  <div key={s.key} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-24 sm:w-28 shrink-0 flex items-center gap-1 text-xs font-bold text-brown-800">
                      <span>{s.emoji}</span>
                      <span className="truncate">{s.label}</span>
                      {s.isWinner && (
                        <span className="rounded bg-warm-100 px-1 py-0.2 text-[8px] font-black text-terracotta-600 shrink-0">
                          คุณ
                        </span>
                      )}
                    </div>
                    <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-sand-100">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          s.isWinner
                            ? 'bg-gradient-to-r from-warm-400 to-terracotta-500 shadow-sm'
                            : 'bg-sand-300'
                        }`}
                        style={{ width: `${Math.max(s.value, 6)}%` }}
                      />
                    </div>
                    <span className={`w-10 sm:w-11 shrink-0 text-right font-mono text-xs font-bold ${s.isWinner ? 'text-terracotta-600 font-extrabold text-sm' : 'text-brown-700'}`}>
                      {s.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── GAMIFIED TROPHY CASE & BADGES (BENTO-BOX ROUNDED-3XL) ── */}
          <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-bento border border-sand-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-sand-100 pb-3 gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-warm-100 text-warm-600">
                  <Trophy className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="font-display text-sm font-bold text-brown-900 whitespace-nowrap">
                    Trophy Case — เหรียญรางวัลที่ปลดล็อก
                  </h4>
                  <p className="text-[11px] text-brown-400 whitespace-nowrap">ตอบครบ 5 ข้อ ปลดล็อกความสำเร็จนักชิม</p>
                </div>
              </div>
              <span className="self-start sm:self-center rounded-full bg-sand-100 px-3.5 py-1 font-display text-xs font-extrabold text-brown-700 whitespace-nowrap">
                +500 EXP ⭐
              </span>
            </div>

            {/* Badges Grid (4 Badges: Affiliation, Persona, Hunter Level, Budget) */}
            <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
              {badges.map((b, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center rounded-2xl bg-sand-50 p-2 sm:p-2.5 text-center border border-sand-100 transition hover:scale-105"
                >
                  <span className="text-2xl mb-1">{b.icon}</span>
                  <span className="text-[11px] font-bold text-brown-800 line-clamp-1">{b.title}</span>
                  <span className="text-[9px] text-brown-400 line-clamp-1">{b.subtitle}</span>
                </div>
              ))}
            </div>

            {/* Level Progress */}
            <div className="mt-4 pt-3 border-t border-sand-100 flex items-center justify-between text-xs font-bold text-brown-600">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Award className="h-4 w-4 text-warm-500" /> ระดับ: นักล่าของอร่อยตลาดพลู (Lv. {hunterLevel})
              </span>
              <span className="text-[11px] text-brown-400 font-mono">{expPoints} / 1,000 EXP</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-sand-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-warm-400 to-terracotta-500 transition-all duration-700"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── ACTION BUTTONS: PROMINENT BRIGHTLY COLORED SHARE TO IG STORY ── */}
        <div className="mt-6 space-y-3 max-w-md mx-auto">
          {/* Prominent Brightly Colored Share to IG Story Pill Button */}
          <button
            type="button"
            onClick={handleExportImage}
            disabled={exporting}
            className="flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 py-4 px-6 font-display text-base font-black text-white shadow-bento-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            {exporting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                กำลังสร้างรูปภาพ IG Story...
              </>
            ) : (
              <>
                <Share2 className="h-5 w-5" aria-hidden="true" />
                <Download className="h-4 w-4" />
                📸 Share to IG Story / บันทึกภาพ
              </>
            )}
          </button>

          {/* Restart Quiz Button */}
          <button
            type="button"
            onClick={onRestart}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-sand-300 bg-white py-3.5 font-display text-sm font-bold text-brown-700 shadow-bento-sm transition hover:bg-sand-100 active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> ทำควิซใหม่อีกครั้ง
          </button>
        </div>

        {/* ── RECOMMENDED SHOPS (SWIPEABLE HORIZONTAL CAROUSEL) ── */}
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

        {/* ── MAP PLACEHOLDER SECTION ── */}
        <div className="mt-8">
          <div className="mb-1 flex items-end justify-between">
            <h3 className="font-display text-xl font-bold text-brown-900">🗺️ แผนที่ภาพรวมย่านตลาดพลู</h3>
            <span className="text-xs font-bold text-terracotta-600">ลายแทงของกิน</span>
          </div>
          <p className="mb-3 text-xs font-medium text-brown-500">
            แผนที่ท่องเที่ยวและจุดปักหมุดร้านเด็ดรอบสถานีรถไฟตลาดพลู
          </p>

          <div className="overflow-hidden rounded-3xl bg-white p-3 shadow-bento border border-sand-100">
            {/* Clickable Map Picture -> Directly opens Google Maps */}
            <a
              href="https://www.google.com/maps/search/?api=1&query=%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%9E%E0%B8%A5%E0%B8%B9"
              target="_blank"
              rel="noopener noreferrer"
              title="คลิกที่ภาพเพื่อเปิดแผนที่ตลาดพลูบน Google Maps"
              className="group relative block overflow-hidden rounded-2xl bg-sand-100 cursor-pointer"
            >
              <img
                src="/images/talad_plu_map.png"
                data-src="E:\Tarket Talad Plu\data_pic\talad_plu_map.png"
                onError={(e) => {
                  e.currentTarget.src = "/images/talat-phlu-map.jpg"
                }}
                alt="Talat Phlu Map"
                className="w-full rounded-3xl object-cover transition-transform duration-300 group-hover:scale-[1.02]"
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
                📍 พิกัดย่านตลาดพลูบน Google Maps
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%9E%E0%B8%A5%E0%B8%B9"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-terracotta-500 px-4 py-2 text-xs font-bold text-white shadow-bento-sm hover:bg-terracotta-600 transition active:scale-95"
              >
                <MapPin className="h-3.5 w-3.5" />
                เปิดนำทาง Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* DEDICATED COMPACT EXPORT CARD (Off-screen snapshot container) */}
      {/* Designed specifically for CakeResume / Miffy style 9:16 Story */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '540px',
          height: '960px',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -9999,
          overflow: 'hidden',
        }}
      >
        <div
          ref={exportCardRef}
          style={{
            width: '540px',
            height: '960px',
            minHeight: '960px',
            maxHeight: '960px',
            backgroundColor: persona.bg,
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Kanit', sans-serif",
          }}
          className="relative flex flex-col justify-between p-5 box-border select-none border-4 border-white/90 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/10 pb-2 text-[11px] font-bold text-brown-800 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🍧</span>
              <span className="font-display font-black text-brown-900 text-xs">ตลาดพลู สมาร์ทโซน</span>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-wider text-brown-500 font-bold">
              Talat Phlu Smart Explorer
            </span>
          </div>

          {/* Top Bento: Persona Profile & Floating Character Hero (CakeResume style) */}
          <div className="flex items-center gap-3 rounded-2xl bg-white/90 backdrop-blur p-4 border border-white/80 shadow-bento-sm shrink-0">
            {/* Left: Persona Info */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-warm-100 text-warm-700">
                ★ YOU ARE ★
              </div>
              <h2 className="font-display text-3xl font-black text-brown-900 leading-tight whitespace-nowrap">
                {persona.name} {persona.emoji}
              </h2>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {tags.map((t) => (
                  <span key={t} className="rounded-md bg-sand-100 px-2 py-0.5 text-[9px] font-bold text-brown-700 whitespace-nowrap">
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-[11px] font-semibold leading-relaxed text-brown-700 pt-1">
                {persona.tagline}
              </p>
            </div>

            {/* Right: Floating Character Hero */}
            <div className="relative h-44 w-36 shrink-0 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full blur-xl opacity-40"
                style={{ backgroundColor: persona.bgDeep }}
              />
              {characterSrc ? (
                <img
                  src={characterSrc}
                  alt={persona.name}
                  className="relative h-40 w-auto object-contain drop-shadow-md select-none"
                />
              ) : (
                <div className="relative scale-90">
                  <Mascot mood="happy" speech={persona.name} />
                </div>
              )}
            </div>
          </div>

          {/* Middle Bento: Radar Chart + Strengths Progress */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {/* Left Bento: Radar Chart */}
            <div className="rounded-2xl bg-white/90 p-3 shadow-bento-sm border border-sand-100 flex flex-col items-center justify-center">
              <h4 className="mb-1 text-center font-display text-[11px] font-bold text-brown-900 whitespace-nowrap">
                📊 สเตตัสสายกิน 4 ด้าน
              </h4>
              <Radar stats={stats} fill={persona.bgDeep} size={185} isCompact={true} />
            </div>

            {/* Right Bento: Strengths Progress */}
            <div className="rounded-2xl bg-white/90 p-3 shadow-bento-sm border border-sand-100 flex flex-col justify-between">
              <div className="mb-1.5 flex items-center justify-between">
                <h4 className="font-display text-[11px] font-bold text-brown-900 whitespace-nowrap">💪 จุดเด่นประจำสาย</h4>
                <span className="text-[9px] font-semibold text-brown-400 whitespace-nowrap">สัดส่วนคะแนน</span>
              </div>
              <div className="space-y-2.5">
                {sortedStats.map((s) => (
                  <div key={s.key} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-brown-800">
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <span>{s.emoji}</span>
                        <span>{s.label}</span>
                        {s.isWinner && (
                          <span className="rounded bg-warm-100 px-1 py-0.2 text-[8px] font-black text-terracotta-600">
                            สายคุณ
                          </span>
                        )}
                      </span>
                      <span className={`font-mono ${s.isWinner ? 'text-terracotta-600 font-extrabold text-[11px]' : 'text-brown-600'}`}>
                        {s.value}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-sand-100">
                      <div
                        className={`h-full rounded-full ${
                          s.isWinner ? 'bg-gradient-to-r from-warm-400 to-terracotta-500' : 'bg-sand-300'
                        }`}
                        style={{ width: `${Math.max(s.value, 6)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lower Bento: Trophy Case Badges */}
          <div className="rounded-2xl bg-white/90 p-3.5 shadow-bento-sm border border-sand-100 shrink-0">
            <div className="flex items-center justify-between border-b border-sand-100 pb-1.5 mb-2.5">
              <span className="flex items-center gap-1 font-display text-[11px] font-bold text-brown-900 whitespace-nowrap">
                <Trophy className="h-3.5 w-3.5 text-warm-500" /> เหรียญรางวัลที่ปลดล็อก
              </span>
              <span className="text-[9px] font-extrabold text-terracotta-600 bg-sand-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                +500 EXP ⭐
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {badges.map((b, i) => (
                <div key={i} className="rounded-xl bg-sand-50 p-2 border border-sand-100 flex flex-col items-center justify-center">
                  <span className="text-xl mb-0.5">{b.icon}</span>
                  <p className="text-[10px] font-bold text-brown-800 whitespace-nowrap">{b.title}</p>
                  <p className="text-[8px] text-brown-400 whitespace-nowrap">{b.subtitle}</p>
                </div>
              ))}
            </div>

            {/* EXP Bar */}
            <div className="mt-2.5 pt-2 border-t border-sand-100 flex items-center justify-between text-[10px] font-bold text-brown-600">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Award className="h-3.5 w-3.5 text-warm-500" /> ระดับ: นักล่าของอร่อยตลาดพลู (Lv. {hunterLevel})
              </span>
              <span className="text-[9px] text-brown-400 font-mono whitespace-nowrap">{expPoints} / 1,000 EXP</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-sand-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-warm-400 to-terracotta-500"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>

          {/* Footer Branding */}
          <div className="flex items-center justify-between pt-1 text-[10px] font-semibold text-brown-700/80 px-1 border-t border-black/10 shrink-0">
            <span className="whitespace-nowrap">🍧 ค้นหาสายกินตลาดพลูของคุณได้ที่ ตลาดพลู สมาร์ทโซน</span>
            <span className="font-mono text-[9px] font-bold text-brown-500 whitespace-nowrap">#ตลาดพลู #TalatPhlu</span>
          </div>
        </div>
      </div>

      {/* ── IMAGE PREVIEW MODAL (After Export) ── */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewModalUrl(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="animate-pop relative max-w-sm w-full rounded-3xl bg-white p-4 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-brown-900 flex items-center gap-1">
                📸 ตัวอย่างรูปภาพ IG Story (ขนาด 9:16)
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="text-xs font-bold text-brown-400 hover:text-brown-700 p-1"
              >
                ✕ ปิด
              </button>
            </div>

            <div className="w-full max-h-[70vh] overflow-y-auto rounded-2xl border border-sand-200 shadow-inner flex justify-center bg-sand-50">
              <img
                src={previewModalUrl}
                alt="IG Story Export Preview"
                className="w-full h-auto object-contain rounded-2xl select-none"
              />
            </div>

            <div className="mt-3 w-full flex gap-2">
              <a
                href={previewModalUrl}
                download={`talat-phlu-${persona.key}.png`}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-terracotta-500 py-2.5 text-xs font-bold text-white shadow-bento-sm hover:bg-terracotta-600 transition"
              >
                <Download className="h-3.5 w-3.5" /> บันทึกรูปลงเครื่อง
              </a>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="rounded-full bg-sand-100 px-4 py-2.5 text-xs font-bold text-brown-700 hover:bg-sand-200 transition"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

/** Dependency-free SVG radar chart with clear axis labels & auto-scaling */
function Radar({ stats, fill, size = 260, isCompact = false }) {
  const c = 130
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
    <svg
      viewBox="-40 -25 340 310"
      className="mx-auto block w-full"
      style={{ maxWidth: `${size}px` }}
      role="img"
      aria-label="radar chart"
    >
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

      {/* Axis Lines and Labels (Pure text to avoid emoji font rendering glitches) */}
      {stats.map((s, i) => {
        const [x, y] = pt(i, R)
        const [lx, ly] = pt(i, R + (isCompact ? 22 : 26))
        return (
          <g key={s.key}>
            <line x1={c} y1={c} x2={x} y2={y} stroke={INK} strokeWidth="1" strokeDasharray="2 3" />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isCompact ? '11' : '12'}
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight={s.isWinner ? '800' : '700'}
              fill={s.isWinner ? '#c2410c' : '#4a3527'}
            >
              {s.label}
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
