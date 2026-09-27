import Link from "next/link";
import { ArrowRight, Truck, ShieldCheck, MessageCircle, Zap } from "lucide-react";
import { ProductGrid } from "@/components/product-grid";
import { getCategories, getFeaturedProducts, getPromoProducts, getStoreSettings } from "@/lib/queries";
import { buildWhatsAppGenericUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/config";

export default async function HomePage() {
  const [settings, categories, newProducts, promoProducts] = await Promise.all([
    getStoreSettings(),
    getCategories(),
    getFeaturedProducts(8),
    getPromoProducts(8),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-sm font-medium text-accent-foreground">
              <Zap className="h-4 w-4 text-accent" /> Livraison rapide à Lomé et partout au Togo
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
              {settings.store_name}
            </h1>
            <p className="max-w-md text-base text-ink-muted">
              {settings.description || siteConfig.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/catalogue"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 font-semibold text-white hover:bg-primary-hover"
              >
                Voir nos produits <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={buildWhatsAppGenericUrl(settings.whatsapp_number)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-success px-6 font-semibold text-white hover:brightness-95"
              >
                <MessageCircle className="h-4 w-4" /> Commander sur WhatsApp
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {newProducts.slice(0, 4).map((p) => (
              <div key={p.id} className="aspect-square rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </section>

      {/* Catégories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="mb-5 font-display text-2xl font-semibold">Catégories</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/catalogue?categorie=${category.slug}`}
                className="shrink-0 rounded-xl border border-border bg-surface px-5 py-4 text-sm font-medium hover:border-primary hover:text-primary"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Promotions */}
      {promoProducts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold">Promotions</h2>
            <Link href="/catalogue" className="text-sm font-medium text-primary hover:underline">
              Voir tout
            </Link>
          </div>
          <ProductGrid products={promoProducts} />
        </section>
      )}

      {/* Nouveaux produits */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Nouveaux produits</h2>
          <Link href="/catalogue" className="text-sm font-medium text-primary hover:underline">
            Voir tout
          </Link>
        </div>
        <ProductGrid products={newProducts} />
      </section>

      {/* Avantages */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-3">
          {[
            { icon: Zap, title: "Produits de qualité", text: "Une sélection rigoureuse de produits électriques et électroniques." },
            { icon: Truck, title: "Livraison rapide", text: "Livraison organisée directement avec le vendeur, sans attente." },
            { icon: ShieldCheck, title: "Commande simple", text: "Discutez directement avec nous sur WhatsApp, sans formulaire compliqué." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-base font-semibold">{title}</h3>
              <p className="text-sm text-ink-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-semibold">Une question sur un produit ?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
          Écrivez-nous directement sur WhatsApp, nous répondons rapidement.
        </p>
        <div className="mt-6 flex justify-center">
          <a
            href={buildWhatsAppGenericUrl(settings.whatsapp_number)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 items-center gap-2 rounded-lg bg-success px-8 text-base font-semibold text-white hover:brightness-95"
          >
            <MessageCircle className="h-6 w-6" /> Commander sur WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
