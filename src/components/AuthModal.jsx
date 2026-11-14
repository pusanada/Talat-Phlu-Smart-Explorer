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
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null) // { title, message, randomCode, gmailUrl, mailtoUrl, ownerEmail }

  if (!open) return null

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('กรุณากรอกอีเมลผู้ดูแล หรือคำว่า admin')
      return
    }
    if (!password.trim()) {
      setError('กรุณากรอกรหัสผ่าน (รหัสเจ้าของ: 2580 หรือรหัสสุ่ม 6 หลัก)')
      return
    }

    setLoading(true)
    try {
      const res = await onLogin(email.trim(), password.trim())
      if (res?.ok) {
        onClose()
      } else {
        setError(res?.error || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลหรือรหัสผ่าน')
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการตรวจสอบข้อมูล กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
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

      const targetOwner = result.ownerEmail || 'gantoja29@gmail.com'
      const gmailUrl = result.gmailUrl
      const mailtoUrl = result.mailtoLink

      // Auto-trigger Gmail compose window
      try {
        if (gmailUrl) window.open(gmailUrl, '_blank')
      } catch {}

      setSuccess({
        title: 'ส่งคำขอสมัครสำเร็จแล้ว!',
        randomCode: result.randomCode,
        message: `บันทึกคำขอของ "${name.trim()}" เรียบร้อยแล้ว ระบบได้สร้างรหัสเข้าใช้งานสำหรับคุณและส่งไปยังอีเมลของเจ้าของระบบ (${targetOwner}) แล้ว`,
        gmailUrl,
        mailtoUrl,
        ownerEmail: targetOwner,
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
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-100">
              <CheckCircle2 className="h-7 w-7 text-sage-600" aria-hidden="true" />
            </div>
            <h3 className="mt-3 font-display text-lg font-bold text-brown-900">{success.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-brown-600">{success.message}</p>

            {/* Prominent Random Code Display */}
            {success.randomCode && (
              <div className="my-3.5 rounded-2xl bg-amber-50 p-3.5 border border-amber-200 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">🔑 รหัสผ่านสุ่มเข้าใช้งานของคุณ:</span>
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">โปรดจดบันทึกไว้</span>
                </div>
                <div className="mt-2 flex items-center justify-center rounded-xl bg-white py-2 font-mono text-2xl font-black tracking-widest text-terracotta-600 shadow-inner border border-amber-100">
                  {success.randomCode}
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-amber-800">
                  ระบบได้ส่งรหัสนี้ไปในอีเมลแจ้งเจ้าของระบบแล้ว เมื่อได้รับการยืนยัน คุณสามารถใช้อีเมลของคุณคู่กับรหัส 6 หลักนี้เพื่อเข้าสู่ระบบได้ทันที
                </p>
              </div>
            )}

            <div className="mt-3 space-y-2">
              {success.gmailUrl && (
                <a
                  href={success.gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-terracotta-500 py-3 text-xs font-bold text-white shadow-bento-sm hover:bg-terracotta-600 transition"
                >
                  <Mail className="h-4 w-4" />
                  ส่งอีเมลแจ้งเจ้าของ ({success.ownerEmail}) ทันที
                </a>
              )}
              {success.mailtoUrl && (
                <a
                  href={success.mailtoUrl}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-sand-300 bg-sand-100 py-2.5 text-xs font-bold text-brown-700 hover:bg-sand-200 transition"
                >
                  ✉️ หรือเปิดด้วยแอป Mail บนเครื่อง
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccess(null)
                setMode('login')
                setEmail(email)
                setPassword(success.randomCode || '')
              }}
              className="mt-4 w-full rounded-[40px] bg-brown-800 py-3 text-xs font-bold text-white shadow-bento-sm transition hover:bg-brown-900 active:scale-[0.97]"
            >
              ไปที่หน้าเข้าสู่ระบบทันที
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
                    อีเมลผู้ดูแล / บัญชี *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="เช่น gantoja29@gmail.com หรือ admin"
                      required
                      autoFocus
                      className="w-full rounded-2xl border border-sand-200 bg-sand-50 px-4 py-2.5 text-sm font-semibold text-brown-900 outline-none transition placeholder:font-normal placeholder:text-brown-300 focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-400/20"
                    />
                    <Mail className="absolute right-3.5 top-3 h-4 w-4 text-brown-300" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brown-700 mb-1">
                    รหัสผ่าน / รหัสสุ่มยืนยัน *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="รหัสเจ้าของระบบ (2580) หรือรหัสสุ่ม 6 หลัก"
                      required
                      className="w-full rounded-2xl border border-sand-200 bg-sand-50 px-4 py-2.5 text-sm font-semibold text-brown-900 outline-none transition placeholder:font-normal placeholder:text-brown-300 focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-400/20"
                    />
                    <LockKeyhole className="absolute right-3.5 top-3 h-4 w-4 text-brown-300" />
                  </div>
                </div>

                {/* Quick Owner Fill helper */}
                <div className="rounded-2xl bg-sand-100/80 p-2.5 border border-sand-200 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-brown-800">👑 เข้าสู่ระบบเจ้าของระบบ (Owner):</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('admin')
                        setPassword('2580')
                        setError('')
                      }}
                      className="rounded-full bg-warm-100 px-2.5 py-0.5 text-[10px] font-bold text-terracotta-600 hover:bg-warm-200 transition"
                    >
                      ⚡ กรอกให้อัตโนมัติ
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-brown-500 leading-tight">
                    กรอกบัญชี <span className="font-mono font-bold text-brown-700">admin</span> หรือ <span className="font-mono font-bold text-brown-700">gantoja29@gmail.com</span> และรหัสผ่าน <span className="font-mono font-bold text-brown-700">2580</span>
                  </p>
                </div>

                {error && (
                  <p className="rounded-xl bg-rose-50 p-2.5 text-xs font-bold text-rose-600 leading-relaxed">
                    ⚠️ {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-1.5 rounded-[40px] bg-terracotta-500 py-3 text-sm font-bold text-white shadow-bento-sm transition hover:bg-terracotta-600 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'} <ArrowRight className="h-4 w-4" />
                </button>
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
