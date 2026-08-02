import { ExpensesDashboard } from "@/components/admin/expenses-dashboard"
import { brand } from "@/config/brand"
import { getAllClients } from "@/lib/crm/clients"
import { getAllExpenses } from "@/lib/crm/expenses"
import { getAllProjects } from "@/lib/crm/projects"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Expenses | Finance | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminExpensesPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-w-0 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Expenses
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to manage
            expenses.
          </p>
        </div>
      </div>
    )
  }

  try {
    const [expenses, clients, projects] = await Promise.all([
      getAllExpenses(),
      getAllClients(),
      getAllProjects(),
    ])

    return (
      <ExpensesDashboard
        initialExpenses={expenses}
        clients={clients.map((client) => ({
          id: client.id,
          company: client.company,
        }))}
        projects={projects.map((project) => ({
          id: project.id,
          name: project.name,
          clientId: project.clientId,
        }))}
      />
    )
  } catch {
    return (
      <div className="min-w-0 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Expenses
          </h1>
          <p className="mt-2 text-sm text-red-600">
            Could not load expenses. Run{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              supabase/crm-expenses.sql
            </code>{" "}
            in the Supabase SQL editor.
          </p>
        </div>
        <ExpensesDashboard
          initialExpenses={[]}
          clients={[]}
          projects={[]}
        />
      </div>
    )
  }
}
