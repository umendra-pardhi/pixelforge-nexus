import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/server-auth"
import { updateUserRole } from "@/lib/services/userService"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { role } = await request.json()

    if (!role || !["admin", "project_lead", "developer"].includes(role)) {
      return NextResponse.json({ error: "Valid role is required" }, { status: 400 })
    }

    const success = await updateUserRole(params.id, role)

    if (!success) {
      return NextResponse.json({ error: "Failed to update user role" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
