// ─────────────────────────────────────────────────────────────
// Persona definitions and calculation algorithms for Talat Phlu Food Matcher
// ─────────────────────────────────────────────────────────────

export const PERSONAS = {
  sweet: {
    key: 'sweet',
    name: 'สายหวาน',
    emoji: '🍰',
    tagline: 'ทุกมื้อต้องปิดท้ายด้วยของหวาน รสหวานมันระดับตำนานตลาดพลูคือคู่ใจคุณ',
    characterImage: '/images/Sweet.png',
    bg: '#F6E3EA', // muted dusty pink
    bgDeep: '#E8B7C8',
    ink: '#6E3247',
  },
  street: {
    key: 'street',
    name: 'สายสตรีท',
    emoji: '🍢',
    tagline: 'ล่าของอร่อยริมทาง ราคาเข้าถึงได้ รสแซ่บจัดเต็มแบบคนเมืองของแท้',
    characterImage: '/images/Street4.png',
    bg: '#F7EDD3', // muted sand yellow
    bgDeep: '#EDDCA0',
    ink: '#6E5518',
  },
  chill: {
    key: 'chill',
    name: 'สายชิล',
    emoji: '🧋',
    tagline: 'จิบช้า ๆ นั่งริมคลองบางกอกใหญ่ ดูรถไฟผ่าน ชีวิตดีได้โดยไม่ต้องรีบ',
    characterImage: '/images/Chill.png',
    bg: '#E4EEF3', // muted dusty blue
    bgDeep: '#BFD8E4',
    ink: '#274B5E',
  },
  healthy: {
    key: 'healthy',
    name: 'สายเฮลตี้',
    emoji: '🥗',
    tagline: 'อร่อยได้โดยไม่ต้องหนัก สลัด ยำ ผลไม้ปั่น คือเส้นทางสุขภาพของคุณในตลาดพลู',
    characterImage: '/images/Healthy.png',
    bg: '#E7F0E0', // muted sage green
    bgDeep: '#C5DDB4',
    ink: '#3B5A33',
  },
}

// ── Calculation Helpers ──────────────────────────────────────
/** Tally quiz answers per persona key */
export function computeTally(answers = [], questions = []) {
  const tally = { sweet: 0, street: 0, chill: 0, healthy: 0 }
  if (!Array.isArray(answers) || !Array.isArray(questions)) return tally

  answers.forEach((optIndex, qIndex) => {
    if (optIndex === null || optIndex === undefined) return
    const opt = questions[qIndex]?.options?.[optIndex]
    if (!opt?.scores) return
    Object.entries(opt.scores).forEach(([k, v]) => {
      if (tally[k] !== undefined) tally[k] += v
    })
  })
  return tally
}

/** Persona key with the highest score */
export function computePersona(answers = [], questions = []) {
  const tally = computeTally(answers, questions)
  const entries = Object.entries(tally).sort((a, b) => b[1] - a[1])
  return entries.length > 0 ? entries[0][0] : 'street'
}

/** Shops matched to a persona, then padded with top-voted rest (max 5) */
export function getRecommendedShops(shops = [], personaKey) {
  if (!Array.isArray(shops)) return []
  const matched = shops.filter((s) => s.personas?.includes(personaKey))
  const rest = shops
    .filter((s) => !s.personas?.includes(personaKey))
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
  return [...matched, ...rest].slice(0, 5)
}
