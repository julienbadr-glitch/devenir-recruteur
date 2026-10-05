// Edge Function « parcours » — seule porte d'écriture du front statique vers la base.
// Actions : session.start, test.save, test.finish, hypotheses.save, rappel.create
// Le front envoie un session_id (uuid) qu'il garde en localStorage. Aucune donnée
// personnelle avant rappel.create. Jamais de jointure profils/evaluations ↔ leads ici.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED = [
  "https://devenir-recruteurs-independants.com",
  "https://www.devenir-recruteurs-independants.com",
  "http://localhost:5173",
];
function cors(origin: string | null) {
  const o = origin && ALLOWED.includes(origin) ? origin : ALLOWED[0];
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

// Barème du test : 15 situations, 3 par compétence, chaque option vaut 0 à 4 (sur 20 par compétence : 3 × 4 = 12 → ramené sur 20).
const COMPETENCES = ["vendre", "identifier", "presenter", "organiser", "entreprendre"] as const;
type Comp = typeof COMPETENCES[number];
// q01..q03 → vendre, q04..q06 → identifier, q07..q09 → présenter, q10..q12 → organiser, q13..q15 → entreprendre
// Valeurs par option — À CALIBRER avec Julien avant mise en ligne (ici : b = meilleure réponse, a = correcte, c = faible).
const BAREME: Record<string, Record<string, number>> = Object.fromEntries(
  Array.from({ length: 15 }, (_, i) => [`q${String(i + 1).padStart(2, "0")}`, { a: 2, b: 4, c: 1 }]),
);
function scorer(reponses: Record<string, string>) {
  const scores: Record<Comp, number> = { vendre: 0, identifier: 0, presenter: 0, organiser: 0, entreprendre: 0 };
  for (const [q, opt] of Object.entries(reponses)) {
    const n = parseInt(q.slice(1), 10);
    const comp = COMPETENCES[Math.floor((n - 1) / 3)];
    if (!comp) continue;
    scores[comp] += BAREME[q]?.[opt] ?? 0;
  }
  // 12 points max par compétence → sur 20
  for (const c of COMPETENCES) scores[c] = Math.round((scores[c] / 12) * 20);
  const tri = [...COMPETENCES].sort((a, b) => scores[a] - scores[b]);
  const point_faible = tri[0];
  const forts = tri.slice(-2);
  let profil = "L’entrepreneur du recrutement";
  if (forts.includes("identifier") && forts.includes("presenter")) profil = "Le chasseur qui convainc";
  else if (forts.includes("vendre") && forts.includes("entreprendre")) profil = "Le développeur de territoire";
  else if (forts.includes("organiser") && forts.includes("entreprendre")) profil = "Le bâtisseur méthodique";
  else if (forts.includes("identifier") && forts.includes("organiser")) profil = "Le recruteur de précision";
  const redhibitoire = scores.vendre < 8 && scores.identifier < 8;
  return { scores, profil, point_faible, redhibitoire };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: cors(origin) });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  let body: any;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: "JSON invalide" }), { status: 400, headers: cors(origin) }); }
  const { action, session_id } = body ?? {};
  const uuid = /^[0-9a-f-]{36}$/i;

  try {
    if (action === "session.start") {
      const ua = req.headers.get("user-agent") ?? "";
      const appareil = /Mobi|Android/i.test(ua) ? "mobile" : "desktop";
      const { data, error } = await sb.from("sessions").insert({
        source: body.source ?? null, medium: body.medium ?? null, campagne: body.campagne ?? null,
        referent: body.referent ?? null, appareil, prenom: body.prenom ?? null,
      }).select("id").single();
      if (error) throw error;
      return new Response(JSON.stringify({ session_id: data.id }), { headers: cors(origin) });
    }

    if (!uuid.test(session_id ?? "")) return new Response(JSON.stringify({ error: "session_id requis" }), { status: 400, headers: cors(origin) });
    await sb.from("sessions").update({ vue_le: new Date().toISOString() }).eq("id", session_id);

    if (action === "test.save") {
      const reponses = body.reponses ?? {};
      if (typeof reponses !== "object" || Object.keys(reponses).length > 15) throw new Error("réponses invalides");
      const { error } = await sb.from("evaluations").upsert({ session_id, reponses, maj_le: new Date().toISOString() });
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers: cors(origin) });
    }

    if (action === "test.finish") {
      const { data: ev, error } = await sb.from("evaluations").select("reponses").eq("session_id", session_id).single();
      if (error) throw error;
      const r = scorer(ev.reponses ?? {});
      const { error: e2 } = await sb.from("evaluations").update({
        scores: r.scores, profil: r.profil, point_faible: r.point_faible, termine_le: new Date().toISOString(), maj_le: new Date().toISOString(),
      }).eq("session_id", session_id);
      if (e2) throw e2;
      await sb.from("sessions").update({ termine_le: new Date().toISOString() }).eq("id", session_id);
      return new Response(JSON.stringify(r), { headers: cors(origin) });
    }

    if (action === "test.get") {
      const { data } = await sb.from("evaluations").select("scores, profil, point_faible, termine_le, reponses").eq("session_id", session_id).maybeSingle();
      return new Response(JSON.stringify(data ?? null), { headers: cors(origin) });
    }

    if (action === "hypotheses.save") {
      const h = body.hypotheses ?? {};
      const row = {
        session_id,
        placements: Math.min(60, Math.max(1, parseInt(h.placements ?? 1, 10))),
        honoraires: Math.min(30000, Math.max(1000, parseInt(h.honoraires ?? 4000, 10))),
        temps: h.temps ?? null,
        objectif_mensuel: h.objectif_mensuel ? parseInt(h.objectif_mensuel, 10) : null,
        maj_le: new Date().toISOString(),
      };
      const { error } = await sb.from("hypotheses").upsert(row);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers: cors(origin) });
    }

    if (action === "rappel.create") {
      const tel = String(body.telephone ?? "").replace(/\s+/g, "");
      if (!/^(\+33|0)[1-9]\d{8}$/.test(tel)) throw new Error("téléphone invalide");
      if (body.consentement !== true) throw new Error("consentement requis");
      const { error } = await sb.from("rappels").insert({ session_id, telephone: tel, creneau: body.creneau ?? null });
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers: cors(origin) });
    }

    return new Response(JSON.stringify({ error: "action inconnue" }), { status: 400, headers: cors(origin) });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), { status: 400, headers: cors(origin) });
  }
});
