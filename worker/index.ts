/** Cloudflare Worker entry point for the TechM4India site. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: {
    fetch(input: Request | string): Promise<Response>;
  };
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
  ERP_API_ORIGIN: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Keep ERP cookies and browser requests on the website origin. The NestJS
    // API remains on Vercel until the Cloudflare account can run Containers.
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      const origin = request.headers.get("Origin");
      if (origin && origin !== url.origin) {
        return Response.json({ message: "Origin not allowed" }, { status: 403 });
      }

      const upstreamUrl = new URL(`${url.pathname}${url.search}`, env.ERP_API_ORIGIN);
      const upstreamRequest = new Request(upstreamUrl, request);
      upstreamRequest.headers.delete("Origin");
      upstreamRequest.headers.delete("Host");

      try {
        return await fetch(upstreamRequest, { redirect: "manual" });
      } catch (error) {
        console.error("ERP API upstream request failed", error);
        return Response.json({ message: "ERP API is temporarily unavailable" }, { status: 502 });
      }
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
