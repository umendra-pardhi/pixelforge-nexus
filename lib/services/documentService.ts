import { getDatabase } from "../mongodb"
import type { ProjectDocument } from "../models/Project"
import { ObjectId } from "mongodb"
import { uploadToCloudinary, deleteFromCloudinary } from "../cloudinary"

export async function uploadDocument(
  projectId: string,
  file: Buffer,
  filename: string,
  mimeType: string,
  uploadedBy: string,
): Promise<{ success: boolean; error?: string; documentId?: ObjectId }> {
  try {
    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(file, filename, `projects/${projectId}`)

    const db = await getDatabase()
    const now = new Date()

    const document: Omit<ProjectDocument, "_id"> = {
      projectId: new ObjectId(projectId),
      name: uploadResult.original_filename,
      filePath: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      fileSize: uploadResult.bytes,
      mimeType,
      uploadedBy: new ObjectId(uploadedBy),
      uploadedAt: now,
    }

    const result = await db.collection<ProjectDocument>("project_documents").insertOne(document)

    return { success: true, documentId: result.insertedId }
  } catch (error) {
    console.error("Document upload error:", error)
    return { success: false, error: "Failed to upload document" }
  }
}

export async function getProjectDocuments(projectId: string): Promise<ProjectDocument[]> {
  const db = await getDatabase()
  return db
    .collection<ProjectDocument>("project_documents")
    .find({ projectId: new ObjectId(projectId) })
    .sort({ uploadedAt: -1 })
    .toArray()
}

export async function deleteDocument(
  documentId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDatabase()

    // Get document to check permissions and get Cloudinary ID
    const document = await db
      .collection<ProjectDocument>("project_documents")
      .findOne({ _id: new ObjectId(documentId) })

    if (!document) {
      return { success: false, error: "Document not found" }
    }

    // Check if user has permission (admin, project lead, or document uploader)
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
    if (!user) {
      return { success: false, error: "User not found" }
    }

    const canDelete =
      user.role === "admin" ||
      document.uploadedBy.toString() === userId ||
      (user.role === "project_lead" && (await isProjectLead(userId, document.projectId.toString())))

    if (!canDelete) {
      return { success: false, error: "Permission denied" }
    }

    // Delete from Cloudinary
    if (document.cloudinaryId) {
      await deleteFromCloudinary(document.cloudinaryId)
    }

    // Delete from database
    await db.collection<ProjectDocument>("project_documents").deleteOne({ _id: new ObjectId(documentId) })

    return { success: true }
  } catch (error) {
    console.error("Document deletion error:", error)
    return { success: false, error: "Failed to delete document" }
  }
}

async function isProjectLead(userId: string, projectId: string): Promise<boolean> {
  const db = await getDatabase()
  const project = await db.collection("projects").findOne({
    _id: new ObjectId(projectId),
    projectLeadId: new ObjectId(userId),
  })
  return !!project
}
