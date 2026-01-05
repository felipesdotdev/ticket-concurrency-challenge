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
			name: "Final da Copa do Mundo 2026",
			description: "A disputa pela taça mais cobiçada do futebol mundial.",
			venue: "Estádio Monumental",
			eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
		});

		const ticketStandardId = "ticket-standard";
		await this.dbConnection.insert(ticket).values({
			id: ticketStandardId,
			eventId,
			name: "Arquibancada Superior",
			description: "Visão panorâmica do campo e torcida.",
			price: 49_000, // em centavos (R$ 490,00)
			totalQuantity: 40_000,
			availableQuantity: 40_000,
		});

		const ticketVipId = "ticket-vip";
		await this.dbConnection.insert(ticket).values({
			id: ticketVipId,
			eventId,
			name: "Camarote Lounge VIP",
			description: "Experiência premium com open bar e food.",
			price: 150_000, // em centavos (R$ 1.500,00)
			totalQuantity: 10_000,
			availableQuantity: 10_000,
		});

		return {
			message: "Database seeded successfully",
			userId,
			eventId,
			ticketStandardId,
			ticketVipId,
		};
	}
}
