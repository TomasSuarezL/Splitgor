import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchGroups } from '../../lib/queries'

export const Route = createFileRoute('/_authed/groups/')({
  loader: async () => {
    const groups = await fetchGroups()
    return { groups }
  },
  component: GroupsList,
})

function GroupsList() {
  const { groups } = Route.useLoaderData()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gradient">My Groups</h1>
          <p className="text-muted-foreground mt-1">Manage and track your shared expenses</p>
        </div>
        <Link
          to="/groups/new"
          className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all text-center"
        >
          + Create New Group
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="bg-card border-2 border-dashed rounded-2xl p-12 text-center animate-in zoom-in-95 duration-500">
          <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            👥
          </div>
          <h3 className="text-2xl font-bold mb-2">No groups yet</h3>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Create your first group to start track expenses with friends, family, or roommates.
          </p>
          <Link
            to="/groups/new"
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all"
          >
            Start a Group
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link
              key={group.id}
              to="/groups/$groupId"
              params={{ groupId: group.id }}
              className="group relative bg-card border hover:border-primary/50 p-6 rounded-2xl transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors font-bold text-xl">
                  {group.name[0].toUpperCase()}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${group.is_archived ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                  {group.is_archived ? 'Archived' : 'Active'}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{group.name}</h3>
              {group.description && (
                <p className="text-muted-foreground text-sm line-clamp-2 mb-6 h-10">{group.description}</p>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold opacity-60">Currency:</span>
                  <span className="text-sm font-bold">{group.currency}</span>
                </div>
                <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm flex items-center gap-1">
                  View Detail <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
