import { useCallback, useEffect, useState } from 'react'
import { getAdminRequests, submitAdminRequest, updateRequestStatus, verifyAdminFromSupabase } from '../services/adminRequestService'

const STORAGE_KEY = 'talat-phlu-team-email-v1'
const rawOwnerEmail = (import.meta.env.VITE_OWNER_EMAIL || '').trim().toLowerCase()
const DEFAULT_OWNER_EMAIL = rawOwnerEmail || 'gantoja29@gmail.com'

const SEED = {
  members: [
    {
      id: 'owner',
      name: 'เจ้าของทีมตลาดพลู',
      email: DEFAULT_OWNER_EMAIL,
      role: 'owner',
    },
  ],
  pending: [],
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed?.members) && parsed.members.length > 0) return parsed
    }
  } catch {
    // corrupted storage → reseed
  }
  return SEED
}

export function useTeam() {
  const [team, setTeam] = useState(load)

  // Sync state to local storage for offline resilience
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(team))
    } catch {
      // private mode
    }
  }, [team])

  /**
   * Fetch live admin requests from Supabase to show in dashboard
   */
  const refreshRequests = useCallback(async () => {
    try {
      const requests = await getAdminRequests()
      if (!Array.isArray(requests)) return

      setTeam((prev) => {
        // Pending requests from Supabase
        const pendingFromSupabase = requests.filter((r) => r.status === 'pending')

        // Approved requests from Supabase
        const approvedFromSupabase = requests.filter((r) => r.status === 'approved')
        const currentMembers = [...prev.members]
        approvedFromSupabase.forEach((app) => {
          if (!currentMembers.some((m) => m.email?.toLowerCase() === app.email?.toLowerCase())) {
            currentMembers.push({
              id: app.id || `member_${app.email}`,
              name: app.name,
              email: app.email,
              role: 'sub_admin',
              reason: app.reason,
              approved_at: app.created_at || new Date().toISOString(),
            })
          }
        })

        return {
          members: currentMembers,
          pending: pendingFromSupabase,
        }
      })
    } catch (err) {
      console.warn('Error syncing requests from Supabase:', err)
    }
  }, [])

  // Auto-sync on mount
  useEffect(() => {
    refreshRequests()
  }, [refreshRequests])

  /**
   * Log in via Email and Password/Code
   */
  const login = useCallback(
    async (inputEmail, inputPassword) => {
      const normalized = (inputEmail || '').trim().toLowerCase()
      const code = (inputPassword || '').trim()
      if (!normalized) return { ok: false, error: 'กรุณากรอกอีเมล' }

      // 1. Owner Login Check
      const isOwner =
        normalized === DEFAULT_OWNER_EMAIL ||
        (rawOwnerEmail && normalized === rawOwnerEmail) ||
        normalized === 'admin@talatphlu.com' ||
        normalized === 'admin' ||
        normalized === 'owner' ||
        normalized.startsWith('gantoja29')

      const ownerPasswords = ['2580', 'admin1234', (import.meta.env.VITE_ADMIN_PASSWORD || '').trim()].filter(Boolean)

      if (isOwner) {
        if (!code) {
          return { ok: false, error: 'กรุณากรอกรหัสผ่านเจ้าของระบบ' }
        }
        if (!ownerPasswords.includes(code)) {
          return { ok: false, error: 'รหัสผ่านเจ้าของระบบไม่ถูกต้อง (รหัสตั้งต้น: 2580)' }
        }
        return {
          ok: true,
          member: {
            id: 'owner',
            name: 'เจ้าของทีมตลาดพลู',
            email: rawOwnerEmail || 'gantoja29@gmail.com',
            role: 'owner',
          },
        }
      }

      // 2. Sub-Admin Local Check
      const existingMember = team.members.find((m) => m.email?.toLowerCase() === normalized)
      if (existingMember) {
        if (existingMember.pin && existingMember.pin !== 'email_auth' && code !== existingMember.pin) {
          return { ok: false, error: 'รหัสผ่านไม่ถูกต้อง' }
        }
        return { ok: true, member: existingMember }
      }

      // 3. Pending/Approved Requests Check
      const pendingMatch = team.pending.find((p) => p.email?.toLowerCase() === normalized)
      if (pendingMatch) {
        if (pendingMatch.pin && pendingMatch.pin !== 'email_auth' && code !== pendingMatch.pin) {
          return { ok: false, error: 'รหัสผ่านไม่ถูกต้อง' }
        }
        if (pendingMatch.status === 'approved') {
          return {
            ok: true,
            member: {
              id: pendingMatch.id,
              name: pendingMatch.name,
              email: pendingMatch.email,
              role: 'sub-admin',
            },
          }
        }
        return { ok: false, error: 'คำขอของคุณยังไม่ได้รับการอนุมัติจากเจ้าของระบบ' }
      }

      // 4. Supabase Live Verification
      const supabaseUser = await verifyAdminFromSupabase(normalized, code)
      if (supabaseUser) {
        return { ok: true, member: supabaseUser }
      }

      return {
        ok: false,
        error: 'ไม่พบบัญชีผู้ดูแลนี้ หรือรหัสผ่านไม่ถูกต้อง กรุณาลงทะเบียนขอสิทธิ์ก่อนเข้าใช้งาน',
      }
    },
    [team],
  )

  /**
   * Add a pending registration request by Email
   */
  const addRequest = useCallback(
    async ({ name, email, password = '', reason = '', source = 'self', invitedBy = null }) => {
      const normalizedEmail = (email || '').trim().toLowerCase()
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        return { ok: false, error: 'กรุณากรอกอีเมลที่ถูกต้องเพื่อใช้ในการยืนยัน' }
      }

      // Check if already an approved member
      if (team.members.some((m) => m.email?.toLowerCase() === normalizedEmail)) {
        return { ok: false, error: 'อีเมลนี้เป็นผู้ดูแลในระบบอยู่แล้ว สามารถเข้าสู่ระบบได้เลย' }
      }

      // Check if already in pending
      if (team.pending.some((p) => p.email?.toLowerCase() === normalizedEmail)) {
        return { ok: false, error: 'อีเมลนี้ได้ยื่นคำขอไว้แล้ว กำลังรอเจ้าของระบบกดยืนยัน' }
      }

      // Sync to Supabase & prepare mailto link to notify owner
      const serviceResult = await submitAdminRequest({
        name,
        email: normalizedEmail,
        password,
        reason,
        source,
      })

      const request = {
        id: serviceResult.request?.id || `req_${Date.now().toString(36)}`,
        name: name.trim(),
        email: normalizedEmail,
        pin: (password || '').trim() || 'email_auth',
        reason: reason.trim(),
        source, // 'self' | 'invite'
        invitedBy: invitedBy ?? null,
        created_at: new Date().toISOString(),
      }

      setTeam((d) => ({ ...d, pending: [request, ...d.pending] }))

      return {
        ok: true,
        request,
        password: (password || '').trim(),
        mailtoLink: serviceResult.mailtoLink,
        gmailUrl: serviceResult.gmailUrl,
        ownerEmail: serviceResult.ownerEmail,
      }
    },
    [team],
  )

  /** Owner confirms a pending request → becomes sub-admin */
  const approve = useCallback(async (id) => {
    await updateRequestStatus(id, 'approved')
    setTeam((d) => {
      const req = d.pending.find((p) => p.id === id)
      if (!req) return d
      return {
        members: [
          ...d.members,
          {
            id: `member_${Date.now().toString(36)}`,
            name: req.name,
            email: req.email,
            pin: req.pin,
            role: 'sub_admin',
            reason: req.reason,
            invitedBy: req.invitedBy ?? 'สมัครผ่านอีเมล',
            approved_at: new Date().toISOString(),
          },
        ],
        pending: d.pending.filter((p) => p.id !== id),
      }
    })
  }, [])

  /** Owner rejects a pending request */
  const reject = useCallback(async (id) => {
    await updateRequestStatus(id, 'rejected')
    setTeam((d) => ({ ...d, pending: d.pending.filter((p) => p.id !== id) }))
  }, [])

  /** Owner removes a sub-admin */
  const removeMember = useCallback((id) => {
    setTeam((d) => ({ ...d, members: d.members.filter((m) => m.id !== id) }))
  }, [])

  /** Reset team state */
  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    setTeam(SEED)
  }, [])

  return { team, login, addRequest, approve, reject, removeMember, reset, refreshRequests, defaultOwnerEmail: DEFAULT_OWNER_EMAIL }
}

export const ROLE_LABELS = {
  owner: 'เจ้าของทีม',
  sub_admin: 'ผู้ดูแลร่วม',
}
