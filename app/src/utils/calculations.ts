import type { Expense, ExpenseSplit, MemberBalance, Profile, SettlementSuggestion, Settlement } from '../types/database'

/**
 * Calculate balances for all members in a group
 * Balance = (amount paid) - (share of total expenses)
 * Positive balance = owed money, Negative balance = owes money
 */
export function calculateBalances(
  expenses: Expense[],
  splits: ExpenseSplit[],
  members: Profile[]
): MemberBalance[] {
  const balances = new Map<string, MemberBalance>()

  // Initialize balances for all members
  members.forEach((member) => {
    balances.set(member.id, {
      user_id: member.id,
      user: member,
      paid: 0,
      owed: 0,
      balance: 0,
    })
  })

  // Calculate paid amounts
  expenses.forEach((expense) => {
    if (expense.is_deleted) return
    const balance = balances.get(expense.paid_by)
    if (balance) {
      balance.paid += expense.amount
    }
  })

  // Calculate owed amounts (their share of expenses)
  splits.forEach((split) => {
    const balance = balances.get(split.user_id)
    if (balance) {
      balance.owed += split.amount
    }
  })

  // Calculate net balance
  balances.forEach((balance) => {
    balance.balance = balance.paid - balance.owed
  })

  return Array.from(balances.values())
}

/**
 * Calculate optimal settlement suggestions to minimize number of transactions
 * Uses greedy algorithm: match largest creditor with largest debtor
 */
export function calculateSettlements(
  balances: MemberBalance[],
  existingSettlements: Settlement[] = []
): SettlementSuggestion[] {
  // Adjust balances based on existing settlements
  const adjustedBalances = balances.map((b) => ({ ...b }))

  existingSettlements.forEach((settlement) => {
    const fromBalance = adjustedBalances.find((b) => b.user_id === settlement.from_user)
    const toBalance = adjustedBalances.find((b) => b.user_id === settlement.to_user)

    if (fromBalance) {
      fromBalance.balance += settlement.amount
    }
    if (toBalance) {
      toBalance.balance -= settlement.amount
    }
  })

  // Separate creditors (positive balance) and debtors (negative balance)
  const creditors = adjustedBalances
    .filter((b) => b.balance > 0.01) // Use small threshold for floating point
    .sort((a, b) => b.balance - a.balance)

  const debtors = adjustedBalances
    .filter((b) => b.balance < -0.01)
    .sort((a, b) => a.balance - b.balance)

  const suggestions: SettlementSuggestion[] = []

  let i = 0
  let j = 0

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i]
    const debtor = debtors[j]

    const amount = Math.min(creditor.balance, Math.abs(debtor.balance))

    suggestions.push({
      from_user: debtor.user_id,
      to_user: creditor.user_id,
      amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
    })

    creditor.balance -= amount
    debtor.balance += amount

    if (creditor.balance < 0.01) i++
    if (Math.abs(debtor.balance) < 0.01) j++
  }

  return suggestions
}

/**
 * Calculate split amounts based on split type
 */
export function calculateSplitAmounts(
  totalAmount: number,
  splitType: 'equal' | 'unequal' | 'percentage' | 'shares',
  participants: string[],
  customAmounts?: Record<string, number>
): Record<string, number> {
  const splits: Record<string, number> = {}

  switch (splitType) {
    case 'equal': {
      const amountPerPerson = totalAmount / participants.length
      participants.forEach((userId) => {
        splits[userId] = Math.round(amountPerPerson * 100) / 100
      })
      break
    }

    case 'unequal':
    case 'percentage':
    case 'shares': {
      if (!customAmounts) {
        throw new Error('Custom amounts required for non-equal split')
      }

      if (splitType === 'percentage') {
        // Convert percentages to amounts
        participants.forEach((userId) => {
          const percentage = customAmounts[userId] || 0
          splits[userId] = Math.round((totalAmount * percentage) / 100 * 100) / 100
        })
      } else if (splitType === 'shares') {
        // Convert shares to amounts
        const totalShares = Object.values(customAmounts).reduce((sum, shares) => sum + shares, 0)
        participants.forEach((userId) => {
          const shares = customAmounts[userId] || 0
          splits[userId] = Math.round((totalAmount * shares / totalShares) * 100) / 100
        })
      } else {
        // Unequal - use amounts directly
        participants.forEach((userId) => {
          splits[userId] = customAmounts[userId] || 0
        })
      }
      break
    }
  }

  return splits
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}
