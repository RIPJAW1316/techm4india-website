import { Injectable } from "@nestjs/common";
import argon2 from "argon2";

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      memoryCost: 19_456,
      parallelism: 1,
      timeCost: 2,
      type: argon2.argon2id,
    });
  }

  async verify(hash: string, password: string): Promise<boolean> {
    if (!hash.startsWith("$argon2id$")) {
      return false;
    }

    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }
}
