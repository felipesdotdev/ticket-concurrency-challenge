import { Logger } from "@nestjs/common";
import type {
	OnGatewayConnection,
	OnGatewayDisconnect,
} from "@nestjs/websockets";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

interface OrderUpdatePayload {
	orderId: string;
	status: string;
	totalPrice: number;
	message: string;
}

@WebSocketGateway({
	cors: {
		origin: "*",
	},
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server!: Server;

	private readonly logger = new Logger(EventsGateway.name);
	private readonly userSockets = new Map<string, string[]>();

	handleConnection(client: Socket) {
		const userId = client.handshake.query.userId as string;
		this.logger.log(
			`Client connected: ${client.id} (userId: ${userId || "anonymous"})`
		);

		if (userId) {
			const existing = this.userSockets.get(userId) || [];
			existing.push(client.id);
			this.userSockets.set(userId, existing);
		}
	}

	handleDisconnect(client: Socket) {
		const userId = client.handshake.query.userId as string;
		this.logger.log(`Client disconnected: ${client.id}`);

		if (userId) {
			const existing = this.userSockets.get(userId) || [];
			const filtered = existing.filter((id) => id !== client.id);
			if (filtered.length > 0) {
				this.userSockets.set(userId, filtered);
			} else {
				this.userSockets.delete(userId);
			}
		}
	}

	emitOrderUpdate(userId: string, orderData: OrderUpdatePayload) {
		const socketIds = this.userSockets.get(userId);
		if (socketIds && socketIds.length > 0) {
			for (const socketId of socketIds) {
				this.server.to(socketId).emit("order:update", orderData);
			}
			this.logger.log(`Emitted order:update to user ${userId}`);
		} else {
			this.logger.warn(`No sockets found for user ${userId}`);
		}
	}

	broadcastTicketUpdate(ticketId: string, availableQuantity: number) {
		this.server.emit("ticket:update", { ticketId, availableQuantity });
	}
}
