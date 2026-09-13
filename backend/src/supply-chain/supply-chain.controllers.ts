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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { RequirePermissions } from "../auth/decorators/require-permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { Principal } from "../auth/auth.types";
import { V2Controller } from "../common/v2-controller.base";
import {
  AssetQueryDto,
  AssignAssetDto,
  CreateAssetDto,
  CreateInventoryItemDto,
  CreatePurchaseOrderDto,
  CreateVendorDto,
  InventoryItemQueryDto,
  PurchaseOrderQueryDto,
  StockAdjustmentDto,
  VendorQueryDto,
} from "./dto/supply-chain.dto";
import { AssetsService } from "./assets.service";
import { InventoryService } from "./inventory.service";
import { ProcurementService } from "./procurement.service";
import { VendorsService } from "./vendors.service";

@ApiTags("vendors-v2")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: "vendors", version: "2" })
export class VendorsController extends V2Controller {
  constructor(private readonly vendors: VendorsService) {
    super();
  }

  @Get()
  @RequirePermissions("procurement.vendors.read")
  listVendors(@CurrentPrincipal() principal: Principal, @Query() query: VendorQueryDto) {
    return this.list(this.vendors.listVendors(principal, query));
  }

  @Get(":id")
  @RequirePermissions("procurement.vendors.read")
  get(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return this.ok(this.vendors.getVendor(principal, id));
  }

  @Post()
  @RequirePermissions("procurement.vendors.manage")
  create(
    @CurrentPrincipal() principal: Principal,
    @Body() dto: CreateVendorDto,
    @Req() request: Request,
  ) {
    return this.ok(this.vendors.createVendor(principal, dto, this.metadata(request)));
  }

  @Post(":id/approve")
  @RequirePermissions("procurement.vendors.manage")
  approve(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.vendors.transitionVendor(principal, id, "approve", this.metadata(request)));
  }

  @Post(":id/suspend")
  @RequirePermissions("procurement.vendors.manage")
  suspend(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.vendors.transitionVendor(principal, id, "suspend", this.metadata(request)));
  }

  @Post(":id/reinstate")
  @RequirePermissions("procurement.vendors.manage")
  reinstate(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.vendors.transitionVendor(principal, id, "reinstate", this.metadata(request)));
  }

  @Post(":id/blacklist")
  @RequirePermissions("procurement.vendors.manage")
  blacklist(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.vendors.transitionVendor(principal, id, "blacklist", this.metadata(request)));
  }
}

@ApiTags("inventory-v2")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: "inventory-items", version: "2" })
export class InventoryController extends V2Controller {
  constructor(private readonly inventory: InventoryService) {
    super();
  }

  @Get()
  @RequirePermissions("inventory.read")
  listItems(@CurrentPrincipal() principal: Principal, @Query() query: InventoryItemQueryDto) {
    return this.list(this.inventory.listItems(principal, query));
  }

  @Get(":id")
  @RequirePermissions("inventory.read")
  getItem(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return this.ok(this.inventory.getItem(principal, id));
  }

  @Get(":id/movements")
  @RequirePermissions("inventory.read")
  movements(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Query() query: InventoryItemQueryDto,
  ) {
    return this.list(this.inventory.listMovements(principal, id, query));
  }

  @Post()
  @RequirePermissions("inventory.manage")
  createItem(
    @CurrentPrincipal() principal: Principal,
    @Body() dto: CreateInventoryItemDto,
    @Req() request: Request,
  ) {
    return this.ok(this.inventory.createItem(principal, dto, this.metadata(request)));
  }

  @Post(":id/adjust")
  @RequirePermissions("inventory.manage")
  adjust(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: StockAdjustmentDto,
    @Req() request: Request,
  ) {
    return this.ok(this.inventory.adjustStock(principal, id, dto, this.metadata(request)));
  }
}

@ApiTags("procurement-v2")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: "purchase-orders", version: "2" })
export class ProcurementController extends V2Controller {
  constructor(private readonly procurement: ProcurementService) {
    super();
  }

  @Get()
  @RequirePermissions("procurement.orders.read")
  listOrders(@CurrentPrincipal() principal: Principal, @Query() query: PurchaseOrderQueryDto) {
    return this.list(this.procurement.listOrders(principal, query));
  }

  @Get(":id")
  @RequirePermissions("procurement.orders.read")
  getOrder(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return this.ok(this.procurement.getOrder(principal, id));
  }

  @Post()
  @RequirePermissions("procurement.orders.manage")
  createOrder(
    @CurrentPrincipal() principal: Principal,
    @Body() dto: CreatePurchaseOrderDto,
    @Req() request: Request,
  ) {
    return this.ok(this.procurement.createOrder(principal, dto, this.metadata(request)));
  }

  @Post(":id/submit")
  @RequirePermissions("procurement.orders.manage")
  submit(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.procurement.transitionOrder(principal, id, "submit", this.metadata(request)));
  }

  @Post(":id/approve")
  @RequirePermissions("procurement.orders.approve")
  approve(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.procurement.transitionOrder(principal, id, "approve", this.metadata(request)));
  }

  @Post(":id/issue")
  @RequirePermissions("procurement.orders.manage")
  issue(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.procurement.transitionOrder(principal, id, "issue", this.metadata(request)));
  }

  @Post(":id/receive")
  @RequirePermissions("procurement.orders.manage")
  receive(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.procurement.receiveOrder(principal, id, this.metadata(request)));
  }

  @Post(":id/cancel")
  @RequirePermissions("procurement.orders.manage")
  cancel(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.procurement.transitionOrder(principal, id, "cancel", this.metadata(request)));
  }
}

@ApiTags("assets-v2")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: "assets", version: "2" })
export class AssetsController extends V2Controller {
  constructor(private readonly assets: AssetsService) {
    super();
  }

  @Get()
  @RequirePermissions("assets.read")
  listAssets(@CurrentPrincipal() principal: Principal, @Query() query: AssetQueryDto) {
    return this.list(this.assets.listAssets(principal, query));
  }

  @Get(":id")
  @RequirePermissions("assets.read")
  getAsset(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return this.ok(this.assets.getAsset(principal, id));
  }

  @Post()
  @RequirePermissions("assets.manage")
  createAsset(
    @CurrentPrincipal() principal: Principal,
    @Body() dto: CreateAssetDto,
    @Req() request: Request,
  ) {
    return this.ok(this.assets.createAsset(principal, dto, this.metadata(request)));
  }

  @Post(":id/assign")
  @RequirePermissions("assets.manage")
  assign(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AssignAssetDto,
    @Req() request: Request,
  ) {
    return this.ok(this.assets.assignAsset(principal, id, dto, this.metadata(request)));
  }

  @Post(":id/return")
  @RequirePermissions("assets.manage")
  returnAsset(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.assets.returnAsset(principal, id, this.metadata(request)));
  }

  @Post(":id/retire")
  @RequirePermissions("assets.manage")
  retire(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.assets.retireAsset(principal, id, this.metadata(request)));
  }
}
