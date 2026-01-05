import { Module } from "@nestjs/common";
import { IdempotencyInterceptor } from "../common/interceptors/idempotency.interceptor";
import { DatabaseModule } from "../database/database.module";
import { EventsModule } from "../events/events.module";
import { RedisModule } from "../infrastructure/redis/redis.module";
import { OrderConsumer } from "./order.consumer";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";

@Module({
	imports: [RedisModule, DatabaseModule, EventsModule],
	controllers: [OrderController, OrderConsumer],
	providers: [OrderService, IdempotencyInterceptor],
	exports: [OrderService],
})
export class OrderModule {}
