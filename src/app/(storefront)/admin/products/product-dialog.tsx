"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { deleteProductAction, toggleProductActiveAction, upsertProductAction } from "@/lib/actions/admin";
import { slugify } from "@/lib/format";
import { parseDollarsToCents } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/** Serializable product values shared between the server table rows and this dialog. */
export type ProductFormValues = {
  id: string | null;
  name: string;
  slug: string;
  // S81-1: the many-to-many display-category memberships (zero or more).
  categoryIds: string[];
  // S81-1: the reference's template category string ("" = none).
  templateCategory: string;
  shortDescription: string;
  description: string;
  priceDollars: string;
  compareAtDollars: string;
  sku: string;
  stock: string;
  imagesText: string;
  colorsText: string;
  sizesText: string;
  tagsText: string;
  specsText: string;
  badge: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isActive: boolean;
};

export type CategoryOption = { id: string; name: string };

const IMAGE_SUGGESTIONS =
  "/images/product-satin-pillowcase.png, /images/product-silk-bonnet.png, /images/product-heatless-curler.png, /images/product-scalp-massager.png, /images/product-gua-sha.png, /images/product-derma-roller.png, /images/product-spa-socks.png, /images/product-crystal-hair-remover.png";

function emptyProduct(): ProductFormValues {
  return {
    id: null,
    name: "",
    slug: "",
    categoryIds: [],
    templateCategory: "",
    shortDescription: "",
    description: "",
    priceDollars: "",
    compareAtDollars: "",
    sku: "",
    stock: "25",
    imagesText: "",
    colorsText: "",
    sizesText: "",
    tagsText: "",
    specsText: "",
    badge: "",
    isFeatured: false,
    isNewArrival: false,
    isActive: true,
  };
}

// ---------------------------------------------------------------------------
// Add / Edit product dialog
// ---------------------------------------------------------------------------

