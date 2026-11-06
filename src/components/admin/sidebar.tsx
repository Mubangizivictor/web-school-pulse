'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  School,
  CreditCard,
  Package,
  Settings,
  LogOut,
} from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

const nav = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/schools', label: 'Schools', icon: School },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/plans', label: 'Plans', icon: Package },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await signOut(auth)
    router.push('/login')
  }

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 bg-navy-900 border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 shrink-0">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="18" r="10" fill="#D4933A" />
            <path d="M50 28 L28 62 L38 62 L44 52 L56 52 L62 62 L72 62 Z" fill="white" strokeLinejoin="round" />
            <path d="M10 70 Q28 70 36 62 Q44 54 50 62 Q56 70 64 62 Q72 54 90 70" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <div>
          <div className="text-white text-sm font-bold leading-none">School Pulse</div>
          <div className="text-white/40 text-xs mt-0.5">Admin Console</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5',
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
