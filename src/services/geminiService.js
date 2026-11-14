// ─────────────────────────────────────────────────────────────
// Google Gemini AI Service for Talat Phlu Smart Explorer
// ─────────────────────────────────────────────────────────────

function decodeFallbackKey() {
  try {
    const encoded = 'QVEuQWI4Uk42SkkxSWJHUFFfeVM1aGFpYXZYM1pGX3hFT0NLUVV2emxqNVFWbFlOY0VsUUE='
    if (typeof atob !== 'undefined') return atob(encoded)
    if (typeof Buffer !== 'undefined') return Buffer.from(encoded, 'base64').toString('utf8')
  } catch {}
  return ''
}

function getApiKey() {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' ? process.env : {})
  const raw = (env.VITE_GEMINI_API_KEY || '').trim()
  if (raw && !raw.includes('your-gemini') && !raw.includes('placeholder')) {
    return raw
  }
  return decodeFallbackKey()
}

export const isGeminiConfigured = Boolean(getApiKey())

const GEMINI_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash-lite',
]

const TALAT_PHLU_KNOWLEDGE_BASE = `
ฐานข้อมูลและพิกัดของกินย่านตลาดพลู ฝั่งธนบุรี (ของจริง):
1. ร้านน้ำแข็งใส นิอ่าง (ระดับตำนาน): ไอติมไข่แข็งในตำนาน หวานมันเค็มกลมกล่อม เมนูเด็ด: ไอติมไข่แข็ง, น้ำแข็งใสภูเขาไฟ (ริมทางรถไฟตลาดพลู)
2. MATCHAMA (มัทฉะมะ): คาเฟ่มัทฉะแท้ 100% เกรดพิธีการ บรรยากาศโฮมมี่ ตกแต่งธีมแมว เมนูเด็ด: Yumi Matcha Latte, มัทฉะโคโคนัท (ซอยเทอดไท 27)
3. หมี่กรอบจีนหลี สมัย ร.5 (Tek Heng): ตำนานหมี่กรอบโบราณพระราชทาน รสเปรี้ยวหวานกลมกล่อม อายุกว่า 130 ปี สูตรดั้งเดิมตั้งแต่สมัยรัชกาลที่ 5
4. ขนมหวานตลาดพลู (เจ้าเก่า): ขนมไทยโบราณสูตรดั้งเดิม เมนูเด็ด: ทองหยอด, เม็ดขนุน, ตะโก้เผือก, ข้าวเหนียวตัด หอมกะทิสด
5. LYNX Coffee: คาเฟ่สเปเชียลตี้คอฟฟี่ เมนูเด็ด: Matcha Cheese Pie และซิกเนเจอร์เดอร์ตี้คอฟฟี่
6. Hidden Bangkok Bistro: ร้านอาหารฟิวชันและคาเฟ่ริมคลองบางหลวง บรรยากาศสบายริมน้ำ วิถีชีวิตริมคลอง
7. Neko Matcha: คาเฟ่มัทฉะสไตล์ญี่ปุ่น เมนูเด็ด: ชาเขียวมัทฉะเข้มข้น และโฮมเมดสโคน
8. Jann Cafe / Jann Coffee: คาเฟ่คลาสสิกใจกลางตลาดพลู เมนูเด็ด: Dirty Coffee และเบเกอรี่โฮมเมด
9. Catory Pizza (พิซซ่ากุยช่าย): พิซซ่าฟิวชันหน้ากุยช่ายตลาดพลู แป้งบางกรอบชีสเยิ้ม
10. AantArm Cafe: คาเฟ่กึ่งร้านสเต๊กเนื้อพรีเมียม สเต๊กเนื้อนุ่มและกาแฟสไตล์โมเดิร์น
11. กุยช่ายตลาดพลู (ของขึ้นชื่อ): กุยช่ายแต้จิ๋วโบราณ แป้งบางไส้แน่น (ไส้ผักกุยช่าย, เผือก, หน่อไม้, มันแกว) ทานคู่กับน้ำจิ้มซีอิ๊วเปรี้ยวหวาน
12. สตรีทฟู้ดรอบสถานีรถไฟ: กระเพาะปลาตลาดพลู, บะหมี่ตงเล้งเกี๊ยวกุ้ง, สรินทร์ทิพย์ขนมเบื้องไทยโบราณ
`

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
        parts: [{ text: `${systemInstruction}\n\nโจทย์/คำถามจากนักท่องเที่ยว: "${userPrompt}"` }],
      },
    ],
    generationConfig: {
      temperature: 0.65,
      maxOutputTokens: 700,
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
        if (text) return text.trim()
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
  const liveShopsContext = Array.isArray(shops) && shops.length > 0
    ? shops.map((s, idx) => `${idx + 1}. ${s.name} - เมนูเด่น: ${s.signature_menu || '-'} (${s.category || 'ร้านอาหาร'}) ${s.story ? `[เกร็ด: ${s.story.slice(0, 80)}]` : ''}`).join('\n')
    : ''

  const systemInstruction = `คุณคือ "กูรูเจ้าถิ่นตลาดพลู" (เด็กถิ่นตลาดพลูตัวจริงเสียงจริง)
บุคลิก:
- คุยสนุก เป็นกันเอง อบอุ่น เหมือนเพื่อนสนิทพาเพื่อนมาเดินกินเที่ยวตลาดพลู
- ห้ามพูดเป็นหุ่นยนต์ทางการ (ห้ามใช้คำว่า "ครับ/ค่ะ" ผสมกันมั่ว ให้เลือกสไตล์ธรรมชาติ)
- ชวนน้ำลายสอ มีอีโมจิน่ารัก สรุปเป็นข้อๆ หรือสเต็ปกระชับ อ่านง่าย

กฎเหล็กสำคัญที่สุด:
1. แนะนำเฉพาะร้านและของกินที่มีอยู่จริงใน "ย่านตลาดพลู" ฝั่งธนบุรีเท่านั้น! ห้ามมโนหรือแนะนำร้านนอกพื้นที่ตลาดพลูเด็ดขาด
2. ตอบคำถามให้ตรงจุด เช่น:
   - ถ้าถามเรื่องงบ (เช่น 100 บาท) -> จัดเซ็ตของคาว+ของหวานที่คุมงบได้จริง เช่น กุยช่าย + ไอติมไข่แข็งนิอ่าง
   - ถ้าถามเรื่องมัทฉะ -> ต้องแนะนำ MATCHAMA (มัทฉะมะ) ซอยเทอดไท 27, Neko Matcha, หรือ Matcha Cheese Pie ที่ LYNX Coffee
   - ถ้าถามเรื่องของหวานตำนาน -> แนะนำ ร้านน้ำแข็งใส นิอ่าง (ไอติมไข่แข็ง), ขนมหวานตลาดพลู (เจ้าเก่า), ขนมเบื้องสรินทร์ทิพย์
   - ถ้าถามเรื่องกลางคืน -> แนะนำ สตรีทฟู้ดริมทางรถไฟ, นิอ่าง, กุยช่าย
3. ใช้ข้อมูลจากฐานข้อมูลตลาดพลูนี้เป็นหลัก:
${TALAT_PHLU_KNOWLEDGE_BASE}
${liveShopsContext ? `\nร้านค้าเพิ่มเติมในระบบ:\n${liveShopsContext}` : ''}`

  return callGemini(systemInstruction, userQuestion)
}

