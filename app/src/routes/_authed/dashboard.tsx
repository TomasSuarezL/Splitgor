import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-gradient">Dashboard</h1>
        <p className="text-muted-foreground mt-2 font-medium">Overview of your shared finances and group activity.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
          <h3 className="text-muted-foreground text-xs font-black uppercase tracking-widest">Total Balance</h3>
          <p className="text-4xl font-black mt-3 text-primary group-hover:scale-105 transition-transform origin-left tracking-tighter">$0.00</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-muted-foreground">
             <span className="size-2 rounded-full bg-primary/30 animate-pulse" />
             Settled up
          </div>
        </div>
        
        <div className="bg-card border p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
          <h3 className="text-muted-foreground text-xs font-black uppercase tracking-widest">Active Groups</h3>
          <p className="text-4xl font-black mt-3 group-hover:scale-105 transition-transform origin-left tracking-tighter">0</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-muted-foreground">
             Across all currencies
          </div>
        </div>
        
        <div className="bg-card border p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
          <h3 className="text-muted-foreground text-xs font-black uppercase tracking-widest">Pending Settlements</h3>
          <p className="text-4xl font-black mt-3 group-hover:scale-105 transition-transform origin-left tracking-tighter">0</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-muted-foreground">
             Awaiting confirmation
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black tracking-tight">Recent Activity</h2>
            <button className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary-600 transition-colors">View All Activity</button>
          </div>
          <div className="text-center py-20 bg-muted/10 rounded-2xl border border-dashed">
            <div className="size-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
              📭
            </div>
            <p className="text-muted-foreground font-bold italic">No recent activity found. Start a group to see expenses here!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
