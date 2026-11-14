import { useState } from 'react'
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, Send, UserPlus, X } from 'lucide-react'

/**
 * Clean Email-based Authentication & Admin Request Modal (NO PINs)
 * mode 'login'  → sign in with admin or owner email
 * mode 'join'   → request admin access by entering name, email, and reason
 */
export default function AuthModal({ open, initialMode = 'login', onClose, onLogin, addRequest }) {
  const [mode, setMode] = useState(initialMode ?? 'login')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null) // { title, message, mailtoLink, ownerEmail }

  if (!open) return null

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('กรุณากรอกอีเมลผู้ดูแล')
      return
    }

    const member = onLogin(email.trim())
    if (member) {
      onClose()
    } else {
      setError('ไม่พบอีเมลนี้ในรายชื่อผู้ดูแลที่ได้รับอนุมัติ (หากยังไม่มีสิทธิ์ สามารถกดแท็บ "ขอสิทธิ์ Admin" ได้เลยครับ)')
    }
  }

  const handleJoinSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('กรุณากรอกชื่อ-สกุล หรือชื่อเล่น')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('กรุณากรอกอีเมลที่ถูกต้อง')
      return
    }

    setLoading(true)
    try {
      const result = await addRequest({
        name: name.trim(),
        email: email.trim(),
        reason: reason.trim(),
        source: 'self',
      })

      if (!result.ok) {
        setError(result.error)
        return
      }

      setSuccess({
        title: 'ส่งคำขอสมัครสำเร็จแล้ว!',
        message: `ระบบได้ส่งคำขอของ "${name.trim()}" และส่งการแจ้งเตือนไปยังอีเมลหลักของเจ้าของระบบ (${result.ownerEmail}) แล้ว เมื่อเจ้าของระบบกดยืนยัน คุณจะสามารถเข้าสู่ระบบด้วยอีเมล ${email.trim()} ได้ทันที`,
        mailtoLink: result.mailtoLink,
        ownerEmail: result.ownerEmail,
      })
    } catch {
      setError('เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  const switchTab = (newMode) => {
    setMode(newMode)
    setError('')
    setSuccess(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brown-900/50 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="animate-pop w-full max-w-sm rounded-[32px] bg-white p-6 shadow-bento-lg relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิดหน้าต่าง"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-sand-100 text-brown-500 hover:bg-sand-200"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          /* ── Success Screen ── */
          <div className="py-2 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-100">
              <CheckCircle2 className="h-8 w-8 text-sage-600" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-brown-900">{success.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-brown-600">{success.message}</p>

            {success.mailtoLink && (
              <a
                href={success.mailtoLink}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-terracotta-50 border border-terracotta-200 px-4 py-2 text-xs font-bold text-terracotta-700 hover:bg-terracotta-100 transition"
              >
                <Mail className="h-3.5 w-3.5 text-terracotta-600" />
                คลิกส่งอีเมลแจ้งเจ้าของระบบทันที
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-[40px] bg-terracotta-500 py-3 text-sm font-bold text-white shadow-bento-sm transition hover:bg-terracotta-600 active:scale-[0.97]"
            >
              รับทราบ
            </button>
          </div>
        ) : (
          <>
            {/* Top Icon and Title */}
            <div className="text-center mb-5">
              <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-warm-500 to-terracotta-500 shadow-bento-sm text-white">
                {mode === 'login' ? <LockKeyhole className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
              </div>
              <h3 className="mt-2.5 font-display text-lg font-bold text-brown-900">
                {mode === 'login' ? 'เข้าสู่ระบบผู้ดูแล' : 'ลงทะเบียนขอสิทธิ์ Admin'}
              </h3>
              <p className="text-xs text-brown-400">
                {mode === 'login'
                  ? 'เข้าสู่ระบบด้วยอีเมลผู้ดูแลที่ได้รับอนุมัติ'
                  : 'กรอกอีเมลเพื่อส่งคำขอยืนยันไปยังเจ้าของระบบ'}
              </p>
            </div>

            {/* Mode Toggle Tabs */}
            <div className="mb-5 flex rounded-full bg-sand-100 p-1">
              <button
                type="button"
                onClick={() => switchTab('login')}
                className={`flex-1 rounded-full py-2 text-xs font-bold transition ${
                  mode === 'login'
                    ? 'bg-white text-brown-900 shadow-bento-sm'
                    : 'text-brown-500 hover:text-brown-700'
                }`}
              >
                เข้าสู่ระบบ
              </button>
              <button
                type="button"
                onClick={() => switchTab('join')}
                className={`flex-1 rounded-full py-2 text-xs font-bold transition ${
                  mode === 'join'
                    ? 'bg-white text-brown-900 shadow-bento-sm'
                    : 'text-brown-500 hover:text-brown-700'
                }`}
              >
                ขอสิทธิ์ Admin
              </button>
            </div>

            {/* Form: Login Mode */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-brown-700 mb-1">
                    อีเมลผู้ดูแลระบบ *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="เช่น owner@talatphlu.com หรือ admin"
                      required
                      autoFocus
                      className="w-full rounded-2xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-semibold text-brown-900 outline-none transition placeholder:font-normal placeholder:text-brown-300 focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-400/20"
                    />
                    <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-brown-300" />
                  </div>
                </div>

                {error && (
                  <p className="rounded-xl bg-rose-50 p-2.5 text-xs font-bold text-rose-600 leading-relaxed">
                    ⚠️ {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-1.5 rounded-[40px] bg-terracotta-500 py-3 text-sm font-bold text-white shadow-bento-sm transition hover:bg-terracotta-600 active:scale-[0.98]"
                >
                  เข้าสู่ระบบ <ArrowRight className="h-4 w-4" />
                </button>

                <div className="pt-2 text-center">
                  <p className="text-[11px] text-brown-400">
                    สำหรับเจ้าของระบบ: กรอก <span className="font-bold text-brown-700 font-mono">admin</span> หรืออีเมลที่ตั้งไว้
                  </p>
                </div>
              </form>
            ) : (
              /* Form: Join / Register Mode */
              <form onSubmit={handleJoinSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-brown-700 mb-1">
                    ชื่อ-นามสกุล หรือชื่อเล่น *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น ป้าจันทร์ ตลาดพลู"
                    maxLength={40}
                    required
                    className="w-full rounded-xl border border-sand-200 bg-sand-50 px-3.5 py-2.5 text-sm font-semibold text-brown-900 outline-none transition placeholder:font-normal placeholder:text-brown-300 focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-400/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brown-700 mb-1">
                    อีเมลของคุณ * (สำหรับรับสิทธิ์และยืนยัน)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="เช่น your-email@gmail.com"
                    maxLength={60}
                    required
                    className="w-full rounded-xl border border-sand-200 bg-sand-50 px-3.5 py-2.5 text-sm font-semibold text-brown-900 outline-none transition placeholder:font-normal placeholder:text-brown-300 focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-400/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brown-700 mb-1">
                    เหตุผลหรือร้านค้าที่สังกัด (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="เช่น เจ้าของร้านค้าในตลาดพลู"
                    maxLength={80}
                    className="w-full rounded-xl border border-sand-200 bg-sand-50 px-3.5 py-2.5 text-xs text-brown-900 outline-none transition placeholder:text-brown-300 focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-400/20"
                  />
                </div>

                {error && (
                  <p className="rounded-xl bg-rose-50 p-2.5 text-xs font-bold text-rose-600 leading-relaxed">
                    ⚠️ {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[40px] bg-terracotta-500 py-3 text-sm font-bold text-white shadow-bento-sm transition hover:bg-terracotta-600 active:scale-[0.98] disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {loading ? 'กำลังส่งคำขอ...' : 'ส่งคำขอไปยังอีเมลหลัก'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
