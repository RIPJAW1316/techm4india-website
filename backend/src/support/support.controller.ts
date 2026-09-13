import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { RequirePermissions } from "../auth/decorators/require-permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { Principal } from "../auth/auth.types";
import { V2Controller } from "../common/v2-controller.base";
import {
  AddSupportCommentDto,
  AssignSupportTicketDto,
  CreateSupportTicketDto,
  SupportTicketQueryDto,
} from "./dto/support.dto";
import { SupportService } from "./support.service";

@ApiTags("support-v2")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: "support", version: "2" })
export class SupportController extends V2Controller {
  constructor(private readonly support: SupportService) {
    super();
  }

  @Get("dashboard")
  @RequirePermissions("support.dashboard.read")
  @ApiOperation({ summary: "Support queue and SLA-breach summary" })
  dashboard(@CurrentPrincipal() principal: Principal) {
    return this.ok(this.support.dashboard(principal));
  }

  @Get("tickets")
  @RequirePermissions("support.tickets.read")
  listTickets(@CurrentPrincipal() principal: Principal, @Query() query: SupportTicketQueryDto) {
    return this.list(this.support.listTickets(principal, query));
  }

  @Get("tickets/:id")
  @RequirePermissions("support.tickets.read")
  getTicket(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return this.ok(this.support.getTicket(principal, id));
  }

  @Post("tickets")
  @RequirePermissions("support.tickets.manage")
  @ApiOperation({ summary: "Raise a support ticket (SLA target from priority)" })
  createTicket(
    @CurrentPrincipal() principal: Principal,
    @Body() dto: CreateSupportTicketDto,
    @Req() request: Request,
  ) {
    return this.ok(this.support.createTicket(principal, dto, this.metadata(request)));
  }

  @Post("tickets/:id/comments")
  @RequirePermissions("support.tickets.manage")
  addComment(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AddSupportCommentDto,
    @Req() request: Request,
  ) {
    return this.ok(this.support.addComment(principal, id, dto, this.metadata(request)));
  }

  @Post("tickets/:id/assign")
  @RequirePermissions("support.tickets.resolve")
  assign(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AssignSupportTicketDto,
    @Req() request: Request,
  ) {
    return this.ok(this.support.assignTicket(principal, id, dto, this.metadata(request)));
  }

  @Post("tickets/:id/hold")
  @RequirePermissions("support.tickets.resolve")
  hold(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.support.transition(principal, id, "hold", this.metadata(request)));
  }

  @Post("tickets/:id/resume")
  @RequirePermissions("support.tickets.resolve")
  resume(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.support.transition(principal, id, "resume", this.metadata(request)));
  }

  @Post("tickets/:id/resolve")
  @RequirePermissions("support.tickets.resolve")
  resolve(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.support.transition(principal, id, "resolve", this.metadata(request)));
  }

  @Post("tickets/:id/close")
  @RequirePermissions("support.tickets.resolve")
  close(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.support.transition(principal, id, "close", this.metadata(request)));
  }

  @Post("tickets/:id/reopen")
  @RequirePermissions("support.tickets.resolve")
  reopen(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.support.transition(principal, id, "reopen", this.metadata(request)));
  }
}
