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
 * Submit a new admin application with email, generate random access code, and notify owner
 */
export async function submitAdminRequest({ name, email, reason = '', source = 'self' }) {
  // Generate a secure random 6-digit access code for this specific applicant
  const randomCode = Math.floor(100000 + Math.random() * 900000).toString()

  const newRequest = {
    id: `req_${Date.now().toString(36)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    pin: randomCode,
    reason: reason.trim(),
    status: 'pending',
    source,
    created_at: new Date().toISOString(),
  }

  // 1. Persist to Supabase
  let savedToSupabase = false
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('admin_requests').insert([
        {
          id: newRequest.id,
          name: newRequest.name,
          email: newRequest.email,
          pin: randomCode,
          reason: newRequest.reason,
          status: 'pending',
        },
      ])
      if (!error) savedToSupabase = true
      else console.warn('Supabase admin_requests insert error:', error)
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

  // 3. Prepare notification email to the owner with the random access code
  const targetEmail = ownerEmail || 'gantoja29@gmail.com'
  const subjectRaw = `[ตลาดพลู] ขอสิทธิ์ Admin: ${newRequest.name} (รหัสผ่านสุ่ม: ${randomCode})`
  const bodyRaw =
    `เรียน เจ้าของระบบตลาดพลู (${targetEmail})\n\n` +
    `มีผู้ยื่นคำขอสมัครเป็นผู้ดูแลระบบ (Admin) ใหม่ ดังนี้:\n` +
    `• ชื่อ: ${newRequest.name}\n` +
    `• อีเมลผู้สมัคร: ${newRequest.email}\n` +
    `• เหตุผล / ร้านค้าที่ดูแล: ${newRequest.reason || 'ไม่ได้ระบุ'}\n` +
    `• 🔑 รหัสผ่านเข้าใช้งานที่ระบบสุ่มให้คนนี้: [ ${randomCode} ]\n` +
    `• เวลาที่ยื่น: ${new Date().toLocaleString('th-TH')}\n\n` +
    `วิธีอนุมัติ:\n` +
    `1. หากท่านอนุญาต ให้ส่งรหัส [ ${randomCode} ] นี้ให้ผู้สมัคร เพื่อให้เขานำไปใช้ล็อกอินในช่อง "รหัสผ่าน"\n` +
    `2. หรือเข้าสู่ระบบตลาดพลู เพื่อกดยืนยันการอนุมัติในแดชบอร์ดผู้ดูแลได้ทันทีครับ`

  const subject = encodeURIComponent(subjectRaw)
  const body = encodeURIComponent(bodyRaw)
  const mailtoLink = `mailto:${targetEmail}?subject=${subject}&body=${body}`
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}&su=${subject}&body=${body}`

  return {
    ok: true,
    request: newRequest,
    randomCode,
    savedToSupabase,
    ownerEmail: targetEmail,
    mailtoLink,
    gmailUrl,
  }
}

/**
 * Verify if applicant is approved in Supabase with matching access code
 */
export async function verifyAdminFromSupabase(email, code) {
  if (!isSupabaseConfigured || !supabase) return null

  try {
    const { data, error } = await supabase
      .from('admin_requests')
      .select('*')
      .eq('email', (email || '').trim().toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1)

    if (error || !data || data.length === 0) return null

    const found = data[0]
    // Allow login if applicant enters their assigned random 6-digit code or status is approved
    if (found.pin && code && found.pin === code) {
      return {
        id: found.id,
        name: found.name,
        email: found.email,
        role: 'sub-admin',
      }
    }

    if (found.status === 'approved') {
      return {
        id: found.id,
        name: found.name,
        email: found.email,
        role: 'sub-admin',
      }
    }
  } catch (err) {
    console.warn('verifyAdminFromSupabase catch:', err)
  }
  return null
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
