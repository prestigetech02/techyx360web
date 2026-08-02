export type DealStage =
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost"

export type DealStageLabel =
  | "Qualified"
  | "Proposal"
  | "Negotiation"
  | "Won"
  | "Lost"

export type DealView = {
  id: string
  clientId: string
  clientName: string
  title: string
  value: number
  currency: string
  stage: DealStage
  stageLabel: DealStageLabel
  probability: number | null
  expectedCloseDate: string | null
  expectedCloseDateLabel: string | null
  notes: string
  createdAt: string
  updatedAt: string
}

export const DEAL_STAGES = new Set<DealStage>([
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
])

export const DEAL_STAGE_LABELS: Record<DealStage, DealStageLabel> = {
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
}

export function isDealStage(value: string): value is DealStage {
  return DEAL_STAGES.has(value as DealStage)
}

export function formatDealDate(value: string | null) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { dateStyle: "medium" })
}
