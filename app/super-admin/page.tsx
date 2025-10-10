import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { AdminStats } from "@/components/admin/admin-stats"
import { ClientsTable } from "@/components/admin/clients-table"
import { PlansTable } from "@/components/admin/plans-table"
import { getAllClients, getAllPlans, getAdminStats } from "@/lib/actions/admin"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function SuperAdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()


  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar userRole={profile.role} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-slate-200 bg-white px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Super Admin Panel</h1>
          <p className="mt-1 text-sm text-slate-600">Manage clients, plans, and system settings</p>
        </div>

        <div className="p-8">
          <div className="space-y-6">
            <AdminStats stats={stats} />

            <Tabs defaultValue="clients" className="w-full">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="clients" className="data-[state=active]:bg-white">
                  Clients
                </TabsTrigger>
                <TabsTrigger value="plans" className="data-[state=active]:bg-white">
                  Plans
                </TabsTrigger>
              </TabsList>
              <TabsContent value="clients" className="mt-6">
                <ClientsTable clients={clients} plans={plans} />
              </TabsContent>
              <TabsContent value="plans" className="mt-6">
                <PlansTable plans={plans} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
