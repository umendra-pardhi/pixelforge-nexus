import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/server-auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { projectLeadId } = await request.json()

    const db = await getDatabase()
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (projectLeadId) {
      updateData.projectLeadId = new ObjectId(projectLeadId)
    } else {
      updateData.$unset = { projectLeadId: "" }
    }

    const result = await db
      .collection("projects")
      .updateOne(
        { _id: new ObjectId(params.id) },
        projectLeadId ? { $set: updateData } : { $unset: { projectLeadId: "" }, $set: { updatedAt: new Date() } },
      )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Project not found or not updated" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating project lead:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
