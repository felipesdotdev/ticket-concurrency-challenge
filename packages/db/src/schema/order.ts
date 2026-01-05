import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { ticket } from "./ticket";

export const orderStatusEnum = pgEnum("order_status", [
	"PENDING",
	"PROCESSING",
	"COMPLETED",
	"FAILED",
	"CANCELLED",
]);

export const order = pgTable(
	"order",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		ticketId: text("ticket_id")
			.notNull()
			.references(() => ticket.id, { onDelete: "restrict" }),
		quantity: integer("quantity").notNull().default(1),
		totalPrice: integer("total_price").notNull(),
		status: orderStatusEnum("status").notNull().default("PENDING"),
		idempotencyKey: text("idempotency_key").unique(),
		processedAt: timestamp("processed_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("order_user_id_idx").on(table.userId),
		index("order_ticket_id_idx").on(table.ticketId),
		index("order_status_idx").on(table.status),
		index("order_idempotency_key_idx").on(table.idempotencyKey),
		index("order_created_at_idx").on(table.createdAt),
	]
);

export const orderRelations = relations(order, ({ one }) => ({
	user: one(user, {
		fields: [order.userId],
		references: [user.id],
	}),
	ticket: one(ticket, {
		fields: [order.ticketId],
		references: [ticket.id],
	}),
}));
