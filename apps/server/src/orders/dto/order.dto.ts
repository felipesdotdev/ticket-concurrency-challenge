import { IsInt, IsOptional, IsPositive, IsUUID, Max } from "class-validator";

export class CreateOrderDto {
	@IsUUID()
	ticketId!: string;

	@IsInt()
	@IsPositive()
	@Max(10, { message: "Cannot order more than 10 tickets at once" })
	@IsOptional()
	quantity?: number = 1;
}

export class OrderResponseDto {
	id!: string;
	status!: string;
	message!: string;
}
