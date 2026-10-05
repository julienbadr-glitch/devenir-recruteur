import { api, session, resultatLocal, memoriserResultat, type Resultat } from "./api";
import { SITUATIONS, COMPETENCES } from "./content/test";

const page = document.body.dataset.page ?? "index";
const UNIVERS = new Set(["opportunite", "communaute", "academie", "business-plan", "recrutement-a-z", "rejoindre"]);
const LIBELLE_COMP: Record<string, string> = { vendre: "vendre", identifier: "identifier", presenter: "présenter", organiser: "organiser", entreprendre: "entreprendre" };

session().catch(() => {/* hors ligne : le parcours reste lisible */});

const res = resultatLocal();

// 1. Garde : les univers s'ouvrent après le test.
if (UNIVERS.has(page) && !res) location.replace("/");

// 2. Accueil : une fois le test passé, l'espace ouvert prend le relais.
if (page === "index" && res) location.replace("/espace.html");
if (page === "espace") {
  if (!res) location.replace("/");
  else {
    const p = document.querySelector<HTMLElement>('[data-slot="profil"]'); if (p) p.textContent = res.profil;
    const f = document.querySelector<HTMLElement>('[data-slot="faible"]'); if (f) f.textContent = `Point à travailler en premier : ${LIBELLE_COMP[res.point_faible]}.`;
    document.querySelectorAll<HTMLElement>("nav a span").forEach((s) => { if (s.textContent?.includes("Le chasseur")) s.textContent = res.profil; if (s.textContent?.startsWith("Point à travailler")) s.textContent = `Point à travailler : ${LIBELLE_COMP[res.point_faible]}`; });
  }
}

