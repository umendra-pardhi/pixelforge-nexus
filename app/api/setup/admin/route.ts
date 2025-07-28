import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"

export async function POST() {
  try {
    console.log("Starting admin user creation...")

    // Test MongoDB connection first
    const db = await getDatabase()
    console.log("MongoDB connection successful")

    // Check if admin user already exists
    const existingAdmin = await db.collection("users").findOne({ role: "admin" })
    if (existingAdmin) {
      console.log("Admin user already exists")
      return NextResponse.json({ success: false, error: "Admin user already exists" })
    }

    // Hash the password
    console.log("Hashing password...")
    const hashedPassword = await hashPassword("admin123")
    console.log("Password hashed successfully")

    // Create admin user
    const now = new Date()
    const adminUser = {
      email: "admin@pixelforge.com",
      password: hashedPassword,
      fullName: "System Administrator",
      role: "admin",
      createdAt: now,
      updatedAt: now,
      isActive: true,
    }

    console.log("Inserting admin user into database...")
    const result = await db.collection("users").insertOne(adminUser)
    console.log("Admin user created with ID:", result.insertedId)

    return NextResponse.json({
      success: true,
      userId: result.insertedId,
      message: "Admin user created successfully",
    })
  } catch (error) {
    console.error("Detailed error creating admin user:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to create admin user: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
