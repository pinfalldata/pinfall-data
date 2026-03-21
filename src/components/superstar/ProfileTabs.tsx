'use client'

import { useState, useEffect } from 'react'
import { hasRole } from '@/lib/utils'
import { TabProfile } from './TabProfile'
import { TabTimeline } from './TabTimeline'
import { TabMoves } from './TabMoves'
import { TabMedia } from './TabMedia'
import { TabMatches } from './TabMatches'
import TabRoleData from './TabRoleData'
import TabChampionships from './TabChampionships'
import TabOMGMoments from './TabOMGMoments'
import TabTagTeams from './TabTagTeams'
import TabStables from './TabStables'

interface RoleCounts {
  segments: number; managed: number; commentated: number; matchCommentated: number
  ringAnnounced: number; refereed: number; guestRefereed: number; interviewed: number
  gmTenures: number; execTenures: number; championships: number
  omgMoments: number; tagTeams: number; stables: number
}

export function ProfileTabs({ superstar }: { superstar: any }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [roleCounts, setRoleCounts] = useState<RoleCounts | null>(null)

  const isWrestler = hasRole(superstar, 'wrestler')
  const filmEntry = superstar.films?.[0]
  const hasFilmLinks = filmEntry && (filmEntry.imdb_link || filmEntry.tmdb_link || filmEntry.rotten_tomatoes_link)
  const hasBooksOrFilms = (superstar.books?.length > 0) || hasFilmLinks
  const hasMatches = isWrestler && (superstar.total_matches > 0)

  // Fetch role counts to determine which tabs to show
  useEffect(() => {
    fetch(`/api/superstar-role-counts?superstarId=${superstar.id}`)
      .then(r => r.json())
      .then(d => setRoleCounts(d))
      .catch(() => {})
  }, [superstar.id])

  const rc = roleCounts

  const tabs = [
    { id: 'profile', label: 'Profile', show: true },
    { id: 'matches', label: 'Matches', show: hasMatches, count: superstar.total_matches },
    { id: 'championships', label: 'Championships', show: (rc?.championships || superstar.total_reigns || 0) > 0, count: rc?.championships || superstar.total_reigns },
    { id: 'omgMoments', label: '⚡ OMG Moments', show: (rc?.omgMoments || 0) > 0, count: rc?.omgMoments },
    { id: 'tagTeams', label: 'Tag Teams', show: (rc?.tagTeams || 0) > 0, count: rc?.tagTeams },
    { id: 'stables', label: 'Stables', show: (rc?.stables || 0) > 0, count: rc?.stables },
    { id: 'segments', label: 'Segments', show: (rc?.segments || 0) > 0, count: rc?.segments },
    { id: 'managed', label: 'Manager', show: (rc?.managed || 0) > 0, count: rc?.managed },
    { id: 'commentated', label: 'Commentator', show: (rc?.commentated || 0) > 0, count: rc?.commentated },
    { id: 'matchCommentated', label: 'Guest Commentary', show: (rc?.matchCommentated || 0) > 0, count: rc?.matchCommentated },
    { id: 'ringAnnounced', label: 'Ring Announcer', show: (rc?.ringAnnounced || 0) > 0, count: rc?.ringAnnounced },
    { id: 'refereed', label: 'Referee', show: (rc?.refereed || 0) > 0, count: rc?.refereed },
    { id: 'guestRefereed', label: 'Guest Referee', show: (rc?.guestRefereed || 0) > 0, count: rc?.guestRefereed },
    { id: 'interviewed', label: 'Interviewer', show: (rc?.interviewed || 0) > 0, count: rc?.interviewed },
    { id: 'gmTenures', label: 'General Manager', show: (rc?.gmTenures || 0) > 0, count: rc?.gmTenures },
    { id: 'execTenures', label: 'Executive', show: (rc?.execTenures || 0) > 0, count: rc?.execTenures },
    { id: 'timeline', label: 'Timeline', show: superstar.timeline?.length > 0 },
    { id: 'moves', label: 'Moves', show: isWrestler && superstar.finishers?.length > 0 },
    { id: 'media', label: 'Books & Films', show: hasBooksOrFilms },
  ].filter(t => t.show)

  const ROLE_TABS = ['segments', 'managed', 'commentated', 'matchCommentated', 'ringAnnounced', 'refereed', 'guestRefereed', 'interviewed', 'gmTenures', 'execTenures']

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Tab navigation — sticky, scrollable */}
      <div className="sticky top-[72px] z-30 bg-bg-primary/90 backdrop-blur-md border-b border-border-subtle/50">
        <div className="px-4 sm:px-6 lg:px-8 flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`relative px-3 sm:px-5 py-4 text-xs sm:text-sm font-body font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeTab === tab.id ? 'text-neon-blue' : 'text-text-secondary hover:text-text-white'
              }`}>
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  activeTab === tab.id ? 'bg-neon-blue/20 text-neon-blue' : 'bg-bg-tertiary text-text-secondary'
                }`}>
                  {tab.count > 999 ? `${(tab.count / 1000).toFixed(1)}k` : tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-neon-blue shadow-[0_0_8px_rgba(199,160,90,0.5)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {activeTab === 'profile' && <TabProfile superstar={superstar} />}
        {activeTab === 'matches' && <TabMatches superstar={superstar} />}
        {activeTab === 'championships' && <TabChampionships superstar={superstar} />}
        {activeTab === 'omgMoments' && <TabOMGMoments superstar={superstar} />}
        {activeTab === 'tagTeams' && <TabTagTeams superstar={superstar} />}
        {activeTab === 'stables' && <TabStables superstar={superstar} />}
        {activeTab === 'timeline' && <TabTimeline superstar={superstar} />}
        {activeTab === 'moves' && <TabMoves superstar={superstar} />}
        {activeTab === 'media' && <TabMedia superstar={superstar} />}
        {ROLE_TABS.includes(activeTab) && <TabRoleData superstar={superstar} tab={activeTab} />}
      </div>
    </div>
  )
}
