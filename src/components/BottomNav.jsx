import { MessagesSquare, Sparkles, Store, Video } from 'lucide-react'

const TABS = [
  { id: 'quiz', label: 'ควิซ', icon: Sparkles },
  { id: 'stories', label: 'เรื่องเล่า', icon: Video },
  { id: 'all_shops', label: 'ร้านทั้งหมด', icon: Store },
  { id: 'board', label: 'กระดาน', icon: MessagesSquare },
]

/** Floating pill navigation — sits above the bottom edge, detached from screen sides */
export default function BottomNav({ activeTab, onChange }) {
  // Normalize legacy tab id 'shops' to 'stories'
  const currentTab = activeTab === 'shops' ? 'stories' : activeTab

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-3 pb-2 sm:pb-3 safe-bottom pointer-events-none">
      <div className="flex w-full max-w-md items-center gap-1 rounded-full bg-brown-700 p-1.5 shadow-bento-lg pointer-events-auto">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = currentTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[10px] sm:text-[11px] font-semibold transition-all duration-300 ${
                active
                  ? 'bg-terracotta-500 text-cream-50 shadow-bento-sm'
                  : 'text-cream-50/65 hover:text-cream-50'
              }`}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
