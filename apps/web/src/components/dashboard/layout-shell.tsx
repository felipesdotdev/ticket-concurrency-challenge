import type { PropsWithChildren } from "react";

export function LayoutShell({ children }: PropsWithChildren) {
	return (
		<div className="min-h-screen overflow-hidden bg-[#0a0a0a] font-mono text-[#00ff41] selection:bg-[#003b00] selection:text-[#00ff41]">
			{/* Grid Background Effect */}
			<div
				className="pointer-events-none fixed inset-0 z-0 opacity-20"
				style={{
					backgroundImage: `
						linear-gradient(to right, #1a1a1a 1px, transparent 1px),
						linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)
					`,
					backgroundSize: "40px 40px",
				}}
			/>

			{/* Scanline Effect */}
			<div className="pointer-events-none fixed inset-0 z-50 h-[100px] w-full animate-scanline bg-gradient-to-b from-transparent via-white to-transparent opacity-[0.03]" />

			<div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col p-6">
				<header className="mb-8 flex items-end justify-between border-[#00ff41]/20 border-b pb-4">
					<div>
						<h1
							className="glitch-text font-bold text-4xl uppercase tracking-tighter"
							data-text="SYSTEM_CORE"
						>
							SYSTEM_CORE
						</h1>
						<p className="mt-1 text-[#00ff41]/60 text-xs uppercase tracking-widest">
							Ticket Concurrency Control Module // v1.0.0
						</p>
					</div>
					<div className="text-right">
						<div className="flex items-center justify-end gap-2">
							<div className="h-2 w-2 animate-pulse rounded-full bg-[#00ff41]" />
							<span className="text-xs uppercase">Online</span>
						</div>
						<p className="mt-1 font-mono text-[#00ff41]/40 text-[10px]">
							LATENCY: &lt;12ms
						</p>
					</div>
				</header>

				<main className="grid flex-1 grid-cols-12 gap-6">{children}</main>
			</div>

			<style global jsx>{`
				@keyframes scanline {
					0% { transform: translateY(-100%); }
					100% { transform: translateY(100vh); }
				}
				.animate-scanline {
					animation: scanline 8s linear infinite;
				}
				.glitch-text {
					position: relative;
				}
				.glitch-text::before,
				.glitch-text::after {
					content: attr(data-text);
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
				}
				.glitch-text::before {
					left: 2px;
					text-shadow: -1px 0 #ff00c1;
					clip: rect(44px, 450px, 56px, 0);
					animation: glitch-anim 5s infinite linear alternate-reverse;
				}
				.glitch-text::after {
					left: -2px;
					text-shadow: -1px 0 #00fff9;
					clip: rect(44px, 450px, 56px, 0);
					animation: glitch-anim2 5s infinite linear alternate-reverse;
				}
			`}</style>
		</div>
	);
}
