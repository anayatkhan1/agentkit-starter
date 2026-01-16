"use client";

import { ChevronRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { useMediaQuery } from "@/hooks/use-media-query";
import { siteConfig } from "@/lib/config";
export function FooterSection() {
	const tablet = useMediaQuery("(max-width: 1024px)");

	return (
		<footer id="footer" className="w-full pb-0">
			<div className="flex flex-col p-10 md:flex-row md:items-center md:justify-between">
				<div className="mx-0 flex max-w-xs flex-col items-start justify-start gap-y-5">
					<Link href="/" className="flex items-center gap-2">
						<Icons.logo className="size-8" />
						<p className="font-semibold text-primary text-xl">AgentKit</p>
					</Link>
					<p className="font-medium text-muted-foreground tracking-tight">
						{siteConfig.hero.description}
					</p>
					<div className="flex items-center gap-2 dark:hidden">
						<Icons.soc2 className="size-12" />
						<Icons.hipaa className="size-12" />
						<Icons.gdpr className="size-12" />
					</div>
					<div className="hidden items-center gap-2 dark:flex">
						<Icons.soc2Dark className="size-12" />
						<Icons.hipaaDark className="size-12" />
						<Icons.gdprDark className="size-12" />
					</div>
				</div>
				<div className="pt-5 md:w-1/2">
					<div className="flex flex-col items-start justify-start gap-y-5 md:flex-row md:items-center md:justify-between lg:pl-10">
						{siteConfig.footerLinks.map((column, columnIndex) => (
							<ul key={columnIndex} className="flex flex-col gap-y-2">
								<li className="mb-2 font-semibold text-primary text-sm">
									{column.title}
								</li>
								{column.links.map((link) => (
									<li
										key={link.id}
										className="group inline-flex cursor-pointer items-center justify-start gap-1 text-[15px]/snug text-muted-foreground"
									>
										<Link href={link.url}>{link.title}</Link>
										<div className="flex size-4 translate-x-0 transform items-center justify-center rounded border border-border opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100">
											<ChevronRightIcon className="h-4 w-4" />
										</div>
									</li>
								))}
							</ul>
						))}
					</div>
				</div>
			</div>
			<div className="relative z-0 mt-24 h-48 w-full md:h-64">
				<div className="absolute inset-0 z-10 bg-gradient-to-t from-40% from-transparent to-background" />
				<div className="absolute inset-0 mx-6">
					<FlickeringGrid
						text={tablet ? "AgentKit" : "Streamline your workflow"}
						fontSize={tablet ? 70 : 90}
						className="h-full w-full"
						squareSize={2}
						gridGap={tablet ? 2 : 3}
						color="#6B7280"
						maxOpacity={0.3}
						flickerChance={0.1}
					/>
				</div>
			</div>
		</footer>
	);
}
