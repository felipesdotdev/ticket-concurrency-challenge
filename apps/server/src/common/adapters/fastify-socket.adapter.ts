import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { IoAdapter } from "@nestjs/platform-socket.io";
import type { ServerOptions } from "socket.io";

export class FastifySocketIoAdapter extends IoAdapter {
	constructor(private app: NestFastifyApplication) {
		super(app);
	}

	createIOServer(port: number, options?: ServerOptions) {
		const server = this.app.getHttpServer();
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
