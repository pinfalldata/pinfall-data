'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { SearchBar } from '@/components/ui/SearchBar'

const NAV_ITEMS = [
  { key: 'home', href: '/' },
  { key: 'matches', href: '/matches' },
  { key: 'superstars', href: '/superstars' },
  { key: 'champions', href: '/champions' },
  { key: 'history', href: '/history' },
  { key: 'omg', href: '/omg-moments' },
  { key: 'tagTeams', href: '/tag-teams' },
  { key: 'rivalries', href: '/rivalries' },
  { key: 'records', href: '/records' },
  { key: 'hallOfFame', href: '/hall-of-fame' },
  { key: 'bonus', href: '/bonus' },
]

export function Header() {
  const t = useTranslations('nav')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass shadow-lg shadow-black/20'
            : 'bg-bg-primary/60 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          {/* Main header bar */}
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <Image
                src="/logo.png"
                alt="Pinfall Data"
                width={40}
                height={40}
                className="w-8 h-8 lg:w-10 lg:h-10"
                priority
              />
              <span className="font-display text-xl lg:text-2xl font-bold text-text-white tracking-wider hidden sm:block">
                PINFALL<span className="text-neon-blue">DATA</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="px-3 py-2 text-sm font-body text-text-secondary hover:text-neon-blue transition-colors duration-200 whitespace-nowrap"
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>

            {/* Right side: Search + Mobile menu */}
            <div className="flex items-center gap-2">
              {/* Search button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-text-secondary hover:text-neon-blue transition-colors"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Mobile burger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-text-secondary hover:text-neon-blue transition-colors"
                aria-label="Menu"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className={`block h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                  <span className={`block h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                  <span className={`block h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Neon bottom line */}
        <div className="neon-line" />
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Menu panel */}
          <nav className="absolute right-0 top-0 h-full w-72 bg-bg-primary border-l border-border-subtle animate-slide-in overflow-y-auto pt-20 pb-8 px-6">
            {NAV_ITEMS.map((item, i) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-3 text-lg font-body text-text-secondary hover:text-neon-blue transition-colors border-b border-border-subtle/50"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <SearchBar onClose={() => setIsSearchOpen(false)} />
      )}

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-20" />
    </>
  )
}
