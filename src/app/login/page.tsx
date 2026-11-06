'use client'

import { useState, useEffect, FormEvent } from 'react'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SplashScreen } from '@/components/admin/splash-screen'

export default function LoginPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  // If already signed in, go straight to the console
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user) router.replace('/overview')
      else setChecking(false)
    })
    return unsub
  }, [router])

  if (checking) return <SplashScreen />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/overview')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo lockup */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 mb-4">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <circle cx="50" cy="16" r="9" fill="#D4933A" />
              <path d="M50 26 L30 60 L40 60 L46 50 L54 50 L60 60 L70 60 Z" fill="white" />
              <path d="M8 72 Q22 72 30 64 Q38 56 46 64 Q54 72 62 64 Q70 56 92 72"
                stroke="white" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <span className="text-white text-xl font-extrabold tracking-widest uppercase">School Pulse</span>
          <span className="text-white/40 text-xs tracking-widest uppercase mt-1">Admin Console</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-navy-800 rounded-2xl p-8 space-y-5 border border-white/10 shadow-2xl"
        >
          <h1 className="text-white text-lg font-semibold">Sign in</h1>

          <div className="space-y-1.5">
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="owner@schoolpulse.app"
              className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-amber-brand/70 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/25 text-sm focus:outline-none focus:border-amber-brand/70 transition"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition text-xs select-none"
                tabIndex={-1}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2 leading-snug">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full py-3 rounded-xl text-sm font-bold tracking-wide transition',
              'bg-[#D4933A] text-navy-900 hover:opacity-90 active:scale-[0.98]',
              loading && 'opacity-50 cursor-not-allowed',
            )}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-6">
          © {new Date().getFullYear()} School Pulse. Platform owners only.
        </p>
      </div>
    </div>
  )
}
