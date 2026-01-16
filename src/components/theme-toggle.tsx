"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return (
		<div className="flex w-fit items-center rounded-full border bg-background p-1">
			<button
				onClick={() => setTheme("system")}
				className={`cursor-pointer rounded-full p-1.5 transition-all ${
					theme === "system"
						? "bg-muted text-foreground"
						: "text-muted-foreground hover:text-foreground"
				}`}
				aria-label="System theme"
			>
				<div className="relative flex h-4 w-4 items-center justify-center">
					<Monitor className="h-4 w-4" />
				</div>
			</button>
			<button
				onClick={() => setTheme("light")}
				className={`cursor-pointer rounded-full p-1.5 transition-all ${
					theme === "light"
						? "bg-muted text-foreground"
						: "text-muted-foreground hover:text-foreground"
				}`}
				aria-label="Light theme"
			>
				<Sun className="h-4 w-4" />
			</button>
			<button
				onClick={() => setTheme("dark")}
				className={`cursor-pointer rounded-full p-1.5 transition-all ${
					theme === "dark"
						? "bg-muted text-foreground"
						: "text-muted-foreground hover:text-foreground"
				}`}
				aria-label="Dark theme"
			>
				<Moon className="h-4 w-4" />
			</button>
		</div>
	);
}
