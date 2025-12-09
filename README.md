# Learn More Platform

A comprehensive online education platform for middle school students.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui
- **Database:** Supabase (PostgreSQL) + Prisma ORM
- **State Management:** Zustand
- **Validation:** Zod

## Getting Started

1. **Clone the repository**

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**
   Copy `.env.example` to `.env.local` and fill in your Supabase credentials.

   ```bash
   cp .env.example .env.local
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

## Environment Variables

See `.env.example` for the required environment variables:

- `DATABASE_URL`: Connection string for Prisma
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key (Server-side only)
