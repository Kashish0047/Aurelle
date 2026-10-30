"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type DefaultValues, type FieldValues, type Path, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { ActionResult } from "@/lib/admin/result";
import { useToast } from "@/components/admin/Toaster";

interface Options {
  success: string;
  /** Where to go after saving. */
  redirectTo: string;
}

/**
 * React Hook Form + the shared Zod schema, wired to a server action:
 *  - instant inline messages while typing (same rules the server enforces)
 *  - on submit, the raw values go to the server action, which validates again
 *  - server field errors are shown on the matching fields; other errors above the Save button
 *  - success → toast + back to the list
 */
export function useAdminForm<S extends z.ZodType<FieldValues, FieldValues>>(
  schema: S,
  defaults: DefaultValues<z.input<S>>,
  save: (values: z.input<S>) => Promise<ActionResult>,
  { success, redirectTo }: Options,
) {
  const router = useRouter();
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<z.input<S>, unknown, z.output<S>>({
    // zodResolver can't infer input/output types through the generic S; they match at runtime.
    resolver: zodResolver(schema) as unknown as Resolver<z.input<S>, unknown, z.output<S>>,
    defaultValues: defaults,
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(async () => {
    setServerError(null);
    const result = await save(form.getValues());
    if (result.ok) {
      toast(success);
      router.push(redirectTo);
      router.refresh();
      return;
    }
    setServerError(result.error);
    Object.entries(result.fieldErrors ?? {}).forEach(([key, message]) =>
      form.setError(key as Path<z.input<S>>, { message }),
    );
  });

  return { form, onSubmit, saving: form.formState.isSubmitting, serverError };
}
