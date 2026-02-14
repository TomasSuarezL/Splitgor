import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchGroup, fetchBalances } from '../../lib/queries'
import { formatCurrency } from '../../utils/calculations'

export const Route = createFileRoute('/_authed/groups/$groupId/balances')({
  loader: async ({ params }) => {
    const [group, balanceData] = await Promise.all([
      fetchGroup({ data: params.groupId }),
      fetchBalances({ data: params.groupId }),
    ])
    return { group, balanceData }
  },
  component: GroupBalances,
})

function GroupBalances() {
  const { group, balanceData } = Route.useLoaderData()
  const { groupId } = Route.useParams()

  const balances = balanceData.balances
  const suggestions = balanceData.suggestions

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
       {/* Header */}
      <div className="space-y-4">
        <Link to="/groups/$groupId" params={{ groupId }} className="text-primary hover:text-primary-600 font-medium flex items-center gap-1 transition-colors">
          <span>←</span> Back to Expenses
        </Link>
        <h1 className="text-4xl font-bold tracking-tight text-gradient">Balances</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Member Balances */}
        <div className="bg-card border rounded-3xl shadow-xl shadow-black/5 overflow-hidden flex flex-col">
          <div className="p-6 border-b bg-muted/30">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <span>👥</span> Member Balances
            </h2>
          </div>
          <div className="p-6 flex-1">
            {balances.length === 0 ? (
              <div className="text-center py-12 opacity-50 italic">No balances to show</div>
            ) : (
              <div className="space-y-4">
                {balances.map((balance) => (
                  <div
                    key={balance.user_id}
                    className="flex items-center justify-between p-4 bg-muted/10 border rounded-2xl hover:bg-muted/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        {balance.user.display_name[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-base">{balance.user.display_name}</h3>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                          Paid: {formatCurrency(balance.paid, group.currency)} • Owed: {formatCurrency(balance.owed, group.currency)}
                        </div>
                      </div>
                    </div>
                    <div className={`text-xl font-black tracking-tighter ${
                      balance.balance > 0 ? 'text-primary' : 
                      balance.balance < 0 ? 'text-destructive' : 
                      'text-muted-foreground'
                    }`}>
                      {balance.balance > 0 && '+'}
                      {formatCurrency(balance.balance, group.currency)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Settlement Suggestions */}
        <div className="bg-card border rounded-3xl shadow-xl shadow-black/5 overflow-hidden flex flex-col">
          <div className="p-6 border-b bg-muted/30">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <span>🤝</span> Settlement Suggestions
            </h2>
          </div>
          <div className="p-6 flex-1">
            {suggestions.length === 0 ? (
              <div className="text-center py-20 bg-primary/5 rounded-2xl border border-dashed border-primary/20">
                 <div className="text-4xl mb-4">🎉</div>
                 <h3 className="font-black text-xl mb-1">All settled up!</h3>
                 <p className="text-muted-foreground text-sm font-medium">No one owes anything to anyone.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => {
                  const fromUser = balances.find(b => b.user_id === suggestion.from_user)?.user
                  const toUser = balances.find(b => b.user_id === suggestion.to_user)?.user
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-5 bg-primary/5 border border-primary/10 rounded-2xl hover:bg-primary/10 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">From</span>
                          <span className="font-bold text-foreground">{fromUser?.display_name}</span>
                        </div>
                        <div className="text-primary font-black scale-150 mx-2">→</div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">To</span>
                          <span className="font-bold text-foreground">{toUser?.display_name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                         <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-1">Amount</span>
                         <div className="font-black text-xl text-primary tracking-tighter">
                            {formatCurrency(suggestion.amount, group.currency)}
                          </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
