// Les 15 situations du test, 3 par compétence. Chaque option vaut a / b / c ; le barème est côté serveur.
// Les situations marquées [À ÉCRIRE] attendent la relecture de Julien. Rien n'est inventé sur le réseau.
export type Situation = { id: string; competence: string; kicker: string; titre: string; contexte: string; options: { k: "a" | "b" | "c"; t: string }[]; enjeu: string };

export const COMPETENCES: Record<string, { nom: string; sous: string }> = {
  vendre: { nom: "Vendre", sous: "aller chercher un mandat" },
  identifier: { nom: "Identifier", sous: "sentir la bonne personne" },
  presenter: { nom: "Présenter", sous: "donner envie d’une opportunité" },
  organiser: { nom: "Organiser", sous: "tenir son business" },
  entreprendre: { nom: "Entreprendre", sous: "performer dans le temps" },
};

export const SITUATIONS: Situation[] = [
  // ---- Vendre ----
  { id: "q01", competence: "vendre", kicker: "Le dirigeant déjà déçu", titre: "Un dirigeant vous dit : « On a déjà pris un cabinet. Ça n’a rien donné. »", contexte: "Vous êtes dans son bureau. Il a cinq minutes.", options: [
    { k: "a", t: "Je lui explique en quoi le Mercato est différent." },
    { k: "b", t: "Je lui demande ce qui n’a pas marché, précisément." },
    { k: "c", t: "Je lui propose de n’être payé qu’au résultat." }], enjeu: "Vendre, ici, c’est d’abord comprendre l’échec précédent. Celui qui plaide perd ; celui qui questionne signe." },
  { id: "q02", competence: "vendre", kicker: "Le devis sans réponse", titre: "Votre devis est parti il y a huit jours. Silence.", contexte: "Le poste est urgent, vous le savez. Le dirigeant, lui, s’est remis à ses machines.", options: [
    { k: "a", t: "J’attends encore une semaine : relancer trop vite fait vendeur." },
    { k: "b", t: "J’appelle aujourd’hui avec une information nouvelle sur son marché." },
    { k: "c", t: "Je renvoie le devis avec une remise." }], enjeu: "Le silence d’un dirigeant n’est jamais un non : c’est un oubli. On relance avec de la valeur, pas avec un rabais." },
  { id: "q03", competence: "vendre", kicker: "[À ÉCRIRE] Défendre un honoraire", titre: "« 4 000 € pour un technicien ? Je trouve ça cher. »", contexte: "Elle a le budget. Elle teste.", options: [
    { k: "a", t: "Je descends à 3 500 € pour signer." },
    { k: "b", t: "Je chiffre avec elle ce que coûte la ligne 2 arrêtée un mois de plus." },
    { k: "c", t: "Je lui dis que c’est le tarif du réseau." }], enjeu: "Un honoraire se défend par le coût du problème, jamais par le tarif." },
  // ---- Identifier ----
  { id: "q04", competence: "identifier", kicker: "Le candidat parfait", titre: "Mehdi coche tout. Il demande 8 000 € de plus que le budget. La dirigeante hésite.", contexte: "Trois semaines avant que la ligne 2 s’arrête. Mehdi a une autre offre.", options: [
    { k: "a", t: "Je retourne voir la dirigeante avec le coût réel d’un poste vide un mois de plus." },
    { k: "b", t: "J’appelle Mehdi pour comprendre ce que les 8 000 € représentent vraiment pour lui." },
    { k: "c", t: "Je relance les deux autres candidats, au cas où." }], enjeu: "Le recruteur ne tranche pas le salaire : il fait apparaître ce que chacun veut vraiment." },
  { id: "q05", competence: "identifier", kicker: "Le CV brillant", titre: "Un CV parfait sur le papier. En entretien, il répond à côté deux fois.", contexte: "Le client attend un profil demain matin.", options: [
    { k: "a", t: "Je l’envoie quand même : le CV parlera pour lui." },
    { k: "b", t: "Je creuse les deux réponses à côté avant de décider." },
    { k: "c", t: "Je l’écarte : deux signaux, c’est trop." }], enjeu: "Identifier, c’est savoir ce qu’on n’a pas encore compris, pas trier vite." },
  { id: "q06", competence: "identifier", kicker: "[À ÉCRIRE] Le candidat qui ne cherche pas", titre: "Il est en poste depuis douze ans, bien payé, et il répond au téléphone.", contexte: "Vous avez quatre minutes.", options: [
    { k: "a", t: "Je lui décris le poste et le salaire." },
    { k: "b", t: "Je lui demande ce qui le ferait bouger, s’il devait bouger." },
    { k: "c", t: "Je lui propose un café sans en dire plus." }], enjeu: "Celui qui ne cherche pas ne répond pas à une annonce ; il répond à une question sur lui." },
  // ---- Présenter ----
  { id: "q07", competence: "presenter", kicker: "Le premier appel", titre: "Vous appelez un technicien en poste. Il ne cherche rien. Vos premiers mots ?", contexte: "Ça sonne. Il décroche.", options: [
    { k: "a", t: "« Bonjour, je recrute pour une entreprise près de chez vous. »" },
    { k: "b", t: "« Bonjour, je ne sais pas si ça vous intéresse. Je voulais surtout votre avis sur quelque chose. »" },
    { k: "c", t: "« Bonjour, j’ai un poste à vous proposer. »" }], enjeu: "Présenter, c’est d’abord obtenir l’écoute. Le poste vient après." },
  { id: "q08", competence: "presenter", kicker: "[À ÉCRIRE] Le point faible du poste", titre: "Le poste est à 50 minutes de route et le candidat le sait.", contexte: "Il hésite à cause de ça.", options: [
    { k: "a", t: "Je minimise : 50 minutes, ça passe vite." },
    { k: "b", t: "Je le nomme avant lui, et je parle de ce que ça lui achète." },
    { k: "c", t: "Je n’en parle pas : à lui de peser." }], enjeu: "Une opportunité se présente avec ses défauts dits ; c’est ce qui rend le reste crédible." },
  { id: "q09", competence: "presenter", kicker: "[À ÉCRIRE] Présenter au client", titre: "Vous présentez Mehdi à la dirigeante. Elle lit le CV en diagonale.", contexte: "Vous avez une minute pour qu’elle le reçoive.", options: [
    { k: "a", t: "Je résume son parcours." },
    { k: "b", t: "Je lui dis la seule chose qui compte pour elle : il sait réparer ses machines, et pourquoi il veut partir." },
    { k: "c", t: "Je lui envoie le rapport PersonaLab et je la laisse lire." }], enjeu: "Présenter au client, c’est traduire, pas répéter." },
  // ---- Organiser ----
  { id: "q10", competence: "organiser", kicker: "Six mandats en parallèle", titre: "Lundi matin : six mandats ouverts, deux entretiens, un devis à relancer, douze appels prévus.", contexte: "Vous commencez par quoi ?", options: [
    { k: "a", t: "Les douze appels : c’est en appelant qu’on trouve." },
    { k: "b", t: "Dix minutes sur mon tableau de suivi, puis le devis, puis les appels." },
    { k: "c", t: "Les entretiens : ce sont les plus proches de la facture." }], enjeu: "Au mois 4, c’est l’organisation qui décide, plus le talent." },
  { id: "q11", competence: "organiser", kicker: "[À ÉCRIRE] La relance oubliée", titre: "Vous retrouvez un devis signé il y a trois semaines… sans aucun candidat présenté.", contexte: "Le client n’a rien dit.", options: [
    { k: "a", t: "Je l’appelle pour m’excuser et proposer un point." },
    { k: "b", t: "Je mets en place une règle : J+2 et J+7 pour chaque mandat, puis j’appelle." },
    { k: "c", t: "J’attends d’avoir un candidat pour rappeler." }], enjeu: "Une erreur se répare ; une méthode l’empêche de revenir." },
  { id: "q12", competence: "organiser", kicker: "[À ÉCRIRE] La facture", titre: "Mehdi a signé hier. Vous n’avez pas encore facturé.", contexte: "Vous avez trois autres choses urgentes.", options: [
    { k: "a", t: "Je facture ce matin, avant tout le reste." },
    { k: "b", t: "Je facture en fin de semaine, avec les autres." },
    { k: "c", t: "Je facture quand le client confirme la période d’essai." }], enjeu: "La facture le jour de l’embauche n’est pas un détail comptable : c’est la trésorerie des cinq premiers mois." },
  // ---- Entreprendre ----
  { id: "q13", competence: "entreprendre", kicker: "Le mois à zéro", titre: "Mois 2. Vous avez appelé soixante entreprises. Aucun mandat.", contexte: "Un ami vous propose un CDI.", options: [
    { k: "a", t: "Je prends le CDI et je garde le recrutement en parallèle." },
    { k: "b", t: "Je revois ma cible avec mon mentor et je continue." },
    { k: "c", t: "Je double les appels la semaine suivante." }], enjeu: "Entreprendre, c’est tenir quand ça ne répond pas, en corrigeant la méthode." },
  { id: "q14", competence: "entreprendre", kicker: "[À ÉCRIRE] Le revenu variable", titre: "Vos trois derniers mois : 0 €, 8 000 €, 4 000 €.", contexte: "Vous devez décider de votre rémunération.", options: [
    { k: "a", t: "Je me verse tout ce qui rentre." },
    { k: "b", t: "Je me verse un fixe lissé et je garde une réserve." },
    { k: "c", t: "Je ne me verse rien tant que ce n’est pas régulier." }], enjeu: "Un indépendant gère une trésorerie, pas un salaire." },
  { id: "q15", competence: "entreprendre", kicker: "[À ÉCRIRE] Le client récurrent", titre: "Un client vous rappelle pour un deuxième poste. Vous êtes déjà débordé.", contexte: "Que faites-vous ?", options: [
    { k: "a", t: "Je refuse poliment : je ne pourrai pas le servir correctement." },
    { k: "b", t: "J’accepte et je partage le mandat avec un recruteur du réseau." },
    { k: "c", t: "J’accepte et je ferai au mieux." }], enjeu: "Le réseau existe pour ça : grandir sans casser la qualité." },
];
