import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { createExpense } from '../../lib/mutations'
import { fetchGroup } from '../../lib/queries'
import { useState, useEffect } from 'react'
import * as React from 'react'

export const Route = createFileRoute('/_authed/groups/$groupId/expenses/new')({
  loader: async ({ params }) => {
    const group = await fetchGroup({ data: params.groupId })
    return { group }
  },
  component: CreateExpense,
})

function CreateExpense() {
  const { group } = Route.useLoaderData()
  const { groupId } = Route.useParams()
  const navigate = useNavigate()
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const members = group.members?.map(m => m.profile).filter(Boolean) || []

  const form = useForm({
    defaultValues: {
      description: '',
      amount: 0,
      paid_by: '',
      expense_date: '', // Initialize as empty to avoid hydration mismatch
      category: 'other' as const,
      split_type: 'equal' as const,
      notes: '',
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      setError(null)
      try {
        await createExpense({
          data: {
            ...value,
            groupId,
            participants: selectedParticipants.length > 0 ? selectedParticipants : members.map(m => m!.id),
          },
        })
        await navigate({ to: '/groups/$groupId', params: { groupId } })
      } catch (err) {
        setError('Failed to create expense')
        console.error('Failed to create expense:', err)
        setIsSubmitting(false)
      }
    },
  })

  // Set default date on mount to avoid hydration mismatch
  React.useEffect(() => {
    if (!form.state.values.expense_date) {
      form.setFieldValue('expense_date', new Date().toISOString().split('T')[0])
    }
  }, [form])

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-gradient">Add Expense</h1>
        <p className="text-muted-foreground mt-2">Log a new expense for <span className="text-foreground font-bold">{group.name}</span>.</p>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault()
          await form.handleSubmit()
        }}
        className="bg-card border rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 space-y-8">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-xl font-bold text-sm border border-destructive/20 animate-in shake-in duration-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <form.Field name="description">
                {(field) => (
                  <div className="space-y-2 group">
                    <label htmlFor="description" className="block text-xs font-black uppercase tracking-widest text-foreground/60 transition-colors group-focus-within:text-primary">
                      Description *
                    </label>
                    <input
                      id="description"
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-lg font-bold"
                      placeholder="e.g., Dinner at restaurant"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-destructive text-xs font-bold mt-1">{String(field.state.meta.errors[0])}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="amount">
                {(field) => (
                  <div className="space-y-2 group">
                    <label htmlFor="amount" className="block text-xs font-black uppercase tracking-widest text-foreground/60 transition-colors group-focus-within:text-primary">
                      Amount *
                    </label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground">$</span>
                       <input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(parseFloat(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-2xl font-black"
                        placeholder="0.00"
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-destructive text-xs font-bold mt-1">{String(field.state.meta.errors[0])}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="paid_by">
                {(field) => (
                  <div className="space-y-2 group">
                    <label htmlFor="paid_by" className="block text-xs font-black uppercase tracking-widest text-foreground/60 transition-colors group-focus-within:text-primary">
                      Paid by *
                    </label>
                    <div className="relative">
                      <select
                        id="paid_by"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-bold appearance-none"
                      >
                        <option value="">Select member</option>
                        {members.map((member) => (
                          <option key={member!.id} value={member!.id}>
                            {member!.display_name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground font-black text-xs">↓</div>
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-destructive text-xs font-bold mt-1">{String(field.state.meta.errors[0])}</p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>

            <div className="space-y-6">
               <form.Field name="expense_date">
                {(field) => (
                  <div className="space-y-2 group">
                    <label htmlFor="expense_date" className="block text-xs font-black uppercase tracking-widest text-foreground/60 transition-colors group-focus-within:text-primary">
                      Date
                    </label>
                    <input
                      id="expense_date"
                      type="date"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-bold"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="category">
                {(field) => (
                  <div className="space-y-2 group">
                    <label htmlFor="category" className="block text-xs font-black uppercase tracking-widest text-foreground/60 transition-colors group-focus-within:text-primary">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        id="category"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value as any)}
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none font-bold"
                      >
                        <option value="food">🍱 Food</option>
                        <option value="transport">🚗 Transport</option>
                        <option value="accommodation">🏠 Accommodation</option>
                        <option value="entertainment">🎬 Entertainment</option>
                        <option value="utilities">⚡ Utilities</option>
                        <option value="other">📦 Other</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground font-black text-xs">↓</div>
                    </div>
                  </div>
                )}
              </form.Field>

              <form.Field name="split_type">
                {(field) => (
                  <div className="space-y-2 group">
                    <label htmlFor="split_type" className="block text-xs font-black uppercase tracking-widest text-foreground/60 transition-colors group-focus-within:text-primary">
                      Split Type
                    </label>
                    <div className="relative">
                      <select
                        id="split_type"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value as any)}
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none font-bold"
                      >
                        <option value="equal">⚖️ Equal</option>
                        <option value="unequal">📏 Unequal</option>
                        <option value="percentage">📈 Percentage</option>
                        <option value="shares">🔢 Shares</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground font-black text-xs">↓</div>
                    </div>
                  </div>
                )}
              </form.Field>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-black uppercase tracking-widest text-foreground/60">
              Participants
            </label>
            <div className="bg-muted/10 border rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <label 
                  key={member!.id} 
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedParticipants.includes(member!.id) ? 'bg-primary/10 border-primary shadow-sm' : 'bg-background hover:border-border hover:bg-muted/30'}`}
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(member!.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedParticipants([...selectedParticipants, member!.id])
                        } else {
                          setSelectedParticipants(selectedParticipants.filter(id => id !== member!.id))
                        }
                      }}
                      className="size-5 rounded border-border text-primary focus:ring-primary transition-all cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{member!.display_name}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{member!.email}</span>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
              {selectedParticipants.length === 0 ? 'Selected all group members by default' : `Selected ${selectedParticipants.length} out of ${members.length} members`}
            </p>
          </div>

          <form.Field name="notes">
            {(field) => (
              <div className="space-y-2 group">
                <label htmlFor="notes" className="block text-xs font-black uppercase tracking-widest text-foreground/60 transition-colors group-focus-within:text-primary">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base min-h-[100px]"
                  placeholder="Any details you want to remember..."
                />
              </div>
            )}
          </form.Field>
        </div>

        <div className="bg-muted/30 px-8 py-6 flex flex-col sm:flex-row gap-4 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary text-primary-foreground px-8 py-4 rounded-full font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
          >
            {isSubmitting ? 'Recording...' : 'Add Expense'}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: '/groups/$groupId', params: { groupId } })}
            className="px-8 py-4 bg-background border border-border rounded-full font-bold hover:bg-muted transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
