// Script de démonstration : crée des catégories et des produits fictifs.
// Usage : npm run seed  (nécessite .env.local avec les clés Supabase)
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis dans .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

const CATEGORIES = ["Éclairage", "Accessoires téléphone", "Chargeurs", "Batteries", "Électronique"];

const PRODUCTS = [
  { name: "Ampoule LED rechargeable", category: "Éclairage", price: 3500, promo: 2900, desc: "Ampoule LED avec batterie de secours, autonomie 4h en cas de coupure." },
  { name: "Mini ventilateur rechargeable", category: "Électronique", price: 10000, promo: null, desc: "Ventilateur portable USB, 3 vitesses, batterie longue durée." },
  { name: "Chargeur rapide 20W", category: "Chargeurs", price: 5000, promo: 3900, desc: "Chargeur secteur charge rapide, compatible USB-C." },
  { name: "Lampe solaire de jardin", category: "Éclairage", price: 4500, promo: null, desc: "Lampe solaire étanche, allumage automatique à la tombée de la nuit." },
  { name: "Power Bank 20000mAh", category: "Batteries", price: 15000, promo: 11900, desc: "Batterie externe haute capacité, charge deux appareils simultanément." },
  { name: "Multiprise électrique parafoudre", category: "Électronique", price: 7500, promo: null, desc: "Multiprise 6 prises avec protection contre les surtensions." },
];

async function main() {
  console.log("Création des catégories...");
  const categoryIds: Record<string, string> = {};

  for (const name of CATEGORIES) {
    const slug = slugify(name);
    const { data, error } = await supabase
      .from("categories")
      .upsert({ name, slug }, { onConflict: "slug" })
      .select("id, name")
      .single();
    if (error) throw error;
    categoryIds[name] = data.id;
  }

  console.log("Création des produits de démonstration...");
  for (const p of PRODUCTS) {
    const slug = slugify(p.name);
    const { error } = await supabase.from("products").upsert(
      {
        name: p.name,
        slug,
        short_description: p.desc,
        description: `${p.desc} Produit de démonstration — à remplacer par vos vrais produits.`,
        price: p.price,
        promo_price: p.promo,
        promo_active: Boolean(p.promo),
        category_id: categoryIds[p.category],
        stock_quantity: 25,
        is_available: true,
        is_published: true,
        is_demo: true,
        images: [],
      },
      { onConflict: "slug" }
    );
    if (error) throw error;
  }

  console.log("Terminé : catégories et produits de démonstration créés.");
  console.log("Rappel : ce sont des données de démonstration (is_demo = true), à supprimer avant la mise en ligne réelle.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
