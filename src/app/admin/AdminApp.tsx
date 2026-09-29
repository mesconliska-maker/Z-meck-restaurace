// Administrace poledních menu – /admin
//
// Samostatná stránka mimo layout webu (bez hlavičky a patičky), načítá se
// líně (viz routes.ts), takže nezvětšuje veřejný web.

import { Loader2, LogOut } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Toaster } from "sonner";
import { WeekEditor } from "./components/WeekEditor";
import { getMenuStore, type AdminUser } from "./lib/store";

function useNoIndex() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Administrace menu | Zámecká restaurace";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      document.title = prevTitle;
      meta.remove();
    };
  }, []);
}

function LoginForm({ onDone }: { onDone: () => void }) {
  const store = getMenuStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await store.signIn(email, password);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Přihlášení se nezdařilo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <img src="/menu-monogram.png" alt="" className="mx-auto mb-4 size-14" />
        <h1 className="text-center text-3xl font-semibold text-stone-900" style={{ fontFamily: "Cormorant Garamond, serif" }}>
          Polední menu
        </h1>
        <p className="mb-6 text-center text-sm text-stone-500">Administrace Zámecké restaurace</p>
        <label className="mb-1 block text-sm font-medium text-stone-700" htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-stone-300 px-3 py-2.5 focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/20"
        />
        <label className="mb-1 block text-sm font-medium text-stone-700" htmlFor="password">Heslo</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-5 w-full rounded-lg border border-stone-300 px-3 py-2.5 focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/20"
        />
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-700 py-2.5 font-medium text-white hover:bg-orange-800 disabled:opacity-60"
        >
          {busy && <Loader2 size={18} className="animate-spin" />} Přihlásit
        </button>
        <p className="mt-4 text-center text-xs text-stone-400">Zapomenuté heslo vám obnoví správce webu.</p>
      </form>
    </div>
  );
}

type Gate = "loading" | "login" | "forbidden" | "ok";

export function AdminApp() {
  useNoIndex();
  const store = getMenuStore();
  const [gate, setGate] = useState<Gate>("loading");
  const [user, setUser] = useState<AdminUser | null>(null);

  async function check() {
    const u = await store.getUser();
    setUser(u);
    if (!u) return setGate("login");
    try {
      setGate((await store.isEditor()) ? "ok" : "forbidden");
    } catch {
      setGate("forbidden");
    }
  }

  useEffect(() => {
    check();
    return store.onAuthChange((u) => {
      if (!u) {
        setUser(null);
        setGate("login");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gate === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-orange-600" size={36} />
      </div>
    );
  }
  if (gate === "login") return <LoginForm onDone={check} />;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Toaster position="top-center" richColors />
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 sm:px-6">
          <img src="/menu-monogram.png" alt="" className="size-9" />
          <div className="min-w-0">
            <p className="text-xl font-semibold leading-tight" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Polední menu
            </p>
            <p className="truncate text-xs text-stone-500">Zámecká restaurace · administrace</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-stone-500 sm:inline">{user?.email}</span>
            {store.mode === "supabase" && (
              <button
                type="button"
                onClick={() => store.signOut()}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-stone-600 hover:bg-stone-100"
              >
                <LogOut size={16} /> Odhlásit
              </button>
            )}
          </div>
        </div>
        {store.mode === "demo" && (
          <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
            <strong>Demo režim</strong> – administrace ještě není napojená na databázi. Vše se ukládá jen do tohoto
            prohlížeče a na web se nic nedostane.
          </div>
        )}
      </header>

      {gate === "forbidden" ? (
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="mb-2 text-2xl font-semibold">Účet nemá oprávnění upravovat menu</h1>
          <p className="text-stone-600">
            Jste přihlášeni jako {user?.email}. Požádejte správce webu o přidání mezi editory.
          </p>
        </div>
      ) : (
        <WeekEditor />
      )}
    </div>
  );
}
