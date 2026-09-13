import { Request } from "express";

/** Shared response envelope + request-metadata helpers for V2 controllers. */
export abstract class V2Controller {
  protected ok<T>(value: Promise<T> | T) {
    return Promise.resolve(value).then((data) => ({ success: true, data }));
  }

  protected list<T extends { data: unknown; meta: unknown }>(value: Promise<T>) {
    return value.then((result) => ({ success: true, ...result }));
  }

  protected metadata(request: Request) {
    return {
      ipAddress: request.ip,
      userAgent: request.get("user-agent") ?? undefined,
    };
  }
}
