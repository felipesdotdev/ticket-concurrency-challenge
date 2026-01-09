"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

const TICKER_MESSAGES = [
	"Últimos ingressos para a Grande Final.",
	"Checkout seguro com criptografia bancária.",
	"Limite de 4 ingressos por torcedor.",
	"Disponibilidade atualizada em tempo real.",
];

const IOS_EASE = [0.19, 1, 0.22, 1] as const;

export function Navbar() {
	const [tickerIndex, setTickerIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setTickerIndex((prev) => (prev + 1) % TICKER_MESSAGES.length);
		}, 4000);
		return () => clearInterval(interval);
	}, []);

	return (
		<nav className="relative z-50 flex h-[44px] items-center justify-center overflow-hidden bg-[#161617] font-normal text-[#E8E8ED]/80 text-[12px]">
			<div className="flex w-full max-w-[1024px] items-center justify-between px-6">
				<div className="flex items-center gap-6">
					<Trophy className="h-4 w-4 text-[#E8E8ED]" fill="currentColor" />
					<div className="hidden gap-6 text-[#E8E8ED] tracking-wide sm:flex">
						<span className="cursor-pointer transition-colors hover:text-white">
							Jogos
						</span>
						<span className="cursor-pointer transition-colors hover:text-white">
							Esportes
						</span>
						<span className="cursor-pointer transition-colors hover:text-white">
							Teatro
						</span>
						<span className="cursor-pointer transition-colors hover:text-white">
							Festivais
						</span>
						<span className="cursor-pointer transition-colors hover:text-white">
							VIP
						</span>
					</div>
				</div>
				<div className="absolute left-1/2 hidden w-[280px] -translate-x-1/2 text-center md:block">
					<AnimatePresence mode="wait">
						<motion.span
							animate={{ opacity: 1, y: 0 }}
							className="block truncate text-[#86868b]"
							exit={{ opacity: 0, y: -10 }}
							initial={{ opacity: 0, y: 10 }}
							key={tickerIndex}
							transition={{ duration: 0.5, ease: IOS_EASE }}
						>
							{TICKER_MESSAGES[tickerIndex]}
						</motion.span>
					</AnimatePresence>
				</div>
				<div className="flex items-center gap-6">
					<span className="cursor-pointer text-[11px] transition-colors hover:text-white">
						Suporte
					</span>
				</div>
			</div>
		</nav>
	);
}
