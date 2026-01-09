"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { io, type Socket } from "socket.io-client";

interface SocketContextType {
	socket: Socket | null;
	isConnected: boolean;
	lastEvent: { type: string; data: any; timestamp: number } | null;
	userId: string | null;
}

const SocketContext = createContext<SocketContextType>({
	socket: null,
	isConnected: false,
	lastEvent: null,
	userId: null,
});

export function SocketProvider({
	children,
	userId,
}: {
	children: ReactNode;
	userId?: string;
}) {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [lastEvent, setLastEvent] = useState<{
		type: string;
		data: any;
		timestamp: number;
	} | null>(null);
	const [activeUserId, setActiveUserId] = useState<string | null>(
		userId || null
	);

	useEffect(() => {
		let currentUserId = userId;
		if (!currentUserId) {
			const storedId = localStorage.getItem("ticket-app-user-id");
			if (storedId) {
				currentUserId = storedId;
			} else {
				currentUserId = crypto.randomUUID();
				localStorage.setItem("ticket-app-user-id", currentUserId);
			}
		}
		setActiveUserId(currentUserId);

		const socketInstance = io(
			process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
			{
				transports: ["websocket"],
				query: { userId: currentUserId },
			}
		);

		socketInstance.on("connect", () => {
			setIsConnected(true);
		});

		socketInstance.on("disconnect", () => {
			setIsConnected(false);
		});

		socketInstance.on("ticket:update", (data) => {
			setLastEvent({
				type: "TICKET_UPDATE",
				data,
				timestamp: Date.now(),
			});
		});

		socketInstance.on("order:update", (data) => {
			setLastEvent({
				type: "ORDER_UPDATE",
				data,
				timestamp: Date.now(),
			});
		});

		setSocket(socketInstance);

		return () => {
			socketInstance.disconnect();
		};
	}, [userId]);

	return (
		<SocketContext.Provider
			value={{ socket, isConnected, lastEvent, userId: activeUserId }}
		>
			{children}
		</SocketContext.Provider>
	);
}

export const useSocket = () => useContext(SocketContext);
