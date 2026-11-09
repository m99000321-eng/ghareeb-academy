"use client";

import { useEffect, useState } from "react";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  productMap as staticProductMap,
  type Product,
} from "./products";

export type PublicStoreSettings = {
  shippingFee: number;
  freeShippingThreshold: number;
  codFee: number;
};

export function useCatalog(): Record<string, Product> {
  const [catalog, setCatalog] =
    useState<Record<string, Product>>(staticProductMap);

  useEffect(() => {
    let active = true;
    fetch("/api/products")
      .then((response) => response.json())
      .then((data: { products?: Product[] }) => {
        if (!active || !Array.isArray(data.products)) return;
        setCatalog(
          Object.fromEntries(
            data.products.map((product) => [product.slug, product]),
          ),
        );
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return catalog;
}

export function useStoreSettings(): PublicStoreSettings {
  const [settings, setSettings] = useState<PublicStoreSettings>({
    shippingFee: SHIPPING_FEE,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    codFee: 0,
  });

  useEffect(() => {
    let active = true;
    fetch("/api/settings")
      .then((response) => response.json())
      .then((data: { settings?: PublicStoreSettings }) => {
        if (!active || !data.settings) return;
        setSettings(data.settings);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return settings;
}
