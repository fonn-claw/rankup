'use client'

import { useActionState } from 'react'
import { login } from '@/lib/auth/actions'
import Image from 'next/image'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null)

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg-primary">
      <Image
        src="/assets/hero-login.png"
        alt=""
        fill
        className="object-cover opacity-30"
        priority
      />
      <div className="relative z-10 w-full max-w-md p-8">
        <img src="/assets/logo.svg" alt="RankUp" className="h-8 mx-auto mb-8" />
        <form action={formAction} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-3 bg-bg-surface border border-bg-surface-hover rounded text-text-primary font-data placeholder:text-text-muted focus:outline-none focus:border-accent-cyan transition-colors"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-3 bg-bg-surface border border-bg-surface-hover rounded text-text-primary font-data placeholder:text-text-muted focus:outline-none focus:border-accent-cyan transition-colors"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 bg-accent-cyan text-bg-primary font-heading font-bold text-lg rounded hover:brightness-110 transition-all disabled:opacity-50"
          >
            {pending ? 'ENTERING...' : 'ENTER THE ARENA'}
          </button>
          {state?.error && (
            <p className="text-accent-red text-sm font-data text-center">{state.error}</p>
          )}
        </form>
      </div>
    </div>
  )
}
