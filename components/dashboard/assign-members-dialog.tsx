"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface User {
  _id: string
  email: string
  fullName: string
  role: "admin" | "project_lead" | "developer"
}

interface Project {
  _id: string
  name: string
  assignments?: User[]
}

interface AssignMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
  onSuccess: () => void
}

export function AssignMembersDialog({ open, onOpenChange, project, onSuccess }: AssignMembersDialogProps) {
  const [developers, setDevelopers] = useState<User[]>([])
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchData = async () => {
    try {
      setLoading(true)

      // Use the correct API endpoint that allows project leads to fetch users
      const response = await fetch("/api/users/all")
      if (response.ok) {
        const users = await response.json()
        console.log("All users fetched:", users.length)
        const devs = users.filter((user: User) => user.role === "developer")
        console.log("Developers found:", devs.length)
        setDevelopers(devs)
      } else {
        console.error("Failed to fetch users:", response.status, response.statusText)
        const errorData = await response.json()
        console.error("Error details:", errorData)
      }

      // Get current assignments
      const assigned = project.assignments?.map((user) => user._id) || []
      setAssignedUserIds(assigned)
      setSelectedUserIds(assigned)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open, project._id])

  const handleUserToggle = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds([...selectedUserIds, userId])
    } else {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId))
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/projects/${project._id}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds: selectedUserIds }),
      })

      const data = await response.json()

      if (response.ok) {
        onOpenChange(false)
        onSuccess()
      } else {
        setError(data.error || "Failed to update assignments")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Team Members</DialogTitle>
          <DialogDescription>Select developers to assign to "{project.name}"</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {developers.map((developer) => {
              const isSelected = selectedUserIds.includes(developer._id)
              const wasAssigned = assignedUserIds.includes(developer._id)

              return (
                <div key={developer._id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={developer._id}
                    checked={isSelected}
                    onCheckedChange={(checked) => handleUserToggle(developer._id, checked as boolean)}
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <label htmlFor={developer._id} className="font-medium cursor-pointer">
                      {developer.fullName}
                    </label>
                    <div className="text-sm text-muted-foreground">{developer.email}</div>
                  </div>
                  {wasAssigned && <Badge variant="secondary">Currently Assigned</Badge>}
                </div>
              )
            })}
          </div>

          {developers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No developers available for assignment.</p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating..." : "Update Assignments"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
