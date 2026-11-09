import { promises as fs } from "fs";
import path from "path";
import { get as blobGet, put as blobPut } from "@vercel/blob";
import type {
  ContactRecord,
  Database,
  OrderRecord,
  OrderStatus,
  PaymentEvent,
  PaymentMethodId,
  ProductOverride,
  StoreSettings,
  SubscriberRecord,
} from "./commerce-types";
import { paymentMethodMap } from "./payments";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  productMap,
} from "./products";

export type {
  ContactRecord,
  Database,
  OrderCustomer,
  OrderItem,
  OrderRecord,
  OrderStatus,
  PaymentEvent,
  PaymentMethodId,
  PaymentStatus,
  ProductOverride,
  StoreSettings,
} from "./commerce-types";

const DB_KEY = "ghareeb:store:v1";
const REPO_DATA_DIR = path.join(process.cwd(), "data");
const WRITE_DIR = process.env.VERCEL
  ? "/tmp/ghareeb-data"
  : REPO_DATA_DIR;
const FILE_PATH = path.join(WRITE_DIR, "db.json");

const REST_URL =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
const REST_TOKEN =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

const useRedis = Boolean(REST_URL && REST_TOKEN);
const useBlob = Boolean(
  process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN,
);

const DEFAULT_SETTINGS: StoreSettings = {
  shippingFee: SHIPPING_FEE,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  codFee: 0,
  whatsapp: "+201000000000",
  supportEmail: "care@ghareeb.store",
  instapayHandle: "ghareeb@instapay",
  bankName: "البنك الأهلي السعودي",
  bankAccount: "SA0380000000608010167519",
  bankHolder: "أكاديمية الغريب للفنون القتالية",
  methods: {
    cod: true,
    card: true,
    mada: true,
    applepay: true,
    stcpay: true,
    wallet: true,
    fawry: true,
    valu: true,
    instapay: true,
    bank: true,
    paypal: true,
  },
};

let cache: Database | null = null;
let cacheAt = 0;
let chain: Promise<unknown> = Promise.resolve();

