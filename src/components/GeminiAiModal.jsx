import { useState } from 'react'
import { Bot, Loader2, Send, Sparkles, X } from 'lucide-react'
import { askGeminiFoodGuide, isGeminiConfigured } from '../services/geminiService'

const PRESET_QUESTIONS = [
  '💸 งบ 100 บาท กินอะไรอิ่มคุ้มในตลาดพลู?',
  '🌙 ร้านไหนเปิดช่วงเย็นหรือดึกบ้าง?',
  '🍰 แนะนำร้านของหวานระดับตำนาน',
  '🚶 วางแผนทริปเดินกิน 2 ชั่วโมงริมคลอง',
]

export default function GeminiAiModal({ open, onClose, shops = [] }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'สวัสดีครับ! ผมคือกูรูนักกินตลาดพลู AI (Powered by Google Gemini) มีอะไรให้ผมช่วยแนะนำร้านอร่อยในตลาดพลูไหมครับ?',
    },
  ])
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSend = async (textToSend) => {
    const text = textToSend || input
    if (!text.trim() || loading) return

    const userMsg = { role: 'user', text: text.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const reply = await askGeminiFoodGuide(text.trim(), shops)
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'ขออภัย เกิดข้อผิดพลาดในการตอบกลับ กรุณาลองใหม่อีกครั้ง' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-brown-900/60 p-0 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className="flex h-[88dvh] sm:h-[620px] w-full max-w-lg flex-col rounded-t-[32px] sm:rounded-[32px] bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sand-100 bg-gradient-to-r from-warm-500 to-terracotta-500 px-5 py-4 text-cream-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Sparkles className="h-5 w-5 text-mustard-300" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold">กูรูนักกินตลาดพลู AI</h3>
              <p className="text-[11px] text-cream-100">ขับเคลื่อนด้วย Google Gemini API</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง AI"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-cream-50 transition hover:bg-white/25 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* API warning if not configured */}
        {!isGeminiConfigured && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-800 flex items-center justify-between">
            <span>⚠️ ยังไม่ได้ใส่ <code>VITE_GEMINI_API_KEY</code> ใน .env</span>
            <span className="text-[10px] bg-amber-200/70 px-2 py-0.5 rounded-full font-bold">โหมดสาธิต</span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand-100 text-sm">
                  <Bot className="h-4 w-4 text-terracotta-600" />
                </span>
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-brown-700 text-cream-50 shadow-bento-sm'
                    : 'bg-sand-50 border border-sand-200 text-brown-800'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-semibold text-brown-400">
              <Loader2 className="h-4 w-4 animate-spin text-terracotta-500" />
              กูรูตลาดพลู AI กำลังพิมพ์คำตอบ...
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="border-t border-sand-100 bg-sand-50/50 p-2.5">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                disabled={loading}
                className="shrink-0 rounded-full border border-sand-200 bg-white px-3 py-1.5 text-xs font-medium text-brown-700 shadow-sm transition hover:bg-sand-100 active:scale-95 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="border-t border-sand-200 p-3 bg-white"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ถามอะไรเกี่ยวกับตลาดพลู เช่น อยากกินของทอด..."
              disabled={loading}
              className="flex-1 rounded-full border border-sand-200 bg-sand-100 px-4 py-2.5 text-sm text-brown-900 outline-none transition placeholder:text-brown-400 focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-400/20"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-500 text-white shadow-bento-sm transition hover:bg-terracotta-600 active:scale-95 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
