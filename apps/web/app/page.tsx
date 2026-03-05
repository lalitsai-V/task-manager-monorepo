'use client'

import Link from 'next/link'
import { Card } from '@taskmanager/ui'
import { Button } from '@taskmanager/ui'
import { Navbar } from '@/components/ui/Navbar'
import { HeroSection } from './hero-section'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="min-h-screen bg-black bg-[(TASK-HOME.png)] bg-cover bg-center">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-t border-gray-800">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-12 lg:mb-16 text-center">Why Choose TaskFlow?</h2>
        <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <motion.div className="" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              initial={{ y: -200, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: 0.4, duration: 0.8, type: 'spring', stiffness: 100, damping: 25 }}
          >
            <Card className="text-center p-6 lg:p-8">
            <div className="mb-4 lg:mb-6">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 lg:w-8 lg:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-white mb-3">Personal Tasks</h3>
            <p className="text-gray-400 text-sm lg:text-base leading-relaxed">
              Create and manage your own tasks with a clean, intuitive interface. Track your
              progress and stay focused on what matters.
            </p>
          </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              initial={{ y: -200, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: 0.6, duration: 0.8, type: 'spring', stiffness: 100, damping: 25 }}
          >
          <Card className="text-center p-6 lg:p-8">
            <div className="mb-4 lg:mb-6">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 lg:w-8 lg:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-white mb-3">Group Collaboration</h3>
            <p className="text-gray-400 text-sm lg:text-base leading-relaxed">
              Work with your team by creating groups and sharing tasks. Invite members,
              assign tasks, and track team progress.
            </p>
          </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              initial={{ y: -200, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: 0.8, duration: 0.8, type: 'spring', stiffness: 100, damping: 25 }}
          >
          <Card className="text-center p-6 lg:p-8 sm:col-span-2 lg:col-span-1">
            <div className="mb-4 lg:mb-6">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 lg:w-8 lg:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-white mb-3">Real-time Updates</h3>
            <p className="text-gray-400 text-sm lg:text-base leading-relaxed">
              See changes instantly as you and your team update tasks. Never miss an update
              with automatic synchronization.
            </p>
          </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-t border-gray-800">
        <Card className="bg-gray-800/50 border border-gray-700/50 p-8 lg:p-12 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">Ready to boost your productivity?</h2>
          <p className="text-lg text-gray-400 mb-6 lg:mb-8 max-w-2xl mx-auto">
            Join thousands of teams using TaskFlow to stay organized and collaborate effectively.
          </p>
          <Link href="/signup">
            <Button variant="primary" size="lg" className="px-8 !bg-purple-600 !hover:bg-purple-700 !text-white !border-purple-700">
              Start Free Today
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>&copy; 2026 TaskFlow. All rights reserved.</p>
        </div>
      </footer>
      </div>
  )
}

