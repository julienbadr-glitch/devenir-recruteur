// Accès restreint pendant la construction : Supabase Auth (email + mot de passe).
// Les comptes sont créés par Julien dans Supabase ; l'inscription publique est désactivée.
import { createClient, type Session } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL ?? "https://icqwtdftddxjvvzqdnms.supabase.co";
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_osJVWZs8sn_T3FW2o5pxHA_F8F3yC4r";

export const supabase = createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true } });

export async function sessionCourante(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function connexion(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect." : error.message);
}

export async function deconnexion() {
  await supabase.auth.signOut();
  location.href = "/connexion.html";
}

// Garde : toute page sauf la connexion exige une session. Retourne la session ou redirige.
export async function exigerSession(): Promise<Session | null> {
  const s = await sessionCourante();
  if (!s && !location.pathname.endsWith("/connexion.html")) {
    location.replace("/connexion.html?suite=" + encodeURIComponent(location.pathname));
    return null;
  }
  return s;
}
