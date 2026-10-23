import { DurableObject } from "cloudflare:workers";

interface Env {
  ERP_CONTAINER: DurableObjectNamespace<ErpApiContainer>;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  NODE_ENV: string;
  PORT: string;
  ACCESS_TOKEN_TTL: string;
  REFRESH_TOKEN_TTL: string;
  REFRESH_COOKIE_NAME: string;
  COOKIE_SECURE: string;
  COOKIE_SAME_SITE: string;
  TRUST_PROXY: string;
  BUSINESS_TIMEZONE: string;
  CORS_ORIGINS: string;
}

const PORT = 10000;
const HEALTH_PATH = "/api/v1/health";
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export class ErpApiContainer extends DurableObject<Env> {
  private starting?: Promise<void>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    if (ctx.container?.running) {
      void ctx.blockConcurrencyWhile(() =>
        ctx.container!.setInactivityTimeout(INACTIVITY_TIMEOUT_MS),
      );
    }
  }

  async fetch(request: Request): Promise<Response> {
    this.starting ??= this.startAndWaitForHealth().finally(() => {
      this.starting = undefined;
    });
    await this.starting;

    const url = new URL(request.url);
    url.protocol = "http:";
    url.host = "container";
    const forwarded = new Request(url, request);
    forwarded.headers.delete("host");
    return this.ctx.container!.getTcpPort(PORT).fetch(forwarded);
  }

  private async startAndWaitForHealth(): Promise<void> {
    const container = this.ctx.container!;
    if (!container.running) {
      if (!this.env.DATABASE_URL || !this.env.JWT_ACCESS_SECRET) {
        throw new Error("ERP database and JWT secrets must be configured");
      }
      container.start({
        image: container.images.base,
        instance: "basic",
        enableInternet: true,
        env: {
          DATABASE_URL: this.env.DATABASE_URL,
          JWT_ACCESS_SECRET: this.env.JWT_ACCESS_SECRET,
          NODE_ENV: this.env.NODE_ENV,
          PORT: this.env.PORT,
          ACCESS_TOKEN_TTL: this.env.ACCESS_TOKEN_TTL,
          REFRESH_TOKEN_TTL: this.env.REFRESH_TOKEN_TTL,
          REFRESH_COOKIE_NAME: this.env.REFRESH_COOKIE_NAME,
          COOKIE_SECURE: this.env.COOKIE_SECURE,
          COOKIE_SAME_SITE: this.env.COOKIE_SAME_SITE,
          TRUST_PROXY: this.env.TRUST_PROXY,
          BUSINESS_TIMEZONE: this.env.BUSINESS_TIMEZONE,
          CORS_ORIGINS: this.env.CORS_ORIGINS,
        },
      });
    }
    await container.setInactivityTimeout(INACTIVITY_TIMEOUT_MS);

    const port = container.getTcpPort(PORT);
    let lastError: unknown;
    for (let attempt = 0; attempt < 150; attempt++) {
      try {
        const response = await port.fetch(`http://container${HEALTH_PATH}`, {
          signal: AbortSignal.timeout(1000),
        });
        const health = (await response.json()) as { status?: string; database?: string };
        if (response.ok && health.status === "ok" && health.database === "connected") return;
        lastError = new Error("ERP API is not healthy yet");
      } catch (error) {
        lastError = error;
      }
      await scheduler.wait(500);
    }
    throw new Error("ERP API container did not become healthy", { cause: lastError });
  }
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (!path.startsWith("/api/")) {
      return Promise.resolve(new Response("Not found", { status: 404 }));
    }
    return env.ERP_CONTAINER.getByName("erp-api-primary").fetch(request);
  },
} satisfies ExportedHandler<Env>;
