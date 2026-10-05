// Point d'entrée de toutes les pages. Pendant la construction, l'accès est réservé :
// 1) page « connexion » : formulaire email + mot de passe (Supabase Auth) ;
// 2) toute autre page : session exigée, puis chargement du parcours (./main).
import { exigerSession, connexion, deconnexion } from "./auth";

const page = document.body.dataset.page ?? "index";

function reveler() { document.getElementById("gate")?.remove(); }

if (page === "connexion") {
  reveler();
  const f = document.getElementById("f") as HTMLFormElement;
  const err = document.getElementById("err")!;
  const go = document.getElementById("go") as HTMLButtonElement;
  const suite = new URLSearchParams(location.search).get("suite");
  const cible = suite && suite.startsWith("/") && !suite.startsWith("//") ? suite : "/";

  // Déjà connecté ? On entre directement.
  exigerSession().then((s) => { if (s) location.replace(cible); });

  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.textContent = "";
    go.disabled = true; go.textContent = "Connexion…";
    try {
      const email = (document.getElementById("email") as HTMLInputElement).value.trim();
      const password = (document.getElementById("password") as HTMLInputElement).value;
      await connexion(email, password);
      location.replace(cible);
    } catch (ex) {
      err.textContent = (ex as Error).message;
      go.disabled = false; go.textContent = "Se connecter";
    }
  });
} else {
  exigerSession().then(async (s) => {
    if (!s) return; // redirection en cours
    reveler();
    await import("./main");
    // Lien de déconnexion discret en bas de la barre latérale, quand il y en a une.
    const nav = document.querySelector("body > div > nav");
    if (nav) {
      const a = document.createElement("a");
      a.href = "#"; a.textContent = "Se déconnecter";
      a.style.cssText = "font-size:12px;color:#9AA6C2;text-decoration:none;padding:4px 6px 0";
      a.addEventListener("click", (e) => { e.preventDefault(); deconnexion(); });
      nav.appendChild(a);
    }
  });
}
