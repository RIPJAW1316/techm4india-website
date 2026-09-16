"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState, type FormEvent } from "react";

import { FounderModuleNavigation } from "@/app/erp/components/FounderModuleNavigation";
import { ProtectedErp } from "@/app/erp/components/ProtectedErp";
import { useErpAuth } from "@/app/erp/components/AuthProvider";
import { ApiError, apiFetchV2 } from "@/lib/api/client";
import type {
  Asset,
  HrEmployeeSummary,
  InventoryItem,
  PurchaseOrder,
  Vendor,
} from "@/lib/api/types";

type ApiList<T> = { success: true; data: T[]; meta?: { total: number } };
type Tab = "vendors" | "inventory" | "procurement" | "assets";

const pretty = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const money = (value: string) => Number(value).toLocaleString("en-IN");

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

const emptyVendor = { code: "", name: "", category: "GOODS", contactEmail: "" };
const emptyItem = { sku: "", name: "", category: "", unitCost: "0", reorderLevel: "0" };
const emptyOrder = {
  code: "",
  vendorId: "",
  title: "",
  orderDate: "",
  itemId: "",
  description: "",
  quantity: "1",
  unitCost: "0",
};
const emptyAsset = { assetTag: "", name: "", category: "IT_EQUIPMENT", serialNumber: "" };

