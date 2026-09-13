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
  AddCmsRevisionDto,
  CmsPageQueryDto,
  CreateCmsPageDto,
} from "./dto/cms.dto";
import { CmsService } from "./cms.service";

@ApiTags("cms-v2")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: "cms/pages", version: "2" })
export class CmsController extends V2Controller {
  constructor(private readonly cms: CmsService) {
    super();
  }

  @Get()
  @RequirePermissions("cms.content.read")
  listPages(@CurrentPrincipal() principal: Principal, @Query() query: CmsPageQueryDto) {
    return this.list(this.cms.listPages(principal, query));
  }

  @Get(":id")
  @RequirePermissions("cms.content.read")
  getPage(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return this.ok(this.cms.getPage(principal, id));
  }

  @Post()
  @RequirePermissions("cms.content.manage")
  @ApiOperation({ summary: "Create a draft content page with its first revision" })
  createPage(
    @CurrentPrincipal() principal: Principal,
    @Body() dto: CreateCmsPageDto,
    @Req() request: Request,
  ) {
    return this.ok(this.cms.createPage(principal, dto, this.metadata(request)));
  }

  @Post(":id/revisions")
  @RequirePermissions("cms.content.manage")
  addRevision(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AddCmsRevisionDto,
    @Req() request: Request,
  ) {
    return this.ok(this.cms.addRevision(principal, id, dto, this.metadata(request)));
  }

  @Post(":id/submit")
  @RequirePermissions("cms.content.manage")
  submit(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.cms.transition(principal, id, "submit", this.metadata(request)));
  }

  @Post(":id/publish")
  @RequirePermissions("cms.content.publish")
  publish(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.cms.transition(principal, id, "publish", this.metadata(request)));
  }

  @Post(":id/archive")
  @RequirePermissions("cms.content.publish")
  archive(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.cms.transition(principal, id, "archive", this.metadata(request)));
  }
}
