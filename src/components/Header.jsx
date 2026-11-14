import { LockKeyhole, LogOut, Map, Sparkles } from 'lucide-react'
import { ROLE_LABELS } from '../hooks/useTeam'

export default function Header({
  member,
  onOpenAuth,
  onLogout,
  onOpenAi,
  isSupabaseConnected = false,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-sand-200 bg-cream-100/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-4 py-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-terracotta-500 shadow-bento-sm">
          <Map className="h-5 w-5 text-cream-50" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg font-bold text-brown-900">ตลาดพลู สมาร์ทโซน</h1>
            <span
              className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isSupabaseConnected
                  ? 'bg-sage-100 text-brown-700 border border-sage-400'
                  : 'bg-sand-100 text-brown-500 border border-sand-300'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {isSupabaseConnected ? 'Supabase Online' : 'Supabase Offline'}
            </span>
          </div>
          <p className="text-[11px] font-medium text-brown-500">Talat Phlu Smart Explorer</p>
        </div>

        {/* AI Foodie Button */}
        <button
          type="button"
          onClick={onOpenAi}
          aria-label="เปิดถาม AI ตลาดพลู"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-warm-500 to-terracotta-500 px-3.5 py-2 text-xs font-bold text-white shadow-bento-sm transition hover:brightness-105 active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5 text-mustard-300" />
          <span>ถาม AI</span>
        </button>

        {member ? (
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-bento-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta-100 text-sm font-bold text-terracotta-600">
                {member.name.charAt(0)}
              </span>
              <span className="leading-tight">
                <span className="block max-w-[96px] truncate text-xs font-bold text-brown-900">{member.name}</span>
                <span
                  className={`block text-[10px] font-bold ${
                    member.role === 'owner' ? 'text-warm-600' : 'text-terracotta-500'
                  }`}
                >
                  {ROLE_LABELS[member.role]}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              aria-label="ออกจากระบบ"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-sand-100 text-brown-500 shadow-bento-sm transition hover:bg-sand-200 active:scale-95"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-brown-700 px-3.5 py-2 text-xs font-bold text-cream-50 shadow-bento-sm transition hover:bg-brown-900 active:scale-95"
          >
            <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
            ผู้ดูแล
          </button>
        )}
      </div>
    </header>
  )
}
