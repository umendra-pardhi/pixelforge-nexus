"use server"

import { supabase } from "./supabase"

// This function should be called once to create the initial admin user
export async function createInitialAdminUser() {
  try {
    // Create the admin user using Supabase Auth Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "admin@pixelforge.com",
      password: "admin123",
      email_confirm: true,
    })

    if (authError) {
      console.error("Error creating auth user:", authError)
      return { success: false, error: authError.message }
    }

    // Create the profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email: "admin@pixelforge.com",
      full_name: "System Administrator",
      role: "admin",
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      return { success: false, error: profileError.message }
    }

    return { success: true, user: authData.user }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Unexpected error occurred" }
  }
}
