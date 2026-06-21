// Server layout — prevents static pre-rendering at build time.
export const dynamic = 'force-dynamic'

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
