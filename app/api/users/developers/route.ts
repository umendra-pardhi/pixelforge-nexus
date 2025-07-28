import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/server-auth"
import { getAllUsers } from "@/lib/services/userService"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || !["admin", "project_lead"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const users = await getAllUsers()
    const developers = users.filter((user) => user.role === "developer")

    // Remove passwords from response
    const developersWithoutPasswords = developers.map(({ password, ...user }) => user)

    return NextResponse.json(developersWithoutPasswords)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
