import { Global, Module, type Provider } from "@nestjs/common";
import Redis from "ioredis";
import { REDIS_CLIENT } from "./redis.constants";
import { RedisService } from "./redis.service";

const redisProvider: Provider = {
	provide: REDIS_CLIENT,
	useFactory: () => {
		// Se REDIS_URL estiver definida, usa ela diretamente (padrão Upstash/Cloud)
		if (process.env.REDIS_URL) {
			return new Redis(process.env.REDIS_URL);
		}
		// Fallback para host/port local
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
