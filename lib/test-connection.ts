// Test file to verify MongoDB connection
import { getDatabase } from "./mongodb"

export async function testConnection() {
  try {
    console.log("Testing MongoDB connection...")
    const db = await getDatabase()

    // Test basic operations
    const collections = await db.listCollections().toArray()
    console.log(
      "Available collections:",
      collections.map((c) => c.name),
    )

    // Test user collection
    const userCount = await db.collection("users").countDocuments()
    console.log("Current user count:", userCount)

    return { success: true, message: "Connection successful" }
  } catch (error) {
    console.error("Connection test failed:", error)
    return { success: false, error: error.message }
  }
}
