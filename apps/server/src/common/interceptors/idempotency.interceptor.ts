import {
	type CallHandler,
	type ExecutionContext,
	HttpException,
	HttpStatus,
	Inject,
	Injectable,
	Logger,
	type NestInterceptor,
} from "@nestjs/common";
import { type Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { RedisService } from "../../infrastructure/redis/redis.service";

const IDEMPOTENCY_HEADER = "idempotency-key";
const IDEMPOTENCY_TTL = 60 * 60 * 24;
const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
	private readonly logger = new Logger(IdempotencyInterceptor.name);
	private readonly redisService: RedisService;

	constructor(@Inject(RedisService) redisService: RedisService) {
		this.redisService = redisService;
	}

	async intercept(
		context: ExecutionContext,
		next: CallHandler
	): Promise<Observable<unknown>> {
		const request = context.switchToHttp().getRequest();
		const idempotencyKey = request.headers[IDEMPOTENCY_HEADER];

		if (!idempotencyKey) {
			throw new HttpException(
				"Idempotency-Key header is required",
				HttpStatus.BAD_REQUEST
			);
		}

		if (!UUID_REGEX.test(idempotencyKey)) {
			throw new HttpException(
				"Idempotency-Key must be a valid UUID",
				HttpStatus.BAD_REQUEST
			);
		}

		const cacheKey = `idempotency:${idempotencyKey}`;

		const existingResult = await this.redisService.get(cacheKey);
		if (existingResult) {
			this.logger.log(`Duplicate request detected: ${idempotencyKey}`);
			return of(JSON.parse(existingResult));
		}

		const lockKey = `lock:${cacheKey}`;
		const lockToken = await this.redisService.acquireLock(lockKey, 30);

		if (!lockToken) {
			throw new HttpException(
				"Request is already being processed",
				HttpStatus.CONFLICT
			);
		}

		return next.handle().pipe(
			tap(async (response) => {
				await this.redisService.set(
					cacheKey,
					JSON.stringify(response),
					IDEMPOTENCY_TTL
				);
				await this.redisService.releaseLock(lockKey, lockToken);
			})
		);
	}
}
