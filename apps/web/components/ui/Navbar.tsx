'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@taskmanager/ui'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="text-xl lg:text-2xl font-bold text-white">
          <span className="text-primary">Task</span>Flow
        </div>
        <div className="flex gap-2 lg:gap-4">
          <Link href="/login">
            <Button variant="secondary" size="sm" className="text-sm">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm" className="text-sm">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
