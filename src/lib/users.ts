import { kv } from "@vercel/kv";
import bcrypt from "bcryptjs";

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
