# 🏟️ Pinfall Data

**The Ultimate WWE Statistics Database**

Every superstar. Every match. Every moment. From 1953 to today.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Styling:** Tailwind CSS
- **Translations:** next-intl
- **Language:** TypeScript

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- A [Supabase](https://supabase.com) project (with the schema already applied)
- A [Vercel](https://vercel.com) account connected to GitHub

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/pinfall-data.git
cd pinfall-data
npm install
```

### 2. Configure environment

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase project URL and anon key.
Find these in: **Supabase → Settings → API**

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Deploy to Vercel

Push to GitHub, then import the project on Vercel:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your `pinfall-data` repository
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy!

## Project Structure

```
pinfall-data/
├── messages/           # Translation files (JSON)
│   └── en/
│       └── common.json
├── public/             # Static assets (logo, etc.)
├── src/
│   ├── app/            # Next.js App Router pages
│   │   ├── layout.tsx  # Root layout (fonts, metadata, header/footer)
│   │   ├── page.tsx    # Home page
│   │   ├── superstars/
│   │   ├── matches/
│   │   ├── shows/
│   │   └── ...
│   ├── components/
│   │   ├── layout/     # Header, Footer
│   │   └── ui/         # Reusable UI components
│   ├── lib/            # Supabase client, utilities
│   ├── styles/         # Global CSS
│   └── types/          # TypeScript types
├── tailwind.config.ts  # Design tokens (colors, fonts, animations)
└── next.config.js      # Next.js + next-intl config
```

## License

This is a fan-made project. All WWE multimedia content belongs to WWE.
