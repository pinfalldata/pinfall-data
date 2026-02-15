import Image from 'next/image'
import { getStatusColor, getStatusLabel, getRoleLabels } from '@/lib/utils'

interface ProfileHeroProps {
  superstar: any
}

export function ProfileHero({ superstar }: ProfileHeroProps) {
  const primaryNickname = superstar.nicknames?.find((n: any) => n.is_primary)?.nickname
  const statusColor = getStatusColor(superstar.status)

  return (
    <section className="relative overflow-hidden">
      {/* Banner background */}
      <div className="relative h-[280px] sm:h-[320px] lg:h-[380px]">
        {/* Background: banner image or gradient */}
        {superstar.banner_url ? (
          <Image
            src={superstar.banner_url}
            alt=""
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-bg-tertiary via-bg-secondary to-bg-primary" />
        )}

        {/* Decorative glow effects */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-neon-blue/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-neon-pink/6 rounded-full blur-[80px]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid opacity-20" />

        {/* Gradient fade to content below */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg-primary to-transparent" />
      </div>

      {/* Content overlay: Photo + Info */}
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 -mt-40 sm:-mt-44 lg:-mt-52 pb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 lg:gap-8">
          {/* Photo */}
          <div className="relative shrink-0 z-10">
            <div className="w-36 h-36 sm:w-44 sm:h-44 lg:w-56 lg:h-56 rounded-2xl overflow-hidden border-2 border-neon-blue/30 bg-bg-tertiary shadow-neon-blue">
              {superstar.photo_url ? (
                <Image
                  src={superstar.photo_url}
                  alt={superstar.name}
                  width={224}
                  height={224}
                  className="w-full h-full object-cover object-top"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-bg-tertiary">
                  <svg className="w-16 h-16 text-border-subtle" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Status badge */}
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              superstar.status === 'active'
                ? 'bg-status-success/20 border-status-success/40 text-status-success'
                : superstar.status === 'deceased'
                  ? 'bg-bg-tertiary border-border-subtle text-text-secondary'
                  : 'bg-status-warning/20 border-status-warning/40 text-status-warning'
            }`}>
              {getStatusLabel(superstar.status)}
            </div>
          </div>

          {/* Name + meta info */}
          <div className="text-center sm:text-left pb-2 z-10">
            {/* Brand + Role */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              {superstar.current_brand && (
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                  superstar.current_brand === 'Raw'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : superstar.current_brand === 'SmackDown'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {superstar.current_brand}
                </span>
              )}
              <span className="text-text-secondary text-sm">
                {getRoleLabels(superstar).join(' · ')}
              </span>
              {superstar.is_hall_of_fame && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-neon-pink/20 text-neon-pink border border-neon-pink/30">
                  HOF
                </span>
              )}
            </div>

            {/* Primary nickname */}
            {primaryNickname && (
              <p className="text-neon-blue text-sm sm:text-base font-body italic mb-1">
                &quot;{primaryNickname}&quot;
              </p>
            )}

            {/* Name */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-6xl font-bold text-text-white tracking-tight leading-none">
              {superstar.name.toUpperCase()}
            </h1>

            {/* Real name */}
            {superstar.real_name && superstar.real_name !== superstar.name && (
              <p className="text-text-secondary text-sm mt-2">
                {superstar.real_name}
              </p>
            )}

            {/* Other nicknames */}
            {superstar.nicknames?.length > 1 && (
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                {superstar.nicknames
                  .filter((n: any) => !n.is_primary)
                  .slice(0, 4)
                  .map((n: any) => (
                    <span key={n.id} className="text-xs text-text-secondary border border-border-subtle rounded-full px-2 py-0.5">
                      {n.nickname}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Social links (right side on desktop) */}
          {superstar.socialLinks?.length > 0 && (
            <div className="hidden lg:flex items-center gap-3 ml-auto pb-4">
              {superstar.socialLinks.map((link: any) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-bg-tertiary border border-border-subtle flex items-center justify-center text-text-secondary hover:text-neon-blue hover:border-neon-blue/40 transition-all"
                  title={link.platform}
                >
                  <SocialIcon platform={link.platform} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Neon separator */}
      <div className="neon-line" />
    </section>
  )
}

function SocialIcon({ platform }: { platform: string }) {
  const className = "w-4 h-4"
  switch (platform) {
    case 'x':
      return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
    case 'instagram':
      return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
    case 'youtube':
      return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
    case 'facebook':
      return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
    case 'tiktok':
      return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
    default:
      return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
  }
}
