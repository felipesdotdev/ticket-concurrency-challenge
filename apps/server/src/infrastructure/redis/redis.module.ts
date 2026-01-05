import { Global, Module, type Provider } from "@nestjs/common";
import Redis from "ioredis";
import { REDIS_CLIENT } from "./redis.constants";
import { RedisService } from "./redis.service";

const redisProvider: Provider = {
	provide: REDIS_CLIENT,
	useFactory: () => {
		return new Redis({
			host: process.env.REDIS_HOST || "localhost",
			port: Number.parseInt(process.env.REDIS_PORT || "6379", 10),
		});
	},
};

@Global()
@Module({
	providers: [redisProvider, RedisService],
	exports: [redisProvider, RedisService],
})
export class RedisModule {}
