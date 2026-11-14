import { supabase, isSupabaseConfigured } from '../lib/supabase'

const STORAGE_KEY = 'talat-phlu-admin-requests-v2'
const ownerEmail = (import.meta.env.VITE_OWNER_EMAIL || '').trim()

/**
 * Get all admin requests (from Supabase or fallback localStorage)
 */
export async function getAdminRequests() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        return data
      }
    } catch {
      // fallback to localStorage
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Submit a new admin application with email and notify owner
 */
export async function submitAdminRequest({ name, email, reason = '', source = 'self' }) {
  const newRequest = {
    id: `req_${Date.now().toString(36)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    reason: reason.trim(),
    status: 'pending',
    source,
    created_at: new Date().toISOString(),
  }

  // 1. Try persisting to Supabase
  let savedToSupabase = false
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('admin_requests').insert([
        {
          id: newRequest.id,
          name: newRequest.name,
          email: newRequest.email,
          pin: 'email_auth', // legacy column compatibility
          reason: newRequest.reason,
          status: 'pending',
        },
      ])
      if (!error) savedToSupabase = true
    } catch (err) {
      console.warn('Supabase admin_requests insert failed, using local fallback:', err)
    }
  }

  // 2. Persist to localStorage
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newRequest, ...existing]))
  } catch (err) {
    console.warn('localStorage save error:', err)
  }

  // 3. Prepare notification email link to the owner
  const targetEmail = ownerEmail || 'talatphlu.admin@gmail.com'
  const subject = encodeURIComponent(`[ตลาดพลู] คำขอสมัครเป็น Admin ใหม่: ${newRequest.name}`)
  const body = encodeURIComponent(
    `เรียน เจ้าของระบบตลาดพลู\n\nมีผู้ยื่นคำขอสมัครเป็นผู้ดูแลระบบ (Admin) ใหม่ ดังนี้:\n` +
    `- ชื่อ: ${newRequest.name}\n` +
    `- อีเมลผู้สมัคร: ${newRequest.email}\n` +
    `- เหตุผล / ร้านค้าที่ดูแล: ${newRequest.reason || 'ไม่มี'}\n` +
    `- เวลาที่ยื่น: ${new Date().toLocaleString('th-TH')}\n\n` +
    `สามารถเข้าไปที่หน้า "ผู้ดูแล" > "จัดการทีม" เพื่อกดยืนยันการอนุมัติให้ผู้สมัครใช้งานได้ทันทีครับ`
  )
  const mailtoLink = `mailto:${targetEmail}?subject=${subject}&body=${body}`

  return {
    ok: true,
    request: newRequest,
    savedToSupabase,
    ownerEmail: targetEmail,
    mailtoLink,
  }
}

/**
 * Approve or reject an admin request
 */
export async function updateRequestStatus(id, newStatus) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('admin_requests').update({ status: newStatus }).eq('id', id)
    } catch (err) {
      console.warn('Supabase updateRequestStatus error:', err)
    }
  }

  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const updated = existing.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.warn('localStorage update error:', err)
  }
}
