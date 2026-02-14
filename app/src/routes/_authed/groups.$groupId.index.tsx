import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchGroup, fetchExpenses } from '../../lib/queries'
import { formatCurrency } from '../../utils/calculations'
import { format } from 'date-fns'

export const Route = createFileRoute('/_authed/groups/$groupId/')({
  loader: async ({ params }) => {
    const [group, expenses] = await Promise.all([
      fetchGroup({ data: params.groupId }),
      fetchExpenses({ data: params.groupId }),
    ])
    return { group, expenses }
  },
  component: GroupDetail,
})

function GroupDetail() {
  const { group, expenses } = Route.useLoaderData()
  const { groupId } = Route.useParams()

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div className="space-y-4">
        <Link to="/groups" className="text-primary hover:text-primary-600 font-medium flex items-center gap-1 transition-colors">
          <span>←</span> Back to Groups
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gradient">{group.name}</h1>
            {group.description && (
              <p className="text-muted-foreground mt-1 max-w-2xl">{group.description}</p>
            )}
          </div>
          <Link
            to="/groups/$groupId/expenses/new"
            params={{ groupId }}
            className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all text-center"
          >
            + Add Expense
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <h3 className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Total Spent</h3>
          <p className="text-3xl font-black mt-2 text-primary group-hover:scale-105 transition-transform origin-left">
            {formatCurrency(totalSpent, group.currency)}
          </p>
        </div>
        
        <div className="bg-card border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <h3 className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Members</h3>
          <p className="text-3xl font-black mt-2 group-hover:scale-105 transition-transform origin-left">
            {group.members?.length || 0}
          </p>
        </div>
        
        <div className="bg-card border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <h3 className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Expenses</h3>
          <p className="text-3xl font-black mt-2 group-hover:scale-105 transition-transform origin-left">
            {expenses.length}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-card border rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
        <div className="border-b bg-muted/30 px-6">
          <nav className="flex gap-8">
            <TabLink to="/groups/$groupId" params={{ groupId }} label="Expenses" active />
            <TabLink to="/groups/$groupId/balances" params={{ groupId }} label="Balances" />
            <TabLink to="/groups/$groupId/members" params={{ groupId }} label="Members" />
          </nav>
        </div>

        <div className="p-0 sm:p-6">
          {expenses.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div className="size-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                💸
              </div>
              <h3 className="text-2xl font-bold mb-2">No expenses yet</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Keep track of who paid for what. Add your first shared expense to see how it works!
              </p>
              <Link
                to="/groups/$groupId/expenses/new"
                params={{ groupId }}
                className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all"
              >
                Add Your First Expense
              </Link>
            </div>
          ) : (
            <div className="divide-y border-t sm:border-t-0">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 sm:p-6 hover:bg-muted/30 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="size-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-xs uppercase flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      {expense.category?.[0] || 'O'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{expense.description}</h4>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-sm text-muted-foreground mt-1 font-medium">
                        <span className="flex items-center gap-1">
                          <span className="opacity-60">Paid by</span> 
                          <span className="text-foreground font-semibold">{expense.payer?.display_name || 'System'}</span>
                        </span>
                        <span className="size-1 bg-muted-foreground/30 rounded-full" />
                        <span>{format(new Date(expense.expense_date), 'MMM d, yyyy')}</span>
                        {expense.category && (
                          <>
                            <span className="size-1 bg-muted-foreground/30 rounded-full" />
                            <span className="bg-primary/5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">{expense.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-black text-xl text-foreground">
                      {formatCurrency(expense.amount, group.currency)}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                      {expense.splits?.length || 0} {expense.splits?.length === 1 ? 'participant' : 'participants'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TabLink({ to, params, label, active = false }: { to: string; params: any; label: string; active?: boolean }) {
  return (
    <Link
      to={to}
      params={params}
      activeProps={{ className: '!border-primary !text-foreground' }}
      className={`py-5 border-b-2 border-transparent text-sm font-bold text-muted-foreground transition-all px-1 hover:text-foreground ${active ? 'border-primary text-foreground' : ''}`}
    >
      {label}
    </Link>
  )
}
