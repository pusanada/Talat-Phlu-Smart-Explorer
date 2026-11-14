import { useEffect, useState } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import AuthModal from './components/AuthModal'
import Quiz from './components/Quiz'
import Result from './components/Result'
import Board from './components/Board'
import ShopsDirectory from './components/ShopsDirectory'
import AdminDashboard from './components/AdminDashboard'
import GeminiAiModal from './components/GeminiAiModal'
import { useTeam } from './hooks/useTeam'
import { isSupabaseConfigured } from './lib/supabase'
import { createShop, deleteShop, getShops, recordVote, updateShop } from './services/shopService'
import { createPost, getPosts } from './services/postService'
import { getQuizQuestions } from './services/quizService'

export default function App() {
  const [activeTab, setActiveTab] = useState('quiz')

  // ── Auth / team ──────────────────────────────────────────────
  const { team, login, addRequest, approve, reject, removeMember, reset } = useTeam()
  const [member, setMember] = useState(null) // logged-in team member or null
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' })
  const [aiModalOpen, setAiModalOpen] = useState(false)

  const isAdmin = !!member // members are always owner or sub-admin
  const openAuth = (mode = 'login') => setAuthModal({ open: true, mode })
  const closeAuth = () => setAuthModal({ open: false, mode: 'login' })

  const handleLogin = (emailOrKeyword) => {
    const found = login(emailOrKeyword)
    if (found) setMember(found)
    return found
  }

  // ── Data State ───────────────────────────────────────────────
  const [shops, setShops] = useState([])
  const [posts, setPosts] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [votes, setVotes] = useState({}) // shopId -> 'like' | 'dislike' | null
  const [quizAnswers, setQuizAnswers] = useState(() => Array(5).fill(null))
  const [quizDone, setQuizDone] = useState(false)

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
          setQuizAnswers(Array(loadedQuestions.length).fill(null))
        }
      } catch (err) {
        console.error('Error loading initial data from Supabase:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  const blankQuiz = () => setQuizAnswers(Array(questions.length).fill(null))

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
    setVotes((prev) => ({ ...prev, [shopId]: kind }))

    if (targetShop) {
      await recordVote(shopId, kind, targetShop)
    }
  }

  // ── Community board ──────────────────────────────────────────
  const handleAddPost = async ({ author, message, shop_id }) => {
    const created = await createPost({ author, message, shop_id })
    setPosts((prev) => [created, ...prev])
  }

  return (
    <div className="min-h-dvh bg-cream-100 flex flex-col">
      <Header
        member={member}
        onOpenAuth={() => openAuth('login')}
        onLogout={() => setMember(null)}
        onOpenAi={() => setAiModalOpen(true)}
        isSupabaseConnected={isSupabaseConfigured}
      />

      <main className="flex-1">
        {activeTab === 'quiz' &&
          (quizDone ? (
            <Result
              answers={quizAnswers}
              shops={shops}
              questions={questions}
              onRestart={() => {
                blankQuiz()
                setQuizDone(false)
              }}
            />
          ) : (
            <Quiz
              answers={quizAnswers}
              questions={questions}
              loading={loading}
              onChange={setQuizAnswers}
              onFinish={() => {
                if (quizAnswers.every((a) => a !== null)) setQuizDone(true)
              }}
            />
          ))}

        {activeTab === 'board' && (
          <Board
            posts={posts}
            shops={shops}
            loading={loading}
            onAddPost={handleAddPost}
          />
        )}

        {activeTab === 'shops' &&
          (isAdmin ? (
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
              onOpenInvite={() => openAuth('invite')}
            />
          ) : (
            <ShopsDirectory shops={shops} votes={votes} onVote={castVote} loading={loading} />
          ))}
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
