import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PasswordService } from '../auth/password.service';
import { PrismaService } from '../../database/prisma.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: any;
  let passwordService: any;

  beforeEach(async () => {
    prismaService = {
      user: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      userRole: {
        create: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn(),
      },
      organization: {
        findUnique: jest.fn(),
      },
      application: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      userApplicationAccess: {
        create: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn(),
      },
      refreshToken: {
        updateMany: jest.fn(),
      },
    };

    passwordService = {
      hash: jest.fn().mockResolvedValue('$argon2id$hashedPassword'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaService },
        { provide: PasswordService, useValue: passwordService },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  describe('createUser', () => {
    it('should create an employee account with Argon2id hash', async () => {
      prismaService.user.findUnique
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce({
          id: 'new-user-1',
          email: 'rahul.verma@techm4india.com',
          firstName: 'Rahul',
          lastName: 'Verma',
          isActive: true,
          userRoles: [],
          appAccess: [],
        }); // getUserById call

      prismaService.role.findMany.mockResolvedValue([
        { id: 'role-1', code: 'HRMS_USER' },
      ]);
      prismaService.user.create.mockResolvedValue({ id: 'new-user-1' });

      const result = await usersService.createUser(
        {
          email: 'rahul.verma@techm4india.com',
          password: 'InitialPassword123!',
          firstName: 'Rahul',
          lastName: 'Verma',
          roles: ['HRMS_USER'],
        },
        ['HRMS_ADMIN'],
      );

      expect(passwordService.hash).toHaveBeenCalledWith('InitialPassword123!');
      expect(prismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'rahul.verma@techm4india.com',
            passwordHash: '$argon2id$hashedPassword',
          }),
        }),
      );
      expect(result).toHaveProperty('id', 'new-user-1');
    });

    it('should prevent privilege escalation: non-SUPER_ADMIN cannot create user with SUPER_ADMIN role', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        usersService.createUser(
          {
            email: 'escalation@techm4india.com',
            password: 'Password123!',
            firstName: 'Hacker',
            lastName: 'Attempt',
            roles: ['SUPER_ADMIN'],
          },
          ['HRMS_ADMIN'], // Non-super admin creator
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if email is already registered', async () => {
      prismaService.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        usersService.createUser(
          {
            email: 'duplicate@techm4india.com',
            password: 'Password123!',
            firstName: 'Duplicate',
            lastName: 'User',
          },
          ['SUPER_ADMIN'],
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateStatus', () => {
    it('should deactivate user and revoke all their active sessions', async () => {
      prismaService.user.findUnique.mockResolvedValue({ id: 'user-to-deactivate' });
      prismaService.user.update.mockResolvedValue({ id: 'user-to-deactivate', isActive: false });
      prismaService.refreshToken.updateMany.mockResolvedValue({ count: 3 });

      const result = await usersService.updateStatus(
        'user-to-deactivate',
        false,
        'admin-user-id',
      );

      expect(result.isActive).toBe(false);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-to-deactivate' },
        data: { isActive: false },
      });
      // Verifies active sessions are invalidated upon deactivation
      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-to-deactivate' },
        data: { isRevoked: true },
      });
    });

    it('should prevent admin from deactivating their own account (self-lockout prevention)', async () => {
      await expect(
        usersService.updateStatus('admin-user-id', false, 'admin-user-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('revokeUserSessions', () => {
    it('should revoke all active sessions for a user', async () => {
      prismaService.user.findUnique.mockResolvedValue({ id: 'target-user' });
      prismaService.refreshToken.updateMany.mockResolvedValue({ count: 4 });

      const result = await usersService.revokeUserSessions('target-user');

      expect(result.revokedSessionsCount).toBe(4);
      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'target-user', isRevoked: false },
        data: { isRevoked: true },
      });
    });
  });
});
