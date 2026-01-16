"use client";

import { useSignIn } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function CustomSignIn({
	className,
	...props
}: React.ComponentProps<"form">) {
	const router = useRouter();
	const { isLoaded, signIn, setActive } = useSignIn();
	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!isLoaded || !emailAddress || !password) return;

		setIsLoading(true);
		setError("");

		try {
			const result = await signIn.create({
				identifier: emailAddress,
				password,
			});

			if (result.status === "complete") {
				await setActive({ session: result.createdSessionId });
				router.push("/chat");
			} else {
				// Handle multi-factor or other incomplete states
				console.log(result);
				setError("Please complete additional verification steps.");
			}
		} catch (err: any) {
			setError(
				err.errors?.[0]?.message || "Invalid credentials. Please try again.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleOAuthSignIn = async (strategy: "oauth_google") => {
		if (!isLoaded) return;

		try {
			await signIn.authenticateWithRedirect({
				strategy,
				redirectUrl: "/chat",
				redirectUrlComplete: "/chat",
			});
		} catch (err: any) {
			setError(err.errors?.[0]?.message || "Failed to sign in with Google.");
		}
	};

	if (!isLoaded) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-muted-foreground text-sm">Loading...</div>
			</div>
		);
	}

	return (
		<form
			className={cn("flex flex-col gap-6", className)}
			onSubmit={handleSubmit}
			{...props}
		>
			<FieldGroup>
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="font-bold text-2xl">Continue to AgentKit</h1>
				</div>

				<Field>
					<Button
						type="button"
						variant="outline"
						className="h-11 w-full cursor-pointer justify-start gap-3"
						onClick={() => handleOAuthSignIn("oauth_google")}
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
						<span className="ml-auto rounded bg-muted px-2 py-0.5 text-muted-foreground text-xs">
							Last used
						</span>
					</Button>
				</Field>

				<FieldSeparator>or</FieldSeparator>

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
						placeholder="Enter your password"
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
					<Button
						type="submit"
						className="w-full"
						disabled={isLoading || !emailAddress || !password}
					>
						Continue
						<ArrowRight className="size-4" />
					</Button>
				</Field>

				<FieldDescription className="text-center text-xs">
					Don&apos;t have an account?{" "}
					<Link
						href="/sign-up"
						className="font-medium underline underline-offset-4"
					>
						Sign up
					</Link>
				</FieldDescription>

				<div className="flex flex-col items-center gap-2 pt-4">
					<div className="flex items-center gap-2 text-muted-foreground text-xs">
						<span>Secured by</span>
						<svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 0L2 4v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V4l-10-4z" />
						</svg>
						<span className="font-medium">Clerk</span>
					</div>
					<div className="text-orange-600 text-xs dark:text-orange-400">
						Development mode
					</div>
				</div>
			</FieldGroup>
		</form>
	);
}
