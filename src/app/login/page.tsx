'use client'

import { useState, FormEvent } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
          <div className="w-14 h-14 mb-4">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="18" r="10" fill="#D4933A" />
              <path
                d="M50 28 L28 62 L38 62 L44 52 L56 52 L62 62 L72 62 Z"
                fill="white"
                strokeLinejoin="round"
              />
              <path
                d="M10 70 Q28 70 36 62 Q44 54 50 62 Q56 70 64 62 Q72 54 90 70"
                stroke="white"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
          <span className="text-white text-xl font-bold tracking-wide">School Pulse</span>
          <span className="text-white/50 text-sm mt-1">Platform Owner Console</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-navy-800 rounded-2xl p-8 space-y-5 border border-white/10"
        >
          <h1 className="text-white text-lg font-semibold">Sign in</h1>

          <div className="space-y-2">
            <label className="text-white/70 text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@schoolpulse.app"
              className="w-full bg-navy-900 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-brand transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-white/70 text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-navy-900 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-brand transition"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full py-3 rounded-xl text-sm font-semibold transition',
              'bg-amber-brand text-navy-900 hover:opacity-90 active:scale-[0.98]',
              loading && 'opacity-60 cursor-not-allowed',
            )}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
