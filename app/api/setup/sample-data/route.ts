import { NextResponse } from "next/server"
import { createUser } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"

export async function POST() {
  try {
    const db = await getDatabase()

    // Check if admin exists
    const admin = await db.collection("users").findOne({ role: "admin" })
    if (!admin) {
      return NextResponse.json({ success: false, error: "Admin user not found" })
    }

    // Create sample users
    const sampleUsers = [
      { email: "lead@pixelforge.com", password: "admin123", fullName: "John Smith", role: "project_lead" as const },
      { email: "alice@pixelforge.com", password: "admin123", fullName: "Alice Johnson", role: "developer" as const },
      { email: "bob@pixelforge.com", password: "admin123", fullName: "Bob Wilson", role: "developer" as const },
      { email: "charlie@pixelforge.com", password: "admin123", fullName: "Charlie Brown", role: "developer" as const },
      { email: "sarah@pixelforge.com", password: "admin123", fullName: "Sarah Davis", role: "project_lead" as const },
    ]

    const createdUsers = []
    for (const userData of sampleUsers) {
      const result = await createUser(userData)
      if (result.success) {
        createdUsers.push({ ...userData, _id: result.userId })
      }
    }

    // Create sample projects
    const johnSmith = createdUsers.find((u) => u.email === "lead@pixelforge.com")
    const sarahDavis = createdUsers.find((u) => u.email === "sarah@pixelforge.com")

    const projects = [
      {
        name: "PixelQuest Mobile Game",
        description: "Development of a fantasy RPG mobile game with real-time multiplayer battles.",
        deadline: new Date("2024-06-15"),
        status: "active" as const,
        createdBy: admin._id,
        projectLeadId: johnSmith?._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Company Website Redesign",
        description: "Complete overhaul of the Creative SkillZ LLC website with modern UI/UX design.",
        deadline: new Date("2024-04-30"),
        status: "active" as const,
        createdBy: admin._id,
        projectLeadId: johnSmith?._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "AR Puzzle Adventure",
        description: "Innovative augmented reality puzzle game that combines physical and digital elements.",
        deadline: new Date("2024-08-20"),
        status: "active" as const,
        createdBy: admin._id,
        projectLeadId: sarahDavis?._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const projectResults = await db.collection("projects").insertMany(projects)
    const projectIds = Object.values(projectResults.insertedIds)

    // Create sample assignments
    const alice = createdUsers.find((u) => u.email === "alice@pixelforge.com")
    const bob = createdUsers.find((u) => u.email === "bob@pixelforge.com")
    const charlie = createdUsers.find((u) => u.email === "charlie@pixelforge.com")

    const assignments = [
      { projectId: projectIds[0], userId: alice?._id, assignedBy: johnSmith?._id, assignedAt: new Date() },
      { projectId: projectIds[0], userId: bob?._id, assignedBy: johnSmith?._id, assignedAt: new Date() },
      { projectId: projectIds[1], userId: alice?._id, assignedBy: johnSmith?._id, assignedAt: new Date() },
      { projectId: projectIds[2], userId: bob?._id, assignedBy: sarahDavis?._id, assignedAt: new Date() },
      { projectId: projectIds[2], userId: charlie?._id, assignedBy: sarahDavis?._id, assignedAt: new Date() },
    ].filter((a) => a.userId && a.assignedBy)

    if (assignments.length > 0) {
      await db.collection("project_assignments").insertMany(assignments)
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdUsers.length} users, ${projects.length} projects, and ${assignments.length} assignments`,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create sample data" }, { status: 500 })
  }
}
