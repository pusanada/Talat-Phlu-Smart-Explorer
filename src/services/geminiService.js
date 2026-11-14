// ─────────────────────────────────────────────────────────────
// Google Gemini AI Service for Talat Phlu Smart Explorer
// ─────────────────────────────────────────────────────────────

function getApiKey() {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' ? process.env : {})
  return (env.VITE_GEMINI_API_KEY || '').trim()
}

export const isGeminiConfigured = Boolean(
  getApiKey() &&
  !getApiKey().includes('your-gemini') &&
  !getApiKey().includes('placeholder')
)

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
]

/**
 * Call Google Gemini API with automatic model fallbacks
 */
async function callGemini(systemInstruction, userPrompt) {
  const key = getApiKey()
  if (!key) {
    return 'กรุณาใส่ VITE_GEMINI_API_KEY ในไฟล์ .env เพื่อเปิดใช้งานระบบ AI ช่วยแนะนำร้านอาหารตลาดพลู'
  }

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\nคำถามหรือโจทย์: ${userPrompt}` }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 600,
    },
  }

  let lastError = null

  for (const model of GEMINI_MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (res.ok) {
        const data = await res.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) return text
      } else {
        const errorJson = await res.json().catch(() => ({}))
        console.warn(`Gemini model ${model} failed (${res.status}):`, errorJson)
        lastError = errorJson?.error?.message || res.statusText
      }
    } catch (err) {
      console.warn(`Gemini model ${model} network error:`, err)
      lastError = err.message
    }
  }

  return `ขออภัย ระบบ AI ขัดข้องชั่วคราว (${lastError || 'กรุณาลองใหม่อีกครั้ง'})`
}

/**
 * Ask Gemini for food & travel advice in Talat Phlu with live shops context
 */
export async function askGeminiFoodGuide(userQuestion, shops = []) {
  const shopsContext = shops
    .map(
      (s, idx) =>
        `${idx + 1}. ${s.name} - เมนูเด่น: ${s.signature_menu} (${s.category})`
    )
    .join('\n')

  const systemInstruction = `คุณคือ "กูรูนักกินตลาดพลู" ผู้เชี่ยวชาญด้านอาหารและประวัติศาสตร์ย่านตลาดพลู ฝั่งธนบุรี กรุงเทพฯ
ตอบคำถามด้วยน้ำเสียงอบอุ่น เป็นกันเอง และชวนหิว ภาษาไทย
นี่คือข้อมูลร้านอาหารในย่านตลาดพลูจากระบบ:
${shopsContext}

กรุณาให้คำแนะนำที่กระชับ ไม่เกิน 3-4 ย่อหน้า และแนะนำร้านที่เหมาะสมกับคำถามของผู้ใช้`

  return callGemini(systemInstruction, userQuestion)
}

/**
 * Generate AI-personalized advice for the matched persona
 */
export async function getGeminiPersonaAdvice(persona, shops = []) {
  const matchedShops = shops
    .filter((s) => s.personas?.includes(persona.key))
    .map((s) => `- ${s.name}: ${s.signature_menu}`)
    .join('\n')

  const systemInstruction = `คุณคือกูรูนักชิมตลาดพลู AI ช่วยวางแผนการกินสำหรับนักท่องเที่ยว
ผู้ใช้ได้ผลลัพธ์ควิซสายกินคือ: "${persona.name}" (${persona.tagline})
ร้านค้าแนะนำในสไตล์นี้:
${matchedShops || 'ร้านเด็ดริมทางตลาดพลูและของหวานโบราณ'}

ช่วยเขียนแผนการกินสั้น ๆ (Plan การเดินกิน 1 วันในตลาดพลู สำหรับสายนี้โดยเฉพาะ) ความยาวประมาณ 150-200 คำ ให้อ่านง่าย มีอีโมจิน่ารัก และชวนติดตาม`

  return callGemini(systemInstruction, `จัดตารางเดินกินตลาดพลูให้สาย ${persona.name} หน่อย`)
}
