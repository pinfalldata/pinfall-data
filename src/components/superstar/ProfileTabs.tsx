'use client'

import { useState } from 'react'
import { hasRole } from '@/lib/utils'
import { TabProfile } from './TabProfile'
import { TabTimeline } from './TabTimeline'
import { TabMoves } from './TabMoves'
import { TabMedia } from './TabMedia'
import { TabMatches } from './TabMatches'

export function ProfileTabs({ superstar }: { superstar: any }) {
  const [activeTab, setActiveTab] = useState('profile')

  const isWrestler = hasRole(superstar, 'wrestler')
  // Books & Films: themes, books, or film profile links
  const filmEntry = superstar.films?.[0]
  const hasFilmLinks = filmEntry && (filmEntry.imdb_link || filmEntry.tmdb_link || filmEntry.rotten_tomatoes_link)
  const hasMediaContent = (superstar.themes?.length > 0) || (superstar.books?.length > 0) || hasFilmLinks
  const hasMatches = isWrestler && (superstar.total_matches > 0)

  const tabs = [
    { id: 'profile', label: 'Profile', show: true },
    { id: 'matches', label: 'Matches', show: hasMatches },
    { id: 'timeline', label: 'Timeline', show: superstar.timeline?.length > 0 },
    { id: 'moves', label: 'Moves', show: isWrestler && superstar.finishers?.length > 0 },
    { id: 'media', label: 'Books & Films', show: hasMediaContent },
  ].filter(t => t.show)

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Tab navigation — sticky */}
      <div className="sticky top-[72px] z-30 bg-bg-primary/90 backdrop-blur-md border-b border-border-subtle/50">
        <div className="px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 sm:px-6 py-4 text-sm font-body font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id ? 'text-neon-blue' : 'text-text-secondary hover:text-text-white'
              }`}>
              {tab.label}
              {/* Match count badge */}
              {tab.id === 'matches' && superstar.total_matches > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  activeTab === 'matches'
                    ? 'bg-neon-blue/20 text-neon-blue'
                    : 'bg-bg-tertiary text-text-secondary'
                }`}>
                  {superstar.total_matches > 999 ? `${(superstar.total_matches / 1000).toFixed(1)}k` : superstar.total_matches}
                </span>
              )}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-neon-blue shadow-[0_0_8px_rgba(44,178,254,0.5)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {activeTab === 'profile' && <TabProfile superstar={superstar} />}
        {activeTab === 'matches' && <TabMatches superstar={superstar} />}
        {activeTab === 'timeline' && <TabTimeline superstar={superstar} />}
        {activeTab === 'moves' && <TabMoves superstar={superstar} />}
        {activeTab === 'media' && <TabMedia superstar={superstar} />}
      </div>
    </div>
  )
}
