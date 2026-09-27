"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/format";

export type ActionResult = { success: boolean; error?: string };

export async function createCategory(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Nom invalide" };
  }

  const supabase = await createClient();
  const slug = slugify(parsed.data.name);

  const { error } = await supabase.from("categories").insert({ name: parsed.data.name, slug });
  if (error) {
    const message = error.code === "23505" ? "Cette catégorie existe déjà" : error.message;
    return { success: false, error: message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/catalogue");
  revalidatePath("/");
  return { success: true };
}

export async function renameCategory(id: string, name: string): Promise<ActionResult> {
  const parsed = categorySchema.safeParse({ name });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const slug = slugify(parsed.data.name);
  const { error } = await supabase.from("categories").update({ name: parsed.data.name, slug }).eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/catalogue");
  return { success: true };
}

// Une catégorie ne peut être supprimée que si aucun produit ne l'utilise —
// évite de casser des fiches produits existantes.
export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (count && count > 0) {
    return {
      success: false,
      error: `Impossible de supprimer : ${count} produit(s) utilisent encore cette catégorie.`,
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/catalogue");
  return { success: true };
}
