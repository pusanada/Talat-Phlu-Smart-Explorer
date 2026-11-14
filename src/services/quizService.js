import { supabase, isSupabaseConfigured } from '../lib/supabase'

/**
 * Fetch quiz questions from Supabase
 */
export async function getQuizQuestions() {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Supabase getQuizQuestions error:', err)
    return []
  }
}
