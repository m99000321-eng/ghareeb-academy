import "server-only";
import { getProductOverrides } from "./db";
import { productMap, products, type Product } from "./products";

export async function getCatalog(): Promise<Product[]> {
  const overrides = await getProductOverrides();
  return products
    .map((product) => {
      const override = overrides[product.slug];
      if (!override) return product;
      return {
        ...product,
        price: override.price ?? product.price,
        stock: override.stock ?? product.stock,
        featured: override.featured ?? product.featured,
        active: override.active ?? true,
      };
    })
    .filter((product) => product.active !== false);
}

export async function getCatalogMap(): Promise<Record<string, Product>> {
  const catalog = await getCatalog();
  return Object.fromEntries(catalog.map((product) => [product.slug, product]));
}

export async function getCatalogProduct(
  slug: string,
): Promise<Product | undefined> {
  const catalog = await getCatalogMap();
  return catalog[slug];
}

export async function getAdminCatalog(): Promise<Product[]> {
  const overrides = await getProductOverrides();
  return products.map((product) => {
    const override = overrides[product.slug];
    return {
      ...product,
      price: override?.price ?? product.price,
      stock: override?.stock ?? product.stock,
      featured: override?.featured ?? product.featured,
      active: override?.active ?? true,
    };
  });
}

export function relatedFrom(
  catalog: Product[],
  product: Product,
  limit = 4,
): Product[] {
  return catalog
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, limit);
}

export const baseProductMap = productMap;
