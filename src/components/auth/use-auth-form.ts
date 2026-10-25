"use client";

import { useCallback, useRef, useState } from "react";
import type { FieldErrors } from "@/lib/auth/validation";

type ServerResult = { ok: true } | { ok: false; error: string; code?: string; fieldErrors?: FieldErrors } | undefined | void;

/**
 * Submission state for an auth form calling a Server Action:
 * one request at a time (double submits ignored), field errors from the
 * server merged with the client ones, form-level error kept until the next
 * attempt. A Server Action that redirects never "succeeds" here: the button
 * stays busy until the next screen replaces this one.
 */
export function useAuthForm<R extends ServerResult>() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [serverFields, setServerFields] = useState<FieldErrors>({});
  const busy = useRef(false);

  const submit = useCallback(async (call: () => Promise<R>): Promise<R | undefined> => {
    if (busy.current) return undefined;
    busy.current = true;
    setPending(true);
    setError(null);
    setServerFields({});
    try {
      const result = await call();
      if (result && !result.ok) {
        setError({ message: result.error, code: result.code });
        setServerFields(result.fieldErrors ?? {});
        busy.current = false;
        setPending(false);
      } else if (result && result.ok) {
        busy.current = false;
        setPending(false);
      }
      return result;
    } catch {
      setError({ message: "Connexion au serveur impossible. Vérifie ton réseau puis réessaie.", code: "network" });
      busy.current = false;
      setPending(false);
      return undefined;
    }
  }, []);

  const clearField = useCallback((name: string) => setServerFields((f) => (f[name] ? { ...f, [name]: "" } : f)), []);

  return { pending, error, serverFields, submit, clearField, setError };
}
