'use client' // Ajoute ceci pour que l'image puisse gérer les erreurs de chargement

import Image from 'next/image'
import { useState } from 'react' // Nécessaire pour gérer l'erreur d'image
import { getStatusColor, getStatusLabel, getRoleLabels } from '@/lib/utils'

export function ProfileHero({ superstar }: { superstar: any }) {
  // On crée un état pour savoir si l'image a échoué à charger
  const [imageError, setImageError] = useState(false)

  const primaryNickname = superstar.nicknames?.find((n: any) => n.is_primary)?.nickname
  const statusClasses = getStatusColor(superstar.status)
  const roleLabels = getRoleLabels(superstar)
  const primaryEra = superstar.eras?.find((e: any) => e.is_primary)
  const eraCount = superstar.eras?.length || 0

  // Vérification de sécurité
  const hasPhoto = superstar.photo_url && !imageError

  return (
    <section className="relative overflow-hidden">
      {/* ===== BANNER BACKGROUND ===== */}
      <div className="relative h-[300px] sm:h-[340px] lg:h-[400px]">
        {superstar.banner_url ? (
          <div className="absolute inset-0">
            <Image
              src={superstar.banner_url}
              alt=""
              fill
              className="object-cover object-center opacity-20"
              priority
            />
          </div>
        ) : null}

        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg-tertiary/90 via-bg-secondary/80 to-bg-primary/90" />
        {/* Animated grid */}
        <div className="absolute inset-0 bg-grid opacity-30 animate-grid-pulse" style={{ maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)' }} />
        {/* Glow orbs */}
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-neon-blue/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-neon-pink/6 rounded-full blur-[100px]" />
        {/* Gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent" />
      </div>

      {/* ===== CONTENT: Photo + Name + Meta ===== */}
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-48 lg:-mt-56 pb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 lg:gap-8">

          {/* PHOTO */}
          <div className="relative shrink-0 z-10">
            <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-60 lg:h-60 rounded-2xl overflow-hidden border-2 border-neon-blue/30 bg-bg-tertiary shadow-neon-blue relative">
              {hasPhoto ? (
                <Image 
                  src={superstar.photo_url} 
                  alt={superstar.name} 
                  fill // Utilise 'fill' au lieu de width/height pour remplir le conteneur carré
                  sizes="(max-width: 640px) 160px, (max-width: 1024px) 192px, 240px"
                  className="object-cover object-top" 
                  priority 
                  onError={() => setImageError(true)} // Si l'image plante, on affiche le placeholder
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-bg-tertiary">
                  <svg className="w-20 h-20 text-border-subtle" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Status badge */}
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusClasses} z-20`}>
              {getStatusLabel(superstar.status)}
            </div>
          </div>

          {/* NAME + META (center) */}
          <div className="text-center sm:text-left pb-2 z-10 flex-1 min-w-0">
             {/* ... Le reste du code ne change pas ... */}
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

            {superstar.nicknames?.length > 1 && (
              <div className="flex flex-wrap gap-1.5 mt-3 justify-center sm:justify-start">
                {superstar.nicknames.filter((n: any) => !n.is_primary).slice(0, 5).map((n: any) => (
                  <span key={n.id} className="text-[11px] text-text-secondary border border-border-subtle rounded-full px-2.5 py-0.5">
                    {n.nickname}
                  </span>
                ))}
              </div>
            )}
          </div>
          
           {/* ERA BADGE (copie le reste de ton ancien fichier ici pour la partie droite) */}
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
                {eraCount > 1 && (
                  <span className="text-text-secondary text-xs">
                    {eraCount} eras
                  </span>
                )}
              </div>
            )}

            {superstar.socialLinks?.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                {superstar.socialLinks.map((link: any) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-bg-tertiary/80 border border-border-subtle flex items-center justify-center text-text-secondary hover:text-neon-blue hover:border-neon-blue/40 transition-all"
                    title={link.platform}>
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
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
  const cls = "w-4 h-4"
  switch (platform) {
    case 'x': return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
    case 'instagram': return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
    case 'youtube': return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
    default: return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
  }
}