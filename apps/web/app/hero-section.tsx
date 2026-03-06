'use client'

import Link from 'next/link'
import { Button } from '@taskmanager/ui'
import { motion } from 'framer-motion'

export function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="text-center">
        <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 lg:mb-6 leading-tight"
            initial={{ y: -100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.2, duration: 0.8, type: 'spring', stiffness: 100, damping: 25 }}
        >
          Manage Tasks
          <br />
          <span className="text-primary">Together</span>
        </motion.h1>
        <motion.p
          className="text-lg lg:text-xl text-gray-400 mb-8 lg:mb-12 max-w-3xl mx-auto leading-relaxed"
          initial={{ y: -100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ delay: 0.4, duration: 0.8, type: 'spring', stiffness: 100, damping: 25 }}
        >
          TaskFlow is a modern task management platform that helps you and your team stay
          organized. Create personal tasks, collaborate with groups, and track progress in
          real-time.
        </motion.p>
        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ y: -100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.6, duration: 0.8, type: 'spring', stiffness: 100, damping: 25, staggerChildren: 0.2 }}
          >
              <Link href="/signup">
                <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 !bg-purple-600 !hover:bg-purple-700 !text-white !border-purple-700">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8">
                  Sign In
                </Button>
              </Link>
            </motion.div>
      </div>
    </section>
  )
}
