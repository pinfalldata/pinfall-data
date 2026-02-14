import type { Metadata } from 'next'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Show #${params.id} — Full Card & Results`,
    description: `Complete card and results for WWE show #${params.id}. Every match, every result.`,
  }
}

export default function ShowDetailPage({ params }: Props) {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12 lg:py-20">
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl lg:text-4xl font-bold text-text-white mb-4">
          Show #{params.id}
        </h1>
        <div className="neon-line mt-4 max-w-md mx-auto" />
      </div>
      <div className="glass rounded-2xl p-12 border border-border-subtle text-center">
        <p className="text-text-secondary">Show detail page — data will appear once shows are imported.</p>
      </div>
    </div>
  )
}
