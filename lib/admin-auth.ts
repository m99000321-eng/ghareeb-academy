const encoder = new TextEncoder();
export const ADMIN_COOKIE = "ghareeb_admin";
export const SESSION_HOURS = 12;

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "ghareeb2026";
}

export function isDefaultAdminPassword(): boolean {
  return !process.env.ADMIN_PASSWORD;
}

function sessionSecret(): string {
  return (
    process.env.ADMIN_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "ghareeb-session-dev-secret"
  );
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signAdminToken(): Promise<string> {
  const payload = toBase64Url(
    encoder.encode(
      JSON.stringify({ exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000 }),
    ),
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(),
    encoder.encode(payload),
  );
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifyAdminToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  try {
    const signatureBytes = fromBase64Url(signature);
    const valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(),
      signatureBytes.buffer as ArrayBuffer,
      encoder.encode(payload),
    );
    if (!valid) return false;
    const decoded = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payload)),
    ) as { exp?: number };
    return typeof decoded.exp === "number" && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

export async function passwordMatches(candidate: string): Promise<boolean> {
  const expected = encoder.encode(adminPassword());
  const provided = encoder.encode(candidate);
  const left = await crypto.subtle.digest("SHA-256", expected);
  const right = await crypto.subtle.digest("SHA-256", provided);
  const a = new Uint8Array(left);
  const b = new Uint8Array(right);
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a[index] ^ b[index];
  }
  return diff === 0;
}
