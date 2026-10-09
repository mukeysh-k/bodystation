import { createClient } from "@supabase/supabase-js";

// Server-side client (uses service role key — full access, NEVER expose to browser)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    global: {
      // Next.js caches fetch() by default. Admin screens must read the database
      // on every request, or a newly added member stays missing.
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  }
);
