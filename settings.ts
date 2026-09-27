"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { storeSettingsSchema } from "@/lib/validations";

export type ActionResult = { success: boolean; error?: string };

export async function updateStoreSettings(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = storeSettingsSchema.safeParse({
    store_name: formData.get("store_name"),
    whatsapp_number: formData.get("whatsapp_number"),
    currency: formData.get("currency"),
    description: formData.get("description") ?? "",
    facebook_url: formData.get("facebook_url") ?? "",
    instagram_url: formData.get("instagram_url") ?? "",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("store_settings").update(parsed.data).eq("id", 1);
  if (error) return { success: false, error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}
