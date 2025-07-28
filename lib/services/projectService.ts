import { getDatabase } from "../mongodb"
import type { Project, ProjectAssignment, ProjectDocument } from "../models/Project"
import type { User } from "../models/User"
import { ObjectId } from "mongodb"

export async function getAllProjects(): Promise<(Project & { projectLead?: User; assignments?: User[] })[]> {
  const db = await getDatabase()

  const projects = await db.collection<Project>("projects").find({}).sort({ createdAt: -1 }).toArray()

  // Populate project leads and assignments
  const enrichedProjects = await Promise.all(
    projects.map(async (project) => {
      const projectLead = project.projectLeadId
        ? await db.collection<User>("users").findOne({ _id: project.projectLeadId })
        : undefined

      const assignments = await db
        .collection<ProjectAssignment>("project_assignments")
        .find({ projectId: project._id })
        .toArray()

      const assignedUsers = await Promise.all(
        assignments.map(async (assignment) => db.collection<User>("users").findOne({ _id: assignment.userId })),
      )

      return {
        ...project,
        projectLead,
        assignments: assignedUsers.filter(Boolean) as User[],
      }
    }),
  )

  return enrichedProjects
}

export async function getProjectById(
  id: string,
): Promise<(Project & { projectLead?: User; assignments?: User[]; documents?: ProjectDocument[] }) | null> {
  const db = await getDatabase()

  const project = await db.collection<Project>("projects").findOne({ _id: new ObjectId(id) })
  if (!project) return null

  const projectLead = project.projectLeadId
    ? await db.collection<User>("users").findOne({ _id: project.projectLeadId })
    : undefined

  const assignments = await db
    .collection<ProjectAssignment>("project_assignments")
    .find({ projectId: project._id })
    .toArray()

  const assignedUsers = await Promise.all(
    assignments.map(async (assignment) => db.collection<User>("users").findOne({ _id: assignment.userId })),
  )

  const documents = await db
    .collection<ProjectDocument>("project_documents")
    .find({ projectId: project._id })
    .sort({ uploadedAt: -1 })
    .toArray()

  return {
    ...project,
    projectLead,
    assignments: assignedUsers.filter(Boolean) as User[],
    documents,
  }
}

export async function createProject(projectData: {
  name: string
  description?: string
  deadline?: string
  projectLeadId?: string
  createdBy: string
}): Promise<{ success: boolean; error?: string; projectId?: ObjectId }> {
  try {
    const db = await getDatabase()
    const now = new Date()

    const result = await db.collection<Project>("projects").insertOne({
      name: projectData.name,
      description: projectData.description,
      deadline: projectData.deadline ? new Date(projectData.deadline) : undefined,
      status: "active",
      createdBy: new ObjectId(projectData.createdBy),
      projectLeadId: projectData.projectLeadId ? new ObjectId(projectData.projectLeadId) : undefined,
      createdAt: now,
      updatedAt: now,
    })

    return { success: true, projectId: result.insertedId }
  } catch (error) {
    return { success: false, error: "Failed to create project" }
  }
}

export async function updateProjectStatus(projectId: string, status: "active" | "completed"): Promise<boolean> {
  try {
    const db = await getDatabase()
    const result = await db.collection<Project>("projects").updateOne(
      { _id: new ObjectId(projectId) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    )
    return result.modifiedCount > 0
  } catch (error) {
    return false
  }
}

export async function getProjectsForUser(userId: string): Promise<Project[]> {
  const db = await getDatabase()

  const assignments = await db
    .collection<ProjectAssignment>("project_assignments")
    .find({ userId: new ObjectId(userId) })
    .toArray()

  const projectIds = assignments.map((a) => a.projectId)

  return db
    .collection<Project>("projects")
    .find({ _id: { $in: projectIds }, status: "active" })
    .sort({ createdAt: -1 })
    .toArray()
}

export async function getProjectsForProjectLead(userId: string): Promise<Project[]> {
  const db = await getDatabase()

  return db
    .collection<Project>("projects")
    .find({ projectLeadId: new ObjectId(userId), status: "active" })
    .sort({ createdAt: -1 })
    .toArray()
}

export async function assignUsersToProject(projectId: string, userIds: string[], assignedBy: string): Promise<boolean> {
  try {
    const db = await getDatabase()

    // Remove existing assignments
    await db.collection<ProjectAssignment>("project_assignments").deleteMany({ projectId: new ObjectId(projectId) })

    // Add new assignments
    if (userIds.length > 0) {
      const assignments = userIds.map((userId) => ({
        projectId: new ObjectId(projectId),
        userId: new ObjectId(userId),
        assignedBy: new ObjectId(assignedBy),
        assignedAt: new Date(),
      }))

      await db.collection<ProjectAssignment>("project_assignments").insertMany(assignments)
    }

    return true
  } catch (error) {
    return false
  }
}
