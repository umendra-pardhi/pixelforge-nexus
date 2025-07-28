import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/server-auth"
import { uploadDocument, getProjectDocuments } from "@/lib/services/documentService"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const documents = await getProjectDocuments(params.id)
    return NextResponse.json(documents)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check permissions - admin or project lead
    if (currentUser.role !== "admin") {
      const { getProjectById } = await import("@/lib/services/projectService")
      const project = await getProjectById(params.id)

      if (
        !project ||
        (currentUser.role === "project_lead" && project.projectLeadId?.toString() !== currentUser._id?.toString())
      ) {
        return NextResponse.json({ error: "Permission denied" }, { status: 403 })
      }
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await uploadDocument(params.id, buffer, file.name, file.type, currentUser._id!.toString())

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, documentId: result.documentId })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
