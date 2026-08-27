import "server-only"

import { brand } from "@/config/brand"
import { formatNaira } from "@/lib/invoices/formatting"
import type { PayrollItemView, PayrollRunView } from "@/lib/payroll/payroll-types"
import { maskAccountNumber } from "@/lib/payroll/payroll-types"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatPaidDate(value: string | null) {
  if (!value) return "—"
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function renderPayslipHtml(
  item: PayrollItemView,
  run: PayrollRunView
) {
  const bankLine = [
    item.bankName,
    item.accountName,
    maskAccountNumber(item.accountNumber),
  ]
    .filter(Boolean)
    .join(" · ")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(item.payslipNumber)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, Arial, sans-serif;
      color: #111827;
      background: #fff;
    }
    .sheet {
      max-width: 720px;
      margin: 0 auto;
      padding: 28px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 2px solid #111827;
      padding-bottom: 16px;
    }
    .brand {
      font-size: 22px;
      font-weight: 700;
    }
    .meta {
      text-align: right;
      font-size: 12px;
      color: #4b5563;
      line-height: 1.5;
    }
    h1 {
      margin: 24px 0 4px;
      font-size: 20px;
    }
    .subtitle {
      margin: 0 0 20px;
      color: #6b7280;
      font-size: 13px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 24px;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .label {
      color: #6b7280;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th, td {
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
      text-align: left;
    }
    td.amount, th.amount {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    tr.total td {
      border-bottom: none;
      font-weight: 700;
      font-size: 15px;
      padding-top: 14px;
    }
    .footer {
      margin-top: 32px;
      font-size: 11px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div class="brand">${escapeHtml(brand.name)}</div>
      <div class="meta">
        <div>Payslip</div>
        <div>${escapeHtml(item.payslipNumber)}</div>
        <div>${escapeHtml(run.label)}</div>
      </div>
    </div>

    <h1>${escapeHtml(item.employeeName)}</h1>
    <p class="subtitle">${escapeHtml(item.role)}${item.department ? ` · ${escapeHtml(item.department)}` : ""}</p>

    <div class="grid">
      <div>
        <div class="label">Email</div>
        <div>${escapeHtml(item.employeeEmail || "—")}</div>
      </div>
      <div>
        <div class="label">Bank</div>
        <div>${escapeHtml(bankLine || "—")}</div>
      </div>
      <div>
        <div class="label">Payment date</div>
        <div>${escapeHtml(formatPaidDate(run.paidAt))}</div>
      </div>
      <div>
        <div class="label">Payment reference</div>
        <div>${escapeHtml(run.paymentReference || "—")}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Gross salary</td>
          <td class="amount">${formatNaira(item.grossAmount)}</td>
        </tr>
        <tr>
          <td>Bonus</td>
          <td class="amount">${formatNaira(item.bonusAmount)}</td>
        </tr>
        <tr>
          <td>Deductions${item.deductionNote ? ` (${escapeHtml(item.deductionNote)})` : ""}</td>
          <td class="amount">-${formatNaira(item.deductionAmount)}</td>
        </tr>
        <tr class="total">
          <td>Net pay</td>
          <td class="amount">${formatNaira(item.netAmount)}</td>
        </tr>
      </tbody>
    </table>

    <p class="footer">Computer-generated payslip for ${escapeHtml(brand.name)}. Not a tax certificate.</p>
  </div>
</body>
</html>`
}
