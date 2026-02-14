import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '../utils/supabase'
import type { Group, GroupWithMembers, Expense, ExpenseWithDetails, Settlement, ExpenseSplit, MemberBalance } from '../types/database'
import { calculateBalances, calculateSettlements } from '../utils/calculations'

// Fetch all groups for current user
export const fetchGroups = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      creator:profiles!groups_created_by_fkey(*)
    `)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as GroupWithMembers[]
})

// Fetch single group with members
export const fetchGroup = createServerFn({ method: 'GET' })
  .inputValidator((groupId: string) => groupId)
  .handler(async ({ data: groupId }) => {
    const supabase = getSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        creator:profiles!groups_created_by_fkey(*),
        members:group_members(
          *,
          profile:profiles(*)
        )
      `)
      .eq('id', groupId)
      .single()

    if (error) throw error
    return data as GroupWithMembers
  })

// Fetch expenses for a group
export const fetchExpenses = createServerFn({ method: 'GET' })
  .inputValidator((groupId: string) => groupId)
  .handler(async ({ data: groupId }) => {
    const supabase = getSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        payer:profiles!expenses_paid_by_fkey(*),
        splits:expense_splits(
          *,
          user:profiles(*)
        )
      `)
      .eq('group_id', groupId)
      .eq('is_deleted', false)
      .order('expense_date', { ascending: false })

    if (error) throw error
    return data as ExpenseWithDetails[]
  })

// Fetch settlements for a group
export const fetchSettlements = createServerFn({ method: 'GET' })
  .inputValidator((groupId: string) => groupId)
  .handler(async ({ data: groupId }) => {
    const supabase = getSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('settlements')
      .select(`
        *,
        from_profile:profiles!settlements_from_user_fkey(*),
        to_profile:profiles!settlements_to_user_fkey(*)
      `)
      .eq('group_id', groupId)
      .order('settlement_date', { ascending: false })

    if (error) throw error
    return data as Settlement[]
  })

// Calculate balances for a group
export const fetchBalances = createServerFn({ method: 'GET' })
  .inputValidator((groupId: string) => groupId)
  .handler(async ({ data: groupId }) => {
    const supabase = getSupabaseServerClient()
    
    // Fetch group with members
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select(`
        *,
        members:group_members(
          *,
          profile:profiles(*)
        )
      `)
      .eq('id', groupId)
      .single()

    if (groupError) throw groupError

    // Fetch expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('group_id', groupId)
      .eq('is_deleted', false)

    if (expensesError) throw expensesError

    // Fetch expense splits
    const expenseIds = expenses.map(e => e.id)
    const { data: splits, error: splitsError } = await supabase
      .from('expense_splits')
      .select('*')
      .in('expense_id', expenseIds)

    if (splitsError) throw splitsError

    // Fetch settlements
    const { data: settlements, error: settlementsError } = await supabase
      .from('settlements')
      .select('*')
      .eq('group_id', groupId)

    if (settlementsError) throw settlementsError

    const members = (group as any).members.map((m: any) => m.profile).filter(Boolean)
    const balances = calculateBalances(expenses as Expense[], splits as ExpenseSplit[], members)
    const suggestions = calculateSettlements(balances, settlements as Settlement[])

    return {
      balances,
      suggestions,
    }
  })
