import Link from 'next/link'

interface QuickAccessCardProps {
  title: string
  description: string
  href: string
  icon: string
  color: 'blue' | 'pink'
  index: number
}

export function QuickAccessCard({ title, description, href, icon, color, index }: QuickAccessCardProps) {
  const borderColor = color === 'blue' ? 'hover:border-neon-blue/40' : 'hover:border-neon-pink/40'
  const shadowColor = color === 'blue' ? 'hover:shadow-neon-blue' : 'hover:shadow-neon-pink'
  const textColor = color === 'blue' ? 'text-neon-blue' : 'text-neon-pink'

  return (
    <Link
      href={href}
      className={`group block glass rounded-2xl p-6 border border-border-subtle/50 ${borderColor} ${shadowColor} transition-all duration-300 hover:-translate-y-1 animate-fade-in`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className={`font-display text-lg font-bold ${textColor} mb-1 group-hover:text-glow-blue`}>
            {title}
          </h3>
          <p className="text-text-secondary text-sm font-body">
            {description}
          </p>
        </div>
      </div>

      {/* Arrow */}
      <div className="mt-4 flex justify-end">
        <svg
          className={`w-5 h-5 ${textColor} opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </Link>
  )
}
