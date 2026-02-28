"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';

export function LayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  React.useEffect(() => {
    // suppress known preload warnings in dev console
    const origWarn = console.warn
    console.warn = (...args: any[]) => {
      if (typeof args[0] === 'string' && args[0].includes('preloaded using link preload but not used')) {
        return
      }
      origWarn(...args)
    }
    return () => {
      console.warn = origWarn
    }
  }, [])

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
