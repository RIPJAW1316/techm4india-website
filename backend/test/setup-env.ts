import { randomBytes } from "node:crypto";

process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET = randomBytes(48).toString("base64url");
