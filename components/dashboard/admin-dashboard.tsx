"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, FolderOpen, CheckCircle, Upload } from "lucide-react"
import { CreateProjectDialog } from "./create-project-dialog"
import { CreateUserDialog } from "./create-user-dialog"
import { ManageUsersDialog } from "./manage-users-dialog"
import { UploadDocumentDialog } from "./upload-document-dialog"
import Link from "next/link"
import { AdminAssignDialog } from "./admin-assign-dialog"

interface User {
  _id: string
  email: string
  fullName: string
  role: "admin" | "project_lead" | "developer"
  createdAt: string
  updatedAt: string
  isActive: boolean
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

export function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showManageUsers, setShowManageUsers] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showUploadDocument, setShowUploadDocument] = useState(false)
  const [showAdminAssign, setShowAdminAssign] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [projectsResponse, usersResponse] = await Promise.all([fetch("/api/projects"), fetch("/api/users")])

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData)
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const markProjectComplete = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "completed" }),
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Error updating project:", error)
    }
  }

  const handleUploadDocument = (project: Project) => {
    setSelectedProject(project)
    setShowUploadDocument(true)
  }

  const handleAdminAssign = (project: Project) => {
    setSelectedProject(project)
    setShowAdminAssign(true)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  const activeProjects = projects.filter((p) => p.status === "active")
  const completedProjects = projects.filter((p) => p.status === "completed")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateProject(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
          <Button variant="outline" onClick={() => setShowCreateUser(true)}>
            <Users className="w-4 h-4 mr-2" />
            Add User
          </Button>
          <Button variant="outline" onClick={() => setShowManageUsers(true)}>
            <Users className="w-4 h-4 mr-2" />
            Manage Users
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.role === "project_lead").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
          <CardDescription>Manage ongoing projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeProjects.map((project) => (
              <div key={project._id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/projects/${project._id}`} className="font-semibold hover:underline">
                        {project.name}
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {project.projectLead && <Badge variant="secondary">Lead: {project.projectLead.fullName}</Badge>}
                      <Badge variant="outline">{project.assignments?.length || 0} members</Badge>
                      {project.deadline && (
                        <Badge variant="outline">Due: {new Date(project.deadline).toLocaleDateString()}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleAdminAssign(project)}>
                      <Users className="w-4 h-4 mr-2" />
                      Assign
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleUploadDocument(project)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => markProjectComplete(project._id)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {activeProjects.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No active projects. Create your first project to get started.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateProjectDialog open={showCreateProject} onOpenChange={setShowCreateProject} onSuccess={fetchData} />
      <CreateUserDialog open={showCreateUser} onOpenChange={setShowCreateUser} onSuccess={fetchData} />
      <ManageUsersDialog open={showManageUsers} onOpenChange={setShowManageUsers} users={users} onSuccess={fetchData} />
      {selectedProject && (
        <>
          <UploadDocumentDialog
            open={showUploadDocument}
            onOpenChange={setShowUploadDocument}
            project={selectedProject}
            onSuccess={fetchData}
          />
          <AdminAssignDialog
            open={showAdminAssign}
            onOpenChange={setShowAdminAssign}
            project={selectedProject}
            onSuccess={fetchData}
          />
        </>
      )}
    </div>
  )
}
