/* eslint-disable @next/next/no-img-element */
"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Icons } from "@/components/icons";
import {
	Reasoning,
	ReasoningContent,
	ReasoningResponse,
} from "@/components/ui/reasoning";

export function ReasoningBasic() {
	const reasoningText = `Based on your calendar patterns and preferences, I recommend scheduling the team meeting for Tuesday at 2pm. This time slot has historically had the highest attendance rate, and it avoids conflicts with other recurring meetings.`;

	return (
		<Reasoning>
			<ReasoningContent className="">
				<ReasoningResponse text={reasoningText} />
			</ReasoningContent>
		</Reasoning>
	);
}

export function FirstBentoAnimation() {
	const ref = useRef(null);
	const isInView = useInView(ref);
	const [shouldAnimate, setShouldAnimate] = useState(false);

	useEffect(() => {
		let timeoutId: NodeJS.Timeout;
		if (isInView) {
			timeoutId = setTimeout(() => {
				setShouldAnimate(true);
			}, 1000);
		} else {
			setShouldAnimate(false);
		}

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [isInView]);

	return (
		<div
			ref={ref}
			className="flex h-full w-full flex-col items-center justify-center gap-5 p-4"
		>
			<div className="pointer-events-none absolute bottom-0 left-0 z-20 h-20 w-full bg-gradient-to-t from-background to-transparent"></div>
			<motion.div
				className="mx-auto flex w-full max-w-md flex-col gap-2"
				animate={{
					y: shouldAnimate ? -75 : 0,
				}}
				transition={{
					type: "spring",
					stiffness: 300,
					damping: 20,
				}}
			>
				<div className="flex items-end justify-end gap-3">
					<motion.div
						className="ml-auto max-w-[280px] rounded-2xl bg-secondary p-4 text-white shadow-[0_0_10px_rgba(0,0,0,0.05)]"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{
							duration: 0.3,
							ease: "easeOut",
						}}
					>
						<p className="text-sm">
							Hey, I need help scheduling a team meeting that works well for
							everyone. Any suggestions for finding an optimal time slot?
						</p>
					</motion.div>
					<div className="flex w-fit flex-shrink-0 items-center rounded-full border border-border bg-background">
						<img
							src="https://randomuser.me/api/portraits/women/79.jpg"
							alt="User Avatar"
							className="size-8 flex-shrink-0 rounded-full"
						/>
					</div>
				</div>
				<div className="flex items-start gap-2">
					<div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full border border-border bg-background shadow-[0_0_10px_rgba(0,0,0,0.05)]">
						<Icons.logo className="size-4" />
					</div>

					<div className="relative">
						<AnimatePresence mode="wait">
							{!shouldAnimate ? (
								<motion.div
									key="dots"
									className="absolute top-0 left-0 rounded-2xl border border-border bg-background p-4"
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -10 }}
									transition={{
										duration: 0.2,
										ease: "easeOut",
									}}
								>
									<div className="flex gap-1">
										{[0, 1, 2].map((index) => (
											<motion.div
												key={index}
												className="h-2 w-2 rounded-full bg-primary/50"
												animate={{ y: [0, -5, 0] }}
												transition={{
													duration: 0.6,
													repeat: Infinity,
													delay: index * 0.2,
													ease: "easeInOut",
												}}
											/>
										))}
									</div>
								</motion.div>
							) : (
								<motion.div
									key="response"
									layout
									className="absolute top-0 left-0 min-w-[220px] rounded-xl border border-border bg-accent p-4 shadow-[0_0_10px_rgba(0,0,0,0.05)] md:min-w-[300px]"
									initial={{ opacity: 0, x: 10 }}
									animate={{
										opacity: 1,
										x: 0,
									}}
									exit={{ opacity: 0, x: 20 }}
									transition={{
										duration: 0.3,
										ease: "easeOut",
									}}
								>
									<ReasoningBasic />
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
