"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Trash2, ExternalLink, Eye } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

interface Document {
  _id: string
  name: string
  filePath: string
  fileSize?: number
  mimeType?: string
  uploadedAt: string
  uploadedBy: string
}

interface DocumentViewerProps {
  documents: Document[]
  projectId: string
  onDocumentDeleted: () => void
}

export function DocumentViewer({ documents, projectId, onDocumentDeleted }: DocumentViewerProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleDownload = async (document: Document) => {
    setLoading(document._id)
    try {
      // For Cloudinary URLs, we can directly open them
      if (document.filePath.includes("cloudinary.com")) {
        window.open(document.filePath, "_blank")
      } else {
        // For other URLs, use the download API
        const response = await fetch(`/api/projects/${projectId}/documents/download/${document._id}`)
        const data = await response.json()

        if (response.ok && data.downloadUrl) {
          window.open(data.downloadUrl, "_blank")
        } else {
          console.error("Download failed:", data.error)
        }
      }
    } catch (error) {
      console.error("Download error:", error)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDocumentDeleted()
      } else {
        const data = await response.json()
        console.error("Delete failed:", data.error)
      }
    } catch (error) {
      console.error("Error deleting document:", error)
    }
  }

  const canDeleteDocument = (document: Document) => {
    return user?.role === "admin" || document.uploadedBy === user?._id
  }

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <FileText className="w-4 h-4" />

    if (mimeType.startsWith("image/")) return <Eye className="w-4 h-4" />
    if (mimeType.includes("pdf")) return <FileText className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ""
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Project Documents
          </CardTitle>
          <CardDescription>No documents uploaded yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">Upload documents to share with your team</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Project Documents ({documents.length})
        </CardTitle>
        <CardDescription>Documents and files related to this project</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((document) => (
            <div
              key={document._id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {getFileIcon(document.mimeType)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{document.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Uploaded {new Date(document.uploadedAt).toLocaleDateString()}</span>
                    {document.fileSize && (
                      <>
                        <span>•</span>
                        <span>{formatFileSize(document.fileSize)}</span>
                      </>
                    )}
                    {document.mimeType && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {document.mimeType.split("/")[1]?.toUpperCase()}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(document)}
                  disabled={loading === document._id}
                >
                  {loading === document._id ? (
                    <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(document)}
                  disabled={loading === document._id}
                >
                  <Download className="w-4 h-4" />
                </Button>
                {canDeleteDocument(document) && (
                  <Button variant="outline" size="sm" onClick={() => handleDelete(document._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
