import { Controller, Inject, Logger } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { type db, order, ticket } from "@ticket-concurrency-challenge/db";
import { and, eq, gte, sql } from "drizzle-orm";
import { DB_CONNECTION } from "../database/database.constants";
import { EventsGateway } from "../events/events.gateway";
import { RedisService } from "../infrastructure/redis/redis.service";
import type { OrderMessage } from "./order.service";

const MAX_RETRIES = 3;
const RETRY_KEY_TTL = 60 * 60; // 1 hour

@Controller()
export class OrderConsumer {
	private readonly logger = new Logger(OrderConsumer.name);
	private readonly dbConnection: typeof db;
	private readonly redisService: RedisService;
	private readonly eventsGateway: EventsGateway;

	constructor(
		@Inject(DB_CONNECTION) dbConnection: typeof db,
		@Inject(RedisService) redisService: RedisService,
		@Inject(EventsGateway) eventsGateway: EventsGateway
	) {
		this.dbConnection = dbConnection;
		this.redisService = redisService;
		this.eventsGateway = eventsGateway;
	}

	@EventPattern("ticket_orders")
	async handleOrderCreated(
		@Payload() data: OrderMessage,
		@Ctx() context: RmqContext
	) {
		const channel = context.getChannelRef();
		const originalMsg = context.getMessage();

		this.logger.log(
			`Processing order: ${data.orderId} for ticket: ${data.ticketId}`
		);

		try {
			const result = await this.processOrder(data);
			channel.ack(originalMsg);
			this.logger.log(`Order processed successfully: ${data.orderId}`);

			this.eventsGateway.emitOrderUpdate(data.userId, {
				orderId: data.orderId,
				status: result.status,
				totalPrice: result.totalPrice,
				message:
					result.status === "COMPLETED"
						? "Seu pedido foi confirmado!"
						: `Falha no pedido: ${result.error}`,
			});
		} catch (error: any) {
			this.logger.error(
				`Order processing failed: ${error.message}`,
				error.stack
			);

			if (error.message.includes("lock")) {
				const retryKey = `retry:${data.orderId}`;
				const retryCount = await this.incrementRetryCount(retryKey);

				if (retryCount >= MAX_RETRIES) {
					this.logger.error(
						`Max retries (${MAX_RETRIES}) exceeded for order ${data.orderId}, sending to DLQ`
					);
					// nack without requeue sends to DLQ
					channel.nack(originalMsg, false, false);
					return;
				}

				this.logger.warn(
					`Retry ${retryCount}/${MAX_RETRIES} for order ${data.orderId} due to lock contention`
				);
				channel.nack(originalMsg, false, true);
				return;
			}

			// For any other unexpected errors (DB, etc.), send to DLQ immediately for safety
			this.logger.error(
				`Sending order ${data.orderId} to DLQ due to unexpected error`
			);
			channel.nack(originalMsg, false, false);
		}
	}

	private async incrementRetryCount(key: string): Promise<number> {
		const current = await this.redisService.get(key);
		const count = current ? Number.parseInt(current, 10) + 1 : 1;
		await this.redisService.set(key, String(count), RETRY_KEY_TTL);
		return count;
	}

	private async processOrder(
		data: OrderMessage
	): Promise<{ status: string; totalPrice: number; error?: string }> {
		const lockKey = `order:lock:${data.ticketId}`;
		const lockToken = await this.redisService.acquireLock(lockKey, 10);

		if (!lockToken) {
			throw new Error("Could not acquire lock for ticket");
		}

		try {
			// Use transaction to ensure detailed consistency
			return await this.dbConnection.transaction(async (tx) => {
				// Atomic update: decrement stock only if sufficient quantity exists
				// This single query prevents race conditions at the database level
				const [updatedTicket] = await tx
					.update(ticket)
					.set({
						availableQuantity: sql`${ticket.availableQuantity} - ${data.quantity}`,
					})
					.where(
						and(
							eq(ticket.id, data.ticketId),
							gte(ticket.availableQuantity, data.quantity)
						)
					)
					.returning();

				// If no row was updated, either ticket doesn't exist or insufficient stock
				if (!updatedTicket) {
					const [existingTicket] = await tx
						.select({ id: ticket.id })
						.from(ticket)
						.where(eq(ticket.id, data.ticketId));

					const error = existingTicket
						? "Insufficient ticket quantity"
						: "Ticket not found";

					await tx.insert(order).values({
						id: data.orderId,
						userId: data.userId,
						ticketId: data.ticketId,
						quantity: data.quantity,
						totalPrice: 0,
						status: "FAILED",
						idempotencyKey: data.idempotencyKey,
						processedAt: new Date(),
					});

					return { status: "FAILED", totalPrice: 0, error };
				}

				const totalPrice = updatedTicket.price * data.quantity;
				await tx.insert(order).values({
					id: data.orderId,
					userId: data.userId,
					ticketId: data.ticketId,
					quantity: data.quantity,
					totalPrice,
					status: "COMPLETED",
					idempotencyKey: data.idempotencyKey,
					processedAt: new Date(),
				});

				// Auto-restock logic (For study purposes)
				if (updatedTicket.availableQuantity === 0) {
					this.logger.log(`Ticket ${data.ticketId} sold out. Restocking...`);
					const [restockedTicket] = await tx
						.update(ticket)
						.set({
							availableQuantity: ticket.totalQuantity,
						})
						.where(eq(ticket.id, data.ticketId))
						.returning();

					this.eventsGateway.broadcastTicketUpdate(
						data.ticketId,
						restockedTicket.availableQuantity
					);
				} else {
					this.eventsGateway.broadcastTicketUpdate(
						data.ticketId,
						updatedTicket.availableQuantity
					);
				}

				return { status: "COMPLETED", totalPrice };
			});
		} finally {
			await this.redisService.releaseLock(lockKey, lockToken);
		}
	}
}