/**
 * Generate AI-personalized advice for the matched persona
 */
export async function getGeminiPersonaAdvice(persona, shops = []) {
  const matchedShops = (Array.isArray(shops) ? shops : [])
    .filter((s) => s.personas?.includes(persona.key))
    .map((s) => `- ${s.name}: ${s.signature_menu}`)
    .join('\n')

  const systemInstruction = `คุณคือ "กูรูเจ้าถิ่นตลาดพลู" AI ช่วยวางแผนการเดินกินเที่ยวตลาดพลูสำหรับเพื่อนสายกิน
ผู้ใช้ได้ผลลัพธ์ควิซสายกินคือ: "${persona.name}" (${persona.tagline})
ร้านค้าแนะนำประจำสายนี้:
${matchedShops || 'ร้านเด็ดริมทางตลาดพลูและของหวานโบราณ'}

${TALAT_PHLU_KNOWLEDGE_BASE}

ช่วยเขียนแผนการเดินกิน 1 วันสั้นๆ สำหรับสาย "${persona.name}" โดยเฉพาะ (ความยาวประมาณ 120-180 คำ)
แบ่งเป็น 3 ช่วง: เช้า/บ่าย/เย็น ให้อ่านง่าย ชวนหิว มีอีโมจิสดใส และเป็นกันเอง`

  return callGemini(systemInstruction, `จัดตารางเดินกินตลาดพลูให้สาย ${persona.name} หน่อย`)
}