export function ProductDialogButton({
  categories,
  product,
  label,
}: {
  categories: CategoryOption[];
  product: ProductFormValues | null;
  /** Trigger label for the "add" variant; omit to render a compact edit icon. */
  label?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<ProductFormValues>(product ?? emptyProduct());
  const slugTouched = React.useRef(Boolean(product?.slug));

  function handleOpenChange(next: boolean) {
    if (next) {
      setForm(product ?? emptyProduct());
      slugTouched.current = Boolean(product?.slug);
      setError(null);
    }
    setOpen(next);
  }

  function setField<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const priceCents = parseDollarsToCents(form.priceDollars);
    if (priceCents === null || priceCents <= 0) {
      setError("Enter a valid price in dollars, e.g. 49.99.");
      return;
    }
    let compareAtCents: number | null = null;
    if (form.compareAtDollars.trim() !== "") {
      const parsed = parseDollarsToCents(form.compareAtDollars);
      if (parsed === null || parsed <= 0) {
        setError("Enter a valid compare-at price in dollars (or leave it blank).");
        return;
      }
      compareAtCents = parsed;
    }
    const stockNumber = Number(form.stock);
    if (!Number.isInteger(stockNumber) || stockNumber < 0) {
      setError("Stock must be a whole number of 0 or more.");
      return;
    }
    const images = form.imagesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (images.length === 0) {
      setError("Add at least one image path.");
      return;
    }
    const specs = form.specsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const sep = line.indexOf(":");
        return sep === -1
          ? { label: line, value: "" }
          : { label: line.slice(0, sep).trim(), value: line.slice(sep + 1).trim() };
      })
      .filter((spec) => spec.label !== "" && spec.value !== "");
    const tags = form.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    // S73-12: variant text → structured input. Colors use the
    // "Name:#hex" line format (one per line); sizes are comma-separated.
    const colorOptions = form.colorsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const sep = line.lastIndexOf(":");
        return sep === -1
          ? { name: line, hex: "" }
          : { name: line.slice(0, sep).trim(), hex: line.slice(sep + 1).trim() };
      });
    const sizes = form.sizesText
      .split(",")
      .map((size) => size.trim())
      .filter(Boolean);

    setPending(true);
    try {
      const result = await upsertProductAction({
        id: form.id,
        name: form.name,
        slug: form.slug,
        categoryIds: form.categoryIds,
        // Narrow the free string to the schema's enum ("" and stray values → null).
        templateCategory:
          form.templateCategory === "skincare" ||
          form.templateCategory === "lip_care" ||
          form.templateCategory === "body_care"
            ? form.templateCategory
            : null,
        shortDescription: form.shortDescription,
        description: form.description,
        price: priceCents,
        compareAtPrice: compareAtCents,
        sku: form.sku,
        stock: stockNumber,
        images,
        colorOptions,
        sizes,
        tags,
        specs,
        badge: form.badge.trim() === "" ? null : form.badge.trim(),
        isFeatured: form.isFeatured,
        isNewArrival: form.isNewArrival,
        isActive: form.isActive,
      });
      if (result.ok) {
        toast({ title: form.id ? "Product updated" : "Product created", variant: "success" });
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
        toast({ title: "Could not save product", description: result.error, variant: "destructive" });
      }
    } catch {
      // Session-13 S13-2: the action deliberately rethrows unknown errors (DB
      // outage) — surface them instead of failing silently.
      setError("Something went wrong. Please try again.");
      toast({ title: "Something went wrong", description: "The product did not save. Please try again.", variant: "destructive" });
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {label ? (
        <Button onClick={() => handleOpenChange(true)}>
          <Plus aria-hidden /> {label}
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => handleOpenChange(true)}
          aria-label={`Edit ${product?.name ?? "product"}`}
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </Button>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {form.id ? "Update catalog details for this product." : "Create a new product for the storefront catalog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-name">Name</Label>
              <Input
                id="product-name"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((prev) => ({ ...prev, name, slug: slugTouched.current ? prev.slug : slugify(name) }));
                }}
                placeholder="Pure Satin Silk Pillowcase"
                required
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-slug">Slug</Label>
              <Input
                id="product-slug"
                value={form.slug}
                onChange={(e) => {
                  slugTouched.current = true;
                  setField("slug", e.target.value);
                }}
                placeholder="enameled-cast-iron-dutch-oven"
                required
                maxLength={120}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* S81-1: the display categories are a many-to-many — a
                checkbox GROUP (zero or more; the reference itself ships six
                uncategorized products and one dual member). */}
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Display categories</legend>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => {
                  const checked = form.categoryIds.includes(category.id);
                  return (
                    <label
                      key={category.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setField(
                            "categoryIds",
                            checked
                              ? form.categoryIds.filter((cid) => cid !== category.id)
                              : [...form.categoryIds, category.id],
                          )
                        }
                        aria-label={category.name}
                        className="h-4 w-4 accent-foreground"
                      />
                      {category.name}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <div className="space-y-2">
              <Label htmlFor="product-template-category">Template category</Label>
              <Select
                value={form.templateCategory || undefined}
                onValueChange={(value) => setField("templateCategory", value)}
              >
                <SelectTrigger id="product-template-category" aria-label="Template category">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skincare">Skincare</SelectItem>
                  <SelectItem value="lip_care">Lip care</SelectItem>
                  <SelectItem value="body_care">Body care</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-sku">SKU</Label>
              <Input
                id="product-sku"
                value={form.sku}
                onChange={(e) => setField("sku", e.target.value)}
                placeholder="HN-DUTCH-24"
                required
                maxLength={60}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="product-price">Price ($)</Label>
              <Input
                id="product-price"
                type="text"
                inputMode="decimal"
                value={form.priceDollars}
                onChange={(e) => setField("priceDollars", e.target.value)}
                placeholder="149.99"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-compare-at">Compare-at ($)</Label>
              <Input
                id="product-compare-at"
                type="text"
                inputMode="decimal"
                value={form.compareAtDollars}
                onChange={(e) => setField("compareAtDollars", e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-stock">Stock</Label>
              <Input
                id="product-stock"
                type="number"
                min={0}
                step={1}
                value={form.stock}
                onChange={(e) => setField("stock", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-short">Short description</Label>
            <Input
              id="product-short"
              value={form.shortDescription}
              onChange={(e) => setField("shortDescription", e.target.value)}
              placeholder="One-line summary shown on cards"
              maxLength={300}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Full product description (min 10 characters)"
              className="min-h-[110px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-images">Image paths (one per line)</Label>
            <Textarea
              id="product-images"
              value={form.imagesText}
              onChange={(e) => setField("imagesText", e.target.value)}
              placeholder={"/images/product-satin-pillowcase.png\n/images/product-satin-pillowcase-2.png"}
              className="min-h-[72px] font-mono text-xs"
              required
            />
            <p className="text-xs text-muted-foreground">Suggested paths: {IMAGE_SUGGESTIONS}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-tags">Tags (comma-separated)</Label>
              <Input
                id="product-tags"
                value={form.tagsText}
                onChange={(e) => setField("tagsText", e.target.value)}
                placeholder="skincare, beauty, gift"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-badge">Badge (optional)</Label>
              <Input
                id="product-badge"
                value={form.badge}
                onChange={(e) => setField("badge", e.target.value)}
                placeholder="Featured, Best Seller, …"
                maxLength={40}
              />
            </div>
          </div>

          {/* S73-12: variant editors — the run-72 schema made colors/sizes
              admin-editable; the dialog finally exposes them. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-colors">Colors (one “Name:#hex” per line)</Label>
              <Textarea
                id="product-colors"
                value={form.colorsText}
                onChange={(e) => setField("colorsText", e.target.value)}
                placeholder={"Pink:#CB9D9D\nNavy Blue:#1F2A44\nSky Blue:#A5C8E1"}
                className="min-h-[72px] font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-sizes">Sizes (comma-separated)</Label>
              <Input
                id="product-sizes"
                value={form.sizesText}
                onChange={(e) => setField("sizesText", e.target.value)}
                placeholder="0.5mm, 1.0mm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-specs">Specs (one “Label: Value” per line)</Label>
            <Textarea
              id="product-specs"
              value={form.specsText}
              onChange={(e) => setField("specsText", e.target.value)}
              placeholder={"Capacity: 6 qt\nMaterial: Enameled cast iron"}
              className="min-h-[72px]"
            />
          </div>

          <fieldset className="rounded-xl border border-border p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Visibility &amp; merchandising
            </legend>
            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[hsl(24_70%_50%)]"
                  checked={form.isFeatured}
                  onChange={(e) => setField("isFeatured", e.target.checked)}
                />
                Featured
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[hsl(24_70%_50%)]"
                  checked={form.isNewArrival}
                  onChange={(e) => setField("isNewArrival", e.target.checked)}
                />
                New arrival
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[hsl(24_70%_50%)]"
                  checked={form.isActive}
                  onChange={(e) => setField("isActive", e.target.checked)}
                />
                Active (visible in store)
              </label>
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" aria-hidden />}
              {form.id ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Delete confirmation dialog
// ---------------------------------------------------------------------------

export function ProductDeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function handleDelete() {
    setPending(true);
    try {
      const result = await deleteProductAction(id);
      if (result.ok) {
        toast({ title: "Product deleted", variant: "success" });
        setOpen(false);
        router.refresh();
      } else {
        toast({ title: "Could not delete product", description: result.error, variant: "destructive" });
      }
    } catch {
      // Session-13 S13-2: unknown errors must be visible, never silent.
      toast({ title: "Something went wrong", description: "The product was not deleted. Please try again.", variant: "destructive" });
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
        aria-label={`Delete ${name}`}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{name}</strong>? This cannot be undone. Products that
            have been ordered can only be archived.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={pending}>
            {pending && <Loader2 className="animate-spin" aria-hidden />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Active / archived toggle
// ---------------------------------------------------------------------------

export function ProductToggleActiveButton({
  id,
  name,
  isActive,
}: {
  id: string;
  name: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = React.useState(false);

  async function handleToggle() {
    setPending(true);
    try {
      const result = await toggleProductActiveAction(id, !isActive);
      if (result.ok) {
        toast({
          title: isActive ? "Product archived" : "Product activated",
          description: isActive ? "It is now hidden from the storefront." : "It is now visible in the storefront.",
          variant: "success",
        });
        router.refresh();
      } else {
        toast({ title: "Could not update product", description: result.error, variant: "destructive" });
      }
    } catch {
      // Session-13 S13-2: unknown errors must be visible, never silent.
      toast({ title: "Something went wrong", description: "The product was not updated. Please try again.", variant: "destructive" });
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", isActive ? "text-emerald-600" : "text-muted-foreground")}
      onClick={handleToggle}
      disabled={pending}
      aria-label={isActive ? `Archive ${name}` : `Activate ${name}`}
      title={isActive ? "Active — click to archive" : "Archived — click to activate"}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : isActive ? (
        <Eye className="h-4 w-4" aria-hidden />
      ) : (
        <EyeOff className="h-4 w-4" aria-hidden />
      )}
    </Button>
  );
}
