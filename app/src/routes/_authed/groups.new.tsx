import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { createGroup } from '../../lib/mutations'
import { useState } from 'react'
import { z } from 'zod'

export const Route = createFileRoute('/_authed/groups/new')({
  component: CreateGroup,
})

function CreateGroup() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      currency: 'ARS',
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      setError(null)
      try {
        const group = await createGroup({ data: value })
        navigate({ to: '/groups/$groupId', params: { groupId: group.id } })
      } catch (err) {
        setError('Failed to create group')
        console.error('Failed to create group:', err)
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-gradient">Create New Group</h1>
        <p className="text-muted-foreground mt-2">Set up a new space to share expenses with your crew.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="bg-card border rounded-3xl shadow-2xl p-8 space-y-6"
      >
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-xl font-bold text-sm border border-destructive/20 animate-in shake-in duration-300">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <form.Field
            name="name"
            validators={{
              onChange: z.string().min(1, 'Group name is required'),
            }}
          >
            {(field) => (
              <div className="space-y-2 group">
                <label htmlFor="name" className="block text-sm font-black uppercase tracking-widest text-foreground/70 transition-colors group-focus-within:text-primary">
                  Group Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-lg font-medium"
                  placeholder="e.g., Roommates, Trip to Paris"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-destructive text-xs font-bold mt-2">
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="space-y-2 group">
                <label htmlFor="description" className="block text-sm font-black uppercase tracking-widest text-foreground/70 transition-colors group-focus-within:text-primary">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base min-h-[120px]"
                  placeholder="What is this group for?"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="currency">
            {(field) => (
              <div className="space-y-2 group">
                <label htmlFor="currency" className="block text-sm font-black uppercase tracking-widest text-foreground/70 transition-colors group-focus-within:text-primary">
                  Currency
                </label>
                <div className="relative">
                  <select
                    id="currency"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none font-bold"
                  >
                    <option value="ARS">ARS ($)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground font-black">
                     ↓
                  </div>
                </div>
              </div>
            )}
          </form.Field>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary text-primary-foreground px-8 py-4 rounded-full font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
          >
            {isSubmitting ? 'Creating...' : 'Create Group'}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: '/groups' })}
            className="px-8 py-4 bg-muted/50 border border-border rounded-full font-bold hover:bg-muted transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
