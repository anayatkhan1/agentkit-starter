import { SectionHeader } from "@/components/section-header";
import { Feature as FeatureComponent } from "@/components/ui/feature-slideshow";
import { siteConfig } from "@/lib/config";

export function FeatureSection() {
	const { title, description, items } = siteConfig.featureSection;

	return (
		<section
			id="features"
			className="relative flex w-full flex-col items-center justify-center gap-5"
		>
			<SectionHeader>
				<h2 className="text-balance text-center font-medium text-3xl tracking-tighter md:text-4xl">
					{title}
				</h2>
				<p className="text-balance text-center font-medium text-muted-foreground">
					{description}
				</p>
			</SectionHeader>
			<div className="flex h-full w-full items-center justify-center lg:h-[450px]">
				<FeatureComponent
					collapseDelay={5000}
					linePosition="bottom"
					featureItems={items}
					lineColor="bg-secondary"
				/>
			</div>
		</section>
	);
}
