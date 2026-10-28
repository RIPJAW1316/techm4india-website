import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

@Injectable()
export class TotpService {
  private readonly timeStepSeconds = 30;
  private readonly digits = 6;

  // =========================================================================
  // Base32 Encoding / Decoding (RFC 4648)
  // =========================================================================

  encodeBase32(buffer: Buffer): string {
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;

      while (bits >= 5) {
        output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
    }

    return output;
  }

  decodeBase32(input: string): Buffer {
    const cleanInput = input.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
    let bits = 0;
    let value = 0;
    const bytes: number[] = [];

    for (let i = 0; i < cleanInput.length; i++) {
      const idx = BASE32_ALPHABET.indexOf(cleanInput[i]);
      if (idx === -1) {
        throw new Error(`Invalid Base32 character: ${cleanInput[i]}`);
      }
      value = (value << 5) | idx;
      bits += 5;

      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return Buffer.from(bytes);
  }

  // =========================================================================
  // RFC 6238 TOTP Methods
  // =========================================================================

  generateSecret(byteLength = 20): string {
    const randomBytes = crypto.randomBytes(byteLength);
    return this.encodeBase32(randomBytes);
  }

  generateTotp(secretBase32: string, timestampMs = Date.now()): string {
    const counter = Math.floor(timestampMs / 1000 / this.timeStepSeconds);
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigInt64BE(BigInt(counter));

    const key = this.decodeBase32(secretBase32);
    const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();

    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const otp = binary % 10 ** this.digits;
    return otp.toString().padStart(this.digits, '0');
  }

  verifyTotp(secretBase32: string, token: string, window = 1): boolean {
    if (!token || token.length !== this.digits) {
      return false;
    }

    const currentTime = Date.now();
    for (let step = -window; step <= window; step++) {
      const stepTime = currentTime + step * this.timeStepSeconds * 1000;
      if (this.generateTotp(secretBase32, stepTime) === token) {
        return true;
      }
    }
    return false;
  }

  getTotpUri(email: string, secretBase32: string, issuer = 'TechM4India'): string {
    const encodedIssuer = encodeURIComponent(issuer);
    const encodedUser = encodeURIComponent(email);
    return `otpauth://totp/${encodedIssuer}:${encodedUser}?secret=${secretBase32}&issuer=${encodedIssuer}&algorithm=SHA1&digits=${this.digits}&period=${this.timeStepSeconds}`;
  }

  // =========================================================================
  // Emergency Recovery Codes
  // =========================================================================

  generateRecoveryCodes(count = 8): { rawCodes: string[]; hashedCodes: string[] } {
    const rawCodes: string[] = [];
    const hashedCodes: string[] = [];

    for (let i = 0; i < count; i++) {
      const raw = `${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      rawCodes.push(raw);
      const hashed = crypto.createHash('sha256').update(raw).digest('hex');
      hashedCodes.push(hashed);
    }

    return { rawCodes, hashedCodes };
  }

  verifyRecoveryCode(
    rawCode: string,
    hashedCodes: string[],
  ): { isValid: boolean; remainingHashedCodes: string[] } {
    const targetHash = crypto.createHash('sha256').update(rawCode.trim().toUpperCase()).digest('hex');
    const index = hashedCodes.indexOf(targetHash);

    if (index === -1) {
      return { isValid: false, remainingHashedCodes: hashedCodes };
    }

    const remaining = [...hashedCodes];
    remaining.splice(index, 1);
    return { isValid: true, remainingHashedCodes: remaining };
  }
}
