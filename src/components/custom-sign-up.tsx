"use client"

import { useState } from "react"
import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CustomSignUp({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const { isLoaded, signUp, setActive } = useSignUp()
  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [pendingVerification, setPendingVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isLoaded) return

    setIsLoading(true)
    setError("")

    try {
      if (pendingVerification) {
        const result = await signUp.attemptEmailAddressVerification({
          code: verificationCode,
        })

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId })
          router.push("/chat")
        } else {
          console.log(result)
        }
      } else {
        await signUp.create({
          emailAddress,
          password,
        })

        await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
        setPendingVerification(true)
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignUp = async (strategy: "oauth_google") => {
    if (!isLoaded) return

    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/chat",
        redirectUrlComplete: "/chat",
      })
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to sign up with Google.")
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Get started with AgentKit today
          </p>
        </div>

        <Field>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-3 h-11"
            onClick={() => handleOAuthSignUp("oauth_google")}
            disabled={isLoading}
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </Field>

        <FieldSeparator>or</FieldSeparator>

        {pendingVerification ? (
          <>
            <Field>
              <FieldLabel htmlFor="code">Verification code</FieldLabel>
              <Input
                id="code"
                type="text"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                disabled={isLoading}
              />
              <FieldDescription>
                We sent a verification code to {emailAddress}
              </FieldDescription>
            </Field>

            {error && (
              <Field>
                <FieldError>{error}</FieldError>
              </Field>
            )}

            <Field>
              <Button type="submit" className="w-full" disabled={isLoading || !verificationCode}>
                Verify Email
                <ArrowRight className="size-4" />
              </Button>
            </Field>

            <Field>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setPendingVerification(false)
                  setVerificationCode("")
                  setError("")
                }}
              >
                Back to sign up
              </Button>
            </Field>
          </>
        ) : (
          <>
            <Field>
              <FieldLabel htmlFor="email">Email address</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                required
                disabled={isLoading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </Field>

            {error && (
              <Field>
                <FieldError>{error}</FieldError>
              </Field>
            )}

            <Field>
              <Button type="submit" className="w-full" disabled={isLoading || !emailAddress || !password}>
                Create account
                <ArrowRight className="size-4" />
              </Button>
            </Field>

            <FieldDescription className="text-center text-xs">
              Already have an account?{" "}
              <Link href="/sign-in" className="underline underline-offset-4 font-medium">
                Sign in
              </Link>
            </FieldDescription>
          </>
        )}

        <div className="flex flex-col items-center gap-2 pt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Secured by</span>
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L2 4v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V4l-10-4z" />
            </svg>
            <span className="font-medium">Clerk</span>
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400">
            Development mode
          </div>
        </div>
      </FieldGroup>
    </form>
  )
}

