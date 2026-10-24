import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import {
  ApplicationItemDto,
  CreateApplicationDto,
  UpdateApplicationDto,
} from './dto/applications.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Applications & Single Sign-On Registry')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get('applications')
  @ApiOperation({
    summary: 'List Applications for Authenticated User',
    description:
      'Returns the platform applications catalog along with access indicators and permitted destination URLs for the current user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Applications retrieved',
    type: [ApplicationItemDto],
  })
  async listApplications(
    @CurrentUser('userId') userId: string,
    @CurrentUser('roles') roles: string[],
  ): Promise<ApplicationItemDto[]> {
    return this.applicationsService.listApplications(userId, roles || []);
  }

  @Post('applications')
  @Permissions('apps:manage')
  @ApiOperation({
    summary: 'Register New Application',
    description: 'Administrator registers a new application in the central catalog with URL origin validation.',
  })
  async createApplication(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.createApplication(dto);
  }

  @Patch('applications/:id')
  @Permissions('apps:manage')
  @ApiOperation({
    summary: 'Update Application',
    description: 'Administrator updates application display name, destination, or status.',
  })
  async updateApplication(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationsService.updateApplication(id, dto);
  }

  @Delete('applications/:id')
  @Permissions('apps:manage')
  @ApiOperation({
    summary: 'Delete Application',
    description: 'Administrator removes an application from the central catalog.',
  })
  async deleteApplication(@Param('id') id: string) {
    return this.applicationsService.deleteApplication(id);
  }
}
