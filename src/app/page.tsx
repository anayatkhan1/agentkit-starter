import { BentoSection } from "@/components/sections/bento-section";
import { CompanyShowcase } from "@/components/sections/company-showcase";
import { CTASection } from "@/components/sections/cta-section";
import { FAQSection } from "@/components/sections/faq-section";
import { FeatureSection } from "@/components/sections/feature-section";
import { FooterSection } from "@/components/sections/footer-section";
import { GrowthSection } from "@/components/sections/growth-section";
import { HeroSection } from "@/components/sections/hero-section";
import { Navbar } from "@/components/sections/navbar";
import { PricingSection } from "@/components/sections/pricing-section";
import { QuoteSection } from "@/components/sections/quote-section";
import { TestimonialSection } from "@/components/sections/testimonial-section";

export default function Home() {
	return (
		<div className="relative mx-auto max-w-7xl border-x">
			<div className="absolute top-0 left-6 z-10 block h-full w-px border-border border-l"></div>
			<div className="absolute top-0 right-6 z-10 block h-full w-px border-border border-r"></div>
			<Navbar />
			<main className="flex min-h-screen w-full flex-col items-center justify-center divide-y divide-border">
				<HeroSection />
				<CompanyShowcase />
				<BentoSection />
				<QuoteSection />
				<FeatureSection />
				<GrowthSection />
				<PricingSection />
				<TestimonialSection />
				<FAQSection />
				<CTASection />
				<FooterSection />
			</main>
		</div>
	);
}
