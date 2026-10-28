import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { TotpService } from './totp.service';
import { PrismaService } from '../../database/prisma.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: any;
  let passwordService: any;
  let jwtService: any;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'admin@techm4india.com',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$fakeHash',
    firstName: 'Super',
    lastName: 'Admin',
    isActive: true,
    organizationId: 'org-uuid-1',
    userRoles: [
      {
        role: {
          code: 'SUPER_ADMIN',
          permissions: [
            { permission: { code: 'users:manage' } },
            { permission: { code: 'hrms:manage' } },
          ],
        },
      },
    ],
  };

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
    };

    passwordService = {
      verify: jest.fn(),
      hash: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-access-token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: PasswordService, useValue: passwordService },
        { provide: JwtService, useValue: jwtService },
        TotpService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'jwt.secret') return 'test-secret';
              return null;
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should authenticate user and return tokens when credentials are valid', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      passwordService.verify.mockResolvedValue(true);
      prismaService.refreshToken.create.mockResolvedValue({ id: 'token-id' });

      const result = await authService.login(
        { email: 'admin@techm4india.com', password: 'Password123!' },
        '127.0.0.1',
        'Jest Test Agent',
      );

      expect(result).toHaveProperty('accessToken', 'mock-jwt-access-token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn', 900);
      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockUser.id } }),
      );
    });

    it('should throw generic UnauthorizedException if user does not exist (prevents enumeration)', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nonexistent@techm4india.com', password: 'Password123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw generic UnauthorizedException if user is inactive', async () => {
      prismaService.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(
        authService.login({ email: 'admin@techm4india.com', password: 'Password123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw generic UnauthorizedException if password does not match', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      passwordService.verify.mockResolvedValue(false);

      await expect(
        authService.login({ email: 'admin@techm4india.com', password: 'WrongPassword!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should rotate token and return new token pair for valid refresh token', async () => {
      const validFutureDate = new Date();
      validFutureDate.setDate(validFutureDate.getDate() + 5);

      prismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        userId: mockUser.id,
        family: 'family-uuid-1',
        isRevoked: false,
        expiresAt: validFutureDate,
        user: mockUser,
      });

      const result = await authService.refresh('valid-raw-refresh-token');

      expect(result).toHaveProperty('accessToken', 'mock-jwt-access-token');
      expect(result).toHaveProperty('refreshToken');
      // Verifies old token is marked revoked
      expect(prismaService.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rt-1' },
          data: { isRevoked: true },
        }),
      );
      // Verifies new token is created in the same family
      expect(prismaService.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ family: 'family-uuid-1' }),
        }),
      );
    });

    it('should detect token reuse, revoke entire token family, and throw UnauthorizedException', async () => {
      prismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-already-revoked',
        userId: mockUser.id,
        family: 'family-uuid-compromised',
        isRevoked: true,
        expiresAt: new Date(),
        user: mockUser,
      });

      await expect(authService.refresh('compromised-token')).rejects.toThrow(
        UnauthorizedException,
      );

      // Verifies all tokens in that family were revoked
      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { family: 'family-uuid-compromised' },
        data: { isRevoked: true },
      });
      // Verifies security audit log
      expect(prismaService.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'SECURITY_TOKEN_REUSE_DETECTED' }),
        }),
      );
    });

    it('should reject expired refresh token', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      prismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-expired',
        userId: mockUser.id,
        family: 'family-uuid-1',
        isRevoked: false,
        expiresAt: pastDate,
        user: mockUser,
      });

      await expect(authService.refresh('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('changePassword', () => {
    it('should update password and revoke all active user sessions', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      passwordService.verify.mockResolvedValue(true);
      passwordService.hash.mockResolvedValue('$argon2id$newHash');

      const result = await authService.changePassword(mockUser.id, {
        currentPassword: 'OldPassword123!',
        newPassword: 'BrandNewPassword456!',
      });

      expect(result).toHaveProperty('message');
      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { passwordHash: '$argon2id$newHash' },
        }),
      );
      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        data: { isRevoked: true },
      });
    });

    it('should throw BadRequestException if current password does not verify', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      passwordService.verify.mockResolvedValue(false);

      await expect(
        authService.changePassword(mockUser.id, {
          currentPassword: 'IncorrectOldPassword!',
          newPassword: 'BrandNewPassword456!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if new password is identical to current password', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      passwordService.verify.mockResolvedValue(true);

      await expect(
        authService.changePassword(mockUser.id, {
          currentPassword: 'SamePassword123!',
          newPassword: 'SamePassword123!',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Two-Factor Authentication (TOTP MFA)', () => {
    it('setupMfa should return base32 secret, otpauth URI, and recovery codes', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(mockUser);

      const result = await authService.setupMfa(mockUser.id);
      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('otpauthUri');
      expect(result.otpauthUri).toContain('otpauth://totp/');
      expect(result.recoveryCodes).toHaveLength(8);
      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({ mfaRecoveryCodes: expect.any(Array) }),
        }),
      );
    });

    it('enableMfa should activate MFA when TOTP code is valid', async () => {
      const totpService = new TotpService();
      const secret = totpService.generateSecret();
      const validCode = totpService.generateTotp(secret);

      prismaService.user.update.mockResolvedValue({ ...mockUser, mfaEnabled: true, mfaSecret: secret });

      const result = await authService.enableMfa(mockUser.id, {
        secret,
        token: validCode,
      });

      expect(result).toHaveProperty('message');
      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: { mfaEnabled: true, mfaSecret: secret },
        }),
      );
    });

    it('enableMfa should throw BadRequestException when TOTP code is invalid', async () => {
      const totpService = new TotpService();
      const secret = totpService.generateSecret();

      await expect(
        authService.enableMfa(mockUser.id, {
          secret,
          token: '000000',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('revokeAllSessions should invalidate active refresh tokens for user', async () => {
      prismaService.refreshToken.updateMany.mockResolvedValue({ count: 3 });

      const result = await authService.revokeAllSessions(mockUser.id);
      expect(result.revokedCount).toBe(3);
      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id, isRevoked: false },
        data: { isRevoked: true },
      });
    });
  });
});
