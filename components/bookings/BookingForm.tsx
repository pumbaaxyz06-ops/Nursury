"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useLang } from "@/lib/LanguageContext";
import { toast } from "sonner";
import {
  Search,
  X,
  Package,
  ChevronDown,
  ChevronUp,
  Check,
  Calendar,
  User,
  Phone,
  Layers,
  Tag,
  Plus,
  Trash2,
} from "lucide-react";

interface CategoryOption {
  _id: string;
  name: { en: string; gu: string };
  emoji?: string;
  image?: string;
}

interface ItemSelection {
  stock_item_id: string;
  name: string;
  quantity: number;
  unit: string;
  price_per_unit: number; // Owner negotiated custom price
  total: number;
  max_qty: number;
  category_id?: string;
  category_name?: string;
}

interface CategoryBlock {
  id: string;
  category_id: string;
  selectedItems: ItemSelection[];
  varietySearch: string;
  showVarietyDropdown: boolean;
}

interface Props {
  initialData?: any;
  onSaved: () => void;
}

export default function BookingForm({ initialData, onSaved }: Props) {
  const { t, lang } = useLang();
  const isEdit = Boolean(initialData?._id);

  const [customerName, setCustomerName] = useState(initialData?.customer_name || "");
  const [customerPhone, setCustomerPhone] = useState(initialData?.customer_phone || "");
  const [customerAddress, setCustomerAddress] = useState(initialData?.customer_address || "");
  const [advance, setAdvance] = useState(initialData?.advance_paid ?? 0);
  const [expected, setExpected] = useState(
    initialData?.expected_dispatch_date ? String(initialData.expected_dispatch_date).slice(0, 10) : ""
  );

  // Loaded database lists
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Category Blocks state
  const [blocks, setBlocks] = useState<CategoryBlock[]>([
    {
      id: "block-1",
      category_id: "",
      selectedItems: [],
      varietySearch: "",
      showVarietyDropdown: false,
    },
  ]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      const [catRes, stockRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/stock"),
      ]);
      const catData = catRes.ok ? await catRes.json() : [];
      const stockData = stockRes.ok ? await stockRes.json() : [];

      const catList = Array.isArray(catData) ? catData : [];
      const stockList = Array.isArray(stockData) ? stockData : [];

      setCategories(catList);
      setStock(stockList);

      // If initialData exists (edit mode), build category blocks from initialData.items
      if (initialData?.items && Array.isArray(initialData.items) && initialData.items.length > 0) {
        const groupedMap = new Map<string, ItemSelection[]>();

        initialData.items.forEach((it: any) => {
          // Find stock item in stock list to get category_id and max_qty
          const foundStock = stockList.find((s) => s._id === it.stock_item_id);
          const catId =
            (foundStock?.category_id && typeof foundStock.category_id === "object"
              ? foundStock.category_id?._id
              : foundStock?.category_id) || "";

          const catObj = catList.find((c) => c._id === catId);
          const category_name = catObj
            ? lang === "gu"
              ? catObj.name.gu
              : catObj.name.en
            : "";

          const formattedItem: ItemSelection = {
            stock_item_id: it.stock_item_id,
            name: it.name,
            quantity: Number(it.quantity) || 1,
            unit: it.unit || "piece",
            price_per_unit: Number(it.price_per_unit) || 0,
            total: (Number(it.quantity) || 1) * (Number(it.price_per_unit) || 0),
            max_qty: foundStock?.quantity || 99999,
            category_id: catId,
            category_name,
          };

          const key = catId || "unassigned";
          if (!groupedMap.has(key)) {
            groupedMap.set(key, []);
          }
          groupedMap.get(key)!.push(formattedItem);
        });

        const newBlocks: CategoryBlock[] = [];
        let index = 1;
        groupedMap.forEach((items, catId) => {
          newBlocks.push({
            id: `block-${index++}`,
            category_id: catId === "unassigned" ? "" : catId,
            selectedItems: items,
            varietySearch: "",
            showVarietyDropdown: false,
          });
        });

        if (newBlocks.length > 0) {
          setBlocks(newBlocks);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Add a new Category Block
  function addCategoryBlock() {
    setBlocks((prev) => [
      ...prev,
      {
        id: `block-${Date.now()}`,
        category_id: "",
        selectedItems: [],
        varietySearch: "",
        showVarietyDropdown: false,
      },
    ]);
  }

  // Remove a Category Block
  function removeCategoryBlock(blockId: string) {
    if (blocks.length <= 1) return;
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  }

  // Update Category for a Block
  function updateBlockCategory(blockId: string, categoryId: string) {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === blockId) {
          return {
            ...b,
            category_id: categoryId,
            selectedItems: [], // reset selected items when category changes
            varietySearch: "",
            showVarietyDropdown: true,
          };
        }
        return b;
      })
    );
  }

  // Toggle Variety Checkbox inside a Category Block
  function toggleVarietyInBlock(blockId: string, s: any) {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;

        const existingIndex = b.selectedItems.findIndex((i) => i.stock_item_id === s._id);
        let updatedItems = [...b.selectedItems];

        if (existingIndex > -1) {
          updatedItems = updatedItems.filter((_, idx) => idx !== existingIndex);
        } else {
          if (s.quantity <= 0) {
            toast.error("Variety currently out of stock");
            return b;
          }

          const initialPrice = Number(s.price_per_unit) || 0;
          const catObj = categories.find((c) => c._id === b.category_id);

          updatedItems.push({
            stock_item_id: s._id,
            name: lang === "gu" ? s.name.gu : s.name.en,
            quantity: 1,
            unit: s.unit || "piece",
            price_per_unit: initialPrice, // Market default, editable by owner
            total: initialPrice,
            max_qty: s.quantity,
            category_id: b.category_id,
            category_name: catObj ? (lang === "gu" ? catObj.name.gu : catObj.name.en) : "",
          });
        }

        return { ...b, selectedItems: updatedItems };
      })
    );
  }

  // Update Item Quantity inside a Block
  function updateItemQtyInBlock(blockId: string, itemId: string, qtyVal: any) {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const qty = Math.max(1, Number(qtyVal) || 1);
        const updated = b.selectedItems.map((it) => {
          if (it.stock_item_id === itemId) {
            return { ...it, quantity: qty, total: qty * it.price_per_unit };
          }
          return it;
        });
        return { ...b, selectedItems: updated };
      })
    );
  }

  // Update Negotiated Unit Price inside a Block
  function updateItemPriceInBlock(blockId: string, itemId: string, priceVal: any) {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const price = Math.max(0, Number(priceVal) || 0);
        const updated = b.selectedItems.map((it) => {
          if (it.stock_item_id === itemId) {
            return { ...it, price_per_unit: price, total: it.quantity * price };
          }
          return it;
        });
        return { ...b, selectedItems: updated };
      })
    );
  }

  // Remove Item from a Block
  function removeItemFromBlock(blockId: string, itemId: string) {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        return {
          ...b,
          selectedItems: b.selectedItems.filter((it) => it.stock_item_id !== itemId),
        };
      })
    );
  }

  // Combine all items across all category blocks
  const allSelectedItems = useMemo(() => {
    return blocks.flatMap((b) => b.selectedItems);
  }, [blocks]);

  const subtotal = useMemo(() => {
    return allSelectedItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  }, [allSelectedItems]);

  const balance = Math.max(0, subtotal - (Number(advance) || 0));

  async function save() {
    if (!customerName || allSelectedItems.length === 0) {
      return toast.error("Customer name and at least one plant variety are required");
    }

    if (!customerPhone || customerPhone.length < 10) {
      return toast.error("Please enter a valid 10-digit customer phone number");
    }

    setLoading(true);
    try {
      const payload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        items: allSelectedItems.map(({ max_qty, category_name, ...rest }) => rest),
        subtotal,
        advance_paid: Number(advance) || 0,
        balance_due: balance,
        expected_dispatch_date: expected || undefined,
      };

      const url = isEdit ? `/api/bookings/${initialData._id}` : "/api/bookings";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isEdit ? "Booking updated successfully!" : t("booking_saved"));
        onSaved();
      } else {
        toast.error(isEdit ? "Failed to update booking" : "Failed to save booking");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error saving booking order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-5 sm:p-6 space-y-6 max-w-2xl mx-auto bg-white rounded-3xl border border-neutral-200/80 shadow-premium-md relative overflow-hidden text-left">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#306D29] to-[#4CAF50]"></div>

      {/* Customer Info Section */}
      <div className="space-y-4">
        <div className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-2 flex items-center gap-2">
          <User size={18} className="text-[#306D29]" />
          <span>Customer & Delivery Info</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="premium-label">Customer Name *</label>
            <input
              className="premium-input"
              placeholder="e.g. Ramesh Bhai"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="premium-label">Customer Phone *</label>
            <input
              className="premium-input"
              placeholder="10 digit phone number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="premium-label">Delivery Address / Location</label>
          <input
            className="premium-input"
            placeholder="e.g. Village Anand, Site 2"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
          />
        </div>
      </div>

      {/* Category Blocks Section */}
      <div className="space-y-5 pt-2 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Layers size={18} className="text-[#306D29]" />
            <span>Order Category Blocks ({blocks.length})</span>
          </div>
          <span className="text-xs text-neutral-500">
            {allSelectedItems.length} total variety item(s) chosen
          </span>
        </div>

        {/* Render Category Blocks */}
        {blocks.map((block, blockIndex) => {
          const selectedCatObj = categories.find((c) => c._id === block.category_id);

          // Varieties in stock under this block's selected category
          const varietiesInCat = stock.filter((s) => {
            if (!block.category_id) return false;
            const catId = typeof s.category_id === "object" ? s.category_id?._id : s.category_id;
            return catId === block.category_id;
          });

          // Search filter for varieties inside this block
          const filteredVarieties = varietiesInCat.filter((s) => {
            const q = block.varietySearch.trim().toLowerCase();
            if (!q) return true;
            const gu = (s.name?.gu || "").toLowerCase();
            const en = (s.name?.en || "").toLowerCase();
            return gu.includes(q) || en.includes(q);
          });

          return (
            <div
              key={block.id}
              className="bg-neutral-50/70 border border-neutral-200 p-4 sm:p-5 rounded-2xl space-y-4 relative shadow-premium-sm"
            >
              {/* Block Header */}
              <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-neutral-900">
                  <span className="w-6 h-6 rounded-full bg-[#306D29] text-white flex items-center justify-center text-xs">
                    {blockIndex + 1}
                  </span>
                  <span>
                    {selectedCatObj
                      ? `${selectedCatObj.emoji || "🌱"} ${
                          lang === "gu" ? selectedCatObj.name.gu : selectedCatObj.name.en
                        } Block`
                      : `Category Block #${blockIndex + 1}`}
                  </span>
                </div>

                {blocks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCategoryBlock(block.id)}
                    className="p-1.5 rounded-lg text-danger hover:bg-red-50 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                    title="Remove Category Block"
                  >
                    <Trash2 size={14} /> Remove Block
                  </button>
                )}
              </div>

              {/* Single Select Category Dropdown for this Block */}
              <div>
                <label className="premium-label">Select Plant Category *</label>
                <div className="relative">
                  <select
                    className="premium-input appearance-none cursor-pointer font-medium"
                    value={block.category_id}
                    onChange={(e) => updateBlockCategory(block.id, e.target.value)}
                  >
                    <option value="">-- Select Category (e.g. Tomatoes, Chilly) --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.emoji || "🌱"} {lang === "gu" ? c.name.gu : c.name.en}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600">
                    ▼
                  </div>
                </div>
              </div>

              {/* Multi-Select Varieties for Selected Category */}
              {block.category_id && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="premium-label mb-0 block flex items-center gap-1">
                      <Tag size={14} className="text-[#306D29]" />
                      <span>Select Varieties for {selectedCatObj ? (lang === "gu" ? selectedCatObj.name.gu : selectedCatObj.name.en) : ""}</span>
                    </label>
                    <span className="text-[11px] font-bold text-[#306D29]">
                      {block.selectedItems.length} selected
                    </span>
                  </div>

                  {/* Variety Search & Multi-Select Dropdown */}
                  <div className="relative flex items-center">
                    <input
                      className="premium-input !pl-10 !pr-16 cursor-pointer text-xs"
                      placeholder="Search plant variety in this category..."
                      value={block.varietySearch}
                      onChange={(e) =>
                        setBlocks((prev) =>
                          prev.map((b) => (b.id === block.id ? { ...b, varietySearch: e.target.value, showVarietyDropdown: true } : b))
                        )
                      }
                      onClick={() =>
                        setBlocks((prev) =>
                          prev.map((b) => (b.id === block.id ? { ...b, showVarietyDropdown: true } : b))
                        )
                      }
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />

                    <button
                      type="button"
                      onClick={() =>
                        setBlocks((prev) =>
                          prev.map((b) =>
                            b.id === block.id ? { ...b, showVarietyDropdown: !b.showVarietyDropdown } : b
                          )
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-600 hover:bg-neutral-200/60 rounded cursor-pointer"
                    >
                      {block.showVarietyDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {/* Variety Selection List with Checkboxes */}
                  {block.showVarietyDropdown && (
                    <div className="border border-neutral-200 bg-white rounded-2xl overflow-hidden shadow-premium-sm text-xs">
                      <div className="max-h-52 overflow-y-auto divide-y divide-neutral-100">
                        {filteredVarieties.length === 0 ? (
                          <div className="px-4 py-5 text-center text-neutral-500">
                            No varieties found in this category.
                          </div>
                        ) : (
                          filteredVarieties.map((s: any) => {
                            const isChecked = block.selectedItems.some((i) => i.stock_item_id === s._id);
                            const isOutOfStock = s.quantity <= 0;

                            return (
                              <div
                                key={s._id}
                                onClick={() => !isOutOfStock && toggleVarietyInBlock(block.id, s)}
                                className={`px-3.5 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                                  isChecked
                                    ? "bg-emerald-50/90 border-l-4 border-[#306D29]"
                                    : isOutOfStock
                                    ? "opacity-50 bg-neutral-100 cursor-not-allowed"
                                    : "hover:bg-emerald-50/40"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                                      isChecked
                                        ? "bg-[#306D29] border-[#306D29] text-white"
                                        : "border-neutral-300 bg-white"
                                    }`}
                                  >
                                    {isChecked && <Check size={12} className="stroke-[3]" />}
                                  </div>
                                  <span className="font-bold text-neutral-900 truncate">
                                    {lang === "gu" ? s.name.gu : s.name.en}
                                  </span>
                                  <span className="text-[10px] text-neutral-500">
                                    (Stock: {s.quantity} {s.unit})
                                  </span>
                                </div>
                                <span className="font-bold text-[#306D29] flex-shrink-0 ml-2">
                                  ₹{s.price_per_unit}/{s.unit}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                      <div className="p-2.5 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center">
                        <span className="text-[11px] text-neutral-500 font-medium">
                          {block.selectedItems.length} variety chosen
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setBlocks((prev) =>
                              prev.map((b) => (b.id === block.id ? { ...b, showVarietyDropdown: false } : b))
                            )
                          }
                          className="btn-premium-primary !h-7 text-[11px] px-3 py-0.5 rounded-lg cursor-pointer"
                        >
                          Done Selection
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Selected Varieties inside this Block with Parallel Quantity & Custom Price Inputs */}
                  {block.selectedItems.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      <div className="text-xs font-bold text-neutral-800">
                        Varieties in Block:
                      </div>

                      {block.selectedItems.map((it) => (
                        <div
                          key={it.stock_item_id}
                          className="bg-white border border-neutral-200/90 p-3 rounded-xl space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between font-bold text-neutral-900">
                            <span>🌱 {it.name}</span>
                            <button
                              type="button"
                              onClick={() => removeItemFromBlock(block.id, it.stock_item_id)}
                              className="text-danger hover:bg-red-50 p-1 rounded font-bold cursor-pointer"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Parallel Quantity & Negotiated Price Input Box */}
                          <div className="grid grid-cols-3 gap-2.5 items-end pt-1">
                            <div>
                              <label className="text-[9px] font-bold text-neutral-500 uppercase block mb-1">
                                Qty ({it.unit})
                              </label>
                              <input
                                type="number"
                                step="any"
                                min={1}
                                className="premium-input !h-9 text-center font-bold !py-1 text-xs"
                                value={it.quantity}
                                onChange={(e) =>
                                  updateItemQtyInBlock(block.id, it.stock_item_id, e.target.value)
                                }
                              />
                            </div>

                            <div>
                              <label className="text-[9px] font-bold text-neutral-500 uppercase block mb-1">
                                Price/Unit (₹)
                              </label>
                              <input
                                type="number"
                                step="any"
                                min={0}
                                className="premium-input !h-9 text-center font-bold text-[#306D29] !py-1 text-xs"
                                value={it.price_per_unit}
                                onChange={(e) =>
                                  updateItemPriceInBlock(block.id, it.stock_item_id, e.target.value)
                                }
                              />
                            </div>

                            <div className="text-right">
                              <div className="text-[9px] font-bold text-neutral-500 uppercase">Total</div>
                              <div className="font-extrabold text-[#306D29] text-sm">₹{it.total}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add More Category Button */}
        <button
          type="button"
          onClick={addCategoryBlock}
          className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-[#306D29]/40 bg-emerald-50/50 hover:bg-emerald-50 text-[#306D29] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-premium-sm"
        >
          <Plus size={16} className="stroke-[3]" /> + Add More Category Block
        </button>
      </div>

      {/* Payment Summary */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl space-y-2.5 text-sm">
        <div className="flex justify-between font-medium">
          <span className="text-neutral-600">Subtotal Order Value</span>
          <span className="font-bold text-neutral-900">₹{subtotal}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-600">Advance Paid (₹)</span>
          <input
            type="number"
            step="any"
            className="premium-input !h-10 !w-28 text-right font-bold text-neutral-900"
            value={advance}
            onChange={(e) => setAdvance(Number(e.target.value))}
          />
        </div>
        <div className="flex justify-between font-bold border-t border-emerald-200 pt-2.5 text-[#306D29] text-base">
          <span>Balance Due</span>
          <span>₹{balance}</span>
        </div>
      </div>

      {/* Expected Dispatch Date */}
      <div>
        <label className="premium-label flex items-center gap-1.5">
          <Calendar size={14} className="text-[#306D29]" /> Expected Dispatch / Delivery Date
        </label>
        <input
          type="date"
          className="premium-input"
          value={expected}
          onChange={(e) => setExpected(e.target.value)}
        />
      </div>

      <button
        onClick={save}
        disabled={loading || !customerName || allSelectedItems.length === 0}
        className="btn-premium-primary w-full mt-4 cursor-pointer disabled:opacity-60"
      >
        {loading
          ? "Saving Booking..."
          : isEdit
          ? "Update Booking Order"
          : "Save Booking Order"}
      </button>
    </div>
  );
}
