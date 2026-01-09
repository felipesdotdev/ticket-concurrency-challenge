"use client";

import { useSocket } from "@/providers/socket-provider";
import { useEffect, useRef, useState } from "react";

interface LogEntry {
	id: string;
	timestamp: string;
	type: "INFO" | "SUCCESS" | "ERROR" | "WARN";
	message: string;
}

export function EventLog() {
	const { lastEvent } = useSocket();
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const scrollRef = useRef<HTMLDivElement>(null);

	const addLog = (type: LogEntry["type"], message: string) => {
		setLogs((prev) => [
			...prev.slice(-49),
			{
				id: crypto.randomUUID(),
				timestamp: new Date().toLocaleTimeString(),
				type,
				message,
			},
		]);
	};

	useEffect(() => {
		if (!lastEvent) return;

		if (lastEvent.type === "TICKET_UPDATE") {
			addLog(
				"INFO",
				`UPDATE: Stock changed to ${lastEvent.data.availableQuantity}`
			);
		} else if (lastEvent.type === "ORDER_UPDATE") {
			const type = lastEvent.data.status === "COMPLETED" ? "SUCCESS" : "ERROR";
			addLog(
				type,
				`ORDER ${lastEvent.data.orderId.slice(0, 8)}: ${lastEvent.data.status} - ${lastEvent.data.message}`
			);
		}
	}, [lastEvent]);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [logs]);

	return (
		<div className="col-span-12 flex h-64 flex-col overflow-hidden border border-[#00ff41]/20 bg-black p-4 font-mono text-[10px] md:col-span-4 md:h-auto md:text-xs">
			<div className="mb-2 flex items-center justify-between border-[#00ff41]/20 border-b bg-[#00ff41]/10 p-2">
				<span className="font-bold uppercase tracking-widest">Event Log</span>
				<div className="h-2 w-2 animate-ping rounded-full bg-[#00ff41]" />
			</div>

			<div
				className="scrollbar-hide flex-1 space-y-1 overflow-y-auto font-mono"
				ref={scrollRef}
			>
				{logs.length === 0 && (
					<div className="py-10 text-center text-[#00ff41]/30 italic">
						Waiting for telemetry data...
					</div>
				)}
				{logs.map((log) => (
					<div
						className="flex gap-2 p-0.5 transition-colors hover:bg-[#00ff41]/5"
						key={log.id}
					>
						<span className="text-[#00ff41]/50">[{log.timestamp}]</span>
						<span
							className={`font-bold ${
								log.type === "ERROR"
									? "text-red-500"
									: log.type === "SUCCESS"
										? "text-[#00ff41]"
										: "text-[#00ff41]/80"
							}`}
						>
							{log.type}
						</span>
						<span className="break-all text-[#00ff41]/80">{log.message}</span>
					</div>
				))}
			</div>
		</div>
	);
}
