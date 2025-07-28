"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Users, FolderOpen } from "lucide-react"

export default function SetupPage() {
  const [adminLoading, setAdminLoading] = useState(false)
  const [sampleLoading, setSampleLoading] = useState(false)
  const [adminResult, setAdminResult] = useState<{ success: boolean; error?: string } | null>(null)
  const [sampleResult, setSampleResult] = useState<{ success: boolean; error?: string; message?: string } | null>(null)

  const handleCreateAdmin = async () => {
    setAdminLoading(true)
    setAdminResult(null)

    try {
      console.log("Sending request to create admin user...")
      const response = await fetch("/api/setup/admin", {
        method: "POST",
      })

      console.log("Response status:", response.status)
      const result = await response.json()
      console.log("Response data:", result)

      setAdminResult(result)
    } catch (error) {
      console.error("Network error:", error)
      setAdminResult({ success: false, error: `Network error: ${error.message}` })
    } finally {
      setAdminLoading(false)
    }
  }

  const handleCreateSampleData = async () => {
    setSampleLoading(true)
    setSampleResult(null)

    try {
      const response = await fetch("/api/setup/sample-data", {
        method: "POST",
      })

      const result = await response.json()
      setSampleResult(result)
    } catch (error) {
      setSampleResult({ success: false, error: "Network error" })
    } finally {
      setSampleLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">PixelForge Nexus Setup</h1>
        <p className="text-muted-foreground">Initialize your project management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin User Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Step 1: Create Admin User
            </CardTitle>
            <CardDescription>Create the initial administrator account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {adminResult && (
              <Alert variant={adminResult.success ? "default" : "destructive"}>
                <AlertDescription>
                  {adminResult.success ? "Admin user created successfully!" : `Error: ${adminResult.error}`}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h4 className="font-semibold">Admin Credentials:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Email: admin@pixelforge.com</li>
                <li>Password: admin123</li>
                <li>Role: System Administrator</li>
              </ul>
            </div>

            <Button onClick={handleCreateAdmin} disabled={adminLoading || adminResult?.success} className="w-full">
              {adminLoading
                ? "Creating Admin User..."
                : adminResult?.success
                  ? "Admin User Created ✓"
                  : "Create Admin User"}
            </Button>
          </CardContent>
        </Card>

        {/* Sample Data Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Step 2: Create Sample Data
            </CardTitle>
            <CardDescription>Add sample users, projects, and assignments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sampleResult && (
              <Alert variant={sampleResult.success ? "default" : "destructive"}>
                <AlertDescription>
                  {sampleResult.success ? sampleResult.message : `Error: ${sampleResult.error}`}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h4 className="font-semibold">This will create:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>5 sample users (project leads & developers)</li>
                <li>3 sample projects</li>
                <li>Project assignments</li>
                <li>All with password: admin123</li>
              </ul>
            </div>

            <Button
              onClick={handleCreateSampleData}
              disabled={sampleLoading || !adminResult?.success || sampleResult?.success}
              variant={adminResult?.success ? "default" : "secondary"}
              className="w-full"
            >
              {sampleLoading
                ? "Creating Sample Data..."
                : sampleResult?.success
                  ? "Sample Data Created ✓"
                  : !adminResult?.success
                    ? "Create Admin User First"
                    : "Create Sample Data"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      {adminResult?.success && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Setup Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Your PixelForge Nexus system is ready to use.</p>

              <div className="pt-4 border-t">
                <Button asChild className="w-full">
                  <a href="/">Go to Login Page</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
