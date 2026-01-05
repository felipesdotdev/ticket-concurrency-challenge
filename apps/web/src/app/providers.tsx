"use client";

import { Toaster } from "sonner";
import { SocketProvider } from "../providers/socket-provider";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SocketProvider>
			{children}
			<Toaster />
		</SocketProvider>
	);
}
