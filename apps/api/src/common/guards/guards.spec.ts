import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { PermissionsGuard } from './permissions.guard';

describe('Authorization Guards & Isolation', () => {
  let reflector: Reflector;
  let rolesGuard: RolesGuard;
  let permissionsGuard: PermissionsGuard;

  const createMockContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
    permissionsGuard = new PermissionsGuard(reflector);
  });

  describe('RolesGuard & Access Isolation', () => {
    it('should allow SUPER_ADMIN access to any role-restricted endpoint (Global Admin)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['FINANCE_ADMIN']);

      const context = createMockContext({
        userId: 'admin-1',
        roles: ['SUPER_ADMIN'],
      });

      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('should allow HRMS_ADMIN access to HRMS endpoint', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['HRMS_ADMIN']);

      const context = createMockContext({
        userId: 'hrms-admin-1',
        roles: ['HRMS_ADMIN'],
      });

      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('HRMS / Finance ISOLATION: HRMS_ADMIN should be denied access to Finance ERP endpoint', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['FINANCE_ADMIN']);

      const context = createMockContext({
        userId: 'hrms-admin-1',
        roles: ['HRMS_ADMIN'], // User holds HRMS role only
      });

      expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('HRMS / Finance ISOLATION: FINANCE_ADMIN should be denied access to HRMS endpoint', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['HRMS_ADMIN']);

      const context = createMockContext({
        userId: 'finance-admin-1',
        roles: ['FINANCE_ADMIN'], // User holds Finance role only
      });

      expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should pass if route has no role restrictions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const context = createMockContext({ userId: 'u-1', roles: ['HRMS_USER'] });
      expect(rolesGuard.canActivate(context)).toBe(true);
    });
  });

  describe('PermissionsGuard', () => {
    it('should allow user possessing all required granular permissions', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['hrms:manage', 'hrms:access']);

      const context = createMockContext({
        userId: 'user-1',
        roles: ['HRMS_ADMIN'],
        permissions: ['hrms:manage', 'hrms:access', 'users:read'],
      });

      expect(permissionsGuard.canActivate(context)).toBe(true);
    });

    it('should deny user missing a required granular permission', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['users:manage']);

      const context = createMockContext({
        userId: 'user-2',
        roles: ['HRMS_USER'],
        permissions: ['hrms:access'], // Lacks users:manage
      });

      expect(() => permissionsGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow SUPER_ADMIN regardless of explicit permissions list', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['finance:ledger:write']);

      const context = createMockContext({
        userId: 'super-admin-id',
        roles: ['SUPER_ADMIN'],
        permissions: [],
      });

      expect(permissionsGuard.canActivate(context)).toBe(true);
    });
  });
});
