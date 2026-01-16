interface SectionHeaderProps {
	children: React.ReactNode;
}

export function SectionHeader({ children }: SectionHeaderProps) {
	return (
		<div className="h-full w-full border-b p-10 md:p-14">
			<div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-2">
				{children}
			</div>
		</div>
	);
}
