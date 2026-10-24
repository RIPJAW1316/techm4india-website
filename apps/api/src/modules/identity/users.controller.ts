import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  AssignRoleDto,
  CreateUserDto,
  GrantApplicationAccessDto,
  ListUsersQueryDto,
  UpdateUserDto,
  UpdateUserStatusDto,
} from './dto/users.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Central Identity & User Management')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions('users:read')
  @ApiOperation({
    summary: 'List Users (Paginated & Filtered)',
    description: 'Retrieve paginated user directory with role, application, and status filters.',
  })
  async listUsers(@Query() query: ListUsersQueryDto) {
    return this.usersService.listUsers(query);
  }

  @Get('me/applications')
  @ApiOperation({
    summary: 'Get Current User Authorized Applications',
    description:
      'Returns only the applications for which the current authenticated employee has an active grant, including verified redirect destinations.',
  })
  async getMyApplications(@CurrentUser('userId') userId: string) {
    return this.usersService.getUserApplications(userId);
  }

  @Get(':id')
  @Permissions('users:read')
  @ApiOperation({
    summary: 'Get User By ID',
    description: 'Returns detailed user information with assigned roles, permissions, and app access grants.',
  })
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Post()
  @Permissions('users:manage')
  @ApiOperation({
    summary: 'Create User',
    description: 'Administrator provisions a new employee account with optional initial roles and application access.',
  })
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser('roles') creatorRoles: string[],
  ) {
    return this.usersService.createUser(dto, creatorRoles || []);
  }

  @Patch(':id')
  @Permissions('users:manage')
  @ApiOperation({
    summary: 'Update User Details',
    description: 'Updates employee personal details (first name, last name, phone).',
  })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Patch(':id/status')
  @Permissions('users:manage')
  @ApiOperation({
    summary: 'Activate or Deactivate User Account',
    description: 'Toggles active status. Deactivating an account automatically revokes all active sessions.',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser('userId') currentUserId: string,
  ) {
    return this.usersService.updateStatus(id, dto.isActive, currentUserId);
  }

  @Post(':id/roles')
  @Permissions('roles:manage')
  @ApiOperation({
    summary: 'Assign Role to User',
    description: 'Grants a role (e.g., HRMS_ADMIN, FINANCE_USER) to the specified user.',
  })
  async assignRole(
    @Param('id') id: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser('roles') assignerRoles: string[],
  ) {
    return this.usersService.assignRole(id, dto, assignerRoles || []);
  }

  @Delete(':id/roles/:roleCode')
  @Permissions('roles:manage')
  @ApiOperation({
    summary: 'Revoke Role from User',
    description: 'Revokes a specific role from the specified user.',
  })
  async revokeRole(
    @Param('id') id: string,
    @Param('roleCode') roleCode: string,
  ) {
    return this.usersService.revokeRole(id, roleCode);
  }

  @Get(':id/applications')
  @Permissions('apps:read')
  @ApiOperation({
    summary: 'View User Application Grants',
    description: 'Returns the list of platform applications the user is authorized to access.',
  })
  async getUserApplications(@Param('id') id: string) {
    return this.usersService.getUserApplications(id);
  }

  @Post(':id/applications')
  @Permissions('apps:manage')
  @ApiOperation({
    summary: 'Grant Application Access',
    description: 'Grants access to a specific application (HRMS, FINANCE, etc.) for a user.',
  })
  async grantApplicationAccess(
    @Param('id') id: string,
    @Body() dto: GrantApplicationAccessDto,
  ) {
    return this.usersService.grantApplicationAccess(id, dto);
  }

  @Delete(':id/applications/:applicationCode')
  @Permissions('apps:manage')
  @ApiOperation({
    summary: 'Revoke Application Access',
    description: 'Revokes a user’s access to an application.',
  })
  async revokeApplicationAccess(
    @Param('id') id: string,
    @Param('applicationCode') applicationCode: string,
  ) {
    return this.usersService.revokeApplicationAccess(id, applicationCode);
  }

  @Post(':id/revoke-sessions')
  @Permissions('users:manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke All User Sessions',
    description: 'Security action: invalidates all active refresh tokens for the target user.',
  })
  async revokeUserSessions(@Param('id') id: string) {
    return this.usersService.revokeUserSessions(id);
  }
}
