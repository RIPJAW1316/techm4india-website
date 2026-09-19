import "reflect-metadata";

import { ConfigService } from "@nestjs/config";

import { createConfiguredApp } from "./create-app";

async function bootstrap(): Promise<void> {
  const app = await createConfiguredApp();
  const configService = app.get(ConfigService);
  const port = configService.get<number>("port") ?? 3001;

  await app.listen(port, "0.0.0.0");
}

void bootstrap().catch((err) => {
  console.error("BOOTSTRAP FAILED:", err);
  process.exit(1);
});
