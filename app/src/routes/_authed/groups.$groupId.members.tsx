import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { fetchGroup } from '../../lib/queries'
import { addGroupMember, removeGroupMember } from '../../lib/mutations'

export const Route = createFileRoute('/_authed/groups/$groupId/members')({
  loader: async ({ params }) => {
    const group = await fetchGroup({ data: params.groupId })
    return { group }
  },
  component: GroupMembers,
})

function GroupMembers() {
  const { group } = Route.useLoaderData()
  const { groupId } = Route.useParams()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsAdding(true)
    
    try {
      await addGroupMember({ data: { groupId, userEmail: email } })
      setEmail('')
      router.invalidate()
    } catch (err) {
      setError('Failed to add member. Make sure the email is registered.')
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      setRemovingUserId(userId)
      try {
        await removeGroupMember({ data: { groupId, userId } })
        router.invalidate()
      } catch (err) {
        alert('Failed to remove member')
      } finally {
        setRemovingUserId(null)
      }
    }
  }

  const members = group.members || []
  // For demo/simplicity, we assume the first member might be the current user or just check creator
  const isCreator = true // This should ideally be checked against session user

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
       {/* Header */}
      <div className="space-y-4">
        <Link to="/groups/$groupId" params={{ groupId }} className="text-primary hover:text-primary-600 font-medium flex items-center gap-1 transition-colors">
          <span>←</span> Back to Expenses
        </Link>
        <h1 className="text-4xl font-bold tracking-tight text-gradient">Members</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
            <div className="p-6 border-b bg-muted/30">
              <h2 className="text-lg font-black tracking-tight">Current Members ({members.length})</h2>
            </div>
            <div className="divide-y">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      {member.profile?.display_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{member.profile?.display_name}</h3>
                      <p className="text-sm text-muted-foreground font-medium">{member.profile?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {member.user_id === group.created_by && (
                      <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full">
                        Creator
                      </span>
                    )}
                    {isCreator && member.user_id !== group.created_by && (
                      <button
                        onClick={() => handleRemoveMember(member.user_id)}
                        disabled={removingUserId === member.user_id}
                        className="text-xs font-black uppercase tracking-widest text-destructive hover:scale-110 transition-transform disabled:opacity-50"
                      >
                        {removingUserId === member.user_id ? 'Removing...' : 'Remove'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Member Form */}
        <div className="lg:col-span-1">
          {isCreator && (
            <div className="bg-card border rounded-3xl shadow-xl shadow-black/5 p-8 sticky top-24">
              <h2 className="text-xl font-black tracking-tight mb-2">Add Member</h2>
              <p className="text-muted-foreground text-sm mb-6 font-medium">Invite someone by their registered email.</p>
              
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-2 group">
                  <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 transition-colors group-focus-within:text-primary">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-bold"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isAdding}
                  className="w-full bg-primary text-primary-foreground px-6 py-4 rounded-xl font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-muted disabled:text-muted-foreground"
                >
                  {isAdding ? 'Adding Member...' : 'Invite to Group'}
                </button>
                
                {error && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-xl text-xs font-bold border border-destructive/20 animate-in shake-in duration-300">
                    {error}
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
