import type { LucideIcon } from 'lucide-react'
import { Construction } from 'lucide-react'

interface ComingSoonProps {
  title: string
  icon?: LucideIcon
}

export function ComingSoon({ title, icon: Icon = Construction }: ComingSoonProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
          <Icon className="h-8 w-8 text-[var(--primary)] animate-pulse" />
        </div>
        {/* Subtle floating dots */}
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[var(--primary)]/40 animate-ping" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">
          This feature is coming soon. Stay tuned!
        </p>
      </div>
    </div>
  )
}
