/**
 * Supabase Module Barrel Export
 *
 * Provides Supabase client utilities for both client-side and server-side usage.
 */

// Client-side Supabase client
export { createClient as createBrowserClient } from './client'

// Server-side Supabase client
export { createClient as createServerClient } from './server'
