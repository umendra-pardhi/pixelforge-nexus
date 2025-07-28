import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/server-auth"
import { getAllUsers } from "@/lib/services/userService"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Allow admins and project leads to see all users
    if (!["admin", "project_lead"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const users = await getAllUsers()

    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user)

    return NextResponse.json(usersWithoutPasswords)
  } catch (error) {
    console.error("Error fetching all users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
