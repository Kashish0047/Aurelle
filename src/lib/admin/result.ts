/** What every admin server action returns to the browser. Never contains raw database errors. */
export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
