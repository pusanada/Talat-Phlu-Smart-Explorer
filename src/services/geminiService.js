// ─────────────────────────────────────────────────────────────
// Google Gemini AI Service for Talat Phlu Smart Explorer
// ─────────────────────────────────────────────────────────────

const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim()

export const isGeminiConfigured = Boolean(
  apiKey &&
  !apiKey.includes('your-gemini') &&
  !apiKey.includes('placeholder')
)

/**
 * Call Google Gemini API (gemini-2.5-flash or gemini-1.5-flash)
 */
async function callGemini(systemInstruction, userPrompt) {
  if (!isGeminiConfigured) {
    return 'กรุณาใส่ VITE_GEMINI_API_KEY ในไฟล์ .env เพื่อเปิดใช้งานระบบ AI ช่วยแนะนำร้านอาหารตลาดพลู'
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

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

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!res.ok) {
      // Fallback to gemini-1.5-flash if 2.5 is not available on this key
      const fallbackEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
      const fallbackRes = await fetch(fallbackEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!fallbackRes.ok) {
        const errorData = await fallbackRes.json().catch(() => ({}))
        console.error('Gemini API Error:', errorData)
        return `ขออภัย ไม่สามารถเรียกข้อมูลจาก Gemini AI ได้ในขณะนี้ (${fallbackRes.statusText})`
      }

      const fallbackJson = await fallbackRes.json()
      return (
        fallbackJson?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'ไม่พบคำตอบจาก Gemini AI'
      )
    }

    const data = await res.json()
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'ไม่พบคำตอบจาก Gemini AI'
    )
  } catch (err) {
    console.error('Gemini Service network error:', err)
    return 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ Gemini API โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ'
  }
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
