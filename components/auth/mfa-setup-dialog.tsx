"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Smartphone, Key } from "lucide-react"

interface MFASetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function MFASetupDialog({ open, onOpenChange, onSuccess }: MFASetupDialogProps) {
  const [step, setStep] = useState<"setup" | "verify">("setup")
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSetupMFA = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/mfa/setup", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setQrCode(data.qrCode)
        setSecret(data.secret)
        setStep("verify")
      } else {
        setError(data.error || "Failed to setup MFA")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyMFA = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: verificationCode }),
      })

      const data = await response.json()

      if (response.ok) {
        onOpenChange(false)
        onSuccess()
      } else {
        setError(data.error || "Invalid verification code")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Setup Multi-Factor Authentication
          </DialogTitle>
          <DialogDescription>Add an extra layer of security to your account</DialogDescription>
        </DialogHeader>

        {step === "setup" && (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Step 1: Install Authenticator App
                </CardTitle>
                <CardDescription>
                  Download and install an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Step 2: Generate QR Code
                </CardTitle>
                <CardDescription>
                  Click the button below to generate a QR code for your authenticator app
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleSetupMFA} disabled={loading} className="w-full">
                  {loading ? "Generating..." : "Generate QR Code"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="text-center space-y-4">
              <div className="p-4 bg-white rounded-lg border">
                <img src={qrCode || "/placeholder.svg"} alt="MFA QR Code" className="mx-auto" />
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Scan this QR code with your authenticator app</p>
                <p className="mt-2">Or manually enter this secret key:</p>
                <code className="bg-muted px-2 py-1 rounded text-xs">{secret}</code>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification-code">Enter Verification Code</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                disabled={loading}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep("setup")} disabled={loading}>
                Back
              </Button>
              <Button onClick={handleVerifyMFA} disabled={loading || verificationCode.length !== 6}>
                {loading ? "Verifying..." : "Verify & Enable MFA"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "setup" && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