async function redisCommand(command: unknown[]): Promise<unknown> {
  const response = await fetch(REST_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Redis ${response.status}`);
  }
  const data = (await response.json()) as { result?: unknown };
  return data.result ?? null;
}

async function readLegacy<T>(file: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(path.join(REPO_DATA_DIR, file), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function normalizeLegacyOrder(raw: Record<string, unknown>): OrderRecord | null {
  const id = typeof raw.id === "string" ? raw.id : "";
  const customer = raw.customer as OrderRecord["customer"] | undefined;
  const items = raw.items as OrderRecord["items"] | undefined;
  if (!id || !customer || !Array.isArray(items) || items.length === 0) {
    return null;
  }
  const payment: PaymentMethodId = raw.payment === "card" ? "card" : "cod";
  const subtotal = Number(raw.subtotal) || 0;
  const shipping = Number(raw.shipping) || 0;
  const total = Number(raw.total) || subtotal + shipping;
  return {
    id,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customer,
    payment,
    paymentStatus: payment === "cod" ? "unpaid" : "pending",
    status: "new",
    items,
    subtotal,
    shipping,
    codFee: 0,
    total,
  };
}

async function seedDatabase(): Promise<Database> {
  const legacyOrders = await readLegacy<Record<string, unknown>>("orders.json");
  const messages = await readLegacy<ContactRecord>("messages.json");
  const subscribers = await readLegacy<SubscriberRecord>("subscribers.json");
  return {
    version: 1,
    seededAt: new Date().toISOString(),
    orders: legacyOrders
      .map(normalizeLegacyOrder)
      .filter((order): order is OrderRecord => Boolean(order)),
    payments: [],
    products: {},
    settings: DEFAULT_SETTINGS,
    messages,
    subscribers,
  };
}

async function readRaw(): Promise<Database | null> {
  try {
    if (useBlob) {
      const result = await blobGet(DB_KEY, { access: "private", useCache: false });
      if (!result) return null;
      const parsed = JSON.parse(await new Response(result.stream).text()) as Database;
      return parsed?.version === 1 ? parsed : null;
    }
    if (useRedis) {
      const result = await redisCommand(["GET", DB_KEY]);
      if (typeof result !== "string") return null;
      const parsed = JSON.parse(result) as Database;
      return parsed?.version === 1 ? parsed : null;
    }
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Database;
    return parsed?.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

async function persist(db: Database): Promise<void> {
  const payload = JSON.stringify(db);
  if (useBlob) {
    await blobPut(DB_KEY, payload, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 0,
    });
    return;
  }
  if (useRedis) {
    await redisCommand(["SET", DB_KEY, payload]);
    return;
  }
  await fs.mkdir(WRITE_DIR, { recursive: true });
  await fs.writeFile(FILE_PATH, payload, "utf8");
}

export async function loadDatabase(force = false): Promise<Database> {
  if (!force && cache && Date.now() - cacheAt < 2500) {
    return cache;
  }
  let db = await readRaw();
  if (!db) {
    db = await seedDatabase();
    await persist(db);
  }
  if (!db.settings?.methods) {
    db.settings = { ...DEFAULT_SETTINGS, ...db.settings };
  }
  cache = db;
  cacheAt = Date.now();
  return db;
}

export async function mutateDatabase<T>(
  fn: (db: Database) => T | Promise<T>,
): Promise<T> {
  const run = chain.then(async () => {
    const db = await loadDatabase(true);
    const result = await fn(db);
    await persist(db);
    cache = db;
    cacheAt = Date.now();
    return result;
  });
  chain = run.catch(() => undefined);
  return run;
}

export function storageInfo(): {
  durable: boolean;
  driver: "blob" | "redis" | "file" | "ephemeral";
  label: string;
} {
  if (useBlob) {
    return {
      durable: true,
      driver: "blob",
      label: "Vercel Blob — تخزين دائم",
    };
  }
  if (useRedis) {
    return {
      durable: true,
      driver: "redis",
      label: "Upstash Redis — تخزين دائم",
    };
  }
  if (process.env.VERCEL) {
    return {
      durable: false,
      driver: "ephemeral",
      label: "تخزين مؤقت على Vercel — اربط Upstash KV لبيانات دائمة",
    };
  }
  return { durable: true, driver: "file", label: "ملفات محلية (data/db.json)" };
}

export function createOrderId(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `GH-${stamp}-${rand}`;
}

export function createEventId(): string {
  return `PE-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

/* --------------------------------- orders -------------------------------- */

export async function getOrders(): Promise<OrderRecord[]> {
  const db = await loadDatabase();
  return [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrder(id: string): Promise<OrderRecord | undefined> {
  const db = await loadDatabase();
  return db.orders.find((order) => order.id === id);
}

export async function createOrder(
  order: OrderRecord,
  event?: Omit<PaymentEvent, "id" | "orderId" | "createdAt">,
): Promise<OrderRecord> {
  return mutateDatabase((db) => {
    db.orders.unshift(order);
    db.payments.unshift({
      id: createEventId(),
      orderId: order.id,
      createdAt: new Date().toISOString(),
      method: order.payment,
      type: "created",
      status: order.paymentStatus,
      amount: order.total,
      note: "تم إنشاء الطلب",
    });
    if (event) {
      db.payments.unshift({
        ...event,
        id: createEventId(),
        orderId: order.id,
        createdAt: new Date().toISOString(),
      });
    }
    return order;
  });
}

export async function reserveStock(
  lines: Array<{ slug: string; qty: number }>,
): Promise<void> {
  await mutateDatabase((db) => {
    for (const line of lines) {
      const base = productMap[line.slug];
      if (!base) continue;
      const override = db.products[line.slug] ?? {};
      const current = override.stock ?? base.stock;
      db.products[line.slug] = {
        ...override,
        stock: Math.max(0, current - line.qty),
      };
    }
  });
}

async function restock(db: Database, order: OrderRecord): Promise<void> {
  if (order.restocked) return;
  for (const item of order.items) {
    const base = productMap[item.slug];
    if (!base) continue;
    const override = db.products[item.slug] ?? {};
    const current = override.stock ?? base.stock;
    db.products[item.slug] = { ...override, stock: current + item.qty };
  }
  order.restocked = true;
}

export async function updateOrder(
  id: string,
  patch: Partial<
    Pick<
      OrderRecord,
      "status" | "paymentStatus" | "tracking" | "adminNotes" | "transferRef"
    >
  >,
): Promise<OrderRecord | null> {
  return mutateDatabase((db) => {
    const order = db.orders.find((item) => item.id === id);
    if (!order) return null;
    const wasCancelled = order.status === "cancelled" || order.status === "returned";
    Object.assign(order, patch, { updatedAt: new Date().toISOString() });
    if (
      !wasCancelled &&
      (order.status === "cancelled" || order.status === "returned")
    ) {
      void restock(db, order);
    }
    return order;
  });
}

export async function addPaymentEvent(
  event: Omit<PaymentEvent, "id" | "createdAt"> & { createdAt?: string },
): Promise<PaymentEvent> {
  return mutateDatabase((db) => {
    const record: PaymentEvent = {
      ...event,
      id: createEventId(),
      createdAt: event.createdAt ?? new Date().toISOString(),
    };
    db.payments.unshift(record);
    const order = db.orders.find((item) => item.id === event.orderId);
    if (order) {
      order.updatedAt = record.createdAt;
    }
    return record;
  });
}

export async function getPaymentEvents(orderId?: string): Promise<PaymentEvent[]> {
  const db = await loadDatabase();
  const list = orderId
    ? db.payments.filter((event) => event.orderId === orderId)
    : db.payments;
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* ------------------------------- products -------------------------------- */

export async function getProductOverrides(): Promise<
  Record<string, ProductOverride>
> {
  const db = await loadDatabase();
  return db.products;
}

export async function updateProductOverride(
  slug: string,
  patch: ProductOverride,
): Promise<ProductOverride | null> {
  return mutateDatabase((db) => {
    if (!productMap[slug]) return null;
    const next: ProductOverride = { ...db.products[slug] };
    if (typeof patch.price === "number") {
      next.price = Math.max(1, Math.round(patch.price));
    }
    if (typeof patch.stock === "number") {
      next.stock = Math.max(0, Math.round(patch.stock));
    }
    if (typeof patch.active === "boolean") next.active = patch.active;
    if (typeof patch.featured === "boolean") next.featured = patch.featured;
    db.products[slug] = next;
    return next;
  });
}

/* -------------------------------- content -------------------------------- */

export async function saveContact(message: ContactRecord): Promise<void> {
  await mutateDatabase((db) => {
    db.messages.unshift(message);
    db.messages = db.messages.slice(0, 500);
  });
}

export async function getMessages(): Promise<ContactRecord[]> {
  const db = await loadDatabase();
  return [...db.messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveSubscriber(email: string): Promise<void> {
  await mutateDatabase((db) => {
    if (db.subscribers.some((item) => item.email === email)) return;
    db.subscribers.unshift({ email, createdAt: new Date().toISOString() });
    db.subscribers = db.subscribers.slice(0, 1000);
  });
}

export async function getSubscribers(): Promise<SubscriberRecord[]> {
  const db = await loadDatabase();
  return [...db.subscribers].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* -------------------------------- settings ------------------------------- */

export async function getSettings(): Promise<StoreSettings> {
  const db = await loadDatabase();
  return db.settings;
}

export async function updateSettings(
  patch: Partial<StoreSettings>,
): Promise<StoreSettings> {
  return mutateDatabase((db) => {
    const merged: StoreSettings = {
      ...db.settings,
      ...patch,
      methods: {
        ...db.settings.methods,
        ...(patch.methods ?? {}),
      },
    };
    merged.shippingFee = clampInt(merged.shippingFee, 0, 500);
    merged.freeShippingThreshold = clampInt(merged.freeShippingThreshold, 0, 100000);
    merged.codFee = clampInt(merged.codFee, 0, 500);
    db.settings = merged;
    return merged;
  });
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function isPaymentEnabled(
  settings: StoreSettings,
  id: PaymentMethodId,
): boolean {
  return Boolean(paymentMethodMap[id]) && settings.methods[id] !== false;
}

export async function clearDemoOrders(): Promise<number> {
  return mutateDatabase((db) => {
    const before = db.orders.length;
    const demoIds = new Set(
      db.orders.filter((order) => order.customer.notes?.includes("[DEMO]")).map((o) => o.id),
    );
    db.orders = db.orders.filter((order) => !demoIds.has(order.id));
    db.payments = db.payments.filter((event) => !demoIds.has(event.orderId));
    return before - db.orders.length;
  });
}

export function orderTimeline(status: OrderStatus): OrderStatus[] {
  const base: OrderStatus[] = ["new", "confirmed", "packed", "shipped", "delivered"];
  if (status === "pending_payment") return ["pending_payment", ...base];
  return base;
}
