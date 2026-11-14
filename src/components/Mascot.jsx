import { useEffect, useState } from 'react'

/**
 * Petal/Dumpling style Mascot for Talat Phlu Food Matcher.
 * Features cute expressive cartoon eyes inspired by the reference illustration.
 */
export default function Mascot({ mood = 'normal', speech = '' }) {
  const [blink, setBlink] = useState(false)

  // Natural blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 180)
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-3">
      {/* Mascot Body */}
      <div className="relative shrink-0 select-none animate-float">
        <svg
          viewBox="0 0 100 100"
          className="h-16 w-16 drop-shadow-md sm:h-20 sm:w-20 transition-transform duration-300 hover:scale-105"
        >
          {/* Organic Petal Body in Terracotta / Coral */}
          <path
            d="M50 8 C62 8 72 16 75 28 C87 31 95 41 93 53 C91 66 81 75 70 77 C66 89 54 94 42 92 C29 90 22 81 19 69 C8 65 3 53 6 41 C9 29 19 22 30 22 C34 13 41 8 50 8 Z"
            fill="#E0694F"
          />

          {/* Cheeks */}
          <ellipse cx="26" cy="58" rx="5" ry="3" fill="#F4A582" opacity="0.6" />
          <ellipse cx="74" cy="58" rx="5" ry="3" fill="#F4A582" opacity="0.6" />

          {/* Left Eye */}
          {blink || mood === 'happy' ? (
            <path
              d="M30 50 Q38 42 46 50"
              stroke="#2B1810"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <g className="transition-all duration-200">
              {/* Outer white eyeball */}
              <circle cx="38" cy="48" r="11" fill="#FFFFFF" />
              {/* Inner pupil */}
              <circle cx="39" cy="48" r="6" fill="#1F1612" />
              {/* Catchlight sparkle 1 */}
              <circle cx="36.5" cy="45" r="2.5" fill="#FFFFFF" />
              {/* Catchlight sparkle 2 */}
              <circle cx="41" cy="50" r="1.2" fill="#FFFFFF" />
            </g>
          )}

          {/* Right Eye */}
          {blink || mood === 'happy' ? (
            <path
              d="M54 50 Q62 42 70 50"
              stroke="#2B1810"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <g className="transition-all duration-200">
              {/* Outer white eyeball */}
              <circle cx="62" cy="48" r="11" fill="#FFFFFF" />
              {/* Inner pupil */}
              <circle cx="61" cy="48" r="6" fill="#1F1612" />
              {/* Catchlight sparkle 1 */}
              <circle cx="58.5" cy="45" r="2.5" fill="#FFFFFF" />
              {/* Catchlight sparkle 2 */}
              <circle cx="63" cy="50" r="1.2" fill="#FFFFFF" />
            </g>
          )}

          {/* Cute Smile Mouth */}
          <path
            d="M45 62 Q50 67 55 62"
            stroke="#1F1612"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Floating mood emoji */}
        {mood === 'happy' && (
          <span className="absolute -top-1 -right-1 text-base animate-bounce">✨</span>
        )}
      </div>

      {/* Speech Bubble */}
      {speech && (
        <div className="relative rounded-2xl bg-white/95 px-4 py-2.5 shadow-bento text-brown-900 border border-sand-200 backdrop-blur-sm max-w-[280px] sm:max-w-xs animate-pop">
          {/* Arrow */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-0 w-0 border-y-6 border-y-transparent border-r-8 border-r-white/95" />
          <p className="text-xs font-bold leading-snug">{speech}</p>
        </div>
      )}
    </div>
  )
}
