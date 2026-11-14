import { useState } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight, Flame, Loader2, Sparkles, Volume2, VolumeX } from 'lucide-react'
import Mascot from './Mascot'
import { isSoundEnabled, playSound, setSoundEnabled } from '../utils/audio'

const MASCOT_MESSAGES = [
  'ยินดีต้อนรับ! มาค้นหาตัวตนสายกินตลาดพลูกันนะ ✨',
  'งบเท่าไหร่ก็อร่อยได้ กลิ่นของกินเริ่มลอยมาแล้ว 😋',
  'เดินไกลแค่ไหนก็ยอมเพื่อของอร่อยจริงไหม? 🚶',
  'ใกล้รู้ผลแล้ว! รสชาติไหนคือตัวตนของคุณ? 🌶️',
  'ข้อสุดท้ายแล้ว เย้! เตรียมปลดล็อกเหรียญรางวัล 🏆',
]

export default function Quiz({ answers = [], onChange, onFinish, questions = [], loading = false }) {
  const currentList = Array.isArray(questions) ? questions : []
  const [step, setStep] = useState(() => {
    const firstNull = answers.findIndex((a) => a === null)
    return firstNull >= 0 ? firstNull : 0
  })

  // Gamification state
  const [soundOn, setSoundOn] = useState(isSoundEnabled)
  const [mascotMood, setMascotMood] = useState('normal')
  const [floatingExp, setFloatingExp] = useState(null) // { id, x, y }

  // Toggle sound
  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    setSoundEnabled(next)
  }

  // Loading or empty state
  if (loading || currentList.length === 0) {
    return (
      <section className="animate-view mx-auto max-w-3xl px-4 pb-32 pt-5">
        <div className="mb-5 rounded-[28px] bg-gradient-to-br from-terracotta-500 to-warm-500 p-5 text-cream-50 shadow-bento">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream-50/20 backdrop-blur">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">Food Matcher ตลาดพลู</h2>
              <p className="text-xs font-medium text-cream-50/85">ค้นหาว่าคุณคือ "สายกิน" สไตล์ไหน</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-8 text-center shadow-bento">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-100 text-terracotta-500">
            {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : <AlertCircle className="h-7 w-7" />}
          </div>
          <h3 className="font-display text-base font-bold text-brown-900">
            {loading ? 'กำลังโหลดคำถามจาก Supabase...' : 'ยังไม่พบคำถามแบบทดสอบ'}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-brown-500 max-w-md mx-auto">
            {loading
              ? 'ระบบกำลังดึงข้อมูลคำถามล่าสุดจากตาราง quiz_questions'
              : 'กรุณาตรวจสอบการเชื่อมต่อ Supabase ในไฟล์ .env หรือนำเข้าข้อมูลผ่าน supabase/schema.sql'}
          </p>
        </div>
      </section>
    )
  }

  const qIndex = Math.min(Math.max(step, 0), currentList.length - 1)
  const q = currentList[qIndex]
  const isLast = qIndex === currentList.length - 1
  const selected = answers[qIndex]

  // Count answered questions for combo streak & EXP
  const answeredCount = answers.filter((a) => a !== null).length
  const totalExp = answeredCount * 100

  const pick = (optIndex) => {
    playSound('pop')

    // Mascot happy reaction
    setMascotMood('happy')
    setTimeout(() => setMascotMood('normal'), 600)

    // Trigger floating +100 EXP animation
    setFloatingExp({ key: Date.now() })
    setTimeout(() => setFloatingExp(null), 900)

    const next = [...answers]
    next[qIndex] = optIndex
    onChange(next)

    if (!isLast) {
      setTimeout(() => setStep(qIndex + 1), 280)
    }
  }

  const go = (delta) => {
    if (answers[qIndex] === null && delta > 0) return
    setStep((prev) => Math.min(Math.max(prev + delta, 0), currentList.length - 1))
  }

  return (
    <section className="animate-view mx-auto max-w-3xl px-4 pb-32 pt-5 relative">
      {/* ── Gamified Mascot Banner ── */}
      <div className="mb-5 overflow-hidden rounded-[28px] bg-gradient-to-br from-terracotta-500 via-warm-500 to-mustard-400 p-5 shadow-bento relative">
        {/* Background decorative bubbles */}
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Mascot
            mood={mascotMood}
            speech={MASCOT_MESSAGES[qIndex] || 'พร้อมลุยของอร่อยหรือยัง?'}
          />

          {/* Gamification Stats: EXP & Streak */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Combo Streak */}
            <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur text-cream-50 font-display text-xs font-bold shadow-sm">
              <Flame className="h-4 w-4 text-mustard-300 fill-current animate-pulse" />
              <span>Combo x{answeredCount > 0 ? answeredCount : 1}</span>
            </div>

            {/* EXP Badge */}
            <div className="relative flex items-center gap-1.5 rounded-full bg-brown-900/40 px-3 py-1.5 backdrop-blur text-cream-50 font-display text-xs font-bold shadow-sm">
              <span className="text-mustard-300">⭐</span>
              <span>{totalExp} EXP</span>

              {/* Floating +100 EXP Particle */}
              {floatingExp && (
                <span className="absolute -top-6 right-2 animate-bounce font-display text-xs font-extrabold text-mustard-300 drop-shadow">
                  +100 EXP!
                </span>
              )}
            </div>

            {/* Sound Mute Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              aria-label={soundOn ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-cream-50 backdrop-blur hover:bg-white/30 transition active:scale-95"
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-cream-100/60" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Progress Bar with Checkpoints ── */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-brown-600">
          <span className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-terracotta-500 text-[10px] font-extrabold text-white">
              {qIndex + 1}
            </span>
            ข้อที่ {qIndex + 1} จาก {currentList.length}
          </span>
          <span className="font-mono text-terracotta-600 font-extrabold">
            {Math.round(((qIndex + 1) / currentList.length) * 100)}%
          </span>
        </div>

        {/* Multi-step checkpoints bar */}
        <div className="relative h-3 rounded-full bg-sand-200 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-terracotta-400 via-warm-400 to-mustard-400 transition-all duration-500"
            style={{ width: `${((qIndex + 1) / currentList.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Question Card ── */}
      <div key={q.id} className="animate-pop rounded-[28px] bg-white p-5 shadow-bento border border-sand-100">
        {/* Question Image (if provided) */}
        {q.image && (
          <div className="mb-4 overflow-hidden rounded-2xl bg-sand-100 shadow-bento-sm">
            <img
              src={q.image}
              alt={q.question}
              loading="lazy"
              className="aspect-[16/9] max-h-56 w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <span className="text-3xl">{q.emoji}</span>
          <h3 className="font-display text-xl font-bold leading-snug text-brown-900">{q.question}</h3>
        </div>
        {q.hint && <p className="mt-1 text-sm font-medium text-brown-500">{q.hint}</p>}

        {/* Options List with Gamified Hover/Active Styles */}
        <div className="mt-5 space-y-3">
          {(q.options || []).map((opt, i) => {
            const active = selected === i
            return (
              <button
                key={opt.label || i}
                type="button"
                onClick={() => pick(i)}
                className={`group flex w-full items-center gap-3 rounded-2xl p-3.5 text-left transition-all duration-200 active:scale-[0.97] ${
                  active
                    ? 'bg-gradient-to-r from-terracotta-500 to-warm-500 text-cream-50 shadow-bento ring-2 ring-terracotta-400/50'
                    : 'border border-sand-200 bg-cream-50 text-brown-700 shadow-bento-sm hover:-translate-y-0.5 hover:border-warm-300 hover:shadow-bento'
                }`}
              >
                {/* Option Image Thumbnail or Emoji */}
                {opt.image ? (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-sand-100 shadow-sm transition-transform group-hover:scale-105">
                    <img
                      src={opt.image}
                      alt={opt.label}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    {opt.emoji && (
                      <span className="absolute bottom-0 right-0 rounded-tl-md bg-brown-900/70 px-1 py-0.5 text-[10px] leading-none text-white backdrop-blur">
                        {opt.emoji}
                      </span>
                    )}
                  </div>
                ) : (
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl transition-transform group-hover:scale-110 ${
                      active ? 'bg-cream-50/20' : 'bg-sand-100'
                    }`}
                  >
                    {opt.emoji}
                  </span>
                )}

                <span className="flex-1 text-sm font-semibold leading-snug">{opt.label}</span>

                {/* Gamified Radio Checkmark */}
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                    active ? 'border-cream-50 bg-cream-50 scale-110' : 'border-sand-300 bg-white group-hover:border-warm-400'
                  }`}
                >
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-terracotta-500" />}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={qIndex === 0}
          className="flex items-center gap-1 rounded-[40px] bg-white px-5 py-3 text-sm font-bold text-brown-700 shadow-bento-sm transition enabled:hover:bg-sand-100 enabled:active:scale-95 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> ก่อนหน้า
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={() => {
              playSound('fanfare')
              onFinish()
            }}
            disabled={selected === null}
            className="flex items-center gap-1.5 rounded-[40px] bg-gradient-to-r from-terracotta-500 to-warm-500 px-6 py-3 text-sm font-bold text-white shadow-bento transition hover:brightness-105 active:scale-95 disabled:opacity-40 animate-pulse"
          >
            เสร็จสิ้น ดูผลลัพธ์ <Sparkles className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => go(1)}
            disabled={selected === null}
            className="flex items-center gap-1 rounded-[40px] bg-brown-700 px-6 py-3 text-sm font-bold text-cream-50 shadow-bento transition enabled:hover:bg-brown-900 enabled:active:scale-95 disabled:opacity-40"
          >
            ถัดไป <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  )
}
