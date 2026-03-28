import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Pinfall Data — how we handle your data.',
  robots: { index: false, follow: false },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 lg:py-16">

      {/* Header */}
      <div className="mb-10">
        <p className="text-text-secondary text-sm mb-2">Last updated: June 2025</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-white mb-4">
          Privacy <span className="text-neon-blue">Policy</span>
        </h1>
        <div className="h-[2px] bg-gradient-to-r from-neon-blue via-neon-blue/30 to-transparent" />
      </div>

      <div className="space-y-8 text-text-secondary text-sm leading-relaxed">

        {/* 1 */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">1. Who we are</h2>
          <p>
            Pinfall Data (<strong className="text-text-white">pinfalldata.com</strong>) is an independent WWE statistics
            database operated by{' '}
            <strong className="text-text-white">[YOUR_FULL_NAME]</strong>, registered auto-entrepreneur based in{' '}
            <strong className="text-text-white">[YOUR_CITY], France</strong>.
          </p>
          <p className="mt-2">
            Contact:{' '}
            <a href="mailto:[YOUR_EMAIL]" className="text-neon-blue hover:underline">
              [YOUR_EMAIL]
            </a>
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">2. Data we collect</h2>
          <p>Pinfall Data does not require registration or login. We do not collect or store any personal information directly.</p>
          <p className="mt-2">However, the following third-party services may collect data automatically:</p>
          <ul className="mt-3 space-y-2 list-none pl-0">
            {[
              { name: 'Vercel Analytics', what: 'Anonymous page-view data (no personal identifiers)', link: 'https://vercel.com/legal/privacy-policy' },
              { name: 'Vercel Speed Insights', what: 'Core Web Vitals performance metrics', link: 'https://vercel.com/legal/privacy-policy' },
              { name: 'Google AdSense', what: 'Advertising cookies to serve relevant ads (with your consent)', link: 'https://policies.google.com/privacy' },
              { name: 'Supabase', what: 'Database hosting — no personal data is stored in our database', link: 'https://supabase.com/privacy' },
            ].map((item) => (
              <li key={item.name} className="flex gap-3 p-3 rounded-lg border border-border-subtle/30 bg-bg-secondary/20">
                <span className="text-neon-blue mt-0.5">›</span>
                <div>
                  <span className="text-text-white font-medium">{item.name}</span>
                  <span className="mx-2 text-border-subtle">—</span>
                  {item.what}.{' '}
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:underline text-xs">
                    Privacy policy ↗
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">3. Cookies</h2>
          <p>We use the following types of cookies:</p>
          <div className="mt-3 overflow-hidden rounded-lg border border-border-subtle/30">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border-subtle/30 bg-bg-secondary/40">
                  <th className="text-left px-4 py-3 text-text-white font-medium">Cookie</th>
                  <th className="text-left px-4 py-3 text-text-white font-medium">Purpose</th>
                  <th className="text-left px-4 py-3 text-text-white font-medium">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/20">
                <tr>
                  <td className="px-4 py-3 text-neon-blue font-mono">NEXT_LOCALE</td>
                  <td className="px-4 py-3">Remembers your language preference</td>
                  <td className="px-4 py-3">1 year</td>
                </tr>
                <tr className="bg-bg-secondary/10">
                  <td className="px-4 py-3 text-neon-blue font-mono">pd_cookie_consent</td>
                  <td className="px-4 py-3">Stores your cookie consent choice</td>
                  <td className="px-4 py-3">1 year</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-neon-blue font-mono">Google AdSense</td>
                  <td className="px-4 py-3">Advertising personalisation (only with consent)</td>
                  <td className="px-4 py-3">Up to 13 months</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            You can withdraw your consent at any time by clicking <strong className="text-text-white">"Manage cookies"</strong> in the footer, or by clearing your browser cookies.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">4. Legal basis for processing (GDPR)</h2>
          <ul className="space-y-2">
            {[
              { basis: 'Legitimate interest', for: 'Anonymous analytics to improve site performance' },
              { basis: 'Consent', for: 'Advertising cookies (Google AdSense) — only after you accept' },
            ].map((item) => (
              <li key={item.basis} className="flex gap-2">
                <span className="text-neon-blue">›</span>
                <span><strong className="text-text-white">{item.basis}</strong> — {item.for}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">5. Data sharing</h2>
          <p>
            We do not sell, trade, or rent your personal data to third parties. Data may be shared only with the service
            providers listed in Section 2, strictly for the purposes described, and subject to their own privacy policies.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">6. Your rights (GDPR)</h2>
          <p>As a user located in the European Union, you have the right to:</p>
          <ul className="mt-2 space-y-1">
            {['Access your data', 'Correct inaccurate data', 'Request deletion of your data', 'Object to processing', 'Data portability', 'Lodge a complaint with the CNIL (France)'].map((right) => (
              <li key={right} className="flex gap-2">
                <span className="text-neon-blue">›</span>
                <span>{right}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3">
            To exercise your rights, contact us at{' '}
            <a href="mailto:[YOUR_EMAIL]" className="text-neon-blue hover:underline">[YOUR_EMAIL]</a>.
            We will respond within 30 days.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">7. Data retention</h2>
          <p>
            Since we do not directly collect personal data, no retention period applies on our end. Anonymous analytics
            data retained by Vercel follows their own retention policy (90 days for Speed Insights).
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">8. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. The date at the top of this page indicates the last
            revision. Continued use of the site after changes constitutes acceptance.
          </p>
        </section>

        {/* Back link */}
        <div className="pt-4 border-t border-border-subtle/30">
          <Link href="/" className="text-neon-blue hover:underline text-sm">
            ← Back to Pinfall Data
          </Link>
        </div>

      </div>
    </div>
  )
}
