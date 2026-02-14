/// <reference types="vite/client" />
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { createServerFn } from '@tanstack/react-start'
import * as React from 'react'
import { DefaultCatchBoundary } from '../components/DefaultCatchBoundary'
import { NotFound } from '../components/NotFound'
import appCss from '../styles/app.css?url'
import { seo } from '../utils/seo'
import { getSupabaseServerClient } from '../utils/supabase'

const fetchUser = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = getSupabaseServerClient()
  const { data, error: _error } = await supabase.auth.getUser()

  if (!data.user?.email) {
    return null
  }

  return {
    email: data.user.email,
  }
})

export const Route = createRootRoute({
  beforeLoad: async () => {
    const user = await fetchUser()

    return {
      user,
    }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title:
          'TanStack Start | Type-Safe, Client-First, Full-Stack React Framework',
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <AppShell>
        <Outlet />
      </AppShell>
    </RootDocument>
  )
}

function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = Route.useRouteContext()

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r bg-card lg:flex flex-col shadow-sm">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-gradient">Splitgor</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem to="/dashboard" label="Dashboard" icon="📊" />
          <NavItem to="/groups" label="Groups" icon="👥" />
        </nav>

        <div className="p-4 border-t bg-muted/30">
          {user ? (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-medium">
                {user.email[0].toUpperCase()}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">{user.email}</span>
                <Link to="/logout" className="text-xs text-muted-foreground hover:text-foreground">
                  Logout
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link 
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-primary/5 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full border-t bg-card/80 backdrop-blur-lg lg:hidden px-6 py-3 justify-between items-center shadow-lg">
        <MobileNavItem to="/dashboard" label="Home" icon="🏠" />
        <MobileNavItem to="/groups" label="Groups" icon="👥" />
        <MobileNavItem to="/groups/new" label="New" icon="➕" className="bg-primary !text-primary-foreground rounded-full size-12 flex items-center justify-center -mt-8 border-4 border-background shadow-lg" />
        <MobileNavItem to="/dashboard" label="Stats" icon="📈" />
        <MobileNavItem to="/dashboard" label="Menu" icon="☰" />
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pb-24 lg:pb-0">
        <header className="sticky top-0 z-40 lg:hidden flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-lg px-4 shadow-sm">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-6 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-xs">
              S
            </div>
            <span className="font-bold tracking-tight">Splitgor</span>
          </Link>
          {user ? (
             <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs">
              {user.email[0].toUpperCase()}
            </div>
          ) : (
            <Link to="/signup" className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-full">
              Sign Up
            </Link>
          )}
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavItem({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <Link
      to={to}
      activeProps={{ className: 'bg-primary/10 text-primary border-primary/20' }}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all font-medium border border-transparent"
    >
      <span className="text-xl">{icon}</span>
      {label}
    </Link>
  )
}

function MobileNavItem({ to, label, icon, className }: { to: string; label: string; icon: string; className?: string }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 ${className}`}
      activeProps={{ className: 'text-primary' }}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </Link>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
