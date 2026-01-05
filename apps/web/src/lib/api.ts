export interface PurchaseTicketParams {
	ticketId: string;
	userId: string;
	idempotencyKey: string;
	quantity: number;
}

export interface PurchaseResponse {
	id: string;
	status: string;
	message: string;
}

const API_URL = "http://localhost:3000";

export async function purchaseTicket({
	ticketId,
	userId,
	idempotencyKey,
	quantity,
}: PurchaseTicketParams): Promise<PurchaseResponse> {
	const res = await fetch(`${API_URL}/orders`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-user-id": userId,
			"idempotency-key": idempotencyKey,
		},
		body: JSON.stringify({
			ticketId,
			quantity,
		}),
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(error.message || "Failed to purchase ticket");
	}

	return res.json();
}