// 3. Le test : 15 situations, sauvegarde à chaque réponse, résultat côté serveur.
if (page === "test") {
  const main = document.querySelector("main")!;
  const reponses: Record<string, string> = {};
  let i = 0;
  const C = { ink: "#0E1729", ink2: "#3D4A66", mute: "#6B7A99", line: "#E4E8F2", blue: "#2C69FF", violet: "#6D28D9" };
  function render() {
    const s = SITUATIONS[i]; const comp = COMPETENCES[s.competence];
    const idx = Object.keys(COMPETENCES).indexOf(s.competence) + 1;
    main.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px;padding-top:6px">
      <div style="display:flex;flex-direction:column;gap:3px"><h1 style="margin:0;font-size:22px;font-weight:600;letter-spacing:-.015em">Le test</h1><span style="font-size:13.5px;color:${C.mute}">Compétence ${idx} · ${comp.nom} · situation ${i + 1} sur 15</span></div>
      <div style="display:flex;gap:3px">${SITUATIONS.map((_, k) => `<span style="width:22px;height:3px;border-radius:2px;background:${k <= i ? C.blue : C.line}"></span>`).join("")}</div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:stretch">
      <div style="background:#fff;border:1px solid ${C.line};border-radius:18px;padding:24px;display:flex;flex-direction:column;gap:12px;flex:2 1 480px;min-width:0">
        <span style="font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${C.blue}">${s.kicker.replace("[À ÉCRIRE] ", "")}</span>
        <h2 style="margin:0;font-size:21px;font-weight:600;letter-spacing:-.015em;line-height:1.25">${s.titre}</h2>
        <p style="margin:0;font-size:14px;color:${C.ink2};line-height:1.55">${s.contexte}</p>
        <div id="opts" style="display:flex;flex-direction:column;gap:8px;padding-top:4px">
          ${s.options.map((o) => `<button type="button" data-k="${o.k}" style="text-align:left;font:inherit;font-size:14px;color:${C.ink};border:1px solid ${C.line};background:#fff;border-radius:12px;padding:14px 16px;min-height:44px;cursor:pointer;display:flex;gap:12px;align-items:flex-start"><span style="flex:none;width:24px;height:24px;border-radius:50%;background:#EEF2FB;color:#162649;display:inline-flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:700">${o.k.toUpperCase()}</span><span style="line-height:1.5">${o.t}</span></button>`).join("")}
        </div>
        <span style="font-size:12px;color:${C.mute}">Aucune réponse n’est éliminatoire seule. C’est l’ensemble qui dessine un profil.</span>
      </div>
      <div style="flex:1 1 260px;min-width:0;display:flex;flex-direction:column;gap:12px">
        <div style="background:#fff;border:1px solid ${C.line};border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:10px"><span style="font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${C.mute}">Ce qui se joue</span><span style="font-size:13.5px;color:${C.ink2};line-height:1.55">${s.enjeu}</span></div>
        <div style="background:#fff;border:1px solid ${C.line};border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:10px"><span style="font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${C.violet}">Votre profil se dessine</span><span style="font-size:13px;color:${C.ink2}">${Object.keys(reponses).length} réponse(s) enregistrée(s). Les cinq compétences sont notées séparément.</span>
          <div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px">${Object.keys(COMPETENCES).map((c) => `<span style="height:4px;border-radius:2px;background:${SITUATIONS.filter((x) => x.competence === c).every((x) => reponses[x.id]) ? C.violet : C.line}"></span>`).join("")}</div></div>
      </div>
    </div>`;
    main.querySelectorAll<HTMLButtonElement>("#opts button").forEach((b) => b.addEventListener("click", () => choisir(b.dataset.k!)));
  }
  async function choisir(k: string) {
    reponses[SITUATIONS[i].id] = k;
    api.testSave(reponses).catch(() => {});
    if (i < SITUATIONS.length - 1) { i++; render(); return; }
    main.innerHTML = `<p style="font-size:14px;color:${C.mute}">Calcul de votre rapport…</p>`;
    try { const r = await api.testFinish(); memoriserResultat(r); location.href = "/rapport.html"; }
    catch (e) { main.innerHTML = `<p style="font-size:14px;color:#E06A4A">Impossible d’enregistrer le résultat : ${(e as Error).message}. Réessayez dans un instant.</p>`; }
  }
  render();
}

// 4. Le rapport : rendu depuis le résultat réel.
if (page === "rapport") {
  if (!res) location.replace("/test.html");
  else rendreRapport(res);
}
function rendreRapport(r: Resultat) {
  const main = document.querySelector("main")!;
  const ordre = ["vendre", "identifier", "presenter", "organiser", "entreprendre"];
  const faible = r.point_faible;
  const lignes = ordre.map((c, i) => {
    const v = r.scores[c as keyof typeof r.scores]; const warn = v < 10;
    const col = warn ? "#E06A4A" : "#1E9E6A";
    const texte = ({ vendre: "Aller chercher le mandat, défendre l’honoraire, relancer avec de la valeur.", identifier: "Sentir la bonne personne, creuser ce qu’on n’a pas compris, comprendre ce que chacun veut vraiment.", presenter: "Obtenir l’écoute avant de parler du poste, nommer les défauts, traduire pour le client.", organiser: "Tenir le suivi, relancer à J+2 et J+7, facturer le jour de l’embauche.", entreprendre: "Tenir quand ça ne répond pas, gérer une trésorerie, grandir avec le réseau." } as Record<string, string>)[c];
    return `<div style="display:grid;grid-template-columns:150px 1fr 48px;gap:16px;align-items:center;padding:14px 0;border-bottom:1px solid #EEF2FB"><span style="font-size:14px;font-weight:600"><span style="color:#6B7A99;font-weight:500">${i + 1} · </span>${COMPETENCES[c].nom}</span><div style="height:6px;background:#EEF2FB;border-radius:3px;overflow:hidden"><div style="width:${v * 5}%;height:100%;background:${col};border-radius:3px"></div></div><span style="font-size:14px;font-weight:600;text-align:right;color:${warn ? "#E06A4A" : "#0E1729"}">${v}<span style="color:#6B7A99;font-weight:500">/20</span></span><span style="grid-column:2/-1;font-size:13px;color:#3D4A66;line-height:1.5;margin-top:-6px">${warn ? '<strong style="color:#E06A4A">Là, c’est compliqué. </strong>' : ""}${texte}</span></div>`;
  }).join("");
  const nbForts = ordre.filter((c) => r.scores[c as keyof typeof r.scores] >= 14).length;
  main.innerHTML = `
  <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px;padding-top:6px"><div style="display:flex;flex-direction:column;gap:3px"><h1 style="margin:0;font-size:22px;font-weight:600;letter-spacing:-.015em">Mon rapport</h1><span style="font-size:13.5px;color:#6B7A99">15 situations · 5 compétences · établi le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</span></div><button type="button" onclick="window.print()" style="display:inline-flex;align-items:center;gap:8px;background:#fff;color:#0E1729;border:1px solid #E4E8F2;font-weight:600;font-size:13.5px;padding:10px 14px;border-radius:9px;min-height:40px;cursor:pointer">Imprimer / PDF</button></div>
  <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:stretch">
    <div style="background:#fff;border:1px solid #E4E8F2;border-radius:18px;padding:24px;display:flex;flex-direction:column;gap:12px;flex:2 1 440px;min-width:0"><span style="font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#6D28D9">Verdict</span>
      <h2 style="margin:0;font-size:24px;font-weight:600;letter-spacing:-.02em;line-height:1.2">${r.redhibitoire ? "Pas tout de suite." : nbForts >= 4 ? "Vous avez l’étoffe d’un entrepreneur dans le recrutement. À une condition." : "Vous avez une base solide. Deux chantiers avant de vous lancer."}</h2>
      <p style="margin:0;font-size:14px;color:#3D4A66;line-height:1.6">${r.redhibitoire ? "Vendre et identifier sont tous deux en dessous de 8/20. Ce sont les deux gestes que les entreprises paient, et ils ne s’apprennent pas en trois mois. On vous le dit franchement : ce métier n’est pas le bon point de départ aujourd’hui. Parlez-en quand même avec un recruteur du réseau si vous voulez un second avis." : `${nbForts} compétence${nbForts > 1 ? "s" : ""} sur cinq au niveau attendu. Votre point faible, <strong>${LIBELLE_COMP[faible]}</strong>, ne se contourne pas dans ce métier, mais il s’apprend : c’est ce que votre mentor travaille en premier.`}</p></div>
    <div style="flex:1 1 260px;min-width:0;background:linear-gradient(135deg,#6D28D9 0%,#8B5CF6 100%);color:#fff;border-radius:18px;padding:24px;display:flex;flex-direction:column;gap:8px"><span style="font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.75)">Votre profil</span><span style="font-size:22px;font-weight:600;letter-spacing:-.02em;line-height:1.15">${r.profil}</span><span style="font-size:13px;color:rgba(255,255,255,.85);line-height:1.5">Point à travailler en premier : ${LIBELLE_COMP[faible]}.</span></div>
  </div>
  <div style="background:#fff;border:1px solid #E4E8F2;border-radius:18px;padding:8px 24px 10px;display:flex;flex-direction:column"><div style="padding:14px 0 4px"><span style="font-size:15px;font-weight:600">Les cinq compétences</span><br><span style="font-size:12.5px;color:#6B7A99">Notées séparément, sur 20.</span></div>${lignes}</div>
  <div style="display:flex;justify-content:flex-end"><a href="/opportunite.html" style="display:inline-flex;align-items:center;gap:8px;background:#162649;color:#fff;text-decoration:none;font-weight:600;font-size:13.5px;padding:10px 14px;border-radius:9px;min-height:40px">Ouvrir mon espace : l’opportunité →</a></div>`;
}

// 5. Business plan : l'objectif et les hypothèses sont mémorisés côté serveur.
if (page === "business-plan") {
  const obj = document.querySelector<HTMLInputElement>("#obj");
  obj?.addEventListener("change", () => {
    const v = parseInt(obj.value.replace(/\D/g, ""), 10);
    if (v > 0) api.hypotheses({ placements: Math.ceil((v * 12) / (4000 * 0.7)), honoraires: 4000, temps: "plein", objectif_mensuel: v }).catch(() => {});
  });
}
