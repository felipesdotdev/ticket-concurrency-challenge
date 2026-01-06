"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function StickyHeader() {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 50);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<motion.div
			animate={{
				backgroundColor: isScrolled
					? "rgba(255, 255, 255, 0.72)"
					: "rgba(255, 255, 255, 0)",
				backdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
				height: isScrolled ? 52 : 60,
			}}
			className="sticky top-0 z-40 border-[#d2d2d7]/30 border-b"
		>
			<div className="mx-auto flex h-full max-w-[1024px] items-center justify-between px-6">
				<h2 className="font-semibold text-[21px] tracking-tight">
					Crowd<span className="opacity-50">Pass</span>
				</h2>
				<motion.button
					className="min-w-[60px] rounded-full bg-[#0071E3] px-4 py-1 font-medium text-[12px] text-white"
					onClick={() =>
						document
							.getElementById("configurator")
							?.scrollIntoView({ behavior: "smooth" })
					}
					whileTap={{ scale: 0.98 }}
				>
					Reservar
				</motion.button>
			</div>
		</motion.div>
	);
}
