"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Upload, FolderOpen } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"
import { AssignMembersDialog } from "./assign-members-dialog"
import { UploadDocumentDialog } from "./upload-document-dialog"

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

export function ProjectLeadDashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showAssignMembers, setShowAssignMembers] = useState(false)
  const [showUploadDocument, setShowUploadDocument] = useState(false)

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
        // Filter projects where current user is the project lead
        const myProjects = allProjects.filter(
          (project: Project) => project.projectLeadId === user?._id && project.status === "active",
        )
        setProjects(myProjects)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignMembers = (project: Project) => {
    setSelectedProject(project)
    setShowAssignMembers(true)
  }

  const handleUploadDocument = (project: Project) => {
    setSelectedProject(project)
    setShowUploadDocument(true)
  }

  const refreshProjectData = async () => {
    await fetchProjects()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Project Lead Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.reduce((total, project) => total + (project.assignments?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter((p) => p.deadline && new Date(p.deadline) > new Date()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects */}
      <Card>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
          <CardDescription>Projects you are leading</CardDescription>
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
                    <Badge variant="outline">{project.assignments?.length || 0} members</Badge>
                    {project.deadline && (
                      <Badge variant="outline">Due: {new Date(project.deadline).toLocaleDateString()}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleAssignMembers(project)}>
                    <Users className="w-4 h-4 mr-2" />
                    Assign
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleUploadDocument(project)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No projects assigned to you as project lead.</p>
            )}
          </div>
        </CardContent>
      </Card>
      {selectedProject && (
        <>
          <AssignMembersDialog
            open={showAssignMembers}
            onOpenChange={setShowAssignMembers}
            project={selectedProject}
            onSuccess={refreshProjectData}
          />
          <UploadDocumentDialog
            open={showUploadDocument}
            onOpenChange={setShowUploadDocument}
            project={selectedProject}
            onSuccess={fetchProjects}
          />
        </>
      )}
    </div>
  )
}
