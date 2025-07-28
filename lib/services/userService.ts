import { getDatabase } from "../mongodb"
import type { User } from "../models/User"
import { ObjectId } from "mongodb"

export async function getAllUsers(): Promise<User[]> {
  const db = await getDatabase()
  return db.collection<User>("users").find({ isActive: true }).sort({ createdAt: -1 }).toArray()
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getDatabase()
  return db.collection<User>("users").findOne({
    _id: new ObjectId(id),
    isActive: true,
  })
}

export async function updateUserRole(userId: string, role: "admin" | "project_lead" | "developer"): Promise<boolean> {
  try {
    const db = await getDatabase()
    const result = await db.collection<User>("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          role,
          updatedAt: new Date(),
        },
      },
    )
    return result.modifiedCount > 0
  } catch (error) {
    return false
  }
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  try {
    const { hashPassword } = await import("../auth")
    const hashedPassword = await hashPassword(newPassword)

    const db = await getDatabase()
    const result = await db.collection<User>("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      },
    )
    return result.modifiedCount > 0
  } catch (error) {
    return false
  }
}
