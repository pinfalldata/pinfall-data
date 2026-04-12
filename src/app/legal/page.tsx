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
      { label: 'Name', value: 'Alexis BERSWEILER' },
      { label: 'Trade name', value: 'Pinfall Data' },
      { label: 'Status', value: 'Entreprise individuelle' },
      { label: 'SIREN', value: '103 073 946' },
      { label: 'SIRET', value: '103 073 946 00016' },
      { label: 'Activity', value: 'Activités des agences de publicité (NAF 7311Z)' },
      { label: 'RCS', value: 'Marseille' },
      { label: 'Address', value: '11 Boulevard Tellene, 13007 Marseille, France' },
      { label: 'Email', value: 'pinfalldata@gmail.com', isEmail: true },
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

        {/* Fan project statement */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">Fan project &amp; non-commercial purpose</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Pinfall Data is a <strong className="text-text-white">personal passion project</strong> created by a fan
            of professional wrestling. This website is built for educational and entertainment purposes only, aiming to
            compile, organise, and present publicly available statistical data about WWE events, matches, and performers.
            This is <strong className="text-text-white">not</strong> a commercial exploitation of WWE content — it is
            a non-official fan resource dedicated to the history and statistics of professional wrestling.
          </p>
        </section>

        {/* Intellectual property */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">Intellectual property &amp; WWE trademark notice</h2>
          <div className="text-text-secondary text-sm leading-relaxed space-y-3">
            <p>
              <strong className="text-text-white">All WWE-related intellectual property belongs exclusively to WWE.</strong>{' '}
              This includes, but is not limited to:
            </p>
            <ul className="space-y-1.5 pl-1">
              {[
                'The names "WWE", "World Wrestling Entertainment", "WCW", "ECW", "NXT", and all associated brand names',
                'All wrestler names, ring names, likenesses, characters, personas, and catchphrases',
                'All logos, trademarks, service marks, and trade dress',
                'All photographs, images, video footage, and promotional materials',
                'All event names (WrestleMania, Royal Rumble, SummerSlam, Survivor Series, etc.)',
                'All championship belt designs and names',
                'All entrance music, theme songs, and audio content',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-neon-blue shrink-0">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              These are the <strong className="text-text-white">exclusive property of World Wrestling Entertainment, Inc.</strong>{' '}
              (now TKO Group Holdings, Inc.) and/or their respective owners. Pinfall Data claims{' '}
              <strong className="text-text-white">no ownership whatsoever</strong> over any of the above.
            </p>
            <p>
              Any images, video thumbnails, or media displayed on this website are used solely for identification
              and informational purposes in the context of reporting statistics and historical facts. They remain
              the property of WWE and/or their respective copyright holders. If any rights holder wishes to have
              content removed, please contact us at{' '}
              <a href="mailto:pinfalldata@gmail.com" className="text-neon-blue hover:underline">pinfalldata@gmail.com</a>{' '}
              and we will promptly comply.
            </p>
            <p>
              The <strong className="text-text-white">original elements</strong> of Pinfall Data — including its code,
              database structure, visual design, custom graphics, and original written commentary — are protected under
              French and international copyright law (Code de la propriété intellectuelle).
            </p>
          </div>
        </section>

        {/* Non-affiliation */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">Non-affiliation statement</h2>
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
            <p className="text-text-secondary text-sm leading-relaxed">
              <strong className="text-amber-400">⚠ Important:</strong>{' '}
              Pinfall Data is <strong className="text-text-white">not affiliated with, endorsed by, sponsored by,
              or in any way officially connected to</strong> World Wrestling Entertainment, Inc. (WWE), TKO Group
              Holdings, Inc., or any of their subsidiaries, partners, or affiliates. All WWE-related content is used
              under fair use principles for informational, statistical, and commentary purposes. Any resemblance to
              an official WWE product is unintentional.
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">Disclaimer</h2>
          <div className="text-text-secondary text-sm leading-relaxed space-y-3">
            <p>
              Pinfall Data strives to maintain accurate and up-to-date statistical information. However, we make no
              warranty, express or implied, regarding the completeness or accuracy of the data presented. The publisher
              shall not be liable for any errors, omissions, or consequences arising from the use of this information.
            </p>
            <p>
              Statistics, match results, and historical data are compiled from publicly available sources and may
              contain inaccuracies. Users are encouraged to verify critical information through official WWE sources.
            </p>
          </div>
        </section>

        {/* DMCA / Takedown */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">Content removal requests</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            If you are a rights holder and believe that any content on Pinfall Data infringes your intellectual
            property rights, please contact us at{' '}
            <a href="mailto:pinfalldata@gmail.com" className="text-neon-blue hover:underline">pinfalldata@gmail.com</a>{' '}
            with a description of the content in question. We are committed to respecting intellectual property
            rights and will remove or modify any infringing content as quickly as possible, typically within 48 hours.
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
