import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const DEFAULT_SHOPS = [
  {
    id: 'shop_01',
    name: 'ร้านน้ำแข็งใส นิอ่าง (ระดับตำนาน)',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80',
    signature_menu: 'น้ำแข็งใสไข่แข็ง และ ไอติมไข่แข็ง เครื่องแน่น',
    story:
      'ตำนานร้านน้ำแข็งใสคู่ตลาดพลูที่เปิดบริการมายาวนานกว่า 50 ปี สืบทอดความอร่อยจากรุ่นสู่รุ่น แม้จะผ่านช่วงการก่อสร้างรถไฟฟ้า แต่ยังคงยืนหยัดรักษาเอกลักษณ์ความอร่อยหวานมันไว้ได้อย่างครบถ้วน',
    map_link:
      'https://www.google.com/maps/search/?api=1&query=%E0%B8%99%E0%B8%B4%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%87%20%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B9%81%E0%B8%82%E0%B9%87%E0%B8%87%E0%B9%83%E0%B8%AA%20%E0%B9%84%E0%B8%AD%E0%B8%95%E0%B8%B4%E0%B8%A1%E0%B9%84%E0%B8%82%E0%B9%88%E0%B9%81%E0%B8%82%E0%B9%87%E0%B8%87%20%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%9E%E0%B8%A5%E0%B8%B9',
    video: '/videos/talat-phlu-story.mp4',
    video_duration: '2:05',
    personas: ['sweet', 'chill', 'street', 'healthy'],
    category: 'ของหวานโบราณ',
    likes: 412,
    dislikes: 18,
  },
]

/**
 * Fetch all shops from Supabase (or fallback to default shop ร้านนิอ่าง)
 */
export async function getShops() {
  if (!isSupabaseConfigured || !supabase) {
    return DEFAULT_SHOPS
  }

  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('likes', { ascending: false })

    if (error) throw error
    if (data && data.length > 0) return data
    return DEFAULT_SHOPS
  } catch (err) {
    console.warn('Supabase getShops fallback to default shop:', err)
    return DEFAULT_SHOPS
  }
}

/**
 * Create a new shop in Supabase
 */
export async function createShop(payload) {
  const newShop = {
    id: `shop_${Date.now().toString(36)}`,
    ...payload,
    video: payload.video || '/videos/talat-phlu-story.mp4',
    video_duration: payload.video_duration || '1:45',
    personas: payload.personas || ['sweet', 'street'],
    category: payload.category || 'ร้านใหม่',
    likes: 0,
    dislikes: 0,
    created_at: new Date().toISOString(),
  }

  if (!isSupabaseConfigured || !supabase) {
    console.warn('Cannot persist shop: Supabase is not configured.')
    return newShop
  }

  try {
    const { data, error } = await supabase
      .from('shops')
      .insert([newShop])
      .select()
      .single()

    if (error) throw error
    return data || newShop
  } catch (err) {
    console.error('Supabase createShop error:', err)
    return newShop
  }
}

/**
 * Update shop by ID
 */
export async function updateShop(id, payload) {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Cannot update shop: Supabase is not configured.')
    return { id, ...payload }
  }

  try {
    const { data, error } = await supabase
      .from('shops')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Supabase updateShop error:', err)
    return { id, ...payload }
  }
}

/**
 * Delete shop by ID
 */
export async function deleteShop(id) {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Cannot delete shop: Supabase is not configured.')
    return false
  }

  try {
    const { error } = await supabase.from('shops').delete().eq('id', id)
    if (error) throw error
    return true
  } catch (err) {
    console.error('Supabase deleteShop error:', err)
    return false
  }
}

/**
 * Record a like/dislike vote
 */
export async function recordVote(shopId, kind, currentShop) {
  if (!isSupabaseConfigured || !supabase || !currentShop) {
    return null
  }

  try {
    const { error } = await supabase
      .from('shops')
      .update({
        likes: currentShop.likes,
        dislikes: currentShop.dislikes,
      })
      .eq('id', shopId)

    if (error) throw error
  } catch (err) {
    console.error('Supabase recordVote error:', err)
  }
}
