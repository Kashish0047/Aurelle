"use client";

import { useActionState, useState } from "react";
import { cn } from "@/lib/cn";
import { login, sendMagicLink, type LoginState } from "./actions";

const input =
  "h-12 w-full rounded-xl border border-line bg-surface px-4 text-base outline-none transition-colors placeholder:text-muted/60 focus:border-ink";

export function LoginForm({ magicLink }: { magicLink: boolean }) {
  const [mode, setMode] = useState<"password" | "link">("password");
  const [passwordState, passwordAction, passwordPending] = useActionState<LoginState, FormData>(login, {});
  const [linkState, linkAction, linkPending] = useActionState<LoginState, FormData>(sendMagicLink, {});
  const state = mode === "password" ? passwordState : linkState;
  const pending = passwordPending || linkPending;

  return (
    <form action={mode === "password" ? passwordAction : linkAction} className="flex flex-col gap-4" noValidate>
      <label className="flex flex-col gap-2 text-sm">
        Email
        <input name="email" type="email" autoComplete="username" required placeholder="you@salon.com" className={input} />
      </label>

      {mode === "password" && (
        <label className="flex flex-col gap-2 text-sm">
          Password
          <input name="password" type="password" autoComplete="current-password" required className={input} />
        </label>
      )}

      {state.error && (
        <p role="alert" className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          {state.error}
        </p>
      )}
      {state.notice && (
        <p role="status" className="rounded-xl border border-line bg-bg-alt px-4 py-3 text-sm">
          {state.notice}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-full bg-ink font-medium text-bg transition-opacity disabled:opacity-60"
      >
        {pending ? "Please wait…" : mode === "password" ? "Sign in" : "Email me a sign-in link"}
      </button>

      {magicLink && (
        <button
          type="button"
          onClick={() => setMode(mode === "password" ? "link" : "password")}
          className={cn("link-underline mx-auto text-sm text-muted")}
        >
          {mode === "password" ? "Sign in with an email link instead" : "Sign in with a password instead"}
        </button>
      )}
    </form>
  );
}
