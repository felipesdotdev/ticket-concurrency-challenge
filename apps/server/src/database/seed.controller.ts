import { Controller, Inject, Post } from "@nestjs/common";
import { db, event, ticket, user } from "@ticket-concurrency-challenge/db";
import { sql } from "drizzle-orm";
import { DB_CONNECTION } from "./database.constants";

@Controller("seed")
export class SeedController {
	constructor(@Inject(DB_CONNECTION) private readonly dbConnection: typeof db) {}

	@Post()
	async seed() {
		await this.dbConnection.execute(
			sql`TRUNCATE TABLE "order", "ticket", "event", "user" CASCADE`
		);
		const userId = "user-123";
		await this.dbConnection.insert(user).values({
			id: userId,
			name: "Test User",
			email: "test@example.com",
		});

		const eventId = "event-id-123";
		await this.dbConnection.insert(event).values({
			id: eventId,
			name: "Show do Alok",
			description: "Grande show na arena",
			venue: "Arena Central",
			eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
		});

		const ticketExperienceId = "ticket-experience";
		await this.dbConnection.insert(ticket).values({
			id: ticketExperienceId,
			eventId,
			name: "Verve Experience",
			description: "Acesso à pista global.",
			price: 49_000, // em centavos
			totalQuantity: 1000,
			availableQuantity: 1000,
		});

		const ticketProId = "ticket-experience-pro";
		await this.dbConnection.insert(ticket).values({
			id: ticketProId,
			eventId,
			name: "Verve Experience Pro",
			description: "A visão definitiva.",
			price: 99_000, // em centavos
			totalQuantity: 500,
			availableQuantity: 500,
		});

		return {
			message: "Database seeded successfully",
			userId,
			eventId,
			ticketExperienceId,
			ticketProId,
		};
	}
}
