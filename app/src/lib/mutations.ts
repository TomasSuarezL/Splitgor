import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '../utils/supabase'
import type { CreateGroupInput, CreateExpenseInput, CreateSettlementInput } from '../types/schemas'
import { calculateSplitAmounts } from '../utils/calculations'

// Create group
export const createGroup = createServerFn({ method: 'POST' })
  .inputValidator((input: CreateGroupInput) => input)
  .handler(async ({ data: input }) => {
    const supabase = getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('groups')
      .insert({
        ...input,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    // Add creator as member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: data.id,
        user_id: user.id,
      })

    if (memberError) throw memberError

    return data
  })

// Add member to group
export const addGroupMember = createServerFn({ method: 'POST' })
  .inputValidator((input: { groupId: string; userEmail: string }) => input)
  .handler(async ({ data: { groupId, userEmail } }) => {
    const supabase = getSupabaseServerClient()
    
    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single()

    if (profileError) throw new Error('User not found')

    const { data, error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: profile.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  })

// Remove member from group
export const removeGroupMember = createServerFn({ method: 'POST' })
  .inputValidator((input: { groupId: string; userId: string }) => input)
  .handler(async ({ data: { groupId, userId } }) => {
    const supabase = getSupabaseServerClient()
    
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)

    if (error) throw error
  })

// Create expense with splits
export const createExpense = createServerFn({ method: 'POST' })
  .inputValidator((input: CreateExpenseInput & { groupId: string; participants: string[]; customAmounts?: Record<string, number> }) => input)
  .handler(async ({ data: input }) => {
    const supabase = getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Not authenticated')

    const { groupId, participants, customAmounts, ...expenseData } = input

    // Create expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        ...expenseData,
        group_id: groupId,
        created_by: user.id,
      })
      .select()
      .single()

    if (expenseError) throw expenseError

    // Calculate split amounts
    const splitAmounts = calculateSplitAmounts(
      input.amount,
      input.split_type,
      participants,
      customAmounts
    )

    // Create splits
    const splits = participants.map((userId) => ({
      expense_id: expense.id,
      user_id: userId,
      amount: splitAmounts[userId],
    }))

    const { error: splitsError } = await supabase
      .from('expense_splits')
      .insert(splits)

    if (splitsError) throw splitsError

    return expense
  })

// Delete expense (soft delete)
export const deleteExpense = createServerFn({ method: 'POST' })
  .inputValidator((expenseId: string) => expenseId)
  .handler(async ({ data: expenseId }) => {
    const supabase = getSupabaseServerClient()
    
    const { error } = await supabase
      .from('expenses')
      .update({ is_deleted: true })
      .eq('id', expenseId)

    if (error) throw error
  })

// Create settlement
export const createSettlement = createServerFn({ method: 'POST' })
  .inputValidator((input: CreateSettlementInput & { groupId: string }) => input)
  .handler(async ({ data: input }) => {
    const supabase = getSupabaseServerClient()
    
    const { groupId, ...settlementData } = input

    const { data, error } = await supabase
      .from('settlements')
      .insert({
        ...settlementData,
        group_id: groupId,
      })
      .select()
      .single()

    if (error) throw error
    return data
  })
