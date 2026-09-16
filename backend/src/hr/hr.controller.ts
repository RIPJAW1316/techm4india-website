import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

import { Principal } from "../auth/auth.types";
import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  CreateEmployeeAddressDto,
  CreateEmployeeCertificationDto,
  CreateEmployeeEducationDto,
  CreateEmployeeSkillDto,
  CreateEmergencyContactDto,
  CreateHrEmployeeDto,
  ExitEmployeeDto,
  HrEmployeeQueryDto,
  UpdateEmployeeAddressDto,
  UpdateEmployeeCertificationDto,
  UpdateEmployeeEducationDto,
  UpdateEmployeeSkillDto,
  UpdateEmergencyContactDto,
  UpdateHrEmployeeDto,
} from "./dto/hr.dto";
import { HrService } from "./hr.service";

@ApiTags("hr-employees")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "hr", version: "2" })
export class HrController {
  constructor(private readonly hr: HrService) {}
  private metadata(request: Request) {
    return { ipAddress: request.ip, userAgent: request.get("user-agent") ?? undefined };
  }

  @Get("employees")
  @ApiOperation({ summary: "List safe HR employee master records within the authorized scope" })
  async list(@CurrentPrincipal() principal: Principal, @Query() query: HrEmployeeQueryDto) {
    const result = await this.hr.list(principal, query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get("employees/:id")
  @ApiOperation({ summary: "Read an authorized employee HR master record" })
  async get(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return { success: true, data: await this.hr.getById(principal, id) };
  }

  @Post("employees")
  @ApiOperation({
    summary: "Create an operational employee master record without returning credentials",
  })
  async create(
    @CurrentPrincipal() principal: Principal,
    @Body() dto: CreateHrEmployeeDto,
    @Req() request: Request,
  ) {
    return { success: true, data: await this.hr.create(principal, dto, this.metadata(request)) };
  }

  @Patch("employees/:id")
  @ApiOperation({ summary: "Update safe employee employment fields" })
  async update(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateHrEmployeeDto,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.hr.update(principal, id, dto, this.metadata(request)),
    };
  }

  @Post("employees/:id/exit")
  @ApiOperation({ summary: "Mark an employee exited while preserving the record and history" })
  async exit(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ExitEmployeeDto,
    @Req() request: Request,
  ) {
    return { success: true, data: await this.hr.exit(principal, id, dto, this.metadata(request)) };
  }

  @Get("employees/:id/history")
  @ApiOperation({ summary: "Read employment history for an authorized employee" })
  async history(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return { success: true, data: await this.hr.history(principal, id) };
  }

  @Get("employees/:id/addresses")
  async addresses(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return { success: true, data: await this.hr.addresses(principal, id) };
  }
  @Post("employees/:id/addresses")
  async createAddress(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateEmployeeAddressDto,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.hr.createAddress(principal, id, dto, this.metadata(request)),
    };
  }
  @Patch("employees/:id/addresses/:addressId")
  async updateAddress(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("addressId", ParseUUIDPipe) addressId: string,
    @Body() dto: UpdateEmployeeAddressDto,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.hr.updateAddress(principal, id, addressId, dto, this.metadata(request)),
    };
  }
  @Delete("employees/:id/addresses/:addressId")
  async removeAddress(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("addressId", ParseUUIDPipe) addressId: string,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.hr.removeAddress(principal, id, addressId, this.metadata(request)),
    };
  }

  @Get("employees/:id/emergency-contacts")
  async emergencyContacts(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return { success: true, data: await this.hr.emergencyContacts(principal, id) };
  }
  @Post("employees/:id/emergency-contacts")
  async createEmergencyContact(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateEmergencyContactDto,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.hr.createEmergencyContact(principal, id, dto, this.metadata(request)),
    };
  }
  @Patch("employees/:id/emergency-contacts/:contactId")
  async updateEmergencyContact(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("contactId", ParseUUIDPipe) contactId: string,
    @Body() dto: UpdateEmergencyContactDto,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.hr.updateEmergencyContact(
        principal,
        id,
        contactId,
        dto,
        this.metadata(request),
      ),
    };
  }
  @Delete("employees/:id/emergency-contacts/:contactId")
  async removeEmergencyContact(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("contactId", ParseUUIDPipe) contactId: string,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.hr.removeEmergencyContact(principal, id, contactId, this.metadata(request)),
    };
  }

  @Get("employees/:id/skills")
  async skills(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return { success: true, data: await this.hr.skills(principal, id) };
  }
  @Post("employees/:id/skills")
  async createSkill(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateEmployeeSkillDto,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.hr.createSkill(principal, id, dto, this.metadata(request)),
    };
  }
  @Patch("employees/:id/skills/:skillId")
  async updateSkill(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("skillId", ParseUUIDPipe) skillId: string,
    @Body() dto: UpdateEmployeeSkillDto,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.hr.updateSkill(principal, id, skillId, dto, this.metadata(request)),
    };
  }
  @Delete("employees/:id/skills/:skillId")
  async removeSkill(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("skillId", ParseUUIDPipe) skillId: string,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.hr.removeSkill(principal, id, skillId, this.metadata(request)),
    };
  }

  @Get("employees/:id/certifications")
  async certifications(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return { success: true, data: await this.hr.certifications(principal, id) };
  }
  @Post("employees/:id/certifications")
  async createCertification(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateEmployeeCertificationDto,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.hr.createCertification(principal, id, dto, this.metadata(request)),
    };
  }
  @Patch("employees/:id/certifications/:certificationId")
  async updateCertification(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("certificationId", ParseUUIDPipe) certificationId: string,
    @Body() dto: UpdateEmployeeCertificationDto,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.hr.updateCertification(
        principal,
        id,
        certificationId,
        dto,
        this.metadata(request),
      ),
    };
  }
  @Delete("employees/:id/certifications/:certificationId")
  async removeCertification(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("certificationId", ParseUUIDPipe) certificationId: string,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.hr.removeCertification(
        principal,
        id,
        certificationId,
        this.metadata(request),
      ),
    };
  }

  @Get("employees/:id/education")
  async education(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return { success: true, data: await this.hr.education(principal, id) };
  }
  @Post("employees/:id/education")
  async createEducation(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateEmployeeEducationDto,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.hr.createEducation(principal, id, dto, this.metadata(request)),
    };
  }
  @Patch("employees/:id/education/:educationId")
  async updateEducation(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("educationId", ParseUUIDPipe) educationId: string,
    @Body() dto: UpdateEmployeeEducationDto,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.hr.updateEducation(principal, id, educationId, dto, this.metadata(request)),
    };
  }
  @Delete("employees/:id/education/:educationId")
  async removeEducation(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("educationId", ParseUUIDPipe) educationId: string,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.hr.removeEducation(principal, id, educationId, this.metadata(request)),
    };
  }
}
