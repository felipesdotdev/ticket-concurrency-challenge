import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { IoAdapter } from "@nestjs/platform-socket.io";
import type { ServerOptions } from "socket.io";

export class FastifySocketIoAdapter extends IoAdapter {
	constructor(private app: NestFastifyApplication) {
		super(app);
	}

	createIOServer(port: number, options?: ServerOptions) {
		// HTTP server is managed internally by NestJS; we only need to configure socket.io options
		const io = super.createIOServer(port, {
			...options,
			cors: {
				origin: "*",
				methods: ["GET", "POST"],
				credentials: true,
			},
		});
		return io;
	}
}
