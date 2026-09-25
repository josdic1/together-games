// Tiny synthesized sound effects for the games.
//
// No audio files needed - every sound here is generated on the fly with
// the Web Audio API. One shared module, four functions, swap or extend
// freely without touching any game.

let audioContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext

    if (!AudioContextClass) {
      return null
    }

    audioContext = new AudioContextClass()
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }

  return audioContext
}

type Tone = {
  frequency: number
  startTime: number
  duration: number
  type?: OscillatorType
  volume?: number
}

function playTone(context: AudioContext, tone: Tone) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = tone.type ?? 'sine'
  oscillator.frequency.setValueAtTime(tone.frequency, tone.startTime)

  const volume = tone.volume ?? 0.2
  const endTime = tone.startTime + tone.duration

  gain.gain.setValueAtTime(0, tone.startTime)
  gain.gain.linearRampToValueAtTime(volume, tone.startTime + 0.015)
  gain.gain.linearRampToValueAtTime(0, endTime)

  oscillator.connect(gain)
  gain.connect(context.destination)

  oscillator.start(tone.startTime)
  oscillator.stop(endTime + 0.02)
}

// Soft tap/pop - use for card flips, button presses, anything frequent.
export function playTap() {
  const context = getContext()
  if (!context) return

  playTone(context, {
    frequency: 520,
    startTime: context.currentTime,
    duration: 0.06,
    type: 'triangle',
    volume: 0.12,
  })
}

// Short rising two-note chime - use for a correct match/guess/landing.
export function playCorrect() {
  const context = getContext()
  if (!context) return

  const now = context.currentTime

  playTone(context, {
    frequency: 660,
    startTime: now,
    duration: 0.1,
    type: 'sine',
    volume: 0.2,
  })

  playTone(context, {
    frequency: 880,
    startTime: now + 0.09,
    duration: 0.14,
    type: 'sine',
    volume: 0.2,
  })
}

// Low descending buzz - use for a wrong guess or a miss. Deliberately
// gentle (no harsh noise) - this should read as "try again", not "fail".
export function playWrong() {
  const context = getContext()
  if (!context) return

  const now = context.currentTime

  playTone(context, {
    frequency: 220,
    startTime: now,
    duration: 0.16,
    type: 'sawtooth',
    volume: 0.15,
  })

  playTone(context, {
    frequency: 160,
    startTime: now + 0.1,
    duration: 0.18,
    type: 'sawtooth',
    volume: 0.15,
  })
}

// Four-note fanfare - use for winning a game/round.
export function playWin() {
  const context = getContext()
  if (!context) return

  const now = context.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.5]

  notes.forEach((frequency, index) => {
    playTone(context, {
      frequency,
      startTime: now + index * 0.11,
      duration: 0.16,
      type: 'sine',
      volume: 0.2,
    })
  })
}
