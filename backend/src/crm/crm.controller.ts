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
import { CrmService } from "./crm.service";
import {
  AccountDto,
  AccountQueryDto,
  ActivityDto,
  ActivityQueryDto,
  ContactDto,
  ContactQueryDto,
  LeadConversionDto,
  LeadDto,
  LeadQueryDto,
  OpportunityDto,
  OpportunityQueryDto,
} from "./dto/crm.dto";

@ApiTags("crm-v2")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "crm", version: "2" })
export class CrmController {
  constructor(private readonly crm: CrmService) {}
  @Get("dashboard")
  @ApiOperation({ summary: "Read organization CRM dashboard" })
  dashboard(@CurrentPrincipal() p: Principal) {
    return this.crm.dashboard(p).then((data) => ({ success: true, data }));
  }
  @Get("leads") leads(@CurrentPrincipal() p: Principal, @Query() q: LeadQueryDto) {
    return this.crm.listLeads(p, q).then((result) => ({ success: true, ...result }));
  }
  @Post("leads") createLead(@CurrentPrincipal() p: Principal, @Body() dto: LeadDto) {
    return this.crm.createLead(p, dto).then((data) => ({ success: true, data }));
  }
  @Get("leads/:id") lead(@CurrentPrincipal() p: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return this.crm.getLead(p, id).then((data) => ({ success: true, data }));
  }
  @Patch("leads/:id") updateLead(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: LeadDto,
  ) {
    return this.crm.updateLead(p, id, dto).then((data) => ({ success: true, data }));
  }
  @Post("leads/:id/archive") archiveLead(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.crm.archiveLead(p, id).then((data) => ({ success: true, data }));
  }
  @Post("leads/:id/convert") convertLead(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: LeadConversionDto,
  ) {
    return this.crm.convertLead(p, id, dto).then((data) => ({ success: true, data }));
  }
  @Get("accounts") accounts(@CurrentPrincipal() p: Principal, @Query() q: AccountQueryDto) {
    return this.crm.listAccounts(p, q).then((result) => ({ success: true, ...result }));
  }
  @Post("accounts") createAccount(@CurrentPrincipal() p: Principal, @Body() dto: AccountDto) {
    return this.crm.createAccount(p, dto).then((data) => ({ success: true, data }));
  }
  @Get("accounts/:id") account(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.crm.getAccount(p, id).then((data) => ({ success: true, data }));
  }
  @Patch("accounts/:id") updateAccount(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AccountDto,
  ) {
    return this.crm.updateAccount(p, id, dto).then((data) => ({ success: true, data }));
  }
  @Get("contacts") contacts(@CurrentPrincipal() p: Principal, @Query() q: ContactQueryDto) {
    return this.crm.listContacts(p, q).then((result) => ({ success: true, ...result }));
  }
  @Post("contacts") createContact(@CurrentPrincipal() p: Principal, @Body() dto: ContactDto) {
    return this.crm.createContact(p, dto).then((data) => ({ success: true, data }));
  }
  @Get("contacts/:id") contact(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.crm.getContact(p, id).then((data) => ({ success: true, data }));
  }
  @Patch("contacts/:id") updateContact(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ContactDto,
  ) {
    return this.crm.updateContact(p, id, dto).then((data) => ({ success: true, data }));
  }
  @Get("opportunities") opportunities(
    @CurrentPrincipal() p: Principal,
    @Query() q: OpportunityQueryDto,
  ) {
    return this.crm.listOpportunities(p, q).then((result) => ({ success: true, ...result }));
  }
  @Post("opportunities") createOpportunity(
    @CurrentPrincipal() p: Principal,
    @Body() dto: OpportunityDto,
  ) {
    return this.crm.createOpportunity(p, dto).then((data) => ({ success: true, data }));
  }
  @Get("opportunities/:id") opportunity(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.crm.getOpportunity(p, id).then((data) => ({ success: true, data }));
  }
  @Patch("opportunities/:id") updateOpportunity(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: OpportunityDto,
  ) {
    return this.crm.updateOpportunity(p, id, dto).then((data) => ({ success: true, data }));
  }
  @Get("activities") activities(@CurrentPrincipal() p: Principal, @Query() q: ActivityQueryDto) {
    return this.crm.listActivities(p, q).then((result) => ({ success: true, ...result }));
  }
  @Post("activities") createActivity(@CurrentPrincipal() p: Principal, @Body() dto: ActivityDto) {
    return this.crm.createActivity(p, dto).then((data) => ({ success: true, data }));
  }
  @Patch("activities/:id") updateActivity(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ActivityDto,
  ) {
    return this.crm.updateActivity(p, id, dto).then((data) => ({ success: true, data }));
  }
  @Post("activities/:id/complete") completeActivity(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.crm.completeActivity(p, id).then((data) => ({ success: true, data }));
  }
}
