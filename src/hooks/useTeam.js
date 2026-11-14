import { useCallback, useEffect, useState } from 'react'
import { submitAdminRequest, updateRequestStatus } from '../services/adminRequestService'

const STORAGE_KEY = 'talat-phlu-team-email-v1'
const rawOwnerEmail = (import.meta.env.VITE_OWNER_EMAIL || '').trim().toLowerCase()
const DEFAULT_OWNER_EMAIL = rawOwnerEmail || 'owner@talatphlu.com'

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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(team))
    } catch {
      // private mode
    }
  }, [team])

  /**
   * Log in via Email
   */
  const login = useCallback(
    (inputEmail) => {
      const normalized = (inputEmail || '').trim().toLowerCase()
      if (!normalized) return null

      // Check if it matches configured owner email, or default keywords 'admin' / 'owner'
      const isOwner =
        normalized === DEFAULT_OWNER_EMAIL ||
        (rawOwnerEmail && normalized === rawOwnerEmail) ||
        normalized === 'admin@talatphlu.com' ||
        normalized === 'admin' ||
        normalized === 'owner'

      if (isOwner) {
        return (
          team.members.find((m) => m.role === 'owner') || {
            id: 'owner',
            name: 'เจ้าของทีมตลาดพลู',
            email: normalized,
            role: 'owner',
          }
        )
      }

      // Check among approved members
      return team.members.find((m) => m.email?.toLowerCase() === normalized) ?? null
    },
    [team],
  )

  /**
   * Add a pending registration request by Email
   */
  const addRequest = useCallback(
    async ({ name, email, reason = '', source = 'self', invitedBy = null }) => {
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

      const request = {
        id: `req_${Date.now().toString(36)}`,
        name: name.trim(),
        email: normalizedEmail,
        reason: reason.trim(),
        source, // 'self' | 'invite'
        invitedBy: invitedBy ?? null,
        created_at: new Date().toISOString(),
      }

      setTeam((d) => ({ ...d, pending: [request, ...d.pending] }))

      // Sync to Supabase & prepare mailto link to notify owner
      const serviceResult = await submitAdminRequest({
        name,
        email: normalizedEmail,
        reason,
        source,
      })

      return {
        ok: true,
        request,
        mailtoLink: serviceResult.mailtoLink,
        ownerEmail: serviceResult.ownerEmail,
      }
    },
    [team],
  )

  /** Owner confirms a pending request → becomes sub-admin */
  const approve = useCallback((id) => {
    setTeam((d) => {
      const req = d.pending.find((p) => p.id === id)
      if (!req) return d
      updateRequestStatus(id, 'approved')
      return {
        members: [
          ...d.members,
          {
            id: `member_${Date.now().toString(36)}`,
            name: req.name,
            email: req.email,
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
  const reject = useCallback((id) => {
    updateRequestStatus(id, 'rejected')
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

  return { team, login, addRequest, approve, reject, removeMember, reset, defaultOwnerEmail: DEFAULT_OWNER_EMAIL }
}

export const ROLE_LABELS = {
  owner: 'เจ้าของทีม',
  sub_admin: 'ผู้ดูแลร่วม',
}
