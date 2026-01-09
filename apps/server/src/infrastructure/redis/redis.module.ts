import { Global, Module, type Provider } from "@nestjs/common";
import Redis from "ioredis";
import { REDIS_CLIENT } from "./redis.constants";
import { RedisService } from "./redis.service";

const redisProvider: Provider = {
	provide: REDIS_CLIENT,
	useFactory: () => {
		const commonOptions = {
			maxRetriesPerRequest: null, // Importante para não quebrar o app se o Redis oscilar
			reconnectOnError: (err: Error) => {
				const targetError = "READONLY";
				if (err.message.includes(targetError)) {
					return true;
				}
				return false;
			},
		};

		if (process.env.REDIS_URL) {
			return new Redis(process.env.REDIS_URL, commonOptions);
		}

		return new Redis({
			host: process.env.REDIS_HOST || "localhost",
			port: Number.parseInt(process.env.REDIS_PORT || "6379", 10),
			...commonOptions,
		});
	},
};

@Global()
@Module({
	providers: [redisProvider, RedisService],
	exports: [redisProvider, RedisService],
})
export class RedisModule {}
