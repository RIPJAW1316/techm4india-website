import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { AssetsService } from "./assets.service";
import { InventoryService } from "./inventory.service";
import { ProcurementService } from "./procurement.service";
import { VendorsService } from "./vendors.service";
import {
  AssetsController,
  InventoryController,
  ProcurementController,
  VendorsController,
} from "./supply-chain.controllers";

@Module({
  imports: [AuthModule],
  controllers: [
    VendorsController,
    InventoryController,
    ProcurementController,
    AssetsController,
  ],
  providers: [VendorsService, InventoryService, ProcurementService, AssetsService],
})
export class SupplyChainModule {}
