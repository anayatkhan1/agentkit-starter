import { ClerkProvider } from "@clerk/nextjs";
import { GeistMono } from "geist/font/mono";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { siteConfig } from "@/lib/site";
import { metadata as siteMetadata } from "./metadata";
import "./globals.css";

export const viewport: Viewport = {
	themeColor: "black",
};

export const metadata = {
	...siteMetadata,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang="en" suppressHydrationWarning>
				<body
					className={`${GeistMono.className} bg-background font-sans antialiased`}
				>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{children}
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
