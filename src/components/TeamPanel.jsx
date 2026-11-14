import { Clock, Mail, RefreshCw, ShieldQuestion, UserMinus, UserPlus } from 'lucide-react'
import { ROLE_LABELS } from '../hooks/useTeam'

/**
 * Team management inside the Admin Dashboard.
 * Owner view: pending approvals inbox (with email) + full team list (owner-controlled).
 * Sub-admin view: invite-a-colleague section only.
 */
export default function TeamPanel({ team, currentMember, onApprove, onReject, onRemoveMember, onResetTeam, onRefresh, onOpenInvite }) {
  const isOwner = currentMember.role === 'owner'

  return (
    <section className="animate-view space-y-5">
      {/* ── Owner: pending approvals inbox ── */}
      {isOwner && (
        <div className="rounded-[28px] bg-white p-5 shadow-bento">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-brown-900">
              <Clock className="h-4 w-4 text-warm-500" aria-hidden="true" />
              คำขอรอการยืนยันทางอีเมล
            </h3>
            <div className="flex items-center gap-2">
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  title="รีเฟรชคำขอจาก Supabase"
                  className="rounded-full bg-sand-100 p-1.5 text-brown-600 hover:bg-sand-200 transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              )}
              <span className="rounded-full bg-warm-100 px-3 py-1 text-xs font-bold text-warm-600">
                {team.pending.length} คำขอ
              </span>
            </div>
          </div>

          {team.pending.length === 0 ? (
            <div className="rounded-2xl bg-sand-100 px-4 py-6 text-center">
              <p className="text-sm font-semibold text-brown-500">ไม่มีคำขอค้างอยู่ 🎉</p>
              <p className="mt-1 text-xs text-brown-300">
                เมื่อมีผู้กรอกอีเมลขอสิทธิ์ Admin คำขอจะแสดงที่นี่เพื่อให้คุณกดยืนยัน
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {team.pending.map((req) => (
                <div key={req.id} className="animate-pop flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-cream-50 p-4 shadow-bento-sm">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand-200 font-display text-base font-bold text-brown-700">
                      {req.name.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-brown-900">{req.name}</p>
                      {req.email && (
                        <a
                          href={`mailto:${req.email}`}
                          className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-terracotta-600 hover:underline"
                        >
                          <Mail className="h-3 w-3" />
                          {req.email}
                        </a>
                      )}
                      {req.reason && (
                        <p className="mt-1 text-xs text-brown-600 italic line-clamp-2">
                          "{req.reason}"
                        </p>
                      )}
                      {req.pin && req.pin !== 'email_auth' && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-brown-600">🔑 รหัสผ่านที่ผู้สมัครตั้ง:</span>
                          <span className="rounded-md bg-warm-100 px-2 py-0.5 font-mono text-xs font-black text-terracotta-600 border border-warm-200">
                            {req.pin}
                          </span>
                        </div>
                      )}
                      <p className="mt-1 text-[10px] text-brown-400">
                        {req.source === 'invite' ? 'ได้รับคำเชิญ' : 'สมัครผ่านอีเมล'}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onApprove(req.id)}
                      className="rounded-[40px] bg-terracotta-500 px-4 py-2 text-xs font-bold text-white shadow-bento-sm transition hover:bg-terracotta-600 active:scale-95"
                    >
                      ✓ ยืนยันสิทธิ์
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(req.id)}
                      className="rounded-[40px] bg-sand-200 px-3.5 py-2 text-xs font-bold text-brown-700 transition hover:bg-sand-300 active:scale-95"
                    >
                      ปฏิเสธ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Sub-admin: invite section ── */}
      {!isOwner && (
        <div className="rounded-[28px] bg-gradient-to-br from-brown-700 to-brown-500 p-5 text-cream-50 shadow-bento">
          <h3 className="flex items-center gap-2 font-display text-base font-bold">
            <UserPlus className="h-4 w-4 text-mustard-300" aria-hidden="true" />
            เชิญเพื่อนร่วมทีม
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-cream-50/80">
            คุณเป็นผู้ดูแลร่วม — เชิญเพื่อนได้เลย แต่คำขอจะมีผลเมื่อเจ้าของระบบยืนยันเท่านั้น
          </p>
          <button
            type="button"
            onClick={onOpenInvite}
            className="mt-4 w-full rounded-[40px] bg-cream-50 py-3 text-sm font-bold text-brown-700 shadow-bento-sm transition hover:bg-white active:scale-[0.97]"
          >
            ✉️ เชิญเพื่อน
          </button>
        </div>
      )}

      {/* ── Owner: current team list ── */}
      {isOwner && (
        <div className="rounded-[28px] bg-white p-5 shadow-bento">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-brown-900">
              <ShieldQuestion className="h-4 w-4 text-terracotta-500" aria-hidden="true" />
              ทีมผู้ดูแลระบบ ({team.members.length} คน)
            </h3>
          </div>

          <div className="space-y-3">
            {team.members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-sand-50 p-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand-200 font-display text-base font-bold text-brown-700">
                  {m.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-brown-900">{m.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        m.role === 'owner' ? 'bg-warm-100 text-warm-700' : 'bg-terracotta-100 text-terracotta-600'
                      }`}
                    >
                      {ROLE_LABELS[m.role]}
                    </span>
                  </div>
                  <p className="text-[11px] text-brown-400 truncate">
                    {m.email ? `อีเมล: ${m.email}` : m.role === 'owner' ? 'ผู้ดูแลหลัก' : 'ผู้ดูแลร่วม'}
                  </p>
                </div>

                {m.role !== 'owner' && (
                  <button
                    type="button"
                    onClick={() => onRemoveMember(m.id)}
                    aria-label={`ถอดถอน ${m.name}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand-200 text-brown-500 transition hover:bg-rose-100 hover:text-rose-600 active:scale-95"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-sand-100 pt-4 flex justify-between items-center">
            <p className="text-[11px] text-brown-400">
              เข้าสู่ระบบด้วยอีเมลผู้ดูแลที่ได้รับการยืนยัน
            </p>
            <button
              type="button"
              onClick={onResetTeam}
              className="text-[11px] font-bold text-brown-400 hover:text-terracotta-600 underline"
            >
              รีเซ็ตทีมเป็นค่าเริ่มต้น
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
