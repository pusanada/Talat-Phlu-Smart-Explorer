import { supabase, isSupabaseConfigured } from '../lib/supabase'

/**
 * Fetch all shops from Supabase
 */
export async function getShops() {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('likes', { ascending: false })

    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Supabase getShops error:', err)
    return []
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
