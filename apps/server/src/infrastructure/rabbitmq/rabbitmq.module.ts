import { Global, Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { RABBITMQ_SERVICE } from "./rabbitmq.constants";

@Global()
@Module({
	imports: [
		ClientsModule.register([
			{
				name: RABBITMQ_SERVICE,
				transport: Transport.RMQ,
				options: {
					urls: [process.env.RABBITMQ_URL || "amqp://app:app@localhost:5672"],
					queue: "ticket_orders",
					queueOptions: {
						durable: true,
						deadLetterExchange: "",
						deadLetterRoutingKey: "ticket_orders_dlq",
					},
				},
			},
		]),
	],
	exports: [ClientsModule],
})
export class RabbitMQModule {}
