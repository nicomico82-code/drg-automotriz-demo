import { categories as seedCategories, gallery as seedGallery, products as seedProducts } from "./catalog";
import { publicRemoteEnabled, publicSupabase } from "./supabase";
import type { CategoryId, Product } from "./types";

export type CatalogSnapshot = {
  categories: Array<{ id: "Todos" | CategoryId; label: string }>;
  products: Product[];
  gallery: typeof seedGallery;
};

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function isActiveNow(startsAt: string | null, endsAt: string | null) {
  const now = Date.now();
  const start = startsAt ? Date.parse(`${startsAt}T00:00:00`) : Number.NEGATIVE_INFINITY;
  const end = endsAt ? Date.parse(`${endsAt}T23:59:59`) : Number.POSITIVE_INFINITY;
  return now >= start && now <= end;
}

export async function loadCatalog(): Promise<CatalogSnapshot> {
  if (!publicRemoteEnabled || !publicSupabase) return { categories: seedCategories, products: seedProducts, gallery: seedGallery };

  const [categoryResult, itemResult, offerResult] = await Promise.all([
    publicSupabase.from("categories").select("id,label,active,display_order").eq("active", true).order("display_order", { ascending: true }),
    publicSupabase.from("catalog_items").select("id,kind,name,category_id,description,price_clp,compare_at_price_clp,image_url,gallery_urls,badge,variants,active,featured").eq("active", true).order("updated_at", { ascending: false }),
    publicSupabase.from("offers").select("id,item_id,type,value,starts_at,ends_at,active,badge").eq("active", true),
  ]);

  if (categoryResult.error || itemResult.error || offerResult.error || !itemResult.data?.length) {
    return { categories: seedCategories, products: seedProducts, gallery: seedGallery };
  }

  const categories = [
    { id: "Todos" as const, label: "Todo" },
    ...(categoryResult.data ?? []).map((row) => ({ id: String(row.id), label: String(row.label) })),
  ];
  const offers = (offerResult.data ?? []).filter((offer) => offer.active !== false && isActiveNow(offer.starts_at, offer.ends_at));
  const products = itemResult.data.map((row): Product => {
    const seed = seedProducts.find((item) => item.id === row.id);
    const offer = offers.find((candidate) => candidate.item_id === row.id);
    const basePrice = Number(row.price_clp) || 0;
    const discount = offer ? offer.type === "percentage" ? Math.round(basePrice * (Number(offer.value) / 100)) : Number(offer.value) : 0;
    const priceClp = offer && discount > 0 && discount < basePrice ? Math.max(0, basePrice - discount) : basePrice;
    return {
      id: String(row.id),
      name: String(row.name),
      category: String(row.category_id),
      priceClp,
      compareAtPriceClp: priceClp < basePrice ? basePrice : row.compare_at_price_clp ? Number(row.compare_at_price_clp) : undefined,
      description: String(row.description ?? ""),
      image: String(row.image_url || seed?.image || "/drg/work-01.jpg"),
      gallery: asStringArray(row.gallery_urls),
      badge: priceClp < basePrice ? String(offer?.badge || "Oferta") : row.badge ? String(row.badge) : undefined,
      variants: asStringArray(row.variants).length ? asStringArray(row.variants) : ["Único"],
      kind: row.kind === "service" ? "service" : "product",
      featured: row.featured === true,
    };
  });
  return { categories, products, gallery: seedGallery };
}
