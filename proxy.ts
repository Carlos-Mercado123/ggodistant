import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession, SESSION_COOKIE } from "@/lib/session";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await decryptSession(token);

  const isPanelRoute = pathname.startsWith("/panel");
  const isLoginRoute = pathname === "/login";

  if (isPanelRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoginRoute && session) {
    return NextResponse.redirect(new URL("/panel/universidad", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
