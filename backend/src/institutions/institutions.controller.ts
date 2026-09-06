import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Principal } from "../auth/auth.types";
import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  EngagementQueryDto,
  InstitutionContactDto,
  InstitutionDto,
  InstitutionEngagementDto,
  InstitutionQueryDto,
} from "./dto/institution.dto";
import { InstitutionsService } from "./institutions.service";

@ApiTags("institutions-v2")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "institutions", version: "2" })
export class InstitutionsController {
  constructor(private readonly institutions: InstitutionsService) {}
  @Get("dashboard")
  @ApiOperation({ summary: "Read organization institution dashboard" })
  dashboard(@CurrentPrincipal() p: Principal) {
    return this.institutions
      .dashboard(p)
      .then((data) => ({ success: true, data }));
  }
  @Get() list(
    @CurrentPrincipal() p: Principal,
    @Query() q: InstitutionQueryDto,
  ) {
    return this.institutions
      .list(p, q)
      .then((result) => ({ success: true, ...result }));
  }
  @Post() create(
    @CurrentPrincipal() p: Principal,
    @Body() dto: InstitutionDto,
  ) {
    return this.institutions
      .create(p, dto)
      .then((data) => ({ success: true, data }));
  }
  @Post("from-crm/:accountId") fromCrm(
    @CurrentPrincipal() p: Principal,
    @Param("accountId", ParseUUIDPipe) accountId: string,
    @Body() dto: InstitutionDto,
  ) {
    return this.institutions
      .fromCrm(p, accountId, dto)
      .then((data) => ({ success: true, data }));
  }
  @Get(":id") detail(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.institutions
      .detail(p, id)
      .then((data) => ({ success: true, data }));
  }
  @Patch(":id") update(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: InstitutionDto,
  ) {
    return this.institutions
      .update(p, id, dto)
      .then((data) => ({ success: true, data }));
  }
  @Post(":id/archive") archive(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.institutions
      .archive(p, id)
      .then((data) => ({ success: true, data }));
  }
  @Get(":id/contacts") contacts(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.institutions
      .contacts(p, id)
      .then((data) => ({ success: true, data }));
  }
  @Post(":id/contacts") createContact(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: InstitutionContactDto,
  ) {
    return this.institutions
      .createContact(p, id, dto)
      .then((data) => ({ success: true, data }));
  }
  @Patch(":id/contacts/:contactId") updateContact(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("contactId", ParseUUIDPipe) contactId: string,
    @Body() dto: InstitutionContactDto,
  ) {
    return this.institutions
      .updateContact(p, id, contactId, dto)
      .then((data) => ({ success: true, data }));
  }
  @Get(":id/engagements") engagements(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Query() q: EngagementQueryDto,
  ) {
    return this.institutions
      .engagements(p, id, q)
      .then((data) => ({ success: true, data }));
  }
  @Post(":id/engagements") createEngagement(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: InstitutionEngagementDto,
  ) {
    return this.institutions
      .createEngagement(p, id, dto)
      .then((data) => ({ success: true, data }));
  }
  @Get(":id/engagements/:engagementId") engagement(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("engagementId", ParseUUIDPipe) engagementId: string,
  ) {
    return this.institutions
      .engagement(p, id, engagementId)
      .then((data) => ({ success: true, data }));
  }
  @Patch(":id/engagements/:engagementId") updateEngagement(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("engagementId", ParseUUIDPipe) engagementId: string,
    @Body() dto: InstitutionEngagementDto,
  ) {
    return this.institutions
      .updateEngagement(p, id, engagementId, dto)
      .then((data) => ({ success: true, data }));
  }
}
