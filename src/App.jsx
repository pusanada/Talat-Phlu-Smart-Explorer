import { useEffect, useState } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import AuthModal from './components/AuthModal'
import Quiz from './components/Quiz'
import Result from './components/Result'
import Board from './components/Board'
import ShopsDirectory from './components/ShopsDirectory'
import AllShopsDirectory from './components/AllShopsDirectory'
import AdminDashboard from './components/AdminDashboard'
import GeminiAiModal from './components/GeminiAiModal'
import { useTeam } from './hooks/useTeam'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { createShop, deleteShop, DEFAULT_SHOPS, getShops, recordVote, updateShop } from './services/shopService'
import { createPost, getPosts, likePost } from './services/postService'
import { getQuizQuestions, recordQuizSubmission } from './services/quizService'
import { DEFAULT_QUIZ_QUESTIONS } from './constants/defaultQuestions'
import { computePersona, computeTally, PERSONAS } from './constants/personas'

export default function App() {
  const [activeTab, setActiveTab] = useState('quiz')

  // ── Auth / team ──────────────────────────────────────────────
  const { team, login, addRequest, approve, reject, removeMember, reset, refreshRequests } = useTeam()

  // Persistent login session in localStorage
  const [member, setMember] = useState(() => {
    try {
      const saved = localStorage.getItem('tp_admin_member')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Sync session state to localStorage
  useEffect(() => {
    try {
      if (member) {
        localStorage.setItem('tp_admin_member', JSON.stringify(member))
      } else {
        localStorage.removeItem('tp_admin_member')
      }
    } catch {}
  }, [member])
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' })
  const [aiModalOpen, setAiModalOpen] = useState(false)

  const isAdmin = !!member // members are always owner or sub-admin
  const [adminViewMode, setAdminViewMode] = useState('dashboard') // 'dashboard' | 'directory'
  const openAuth = (mode = 'login') => setAuthModal({ open: true, mode })
  const closeAuth = () => setAuthModal({ open: false, mode: 'login' })

  const handleLogin = async (emailOrKeyword, password) => {
    const res = await login(emailOrKeyword, password)
    if (res?.ok && res.member) {
      setMember(res.member)
      return res
    }
    return res || { ok: false, error: 'เข้าสู่ระบบไม่สำเร็จ' }
  }

  // ── Data State ───────────────────────────────────────────────
  const [shops, setShops] = useState(DEFAULT_SHOPS)
  const [posts, setPosts] = useState([])
  const [questions, setQuestions] = useState(DEFAULT_QUIZ_QUESTIONS)
  const [loading, setLoading] = useState(false)
  const [isSupabaseOnline, setIsSupabaseOnline] = useState(isSupabaseConfigured)
  // ── LocalStorage persistence for user shop votes (like / dislike) ──
  const [votes, setVotes] = useState(() => {
    try {
      const raw = localStorage.getItem('tp_shop_votes')
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  // ── SessionStorage persistence for Quiz (keeps state on refresh) ──
  const [quizAnswers, setQuizAnswers] = useState(() => {
    try {
      const saved = sessionStorage.getItem('tp_quiz_answers')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return Array(5).fill(null)
  })

  const [quizDone, setQuizDone] = useState(() => {
    try {
      const saved = sessionStorage.getItem('tp_quiz_done')
      if (saved) return JSON.parse(saved) === true
    } catch {}
    return false
  })

  // Sync quiz answers and completed status to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('tp_quiz_answers', JSON.stringify(quizAnswers))
      sessionStorage.setItem('tp_quiz_done', JSON.stringify(quizDone))
    } catch {}
  }, [quizAnswers, quizDone])

  // ── Initialize Data from Supabase ───────────────────────────
  useEffect(() => {
    let isMounted = true
    async function loadData() {
      setLoading(true)
      try {
        const [loadedShops, loadedPosts, loadedQuestions] = await Promise.all([
          getShops(),
          getPosts(),
          getQuizQuestions(),
        ])
        if (!isMounted) return
        if (loadedShops) setShops(loadedShops)
        if (loadedPosts) setPosts(loadedPosts)
        if (loadedQuestions) {
          setQuestions(loadedQuestions)
          setQuizAnswers((prev) => {
            if (Array.isArray(prev) && prev.length === loadedQuestions.length && prev.some((a) => a !== null)) {
              return prev
            }
            try {
              const saved = sessionStorage.getItem('tp_quiz_answers')
              if (saved) {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed) && parsed.length === loadedQuestions.length) return parsed
              }
            } catch {}
            return Array(loadedQuestions.length).fill(null)
          })
        }
        if (isSupabaseConfigured && supabase) {
          const { error } = await supabase.from('shops').select('id').limit(1)
          setIsSupabaseOnline(!error)
        } else {
          setIsSupabaseOnline(false)
        }
      } catch (err) {
        console.error('Error loading initial data from Supabase:', err)
        setIsSupabaseOnline(false)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  const handleRestartQuiz = () => {
    try {
      sessionStorage.removeItem('tp_quiz_answers')
      sessionStorage.removeItem('tp_quiz_done')
    } catch {}
    setQuizAnswers(Array(questions.length).fill(null))
    setQuizDone(false)
  }

  // ── Shop CRUD ────────────────────────────────────────────────
  const handleAddShop = async (payload) => {
    const created = await createShop(payload)
    setShops((prev) => [created, ...prev])
  }

  const handleUpdateShop = async (id, payload) => {
    const updated = await updateShop(id, payload)
    setShops((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)))
  }

  const handleDeleteShop = async (id) => {
    await deleteShop(id)
    setShops((prev) => prev.filter((s) => s.id !== id))
  }

  // ── Like / Dislike voting (Optimistic update + Supabase sync) ──
  const castVote = async (shopId, kind) => {
    const previous = votes[shopId] ?? null
    if (previous === kind) return

    let targetShop = null
    setShops((prev) =>
      prev.map((s) => {
        if (s.id !== shopId) return s
        let { likes, dislikes } = s
        if (previous === 'like') likes -= 1
        if (previous === 'dislike') dislikes -= 1
        if (kind === 'like') likes += 1
        if (kind === 'dislike') dislikes += 1
        targetShop = { ...s, likes, dislikes }
        return targetShop
      }),
    )
    const nextVotes = { ...votes, [shopId]: kind }
    setVotes(nextVotes)
    try {
      localStorage.setItem('tp_shop_votes', JSON.stringify(nextVotes))
    } catch {}

    if (targetShop) {
      await recordVote(shopId, kind, targetShop)
    }
  }

  const handleFinishQuiz = async () => {
    if (quizAnswers.every((a) => a !== null)) {
      setQuizDone(true)
      const personaKey = computePersona(quizAnswers, questions)
      const personaObj = PERSONAS[personaKey] || PERSONAS.street
      const tallyScores = computeTally(quizAnswers, questions)
      await recordQuizSubmission({
        persona: personaObj,
        answers: quizAnswers,
        scores: tallyScores,
      })
    }
  }

  // ── Community board ──────────────────────────────────────────
  const handleAddPost = async ({ author, message, shop_id }) => {
    const created = await createPost({ author, message, shop_id })
    setPosts((prev) => [created, ...prev])
  }

  const handleLikePost = async (postId, nextLikes) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: nextLikes } : p)),
    )
    await likePost(postId, nextLikes)
  }

  return (
    <div className="min-h-dvh bg-cream-100 flex flex-col">
      <Header
        member={member}
        onOpenAuth={() => openAuth('login')}
        onLogout={() => setMember(null)}
        onOpenAi={() => setAiModalOpen(true)}
        isSupabaseConnected={isSupabaseOnline}
      />

      <main className="flex-1">
        {activeTab === 'quiz' &&
          (quizDone ? (
            <Result
              answers={quizAnswers}
              shops={shops}
              questions={questions}
              onRestart={handleRestartQuiz}
            />
          ) : (
            <Quiz
              answers={quizAnswers}
              questions={questions}
              loading={loading}
              onChange={setQuizAnswers}
              onFinish={handleFinishQuiz}
            />
          ))}

        {activeTab === 'board' && (
          <Board
            posts={posts}
            shops={shops}
            loading={loading}
            onAddPost={handleAddPost}
            onLikePost={handleLikePost}
          />
        )}

        {(activeTab === 'stories' || activeTab === 'shops') && (
          <div>
            {/* Admin Switcher Bar: Allows admin to view normal stories directory anytime */}
            {isAdmin && (
              <div className="mx-auto max-w-3xl px-4 pt-4 pb-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl bg-white p-2.5 shadow-bento-sm border border-sand-200">
                  <div className="flex items-center gap-2 pl-1.5">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-brown-800">
                      เข้าสู่ระบบในฐานะ: <span className="text-terracotta-600 font-extrabold">{member?.name}</span> ({member?.role === 'owner' ? 'เจ้าของ' : 'ผู้ดูแล'})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setAdminViewMode('directory')}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
                        adminViewMode === 'directory'
                          ? 'bg-brown-800 text-cream-50 shadow-sm'
                          : 'bg-sand-100 text-brown-600 hover:bg-sand-200'
                      }`}
                    >
                      👀 ดูหน้าเรื่องเล่าปกติ
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminViewMode('dashboard')}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
                        adminViewMode === 'dashboard'
                          ? 'bg-terracotta-500 text-white shadow-sm'
                          : 'bg-sand-100 text-brown-600 hover:bg-sand-200'
                      }`}
                    >
                      ⚙️ แดชบอร์ดจัดการ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isAdmin && adminViewMode === 'dashboard' ? (
              <AdminDashboard
                shops={shops}
                currentMember={member}
                team={team}
                onAddShop={handleAddShop}
                onUpdateShop={handleUpdateShop}
                onDeleteShop={handleDeleteShop}
                onApprove={approve}
                onReject={reject}
                onRemoveMember={removeMember}
                onResetTeam={reset}
                onRefreshTeam={refreshRequests}
                onOpenInvite={() => openAuth('invite')}
              />
            ) : (
              <ShopsDirectory
                shops={shops}
                votes={votes}
                onVote={castVote}
                loading={loading}
                onNavigateAllShops={() => setActiveTab('all_shops')}
              />
            )}
          </div>
        )}

        {activeTab === 'all_shops' && (
          <AllShopsDirectory shops={shops} loading={loading} />
        )}
      </main>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />

      <AuthModal
        open={authModal.open}
        initialMode={authModal.mode}
        onClose={closeAuth}
        onLogin={handleLogin}
        addRequest={addRequest}
        invitedBy={member?.name}
      />

      <GeminiAiModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        shops={shops}
      />
    </div>
  )
}
