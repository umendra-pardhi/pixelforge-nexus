"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { ProjectLeadDashboard } from "@/components/dashboard/project-lead-dashboard"
import { DeveloperDashboard } from "@/components/dashboard/developer-dashboard"
import { Button } from "@/components/ui/button"
import { LogOut, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    router.push("/")
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">PixelForge Nexus</h1>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">
                {user.fullName} ({user.role.replace("_", " ")})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {user.role === "admin" && <AdminDashboard />}
        {user.role === "project_lead" && <ProjectLeadDashboard />}
        {user.role === "developer" && <DeveloperDashboard />}
      </main>
    </div>
  )
}
