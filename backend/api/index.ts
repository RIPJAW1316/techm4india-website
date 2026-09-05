import type { Request, Response } from "express";

import { createConfiguredApp } from "../src/create-app";

let server: ((request: Request, response: Response) => void) | undefined;

export default async function handler(request: Request, response: Response) {
  if (!server) {
    const app = await createConfiguredApp();
    await app.init();
    server = app.getHttpAdapter().getInstance() as typeof server;
  }

  const requestHandler = server;
  if (!requestHandler) {
    throw new Error("NestJS request handler was not initialized");
  }

  return requestHandler(request, response);
}
