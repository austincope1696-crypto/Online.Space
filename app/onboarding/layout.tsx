// Server layout — prevents static pre-rendering at build time.
// Env vars are only needed at request time (Vercel runtime).
export const dynamic = 'force-dynamic'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
