// Database type definitions based on the schema

export interface Profile {
  id: string // UUID
  email: string
  display_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Group {
  id: string // UUID
  name: string
  description?: string
  created_by: string
  currency: string
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  joined_at: string
}

export type ExpenseCategory = 'food' | 'transport' | 'accommodation' | 'entertainment' | 'utilities' | 'other'
export type SplitType = 'equal' | 'unequal' | 'percentage' | 'shares'

export interface Expense {
  id: string
  group_id: string
  description: string
  amount: number
  paid_by: string
  expense_date: string
  category: ExpenseCategory
  split_type: SplitType
  receipt_url?: string
  notes?: string
  created_by: string
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface ExpenseSplit {
  id: string
  expense_id: string
  user_id: string
  amount: number
}

export interface Settlement {
  id: string
  group_id: string
  from_user: string
  to_user: string
  amount: number
  settlement_date: string
  notes?: string
  created_at: string
}

// Extended types with relations
export interface ExpenseWithDetails extends Expense {
  payer?: Profile
  splits?: (ExpenseSplit & { user?: Profile })[]
}

export interface GroupWithMembers extends Group {
  members?: (GroupMember & { profile?: Profile })[]
  creator?: Profile
}

// Balance calculation types
export interface MemberBalance {
  user_id: string
  user: Profile
  paid: number
  owed: number
  balance: number // positive = owed money, negative = owes money
}

export interface SettlementSuggestion {
  from_user: string
  to_user: string
  amount: number
}
