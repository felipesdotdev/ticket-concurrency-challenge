import { Global, Module, type Provider } from "@nestjs/common";
import { db } from "@ticket-concurrency-challenge/db";
import { DB_CONNECTION } from "./database.constants";

const dbProvider: Provider = {
	provide: DB_CONNECTION,
	useValue: db,
};

@Global()
@Module({
	providers: [dbProvider],
	exports: [dbProvider],
})
export class DatabaseModule {}
