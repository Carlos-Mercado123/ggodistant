import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-sm font-bold tracking-wide text-ink">
            CGO Distancia <span className="text-brand">Huancayo (HYO)</span>
          </p>
          <h1 className="mt-3 text-lg font-semibold text-ink">Panel de Speeches</h1>
          <p className="mt-1 text-xs text-ink-muted">
            Ingresa tus credenciales para gestionar las propuestas de valor.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
