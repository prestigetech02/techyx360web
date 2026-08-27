import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { generatePayslipPdf } from "@/lib/payroll/generate-payslip-pdf"
import { getPayrollItemById } from "@/lib/payroll/runs"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  const { id } = await context.params

  try {
    const result = await getPayrollItemById(id)
    if (!result?.item || !result.run) {
      return NextResponse.json({ error: "Payslip not found." }, { status: 404 })
    }

    const pdf = await generatePayslipPdf(result.item, result.run)
    const filename = `${result.item.payslipNumber}.pdf`

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Failed to generate payslip PDF", error)
    return NextResponse.json(
      { error: "Unable to generate payslip PDF." },
      { status: 500 }
    )
  }
}
