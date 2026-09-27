"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/format";

export type ActionResult = { success: boolean; error?: string };

function parseProductForm(formData: FormData) {
  const images = formData.getAll("images").filter(Boolean) as string[];
  const promoActive = formData.get("promo_active") === "on";
  const promoPriceRaw = formData.get("promo_price");

  return productSchema.safeParse({
    name: formData.get("name"),
    short_description: formData.get("short_description") ?? "",
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    promo_price: promoPriceRaw ? promoPriceRaw : null,
    promo_active: promoActive,
    category_id: formData.get("category_id") || null,
    stock_quantity: formData.get("stock_quantity") || 0,
    is_available: formData.get("is_available") === "on",
    is_published: formData.get("is_published") === "on",
    images,
  });
}

// Garantit un slug unique en suffixant -2, -3... si nécessaire.
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const supabase = await createClient();
  let slug = slugify(base) || `produit-${Date.now()}`;
  let attempt = 1;

  while (true) {
    let query = supabase.from("products").select("id").eq("slug", slug).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query;
    if (!data || data.length === 0) return slug;
    attempt += 1;
    slug = `${slugify(base)}-${attempt}`;
  }
}

export async function createProduct(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const slug = await uniqueSlug(parsed.data.name);

  const { error } = await supabase.from("products").insert({ ...parsed.data, slug });
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/produits");
  revalidatePath("/catalogue");
  revalidatePath("/");
  return { success: true };
}

export async function updateProduct(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const slug = await uniqueSlug(parsed.data.name, id);

  const { error } = await supabase.from("products").update({ ...parsed.data, slug }).eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/produits");
  revalidatePath("/catalogue");
  revalidatePath(`/produit/${slug}`);
  revalidatePath("/");
  return { success: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/produits");
  revalidatePath("/catalogue");
  revalidatePath("/");
  return { success: true };
}

export async function togglePublished(id: string, current: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ is_published: !current }).eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/produits");
  revalidatePath("/catalogue");
  revalidatePath("/");
  return { success: true };
}

export async function toggleAvailability(id: string, current: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ is_available: !current }).eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/produits");
  revalidatePath("/catalogue");
  return { success: true };
}

export async function uploadProductImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Aucun fichier reçu" };
  if (!file.type.startsWith("image/")) return { error: "Le fichier doit être une image" };
  if (file.size > 5 * 1024 * 1024) return { error: "Image trop lourde (max 5 Mo)" };

  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { url: data.publicUrl };
}
