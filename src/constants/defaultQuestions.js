// ─────────────────────────────────────────────────────────────
// Default / Fallback Quiz Questions for Talat Phlu Food Matcher
// Features iconic Talat Phlu culture with 'ร้านน้ำแข็งใส นิอ่าง (ระดับตำนาน)'
// ─────────────────────────────────────────────────────────────

export const DEFAULT_QUIZ_QUESTIONS = [
  {
    id: 'q1',
    sort_order: 1,
    emoji: '🍧',
    question: 'รสชาติที่ใจคุณเรียกร้องในตลาดพลูวันนี้คืออะไร?',
    hint: 'เลือกสไตล์รสชาติที่คุณอยากลิ้มลองเป็นมื้อแรก',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&q=80',
    options: [
      {
        label: 'หวานเย็นสดชื่น ไอติมไข่แข็งนิอ่างดับร้อน',
        emoji: '🍨',
        image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=240&q=80',
        scores: { sweet: 3, chill: 1 },
      },
      {
        label: 'สตรีทฟู้ดรสแซ่บ จัดจ้านสะใจริมทางรถไฟ',
        emoji: '🍢',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=240&q=80',
        scores: { street: 3 },
      },
      {
        label: 'กาแฟโบราณ ชาเย็น จิบช้า ๆ ริมคลองบางกอกใหญ่',
        emoji: '🧋',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=240&q=80',
        scores: { chill: 3 },
      },
      {
        label: 'ผลไม้ปั่นสด ยำเบา ๆ อร่อยคลีนเพื่อสุขภาพ',
        emoji: '🥗',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=240&q=80',
        scores: { healthy: 3 },
      },
    ],
  },
  {
    id: 'q2',
    sort_order: 2,
    emoji: '☀️',
    question: 'เดินตลาดพลูอากาศร้อน ๆ สิ่งแรกที่คุณอยากพุ่งไปหาคือ?',
    hint: 'ตลาดพลูมีเมนูเย็นชื่นใจรอต้อนรับคุณอยู่เสมอ',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
    options: [
      {
        label: 'น้ำแข็งใสไข่แข็งนิอ่าง เครื่องแน่น หวานมันคลายร้อนทันที',
        emoji: '🍧',
        image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=240&q=80',
        scores: { sweet: 3, chill: 1 },
      },
      {
        label: 'ก๋วยเตี๋ยวเรือซุปร้อน ๆ แซ่บเหงื่อตกสะใจ',
        emoji: '🍜',
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=240&q=80',
        scores: { street: 3 },
      },
      {
        label: 'ชงชาดำเย็นโบราณ นั่งพักขาใต้ร่มไม้ริมน้ำ',
        emoji: '🥤',
        image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=240&q=80',
        scores: { chill: 3 },
      },
      {
        label: 'น้ำส้มคั้นสด สลัดผลไม้สดชื่นเบาสบายท้อง',
        emoji: '🥑',
        image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=240&q=80',
        scores: { healthy: 3 },
      },
    ],
  },
  {
    id: 'q3',
    sort_order: 3,
    emoji: '🚉',
    question: 'เดินลัดเลาะจากสถานีรถไฟฟ้าตลาดพลู คุณชอบบรรยากาศแบบไหน?',
    hint: 'ซอยข้างทางรถไฟตลาดพลูเต็มไปด้วยเสน่ห์วิถีชีวิตดั้งเดิม',
    image: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80',
    options: [
      {
        label: 'เดินเลียบทางรถไฟ แวะร้านหวานเย็นระดับตำนานที่เปิดกว่า 50 ปี',
        emoji: '🍨',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=240&q=80',
        scores: { sweet: 3, chill: 1 },
      },
      {
        label: 'เดินลุยสตรีทฟู้ดหน้าสถานี ควันหอมฉุย ของทอดร้อน ๆ',
        emoji: '🍢',
        image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=240&q=80',
        scores: { street: 3 },
      },
      {
        label: 'นั่งเก้าอี้ริมคลอง ฟังเสียงระฆังรถไฟและเรือแล่นผ่าน',
        emoji: '🛶',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=240&q=80',
        scores: { chill: 3 },
      },
      {
        label: 'เดินก้าวยาว ๆ ลัดเลาะชมตึกเก่า ได้เหงื่อสุขภาพดี',
        emoji: '🚶‍♂️',
        image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=240&q=80',
        scores: { healthy: 3 },
      },
    ],
  },
  {
    id: 'q4',
    sort_order: 4,
    emoji: '👑',
    question: 'ถ้าให้เลือก "เมนูขึ้นหิ้ง" 1 อย่างของตลาดพลูที่ต้องชิมให้ได้?',
    hint: 'เมนูซิกเนเจอร์ที่ใครมาตลาดพลูแล้วไม่กิน ถือว่ามาไม่ถึง!',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    options: [
      {
        label: 'ไอติมไข่แข็งนิอ่าง ความนัวระดับตำนานที่ใคร ๆ ก็ต้องเช็กอิน',
        emoji: '🍧',
        image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=240&q=80',
        scores: { sweet: 3, street: 1 },
      },
      {
        label: 'ข้าวมันไก่ หมูกรอบสูตรโบราณ หนังกรอบเนื้อนุ่ม',
        emoji: '🍗',
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=240&q=80',
        scores: { street: 3 },
      },
      {
        label: 'กาแฟโบราณเตาถ่าน ชงสดใหม่ทุกแก้ว หอมคลาสสิก',
        emoji: '☕',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=240&q=80',
        scores: { chill: 3 },
      },
      {
        label: 'ยำสมุนไพรสด น้ำผลไม้สกัดเย็น ดีต่อร่างกาย',
        emoji: '🥒',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=240&q=80',
        scores: { healthy: 3 },
      },
    ],
  },
  {
    id: 'q5',
    sort_order: 5,
    emoji: '🌙',
    question: 'ช่วงเวลาที่คุณคิดว่าตลาดพลูมีเสน่ห์น่าเดินกินที่สุด?',
    hint: 'ร้านเด็ดโดยเฉพาะของหวานเปิดรับลมค่ำคืนคึกคักมาก',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    options: [
      {
        label: 'รอบค่ำถึงดึก นั่งกินน้ำแข็งใสไอติมไข่แข็งดูไฟตลาดโบราณ',
        emoji: '🌃',
        image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=240&q=80',
        scores: { sweet: 3, chill: 2 },
      },
      {
        label: 'ช่วงเย็นหลังเลิกงาน ตามล่าของกินริมทางควันตลบอบอวล',
        emoji: '🌆',
        image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=240&q=80',
        scores: { street: 3 },
      },
      {
        label: 'บ่ายวันหยุด สบาย ๆ เดินจิบเครื่องดื่มริมคลอง',
        emoji: '☀️',
        image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=240&q=80',
        scores: { chill: 3 },
      },
      {
        label: 'เช้าตรู่ สูดอากาศสดชื่น หาเครื่องดื่มร้อนคลายหนาว',
        emoji: '🌅',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=240&q=80',
        scores: { healthy: 2, street: 1 },
      },
    ],
  },
]
