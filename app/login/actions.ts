"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSessionCookie } from "@/lib/session";

export type LoginState = { error?: string } | undefined;

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Ingresa usuario y contraseña." };
  }

  const db = getDb();
  const user = db
    .prepare(`SELECT id, username, password_hash FROM users WHERE username = ?`)
    .get(username) as { id: number; username: string; password_hash: string } | undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  await createSessionCookie({ userId: user.id, username: user.username });
  redirect("/panel/universidad");
}
