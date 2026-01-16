"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { motion, useInView } from "motion/react";
import React, {
	forwardRef,
	ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";

import { cn } from "@/lib/utils";

type AccordionItemProps = {
	children: React.ReactNode;
	className?: string;
} & Accordion.AccordionItemProps;

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
	({ children, className, ...props }, forwardedRef) => (
		<Accordion.Item
			className={cn(
				"mt-px overflow-hidden focus-within:relative focus-within:z-10",
				className,
			)}
			{...props}
			ref={forwardedRef}
		>
			{children}
		</Accordion.Item>
	),
);
AccordionItem.displayName = "AccordionItem";

type AccordionTriggerProps = {
	children: React.ReactNode;
	className?: string;
};

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
	({ children, className, ...props }, forwardedRef) => (
		<Accordion.Header className="flex">
			<Accordion.Trigger
				className={cn(
					"group flex h-[45px] flex-1 cursor-pointer items-center justify-between p-3 text-[15px] leading-none outline-none",
					className,
				)}
				{...props}
				ref={forwardedRef}
			>
				{children}
			</Accordion.Trigger>
		</Accordion.Header>
	),
);
AccordionTrigger.displayName = "AccordionTrigger";

type AccordionContentProps = {
	children: ReactNode;
	className?: string;
} & Accordion.AccordionContentProps;

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
	({ children, className, ...props }, forwardedRef) => (
		<Accordion.Content
			className={cn(
				"overflow-hidden font-medium text-[15px] data-[state=closed]:animate-slide-up data-[state=open]:animate-slide-down",
				className,
			)}
			{...props}
			ref={forwardedRef}
		>
			<div className="p-3">{children}</div>
		</Accordion.Content>
	),
);
AccordionContent.displayName = "AccordionContent";

type FeatureItem = {
	id: number;
	title: string;
	content: string;
	image?: string;
	video?: string;
};
type FeatureProps = {
	collapseDelay?: number;
	ltr?: boolean;
	linePosition?: "left" | "right" | "top" | "bottom";
	lineColor?: string;
	featureItems: FeatureItem[];
};

