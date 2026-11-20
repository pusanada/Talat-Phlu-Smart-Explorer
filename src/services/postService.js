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
      return data.map((p) => {
        let cleanMessage = p.message || ''
        let image = p.image || null

        // Check if image is stored in <!--tp_image:...--> format inside message
        const imgMatch = cleanMessage.match(/<!--tp_image:([\s\S]+?)-->/)
        if (imgMatch) {
          image = imgMatch[1]
          cleanMessage = cleanMessage.replace(/<!--tp_image:[\s\S]+?-->/, '').trim()
        }

        return {
          ...p,
          message: cleanMessage,
          image,
          time: p.time || 'เมื่อสักครู่',
        }
      })
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
export async function createPost({ author, message, image = null, shop_id = null }) {
  const newPost = {
    id: `post_${Date.now().toString(36)}`,
    author: author || 'บุคคลนิรนาม',
    avatar: '💬',
    message,
    image: image || null,
    shop_id: shop_id || null,
    likes: 0,
    time: 'เมื่อสักครู่',
    created_at: new Date().toISOString(),
  }

  if (!isSupabaseConfigured || !supabase) {
    console.warn('Cannot persist post: Supabase is not configured.')
    return newPost
  }

  // 1. Try inserting directly with image column
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          id: newPost.id,
          author: newPost.author,
          avatar: newPost.avatar,
          message: newPost.message,
          image: newPost.image,
          shop_id: newPost.shop_id,
          likes: 0,
        },
      ])
      .select()
      .single()

    if (!error) {
      return { ...newPost, ...(data || {}) }
    }

    // 2. If 'image' column is not found in schema cache, fallback to embedding in message
    if (error.message?.includes('image') || error.code === 'PGRST204') {
      const embeddedMessage = newPost.image
        ? `${newPost.message}\n<!--tp_image:${newPost.image}-->`
        : newPost.message

      const { data: fallbackData, error: fallbackError } = await supabase
        .from('posts')
        .insert([
          {
            id: newPost.id,
            author: newPost.author,
            avatar: newPost.avatar,
            message: embeddedMessage,
            shop_id: newPost.shop_id,
            likes: 0,
          },
        ])
        .select()
        .single()

      if (fallbackError) throw fallbackError
      return { ...newPost, ...(fallbackData || {}), message: newPost.message, image: newPost.image }
    }

    throw error
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
