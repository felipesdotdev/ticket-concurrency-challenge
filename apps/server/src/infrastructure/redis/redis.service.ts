import { randomUUID } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import type Redis from "ioredis";
import { REDIS_CLIENT } from "./redis.constants";

@Injectable()
export class RedisService {
	constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

	async onModuleDestroy() {
		await this.redis.quit();
	}

	async set(key: string, value: string, ttl?: number) {
		if (ttl) {
			await this.redis.set(key, value, "EX", ttl);
		} else {
			await this.redis.set(key, value);
		}
	}

	async get(key: string): Promise<string | null> {
		return this.redis.get(key);
	}

	async acquireLock(key: string, ttlSeconds: number): Promise<string | null> {
		const token = randomUUID();
		const result = await this.redis.set(key, token, "EX", ttlSeconds, "NX");
		return result === "OK" ? token : null;
	}

	async releaseLock(key: string, token: string): Promise<boolean> {
		// Lua script to atomically check ownership and delete
		const script = `
			if redis.call("get", KEYS[1]) == ARGV[1] then
				return redis.call("del", KEYS[1])
			else
				return 0
			end
		`;
		const result = await this.redis.eval(script, 1, key, token);
		return result === 1;
	}
}
