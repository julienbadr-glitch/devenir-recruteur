# Devenir recruteur indépendant — devenir-recruteurs-independants.com

Espace immersif du Mercato de l'Emploi : le test « êtes-vous fait pour devenir entrepreneur dans le recrutement ? », puis cinq univers (l'opportunité, la communauté, l'Académie, le business plan, un recrutement de A à Z) et « rejoindre l'aventure ».

## Stack
- Front statique : Vite + TypeScript, 9 pages HTML. Hébergé sur GitHub Pages (workflow `.github/workflows/deploy.yml`), domaine via `public/CNAME`.
- Backend : Supabase projet `prequal` (eu-west-3, Paris). Toute écriture passe par l'Edge Function `parcours` (`supabase/functions/parcours/index.ts`) ; le navigateur n'a que la clé publishable.
- Tables utilisées : `sessions`, `evaluations` (nouvelle : réponses et scores du test), `hypotheses`, `rappels`. `profils` (ancien parcours, sans score) est laissée intacte.

## DNS (Infomaniak, zone devenir-recruteurs-independants.com)
- `A @` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
- `CNAME www` → `<organisation>.github.io.`
- Puis dans GitHub › Settings › Pages : custom domain = devenir-recruteurs-independants.com, « Enforce HTTPS ».

## Développer
```
npm i
npm run dev      # http://localhost:5173
npm run build    # dist/
```

## À faire avant mise en ligne
- Calibrer le barème (`BAREME` dans l'Edge Function) et les règles de profil avec Julien.
- Remplacer tous les `[NB]`, `[PHOTO]`, `[Prénom]` par des données sourcées (Spider, Symbiose) et des visuels autorisés (`recruteurs.publiable = true`).
- Relire les situations marquées `[À ÉCRIRE]` dans `src/content/test.ts`.

## Accès réservé (phase de construction)

Toutes les pages exigent une connexion (Supabase Auth, email + mot de passe) via `/connexion.html`.
La fonction `parcours` vérifie le jeton de l'utilisateur (verify_jwt + `auth.getUser`).
Les comptes sont créés à la main dans Supabase → Authentication → Users ; l'inscription publique doit rester désactivée.
Pour ouvrir la plateforme au public : retirer la garde dans `src/boot.ts`, le contrôle du jeton dans `api.ts` et dans la fonction, redéployer avec `verify_jwt: false`.
