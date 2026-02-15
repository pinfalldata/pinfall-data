'use client'

import Image from 'next/image'
import { getStatusColor, getStatusLabel, getRoleLabels } from '@/lib/utils'

export function ProfileHero({ superstar }: { superstar: any }) {
  // On récupère les infos de base
  const primaryNickname = superstar.nicknames?.find((n: any) => n.is_primary)?.nickname
  const statusClasses = getStatusColor(superstar.status)
  const roleLabels = getRoleLabels(superstar)
  const primaryEra = superstar.eras?.find((e: any) => e.is_primary)
  const eraCount = superstar.eras?.length || 0

  return (
    <section className="relative overflow-hidden">
      {/* ===== BANNER BACKGROUND ===== */}
      <div className="relative h-[300px] sm:h-[340px] lg:h-[400px]">
        {superstar.banner_url && (
          <div className="absolute inset-0">
            <Image
              src={superstar.banner_url}
              alt=""
              fill
              className="object-cover object-center opacity-20"
              priority
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-br from-bg-tertiary/90 via-bg-secondary/80 to-bg-primary/90" />
        <div className="absolute inset-0 bg-grid opacity-30 animate-grid-pulse" style={{ maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)' }} />
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-neon-blue/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-neon-pink/6 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent" />
      </div>

      {/* ===== CONTENT ===== */}
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-48 lg:-mt-56 pb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 lg:gap-8">

          {/* PHOTO - Version simplifiée sans State pour éviter les bugs de cache */}
          <div className="relative shrink-0 z-10">
            <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-60 lg:h-60 rounded-2xl overflow-hidden border-2 border-neon-blue/30 bg-bg-tertiary shadow-neon-blue relative">
              {superstar.photo_url ? (
                <Image 
                  src={superstar.photo_url} 
                  alt={superstar.name} 
                  fill 
                  sizes="(max-width: 640px) 160px, (max-width: 1024px) 192px, 240px"
                  className="object-cover object-top" 
                  priority 
                  unoptimized={true} // Force le chargement sans optimisation Next.js pour le test
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-bg-tertiary">
                  <svg className="w-20 h-20 text-border-subtle" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusClasses} z-20`}>
              {getStatusLabel(superstar.status)}
            </div>
          </div>

          {/* NAME + META */}
          <div className="text-center sm:text-left pb-2 z-10 flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 flex-wrap">
              {superstar.current_brand && (
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  superstar.current_brand === 'Raw' ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : superstar.current_brand === 'SmackDown' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                }`}>
                  {superstar.current_brand}
                </span>
              )}
              {roleLabels.length > 0 && (
                <span className="text-text-secondary text-sm">{roleLabels.join(' · ')}</span>
              )}
              {superstar.is_hall_of_fame && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neon-pink/20 text-neon-pink border border-neon-pink/30">
                  HALL OF FAME
                </span>
              )}
            </div>

            {primaryNickname && (
              <p className="text-neon-blue text-sm sm:text-base italic mb-1 font-body">
                &quot;{primaryNickname}&quot;
              </p>
            )}

            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-text-white tracking-tight leading-none">
              {superstar.name.toUpperCase()}
            </h1>

            {superstar.real_name && superstar.real_name !== superstar.name && (
              <p className="text-text-secondary text-sm mt-2">{superstar.real_name}</p>
            )}
          </div>
          
           {/* ERA BADGE */}
           <div className="hidden lg:flex flex-col items-end gap-3 pb-4 z-10 shrink-0">
            {eraCount > 0 && (
              <div className="flex flex-col items-end gap-2">
                {primaryEra && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neon-blue/20 bg-neon-blue/5">
                    {primaryEra.eras?.image_url && (
                      <Image src={primaryEra.eras.image_url} alt="" width={28} height={28} className="rounded" />
                    )}
                    <span className="text-neon-blue text-sm font-medium">{primaryEra.eras?.name || 'Era'}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="neon-line-animated neon-line-glow" />
    </section>
  )
}

function SocialIcon({ platform }: { platform: string }) {
  return null // Simplifié pour le test
}