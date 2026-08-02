import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { getClientById } from "@/lib/crm/clients"
import {
  isExpenseCategory,
  isExpenseMethod,
  isExpenseStatus,
} from "@/lib/crm/expense-types"
import { createExpense, getAllExpenses } from "@/lib/crm/expenses"
import { getProjectById } from "@/lib/crm/projects"
import { parseAmountInput } from "@/lib/money"
import { isSupabaseConfigured } from "@/lib/supabase/env"

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    const expenses = await getAllExpenses()
    return NextResponse.json({ expenses })
  } catch (error) {
    console.error("Failed to load expenses", error)
    return NextResponse.json(
      { error: "Unable to load expenses." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    const body = (await request.json()) as Record<string, unknown>
    const clientId = sanitize(body.clientId) || null
    const projectId = sanitize(body.projectId) || null
    const categoryValue = sanitize(body.category)
    const methodValue = sanitize(body.method) || "bank_transfer"
    const statusValue = sanitize(body.status) || "paid"
    const spentAt = sanitize(body.spentAt)
    const vendor = sanitize(body.vendor)
    const reference = sanitize(body.reference)
    const description = sanitize(body.description)
    const notes = sanitize(body.notes)
    const receiptUrl = sanitize(body.receiptUrl)
    const amount = parseAmountInput(
      typeof body.amount === "number"
        ? String(body.amount)
        : sanitize(body.amount)
    )

    if (!spentAt) {
      return NextResponse.json(
        { error: "Expense date is required." },
        { status: 400 }
      )
    }

    if (amount === null || amount <= 0) {
      return NextResponse.json(
        { error: "Enter a valid expense amount." },
        { status: 400 }
      )
    }

    if (!isExpenseCategory(categoryValue)) {
      return NextResponse.json(
        { error: "Expense category is required." },
        { status: 400 }
      )
    }

    if (!isExpenseMethod(methodValue)) {
      return NextResponse.json(
        { error: "Invalid payment method." },
        { status: 400 }
      )
    }

    if (!isExpenseStatus(statusValue)) {
      return NextResponse.json(
        { error: "Invalid expense status." },
        { status: 400 }
      )
    }

    if (clientId) {
      const client = await getClientById(clientId)
      if (!client) {
        return NextResponse.json(
          { error: "Client not found." },
          { status: 404 }
        )
      }
    }

    if (projectId) {
      const project = await getProjectById(projectId)
      if (!project) {
        return NextResponse.json(
          { error: "Project not found." },
          { status: 404 }
        )
      }
    }

    const expense = await createExpense({
      clientId,
      projectId,
      amount,
      category: categoryValue,
      vendor,
      method: methodValue,
      status: statusValue,
      spentAt,
      reference,
      description,
      notes,
      receiptUrl,
    })

    return NextResponse.json({ success: true, expense })
  } catch (error) {
    console.error("Failed to create expense", error)
    return NextResponse.json(
      { error: "Unable to save expense right now." },
      { status: 500 }
    )
  }
}
