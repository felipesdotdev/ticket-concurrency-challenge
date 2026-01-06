"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity } from "lucide-react";

interface Log {
	id: number;
	text: string;
	time: string;
}

interface StockMonitorProps {
	stock: number;
	totalStock?: number;
	logs: Log[];
}

export function StockMonitor({
	stock,
	totalStock = 150,
	logs,
}: StockMonitorProps) {
	return (
		<div className="space-y-8 self-start md:sticky md:top-32">
			<h3 className="mb-4 font-semibold text-[#1d1d1f] text-[40px] leading-[1.05] tracking-tight">
				Garanta seu lugar.
			</h3>

			{/* Stock Bar */}
			<div className="border-[#d2d2d7]/50 border-b pt-8 pb-8">
				<div className="mb-2 flex items-center justify-between">
					<span className="font-semibold text-[#1d1d1f] text-[14px]">
						Disponibilidade Global
					</span>
					<span
						className={`font-medium text-[12px] ${stock < 20 ? "text-[#bf4800]" : "text-[#0071E3]"}`}
					>
						{stock} unidades restantes
					</span>
				</div>
				<div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E5E5]">
					<motion.div
						animate={{ width: `${(stock / totalStock) * 100}%` }}
						className={`h-full rounded-full ${stock < 20 ? "bg-[#bf4800]" : "bg-[#0071E3]"}`}
						initial={{ width: "100%" }}
					/>
				</div>
			</div>

			{/* Live Logs */}
			<div className="pt-6">
				<h4 className="mb-4 font-semibold text-[#86868b] text-[12px] uppercase tracking-wider">
					Atualizações em Tempo Real
				</h4>
				<div className="relative min-h-[100px] space-y-3">
					<AnimatePresence initial={false} mode="popLayout">
						{logs.map((log) => (
							<motion.div
								animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
								className="flex items-center gap-3 text-[13px]"
								exit={{
									opacity: 0,
									y: 20,
									filter: "blur(6px)",
									transition: { duration: 0.6 },
								}}
								initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
								key={log.id}
								layout
							>
								<Activity className="h-3.5 w-3.5 text-[#0071E3]" />
								<span className="text-[#1d1d1f]">{log.text}</span>
								<span className="ml-auto text-[#86868b] text-[11px]">
									{log.time}
								</span>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
