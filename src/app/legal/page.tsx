import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Legal Notice',
  description: 'Legal notice for Pinfall Data.',
  robots: { index: false, follow: false },
}

const SECTIONS = [
  {
    title: 'Site publisher',
    items: [
      { label: 'Name', value: '[YOUR_FULL_NAME]' },
      { label: 'Status', value: 'Auto-entrepreneur (sole trader)' },
      { label: 'SIRET', value: '[YOUR_SIRET — available after auto-entrepreneur registration]' },
      { label: 'City', value: '[YOUR_CITY], France' },
      { label: 'Email', value: '[YOUR_EMAIL]', isEmail: true },
    ],
  },
  {
    title: 'Hosting provider',
    items: [
      { label: 'Company', value: 'Vercel Inc.' },
      { label: 'Address', value: '440 N Barranca Ave #4133, Covina, CA 91723, USA' },
      { label: 'Website', value: 'https://vercel.com', isLink: true },
    ],
  },
  {
    title: 'Database',
    items: [
      { label: 'Provider', value: 'Supabase Inc.' },
      { label: 'Address', value: '970 Toa Payoh North, Singapore 318992' },
      { label: 'Website', value: 'https://supabase.com', isLink: true },
    ],
  },
]

export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 lg:py-16">

      {/* Header */}
      <div className="mb-10">
        <p className="text-text-secondary text-sm mb-2">Mandatory under French law (Loi pour la Confiance dans l'Économie Numérique)</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-white mb-4">
          Legal <span className="text-neon-blue">Notice</span>
        </h1>
        <div className="h-[2px] bg-gradient-to-r from-neon-blue via-neon-blue/30 to-transparent" />
      </div>

      <div className="space-y-8">

        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-lg font-bold text-text-white mb-4">{section.title}</h2>
            <div className="rounded-xl border border-border-subtle/30 overflow-hidden">
              {section.items.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-5 py-3.5 ${
                    i % 2 === 0 ? 'bg-bg-secondary/20' : 'bg-bg-secondary/5'
                  } ${i !== 0 ? 'border-t border-border-subtle/20' : ''}`}
                >
                  <span className="text-text-secondary text-xs sm:w-28 shrink-0">{item.label}</span>
                  {'isEmail' in item && item.isEmail ? (
                    <a href={`mailto:${item.value}`} className="text-neon-blue text-sm hover:underline">
                      {item.value}
                    </a>
                  ) : 'isLink' in item && item.isLink ? (
                    <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-neon-blue text-sm hover:underline">
                      {item.value} ↗
                    </a>
                  ) : (
                    <span className="text-text-white text-sm">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Intellectual property */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">Intellectual property</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            The structure, design, and original content of Pinfall Data are protected under French and international
            copyright law. The WWE name, logos, and all related intellectual property are the exclusive property of
            World Wrestling Entertainment, Inc. (WWE). Pinfall Data is an independent fan statistics site and is not
            affiliated with, endorsed by, or sponsored by WWE.
          </p>
        </section>

        {/* Disclaimer */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">Disclaimer</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Pinfall Data strives to maintain accurate and up-to-date statistical information. However, we make no
            warranty, express or implied, regarding the completeness or accuracy of the data presented. The publisher
            shall not be liable for any errors, omissions, or consequences arising from the use of this information.
          </p>
        </section>

        {/* Applicable law */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">Applicable law</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            This site is governed by French law. Any disputes relating to the use of this site shall be subject to the
            exclusive jurisdiction of French courts.
          </p>
        </section>

        {/* Links */}
        <div className="pt-4 border-t border-border-subtle/30 flex flex-wrap gap-4 text-sm">
          <Link href="/privacy-policy" className="text-neon-blue hover:underline">
            Privacy Policy →
          </Link>
          <Link href="/" className="text-text-secondary hover:text-neon-blue transition-colors">
            ← Back to Pinfall Data
          </Link>
        </div>

      </div>
    </div>
  )
}
