"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  projectLeadId?: string
  assignments?: User[]
}

interface AdminAssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
  onSuccess: () => void
}

export function AdminAssignDialog({ open, onOpenChange, project, onSuccess }: AdminAssignDialogProps) {
  const [users, setUsers] = useState<User[]>([])
  const [projectLeadId, setProjectLeadId] = useState<string>(project.projectLeadId || "none")
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open, project._id])

  const fetchData = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const allUsers = await response.json()
        setUsers(allUsers)
      }

      // Get current assignments
      const assigned = project.assignments?.map((user) => user._id) || []
      setAssignedUserIds(assigned)
      setSelectedUserIds(assigned)
      setProjectLeadId(project.projectLeadId || "none")
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

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
      // Update project lead if changed
      if (projectLeadId !== project.projectLeadId) {
        const leadResponse = await fetch(`/api/projects/${project._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projectLeadId: projectLeadId === "none" ? null : projectLeadId }),
        })

        if (!leadResponse.ok) {
          const data = await leadResponse.json()
          throw new Error(data.error || "Failed to update project lead")
        }
      }

      // Update assignments
      const assignResponse = await fetch(`/api/projects/${project._id}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds: selectedUserIds }),
      })

      if (!assignResponse.ok) {
        const data = await assignResponse.json()
        throw new Error(data.error || "Failed to update assignments")
      }

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      setError(error.message || "Failed to update project")
    } finally {
      setLoading(false)
    }
  }

  const projectLeads = users.filter((user) => user.role === "project_lead")
  const developers = users.filter((user) => user.role === "developer")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Team Members & Project Lead</DialogTitle>
          <DialogDescription>Manage assignments for "{project.name}"</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Project Lead Selection */}
          <div className="space-y-3">
            <h4 className="font-medium">Project Lead</h4>
            <Select value={projectLeadId} onValueChange={setProjectLeadId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project lead (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No project lead</SelectItem>
                {projectLeads.map((lead) => (
                  <SelectItem key={lead._id} value={lead._id}>
                    {lead.fullName} ({lead.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Developer Assignments */}
          <div className="space-y-3">
            <h4 className="font-medium">Assign Developers</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
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
