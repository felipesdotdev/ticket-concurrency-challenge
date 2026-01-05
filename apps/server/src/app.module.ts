import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { EventsModule } from "./events/events.module";
import { HealthModule } from "./health/health.module";
import { RabbitMQModule } from "./infrastructure/rabbitmq/rabbitmq.module";
import { RedisModule } from "./infrastructure/redis/redis.module";
import { OrderModule } from "./orders/order.module";

@Module({
	imports: [
		RedisModule,
		RabbitMQModule,
		HealthModule,
		OrderModule,
		EventsModule,
	],
	controllers: [AuthController],
	providers: [],
})
export class AppModule {}
