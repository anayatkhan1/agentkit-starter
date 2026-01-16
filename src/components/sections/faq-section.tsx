import { SectionHeader } from "@/components/section-header";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { siteConfig } from "@/lib/config";

export function FAQSection() {
	const { faqSection } = siteConfig;

	return (
		<section
			id="faq"
			className="relative flex w-full flex-col items-center justify-center gap-10 pb-10"
		>
			<SectionHeader>
				<h2 className="text-balance text-center font-medium text-3xl tracking-tighter md:text-4xl">
					{faqSection.title}
				</h2>
				<p className="text-balance text-center font-medium text-muted-foreground">
					{faqSection.description}
				</p>
			</SectionHeader>

			<div className="mx-auto w-full max-w-3xl px-10">
				<Accordion
					type="single"
					collapsible
					className="grid w-full gap-2 border-b-0"
				>
					{faqSection.faQitems.map((faq, index) => (
						<AccordionItem
							key={index}
							value={index.toString()}
							className="grid gap-2 border-0"
						>
							<AccordionTrigger className="cursor-pointer rounded-lg border border-border bg-accent px-4 py-3.5 no-underline hover:no-underline data-[state=open]:ring data-[state=open]:ring-primary/20">
								{faq.question}
							</AccordionTrigger>
							<AccordionContent className="rounded-lg border bg-accent p-3 text-primary">
								<p className="font-medium text-primary leading-relaxed">
									{faq.answer}
								</p>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	);
}
