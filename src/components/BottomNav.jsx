import { MessagesSquare, Sparkles, Store } from 'lucide-react'

const TABS = [
  { id: 'quiz', label: 'ควิซ', icon: Sparkles },
  { id: 'board', label: 'กระดาน', icon: MessagesSquare },
  { id: 'shops', label: 'ร้านเด็ด', icon: Store },
]

/** Floating pill navigation — sits above the bottom edge, detached from screen sides */
export default function BottomNav({ activeTab, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-2 sm:pb-3 safe-bottom pointer-events-none">
      <div className="flex w-full max-w-sm items-center gap-1 rounded-full bg-brown-700 p-1.5 shadow-bento-lg pointer-events-auto">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[11px] font-semibold transition-all duration-300 ${
                active
                  ? 'bg-terracotta-500 text-cream-50 shadow-bento-sm'
                  : 'text-cream-50/65 hover:text-cream-50'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
