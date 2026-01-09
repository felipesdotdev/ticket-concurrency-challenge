"use client";

import { useSocket } from "@/providers/socket-provider";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export function StatMonitor({ ticketId }: { ticketId: string }) {
	const { lastEvent } = useSocket();
	const [stock, setStock] = useState<number | null>(null);

	useEffect(() => {
		if (
			lastEvent?.type === "TICKET_UPDATE" &&
			lastEvent.data.ticketId === ticketId
		) {
			setStock(lastEvent.data.availableQuantity);
		}
	}, [lastEvent, ticketId]);

	useEffect(() => {
		if (stock === null) setStock(100);
	}, []);

	return (
		<div className="group relative col-span-12 overflow-hidden border border-[#00ff41]/20 bg-[#0a0a0a]/50 p-6 md:col-span-4">
			<div className="absolute top-0 right-0 p-2 opacity-50">
				<div className="h-16 w-16 rounded-tr-xl border-[#00ff41]/20 border-t-2 border-r-2" />
			</div>

			<h3 className="mb-4 text-[#00ff41]/60 text-xs uppercase tracking-widest">
				System Resource // TICKET_STOCK
			</h3>

			<div className="flex items-baseline gap-2">
				<AnimatePresence mode="popLayout">
					<motion.span
						animate={{ y: 0, opacity: 1 }}
						className="font-bold text-6xl tracking-tighter"
						exit={{ y: -20, opacity: 0 }}
						initial={{ y: 20, opacity: 0 }}
						key={stock}
						transition={{ type: "spring", stiffness: 300, damping: 20 }}
					>
						{stock ?? "---"}
					</motion.span>
				</AnimatePresence>
				<span className="text-[#00ff41]/40 text-xl">units</span>
			</div>

			<div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-[#00ff41]/10">
				<motion.div
					animate={{ width: `${Math.min(100, stock || 0)}%` }}
					className="h-full bg-[#00ff41] shadow-[0_0_10px_#00ff41]"
					initial={{ width: "100%" }}
					transition={{ type: "spring", bounce: 0 }}
				/>
			</div>
		</div>
	);
}
