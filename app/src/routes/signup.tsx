import { redirect, createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { useMutation } from '../hooks/useMutation'
import { Auth } from '../components/Auth'
import { getSupabaseServerClient } from '../utils/supabase'

export const signupFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (d: { email: string; password: string; redirectUrl?: string; origin: string }) => d,
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${data.origin}/auth/confirm?next=${data.redirectUrl || '/'}`,
      },
    })
    if (error) {
      return {
        error: true,
        message: error.message,
      }
    }

    // Redirect to the prev page stored in the "redirect" search param
    throw redirect({
      href: data.redirectUrl || '/',
    })
  })

export const Route = createFileRoute('/signup')({
  component: SignupComp,
})

function SignupComp() {
  const router = useRouter()
  const signupMutation = useMutation({
    fn: useServerFn(signupFn),
  })

  return (
    <Auth
      actionText="Sign Up"
      status={signupMutation.status}
      onSubmit={(e) => {
        const formData = new FormData(e.target as HTMLFormElement)

        signupMutation.mutate({
          data: {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            origin: window.location.origin,
          },
        })
      }}
      afterSubmit={
        <div className="space-y-4">
          {signupMutation.data?.error ? (
            <div className="text-red-400">{signupMutation.data.message}</div>
          ) : null}
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={() => router.navigate({ to: '/login' })}
              className="text-primary font-bold hover:underline"
            >
              Login
            </button>
          </div>
        </div>
      }
    />
  )
}
