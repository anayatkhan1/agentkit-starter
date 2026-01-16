"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { SectionHeader } from "@/components/section-header";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

interface TabsProps {
	activeTab: "yearly" | "monthly";
	setActiveTab: (tab: "yearly" | "monthly") => void;
	className?: string;
}

function PricingTabs({ activeTab, setActiveTab, className }: TabsProps) {
	return (
		<div
			className={cn(
				"relative flex h-9 w-fit cursor-pointer flex-row items-center rounded-full border bg-muted p-0.5 backdrop-blur-sm",
				className,
			)}
		>
			{["monthly", "yearly"].map((tab) => (
				<button
					key={tab}
					onClick={() => setActiveTab(tab as "yearly" | "monthly")}
					className={cn(
						"relative z-[1] flex h-8 cursor-pointer items-center justify-center px-2",
						{
							"z-0": activeTab === tab,
						},
					)}
				>
					{activeTab === tab && (
						<motion.div
							layoutId="active-tab"
							className="absolute inset-0 rounded-full border border-border bg-white shadow-md dark:bg-[#3F3F46]"
							transition={{
								duration: 0.2,
								type: "spring",
								stiffness: 300,
								damping: 25,
								velocity: 2,
							}}
						/>
					)}
					<span
						className={cn(
							"relative block shrink-0 font-medium text-sm duration-200",
							activeTab === tab ? "text-primary" : "text-muted-foreground",
						)}
					>
						{tab.charAt(0).toUpperCase() + tab.slice(1)}
						{tab === "yearly" && (
							<span className="ml-2 w-[calc(100%+1rem)] rounded-full bg-secondary/15 px-1 py-0.5 font-semibold text-secondary text-xs">
								-20%
							</span>
						)}
					</span>
				</button>
			))}
		</div>
	);
}

export function PricingSection() {
	const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
		"monthly",
	);

	// Update price animation
	const PriceDisplay = ({
		tier,
	}: {
		tier: (typeof siteConfig.pricing.pricingItems)[0];
	}) => {
		const price = billingCycle === "yearly" ? tier.yearlyPrice : tier.price;

		return (
			<motion.span
				key={price}
				className="font-semibold text-4xl"
				initial={{
					opacity: 0,
					x: billingCycle === "yearly" ? -10 : 10,
					filter: "blur(5px)",
				}}
				animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
				transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
			>
				{price}
			</motion.span>
		);
	};

	return (
		<section
			id="pricing"
			className="relative flex w-full flex-col items-center justify-center gap-10 pb-10"
		>
			<SectionHeader>
				<h2 className="text-balance text-center font-medium text-3xl tracking-tighter md:text-4xl">
					{siteConfig.pricing.title}
				</h2>
				<p className="text-balance text-center font-medium text-muted-foreground">
					{siteConfig.pricing.description}
				</p>
			</SectionHeader>
			<div className="relative h-full w-full">
				<div className="absolute -top-14 left-1/2 -translate-x-1/2">
					<PricingTabs
						activeTab={billingCycle}
						setActiveTab={setBillingCycle}
						className="mx-auto"
					/>
				</div>

				<div className="mx-auto grid w-full max-w-6xl gap-4 px-6 min-[650px]:grid-cols-2 min-[900px]:grid-cols-3">
					{siteConfig.pricing.pricingItems.map((tier) => (
						<div
							key={tier.name}
							className={cn(
								"relative grid h-fit grid-rows-[180px_auto_1fr] rounded-xl min-[650px]:h-full min-[900px]:h-fit",
								tier.isPopular
									? "bg-accent md:shadow-[0px_61px_24px_-10px_rgba(0,0,0,0.01),0px_34px_20px_-8px_rgba(0,0,0,0.05),0px_15px_15px_-6px_rgba(0,0,0,0.09),0px_4px_8px_-2px_rgba(0,0,0,0.10),0px_0px_0px_1px_rgba(0,0,0,0.08)]"
									: "border border-border bg-[#F3F4F6] dark:bg-[#F9FAFB]/[0.02]",
							)}
						>
							<div className="flex flex-col gap-4 p-4">
								<p className="text-sm">
									{tier.name}
									{tier.isPopular && (
										<span className="ml-2 inline-flex h-6 w-fit items-center justify-center rounded-full bg-gradient-to-b from-[1.92%] from-secondary/50 to-[100%] to-secondary px-2 text-sm text-white shadow-[0px_6px_6px_-3px_rgba(0,0,0,0.08),0px_3px_3px_-1.5px_rgba(0,0,0,0.08),0px_1px_1px_-0.5px_rgba(0,0,0,0.08),0px_0px_0px_1px_rgba(255,255,255,0.12)_inset,0px_1px_0px_0px_rgba(255,255,255,0.12)_inset]">
											Popular
										</span>
									)}
								</p>
								<div className="mt-2 flex items-baseline">
									<PriceDisplay tier={tier} />
									<span className="ml-2">
										/{billingCycle === "yearly" ? "year" : "month"}
									</span>
								</div>
								<p className="mt-2 text-sm">{tier.description}</p>
							</div>

							<div className="flex flex-col gap-2 p-4">
								<button
									className={`flex h-10 w-full cursor-pointer items-center justify-center rounded-full px-4 font-normal text-sm tracking-wide transition-all ease-out active:scale-95 ${
										tier.isPopular
											? `${tier.buttonColor} shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_3px_3px_-1.5px_rgba(16,24,40,0.06),0_1px_1px_rgba(16,24,40,0.08)]`
											: `${tier.buttonColor} shadow-[0px_1px_2px_0px_rgba(255,255,255,0.16)_inset,0px_3px_3px_-1.5px_rgba(16,24,40,0.24),0px_1px_1px_-0.5px_rgba(16,24,40,0.20)]`
									}`}
								>
									{tier.buttonText}
								</button>
							</div>
							<hr className="border-border dark:border-white/20" />
							<div className="p-4">
								{tier.name !== "Basic" && (
									<p className="mb-4 text-sm">
										Everything in {tier.name === "Pro" ? "Basic" : "Pro"} +
									</p>
								)}
								<ul className="space-y-3">
									{tier.features.map((feature) => (
										<li key={feature} className="flex items-center gap-2">
											<div
												className={cn(
													"flex size-5 items-center justify-center rounded-full border border-primary/20",
													tier.isPopular &&
														"border-border bg-muted-foreground/40",
												)}
											>
												<div className="flex size-3 items-center justify-center">
													<svg
														width="8"
														height="7"
														viewBox="0 0 8 7"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
														className="block dark:hidden"
													>
														<path
															d="M1.5 3.48828L3.375 5.36328L6.5 0.988281"
															stroke="#101828"
															strokeWidth="1.5"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</svg>

													<svg
														width="8"
														height="7"
														viewBox="0 0 8 7"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
														className="hidden dark:block"
													>
														<path
															d="M1.5 3.48828L3.375 5.36328L6.5 0.988281"
															stroke="#FAFAFA"
															strokeWidth="1.5"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</svg>
												</div>
											</div>
											<span className="text-sm">{feature}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
