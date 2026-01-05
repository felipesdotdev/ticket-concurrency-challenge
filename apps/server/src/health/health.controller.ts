import { Controller, Get, HttpStatus, Inject, Res } from "@nestjs/common";
import type { db } from "@ticket-concurrency-challenge/db";
import { sql } from "drizzle-orm";
import type { FastifyReply } from "fastify";
import { Redis } from "ioredis";
import { DB_CONNECTION } from "../database/database.constants";
import { REDIS_CLIENT } from "../infrastructure/redis/redis.constants";

interface HealthStatus {
	status: "up" | "down" | "unknown";
	database: "up" | "down" | "unknown";
	redis: "up" | "down" | "unknown";
	rabbitmq: "checked-via-logs";
	timestamp: string;
}

@Controller("health")
export class HealthController {
	constructor(
		@Inject(DB_CONNECTION) private readonly dbConnection: typeof db,
		@Inject(REDIS_CLIENT) private readonly redis: Redis
	) {}

	@Get()
	async check(@Res() reply: FastifyReply) {
		const health = await this.getHealthStatus();
		const isHealthy = health.database === "up" && health.redis === "up";

		return reply
			.status(isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
			.send(health);
	}

	@Get("live")
	live() {
		// Liveness probe - always returns OK if the server is running
		return { status: "up", timestamp: new Date().toISOString() };
	}

	@Get("ready")
	async ready(@Res() reply: FastifyReply) {
		const health = await this.getHealthStatus();
		const isReady = health.database === "up" && health.redis === "up";

		return reply
			.status(isReady ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
			.send({ ready: isReady, ...health });
	}

	private async getHealthStatus(): Promise<HealthStatus> {
		const status: HealthStatus = {
			status: "unknown",
			database: "unknown",
			redis: "unknown",
			rabbitmq: "checked-via-logs",
			timestamp: new Date().toISOString(),
		};

		try {
			await this.dbConnection.execute(sql`SELECT 1`);
			status.database = "up";
		} catch (e) {
			status.database = "down";
			console.error("Health DB Error:", e);
		}

		try {
			const pong = await this.redis.ping();
			status.redis = pong === "PONG" ? "up" : "down";
		} catch (e) {
			status.redis = "down";
			console.error("Health Redis Error:", e);
		}

		status.status =
			status.database === "up" && status.redis === "up" ? "up" : "down";

		return status;
	}
}
