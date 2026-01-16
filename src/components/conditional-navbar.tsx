"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/sections/navbar";

export function ConditionalNavbar() {
	const pathname = usePathname();

	// Hide navbar on chat page
	if (pathname === "/chat") {
		return null;
	}

	return <Navbar />;
}
