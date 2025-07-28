import type { ObjectId } from "mongodb"

export type UserRole = "admin" | "project_lead" | "developer"

export interface User {
  _id?: ObjectId
  email: string
  password: string // hashed
  fullName: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface UserSession {
  _id?: ObjectId
  userId: ObjectId
  sessionToken: string
  expiresAt: Date
  createdAt: Date
}

export interface CreateUserData {
  email: string
  password: string
  fullName: string
  role: UserRole
}
