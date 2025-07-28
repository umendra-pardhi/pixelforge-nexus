import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/server-auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string; documentId: string } }) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Get document details
    const document = await db.collection("project_documents").findOne({
      _id: new ObjectId(params.documentId),
      projectId: new ObjectId(params.id),
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Check if user has access to this project
    const hasAccess =
      currentUser.role === "admin" ||
      (currentUser.role === "project_lead" && (await isProjectLead(currentUser._id!.toString(), params.id))) ||
      (await isAssignedToProject(currentUser._id!.toString(), params.id))

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Return document URL for download
    return NextResponse.json({
      success: true,
      downloadUrl: document.filePath,
      filename: document.name,
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function isProjectLead(userId: string, projectId: string): Promise<boolean> {
  const db = await getDatabase()
  const project = await db.collection("projects").findOne({
    _id: new ObjectId(projectId),
    projectLeadId: new ObjectId(userId),
  })
  return !!project
}

async function isAssignedToProject(userId: string, projectId: string): Promise<boolean> {
  const db = await getDatabase()
  const assignment = await db.collection("project_assignments").findOne({
    projectId: new ObjectId(projectId),
    userId: new ObjectId(userId),
  })
  return !!assignment
}
