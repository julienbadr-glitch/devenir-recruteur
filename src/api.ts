// Client minimal vers l'Edge Function « parcours ». La clé publishable est publique par conception ;
// toute écriture sensible est validée côté serveur (voir supabase/functions/parcours/index.ts).
import { sessionCourante } from "./auth";

const URL = import.meta.env.VITE_SUPABASE_URL ?? "https://icqwtdftddxjvvzqdnms.supabase.co";
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_osJVWZs8sn_T3FW2o5pxHA_F8F3yC4r";
const FN = `${URL}/functions/v1/parcours`;
const LS = "dri.session";

export type Scores = Record<"vendre" | "identifier" | "presenter" | "organiser" | "entreprendre", number>;
export type Resultat = { scores: Scores; profil: string; point_faible: string; redhibitoire: boolean };

async function post<T = any>(body: Record<string, unknown>): Promise<T> {
  // Accès réservé pendant la construction : le jeton de l'utilisateur connecté est exigé par la fonction (verify_jwt).
  const s = await sessionCourante();
  if (!s) throw new Error("Session expirée. Reconnectez-vous.");
  const r = await fetch(FN, { method: "POST", headers: { "Content-Type": "application/json", apikey: KEY, Authorization: `Bearer ${s.access_token}` }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error ?? r.statusText);
  return j as T;
}

export async function session(): Promise<string> {
  let id = localStorage.getItem(LS);
  if (id) return id;
  const p = new URLSearchParams(location.search);
  const { session_id } = await post<{ session_id: string }>({
    action: "session.start",
    source: p.get("utm_source"), medium: p.get("utm_medium"), campagne: p.get("utm_campaign"), referent: p.get("ref") ?? (document.referrer || null),
  });
  localStorage.setItem(LS, session_id);
  return session_id;
}

export const api = {
  testSave: async (reponses: Record<string, string>) => post({ action: "test.save", session_id: await session(), reponses }),
  testFinish: async () => post<Resultat>({ action: "test.finish", session_id: await session() }),
  testGet: async () => post<(Resultat & { termine_le: string | null; reponses: Record<string, string> }) | null>({ action: "test.get", session_id: await session() }),
  hypotheses: async (h: { placements: number; honoraires: number; temps: string; objectif_mensuel: number }) => post({ action: "hypotheses.save", session_id: await session(), hypotheses: h }),
  rappel: async (telephone: string, creneau: string, consentement: boolean) => post({ action: "rappel.create", session_id: await session(), telephone, creneau, consentement }),
};

// Cache local du résultat pour piloter la navigation sans aller-retour.
const LR = "dri.resultat";
export function resultatLocal(): Resultat | null { try { return JSON.parse(localStorage.getItem(LR) ?? "null"); } catch { return null; } }
export function memoriserResultat(r: Resultat) { localStorage.setItem(LR, JSON.stringify(r)); }
