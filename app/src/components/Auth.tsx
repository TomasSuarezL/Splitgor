export function Auth({
  actionText,
  onSubmit,
  status,
  afterSubmit,
}: {
  actionText: string
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  status: 'pending' | 'idle' | 'success' | 'error'
  afterSubmit?: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-500">
      <div className="bg-card w-full max-w-md p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-border space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-primary-500 to-primary-700" />
        
        <div className="text-center space-y-2">
          <div className="size-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-black text-3xl mx-auto shadow-xl shadow-primary/20 mb-6">
            S
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gradient">{actionText}</h1>
          <p className="text-muted-foreground text-sm font-medium">Welcome to Splitgor</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(e)
          }}
          className="space-y-6"
        >
          <div className="space-y-6">
            <div className="space-y-2 group">
              <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 transition-colors group-focus-within:text-primary">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="w-full px-4 py-4 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-bold"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2 group">
              <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 transition-colors group-focus-within:text-primary">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                className="w-full px-4 py-4 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-bold"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-muted disabled:text-muted-foreground"
            disabled={status === 'pending'}
          >
            {status === 'pending' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-2 bg-primary-foreground/50 rounded-full animate-bounce" />
                <span className="size-2 bg-primary-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="size-2 bg-primary-foreground/50 rounded-full animate-bounce [animation-delay:0.4s]" />
              </span>
            ) : actionText}
          </button>
          
          {afterSubmit && (
            <div className="pt-4 border-t text-center">
              {afterSubmit}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
