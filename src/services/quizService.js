import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { DEFAULT_QUIZ_QUESTIONS } from '../constants/defaultQuestions'

/**
 * Fetch quiz questions from Supabase, or use default Talat Phlu questions
 */
export async function getQuizQuestions() {
  if (!isSupabaseConfigured || !supabase) {
    return DEFAULT_QUIZ_QUESTIONS
  }

  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    if (data && data.length > 0) {
      return data
    }
    return DEFAULT_QUIZ_QUESTIONS
  } catch (err) {
    console.warn('Supabase getQuizQuestions fallback to default:', err)
    return DEFAULT_QUIZ_QUESTIONS
  }
}
