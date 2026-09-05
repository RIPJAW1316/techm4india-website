import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Principal } from "../auth/auth.types";
import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OrganizationService } from "./organization.service";

@ApiTags("organization")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get("organization/me")
  @ApiOperation({ summary: "Return the current employee organizational context" })
  async getMyOrganization(@CurrentPrincipal() principal: Principal) {
    return { success: true, data: await this.organizationService.getMyOrganization(principal) };
  }

  @Get("divisions")
  @ApiOperation({ summary: "List divisions visible to the current principal" })
  async listDivisions(@CurrentPrincipal() principal: Principal) {
    return { success: true, data: await this.organizationService.listDivisions(principal) };
  }

  @Get("divisions/:id")
  @ApiOperation({ summary: "Read one authorized division" })
  async getDivision(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return { success: true, data: await this.organizationService.getDivision(principal, id) };
  }

  @Get("divisions/:divisionId/departments")
  @ApiOperation({ summary: "List active departments in an authorized division" })
  async listDepartments(@CurrentPrincipal() principal: Principal, @Param("divisionId", ParseUUIDPipe) divisionId: string) {
    return { success: true, data: await this.organizationService.listDepartments(principal, divisionId) };
  }
}
