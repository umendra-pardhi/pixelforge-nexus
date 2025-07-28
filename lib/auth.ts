import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getDatabase } from "./mongodb"
import type { User, UserSession } from "./models/User"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createSession(userId: ObjectId): Promise<string> {
  const db = await getDatabase()
  const sessionToken = jwt.sign({ userId: userId.toString() }, JWT_SECRET)
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  await db.collection<UserSession>("sessions").insertOne({
    userId,
    sessionToken,
    expiresAt,
    createdAt: new Date(),
  })

  return sessionToken
}

export async function getSessionUser(sessionToken: string): Promise<User | null> {
  try {
    const decoded = jwt.verify(sessionToken, JWT_SECRET) as { userId: string }
    const db = await getDatabase()

    // Check if session exists and is valid
    const session = await db.collection<UserSession>("sessions").findOne({
      sessionToken,
      expiresAt: { $gt: new Date() },
    })

    if (!session) return null

    // Get user
    const user = await db.collection<User>("users").findOne({
      _id: new ObjectId(decoded.userId),
      isActive: true,
    })

    return user
  } catch (error) {
    return null
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string; token?: string }> {
  try {
    const db = await getDatabase()
    const user = await db.collection<User>("users").findOne({ email, isActive: true })

    if (!user) {
      return { success: false, error: "Invalid credentials" }
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return { success: false, error: "Invalid credentials" }
    }

    const sessionToken = await createSession(user._id!)
    return { success: true, token: sessionToken }
  } catch (error) {
    return { success: false, error: "Authentication failed" }
  }
}

export async function signOut(sessionToken: string): Promise<void> {
  const db = await getDatabase()
  await db.collection<UserSession>("sessions").deleteOne({ sessionToken })
}

export async function createUser(userData: {
  email: string
  password: string
  fullName: string
  role: "admin" | "project_lead" | "developer"
}): Promise<{ success: boolean; error?: string; userId?: ObjectId }> {
  try {
    console.log("Creating user:", userData.email)
    const db = await getDatabase()

    // Check if user already exists
    const existingUser = await db.collection<User>("users").findOne({ email: userData.email })
    if (existingUser) {
      console.log("User already exists:", userData.email)
      return { success: false, error: "User already exists" }
    }

    console.log("Hashing password for user:", userData.email)
    const hashedPassword = await hashPassword(userData.password)
    const now = new Date()

    const userDoc = {
      email: userData.email,
      password: hashedPassword,
      fullName: userData.fullName,
      role: userData.role,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    }

    console.log("Inserting user into database:", userData.email)
    const result = await db.collection<User>("users").insertOne(userDoc)
    console.log("User created successfully:", userData.email, "ID:", result.insertedId)

    return { success: true, userId: result.insertedId }
  } catch (error) {
    console.error("Error in createUser:", error)
    return { success: false, error: `Failed to create user: ${error.message}` }
  }
}
