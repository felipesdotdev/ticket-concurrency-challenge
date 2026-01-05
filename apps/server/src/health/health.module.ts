import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { RabbitMQModule } from "../infrastructure/rabbitmq/rabbitmq.module";
import { RedisModule } from "../infrastructure/redis/redis.module";
import { HealthController } from "./health.controller";

@Module({
	imports: [DatabaseModule, RedisModule, RabbitMQModule],
	controllers: [HealthController],
})
export class HealthModule {}
