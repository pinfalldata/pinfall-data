'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { SearchBar } from '@/components/ui/SearchBar'

interface NavItem {
  key: string
  href: string
  children?: { label: string; href: string; icon: string }[]
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', href: '/' },
  {
    key: 'matches',
    href: '/matches',
    children: [
      { label: 'Match Search', href: '/matches/search', icon: '🔍' },
      { label: 'All Shows', href: '/matches/shows', icon: '📺' },
      { label: 'All PLEs', href: '/matches/ple', icon: '🏟️' },
      { label: 'Match Stipulations', href: '/matches/stipulations', icon: '⚔️' },
    ],
  },
  { key: 'superstars', href: '/superstars', children: [
    { label: 'Wrestlers', href: '/superstars/wrestlers', icon: '💪' },
    { label: 'Managers', href: '/superstars/managers', icon: '🎩' },
    { label: 'Commentators', href: '/superstars/commentators', icon: '🎙️' },
    { label: 'Ring Announcers', href: '/superstars/ring-announcers', icon: '📢' },
    { label: 'Referees', href: '/superstars/referees', icon: '🦓' },
    { label: 'Interviewers', href: '/superstars/interviewers', icon: '🎤' },
    { label: 'General Managers', href: '/superstars/general-managers', icon: '👔' },
    { label: 'Executives', href: '/superstars/executives', icon: '🏛️' },
  ]},
  { key: 'champions', href: '/champions', children: [
    { label: 'The Title Vault', href: '/champions/the-title-vault', icon: '🏆' },
    { label: 'Major Accolades', href: '/champions/major-accolades', icon: '🌟' },
    { label: 'By The Numbers', href: '/champions/by-the-numbers', icon: '📊' },
  ]},
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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  const handleMouseEnter = (key: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current)
    setOpenDropdown(key)
  }
  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 200)
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'header-champ shadow-lg shadow-black/30'
            : 'header-champ-transparent'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 relative z-10">
              <Image
                src="/logo.png"
                alt="Pinfall Data"
                width={40}
                height={40}
                className="w-8 h-8 lg:w-10 lg:h-10"
                priority
              />
              <span className="font-display text-xl lg:text-2xl font-bold tracking-wider hidden sm:block champ-logo-text">
                PINFALL DATA
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5 relative z-10">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.key}
                  className="relative"
                  onMouseEnter={() => item.children ? handleMouseEnter(item.key) : null}
                  onMouseLeave={item.children ? handleMouseLeave : undefined}
                >
                  <Link
                    href={item.href}
                    className={`nav-link-champ px-2.5 xl:px-3 py-2 text-[13px] xl:text-sm font-body whitespace-nowrap transition-all duration-200 flex items-center gap-1 ${
                      openDropdown === item.key ? 'text-neon-blue' : ''
                    }`}
                  >
                    {t(item.key)}
                    {item.children && (
                      <svg className={`w-3 h-3 transition-transform duration-200 ${openDropdown === item.key ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>

                  {/* Dropdown */}
                  {item.children && openDropdown === item.key && (
                    <div
                      className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-neon-blue/15 bg-bg-primary/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden animate-fade-in"
                      onMouseEnter={() => handleMouseEnter(item.key)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Gold accent line on top */}
                      <div className="h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent" />
                      <div className="py-1.5">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-neon-blue hover:bg-neon-blue/5 transition-all duration-200"
                          >
                            <span className="text-base">{child.icon}</span>
                            <span className="font-medium">{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 relative z-10">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="search-btn-champ p-2 transition-all duration-200"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

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

        {/* Championship Gold bottom border */}
        <div className="champ-border-bottom" />
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <nav className="absolute right-0 top-0 h-full w-72 bg-bg-primary border-l border-border-subtle overflow-y-auto pt-20 pb-8 px-6">
            {/* Gold line on top */}
            <div className="absolute top-16 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent" />

            {NAV_ITEMS.map((item, i) => (
              <div key={item.key} style={{ animationDelay: `${i * 40}ms` }} className="animate-slide-in">
                {item.children ? (
                  <>
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === item.key ? null : item.key)}
                      className="w-full flex items-center justify-between py-3 text-lg font-body text-text-secondary hover:text-neon-blue transition-colors border-b border-border-subtle/50"
                    >
                      <span>{t(item.key)}</span>
                      <svg className={`w-4 h-4 transition-transform ${mobileExpanded === item.key ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {mobileExpanded === item.key && (
                      <div className="pl-4 py-1 border-b border-border-subtle/50 animate-fade-in">
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-2 text-sm text-text-secondary hover:text-neon-blue transition-colors"
                        >
                          All {t(item.key)}
                        </Link>
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 py-2 text-sm text-text-secondary hover:text-neon-blue transition-colors"
                          >
                            <span>{child.icon}</span>
                            <span>{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-3 text-lg font-body text-text-secondary hover:text-neon-blue transition-colors border-b border-border-subtle/50"
                  >
                    {t(item.key)}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}

      {isSearchOpen && <SearchBar onClose={() => setIsSearchOpen(false)} />}
      <div className="h-16 lg:h-[72px]" />
    </>
  )
}
