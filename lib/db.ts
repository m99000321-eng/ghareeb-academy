import { promises as fs } from "fs";
import path from "path";

export type OrderItem = {
  slug: string;
  name: string;
  price: number;
  qty: number;
};

export type OrderRecord = {
  id: string;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    city: string;
    address: string;
    notes: string;
  };
  payment: "cod" | "card";
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: "new";
};

export type ContactRecord = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  subject: string;
  message: string;
};

const dataDir = process.env.VERCEL
  ? "/tmp/ghareeb-data"
  : path.join(process.cwd(), "data");

async function readCollection<T>(file: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(path.join(dataDir, file), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function appendToCollection<T>(file: string, entry: T): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  const list = await readCollection<T>(file);
  list.unshift(entry);
  await fs.writeFile(
    path.join(dataDir, file),
    JSON.stringify(list.slice(0, 500), null, 2),
    "utf8",
  );
}

export function createOrderId(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GH-${stamp}-${rand}`;
}

export async function saveOrder(order: OrderRecord): Promise<void> {
  await appendToCollection("orders.json", order);
}

export async function saveContact(message: ContactRecord): Promise<void> {
  await appendToCollection("messages.json", message);
}

export async function saveSubscriber(email: string): Promise<void> {
  await appendToCollection("subscribers.json", {
    email,
    createdAt: new Date().toISOString(),
  });
}
