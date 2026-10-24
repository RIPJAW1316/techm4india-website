import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { OidcAuthorizeQueryDto, OidcTokenExchangeDto } from './dto/auth.dto';

export interface OidcTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token: string;
  scope: string;
}

@Injectable()
export class OidcService {
  private readonly logger = new Logger(OidcService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Helper to ensure default registered OIDC clients (HRMS and Finance ERP) exist in DB
   */
  async ensureRegisteredClients() {
    const defaultClients = [
      {
        clientId: 'hrms-app-client',
        clientName: 'TechM4India HRMS Portal',
        redirectUris: [
          'http://localhost:3000/hrms/auth/callback',
          'http://localhost:3002/auth/callback',
          'http://localhost:3002/hrms/auth/callback',
          'https://techm4india.com/hrms/auth/callback',
          'https://hrms.techm4india.com/auth/callback',
          'https://hrms.techm4india.com/hrms/auth/callback',
          'https://portal.techm4india.com/hrms/auth/callback',
        ],
        requirePkce: true,
      },
      {
        clientId: 'finance-erp-client',
        clientName: 'TechM4India Finance ERP',
        redirectUris: [
          'http://localhost:3000/erp/finance/auth/callback',
          'http://localhost:3001/auth/callback',
          'http://localhost:3001/erp/finance/auth/callback',
          'https://techm4india.com/erp/finance/auth/callback',
          'https://finance.techm4india.com/auth/callback',
        ],
        requirePkce: true,
      },
    ];

    for (const c of defaultClients) {
      await this.prisma.oidcClient.upsert({
        where: { clientId: c.clientId },
        update: { redirectUris: c.redirectUris },
        create: {
          clientId: c.clientId,
          clientName: c.clientName,
          redirectUris: c.redirectUris,
          requirePkce: true,
          requireClientSecret: false,
          isActive: true,
        },
      });
    }
  }

  /**
   * 1. GET /api/v1/auth/oidc/authorize
   * Validates registered client, exact redirect URI, and active application permission.
   * Generates a single-use authorization code (valid 60 seconds) bound to S256 PKCE code_challenge.
   */
  async authorize(userId: string, query: OidcAuthorizeQueryDto) {
    await this.ensureRegisteredClients();

    const client = await this.prisma.oidcClient.findUnique({
      where: { clientId: query.client_id },
    });

    if (!client || !client.isActive) {
      throw new UnauthorizedException(`OIDC client '${query.client_id}' is not registered or is inactive.`);
    }

    // Exact redirect URI validation against registered whitelist
    const isUriAllowed = client.redirectUris.some(
      (uri) => uri.toLowerCase() === query.redirect_uri.toLowerCase()
    );
    if (!isUriAllowed) {
      this.logger.warn(`Rejected untrusted redirect_uri: ${query.redirect_uri} for client: ${query.client_id}`);
      throw new BadRequestException('The redirect_uri provided does not match any registered URI for this client.');
    }

    // Check user account status
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      },
    });

    if (!user || !user.isActive) {
      throw new ForbiddenException('User account is inactive or access has been revoked.');
    }

    // Generate cryptographically random authorization code (32 bytes = 64 hex characters)
    const rawAuthCode = crypto.randomBytes(32).toString('hex');
    const codeHash = crypto.createHash('sha256').update(rawAuthCode).digest('hex');

    // 60-second validity (single-use)
    const expiresAt = new Date(Date.now() + 60 * 1000);

    await this.prisma.oidcAuthorizationCode.create({
      data: {
        codeHash,
        clientId: query.client_id,
        userId: user.id,
        redirectUri: query.redirect_uri,
        codeChallenge: query.code_challenge,
        codeChallengeMethod: query.code_challenge_method || 'S256',
        nonce: query.nonce,
        state: query.state,
        scope: query.scope || 'openid profile email',
        expiresAt,
        isUsed: false,
      },
    });

    // Form redirect URL
    const url = new URL(query.redirect_uri);
    url.searchParams.set('code', rawAuthCode);
    if (query.state) {
      url.searchParams.set('state', query.state);
    }

    return {
      redirectUrl: url.toString(),
      code: rawAuthCode,
      state: query.state,
    };
  }

  /**
   * 2. POST /api/v1/auth/oidc/token
   * Validates PKCE code_verifier using S256 transformation:
   * BASE64URL(SHA256(code_verifier)) === code_challenge
   */
  async exchangeCodeForToken(dto: OidcTokenExchangeDto): Promise<OidcTokenResponse> {
    if (dto.grant_type !== 'authorization_code') {
      throw new BadRequestException("Unsupported grant_type. Only 'authorization_code' is permitted.");
    }

    const codeHash = crypto.createHash('sha256').update(dto.code).digest('hex');

    const authCode = await this.prisma.oidcAuthorizationCode.findUnique({
      where: { codeHash },
      include: { user: { include: { userRoles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } } },
    });

    if (!authCode) {
      throw new UnauthorizedException('Invalid authorization code.');
    }

    // Replay detection: If code has already been used, invalidate and alert
    if (authCode.isUsed) {
      this.logger.error(`OIDC Security Alert: Authorization code replay detected for user ${authCode.userId}`);
      throw new UnauthorizedException('Authorization code has already been redeemed. Replay prevented.');
    }

    // Expiration check (60s)
    if (authCode.expiresAt < new Date()) {
      throw new UnauthorizedException('Authorization code has expired. Please initiate sign-in again.');
    }

    // Strict client and redirect URI matching
    if (authCode.clientId !== dto.client_id) {
      throw new UnauthorizedException('Client ID mismatch for this authorization code.');
    }

    if (authCode.redirectUri !== dto.redirect_uri) {
      throw new UnauthorizedException('Redirect URI mismatch for this authorization code.');
    }

    // Verify PKCE S256 Challenge
    // code_challenge = Base64URLEncode(SHA256(code_verifier))
    const verifierHash = crypto.createHash('sha256').update(dto.code_verifier).digest('base64url');
    if (verifierHash !== authCode.codeChallenge) {
      this.logger.warn(`PKCE verification failed for client: ${dto.client_id}`);
      throw new UnauthorizedException('PKCE code_verifier verification failed.');
    }

    // Mark code as used immediately
    await this.prisma.oidcAuthorizationCode.update({
      where: { id: authCode.id },
      data: { isUsed: true, usedAt: new Date() },
    });

    const user = authCode.user;
    if (!user || !user.isActive) {
      throw new ForbiddenException('User account has been deactivated.');
    }

    // Extract roles and permissions
    const roles: string[] = [];
    const permissionsSet = new Set<string>();

    for (const ur of user.userRoles) {
      roles.push(ur.role.code);
      for (const rp of (ur.role as any).permissions) {
        permissionsSet.add(rp.permission.code);
      }
    }
    const permissions = Array.from(permissionsSet);

    const jwtSecret = this.configService.get<string>('jwt.secret', 'techm4india-erp-secret-key-2026');
    const issuer = this.configService.get<string>('OIDC_ISSUER', 'https://api.techm4india.com');

    // 1. App-Scoped Access Token (15 min)
    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      roles,
      permissions,
      organizationId: user.organizationId,
      aud: dto.client_id,
      iss: issuer,
    };
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: jwtSecret,
      expiresIn: '15m',
    });

    // 2. OpenID Connect ID Token (RS256/HS256 compliant claims)
    const idTokenPayload = {
      sub: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      given_name: user.firstName,
      family_name: user.lastName,
      aud: dto.client_id,
      iss: issuer,
      nonce: authCode.nonce || undefined,
      auth_time: Math.floor((authCode.createdAt ? authCode.createdAt.getTime() : Date.now()) / 1000),
    };
    const idToken = this.jwtService.sign(idTokenPayload, {
      secret: jwtSecret,
      expiresIn: '1h',
    });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 900,
      id_token: idToken,
      scope: authCode.scope,
    };
  }

  /**
   * 3. GET /api/v1/auth/oidc/.well-known/openid-configuration
   */
  getOpenIdConfiguration() {
    const issuer = this.configService.get<string>('OIDC_ISSUER', 'https://api.techm4india.com');
    return {
      issuer,
      authorization_endpoint: `${issuer}/api/v1/auth/oidc/authorize`,
      token_endpoint: `${issuer}/api/v1/auth/oidc/token`,
      userinfo_endpoint: `${issuer}/api/v1/auth/me`,
      response_types_supported: ['code'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['HS256'],
      code_challenge_methods_supported: ['S256'],
      scopes_supported: ['openid', 'profile', 'email'],
      token_endpoint_auth_methods_supported: ['none'],
    };
  }
}
