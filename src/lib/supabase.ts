import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// For use in client components or client-side logic
export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required for browser client"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// For use in Server Components and Server Actions to manage user sessions
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required for server client"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: object) {
        try {
          cookieStore.set(name, value, options);
        } catch (error) {
          // The `cookies()` may not be available in all environments, e.g. Next.js Edge Runtime.
          console.warn('Could not set cookie in server environment:', error);
        }
      },
      remove(name: string, options: object) {
        try {
          cookieStore.set(name, '', options);
        } catch (error) {
          console.warn('Could not remove cookie in server environment:', error);
        }
      },
    },
  });
}

// For actions directly interacting with Supabase with service role key (higher privileges)
// This client should NOT be exposed to the browser.
export function createSupabaseServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for service role client"
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}
