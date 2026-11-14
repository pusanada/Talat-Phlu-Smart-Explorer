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

/**
 * Record a user's quiz submission into Supabase table `quiz_submissions`
 */
export async function recordQuizSubmission({ persona, answers, scores }) {
  const payload = {
    id: `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    persona: persona?.key || 'street',
    persona_name: persona?.name || 'สายสตรีท',
    answers: answers || [],
    scores: scores || {},
    created_at: new Date().toISOString(),
  }

  // Backup to localStorage
  try {
    const raw = localStorage.getItem('tp_quiz_submissions')
    const list = raw ? JSON.parse(raw) : []
    localStorage.setItem('tp_quiz_submissions', JSON.stringify([payload, ...list.slice(0, 50)]))
  } catch {}

  if (!isSupabaseConfigured || !supabase) {
    return payload
  }

  try {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .insert([payload])
      .select()
      .single()

    if (error) {
      console.warn('Supabase quiz_submissions insert notice:', error.message)
      return payload
    }
    return data || payload
  } catch (err) {
    console.warn('Supabase recordQuizSubmission catch:', err)
    return payload
  }
}
