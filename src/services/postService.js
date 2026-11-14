import { supabase, isSupabaseConfigured } from '../lib/supabase'

/**
 * Fetch all community posts from Supabase
 */
export async function getPosts() {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    if (data && data.length > 0) {
      return data.map((p) => ({
        ...p,
        time: p.time || 'เมื่อสักครู่',
      }))
    }
    return []
  } catch (err) {
    console.error('Supabase getPosts error:', err)
    return []
  }
}

/**
 * Create a new community post in Supabase
 */
export async function createPost({ author, message, shop_id }) {
  const newPost = {
    id: `post_${Date.now().toString(36)}`,
    author: author || 'บุคคลนิรนาม',
    avatar: '💬',
    message,
    shop_id: shop_id || null,
    likes: 0,
    time: 'เมื่อสักครู่',
    created_at: new Date().toISOString(),
  }

  if (!isSupabaseConfigured || !supabase) {
    console.warn('Cannot persist post: Supabase is not configured.')
    return newPost
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          id: newPost.id,
          author: newPost.author,
          avatar: newPost.avatar,
          message: newPost.message,
          shop_id: newPost.shop_id,
          likes: 0,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return { ...newPost, ...(data || {}) }
  } catch (err) {
    console.error('Supabase createPost error:', err)
    return newPost
  }
}

/**
 * Like or unlike a community post in Supabase
 */
export async function likePost(postId, newLikesCount) {
  if (!isSupabaseConfigured || !supabase) {
    return newLikesCount
  }

  try {
    const { error } = await supabase
      .from('posts')
      .update({ likes: Math.max(0, newLikesCount) })
      .eq('id', postId)

    if (error) throw error
    return newLikesCount
  } catch (err) {
    console.error('Supabase likePost error:', err)
    return newLikesCount
  }
}
