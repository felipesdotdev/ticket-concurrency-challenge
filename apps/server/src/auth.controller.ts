import { All, Controller, Req, Res } from "@nestjs/common";
import { auth } from "@ticket-concurrency-challenge/auth";
import type { FastifyReply, FastifyRequest } from "fastify";

@Controller("api/auth")
export class AuthController {
  @All("*")
  async handleAuth(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        body: request.body ? JSON.stringify(request.body) : undefined,
      });
      const response = await auth.handler(req);

      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      const body = response.body ? await response.text() : null;
      reply.send(body);
    } catch (error) {
      console.error("Authentication Error:", error);
      reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH_FAILURE",
      });
    }
  }
}
