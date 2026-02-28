'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@taskmanager/ui'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export function Sidebar() {
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserEmail(user?.email || null)
    }

    getUser()
  }, [])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        className={`w-64 bg-gray-900/80 backdrop-blur-xl border-r border-gray-800 min-h-screen fixed left-0 top-0 flex flex-col p-6 transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Logo */}
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-white">
            <span className="text-primary">Task</span>Flow
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" onClick={() => setIsOpen(false)}>
            <div
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard') && !isActive('/dashboard/groups') && !isActive('/dashboard/profile')
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:bg-gray-800'
                }`}
            >
              Personal Tasks
            </div>
          </Link>

          <Link href="/dashboard/groups" onClick={() => setIsOpen(false)}>
            <div
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/groups')
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:bg-gray-800'
                }`}
            >
              Groups
            </div>
          </Link>

          <Link href="/dashboard/profile" onClick={() => setIsOpen(false)}>
            <div
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/profile')
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:bg-gray-800'
                }`}
            >
              Profile
            </div>
          </Link>
        </nav>

        {/* User Info */}
        <div className="border-t border-gray-800 pt-6">
          <div className="mb-4 px-4">
            <p className="text-sm text-gray-400">Signed in as</p>
            <p className="text-sm text-white truncate">{userEmail}</p>
          </div>
          <Button variant="secondary" className="w-full" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </motion.div>
    </>
  )
}
