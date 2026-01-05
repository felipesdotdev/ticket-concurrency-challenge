import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const event = pgTable(
	"event",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		description: text("description"),
		venue: text("venue"),
		eventDate: timestamp("event_date").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("event_date_idx").on(table.eventDate)]
);

export const ticket = pgTable(
	"ticket",
	{
		id: text("id").primaryKey(),
		eventId: text("event_id")
			.notNull()
			.references(() => event.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		description: text("description"),
		price: integer("price").notNull(),
		totalQuantity: integer("total_quantity").notNull(),
		availableQuantity: integer("available_quantity").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("ticket_event_id_idx").on(table.eventId),
		index("ticket_available_qty_idx").on(table.availableQuantity),
	]
);

export const eventRelations = relations(event, ({ many }) => ({
	tickets: many(ticket),
}));

export const ticketRelations = relations(ticket, ({ one }) => ({
	event: one(event, {
		fields: [ticket.eventId],
		references: [event.id],
	}),
}));
