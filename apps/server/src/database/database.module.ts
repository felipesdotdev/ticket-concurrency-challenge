import { Global, Module, type Provider } from "@nestjs/common";
import { db } from "@ticket-concurrency-challenge/db";
import { DB_CONNECTION } from "./database.constants";
import { SeedController } from "./seed.controller";

const dbProvider: Provider = {
	provide: DB_CONNECTION,
	useValue: db,
};

@Global()
@Module({
	providers: [dbProvider],
	controllers: [SeedController],
	exports: [dbProvider],
})
export class DatabaseModule {}
