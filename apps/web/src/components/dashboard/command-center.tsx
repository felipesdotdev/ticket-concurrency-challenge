"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export function CommandCenter({
	ticketId,
	userId,
}: {
	ticketId: string;
	userId: string;
}) {
	const [isLoading, setIsLoading] = useState(false);

	const handlePurchase = async () => {
		setIsLoading(true);
		try {
			const idempotencyKey = crypto.randomUUID();
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}/orders`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Idempotency-Key": idempotencyKey,
					},
					body: JSON.stringify({
						userId,
						ticketId,
						quantity: 1,
					}),
				}
			);

			if (!res.ok) throw new Error("Command failed");

			const data = await res.json();
			toast.success(`COMMAND SENT: ${data.message}`);
		} catch (error) {
			toast.error("COMMAND EXECUTION FAILED");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="group col-span-12 flex flex-col justify-between border border-[#00ff41]/20 bg-[#0a0a0a]/50 p-6 transition-colors hover:border-[#00ff41]/50 md:col-span-4">
			<div>
				<h3 className="mb-2 text-[#00ff41]/60 text-xs uppercase tracking-widest">
					Action Protocol // PURCHASE
				</h3>
				<p className="mb-6 font-mono text-[#00ff41]/40 text-xs">
					Execute transaction order. Requires available stock.
				</p>
			</div>

			<motion.button
				className="group/btn relative w-full overflow-hidden border border-[#00ff41] bg-[#00ff41]/10 px-6 py-4 font-bold text-[#00ff41] uppercase tracking-widest transition-all hover:bg-[#00ff41]/20 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={isLoading}
				onClick={handlePurchase}
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
			>
				{isLoading ? (
					<span className="animate-pulse">EXECUTING...</span>
				) : (
					<>
						<span className="relative z-10">INITIATE PURCHASE</span>
						<div className="absolute inset-0 -z-0 translate-y-full transform bg-[#00ff41] opacity-10 transition-transform duration-300 group-hover/btn:translate-y-0" />
					</>
				)}
			</motion.button>
		</div>
	);
}
