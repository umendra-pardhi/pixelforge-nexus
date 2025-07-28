import type { ObjectId } from "mongodb"

export type ProjectStatus = "active" | "completed"

export interface Project {
  _id?: ObjectId
  name: string
  description?: string
  deadline?: Date
  status: ProjectStatus
  createdBy: ObjectId
  projectLeadId?: ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface ProjectAssignment {
  _id?: ObjectId
  projectId: ObjectId
  userId: ObjectId
  assignedBy: ObjectId
  assignedAt: Date
}

export interface ProjectDocument {
  _id?: ObjectId
  projectId: ObjectId
  name: string
  filePath: string
  cloudinaryId?: string
  fileSize?: number
  mimeType?: string
  uploadedBy: ObjectId
  uploadedAt: Date
}
