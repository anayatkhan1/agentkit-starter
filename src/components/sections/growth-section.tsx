"use client";

import { SectionHeader } from "@/components/section-header";
import { siteConfig } from "@/lib/config";

export function GrowthSection() {
	const { title, description, items } = siteConfig.growthSection;

	return (
		<section
			id="growth"
			className="relative flex w-full flex-col items-center justify-center px-5 md:px-10"
		>
			<div className="relative mx-5 border-x md:mx-10">
				{/* Decorative borders */}
				<div className="absolute top-0 -left-4 h-full w-4 bg-[size:10px_10px] text-gray-950/5 [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)] md:-left-14 md:w-14"></div>
				<div className="absolute top-0 -right-4 h-full w-4 bg-[size:10px_10px] text-gray-950/5 [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)] md:-right-14 md:w-14"></div>

				{/* Section Header */}
				<SectionHeader>
					<h2 className="text-balance text-center font-medium text-3xl tracking-tighter md:text-4xl">
						{title}
					</h2>
					<p className="text-balance text-center font-medium text-muted-foreground">
						{description}
					</p>
				</SectionHeader>

				{/* Grid Layout */}
				<div className="grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
					{items.map((item) => (
						<div
							key={item.id}
							className="flex min-h-[500px] flex-col items-start justify-end gap-2 p-6"
						>
							{item.content}
							<h3 className="font-semibold text-lg tracking-tighter">
								{item.title}
							</h3>
							<p className="text-muted-foreground">{item.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
