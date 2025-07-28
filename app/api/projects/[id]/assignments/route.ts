import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/server-auth"
import { assignUsersToProject } from "@/lib/services/projectService"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin or project lead for this project
    if (currentUser.role !== "admin") {
      const { getProjectById } = await import("@/lib/services/projectService")
      const project = await getProjectById(params.id)

      if (!project || project.projectLeadId?.toString() !== currentUser._id?.toString()) {
        return NextResponse.json({ error: "Permission denied" }, { status: 403 })
      }
    }

    const { userIds } = await request.json()

    if (!Array.isArray(userIds)) {
      return NextResponse.json({ error: "User IDs must be an array" }, { status: 400 })
    }

    const success = await assignUsersToProject(params.id, userIds, currentUser._id!.toString())

    if (!success) {
      return NextResponse.json({ error: "Failed to update assignments" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
