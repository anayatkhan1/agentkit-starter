"use client";

import {
	AnimatePresence,
	motion,
	useInView,
	useMotionValue,
	useSpring,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

interface BoxConfig {
	title: string;
	className: string;
}

const boxConfigs: BoxConfig[] = [
	{
		title: "Bento grid",
		className: "bg-secondary text-white",
	},
	{
		title: "Landing Page",
		className: "bg-secondary/40 text-white",
	},
	{
		title: "Add Task",
		className:
			"bg-secondary/20 border border-secondary border-dashed text-secondary",
	},
];

interface FourthBentoAnimationProps {
	startAnimationDelay?: number;
	once?: boolean;
}

export function FourthBentoAnimation({
	once = false,
	startAnimationDelay = 0,
}: FourthBentoAnimationProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const isInView = useInView(containerRef, { once });
	const [translateXValues, setTranslateXValues] = useState<number[]>([]);

	const mouseX = useMotionValue(0);
	const smoothX = useSpring(mouseX, {
		damping: 50,
		stiffness: 400,
	});

	useEffect(() => {
		if (containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			mouseX.set(rect.width / 2);
		}
	}, [mouseX]);

	const handleMouseMove = (e: React.MouseEvent) => {
		if (containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const adjustedX = e.clientX - rect.left + 100;
			mouseX.set(adjustedX);
		}
	};

	const handleMouseLeave = () => {
		if (containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			mouseX.set(rect.width / 2);
		}
	};

	useEffect(() => {
		const updateWidth = () => {
			if (containerRef.current) {
				const containerWidth =
					containerRef.current.getBoundingClientRect().width;
				const itemWidth = 250;
				const numberOfItems = 3;
				const totalItemsWidth = itemWidth * numberOfItems;
				const availableSpace = containerWidth - totalItemsWidth;
				const gap = availableSpace / (numberOfItems - 1);

				const newTranslateXValues = Array.from(
					{ length: numberOfItems },
					(_, index) => {
						return ((itemWidth + gap) * index) / 2;
					},
				);
				setTranslateXValues(newTranslateXValues);
			}
		};

		updateWidth();

		window.addEventListener("resize", updateWidth);

		// Cleanup event listener on component unmount
		return () => {
			window.removeEventListener("resize", updateWidth);
		};
	}, []);

	return (
		<div
			className="relative flex h-full w-full flex-col"
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
		>
			<div className="absolute inset-0 -z-10 flex [mask:linear-gradient(180deg,transparent,black_40%,black_40%,transparent)]">
				<div className="flex h-full w-1/2 items-start justify-between">
					{Array.from({ length: 5 }).map((_, index) => (
						<div
							key={index}
							className="h-5 w-px bg-primary first:bg-transparent"
						></div>
					))}
				</div>
				<div className="flex h-full w-1/2 items-start justify-between border-border/70 border-x border-dashed">
					{Array.from({ length: 5 }).map((_, index) => (
						<div
							key={index}
							className="h-5 w-px bg-primary first:bg-transparent"
						></div>
					))}
				</div>
				<div className="flex h-full w-1/2 items-start justify-between">
					{Array.from({ length: 5 }).map((_, index) => (
						<div
							key={index}
							className="h-5 w-px bg-primary first:bg-transparent"
						></div>
					))}
				</div>
				<div className="flex h-full w-1/2 items-start justify-between border-border/70 border-x border-dashed">
					{Array.from({ length: 5 }).map((_, index) => (
						<div
							key={index}
							className="h-5 w-px bg-primary first:bg-transparent"
						></div>
					))}
				</div>
				<div className="flex h-full w-1/2 items-start justify-between">
					{Array.from({ length: 5 }).map((_, index) => (
						<div
							key={index}
							className="h-5 w-px bg-primary first:bg-transparent"
						></div>
					))}
				</div>
				<div className="flex h-full w-1/2 items-start justify-between border-border/70 border-x border-dashed">
					{Array.from({ length: 5 }).map((_, index) => (
						<div
							key={index}
							className="h-5 w-px bg-primary first:bg-transparent"
						></div>
					))}
				</div>
				<div className="flex h-full w-1/2 items-start justify-between">
					{Array.from({ length: 5 }).map((_, index) => (
						<div
							key={index}
							className="h-5 w-px bg-primary first:bg-transparent"
						></div>
					))}
				</div>
				<div className="flex h-full w-1/2 items-start justify-between border-border/70 border-x border-dashed">
					{Array.from({ length: 5 }).map((_, index) => (
						<div
							key={index}
							className="h-5 w-px bg-primary first:bg-transparent"
						></div>
					))}
				</div>
			</div>

			{/* Days of the week */}
			<div className="absolute top-4 right-0 left-0 mx-auto flex max-w-md justify-between px-8 text-gray-500 text-sm">
				<span>Tue</span>
				<span>Wed</span>
				<span>Thu</span>
				<span>Fri</span>
				<span>Sat</span>
			</div>

			<motion.div
				className="absolute top-10 z-10 h-[calc(100%-80px)] w-[2px] bg-gradient-to-b from-black to-transparent dark:from-accent"
				style={{
					x: smoothX,
					translateX: "-50%",
				}}
				initial={{ opacity: 0 }}
				animate={{
					opacity: 1,
				}}
				transition={{
					opacity: { duration: 0.2 },
					default: { duration: 0 }, // Makes position update instant
				}}
			/>
			<motion.div
				className="absolute top-14 z-20 flex h-6 items-center justify-center rounded-md bg-black p-2 text-xs shadow-[0px_2.2px_6.6px_0px_rgba(18,43,105,0.04),0px_1.1px_2.2px_0px_rgba(18,43,105,0.08),0px_0px_0px_1.1px_rgba(18,43,105,0.08),0px_1.1px_0px_0px_rgba(255,255,255,0.20)_inset,0px_4.4px_6.6px_0px_rgba(255,255,255,0.01)_inset] dark:bg-accent"
				style={{
					x: smoothX,
					translateX: "-50%",
				}}
				initial={{ opacity: 0 }}
				animate={{
					opacity: 1,
				}}
				transition={{
					opacity: { duration: 0.2 },
					default: { duration: 0 }, // Makes position update instant
				}}
			>
				<span className="text-white">12:00 AM</span>
			</motion.div>

			<div
				className="absolute top-1/2 left-1/2 grid w-full -translate-x-1/3 -translate-y-1/2 gap-10"
				ref={containerRef}
			>
				<AnimatePresence>
					{translateXValues.map((translateX, index) => (
						<motion.div
							key={index}
							initial={{
								opacity: 0,
								x:
									index % 2 === 0
										? -50
										: containerRef.current?.getBoundingClientRect().width || 0,
							}}
							animate={
								isInView
									? {
											opacity: 1,
											x: translateX,
										}
									: {
											opacity: 0,
											x:
												index % 2 === 0
													? -50
													: containerRef.current?.getBoundingClientRect()
															.width || 0,
										}
							}
							exit={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
							transition={{
								type: "spring",
								stiffness: 220,
								damping: 18,
								duration: 0.3,
								delay: startAnimationDelay + index * 0.2,
							}}
							className={`flex h-8 w-[250px] items-center justify-center gap-2 rounded-lg p-2 shadow-[0px_9px_5px_0px_#00000005,0px_4px_4px_0px_#00000009,0px_1px_2px_0px_#00000010] ${boxConfigs[index].className}`}
						>
							<p className="font-medium text-sm">{boxConfigs[index].title}</p>
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</div>
	);
}
