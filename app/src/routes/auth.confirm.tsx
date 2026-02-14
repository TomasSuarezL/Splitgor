import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '../utils/supabase'
import { z } from 'zod'

const authConfirmSchema = z.object({
  code: z.string().optional(),
  next: z.string().optional().default('/'),
  type: z.string().optional(),
})

const exchangeCodeFn = createServerFn({ method: 'GET' })
  .inputValidator(authConfirmSchema)
  .handler(async ({ data }) => {
    const { code, next } = data
    
    if (code) {
      const supabase = getSupabaseServerClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('Error exchanging code for session:', error)
      }
    }

    throw redirect({
      href: next,
    })
  })

export const Route = createFileRoute('/auth/confirm')({
  validateSearch: (search: Record<string, unknown>) => authConfirmSchema.parse(search),
  loaderDeps: ({ search }) => ({
    code: search.code,
    next: search.next,
    type: search.type,
  }),
  loader: async ({ deps }) => {
    await exchangeCodeFn({ data: deps })
    return null
  },
})
