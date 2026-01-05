import { randomUUID } from "node:crypto";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { type db, order } from "@ticket-concurrency-challenge/db";
import { eq } from "drizzle-orm";
import { DB_CONNECTION } from "../database/database.constants";
import { RABBITMQ_SERVICE } from "../infrastructure/rabbitmq/rabbitmq.constants";
import { CreateOrderDto, OrderResponseDto } from "./dto/order.dto";

export interface OrderMessage {
	orderId: string;
	userId: string;
	ticketId: string;
	quantity: number;
	idempotencyKey: string;
	createdAt: string;
}

@Injectable()
export class OrderService {
	private readonly rabbitClient: ClientProxy;
	private readonly dbConnection: typeof db;

	constructor(
		@Inject(RABBITMQ_SERVICE) rabbitClient: ClientProxy,
		@Inject(DB_CONNECTION) dbConnection: typeof db
	) {
		this.rabbitClient = rabbitClient;
		this.dbConnection = dbConnection;
	}

	async createOrder(
		userId: string,
		dto: CreateOrderDto,
		idempotencyKey: string
	): Promise<OrderResponseDto> {
		const orderId = randomUUID();

		const message: OrderMessage = {
			orderId,
			userId,
			ticketId: dto.ticketId,
			quantity: dto.quantity ?? 1,
			idempotencyKey,
			createdAt: new Date().toISOString(),
		};

		this.rabbitClient.emit("ticket_orders", message);

		return {
			id: orderId,
			status: "PENDING",
			message: "Order received and queued for processing",
		};
	}

	async getOrderById(orderId: string) {
		const [orderData] = await this.dbConnection
			.select()
			.from(order)
			.where(eq(order.id, orderId));

		if (!orderData) {
			throw new NotFoundException(`Order ${orderId} not found`);
		}

		return {
			id: orderData.id,
			userId: orderData.userId,
			ticketId: orderData.ticketId,
			quantity: orderData.quantity,
			totalPrice: orderData.totalPrice,
			status: orderData.status,
			processedAt: orderData.processedAt,
			createdAt: orderData.createdAt,
		};
	}
}
