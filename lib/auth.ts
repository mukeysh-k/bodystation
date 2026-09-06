import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export interface AdminSession {
  isLoggedIn: boolean;
  adminId?: string;
  adminEmail?: string;
  adminName?: string;
  adminRole?: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long_12345",
  cookieName: "bodystation_admin",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession(): Promise<IronSession<AdminSession>> {
  const session = await getIronSession<AdminSession>(
    await cookies(),
    sessionOptions
  );
  return session;
}

/**
 * Server-side guard: redirect to /admin/login if not authenticated.
 * Use inside Server Components: const session = await requireAdmin();
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return null; // caller should redirect
  }
  return session;
}

/**
 * API-route guard: returns 401 response if not authenticated.
 */
export async function requireAdminApi(): Promise<
  { ok: true; session: IronSession<AdminSession> } | NextResponse
> {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { ok: true, session };
}
