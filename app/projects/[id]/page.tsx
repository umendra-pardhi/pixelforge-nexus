"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Users, Upload, ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"
import { UploadDocumentDialog } from "@/components/dashboard/upload-document-dialog"
import { DocumentViewer } from "@/components/dashboard/document-viewer"

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
  documents?: any[]
}

export default function ProjectDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<any[]>([])
  const [showUploadDocument, setShowUploadDocument] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProjectDetails()
    }
  }, [id])

  const fetchProjectDetails = async () => {
    try {
      const [projectResponse, documentsResponse] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/projects/${id}/documents`),
      ])

      if (projectResponse.ok) {
        const projectData = await projectResponse.json()
        setProject(projectData)
      }

      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json()
        setDocuments(documentsData)
      }
    } catch (error) {
      console.error("Error fetching project details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchProjectDetails()
      }
    } catch (error) {
      console.error("Error deleting document:", error)
    }
  }

  const canUploadDocuments =
    user?.role === "admin" || (user?.role === "project_lead" && project?.projectLeadId === user._id)

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Back Button */}
      <Button variant="outline" asChild>
        <Link href="/dashboard">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </Button>

      {/* Project Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground mt-2">{project.description}</p>
          <div className="flex items-center gap-2 mt-4">
            <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
            {project.deadline && (
              <Badge variant="outline">
                <Calendar className="w-3 h-3 mr-1" />
                Due: {new Date(project.deadline).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </div>
        {canUploadDocuments && (
          <Button onClick={() => setShowUploadDocument(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.projectLead && (
                <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {project.projectLead.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{project.projectLead.fullName}</div>
                    <div className="text-xs text-muted-foreground">Project Lead</div>
                  </div>
                </div>
              )}
              {project.assignments?.map((member) => (
                <div key={member._id} className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {member.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{member.fullName}</div>
                    <div className="text-xs text-muted-foreground capitalize">{member.role.replace("_", " ")}</div>
                  </div>
                </div>
              ))}
              {(!project.assignments || project.assignments.length === 0) && !project.projectLead && (
                <p className="text-sm text-muted-foreground">No team members assigned</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Project Documents */}
        <DocumentViewer documents={documents} projectId={id as string} onDocumentDeleted={fetchProjectDetails} />
      </div>
      {project && (
        <UploadDocumentDialog
          open={showUploadDocument}
          onOpenChange={setShowUploadDocument}
          project={project}
          onSuccess={fetchProjectDetails}
        />
      )}
    </div>
  )
}
