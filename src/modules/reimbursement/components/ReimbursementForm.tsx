"use client";

import { Plus, PaperPlaneTilt, Trash, FloppyDisk } from "@phosphor-icons/react";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createAndSubmitAction,
  createDraftAction,
  updateAndSubmitAction,
  updateDraftAction,
} from "@/modules/reimbursement/actions/reimbursement.actions";
import type { ReimbursementFormState } from "@/modules/reimbursement/types";

interface CategoryOption {
  id: string;
  name: string;
}

interface FormItem {
  key: string;
  categoryId: string;
  description: string;
  amount: string;
}

interface ReimbursementFormProps {
  categories: CategoryOption[];
  initialDescription?: string | null;
  initialItems?: Array<{
    categoryId: string;
    description: string;
    amount: string;
  }>;
  mode: "create" | "edit";
  readOnly?: boolean;
  reimbursementId?: string;
  submitLabel?: string;
}

const initialState: ReimbursementFormState = {
  success: false,
};

function createEmptyItem(): FormItem {
  return {
    key: crypto.randomUUID(),
    categoryId: "",
    description: "",
    amount: "",
  };
}

function createInitialItems(
  initialItems: ReimbursementFormProps["initialItems"],
) {
  if (!initialItems || initialItems.length === 0) {
    return [createEmptyItem()];
  }

  return initialItems.map((item) => ({
    key: crypto.randomUUID(),
    ...item,
  }));
}

export function ReimbursementForm({
  categories,
  initialDescription,
  initialItems,
  mode,
  readOnly = false,
  reimbursementId,
  submitLabel = "Submit",
}: ReimbursementFormProps) {
  const [items, setItems] = useState<FormItem[]>(() =>
    createInitialItems(initialItems),
  );
  const [saveState, saveAction, isSaving] = useActionState(
    mode === "create" ? createDraftAction : updateDraftAction,
    initialState,
  );
  const [submitState, submitAction, isSubmitting] = useActionState(
    mode === "create" ? createAndSubmitAction : updateAndSubmitAction,
    initialState,
  );
  const actionMessage = saveState.message ?? submitState.message;

  function updateItem(index: number, values: Partial<FormItem>) {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...values } : item,
      ),
    );
  }

  function removeItem(index: number) {
    setItems((currentItems) => {
      if (currentItems.length === 1) {
        return currentItems;
      }

      return currentItems.filter((_item, itemIndex) => itemIndex !== index);
    });
  }

  return (
    <form className="flex flex-col gap-5">
      {reimbursementId ? (
        <input name="id" type="hidden" value={reimbursementId} />
      ) : null}

      {actionMessage ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionMessage}
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="description">Request Description</Label>
        <Textarea
          defaultValue={initialDescription ?? ""}
          disabled={readOnly}
          id="description"
          name="description"
          placeholder="Business trip reimbursement, client meeting, or other claim context"
        />
      </div>

      <div className="overflow-hidden rounded-md border">
        <div className="grid gap-3 border-b bg-muted/40 px-4 py-3 text-sm font-medium md:grid-cols-[1fr_1.4fr_160px_44px]">
          <span>Category</span>
          <span>Description</span>
          <span>Amount</span>
          <span className="sr-only">Action</span>
        </div>

        <div className="divide-y">
          {items.map((item, index) => (
            <div
              className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_1.4fr_160px_44px]"
              key={item.key}
            >
              <Select
                aria-label="Category"
                disabled={readOnly}
                name="categoryId"
                onChange={(event) =>
                  updateItem(index, { categoryId: event.target.value })
                }
                required
                value={item.categoryId}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>

              <Input
                aria-label="Item description"
                disabled={readOnly}
                name="itemDescription"
                onChange={(event) =>
                  updateItem(index, { description: event.target.value })
                }
                placeholder="Receipt or expense description"
                required
                value={item.description}
              />

              <Input
                aria-label="Amount"
                disabled={readOnly}
                inputMode="decimal"
                min="1"
                name="amount"
                onChange={(event) =>
                  updateItem(index, { amount: event.target.value })
                }
                placeholder="0"
                required
                step="0.01"
                type="number"
                value={item.amount}
              />

              <Button
                aria-label="Remove item"
                className="size-10 px-0"
                disabled={readOnly || items.length === 1}
                onClick={() => removeItem(index)}
                type="button"
                variant="outline"
              >
                <Trash className="size-4" weight="bold" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {!readOnly ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            className="sm:w-auto"
            onClick={() => setItems((currentItems) => [...currentItems, createEmptyItem()])}
            type="button"
            variant="outline"
          >
            <Plus className="size-4" weight="bold" />
            Add Item
          </Button>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              disabled={isSaving || isSubmitting}
              formAction={saveAction}
              type="submit"
              variant="outline"
            >
              <FloppyDisk className="size-4" weight="bold" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              disabled={isSaving || isSubmitting}
              formAction={submitAction}
              type="submit"
            >
              <PaperPlaneTilt className="size-4" weight="bold" />
              {isSubmitting ? "Submitting..." : submitLabel}
            </Button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
