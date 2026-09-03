import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSessionFromCookies } from "@/lib/session";

export const verifySession = cache(async () => {
  const session = await readSessionFromCookies();
  if (!session) {
    redirect("/login");
  }
  return session;
});

export const getOptionalSession = cache(async () => {
  return readSessionFromCookies();
});
