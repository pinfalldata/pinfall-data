'use client'

import { useState } from 'react'
import { hasRole } from '@/lib/utils'
import { TabProfile } from './TabProfile'
import { TabTimeline } from './TabTimeline'
import { TabMoves } from './TabMoves'
import { TabMedia } from './TabMedia'

interface ProfileTabsProps {
  superstar: any
}

export function ProfileTabs({ superstar }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('profile')

  const isWrestler = hasRole(superstar, 'wrestler')
  const isManager = hasRole(superstar, 'manager')
  const hasThemesOrMedia = (superstar.themes?.length > 0) || (superstar.books?.length > 0) || (superstar.films?.length > 0)

  // Build tabs dynamically based on roles and available data
  const availableTabs = [
    { id: 'profile', label: 'Profile', show: true },
    { id: 'timeline', label: 'Timeline', show: superstar.timeline?.length > 0 },
    { id: 'moves', label: 'Moves', show: isWrestler && superstar.finishers?.length > 0 },
    { id: 'media', label: 'Media', show: hasThemesOrMedia },
  ].filter(tab => tab.show)

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Tab navigation */}
      <div className="sticky top-16 lg:top-20 z-30 bg-bg-primary/90 backdrop-blur-md border-b border-border-subtle">
        <div className="px-4 sm:px-6 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 sm:px-6 py-4 text-sm font-body font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-neon-blue'
                  : 'text-text-secondary hover:text-text-white'
              }`}
            >
              {tab.label}
              {/* Active indicator */}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-neon-blue rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 sm:px-6 py-8 lg:py-12 animate-fade-in">
        {activeTab === 'profile' && <TabProfile superstar={superstar} />}
        {activeTab === 'timeline' && <TabTimeline superstar={superstar} />}
        {activeTab === 'moves' && <TabMoves superstar={superstar} />}
        {activeTab === 'media' && <TabMedia superstar={superstar} />}
      </div>
    </div>
  )
}
