"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  /** Red button for destructive actions. */
  danger?: boolean;
  /** Optional gentler alternative, e.g. "Hide instead". Resolves to "alternative". */
  alternativeLabel?: string;
}
type ConfirmAnswer = boolean | "alternative";

const ConfirmContext = createContext<(o: ConfirmOptions) => Promise<ConfirmAnswer>>(async () => false);

/** `const confirm = useConfirm(); if (await confirm({...}) === true) …` */
export function useConfirm() {
  return useContext(ConfirmContext);
}

/** Accessible confirm dialog (native <dialog>: focus trap, Escape to cancel). */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const resolver = useRef<((a: ConfirmAnswer) => void) | null>(null);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = useCallback((o: ConfirmOptions) => {
    setOptions(o);
    return new Promise<ConfirmAnswer>((resolve) => (resolver.current = resolve));
  }, []);

  useEffect(() => {
    if (options && !ref.current?.open) ref.current?.showModal();
  }, [options]);

  const answer = (a: ConfirmAnswer) => {
    resolver.current?.(a);
    resolver.current = null;
    ref.current?.close();
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <dialog
        ref={ref}
        onCancel={(e) => {
          e.preventDefault();
          answer(false);
        }}
        aria-labelledby="confirm-title"
        className="m-auto w-[min(92vw,26rem)] rounded-2xl border border-line bg-surface p-6 text-ink backdrop:bg-ink/40"
      >
        {options && (
          <>
            <h2 id="confirm-title" className="font-serif text-2xl">
              {options.title}
            </h2>
            <p className="mt-2 text-sm text-muted">{options.message}</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => answer(false)} className="rounded-full border border-line px-5 py-2.5 text-sm" autoFocus>
                Cancel
              </button>
              {options.alternativeLabel && (
                <button type="button" onClick={() => answer("alternative")} className="rounded-full border border-ink px-5 py-2.5 text-sm">
                  {options.alternativeLabel}
                </button>
              )}
              <button
                type="button"
                onClick={() => answer(true)}
                className={cn("rounded-full px-5 py-2.5 text-sm", options.danger ? "bg-accent text-accent-contrast" : "bg-ink text-bg")}
              >
                {options.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </>
        )}
      </dialog>
    </ConfirmContext.Provider>
  );
}
