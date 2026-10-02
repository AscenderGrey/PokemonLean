"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CARD_TEMPLATES, type RelationKey } from "@/lib/card-templates";
import { trackFunnelEvent } from "@/lib/analytics";
import { PRICES } from "@/lib/contracts";
import styles from "./template-landing.module.css";

const relations = Object.keys(CARD_TEMPLATES) as RelationKey[];
const price = (amount: number) => `${amount / 100} kr`;

export function TemplateLanding() {
  useEffect(() => { trackFunnelEvent("landing_view"); }, []);
  return <main className={styles.page}>
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="SoMeCard startsida">So<em>Me</em>Card</Link>
      <nav aria-label="Snabblänkar"><a href="#sa-funkar-det">Så funkar det</a><a href="#korttyper">Korttyper</a></nav>
      <Link className={styles.headerCta} href="/create?mode=gift">Skapa kort</Link>
    </header>
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroCopy}>
        <p className={styles.kicker}>ETT PERSONLIGT SAMLARKORT</p>
        <h1 id="hero-title">Gör någon du känner till ett kort de vill spara.</h1>
        <p className={styles.lede}>Välj relation, lägg till ett foto och berätta några saker som bara du vet. Vi formar det till ett personligt samlarkort.</p>
        <div className={styles.actions}><Link className={styles.primary} href="/create?mode=gift">Skapa ditt kort <span aria-hidden="true">→</span></Link><Link className={styles.secondary} href="/create?mode=self">Gör ett om mig själv</Link></div>
        <p className={styles.reassurance}>Börja gratis · Se en förhandsvisning · Betala bara om du gillar resultatet</p>
      </div>
      <figure className={styles.heroCard}>
        <div className={styles.foil}>EXEMPEL <span>✦</span></div>
        <img src="/demo/front/pappa.webp" alt="Exempel på ett färdigt personligt samlarkort för pappa" width="1744" height="2336" fetchPriority="high" />
        <figcaption>Så här kan ett färdigt kort se ut.</figcaption>
      </figure>
    </section>
    <section className={styles.section} id="korttyper" aria-labelledby="relations-title">
      <div className={styles.sectionHead}><p className={styles.kicker}>VÄLJ VEM KORTET ÄR TILL</p><h2 id="relations-title">Sju kortmallar. En person som är helt egen.</h2><p>Varje relation har sin egen riktiga kortmall. Du fyller den med er historia.</p></div>
      <ul className={styles.templateRail} aria-label="Kortmallar">{relations.map((key) => { const template = CARD_TEMPLATES[key]; return <li key={key}><Link href="/create?mode=gift" className={styles.templateLink}><img src={`/templates/preview/${key}.webp`} alt={`${template.label} kortmall`} width="1744" height="2336" loading="lazy" /><span>{template.label}</span></Link></li>; })}</ul>
    </section>
    <section className={`${styles.section} ${styles.how}`} id="sa-funkar-det" aria-labelledby="how-title">
      <div className={styles.sectionHead}><p className={styles.kicker}>FRÅN MINNE TILL KORT</p><h2 id="how-title">Tre enkla steg.</h2></div>
      <ol className={styles.steps}><li><span>01</span><h3>Välj relation</h3><p>Hitta mallen som passar personen du vill hylla.</p></li><li><span>02</span><h3>Gör den personlig</h3><p>Lägg till foto, namn och detaljer som känns som just dem.</p></li><li><span>03</span><h3>Se ditt kort</h3><p>Förhandsvisa gratis. Spara det först när du vill ha det.</p></li></ol>
    </section>
    <section className={`${styles.section} ${styles.offers}`} aria-labelledby="offers-title">
      <div className={styles.offerIntro}><p className={styles.kicker}>DU BESTÄMMER NÄR DET ÄR KLART</p><h2 id="offers-title">Förhandsvisningen kostar inget.</h2><p>Ta dig hela vägen till ett utkast först. Om kortet känns rätt väljer du det paket som passar.</p><p className={styles.paymentNote}>Säker betalning sker i kassan. Du väljer tillgängligt betalsätt i kassan.</p></div>
      <div className={styles.offerRow}><article className={styles.offer}><p className={styles.offerLabel}>ETT KORT</p><strong>{price(PRICES.single_card)}</strong><p>Ett personligt kort, gjort för en person.</p><Link href="/create?mode=gift" className={styles.offerCta}>Skapa ett kort</Link></article><article className={`${styles.offer} ${styles.familyOffer}`}><p className={styles.offerLabel}>FAMILJEPAKET</p><strong>{price(PRICES.family_pack_5)}</strong><p>Fem personliga kort för familjen eller gänget.</p><Link href="/create?mode=gift" className={styles.offerCta}>Börja med första kortet</Link></article></div>
    </section>
    <section className={`${styles.section} ${styles.faq}`} aria-labelledby="faq-title">
      <div className={styles.sectionHead}><p className={styles.kicker}>VANLIGA FRÅGOR</p><h2 id="faq-title">Inga konstigheter.</h2></div>
      <div className={styles.questions}><details><summary>Måste jag betala för att börja?</summary><p>Nej. Du kan skapa ett utkast och se förhandsvisningen innan du bestämmer dig.</p></details><details><summary>Behöver jag skriva mycket?</summary><p>Nej. Några detaljer om personen räcker för att komma igång. Du väljer själv hur personligt det ska bli.</p></details><details><summary>Vad händer med mitt foto?</summary><p>Fotot används för att skapa ditt kort. Läs mer om hur vi hanterar uppgifter i vår integritetspolicy.</p></details></div>
    </section>
    <section className={styles.finalCta} aria-labelledby="final-title"><p className={styles.kicker}>REDO NÄR DU ÄR</p><h2 id="final-title">Det bästa kortet börjar med någon du känner.</h2><Link className={styles.primary} href="/create?mode=gift">Skapa ditt kort <span aria-hidden="true">→</span></Link></section>
    <footer className={styles.footer}><Link className={styles.brand} href="/">So<em>Me</em>Card</Link><div><Link href="/privacy">Integritet</Link><Link href="/help">Hjälp</Link><Link href="/terms">Villkor</Link></div></footer>
  </main>;
}
