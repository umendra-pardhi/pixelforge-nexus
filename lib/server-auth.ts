import { cookies } from "next/headers"
import { getSessionUser } from "./auth"
import type { User } from "./models/User"

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("session")?.value

  if (!sessionToken) return null

  return getSessionUser(sessionToken)
}
