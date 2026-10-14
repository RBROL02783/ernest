import { createClient } from "@vercel/kv";
import bcrypt from "bcryptjs";

// Vercel storage integrations can prefix env var names (e.g. ernest_storage_KV_REST_API_URL)
function resolveEnv(suffix: string): string | undefined {
  if (process.env[suffix]) return process.env[suffix];
  const prefixedKey = Object.keys(process.env).find((key) =>
    key.endsWith(`_${suffix}`)
  );
  return prefixedKey ? process.env[prefixedKey] : undefined;
}

const kvUrl = resolveEnv("KV_REST_API_URL");
const kvToken = resolveEnv("KV_REST_API_TOKEN");

if (!kvUrl || !kvToken) {
  throw new Error(
    "Lipsesc variabilele de mediu KV_REST_API_URL / KV_REST_API_TOKEN. Verifică integrarea Storage din Vercel."
  );
}

const kv = createClient({ url: kvUrl, token: kvToken });

export interface StoredUser {
  email: string;
  name: string;
  passwordHash: string;
  createdAt: number;
}

const USERS_KEY = "ernest:users";

export async function getUser(email: string): Promise<StoredUser | null> {
  const user = await kv.hget<StoredUser>(USERS_KEY, email.toLowerCase());
  return user ?? null;
}

export async function createUser(
  email: string,
  password: string,
  name: string
): Promise<StoredUser> {
  const existing = await getUser(email);
  if (existing) {
    throw new Error("Un cont cu acest email există deja.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: StoredUser = {
    email: email.toLowerCase(),
    name,
    passwordHash,
    createdAt: Date.now(),
  };

  await kv.hset(USERS_KEY, { [email.toLowerCase()]: user });
  return user;
}

export async function verifyUser(
  email: string,
  password: string
): Promise<StoredUser | null> {
  const user = await getUser(email);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return user;
}
