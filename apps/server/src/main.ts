import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { MicroserviceOptions } from "@nestjs/microservices";
import { Transport } from "@nestjs/microservices";
import {
	FastifyAdapter,
	type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AppModule } from "./app.module";
import { FastifySocketIoAdapter } from "./common/adapters/fastify-socket.adapter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter({ logger: true })
	);

	app.useStaticAssets({
		root: join(__dirname, "..", "public"),
		prefix: "/",
	});

	app.useWebSocketAdapter(new FastifySocketIoAdapter(app));

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.RMQ,
		options: {
			urls: [process.env.RABBITMQ_URL || "amqp://app:app@localhost:5672"],
			queue: "ticket_orders",
			queueOptions: {
				durable: true,
				deadLetterExchange: "",
				deadLetterRoutingKey: "ticket_orders_dlq",
			},
			prefetchCount: 10,
			noAck: false,
		},
	});

	app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

	app.enableCors({
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			"X-Requested-With",
			"Idempotency-Key",
			"X-User-Id",
		],
		credentials: true,
		maxAge: 86_400,
	});

	await app.startAllMicroservices();
	await app.listen(3000, "0.0.0.0");
	console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
