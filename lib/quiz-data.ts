/**
 * Static quiz data — ported from reference/SoMeCard_Quizprototyp.html.
 * The cards themselves are rendered by the image path (lib/image-gen.ts); this file only
 * carries the questions, the options and the repaired relation → template mapping.
 */

/** The seven relations, keyed the way the prototype keys them. */
export const RELATIONS = [
  {key: 'mamma', label: 'Mamma', emoji: '💜'},
  {key: 'pappa', label: 'Pappa', emoji: '💙'},
  {key: 'partner', label: 'Partner', emoji: '❤️'},
  {key: 'syskon', label: 'Syskon', emoji: '💚'},
  {key: 'van', label: 'Bästa vän', emoji: '💛'},
  {key: 'kompis', label: 'Vän', emoji: '🩵'},
  {key: 'kollega', label: 'Kollega', emoji: '🩶'}
] as const;

/**
 * The repaired mapping. The prototype called the best-friend key `van` and the friend key
 * `kompis`; the templates do the opposite, so swap those two and pass everything else through.
 */
export const TEMPLATE_KEY: Record<string, string> = {
  van: 'basta_van',
  kompis: 'van',
  mamma: 'mamma',
  pappa: 'pappa',
  partner: 'partner',
  syskon: 'syskon',
  kollega: 'kollega'
};

/** What the person lights up on — becomes attack 1. */
export const FIRE = [
  {key: 'gym', label: 'Träning', emoji: '🏋️', name: 'Gymfrälsning'},
  {key: 'mat', label: 'Mat', emoji: '🌮', name: 'Tacofredag'},
  {key: 'jobb', label: 'Jobbet', emoji: '💼', name: 'Mejl kl 23.47'},
  {key: 'resa', label: 'Resor', emoji: '✈️', name: 'Sista minuten'},
  {key: 'sport', label: 'Sport på tv', emoji: '⚽', name: 'Domaren är blind'},
  {key: 'shop', label: 'Shopping', emoji: '🛍️', name: 'Ska bara titta'}
] as const;

/** The three quick comparison questions, kept exactly as designed. */
export const PAIRS = [
  {
    q: 'När ni ska ses, är {n}…',
    fill: 'Fyller i: Attack 2',
    options: [
      {label: 'Alltid sen', name: 'Kommer om fem', desc: 'Fem minuter betyder minst tjugo. Motståndaren får vänta en runda.'},
      {label: 'Alltid tidig', name: 'Tio minuter före', desc: 'Står redan utanför. Motståndaren känner sig sen resten av dagen.'}
    ]
  },
  {
    q: 'Vad är {g} kryptonit?',
    fill: 'Fyller i: Weakness',
    options: [{label: 'Sockersug', name: 'Sockersug'}, {label: 'Snooze-knappen', name: 'Snooze-knappen'}]
  },
  {
    q: 'Vad biter inte på {n}?',
    fill: 'Fyller i: Resistance',
    options: [{label: 'Måndagar', name: 'Måndagar'}, {label: 'Goda råd', name: 'Goda råd'}]
  }
] as const;

/** Signature power — becomes special power + strength. */
export const POWER = [
  {key: 'prat', label: 'Pratar med alla', emoji: '🗣️'},
  {key: 'fix', label: 'Fixar allt', emoji: '🛠️'},
  {key: 'minne', label: 'Minns allt', emoji: '🧠'},
  {key: 'somn', label: 'Somnar var som helst', emoji: '😴'}
] as const;

export const PRICE = 99;

/** The fixed sample used by /demo and /gift — the master-prompt Ludvig example. */
export const SAMPLE = {image: '/sample/basta_van.png', teaser: '/sample/basta_van-teaser.png', name: 'Ludvig'};
