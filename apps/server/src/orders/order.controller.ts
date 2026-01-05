import {
	Body,
	Controller,
	Get,
	Headers,
	HttpCode,
	HttpStatus,
	Inject,
	Param,
	Post,
	UseInterceptors,
} from "@nestjs/common";
import { IdempotencyInterceptor } from "../common/interceptors/idempotency.interceptor";
import { CreateOrderDto } from "./dto/order.dto";
import { OrderService } from "./order.service";

@Controller("orders")
export class OrderController {
	private readonly orderService: OrderService;

	constructor(@Inject(OrderService) orderService: OrderService) {
		this.orderService = orderService;
	}
	@Get("tickets")
	async getTickets() {
		return this.orderService.getTickets();
	}

	@Post()
	@HttpCode(HttpStatus.ACCEPTED)
	@UseInterceptors(IdempotencyInterceptor)
	async createOrder(
		@Body() dto: CreateOrderDto,
		@Headers("idempotency-key") idempotencyKey: string,
		@Headers("x-user-id") userId: string
	) {
		return this.orderService.createOrder(
			userId || "user-123",
			dto,
			idempotencyKey
		);
	}

	@Get(":id")
	async getOrder(@Param("id") id: string) {
		return this.orderService.getOrderById(id);
	}
}
