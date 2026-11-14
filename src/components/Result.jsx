import { useState } from 'react'
import { Award, Bot, Loader2, RotateCcw, Share2, Sparkles, Trophy } from 'lucide-react'
import ShopCard from './ShopCard'
import GoogleMapView from './GoogleMapView'
import Mascot from './Mascot'
import { PERSONAS, computeTally, computePersona, getRecommendedShops } from '../constants/personas'
import { getGeminiPersonaAdvice } from '../services/geminiService'

// Radar axes: persona scores + overall appetite
const AXES = [
  { key: 'sweet', label: 'หวานจัด', emoji: '🍰' },
  { key: 'street', label: 'สายแซ่บ', emoji: '🍢' },
  { key: 'chill', label: 'ชิล ๆ', emoji: '🧋' },
  { key: 'healthy', label: 'เฮลตี้', emoji: '🥗' },
  { key: 'appetite', label: 'กินจุ', emoji: '💪' },
]

export default function Result({ answers, shops = [], onRestart, questions }) {
  const tally = computeTally(answers, questions)
  const persona = PERSONAS[computePersona(answers, questions)] || PERSONAS.street
  const recommended = getRecommendedShops(shops, persona.key)

  // AI Persona Advice State
  const [aiAdvice, setAiAdvice] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const handleGetAiAdvice = async () => {
    if (aiLoading) return
    setAiLoading(true)
    try {
      const advice = await getGeminiPersonaAdvice(persona, shops)
      setAiAdvice(advice)
    } catch {
      setAiAdvice('ไม่สามารถดึงข้อมูลคำแนะนำจาก AI ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setAiLoading(false)
    }
  }

  // Normalize tallies to 0–100 (max per key = 5 questions × 3 pts; appetite = full spread)
  const stats = AXES.map((ax) => ({
    ...ax,
    value: Math.min(100, Math.round(((ax.key === 'appetite' ? Object.values(tally).reduce((a, b) => a + b, 0) : tally[ax.key]) / 15) * 100)),
  }))

  const shareToIG = () => {
    alert(`📸 แชร์ผลลัพธ์ "${persona.name}" ลง Instagram Story เรียบร้อยแล้ว!`)
  }

  return (
    <section
      className="animate-view min-h-dvh px-4 pb-32 pt-6 transition-colors duration-700"
      style={{ backgroundColor: persona.bg }}
    >
      <div className="mx-auto max-w-3xl">
        {/* ── Persona header — soft stat-card banner ── */}
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

        {/* ── Gamified Trophy Case & Explorer Badges ── */}
        <div className="mt-4 rounded-[28px] bg-white p-5 shadow-bento border border-sand-100">
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

          {/* Badges Grid (Inspired by the reference screen) */}
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

        {/* ── Visual card + Radar chart (side-by-side on sm) ── */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-[28px] bg-white p-4 shadow-bento flex flex-col items-center justify-center">
            <Mascot mood="happy" speech={`ยินดีด้วยนะ! นายคือ "${persona.name}" ตัวจริงเสียงจริง!`} />
            <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-widest text-brown-400">
              {persona.name} สไตล์นักชิมตลาดพลู
            </p>
          </div>

          <div className="rounded-[28px] bg-white p-4 shadow-bento">
            <p className="mb-1 text-center font-display text-sm font-bold text-brown-900">📊 สเตตัสสายกิน</p>
            <Radar stats={stats} fill={persona.bgDeep} />
          </div>
        </div>

        {/* ── Strengths / stats bars ── */}
        <div className="mt-4 rounded-[28px] bg-white p-5 shadow-bento">
          <p className="mb-3.5 font-display text-sm font-bold text-brown-900">💪 จุดแข็งของคุณ</p>
          <div className="space-y-3">
            {stats.map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs font-bold text-brown-700">
                  {s.emoji} {s.label}
                </span>
                <div className="h-4 flex-1 overflow-hidden rounded-full bg-sand-100">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(s.value, 6)}%`, backgroundColor: persona.bgDeep }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-bold text-brown-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tagline ── */}
        <div className="mt-4 rounded-[28px] bg-white p-5 shadow-bento">
          <p className="flex items-start gap-2 text-sm font-semibold leading-relaxed text-brown-700">
            <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-warm-500" aria-hidden="true" />
            {persona.tagline}
          </p>
        </div>

        {/* ── AI Itinerary / Advice from Google Gemini ── */}
        <div className="mt-4 rounded-[28px] bg-white p-5 shadow-bento border border-sand-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-warm-400 to-terracotta-500 text-white shadow-bento-sm">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h4 className="font-display text-sm font-bold text-brown-900">
                  แผนกินเที่ยวส่วนตัว (Google Gemini AI)
                </h4>
                <p className="text-[11px] text-brown-400">
                  ให้ AI วิเคราะห์สไตล์และจัดรูทเดินกินในตลาดพลู
                </p>
              </div>
            </div>

            {!aiAdvice && (
              <button
                type="button"
                onClick={handleGetAiAdvice}
                disabled={aiLoading}
                className="flex items-center gap-1.5 rounded-full bg-terracotta-500 px-4 py-2 text-xs font-bold text-white shadow-bento-sm transition hover:bg-terracotta-600 active:scale-95 disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> กำลังคิด...
                  </>
                ) : (
                  <>
                    <Bot className="h-3.5 w-3.5" /> วางแผนให้ฉัน
                  </>
                )}
              </button>
            )}
          </div>

          {aiAdvice && (
            <div className="mt-3.5 rounded-2xl bg-sand-50 p-4 border border-sand-200">
              <p className="text-xs leading-relaxed text-brown-800 whitespace-pre-wrap">
                {aiAdvice}
              </p>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleGetAiAdvice}
                  disabled={aiLoading}
                  className="text-[11px] font-bold text-terracotta-600 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> ขอคำแนะนำเวอร์ชันใหม่
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Share to IG Story ── */}
        <button
          type="button"
          onClick={shareToIG}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-[40px] bg-brown-700 py-4 font-display text-base font-bold text-cream-50 shadow-bento-lg transition hover:bg-brown-900 active:scale-[0.98]"
        >
          <Share2 className="h-5 w-5" aria-hidden="true" />
          แชร์ลง IG Story
        </button>

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

        {/* ── Restart ── */}
        <button
          type="button"
          onClick={onRestart}
          className="mx-auto mt-4 flex items-center gap-2 rounded-[40px] bg-white px-5 py-3 text-sm font-bold text-brown-700 shadow-bento-sm transition hover:bg-sand-100 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> ทำควิซใหม่อีกครั้ง
        </button>

        {/* ── Google Maps Section ── */}
        <div className="mt-8">
          <div className="mb-1 flex items-end justify-between">
            <h3 className="font-display text-xl font-bold text-brown-900">🗺️ แผนที่ตลาดพลู (Google Maps)</h3>
            <span className="text-xs font-bold text-brown-500">พิกัดร้านค้าจริง</span>
          </div>
          <p className="mb-3 text-xs font-medium text-brown-500">
            ดูตำแหน่งและปักหมุดร้านเด็ดในตลาดพลู พร้อมระบบเปิดนำทาง
          </p>

          <GoogleMapView shops={recommended.length > 0 ? recommended : shops} />
        </div>
      </div>
    </section>
  )
}

/** Dependency-free SVG radar chart (pentagon, 5 axes) */
function Radar({ stats, fill }) {
  const size = 230
  const c = size / 2
  const R = 80
  const n = stats.length
  const INK = '#c9b39d'

  const pt = (i, r) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return [c + r * Math.cos(a), c + r * Math.sin(a)]
  }
  const poly = (radiusFn) => stats.map((s, i) => pt(i, radiusFn(s)).join(',')).join(' ')

  const rings = [0.25, 0.5, 0.75, 1]
  const dataPoints = stats.map((s, i) => pt(i, (R * s.value) / 100).join(',')).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto block w-full max-w-[240px]" role="img" aria-label="radar chart">
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
      {stats.map((_, i) => {
        const [x, y] = pt(i, R)
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke={INK} strokeWidth="1" strokeDasharray="2 3" />
      })}
      <polygon points={dataPoints} fill={fill} fillOpacity="0.45" stroke="#78350f" strokeWidth="2.5" />
      {stats.map((s, i) => {
        const [x, y] = pt(i, (R * s.value) / 100)
        return <circle key={s.key} cx={x} cy={y} r="4" fill="#78350f" />
      })}
    </svg>
  )
}
