import { SectionHeader } from "@/components/section-header";
import { SocialProofTestimonials } from "@/components/testimonial-scroll";
import { siteConfig } from "@/lib/config";

export function TestimonialSection() {
	const { testimonials } = siteConfig;

	return (
		<section
			id="testimonials"
			className="flex w-full flex-col items-center justify-center"
		>
			<SectionHeader>
				<h2 className="text-balance text-center font-medium text-3xl tracking-tighter md:text-4xl">
					Empower Your Workflow with AI
				</h2>
				<p className="text-balance text-center font-medium text-muted-foreground">
					Ask your AI Agent for real-time collaboration, seamless integrations,
					and actionable insights to streamline your operations.
				</p>
			</SectionHeader>
			<SocialProofTestimonials testimonials={testimonials} />
		</section>
	);
}
