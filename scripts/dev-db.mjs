#!/usr/bin/env node
/**
 * Brings the development database up before the dev servers start.
 *
 * `npm run dev` should work from a clean checkout without anyone having to
 * remember a Docker incantation first, so this starts the Postgres container,
 * waits for it to report healthy, and applies any pending migrations.
 *
 * It is deliberately forgiving: if Docker is not installed, or the developer
 * points DATABASE_URL at a database they manage themselves, it warns and steps
 * aside rather than blocking the dev servers.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Relative, and run from the project root: the absolute path contains a space,
// and a spaced argument passed through a Windows shell gets split in two.
const COMPOSE_FILE = "backend/docker-compose.yml";
const CONTAINER = "techm4india-erp-postgres";
const HEALTH_TIMEOUT_MS = 90_000;

const onWindows = process.platform === "win32";

/** `npm` is a .cmd on Windows and needs a shell; a shell then re-splits on
 *  spaces, so anything that could contain one is quoted first. */
const quote = (value) => (onWindows && /[\s]/.test(value) ? `"${value}"` : value);

const run = (command, args, options = {}) =>
  spawnSync(onWindows ? quote(command) : command, onWindows ? args.map(quote) : args, {
    encoding: "utf8",
    shell: onWindows,
    cwd: root,
    ...options,
  });

const log = (message) => process.stdout.write(`[db] ${message}\n`);

/** Docker Compose v2 is `docker compose`; older installs use `docker-compose`. */
function composeCommand() {
  if (run("docker", ["compose", "version"]).status === 0) return ["docker", ["compose"]];
  if (run("docker-compose", ["version"]).status === 0) return ["docker-compose", []];
  return null;
}

function containerHealth() {
  const result = run("docker", [
    "inspect",
    "--format",
    "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}",
    CONTAINER,
  ]);
  return result.status === 0 ? result.stdout.trim() : null;
}

async function waitUntilHealthy() {
  const deadline = Date.now() + HEALTH_TIMEOUT_MS;
  let reported = null;
  while (Date.now() < deadline) {
    const health = containerHealth();
    if (health === "healthy" || health === "running") return true;
    if (health && health !== reported) {
      log(`waiting for Postgres (${health})`);
      reported = health;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.includes("localhost") && !dbUrl.includes("127.0.0.1")) {
    log("External DATABASE_URL detected (e.g. Render / Cloud Postgres) — skipping local Docker.");
    log("applying pending migrations…");
    const migrate = run("npm", ["--prefix", "backend", "run", "prisma:migrate:deploy"], {
      stdio: "inherit",
    });
    if (migrate.status !== 0) log("migrations failed — see the output above.");
    return;
  }

  if (run("docker", ["--version"]).status !== 0) {
    log("Docker is not available — skipping. Start Postgres yourself, or set DATABASE_URL.");
    return;
  }

  const compose = composeCommand();
  if (!compose) {
    log("Docker Compose is not available — skipping database startup.");
    return;
  }

  const [command, prefix] = compose;
  const health = containerHealth();
  if (health === "healthy") {
    log("Postgres already running.");
  } else {
    log("starting Postgres…");
    const up = run(command, [...prefix, "-f", COMPOSE_FILE, "up", "-d"], { stdio: "inherit" });
    if (up.status !== 0) {
      log("could not start Postgres. Is Docker Desktop running?");
      process.exitCode = 1;
      return;
    }
    if (!(await waitUntilHealthy())) {
      log("Postgres did not become healthy in time.");
      process.exitCode = 1;
      return;
    }
    log("Postgres is healthy.");
  }

  // Pending migrations are applied so a fresh checkout boots against a schema
  // that matches the code. Failure is reported but does not stop the servers,
  // because a migration problem is easier to read in the API log.
  log("applying pending migrations…");
  const migrate = run("npm", ["--prefix", "backend", "run", "prisma:migrate:deploy"], {
    stdio: "inherit",
  });
  if (migrate.status !== 0) log("migrations failed — see the output above.");
}

await main();
