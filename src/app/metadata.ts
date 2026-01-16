import { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
	title: "AgentKit - AI Agent Starter Template",
	description:
		"Build production-ready AI agents with web search, authentication, and beautiful chat UI. Open-source starter template built with Next.js, AI SDK, and Vercel.",
	keywords: [
		"AgentKit",
		"AI agent starter",
		"web search agent",
		"Next.js AI template",
		"Vercel AI SDK",
		"open source AI",
		"AI chat template",
		"Next.js template",
		"TypeScript",
		"Prisma",
		"PostgreSQL",
		"Clerk authentication",
		"shadcn/ui",
		"Tailwind CSS",
	],
	authors: [
		{
			name: "Anayat Khan",
			url: "https://x.com/anayatkhan09",
		},
	],
	creator: "anayatkhan09",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: siteConfig.url,
		title: "AgentKit - AI Agent Starter Template",
		description:
			"Build production-ready AI agents with web search, authentication, and beautiful chat UI. Open-source starter template built with Next.js, AI SDK, and Vercel.",
		siteName: "AgentKit",
	},
	twitter: {
		card: "summary_large_image",
		title: "AgentKit - AI Agent Starter Template",
		description:
			"Build production-ready AI agents with web search, authentication, and beautiful chat UI. Open-source starter template.",
		creator: "@anayatkhan09",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};
