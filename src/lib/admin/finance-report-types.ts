export type FinancePnLFilters = {
  from: string
  to: string
  purpose?: string
  category?: string
  clientId?: string
}

export type FinanceBreakdownRow = {
  key: string
  label: string
  amount: number
  count: number
  share: number
}

export type FinancePnLReport = {
  filters: Required<Pick<FinancePnLFilters, "from" | "to">> & {
    purpose: string
    category: string
    clientId: string
  }
  incomeTotal: number
  expenseTotal: number
  profit: number
  marginPercent: number
  incomeCount: number
  expenseCount: number
  incomeByPurpose: FinanceBreakdownRow[]
  expensesByCategory: FinanceBreakdownRow[]
}
