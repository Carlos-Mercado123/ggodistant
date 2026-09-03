"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-xs font-bold uppercase text-ink-muted">
          Usuario
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-xs font-bold uppercase text-ink-muted">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        />
      </div>

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-brand px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
