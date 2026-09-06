import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, AdminSession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin paths, and allow /admin/login through
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const res = NextResponse.next();
    const session = await getIronSession<AdminSession>(request, res, sessionOptions);

    if (!session.isLoggedIn) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
