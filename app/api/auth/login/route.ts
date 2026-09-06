import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Helper to attempt insert with full fields or fallback to basic fields
    const seedAdminUser = async (userEmail: string, userPass: string) => {
      const hashedPassword = bcrypt.hashSync(userPass, 10);

      // Try full insert first
      let { data, error } = await supabaseAdmin
        .from("admin_users")
        .insert({
          email: userEmail,
          password_hash: hashedPassword,
          name: "Gym Admin",
          role: "admin",
        })
        .select()
        .maybeSingle();

      // If missing columns (PGRST204), fallback to inserting only email & password_hash
      if (error && error.code === "PGRST204") {
        const fallback = await supabaseAdmin
          .from("admin_users")
          .insert({
            email: userEmail,
            password_hash: hashedPassword,
          })
          .select()
          .maybeSingle();
        data = fallback.data;
      }

      return data;
    };

    // Check if any admin users exist in the admin_users table
    const { count: adminCount, error: countErr } = await supabaseAdmin
      .from("admin_users")
      .select("id", { count: "exact", head: true });

    // If no admin user exists in DB yet, auto-seed the default admin user
    if (adminCount === 0 || countErr) {
      const defaultEmail = (process.env.ADMIN_EMAIL || "admin@bodystation.com").toLowerCase();
      const defaultPassword = process.env.ADMIN_PASSWORD || "admin123";
      await seedAdminUser(defaultEmail, defaultPassword);
    }

    // Query admin user by email
    const { data: user, error: userErr } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .ilike("email", cleanEmail)
      .maybeSingle();

    if (userErr || !user) {
      // Fallback check against env variables if migration in progress
      const envEmail = (process.env.ADMIN_EMAIL || "admin@bodystation.com").toLowerCase();
      const envPassword = process.env.ADMIN_PASSWORD || "admin123";

      if (cleanEmail === envEmail && password === envPassword) {
        // Seed this user into DB
        const createdUser = await seedAdminUser(cleanEmail, password);

        const activeUser = createdUser || {
          id: "default-admin",
          email: cleanEmail,
          name: "Gym Admin",
          role: "admin",
        };

        const session = await getSession();
        session.isLoggedIn = true;
        session.adminId = activeUser.id;
        session.adminEmail = activeUser.email;
        session.adminName = activeUser.name || "Gym Admin";
        session.adminRole = activeUser.role || "admin";
        await session.save();

        return NextResponse.json({
          ok: true,
          user: {
            id: activeUser.id,
            email: activeUser.email,
            name: activeUser.name || "Gym Admin",
            role: activeUser.role || "admin",
          },
        });
      }

      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify password against stored bcrypt hash
    let isPasswordValid = false;
    if (user.password_hash.startsWith("$2a$") || user.password_hash.startsWith("$2b$")) {
      isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    } else {
      // Plaintext fallback (if inserted manually without hash) -> auto-hash
      isPasswordValid = password === user.password_hash;
      if (isPasswordValid) {
        const newHash = bcrypt.hashSync(password, 10);
        await supabaseAdmin
          .from("admin_users")
          .update({ password_hash: newHash })
          .eq("id", user.id);
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Set session
    const session = await getSession();
    session.isLoggedIn = true;
    session.adminId = user.id;
    session.adminEmail = user.email;
    session.adminName = user.name || "Gym Admin";
    session.adminRole = user.role || "admin";
    await session.save();

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || "Gym Admin",
        role: user.role || "admin",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
