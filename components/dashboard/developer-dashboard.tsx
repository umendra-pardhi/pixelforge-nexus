"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, FileText, Calendar } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"

interface User {
  _id: string
  email: string
  fullName: string
  role: "admin" | "project_lead" | "developer"
}

interface Project {
  _id: string
  name: string
  description?: string
  deadline?: string
  status: "active" | "completed"
  createdBy: string
  projectLeadId?: string
  createdAt: string
  updatedAt: string
  projectLead?: User
  assignments?: User[]
}

export function DeveloperDashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const allProjects = await response.json()
        // Filter projects where current user is assigned
        const myProjects = allProjects.filter((project: Project) =>
          project.assignments?.some((assignment) => assignment._id === user?._id),
        )
        setProjects(myProjects)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  const upcomingDeadlines = projects.filter(
    (project) => project.deadline && new Date(project.deadline) > new Date(),
  ).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Developer Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingDeadlines}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.filter((p) => p.status === "active").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Projects */}
      <Card>
        <CardHeader>
          <CardTitle>My Assigned Projects</CardTitle>
          <CardDescription>Projects you are currently working on</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/projects/${project._id}`} className="font-semibold hover:underline">
                      {project.name}
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {project.projectLead && <Badge variant="secondary">Lead: {project.projectLead.fullName}</Badge>}
                    {project.deadline && (
                      <Badge variant="outline">Due: {new Date(project.deadline).toLocaleDateString()}</Badge>
                    )}
                    <Badge variant="outline">Status: {project.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No projects assigned to you yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
