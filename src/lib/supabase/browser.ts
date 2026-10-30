"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./config";

/**
 * Supabase client for the admin panel's browser code (e.g. uploading images straight to
 * Storage). It carries the admin's session cookie; RLS + storage policies decide what it may do.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