export const Feature = ({
	collapseDelay = 5000,
	ltr = false,
	linePosition = "left",
	lineColor = "bg-neutral-500 dark:bg-white",
	featureItems,
}: FeatureProps) => {
	const [currentIndex, setCurrentIndex] = useState<number>(-1);
	const [imageLoaded, setImageLoaded] = useState<boolean>(false);
	const [previousIndex, setPreviousIndex] = useState<number>(-1);

	const carouselRef = useRef<HTMLUListElement>(null);
	const ref = useRef(null);
	const isInView = useInView(ref, {
		once: true,
		amount: 0.5,
	});

	useEffect(() => {
		const timer = setTimeout(() => {
			if (isInView) {
				setCurrentIndex(0);
			} else {
				setCurrentIndex(-1);
			}
		}, 100);

		return () => clearTimeout(timer);
	}, [isInView]);

	const scrollToIndex = (index: number) => {
		if (carouselRef.current) {
			const card = carouselRef.current.querySelectorAll(".card")[index];
			if (card) {
				const cardRect = card.getBoundingClientRect();
				const carouselRect = carouselRef.current.getBoundingClientRect();
				const offset =
					cardRect.left -
					carouselRect.left -
					(carouselRect.width - cardRect.width) / 2;

				carouselRef.current.scrollTo({
					left: carouselRef.current.scrollLeft + offset,
					behavior: "smooth",
				});
			}
		}
	};

	// interval for changing images
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentIndex((prevIndex) =>
				prevIndex !== undefined ? (prevIndex + 1) % featureItems.length : 0,
			);
		}, collapseDelay);

		return () => clearInterval(timer);
	}, [collapseDelay, currentIndex, featureItems.length]);

	useEffect(() => {
		const handleAutoScroll = () => {
			const nextIndex =
				(currentIndex !== undefined ? currentIndex + 1 : 0) %
				featureItems.length;
			scrollToIndex(nextIndex);
		};

		const autoScrollTimer = setInterval(handleAutoScroll, collapseDelay);

		return () => clearInterval(autoScrollTimer);
	}, [collapseDelay, currentIndex, featureItems.length]);

	useEffect(() => {
		const carousel = carouselRef.current;
		if (carousel) {
			const handleScroll = () => {
				const scrollLeft = carousel.scrollLeft;
				const cardWidth = carousel.querySelector(".card")?.clientWidth || 0;
				const newIndex = Math.min(
					Math.floor(scrollLeft / cardWidth),
					featureItems.length - 1,
				);
				setCurrentIndex(newIndex);
			};

			carousel.addEventListener("scroll", handleScroll);
			return () => carousel.removeEventListener("scroll", handleScroll);
		}
	}, [featureItems.length]);

	// Handle image transition
	useEffect(() => {
		if (currentIndex !== previousIndex) {
			setImageLoaded(false);
			setPreviousIndex(currentIndex);
		}
	}, [currentIndex, previousIndex]);

	// Replace the existing image rendering section with this optimized version
	const renderMedia = () => {
		const currentItem = featureItems[currentIndex];

		if (!currentItem) {
			return (
				<div className="aspect-auto h-full w-full animate-pulse rounded-xl border border-neutral-300/50 bg-gray-200 p-1" />
			);
		}

		if (currentItem.image) {
			return (
				<div className="relative h-full w-full overflow-hidden">
					{/* Placeholder/Fallback */}
					<div
						className={cn(
							"absolute inset-0 rounded-xl border border-neutral-300/50 bg-gray-200",
							"transition-all duration-150",
							imageLoaded ? "opacity-0" : "opacity-100",
						)}
					/>

					{/* Main Image */}
					<motion.img
						key={currentIndex}
						src={currentItem.image}
						alt={currentItem.title}
						className={cn(
							"aspect-auto h-full w-full rounded-xl border border-neutral-300/50 object-cover p-1",
							"transition-all duration-300",
							imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-xl",
						)}
						initial={{
							opacity: 0,
							filter: "blur(5px)",
						}}
						animate={{
							opacity: imageLoaded ? 1 : 0,
							filter: imageLoaded ? "blur(0px)" : "blur(5px)",
						}}
						transition={{
							duration: 0.3,
							ease: [0.4, 0, 0.2, 1],
						}}
						onLoad={() => setImageLoaded(true)}
						loading="eager"
						sizes="(max-width: 768px) 100vw, 50vw"
					/>
				</div>
			);
		}

		if (currentItem.video) {
			return (
				<video
					preload="auto"
					src={currentItem.video}
					className="aspect-auto h-full w-full rounded-lg object-cover"
					autoPlay
					loop
					muted
					playsInline // Better mobile support
				/>
			);
		}

		return (
			<div className="aspect-auto h-full w-full rounded-xl border border-neutral-300/50 bg-gray-200 p-1" />
		);
	};

	return (
		<div ref={ref} className="w-full">
			<div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center">
				<div className="grid h-full w-full grid-cols-5 items-center gap-x-10 px-10 md:px-20">
					<div
						className={`col-span-2 hidden h-full w-full md:items-center lg:flex ${
							ltr ? "md:order-2 md:justify-end" : "justify-start"
						}`}
					>
						<Accordion.Root
							className="flex h-full w-full flex-col gap-8"
							type="single"
							defaultValue={`item-${currentIndex}`}
							value={`item-${currentIndex}`}
							onValueChange={(value) =>
								setCurrentIndex(Number(value.split("-")[1]))
							}
						>
							{featureItems.map((item, index) => (
								<AccordionItem
									key={item.id}
									className={cn(
										"relative rounded-lg data-[state=closed]:rounded-none data-[state=closed]:border-0 data-[state=open]:bg-white dark:data-[state=open]:bg-[#27272A]",
										"dark:data-[state=open]:shadow-[0px_0px_0px_1px_rgba(249,250,251,0.06),0px_0px_0px_1px_var(--color-zinc-800,#27272A),0px_1px_2px_-0.5px_rgba(0,0,0,0.24),0px_2px_4px_-1px_rgba(0,0,0,0.24)]",
										"data-[state=open]:shadow-[0px_0px_1px_0px_rgba(0,0,0,0.16),0px_1px_2px_-0.5px_rgba(0,0,0,0.16)]",
									)}
									value={`item-${index}`}
								>
									<div
										className={cn(
											"absolute overflow-hidden rounded-lg transition-opacity",
											"data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
											"bg-neutral-300/50 dark:bg-neutral-300/30",
											{
												"top-0 bottom-0 left-0 h-full w-0.5":
													linePosition === "left",
												"top-0 right-0 bottom-0 h-full w-0.5":
													linePosition === "right",
												"top-0 right-0 left-0 h-0.5 w-full":
													linePosition === "top",
												"right-0 bottom-0 left-0 h-0.5 w-full":
													linePosition === "bottom",
											},
										)}
										data-state={currentIndex === index ? "open" : "closed"}
									>
										<div
											className={cn(
												"absolute transition-all ease-linear",
												lineColor,
												{
													"top-0 left-0 w-full": ["left", "right"].includes(
														linePosition,
													),
													"top-0 left-0 h-full": ["top", "bottom"].includes(
														linePosition,
													),
												},
												currentIndex === index
													? ["left", "right"].includes(linePosition)
														? "h-full"
														: "w-full"
													: ["left", "right"].includes(linePosition)
														? "h-0"
														: "w-0",
											)}
											style={{
												transitionDuration:
													currentIndex === index ? `${collapseDelay}ms` : "0s",
											}}
										/>
									</div>
									<AccordionTrigger className="text-left font-semibold text-lg tracking-tight">
										{item.title}
									</AccordionTrigger>
									<AccordionContent className="font-medium text-sm">
										{item.content}
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion.Root>
					</div>
					<div
						className={`col-span-5 h-[350px] min-h-[200px] w-auto lg:col-span-3 ${
							ltr && "md:order-1"
						}`}
					>
						{renderMedia()}
					</div>

					<ul
						ref={carouselRef}
						className="col-span-5 flex snap-x snap-mandatory flex-nowrap overflow-x-auto [-ms-overflow-style:none] [-webkit-mask-image:linear-gradient(90deg,transparent,black_10%,white_90%,transparent)] [mask-image:linear-gradient(90deg,transparent,black_10%,white_90%,transparent)] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
						style={{
							padding: "50px calc(50%)",
						}}
					>
						{featureItems.map((item, index) => (
							<a
								key={item.id}
								className="card relative grid h-full max-w-64 shrink-0 items-start justify-center border-t border-b border-l bg-background p-3 first:rounded-tl-xl last:rounded-tr-xl last:border-r"
								onClick={() => setCurrentIndex(index)}
								style={{
									scrollSnapAlign: "center",
								}}
							>
								<div
									className={cn(
										"absolute overflow-hidden rounded-lg transition-opacity",
										"data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
										"bg-neutral-300/50 dark:bg-neutral-300/30",
										{
											"top-0 bottom-0 left-0 h-full w-0.5":
												linePosition === "left",
											"top-0 right-0 bottom-0 h-full w-0.5":
												linePosition === "right",
											"top-0 right-0 left-0 h-0.5 w-full":
												linePosition === "top",
											"right-0 bottom-0 left-0 h-0.5 w-full":
												linePosition === "bottom",
										},
									)}
									data-state={currentIndex === index ? "open" : "closed"}
								>
									<div
										className={cn(
											"absolute transition-all ease-linear",
											lineColor,
											{
												"top-0 left-0 w-full": ["left", "right"].includes(
													linePosition,
												),
												"top-0 left-0 h-full": ["top", "bottom"].includes(
													linePosition,
												),
											},
											currentIndex === index
												? ["left", "right"].includes(linePosition)
													? "h-full"
													: "w-full"
												: ["left", "right"].includes(linePosition)
													? "h-0"
													: "w-0",
										)}
										style={{
											transitionDuration:
												currentIndex === index ? `${collapseDelay}ms` : "0s",
										}}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<h2 className="font-bold text-lg">{item.title}</h2>
									<p className="mx-0 max-w-sm text-balance font-medium text-sm leading-relaxed">
										{item.content}
									</p>
								</div>
							</a>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
};
