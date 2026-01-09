import dotenv from "dotenv";
import { randomUUID } from "node:crypto";

dotenv.config({
	path: "../../apps/server/.env",
});

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { event, ticket, user } from "./schema";

const client = postgres(process.env.DATABASE_URL || "");
const db = drizzle(client);

async function seed() {
	console.log("🌱 Starting database seed...");
	console.log("🧹 Clearing existing data...");
	await db.execute(
		sql`TRUNCATE TABLE "order", "ticket", "event", "user" CASCADE`
	);
	const userId = randomUUID();
	console.log(`👤 Creating user: ${userId}`);
	await db.insert(user).values({
		id: userId,
		name: "Test User",
		email: "test@example.com",
	});
	const eventId = randomUUID();
	console.log(`🎉 Creating event: ${eventId}`);
	await db.insert(event).values({
		id: eventId,
		name: "Final da Copa do Mundo 2026",
		description: "A disputa pela taça mais cobiçada do futebol mundial.",
		venue: "Estádio Monumental",
		eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
	});

	// Create standard ticket
	const ticketStandardId = randomUUID();
	console.log(`🎫 Creating standard ticket: ${ticketStandardId}`);
	await db.insert(ticket).values({
		id: ticketStandardId,
		eventId,
		name: "Arquibancada Superior",
		description: "Visão panorâmica do campo e torcida.",
		price: 49_000,
		totalQuantity: 40_000,
		availableQuantity: 40_000,
	});

	// Create VIP ticket
	const ticketVipId = randomUUID();
	console.log(`🎫 Creating VIP ticket: ${ticketVipId}`);
	await db.insert(ticket).values({
		id: ticketVipId,
		eventId,
		name: "Camarote Lounge VIP",
		description: "Experiência premium com open bar e food.",
		price: 150_000,
		totalQuantity: 10_000,
		availableQuantity: 10_000,
	});

	console.log("\n✅ Database seeded successfully!");
	console.log("📋 Created IDs:");
	console.log(`   User: ${userId}`);
	console.log(`   Event: ${eventId}`);
	console.log(`   Standard Ticket: ${ticketStandardId}`);
	console.log(`   VIP Ticket: ${ticketVipId}`);
	await client.end();
	process.exit(0);
}

seed().catch((error) => {
	console.error("❌ Seed failed:", error);
	process.exit(1);
});
