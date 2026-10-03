/**
 * Quiz data, ported from reference/SoMeCard_Quizprototyp.html so the funnel matches it.
 * `template` is the repaired relation → template mapping: the prototype's best-friend key is `van`
 * and its friend key is `kompis`, while the template files are the other way round.
 */

export interface Relation {
  key: string;
  label: string;
  emoji: string;
  template: string;
  top: string;
  cap: string;
  sp: string;
}

export const RELATIONS: Relation[] = [
  {key: "mamma", label: "Mamma", emoji: "💜", template: "mamma",
    top: "Specialutgåva: världens bästa mamma", cap: "Mamma. Familjens VD.", sp: "Mamma, chaufför, krishanterare"},
  {key: "pappa", label: "Pappa", emoji: "💙", template: "pappa",
    top: "Specialutgåva: världens bästa pappa", cap: "Pappa. Grillmästare utan diplom.", sp: "Pappa, vaktmästare, skämtarkiv"},
  {key: "partner", label: "Partner", emoji: "❤️", template: "partner",
    top: "Specialutgåva: bara för dig", cap: "Partner. Bättre hälften, enligt egen utsago.", sp: "Partner, täcktjuv, bästa vän"},
  {key: "syskon", label: "Syskon", emoji: "💚", template: "syskon",
    top: "Specialutgåva: finns bara ett exemplar", cap: "Syskon. Rival sedan födseln.", sp: "Syskon, skvallerbytta, medbrottsling"},
  {key: "van", label: "Bästa vän", emoji: "💛", template: "basta_van",
    top: "Specialutgåva: vet alldeles för mycket", cap: "Bästa vän. Vet för mycket.", sp: "Bästa vän, terapeut, dålig influens"},
  {key: "kompis", label: "Vän", emoji: "🩵", template: "van",
    top: "Specialutgåva: finns bara en", cap: "Vän. Alltid med på noter.", sp: "Vän, medresenär, ja-sägare"},
  {key: "kollega", label: "Kollega", emoji: "🩶", template: "kollega",
    top: "Specialutgåva: överlever alla möten", cap: "Kollega. Överlever möten.", sp: "Kollega, fikaansvarig, mötesöverlevare"}
];

export const relation = (key: string) => RELATIONS.find(r => r.key === key);

/** What the person lights up on — becomes attack 1. */
export const FIRE = [
  {key: "gym", label: "Träning", emoji: "🏋️", name: "Gymfrälsning", r: "+50 Gymfrälsning. Ingen slipper höra om passet."},
  {key: "mat", label: "Mat", emoji: "🌮", name: "Tacofredag", r: "+50 Tacofredag. Planerar middagen under lunchen."},
  {key: "jobb", label: "Jobbet", emoji: "💼", name: "Mejl kl 23.47", r: '+50 Mejl kl 23.47. "Ska bara svara på en sak."'},
  {key: "resa", label: "Resor", emoji: "✈️", name: "Sista minuten", r: "+50 Sista minuten. Passet ligger alltid framme."},
  {key: "sport", label: "Sport på tv", emoji: "⚽", name: "Domaren är blind", r: "+50 Domaren är blind. Hörs tre våningar ner."},
  {key: "shop", label: "Shopping", emoji: "🛍️", name: "Ska bara titta", r: "+50 Ska bara titta. Kommer hem med tre påsar."}
];

/** The three quick comparison questions, exactly as designed. */
export const PAIRS = [
  {
    q: "När ni ska ses, är {n}…",
    fill: "Fyller i: Attack 2",
    ownLabel: "Skriv egen attack", ownPlaceholder: "T.ex. Tappar nycklarna", ownMax: 22,
    options: [
      {label: "Alltid sen", name: "Kommer om fem", desc: "Fem minuter betyder minst tjugo. Motståndaren får vänta en runda."},
      {label: "Alltid tidig", name: "Tio minuter före", desc: "Står redan utanför. Motståndaren känner sig sen resten av dagen."}
    ]
  },
  {
    q: "Vad är {g} kryptonit?",
    fill: "Fyller i: Weakness",
    ownLabel: "Skriv egen kryptonit", ownPlaceholder: "T.ex. Chips", ownMax: 18,
    options: [{label: "Sockersug", name: "Sockersug"}, {label: "Snooze-knappen", name: "Snooze-knappen"}]
  },
  {
    q: "Vad biter inte på {n}?",
    fill: "Fyller i: Resistance",
    ownLabel: "Skriv eget", ownPlaceholder: "T.ex. Kyla", ownMax: 14,
    options: [{label: "Måndagar", name: "Måndagar"}, {label: "Goda råd", name: "Goda råd"}]
  }
];

/** Kryptonite suggestions that follow from the chosen interest. */
export const WEAK: Record<string, string[]> = {
  gym: ["Vilodagar", "Trappor dagen efter"], mat: ["Sockersug", "Sista biten"],
  jobb: ["Måndagsmöten", "Segt wifi"], resa: ["Försenade flyg", "Att packa i tid"],
  sport: ["Förlängning", "Reklamspauser"], shop: ["Rea-skyltar", "Fri frakt"]
};

/** Signature power — becomes special power and strength. */
export const POWER = [
  {key: "prat", label: "Pratar med alla", emoji: "🗣️",
    sp: "Har obegränsad social energi och kan starta ett samtal i vilken kö som helst.",
    st: "Kan småprata sig ur en parkeringsbot"},
  {key: "fix", label: "Fixar allt", emoji: "🛠️",
    sp: "Lagar det mesta med silvertejp och ren vilja. Läser aldrig manualen.",
    st: "Hittar alltid rätt skruv"},
  {key: "minne", label: "Minns allt", emoji: "🧠",
    sp: "Glömmer aldrig vad du sa 2014 och tar fram det vid exakt rätt tillfälle.",
    st: "Vinner varje diskussion i efterhand"},
  {key: "somn", label: "Somnar var som helst", emoji: "😴",
    sp: "Kan somna mitt i en mening och ändå påstå sig ha lyssnat hela tiden.",
    st: "Laddar fullt på elva minuter"}
];

export const QUOTE_EXAMPLES = ["Har du ätit nåt?", "Jag ska bara…", "Det var bättre förr"];

export const PRICE = 99;
export const FAMILY_PRICE = 249;
export const FAMILY_EXTRA = 120;

export const SAMPLE = {image: "/sample/basta_van.png", teaser: "/sample/basta_van-teaser.png", name: "Ludvig"};