function FounderSupplyChainContent() {
  const { context } = useErpAuth();
  const [tab, setTab] = useState<Tab>("vendors");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<HrEmployeeSummary[]>([]);

  const [vendorForm, setVendorForm] = useState(emptyVendor);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [orderForm, setOrderForm] = useState(emptyOrder);
  const [assetForm, setAssetForm] = useState(emptyAsset);
  const [adjust, setAdjust] = useState<{ itemId: string; quantity: string }>({
    itemId: "",
    quantity: "",
  });

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canManageVendors = Boolean(context?.permissions.includes("procurement.vendors.manage"));
  const canManageOrders = Boolean(context?.permissions.includes("procurement.orders.manage"));
  const canApproveOrders = Boolean(context?.permissions.includes("procurement.orders.approve"));
  const canManageInventory = Boolean(context?.permissions.includes("inventory.manage"));
  const canManageAssets = Boolean(context?.permissions.includes("assets.manage"));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vendorRes, itemRes, orderRes, assetRes, employeeRes] = await Promise.all([
        safe<ApiList<Vendor>>(apiFetchV2("/vendors?limit=100"), { success: true, data: [] }),
        safe<ApiList<InventoryItem>>(apiFetchV2("/inventory-items?limit=100"), {
          success: true,
          data: [],
        }),
        safe<ApiList<PurchaseOrder>>(apiFetchV2("/purchase-orders?limit=100"), {
          success: true,
          data: [],
        }),
        safe<ApiList<Asset>>(apiFetchV2("/assets?limit=100"), { success: true, data: [] }),
        safe<ApiList<HrEmployeeSummary>>(apiFetchV2("/hr/employees?limit=100"), {
          success: true,
          data: [],
        }),
      ]);
      setVendors(vendorRes.data);
      setItems(itemRes.data);
      setOrders(orderRes.data);
      setAssets(assetRes.data);
      setEmployees(employeeRes.data);
    } catch (reason) {
      setError(
        reason instanceof ApiError ? reason.message : "Supply chain workspace could not load.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(success);
      await load();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "The action could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function createVendor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () =>
        apiFetchV2("/vendors", {
          method: "POST",
          body: JSON.stringify({
            code: vendorForm.code,
            name: vendorForm.name,
            category: vendorForm.category,
            contactEmail: vendorForm.contactEmail || undefined,
          }),
        }),
      "Vendor created (pending approval).",
    );
    setVendorForm(emptyVendor);
  }

  async function createItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () =>
        apiFetchV2("/inventory-items", {
          method: "POST",
          body: JSON.stringify({
            sku: itemForm.sku,
            name: itemForm.name,
            category: itemForm.category,
            unitCost: Number(itemForm.unitCost),
            reorderLevel: Number(itemForm.reorderLevel),
          }),
        }),
      "Inventory item created.",
    );
    setItemForm(emptyItem);
  }

  async function adjustStock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adjust.itemId) return;
    await runAction(
      () =>
        apiFetchV2(`/inventory-items/${adjust.itemId}/adjust`, {
          method: "POST",
          body: JSON.stringify({ quantity: Number(adjust.quantity) }),
        }),
      "Stock level adjusted.",
    );
    setAdjust({ itemId: "", quantity: "" });
  }

  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () =>
        apiFetchV2("/purchase-orders", {
          method: "POST",
          body: JSON.stringify({
            code: orderForm.code,
            vendorId: orderForm.vendorId,
            title: orderForm.title,
            orderDate: orderForm.orderDate,
            items: [
              {
                itemId: orderForm.itemId || undefined,
                description: orderForm.description,
                quantity: Number(orderForm.quantity),
                unitCost: Number(orderForm.unitCost),
              },
            ],
          }),
        }),
      "Purchase order created.",
    );
    setOrderForm(emptyOrder);
  }

  async function createAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () =>
        apiFetchV2("/assets", {
          method: "POST",
          body: JSON.stringify({
            assetTag: assetForm.assetTag,
            name: assetForm.name,
            category: assetForm.category,
            serialNumber: assetForm.serialNumber || undefined,
          }),
        }),
      "Asset registered.",
    );
    setAssetForm(emptyAsset);
  }

  const activeVendors = vendors.filter((item) => item.status === "ACTIVE");

  return (
    <main className="erp-main">
      <div className="erp-content">
        <FounderModuleNavigation active="supply-chain" />

        <section className="erp-welcome">
          <div>
            <p className="erp-kicker">Procurement · inventory · assets</p>
            <h1>
              Supply <em>chain</em>
            </h1>
            <p>
              Approve vendors, raise and receive purchase orders into a live stock ledger, and
              manage the asset register across its assignment lifecycle.
            </p>
          </div>
          <div className="erp-welcome-code">
            <span>Active vendors</span>
            <strong>{activeVendors.length}</strong>
          </div>
        </section>

        {error ? (
          <div className="erp-error" role="alert">
            {error}
          </div>
        ) : null}
        {notice ? (
          <div className="erp-success" role="status">
            {notice}
          </div>
        ) : null}

        <section className="erp-stat-grid" aria-label="Supply chain summary">
          <article>
            <span>Vendors</span>
            <strong>{vendors.length}</strong>
            <small>{activeVendors.length} active</small>
          </article>
          <article>
            <span>Inventory items</span>
            <strong>{items.length}</strong>
            <small>Stocked SKUs</small>
          </article>
          <article>
            <span>Purchase orders</span>
            <strong>{orders.length}</strong>
            <small>All statuses</small>
          </article>
          <article>
            <span>Assets</span>
            <strong>{assets.length}</strong>
            <small>Registered</small>
          </article>
        </section>

        <nav className="founder-tabs" aria-label="Supply chain workspace">
          <button
            type="button"
            className={tab === "vendors" ? "is-active" : ""}
            onClick={() => setTab("vendors")}
          >
            Vendors
          </button>
          <button
            type="button"
            className={tab === "inventory" ? "is-active" : ""}
            onClick={() => setTab("inventory")}
          >
            Inventory
          </button>
          <button
            type="button"
            className={tab === "procurement" ? "is-active" : ""}
            onClick={() => setTab("procurement")}
          >
            Procurement
          </button>
          <button
            type="button"
            className={tab === "assets" ? "is-active" : ""}
            onClick={() => setTab("assets")}
          >
            Assets
          </button>
        </nav>

        {loading ? (
          <div className="erp-state" role="status">
            <span className="erp-loader" aria-hidden="true" />
            <p>Loading supply chain workspace</p>
          </div>
        ) : null}

        {!loading && tab === "vendors" ? (
          <>
            {canManageVendors ? (
              <section className="erp-section">
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">Supplier onboarding</p>
                    <h2>Create vendor</h2>
                  </div>
                </div>
                <form className="founder-form" onSubmit={(event) => void createVendor(event)}>
                  <div className="founder-form-grid">
                    <label>
                      <span>Vendor code</span>
                      <input
                        required
                        value={vendorForm.code}
                        onChange={(event) =>
                          setVendorForm({ ...vendorForm, code: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Name</span>
                      <input
                        required
                        value={vendorForm.name}
                        onChange={(event) =>
                          setVendorForm({ ...vendorForm, name: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Category</span>
                      <select
                        value={vendorForm.category}
                        onChange={(event) =>
                          setVendorForm({ ...vendorForm, category: event.target.value })
                        }
                      >
                        {["GOODS", "SERVICES", "BOTH"].map((item) => (
                          <option key={item} value={item}>
                            {pretty(item)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Contact email</span>
                      <input
                        type="email"
                        value={vendorForm.contactEmail}
                        onChange={(event) =>
                          setVendorForm({ ...vendorForm, contactEmail: event.target.value })
                        }
                      />
                    </label>
                  </div>
                  <button className="erp-button erp-button-primary" disabled={busy}>
                    Create vendor ↗
                  </button>
                </form>
              </section>
            ) : null}
            <section className="erp-section">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Supplier register</p>
                  <h2>Vendors</h2>
                </div>
              </div>
              {vendors.length === 0 ? (
                <div className="erp-empty">
                  <strong>No vendors yet.</strong>
                  <span>Create a vendor to begin procurement.</span>
                </div>
              ) : (
                <div className="erp-notification-list">
                  {vendors.map((item) => (
                    <article className="erp-notification" key={item.id}>
                      <div>
                        <span className="founder-org-code">{item.code}</span>
                        <h3>{item.name}</h3>
                        <p>
                          {pretty(item.category)} · terms {item.paymentTermsDays}d
                        </p>
                      </div>
                      <div className="founder-org-row-actions">
                        <strong className="founder-status">{pretty(item.status)}</strong>
                        {canManageVendors && item.status === "PENDING_APPROVAL" ? (
                          <button
                            type="button"
                            className="erp-text-button"
                            disabled={busy}
                            onClick={() =>
                              void runAction(
                                () => apiFetchV2(`/vendors/${item.id}/approve`, { method: "POST" }),
                                "Vendor approved.",
                              )
                            }
                          >
                            Approve
                          </button>
                        ) : null}
                        {canManageVendors && item.status === "ACTIVE" ? (
                          <button
                            type="button"
                            className="erp-text-button"
                            disabled={busy}
                            onClick={() =>
                              void runAction(
                                () => apiFetchV2(`/vendors/${item.id}/suspend`, { method: "POST" }),
                                "Vendor suspended.",
                              )
                            }
                          >
                            Suspend
                          </button>
                        ) : null}
                        {canManageVendors && item.status === "SUSPENDED" ? (
                          <button
                            type="button"
                            className="erp-text-button"
                            disabled={busy}
                            onClick={() =>
                              void runAction(
                                () =>
                                  apiFetchV2(`/vendors/${item.id}/reinstate`, { method: "POST" }),
                                "Vendor reinstated.",
                              )
                            }
                          >
                            Reinstate
                          </button>
                        ) : null}
                        {canManageVendors && item.status !== "BLACKLISTED" ? (
                          <button
                            type="button"
                            className="erp-text-button"
                            disabled={busy}
                            onClick={() =>
                              void runAction(
                                () =>
                                  apiFetchV2(`/vendors/${item.id}/blacklist`, { method: "POST" }),
                                "Vendor blacklisted.",
                              )
                            }
                          >
                            Blacklist
                          </button>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}

        {!loading && tab === "inventory" ? (
          <>
            {canManageInventory ? (
              <section className="erp-section">
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">Catalogue</p>
                    <h2>Create item</h2>
                  </div>
                </div>
                <form className="founder-form" onSubmit={(event) => void createItem(event)}>
                  <div className="founder-form-grid">
                    <label>
                      <span>SKU</span>
                      <input
                        required
                        value={itemForm.sku}
                        onChange={(event) => setItemForm({ ...itemForm, sku: event.target.value })}
                      />
                    </label>
                    <label>
                      <span>Name</span>
                      <input
                        required
                        value={itemForm.name}
                        onChange={(event) => setItemForm({ ...itemForm, name: event.target.value })}
                      />
                    </label>
                    <label>
                      <span>Category</span>
                      <input
                        required
                        value={itemForm.category}
                        onChange={(event) =>
                          setItemForm({ ...itemForm, category: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Unit cost</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={itemForm.unitCost}
                        onChange={(event) =>
                          setItemForm({ ...itemForm, unitCost: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Reorder level</span>
                      <input
                        type="number"
                        min="0"
                        value={itemForm.reorderLevel}
                        onChange={(event) =>
                          setItemForm({ ...itemForm, reorderLevel: event.target.value })
                        }
                      />
                    </label>
                  </div>
                  <button className="erp-button erp-button-primary" disabled={busy}>
                    Create item ↗
                  </button>
                </form>
              </section>
            ) : null}

            {canManageInventory && items.length > 0 ? (
              <section className="erp-section">
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">Stock ledger</p>
                    <h2>Adjust stock</h2>
                  </div>
                </div>
                <form className="founder-form" onSubmit={(event) => void adjustStock(event)}>
                  <div className="founder-form-grid">
                    <label>
                      <span>Item</span>
                      <select
                        required
                        value={adjust.itemId}
                        onChange={(event) => setAdjust({ ...adjust, itemId: event.target.value })}
                      >
                        <option value="">Select item</option>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.sku} · {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Quantity delta</span>
                      <input
                        required
                        type="number"
                        step="0.001"
                        value={adjust.quantity}
                        onChange={(event) => setAdjust({ ...adjust, quantity: event.target.value })}
                      />
                    </label>
                  </div>
                  <p className="founder-form-note">
                    Positive values add stock; negative values issue stock. Each change writes a
                    movement ledger entry.
                  </p>
                  <button className="erp-button erp-button-primary" disabled={busy}>
                    Adjust stock ↗
                  </button>
                </form>
              </section>
            ) : null}

            <section className="erp-section">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">On hand</p>
                  <h2>Inventory</h2>
                </div>
              </div>
              {items.length === 0 ? (
                <div className="erp-empty">
                  <strong>No items yet.</strong>
                  <span>Create a stock item to track quantity on hand.</span>
                </div>
              ) : (
                <div className="erp-notification-list">
                  {items.map((item) => (
                    <article className="erp-notification" key={item.id}>
                      <div>
                        <span className="founder-org-code">{item.sku}</span>
                        <h3>{item.name}</h3>
                        <p>
                          {item.category} · ₹{money(item.unitCost)}/unit
                        </p>
                      </div>
                      <div className="founder-org-row-actions">
                        <strong className="founder-status">
                          {Number(item.quantityOnHand)} {item.unitOfMeasure}
                        </strong>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}

        {!loading && tab === "procurement" ? (
          <>
            {canManageOrders ? (
              <section className="erp-section">
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">Buying</p>
                    <h2>Create purchase order</h2>
                  </div>
                </div>
                <form className="founder-form" onSubmit={(event) => void createOrder(event)}>
                  <div className="founder-form-grid">
                    <label>
                      <span>PO code</span>
                      <input
                        required
                        value={orderForm.code}
                        onChange={(event) =>
                          setOrderForm({ ...orderForm, code: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Vendor</span>
                      <select
                        required
                        value={orderForm.vendorId}
                        onChange={(event) =>
                          setOrderForm({ ...orderForm, vendorId: event.target.value })
                        }
                      >
                        <option value="">Select active vendor</option>
                        {activeVendors.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.code} · {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Title</span>
                      <input
                        required
                        value={orderForm.title}
                        onChange={(event) =>
                          setOrderForm({ ...orderForm, title: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Order date</span>
                      <input
                        required
                        type="date"
                        value={orderForm.orderDate}
                        onChange={(event) =>
                          setOrderForm({ ...orderForm, orderDate: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Line item</span>
                      <select
                        value={orderForm.itemId}
                        onChange={(event) =>
                          setOrderForm({ ...orderForm, itemId: event.target.value })
                        }
                      >
                        <option value="">Free-text line</option>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.sku} · {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Description</span>
                      <input
                        required
                        value={orderForm.description}
                        onChange={(event) =>
                          setOrderForm({ ...orderForm, description: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Quantity</span>
                      <input
                        required
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={orderForm.quantity}
                        onChange={(event) =>
                          setOrderForm({ ...orderForm, quantity: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Unit cost</span>
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={orderForm.unitCost}
                        onChange={(event) =>
                          setOrderForm({ ...orderForm, unitCost: event.target.value })
                        }
                      />
                    </label>
                  </div>
                  <button className="erp-button erp-button-primary" disabled={busy}>
                    Create purchase order ↗
                  </button>
                </form>
              </section>
            ) : null}
            <section className="erp-section">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Order pipeline</p>
                  <h2>Purchase orders</h2>
                </div>
              </div>
              {orders.length === 0 ? (
                <div className="erp-empty">
                  <strong>No purchase orders yet.</strong>
                  <span>Raise an order against an active vendor.</span>
                </div>
              ) : (
                <div className="erp-notification-list">
                  {orders.map((item) => (
                    <article className="erp-notification" key={item.id}>
                      <div>
                        <span className="founder-org-code">{item.code}</span>
                        <h3>{item.title}</h3>
                        <p>
                          {item.vendor?.name ?? "Vendor"} · {item.currency}{" "}
                          {money(item.totalAmount)}
                        </p>
                      </div>
                      <div className="founder-org-row-actions">
                        <strong className="founder-status">{pretty(item.status)}</strong>
                        {canManageOrders && item.status === "DRAFT" ? (
                          <button
                            type="button"
                            className="erp-text-button"
                            disabled={busy}
                            onClick={() =>
                              void runAction(
                                () =>
                                  apiFetchV2(`/purchase-orders/${item.id}/submit`, {
                                    method: "POST",
                                  }),
                                "Order submitted.",
                              )
                            }
                          >
                            Submit
                          </button>
                        ) : null}
                        {canApproveOrders && item.status === "SUBMITTED" ? (
                          <button
                            type="button"
                            className="erp-text-button"
                            disabled={busy}
                            onClick={() =>
                              void runAction(
                                () =>
                                  apiFetchV2(`/purchase-orders/${item.id}/approve`, {
                                    method: "POST",
                                  }),
                                "Order approved.",
                              )
                            }
                          >
                            Approve
                          </button>
                        ) : null}
                        {canManageOrders && item.status === "APPROVED" ? (
                          <button
                            type="button"
                            className="erp-text-button"
                            disabled={busy}
                            onClick={() =>
                              void runAction(
                                () =>
                                  apiFetchV2(`/purchase-orders/${item.id}/issue`, {
                                    method: "POST",
                                  }),
                                "Order issued.",
                              )
                            }
                          >
                            Issue
                          </button>
                        ) : null}
                        {canManageOrders &&
                        (item.status === "ISSUED" || item.status === "PARTIALLY_RECEIVED") ? (
                          <button
                            type="button"
                            className="erp-text-button"
                            disabled={busy}
                            onClick={() =>
                              void runAction(
                                () =>
                                  apiFetchV2(`/purchase-orders/${item.id}/receive`, {
                                    method: "POST",
                                  }),
                                "Order received into stock.",
                              )
                            }
                          >
                            Receive
                          </button>
                        ) : null}
                        {canManageOrders &&
                        !["RECEIVED", "CLOSED", "CANCELLED"].includes(item.status) ? (
                          <button
                            type="button"
                            className="erp-text-button"
                            disabled={busy}
                            onClick={() =>
                              void runAction(
                                () =>
                                  apiFetchV2(`/purchase-orders/${item.id}/cancel`, {
                                    method: "POST",
                                  }),
                                "Order cancelled.",
                              )
                            }
                          >
                            Cancel
                          </button>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}

        {!loading && tab === "assets" ? (
          <>
            {canManageAssets ? (
              <section className="erp-section">
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">Register</p>
                    <h2>Create asset</h2>
                  </div>
                </div>
                <form className="founder-form" onSubmit={(event) => void createAsset(event)}>
                  <div className="founder-form-grid">
                    <label>
                      <span>Asset tag</span>
                      <input
                        required
                        value={assetForm.assetTag}
                        onChange={(event) =>
                          setAssetForm({ ...assetForm, assetTag: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Name</span>
                      <input
                        required
                        value={assetForm.name}
                        onChange={(event) =>
                          setAssetForm({ ...assetForm, name: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Category</span>
                      <select
                        value={assetForm.category}
                        onChange={(event) =>
                          setAssetForm({ ...assetForm, category: event.target.value })
                        }
                      >
                        {[
                          "IT_EQUIPMENT",
                          "FURNITURE",
                          "VEHICLE",
                          "MACHINERY",
                          "FACILITY",
                          "OTHER",
                        ].map((item) => (
                          <option key={item} value={item}>
                            {pretty(item)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Serial number</span>
                      <input
                        value={assetForm.serialNumber}
                        onChange={(event) =>
                          setAssetForm({ ...assetForm, serialNumber: event.target.value })
                        }
                      />
                    </label>
                  </div>
                  <button className="erp-button erp-button-primary" disabled={busy}>
                    Create asset ↗
                  </button>
                </form>
              </section>
            ) : null}
            <section className="erp-section">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Asset register</p>
                  <h2>Assets</h2>
                </div>
              </div>
              {assets.length === 0 ? (
                <div className="erp-empty">
                  <strong>No assets yet.</strong>
                  <span>Register an asset to manage its lifecycle.</span>
                </div>
              ) : (
                <div className="erp-notification-list">
                  {assets.map((item) => (
                    <article className="erp-notification" key={item.id}>
                      <div>
                        <span className="founder-org-code">{item.assetTag}</span>
                        <h3>{item.name}</h3>
                        <p>
                          {pretty(item.category)}
                          {item.assignedTo
                            ? ` · ${item.assignedTo.firstName} ${item.assignedTo.lastName}`
                            : ""}
                        </p>
                      </div>
                      <div className="founder-org-row-actions">
                        <strong className="founder-status">{pretty(item.status)}</strong>
                        {canManageAssets &&
                        (item.status === "IN_STORE" || item.status === "IN_REPAIR") ? (
                          <form
                            className="founder-inline-form"
                            onSubmit={(event) => {
                              event.preventDefault();
                              const data = new FormData(event.currentTarget);
                              const employeeId = String(data.get("employeeId") ?? "");
                              if (employeeId)
                                void runAction(
                                  () =>
                                    apiFetchV2(`/assets/${item.id}/assign`, {
                                      method: "POST",
                                      body: JSON.stringify({ assignedEmployeeId: employeeId }),
                                    }),
                                  "Asset assigned.",
                                );
                            }}
                          >
                            <select name="employeeId" defaultValue="">
                              <option value="">Assign to…</option>
                              {employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                  {employee.firstName} {employee.lastName}
                                </option>
                              ))}
                            </select>
                            <button type="submit" className="erp-text-button" disabled={busy}>
                              Assign
                            </button>
                          </form>
                        ) : null}
                        {canManageAssets && item.status === "ASSIGNED" ? (
                          <button
                            type="button"
                            className="erp-text-button"
                            disabled={busy}
                            onClick={() =>
                              void runAction(
                                () => apiFetchV2(`/assets/${item.id}/return`, { method: "POST" }),
                                "Asset returned.",
                              )
                            }
                          >
                            Return
                          </button>
                        ) : null}
                        {canManageAssets && item.status !== "RETIRED" ? (
                          <button
                            type="button"
                            className="erp-text-button"
                            disabled={busy}
                            onClick={() =>
                              void runAction(
                                () => apiFetchV2(`/assets/${item.id}/retire`, { method: "POST" }),
                                "Asset retired.",
                              )
                            }
                          >
                            Retire
                          </button>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

export function FounderSupplyChain() {
  return (
    <ProtectedErp requiredSupplyChain>
      <FounderSupplyChainContent />
    </ProtectedErp>
  );
}
