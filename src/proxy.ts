import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_SESSION_COOKIE } from "@/modules/auth/constants";

export function proxy(request: NextRequest) {
  if (request.cookies.has(AUTH_SESSION_COOKIE)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: "/dashboard/:path*",
};
