// ─────────────────────────────────────────────────────────────
// Dependency-free Web Audio Synthesizer for Quiz Gamification
// ─────────────────────────────────────────────────────────────

let soundEnabled = true

export function setSoundEnabled(enabled) {
  soundEnabled = enabled
}

export function isSoundEnabled() {
  return soundEnabled
}

export function playSound(type = 'pop') {
  if (!soundEnabled || typeof window === 'undefined') return

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    if (type === 'pop') {
      // Pleasant bubbly pop sound on option select
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(400, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.08)

      gain.gain.setValueAtTime(0.18, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.08)
    } else if (type === 'fanfare') {
      // Celebratory victory chords on quiz finish
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        const start = ctx.currentTime + idx * 0.09
        const end = start + 0.35

        osc.frequency.setValueAtTime(freq, start)
        gain.gain.setValueAtTime(0.16, start)
        gain.gain.exponentialRampToValueAtTime(0.001, end)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(start)
        osc.stop(end)
      })
    }
  } catch {
    // AudioContext blocked by browser autoplay policy
  }
}
